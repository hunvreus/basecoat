(() => {
  const initCommand = (container) => {
    const input = container.querySelector('header input');
    const menu = container.querySelector('[role="menu"]');

    if (!input || !menu) {
      const missing = [];
      if (!input) missing.push('input');
      if (!menu) missing.push('menu');
      console.error(`Command component initialization failed. Missing element(s): ${missing.join(', ')}`, container);
      return;
    }

    const allMenuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    const menuItems = allMenuItems.filter(item => 
      !item.hasAttribute('disabled') && 
      item.getAttribute('aria-disabled') !== 'true'
    );
    let visibleMenuItems = [...menuItems];
    let activeIndex = -1;

    const setActiveItem = (index) => {
      if (activeIndex > -1 && menuItems[activeIndex]) {
        menuItems[activeIndex].classList.remove('active');
      }

      activeIndex = index;

      if (activeIndex > -1) {
        const activeItem = menuItems[activeIndex];
        activeItem.classList.add('active');
        if (activeItem.id) {
          input.setAttribute('aria-activedescendant', activeItem.id);
        } else {
          input.removeAttribute('aria-activedescendant');
        }
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    };

    const filterMenuItems = () => {
      const searchTerm = input.value.trim().toLowerCase();

      setActiveItem(-1);

      visibleMenuItems = [];
      allMenuItems.forEach(item => {
        if (item.hasAttribute('data-force')) {
          item.setAttribute('aria-hidden', 'false');
          if (menuItems.includes(item)) {
            visibleMenuItems.push(item);
          }
          return;
        }

        const itemText = (item.dataset.filter || item.textContent).trim().toLowerCase();
        const keywordList = (item.dataset.keywords || '')
          .toLowerCase()
          .split(/[\s,]+/)
          .filter(Boolean);
        const matchesKeyword = keywordList.some(keyword => keyword.includes(searchTerm));
        const matches = itemText.includes(searchTerm) || matchesKeyword;
        item.setAttribute('aria-hidden', String(!matches));
        if (matches && menuItems.includes(item)) {
          visibleMenuItems.push(item);
        }
      });

      if (visibleMenuItems.length > 0) {
        setActiveItem(menuItems.indexOf(visibleMenuItems[0]));
        visibleMenuItems[0].scrollIntoView({ block: 'nearest' });
      }
    };

    input.addEventListener('input', filterMenuItems);

    const handleKeyNavigation = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (activeIndex > -1) {
          menuItems[activeIndex]?.click();
        }
        return;
      }

      if (visibleMenuItems.length === 0) return;

      event.preventDefault();

      const currentVisibleIndex = activeIndex > -1 ? visibleMenuItems.indexOf(menuItems[activeIndex]) : -1;
      let nextVisibleIndex = currentVisibleIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (currentVisibleIndex < visibleMenuItems.length - 1) {
            nextVisibleIndex = currentVisibleIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (currentVisibleIndex > 0) {
            nextVisibleIndex = currentVisibleIndex - 1;
          } else if (currentVisibleIndex === -1) {
            nextVisibleIndex = 0;
          }
          break;
        case 'Home':
          nextVisibleIndex = 0;
          break;
        case 'End':
          nextVisibleIndex = visibleMenuItems.length - 1;
          break;
      }

      if (nextVisibleIndex !== currentVisibleIndex) {
        const newActiveItem = visibleMenuItems[nextVisibleIndex];
        setActiveItem(menuItems.indexOf(newActiveItem));
        newActiveItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    menu.addEventListener('mousemove', (event) => {
      const menuItem = event.target.closest('[role="menuitem"]');
      if (menuItem && visibleMenuItems.includes(menuItem)) {
        const index = menuItems.indexOf(menuItem);
        if (index !== activeIndex) {
          setActiveItem(index);
        }
      }
    });

    menu.addEventListener('click', (event) => {
      const clickedItem = event.target.closest('[role="menuitem"]');
      if (clickedItem && visibleMenuItems.includes(clickedItem)) {
        const dialog = container.closest('dialog.command-dialog');
        if (dialog && !clickedItem.hasAttribute('data-keep-command-open')) {
          dialog.close();
        }
      }
    });

    input.addEventListener('keydown', handleKeyNavigation);

    if (visibleMenuItems.length > 0) {
      setActiveItem(menuItems.indexOf(visibleMenuItems[0]));
      visibleMenuItems[0].scrollIntoView({ block: 'nearest' });
    }

    container.dataset.commandInitialized = true;
    container.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('command', '.command:not([data-command-initialized])', initCommand);
  }
})();
