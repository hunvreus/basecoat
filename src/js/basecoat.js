(() => {
  const componentRegistry = {};
  let observer = null;
  // Mutation deferral: observer records are queued here and processed against the
  // live DOM, immediately when no lease is held, or when the last lease is released.
  let activeLeases = 0;
  let processing = false;
  const queuedAdded = new Set();
  const queuedRemoved = new Set();

  const registerComponent = (name, selectorOrOptions, initFunction) => {
    const options = typeof selectorOrOptions === 'object'
      ? selectorOrOptions
      : { selector: selectorOrOptions, init: initFunction };

    componentRegistry[name] = {
      selector: options.selector,
      init: options.init,
      refresh: options.refresh,
    };
  };

  const initComponent = (element, componentName) => {
    const component = componentRegistry[componentName];
    if (!component) return;

    try {
      component.init(element);
      if (element.hasAttribute(`data-${componentName}-initialized`)) {
        element.dataset.basecoatComponent = componentName;
      }
    } catch (error) {
      console.error(`Failed to initialize ${componentName}:`, error);
      if (typeof element._destroy === 'function') {
        try {
          element._destroy();
        } catch (destroyError) {
          console.error(`Failed to clean up ${componentName} after initialization error:`, destroyError);
        }
      }
      delete element._destroy;
      element.removeAttribute(`data-${componentName}-initialized`);
      delete element.dataset.basecoatComponent;
    }
  };

  const destroyComponent = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    const componentName = element.dataset?.basecoatComponent;

    if (typeof element._destroy === 'function') {
      try {
        element._destroy();
      } catch (error) {
        console.error('Failed to destroy Basecoat component:', error);
      }
    }

    delete element._destroy;
    if (componentName) element.removeAttribute(`data-${componentName}-initialized`);
    delete element.dataset.basecoatComponent;
  };

  const uniqueElements = (elements) => Array.from(new Set(elements));

  const getComponentElements = (componentName, selector, force = false) => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (force) {
      elements.push(...document.querySelectorAll(`[data-basecoat-component="${componentName}"]`));
    }
    return uniqueElements(elements);
  };

  const initAllComponents = (options = {}) => {
    const force = options.force === true;
    Object.entries(componentRegistry).forEach(([name, { selector }]) => {
      getComponentElements(name, selector, force).forEach((element) => {
        const wasComponent = element.dataset?.basecoatComponent === name;
        if (force) destroyComponent(element);
        if (wasComponent || element.matches(selector)) initComponent(element, name);
      });
    });
  };

  // `seen` holds the elements already initialized in this batch, per component, so
  // overlapping added subtrees initialize each element once.
  const initNewComponents = (node, seen) => {
    Object.entries(componentRegistry).forEach(([name, { selector }]) => {
      if (!seen.has(name)) seen.set(name, new Set());
      const done = seen.get(name);
      const elements = node.matches(selector) ? [node] : [];
      elements.push(...node.querySelectorAll(selector));
      elements.forEach((element) => {
        if (done.has(element)) return;
        done.add(element);
        initComponent(element, name);
      });
    });
  };

  // Capture removed component roots when the record is seen: a removed subtree can
  // change before the queue is processed, but its initialized instances still need cleanup.
  const queueMutations = (mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) queuedAdded.add(node);
      });
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE || node.isConnected) return;
        if (node.dataset?.basecoatComponent) queuedRemoved.add(node);
        node.querySelectorAll('[data-basecoat-component]').forEach(element => queuedRemoved.add(element));
      });
    });
  };

  // Reconcile queued work with the current DOM: destroy instances that are still
  // detached, then initialize added nodes that are still connected. Stops, leaving the
  // rest queued, if a lifecycle callback acquires a deferral lease.
  const processQueue = ({ initAdded = true } = {}) => {
    if (processing) return;
    processing = true;

    try {
      for (const element of queuedRemoved) {
        if (activeLeases > 0) return;
        queuedRemoved.delete(element);
        if (!element.isConnected) destroyComponent(element);
      }

      if (!initAdded) {
        queuedAdded.clear();
        return;
      }

      const seen = new Map();
      for (const node of queuedAdded) {
        if (activeLeases > 0) return;
        queuedAdded.delete(node);
        if (!node.isConnected) continue;
        try {
          initNewComponents(node, seen);
        } catch (error) {
          console.error('Failed to initialize Basecoat components:', error);
        }
      }
    } finally {
      processing = false;
    }
  };

  const flushDeferredMutations = () => {
    // A lease released by a lifecycle callback: the running batch continues.
    if (processing) return;
    if (observer) queueMutations(observer.takeRecords());
    // While stopped, clean up detached instances but do not initialize additions.
    processQueue({ initAdded: observer !== null });
  };

  const deferMutations = () => {
    let held = true;
    activeLeases++;

    return () => {
      if (!held) return;
      held = false;
      activeLeases--;
      if (activeLeases === 0) flushDeferredMutations();
    };
  };

  const refreshComponent = (element) => {
    if (!element) return;
    if (typeof element.refresh === 'function') {
      element.refresh();
      return;
    }

    const componentName = element.dataset?.basecoatComponent;
    const component = componentName ? componentRegistry[componentName] : null;
    if (component?.refresh) {
      component.refresh(element);
    }
  };

  const startObserver = () => {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      queueMutations(mutations);
      if (activeLeases === 0) processQueue();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const stopObserver = () => {
    if (!observer) return;
    // Keep records captured during deferral so the final release can clean them up.
    if (activeLeases > 0) queueMutations(observer.takeRecords());
    observer.disconnect();
    observer = null;
  };

  const initRegisteredComponent = (componentName, options = {}) => {
    const component = componentRegistry[componentName];
    if (!component) {
      console.warn(`Component '${componentName}' not found in registry`);
      return;
    }

    const force = options.force === true;
    getComponentElements(componentName, component.selector, force).forEach((element) => {
      const wasComponent = element.dataset?.basecoatComponent === componentName;
      if (force) destroyComponent(element);
      if (wasComponent || element.matches(component.selector)) initComponent(element, componentName);
    });
  };

  const initAllRegisteredComponents = (options = {}) => {
    initAllComponents(options);
  };

  const setTheme = (mode) => {
    const dark = mode === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('themeMode', dark ? 'dark' : 'light'); } catch (_) {}
    document.dispatchEvent(new CustomEvent('basecoat:themechange', { detail: { mode: dark ? 'dark' : 'light' } }));
  };

  const getTheme = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  window.basecoat = {
    register: registerComponent,
    init: initRegisteredComponent,
    initAll: initAllRegisteredComponents,
    refresh: refreshComponent,
    start: startObserver,
    stop: stopObserver,
    deferMutations,
    theme: {
      get: getTheme,
      set: setTheme,
      toggle: () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'),
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAllComponents();
    startObserver();
  });
})();
