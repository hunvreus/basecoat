(() => {
  const componentRegistry = {};
  let observer = null;
  const NODE_TYPES = {
    ELEMENT: 1,
    DOCUMENT: 9,
    DOCUMENT_FRAGMENT: 11
  };

  const getScopedElements = (container, selector) => {
    const elements = [];

    if (
      container.nodeType === NODE_TYPES.ELEMENT &&
      typeof container.matches === 'function' &&
      container.matches(selector)
    ) {
      elements.push(container);
    }

    elements.push(...container.querySelectorAll(selector));
    return elements;
  };

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

  const initInScope = (container, options = {}) => {
    if (
      !container ||
      typeof container !== 'object' ||
      ![
        NODE_TYPES.ELEMENT,
        NODE_TYPES.DOCUMENT,
        NODE_TYPES.DOCUMENT_FRAGMENT
      ].includes(container.nodeType)
    ) {
      console.warn('Invalid container passed to basecoat.initIn()', container);
      return;
    }

    const { component: componentName, force = false } = options;
    const componentNames = componentName ? [componentName] : Object.keys(componentRegistry);

    if (componentName && !componentRegistry[componentName]) {
      console.warn(`Component '${componentName}' not found in registry`);
      return;
    }

    if (force) {
      componentNames.forEach((name) => {
        const flag = `data-${name}-initialized`;
        getScopedElements(container, `[${flag}]`).forEach((element) => {
          element.removeAttribute(flag);
        });
      });
    }

    componentNames.forEach((name) => {
      const component = componentRegistry[name];
      getScopedElements(container, component.selector).forEach((element) => {
        initComponent(element, name);
      });
    });
  };

  window.basecoat = {
    register: registerComponent,
    init: reinitComponent,
    initAll: reinitAll,
    initIn: initInScope,
    start: startObserver,
    stop: stopObserver
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAllComponents();
    startObserver();
  });
})(); 