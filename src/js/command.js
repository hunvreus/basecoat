(() => {
  const states = new WeakMap();

  const isDisabled = (item) =>
    item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true';

  const getElements = (container) => ({
    input: container.querySelector('header input'),
    menu: container.querySelector('[role="menu"]'),
  });

  const getItems = (menu) => {
    const allItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    return {
      allItems,
      items: allItems.filter(item => !isDisabled(item)),
    };
  };

  const scrollItemIntoMenu = (state, item) => {
    const itemRect = item.getBoundingClientRect();
    const menuRect = state.menu.getBoundingClientRect();

    if (itemRect.top < menuRect.top) {
      state.menu.scrollTop -= menuRect.top - itemRect.top;
    } else if (itemRect.bottom > menuRect.bottom) {
      state.menu.scrollTop += itemRect.bottom - menuRect.bottom;
    }
  };

  const setActiveItem = (state, index) => {
    if (state.activeIndex > -1 && state.items[state.activeIndex]) {
      state.items[state.activeIndex].classList.remove('active');
    }

    state.activeIndex = index;

    if (state.activeIndex > -1) {
      const activeItem = state.items[state.activeIndex];
      activeItem.classList.add('active');
      if (activeItem.id) {
        state.input.setAttribute('aria-activedescendant', activeItem.id);
      } else {
        state.input.removeAttribute('aria-activedescendant');
      }
    } else {
      state.input.removeAttribute('aria-activedescendant');
    }
  };

  const filterItems = (state) => {
    const searchTerm = state.input.value.trim().toLowerCase();

    setActiveItem(state, -1);
    state.visibleItems = [];

    state.allItems.forEach(item => {
      if (item.hasAttribute('data-force')) {
        item.setAttribute('aria-hidden', 'false');
        if (state.items.includes(item)) state.visibleItems.push(item);
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
      if (matches && state.items.includes(item)) state.visibleItems.push(item);
    });

    if (state.visibleItems.length > 0) {
      setActiveItem(state, state.items.indexOf(state.visibleItems[0]));
      scrollItemIntoMenu(state, state.visibleItems[0]);
    }
  };

  const refreshCommand = (container) => {
    const state = states.get(container);
    if (!state) return;

    const elements = getElements(container);
    if (!elements.input || !elements.menu) {
      const missing = [];
      if (!elements.input) missing.push('input');
      if (!elements.menu) missing.push('menu');
      console.error(`Command component refresh failed. Missing element(s): ${missing.join(', ')}`, container);
      return;
    }

    Object.assign(state, elements, getItems(elements.menu));
    filterItems(state);
  };

  const handleKeyNavigation = (event, state) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (state.activeIndex > -1) state.items[state.activeIndex]?.click();
      return;
    }

    if (state.visibleItems.length === 0) return;

    event.preventDefault();

    const currentVisibleIndex = state.activeIndex > -1 ? state.visibleItems.indexOf(state.items[state.activeIndex]) : -1;
    let nextVisibleIndex = currentVisibleIndex;

    if (event.key === 'ArrowDown' && currentVisibleIndex < state.visibleItems.length - 1) nextVisibleIndex = currentVisibleIndex + 1;
    if (event.key === 'ArrowUp') nextVisibleIndex = currentVisibleIndex > 0 ? currentVisibleIndex - 1 : 0;
    if (event.key === 'Home') nextVisibleIndex = 0;
    if (event.key === 'End') nextVisibleIndex = state.visibleItems.length - 1;

    if (nextVisibleIndex !== currentVisibleIndex) {
      const newActiveItem = state.visibleItems[nextVisibleIndex];
      setActiveItem(state, state.items.indexOf(newActiveItem));
      scrollItemIntoMenu(state, newActiveItem);
    }
  };

  const initCommand = (container) => {
    if (container.dataset.commandInitialized) return;

    const state = { activeIndex: -1, allItems: [], items: [], visibleItems: [] };
    states.set(container, state);

    container.refresh = () => refreshCommand(container);

    const elements = getElements(container);
    if (!elements.input || !elements.menu) {
      const missing = [];
      if (!elements.input) missing.push('input');
      if (!elements.menu) missing.push('menu');
      console.error(`Command component initialization failed. Missing element(s): ${missing.join(', ')}`, container);
      states.delete(container);
      return;
    }
    Object.assign(state, elements);

    state.input.addEventListener('input', () => filterItems(state));
    state.input.addEventListener('keydown', (event) => handleKeyNavigation(event, state));

    state.menu.addEventListener('mousemove', (event) => {
      const menuItem = event.target.closest('[role="menuitem"]');
      if (menuItem && state.visibleItems.includes(menuItem)) {
        const index = state.items.indexOf(menuItem);
        if (index !== state.activeIndex) setActiveItem(state, index);
      }
    });

    state.menu.addEventListener('click', (event) => {
      const clickedItem = event.target.closest('[role="menuitem"]');
      if (clickedItem && state.visibleItems.includes(clickedItem)) {
        const dialog = container.closest('dialog.command-dialog');
        if (dialog && !clickedItem.hasAttribute('data-keep-command-open')) dialog.close();
      }
    });

    refreshCommand(container);
    container.dataset.commandInitialized = 'true';
    container.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('command', {
      selector: '.command:not([data-command-initialized])',
      init: initCommand,
      refresh: refreshCommand,
    });
  }
})();
