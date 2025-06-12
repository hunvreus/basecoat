(() => {
  const initDropdownMenu = (dropdownMenuComponent) => {
    const trigger = dropdownMenuComponent.querySelector('[popovertarget]');
    const popover = dropdownMenuComponent.querySelector('[popover]');
    const menu = popover?.querySelector('[role="menu"]');
    if (!trigger || !popover || !menu) return;

    let menuItems = [];
    let activeIndex = -1;

    const setActiveItem = (index) => {
      if (activeIndex > -1 && menuItems[activeIndex]) {
        menuItems[activeIndex].classList.remove('active');
      }
      activeIndex = index;
      if (activeIndex > -1 && menuItems[activeIndex]) {
        const activeItem = menuItems[activeIndex];
        activeItem.classList.add('active');
        trigger.setAttribute('aria-activedescendant', activeItem.id);
        activeItem.scrollIntoView({ block: 'nearest' });
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    };

    const handleKeyDown = (e) => {
      // If the menu isn't open, we only care about ArrowUp/Down/Enter/Space to open it.
      if (!popover.matches(':popover-open')) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          trigger.click();
        }
        return;
      }

      // If the menu IS open, we handle all navigation.
      let nextIndex = activeIndex;
      if (menuItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (activeIndex < menuItems.length - 1) {
            nextIndex = activeIndex + 1;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeIndex > 0) {
            nextIndex = activeIndex - 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = menuItems.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          menuItems[activeIndex]?.click();
          break;
      }

      if (nextIndex !== activeIndex) {
        setActiveItem(nextIndex);
      }
    };
    
    trigger.addEventListener('keydown', handleKeyDown);
    
    popover.addEventListener('toggle', (e) => {
      trigger.setAttribute('aria-expanded', e.newState === 'open');
      if (e.newState === 'open') {
        menuItems = Array.from(menu.querySelectorAll('[role^="menuitem"]:not([disabled])'));
        // Ensure all menu items have IDs for aria-activedescendant
        menuItems.forEach((item, index) => {
          if (!item.id) item.id = `${menu.id}-item-${index}`;
        });
        setActiveItem(0);
      } else {
        setActiveItem(-1);
      }
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('[role^="menuitem"]')) {
        popover.hidePopover();
      }
    });

    menu.addEventListener('mouseover', (e) => {
      const item = e.target.closest('[role^="menuitem"]:not([disabled])');
      if (item) {
        const index = menuItems.indexOf(item);
        if (index > -1 && index !== activeIndex) {
          setActiveItem(index);
        }
      }
    });

    dropdownMenuComponent.dataset.dropdownMenuInitialized = true;
  };

  document.querySelectorAll('.dropdown-menu:not([data-dropdown-menu-initialized])').forEach(initDropdownMenu);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('.dropdown-menu:not([data-dropdown-menu-initialized])')) {
            initDropdownMenu(node);
          }
          node.querySelectorAll('.dropdown-menu:not([data-dropdown-menu-initialized])').forEach(initDropdownMenu);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();