(() => {
  const asyncRegistry = {};
  const searchControllers = {};

  const defaultAsyncConfig = {
    minLength: 1,
    debounce: 150,
    maxResults: 8,
    renderItem: null
  };

  // Use utilities from basecoat core
  const getUtils = () => window.basecoat?.utils || {};

  const defaultRenderItem = (item, id) => {
    const { escapeHtml, isValidUrl } = getUtils();
    const tag = item.url && isValidUrl?.(item.url) ? 'a' : 'div';
    const href = tag === 'a' ? ` href="${escapeHtml?.(item.url) || ''}"` : '';
    const keywords = item.keywords ? ` data-keywords="${escapeHtml?.(item.keywords) || ''}"` : '';
    const label = escapeHtml?.(item.label) || item.label || '';
    // Icon is expected to be trusted HTML from the onSearch callback (user-controlled)
    const icon = item.icon || '';
    return `<${tag} id="${id}" role="menuitem"${href}${keywords}>${icon}${label}</${tag}>`;
  };

  const setState = (container, state, message = '') => {
    container.dataset.state = state;
    const menu = container.querySelector('[role="menu"]');
    if (menu) {
      if (state === 'error' && message) {
        menu.dataset.error = message;
      } else {
        delete menu.dataset.error;
      }
    }
  };

  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

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

    // Check if this is an async command
    const isAsync = container.dataset.commandAsync === 'true';
    const commandId = container.id || container.dataset.commandId;
    const asyncConfig = isAsync && commandId ? asyncRegistry[commandId] : null;

    // For async mode, we need a registered config
    if (isAsync && !asyncConfig) {
      return;
    }

    let allMenuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    let menuItems = allMenuItems.filter(item =>
      !item.hasAttribute('disabled') &&
      item.getAttribute('aria-disabled') !== 'true'
    );
    let visibleMenuItems = [...menuItems];
    let activeIndex = -1;

    const setActiveItem = (index) => {
      // Clear previous active
      menu.querySelector('[role="menuitem"].active')?.classList.remove('active');

      activeIndex = index;

      if (activeIndex > -1 && visibleMenuItems[activeIndex]) {
        const activeItem = visibleMenuItems[activeIndex];
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

    const refreshMenuItems = () => {
      allMenuItems = Array.from(menu.querySelectorAll('[role="menuitem"]'));
      menuItems = allMenuItems.filter(item =>
        !item.hasAttribute('disabled') &&
        item.getAttribute('aria-disabled') !== 'true'
      );
      visibleMenuItems = [...menuItems];
    };

    // Sync filtering for static items
    const filterMenuItems = () => {
      const searchTerm = input.value.trim().toLowerCase();

      setActiveItem(-1);

      visibleMenuItems = [];
      allMenuItems.forEach(item => {
        const itemText = (item.dataset.label || item.textContent).trim().toLowerCase();
        const keywords = (item.dataset.keywords || '').toLowerCase();
        const matches = itemText.includes(searchTerm) || keywords.includes(searchTerm);
        item.setAttribute('aria-hidden', String(!matches));
        if (matches && menuItems.includes(item)) {
          visibleMenuItems.push(item);
        }
      });

      if (visibleMenuItems.length > 0) {
        setActiveItem(0);
        visibleMenuItems[0].scrollIntoView({ block: 'nearest' });
      }
    };

    // Async search for dynamic items
    const performAsyncSearch = async (query) => {
      const id = commandId;

      // Cancel previous search
      if (searchControllers[id]) {
        searchControllers[id].abort();
      }
      searchControllers[id] = new AbortController();

      if (query.length < asyncConfig.minLength) {
        menu.innerHTML = '';
        setState(container, 'idle');
        return;
      }

      setState(container, 'loading');

      try {
        const results = await asyncConfig.onSearch(query, searchControllers[id].signal);

        // Check if aborted
        if (searchControllers[id]?.signal.aborted) return;

        if (!results || results.length === 0) {
          menu.innerHTML = '';
          setState(container, 'empty');
        } else {
          const items = results.slice(0, asyncConfig.maxResults);
          const renderFn = asyncConfig.renderItem || defaultRenderItem;
          menu.innerHTML = items.map((item, i) => renderFn(item, `${id}-result-${i}`)).join('');
          setState(container, 'results');

          // Refresh menu items after rendering new results
          refreshMenuItems();

          // Set first item as active
          if (visibleMenuItems.length > 0) {
            setActiveItem(0);
            visibleMenuItems[0].scrollIntoView({ block: 'nearest' });
          }
        }

        container.dispatchEvent(new CustomEvent('command:search', {
          bubbles: true,
          detail: { query, results: results || [] }
        }));
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Command async search error:', error);
        menu.innerHTML = '';
        setState(container, 'error', error.message || 'Search failed');
      } finally {
        delete searchControllers[id];
      }
    };

    // Set up input handler based on mode
    if (isAsync && asyncConfig) {
      const debounceMs = parseInt(container.dataset.commandDebounce, 10) || asyncConfig.debounce;
      const debouncedSearch = debounce(performAsyncSearch, debounceMs);

      setState(container, 'idle');

      input.addEventListener('input', () => {
        const query = input.value.trim();
        debouncedSearch(query);
      });
    } else {
      // Sync filtering
      input.addEventListener('input', filterMenuItems);
    }

    const handleKeyNavigation = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (activeIndex > -1 && visibleMenuItems[activeIndex]) {
          visibleMenuItems[activeIndex].click();
        }
        return;
      }

      if (visibleMenuItems.length === 0) return;

      event.preventDefault();

      let nextIndex = activeIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (activeIndex < visibleMenuItems.length - 1) {
            nextIndex = activeIndex + 1;
          } else if (activeIndex === -1) {
            nextIndex = 0;
          }
          break;
        case 'ArrowUp':
          if (activeIndex > 0) {
            nextIndex = activeIndex - 1;
          } else if (activeIndex === -1) {
            nextIndex = visibleMenuItems.length - 1;
          }
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = visibleMenuItems.length - 1;
          break;
      }

      if (nextIndex !== activeIndex && nextIndex >= 0) {
        setActiveItem(nextIndex);
        visibleMenuItems[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    menu.addEventListener('mousemove', (event) => {
      const menuItem = event.target.closest('[role="menuitem"]');
      if (menuItem && visibleMenuItems.includes(menuItem)) {
        const index = visibleMenuItems.indexOf(menuItem);
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

    // Initial active item for sync mode
    if (!isAsync && visibleMenuItems.length > 0) {
      setActiveItem(0);
      visibleMenuItems[0].scrollIntoView({ block: 'nearest' });
    }

    container.dataset.commandInitialized = 'true';
    container.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  // Find command container by ID (supports both id and data-command-id)
  const findCommandById = (id) => {
    return document.getElementById(id) || document.querySelector(`[data-command-id="${id}"]`);
  };

  // Register async command configuration
  const registerAsync = (id, config) => {
    asyncRegistry[id] = { ...defaultAsyncConfig, ...config };

    // Initialize if element already exists and not yet initialized
    const container = findCommandById(id);
    if (container && container.dataset.commandAsync === 'true' && !container.dataset.commandInitialized) {
      initCommand(container);
    }
  };

  // Expose API
  if (window.basecoat) {
    window.basecoat.register('command', '.command:not([data-command-initialized])', initCommand);

    // Async API
    window.basecoat.commandAsync = {
      register: registerAsync,
      initAll: () => {
        document.querySelectorAll('.command[data-command-async="true"]:not([data-command-initialized])').forEach(container => {
          if (container.id && asyncRegistry[container.id]) {
            initCommand(container);
          }
        });
      }
    };
  }
})();
