(() => {
  const initDropdownMenu = (dropdownMenuComponent) => {
    const trigger = dropdownMenuComponent.querySelector(':scope > button');
    const popover = dropdownMenuComponent.querySelector(':scope > [data-popover]');
    const menu = popover.querySelector('[role="menu"]');
    
    if (!trigger || !menu || !popover) {
      console.error('Dropdown menu component is missing a trigger, a menu, or a popover content element.', dropdownMenuComponent);
      return;
    }

    let menuItems = [];
    let activeIndex = -1;

    const closeMenu = () => {
      if (trigger.getAttribute('aria-expanded') === 'false') return;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      popover.setAttribute('aria-hidden', 'true');
      trigger.focus();
      activeIndex = -1;
    };

    const openMenu = () => {
      trigger.setAttribute('aria-expanded', 'true');
      popover.setAttribute('aria-hidden', 'false');
      menuItems = Array.from(menu.querySelectorAll('[role^="menuitem"]:not([disabled])'));
      if (menuItems.length > 0) {
        setActiveItem(0);
      }
    };

    const setActiveItem = (index) => {
      if (activeIndex > -1 && menuItems[activeIndex]) {
        menuItems[activeIndex].classList.remove('active');
      }
      activeIndex = index;
      if (activeIndex > -1 && menuItems[activeIndex]) {
        const activeItem = menuItems[activeIndex];
        activeItem.classList.add('active');
        trigger.setAttribute('aria-activedescendant', activeItem.id);
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    };

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    dropdownMenuComponent.addEventListener('keydown', (e) => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      if (e.key === 'Escape') {
        if (isExpanded) closeMenu();
        return;
      }
      
      if (!isExpanded) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }

      if (menuItems.length === 0) return;

      let nextIndex = activeIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = activeIndex < menuItems.length - 1 ? activeIndex + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = activeIndex > 0 ? activeIndex - 1 : menuItems.length - 1;
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
          closeMenu();
          return;
      }

      if (nextIndex !== activeIndex) {
        setActiveItem(nextIndex);
      }
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('[role^="menuitem"]')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!dropdownMenuComponent.contains(e.target)) {
        closeMenu();
      }
    });

    dropdownMenuComponent.dataset.dropdownMenuInitialized = true;
  };

  document.querySelectorAll('.dropdown-menu:not([data-dropdown-menu-initialized])').forEach(initDropdownMenu);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('.dropdown-menu:not([data-dropdown-menu-initialized])')) {
          initDropdownMenu(node);
        }
        node.querySelectorAll('.dropdown-menu:not([data-dropdown-menu-initialized])').forEach(initDropdownMenu);
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();