(() => {
  const states = new WeakMap();
  let nextItemId = 0;

  const isDisabled = (item) =>
    item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true';

  const getElements = (root) => {
    const trigger = root.querySelector(':scope > button');
    const popover = root.querySelector(':scope > [data-popover]');
    const menu = popover ? popover.querySelector('[role="menu"]') : null;
    return { trigger, popover, menu };
  };

  const getItems = (menu) => Array.from(menu.querySelectorAll('[role^="menuitem"]')).filter(item => !isDisabled(item));

  const setActiveItem = (state, index) => {
    if (state.activeIndex > -1 && state.items[state.activeIndex]) {
      state.items[state.activeIndex].classList.remove('active');
    }
    state.activeIndex = index;
    if (state.activeIndex > -1 && state.items[state.activeIndex]) {
      const activeItem = state.items[state.activeIndex];
      activeItem.classList.add('active');
      if (!activeItem.id) {
        let id;
        do { id = `basecoat-menu-item-${++nextItemId}`; }
        while (document.getElementById(id));
        activeItem.id = id;
      }
      state.menu.setAttribute('aria-activedescendant', activeItem.id);
    } else {
      state.menu.removeAttribute('aria-activedescendant');
    }
  };

  const refreshDropdownMenu = (root) => {
    const state = states.get(root);
    if (!state) return;

    const elements = getElements(root);
    if (!elements.trigger || !elements.popover || !elements.menu) {
      const missing = [];
      if (!elements.trigger) missing.push('trigger');
      if (!elements.popover) missing.push('popover');
      if (!elements.menu) missing.push('menu');
      console.error(`Dropdown menu refresh failed. Missing element(s): ${missing.join(', ')}`, root);
      return;
    }

    Object.assign(state, elements);
    state.items = getItems(state.menu);
    if (state.activeIndex > -1 && !state.items[state.activeIndex]) setActiveItem(state, -1);
  };

  const closePopover = (state, focusOnTrigger = true) => {
    if (state.trigger.getAttribute('aria-expanded') === 'false') return;
    state.trigger.setAttribute('aria-expanded', 'false');
    state.search = '';
    state.popover.setAttribute('aria-hidden', 'true');
    if (focusOnTrigger) state.trigger.focus();
    setActiveItem(state, -1);
  };

  const openPopover = (root, state, initialSelection) => {
    document.dispatchEvent(new CustomEvent('basecoat:popover', { detail: { source: root } }));
    root.refresh();
    state.trigger.setAttribute('aria-expanded', 'true');
    state.popover.setAttribute('aria-hidden', 'false');
    const focusedOnOpen = document.activeElement;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (state.trigger.getAttribute('aria-expanded') === 'true' && document.activeElement === focusedOnOpen) {
        state.menu.focus({ preventScroll: true });
      }
    }));

    if (initialSelection && state.items.length > 0) {
      setActiveItem(state, initialSelection === 'last' ? state.items.length - 1 : 0);
    }
  };

  const initDropdownMenu = (root) => {
    if (root.dataset.dropdownMenuInitialized) return;

    const state = { activeIndex: -1, items: [] };
    states.set(root, state);
    root.refresh = () => refreshDropdownMenu(root);

    refreshDropdownMenu(root);
    if (!state.trigger || !state.popover || !state.menu) {
      states.delete(root);
      delete root.refresh;
      return;
    }

    if (!state.menu.hasAttribute('tabindex')) state.menu.setAttribute('tabindex', '-1');

    root.open = (initialSelection) => openPopover(root, state, initialSelection === 'last' ? 'last' : 'first');
    root.close = (focusOnTrigger = true) => closePopover(state, focusOnTrigger);
    root.toggle = () => state.trigger.getAttribute('aria-expanded') === 'true' ? root.close() : root.open();

    const handleTriggerClick = (event) => {
      if (state.trigger.getAttribute('aria-expanded') === 'true') root.close();
      else openPopover(root, state, event.detail === 0 ? 'first' : false);
    };

    const handleKeydown = (event) => {
      const isExpanded = state.trigger.getAttribute('aria-expanded') === 'true';

      if (event.key === 'Escape') {
        if (!isExpanded || event.defaultPrevented) return;
        const dialog = event.target.closest('dialog[open]');
        if (dialog && root.contains(dialog) && dialog.matches(':modal')) return;
        event.preventDefault();
        event.stopPropagation();
        root.close();
        return;
      }

      if (isExpanded && event.key === 'Tab') {
        state.trigger.focus({ preventScroll: true });
        root.close(false);
        return;
      }

      if (!isExpanded) {
        if (['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          root.open();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          root.open('first');
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          root.open('last');
        }
        return;
      }

      if (state.items.length === 0) return;

      if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
        event.preventDefault();
        const key = event.key.toLocaleLowerCase();
        const now = Date.now();
        state.search = now - (state.searchAt || 0) > 700 ? key : (state.search || '') + key;
        state.searchAt = now;
        const repeated = [...state.search].every(char => char === key);
        const query = repeated ? key : state.search;
        const start = repeated ? state.activeIndex + 1 : Math.max(state.activeIndex, 0);
        for (let offset = 0; offset < state.items.length; offset++) {
          const index = (start + offset) % state.items.length;
          const item = state.items[index];
          if ((item.getAttribute('aria-label') || item.textContent.trim()).toLocaleLowerCase().startsWith(query)) {
            setActiveItem(state, index);
            const itemRect = item.getBoundingClientRect();
            const popoverRect = state.popover.getBoundingClientRect();
            if (itemRect.top < popoverRect.top) state.popover.scrollTop -= popoverRect.top - itemRect.top;
            else if (itemRect.bottom > popoverRect.bottom) state.popover.scrollTop += itemRect.bottom - popoverRect.bottom;
            break;
          }
        }
        return;
      }

      let nextIndex = state.activeIndex;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextIndex = state.activeIndex === -1 ? 0 : Math.min(state.activeIndex + 1, state.items.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        nextIndex = state.activeIndex === -1 ? state.items.length - 1 : Math.max(state.activeIndex - 1, 0);
      } else if (event.key === 'Home') {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        nextIndex = state.items.length - 1;
      } else if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        state.items[state.activeIndex]?.click();
        root.close();
        return;
      } else {
        return;
      }

      if (nextIndex !== state.activeIndex) setActiveItem(state, nextIndex);
    };

    const handleMenuMousemove = (event) => {
      const menuItem = event.target.closest('[role^="menuitem"]');
      if (menuItem && !isDisabled(menuItem) && state.items.includes(menuItem)) {
        const index = state.items.indexOf(menuItem);
        if (index !== state.activeIndex) setActiveItem(state, index);
      }
    };

    const handleMenuMouseleave = () => setActiveItem(state, -1);
    const handleMenuClick = (event) => {
      const menuItem = event.target.closest('[role^="menuitem"]');
      if (!menuItem || isDisabled(menuItem)) return;

      if (menuItem.getAttribute('role') === 'menuitemcheckbox') {
        menuItem.setAttribute('aria-checked', menuItem.getAttribute('aria-checked') !== 'true');
      } else if (menuItem.getAttribute('role') === 'menuitemradio') {
        const group = menuItem.closest('[role="group"], [role="menu"]');
        group?.querySelectorAll('[role="menuitemradio"]').forEach((item) => {
          if (!isDisabled(item)) item.setAttribute('aria-checked', item === menuItem ? 'true' : 'false');
        });
      }

      root.close();
    };

    const handleDocumentClick = (event) => {
      if (!root.contains(event.target)) root.close(false);
    };

    const handleDocumentPopover = (event) => {
      if (!root.contains(event.detail.source)) root.close(false);
    };

    state.trigger.addEventListener('click', handleTriggerClick);
    root.addEventListener('keydown', handleKeydown);
    state.menu.addEventListener('mousemove', handleMenuMousemove);
    state.menu.addEventListener('mouseleave', handleMenuMouseleave);
    state.menu.addEventListener('click', handleMenuClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('basecoat:popover', handleDocumentPopover);

    root._destroy = () => {
      state.trigger.removeEventListener('click', handleTriggerClick);
      root.removeEventListener('keydown', handleKeydown);
      state.menu.removeEventListener('mousemove', handleMenuMousemove);
      state.menu.removeEventListener('mouseleave', handleMenuMouseleave);
      state.menu.removeEventListener('click', handleMenuClick);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('basecoat:popover', handleDocumentPopover);
      states.delete(root);
      delete root.refresh;
      delete root.open;
      delete root.close;
      delete root.toggle;
    };

    state.trigger.setAttribute('aria-expanded', 'false');
    state.popover.setAttribute('aria-hidden', 'true');
    root.dataset.dropdownMenuInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('dropdown-menu', {
      selector: '.dropdown-menu:not([data-dropdown-menu-initialized])',
      init: initDropdownMenu,
      refresh: refreshDropdownMenu,
    });
  }
})();
