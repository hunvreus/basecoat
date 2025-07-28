(() => {
  const componentRegistry = {};
  let observer = null;

  const registerComponent = (name, selector, initFunction) => {
    componentRegistry[name] = {
      selector,
      init: initFunction
    };
  };

  const initComponent = (element, componentName) => {
    const component = componentRegistry[componentName];
    if (!component) return;
    
    try {
      component.init(element);
    } catch (error) {
      console.error(`Failed to initialize ${componentName}:`, error);
    }
  };

  const initAllComponents = () => {
    Object.entries(componentRegistry).forEach(([name, { selector, init }]) => {
      document.querySelectorAll(selector).forEach(init);
    });
  };

  const initNewComponents = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    Object.entries(componentRegistry).forEach(([name, { selector, init }]) => {
      if (node.matches(selector)) {
        init(node);
      }
      node.querySelectorAll(selector).forEach(init);
    });
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
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const reinitComponent = (componentName) => {
    const component = componentRegistry[componentName];
    if (!component) {
      console.warn(`Component '${componentName}' not found in registry`);
      return;
    }
    
    // Clear initialization flag for this component
    const flag = `data-${componentName}-initialized`;
    document.querySelectorAll(`[${flag}]`).forEach(el => {
      el.removeAttribute(flag);
    });
    
    document.querySelectorAll(component.selector).forEach(component.init);
  };

  const reinitAll = () => {
    // Clear all initialization flags using the registry
    Object.entries(componentRegistry).forEach(([name, { selector }]) => {
      const flag = `data-${name}-initialized`;
      document.querySelectorAll(`[${flag}]`).forEach(el => {
        el.removeAttribute(flag);
      });
    });
    
    initAllComponents();
  };

  window.basecoat = {
    register: registerComponent,
    init: reinitComponent,
    initAll: reinitAll,
    start: startObserver,
    stop: stopObserver
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAllComponents();
    startObserver();
  });
})(); 