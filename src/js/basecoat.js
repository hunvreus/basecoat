(() => {
  const componentRegistry = {};
  let observer = null;

  const getInitFlag = (name) => `data-${name}-initialized`;

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
      element.dataset.basecoatComponent = componentName;
    } catch (error) {
      console.error(`Failed to initialize ${componentName}:`, error);
    }
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
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const stopObserver = () => {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  };

  const reinitComponent = (componentName) => {
    const component = componentRegistry[componentName];
    if (!component) {
      console.warn(`Component '${componentName}' not found in registry`);
      return;
    }

    const flag = getInitFlag(componentName);
    document.querySelectorAll(`[${flag}]`).forEach(element => {
      element.removeAttribute(flag);
      delete element.dataset.basecoatComponent;
    });

    document.querySelectorAll(component.selector).forEach(element => initComponent(element, componentName));
  };

  const reinitAll = () => {
    Object.entries(componentRegistry).forEach(([name]) => {
      const flag = getInitFlag(name);
      document.querySelectorAll(`[${flag}]`).forEach(element => {
        element.removeAttribute(flag);
        delete element.dataset.basecoatComponent;
      });
    });

    initAllComponents();
  };

  const setTheme = (mode) => {
    const dark = mode === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('themeMode', dark ? 'dark' : 'light'); } catch (_) {}
  };

  const getTheme = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  window.basecoat = {
    register: registerComponent,
    init: reinitComponent,
    initAll: reinitAll,
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
