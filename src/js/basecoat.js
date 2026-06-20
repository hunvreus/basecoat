(() => {
  const componentRegistry = {};
  let observer = null;

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

  const destroyRemovedComponents = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.isConnected) return;

    if (node.dataset?.basecoatComponent) destroyComponent(node);
    node.querySelectorAll('[data-basecoat-component]').forEach(destroyComponent);
  };

  const initAllComponents = () => {
    Object.entries(componentRegistry).forEach(([name, { selector }]) => {
      document.querySelectorAll(selector).forEach(element => initComponent(element, name));
    });
  };

  const initNewComponents = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    Object.entries(componentRegistry).forEach(([name, { selector }]) => {
      if (node.matches(selector)) initComponent(node, name);
      node.querySelectorAll(selector).forEach(element => initComponent(element, name));
    });
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
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(initNewComponents);
        mutation.removedNodes.forEach(destroyRemovedComponents);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const stopObserver = () => {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  };

  const initRegisteredComponent = (componentName) => {
    const component = componentRegistry[componentName];
    if (!component) {
      console.warn(`Component '${componentName}' not found in registry`);
      return;
    }

    document.querySelectorAll(component.selector).forEach(element => initComponent(element, componentName));
  };

  const initAllRegisteredComponents = () => {
    initAllComponents();
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
