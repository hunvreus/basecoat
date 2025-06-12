(() => {
  const initSidebar = (sidebarComponent) => {
    const initialOpen = sidebarComponent.dataset.initialOpen !== 'false';
    const initialMobileOpen = sidebarComponent.dataset.initialMobileOpen === 'true';
    const breakpoint = parseInt(sidebarComponent.dataset.breakpoint) || 768;
    
    let open = breakpoint > 0 
      ? (window.innerWidth >= breakpoint ? initialOpen : initialMobileOpen)
      : initialOpen;
    
    const updateState = () => {
      sidebarComponent.setAttribute('aria-hidden', !open);
      if (open) {
        sidebarComponent.removeAttribute('inert');
      } else {
        sidebarComponent.setAttribute('inert', '');
      }
    };

    const setState = (state) => {
      open = state;
      updateState();
    };

    const sidebarId = sidebarComponent.id;

    window.addEventListener('sidebar:open', (e) => {
      if (!e.detail?.id || e.detail.id === sidebarId) setState(true);
    });
    window.addEventListener('sidebar:close', (e) => {
      if (!e.detail?.id || e.detail.id === sidebarId) setState(false);
    });
    window.addEventListener('sidebar:toggle', (e) => {
      if (!e.detail?.id || e.detail.id === sidebarId) setState(!open);
    });
    
    sidebarComponent.addEventListener('click', (e) => {
      const nav = sidebarComponent.querySelector('nav');
      const closeTarget = e.target.closest('[data-sidebar-close-on-mobile]');
      
      if (closeTarget && window.innerWidth < breakpoint) {
        setState(false);
      } else if (e.target === sidebarComponent || (nav && !nav.contains(e.target))) {
        setState(false);
      }
    });

    updateState();
    sidebarComponent.dataset.sidebarInitialized = true;
  };

  document.querySelectorAll('.sidebar:not([data-sidebar-initialized])').forEach(initSidebar);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('.sidebar:not([data-sidebar-initialized])')) {
            initSidebar(node);
          }
          node.querySelectorAll('.sidebar:not([data-sidebar-initialized])').forEach(initSidebar);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();