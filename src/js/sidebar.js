(() => {
  const initSidebar = (sidebarComponent) => {
    if (sidebarComponent.dataset.sidebarInitialized && typeof sidebarComponent.toggle === 'function') return;

    const initialOpen = sidebarComponent.dataset.initialOpen !== 'false';
    const initialMobileOpen = sidebarComponent.dataset.initialMobileOpen === 'true';
    const breakpoint = parseInt(sidebarComponent.dataset.breakpoint) || 768;

    let open = breakpoint > 0
      ? (window.innerWidth >= breakpoint ? initialOpen : initialMobileOpen)
      : initialOpen;

    const updateState = () => {
      sidebarComponent.setAttribute('aria-hidden', String(!open));
      if (open) {
        sidebarComponent.removeAttribute('inert');
      } else {
        sidebarComponent.setAttribute('inert', '');
      }
    };

    const setState = (state) => {
      open = Boolean(state);
      updateState();
    };

    sidebarComponent.open = () => setState(true);
    sidebarComponent.close = () => setState(false);
    sidebarComponent.toggle = () => setState(!open);

    const handleClick = (event) => {
      const target = event.target;
      const nav = sidebarComponent.querySelector('nav');
      const isMobile = window.innerWidth < breakpoint;

      if (isMobile && target.closest('a, button') && !target.closest('[data-keep-mobile-sidebar-open]')) {
        if (document.activeElement) document.activeElement.blur();
        sidebarComponent.close();
        return;
      }

      if (target === sidebarComponent || (nav && !nav.contains(target))) {
        if (document.activeElement) document.activeElement.blur();
        sidebarComponent.close();
      }
    };

    sidebarComponent.addEventListener('click', handleClick);

    sidebarComponent._destroy = () => {
      sidebarComponent.removeEventListener('click', handleClick);
      delete sidebarComponent.open;
      delete sidebarComponent.close;
      delete sidebarComponent.toggle;
    };

    updateState();
    sidebarComponent.dataset.sidebarInitialized = 'true';
    sidebarComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('sidebar', '.sidebar', initSidebar);
  }
})();
