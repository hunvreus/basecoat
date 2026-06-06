(() => {
  const states = new WeakMap();

  const getElements = (root) => {
    const input = root.querySelector(':scope > input[role="combobox"], :scope > .combobox-chips input[role="combobox"]');
    const chips = root.querySelector(':scope > .combobox-chips');
    const popover = root.querySelector(':scope > [data-popover]');
    const listbox = popover ? popover.querySelector('[role="listbox"]') : null;
    const hiddenInput = root.querySelector(':scope > input[type="hidden"]');
    return { input, chips, popover, listbox, hiddenInput };
  };

  const getValue = option => option.dataset.value ?? option.textContent.trim();
  const getLabel = option => option.dataset.label || option.textContent.trim();
  const isDisabled = option => option.getAttribute('aria-disabled') === 'true';

  const getOptions = (listbox) => {
    const allOptions = Array.from(listbox.querySelectorAll('[role="option"]'));
    return {
      allOptions,
      options: allOptions.filter(option => !isDisabled(option)),
    };
  };

  const scrollOptionIntoListbox = (state, option) => {
    const optionRect = option.getBoundingClientRect();
    const listboxRect = state.listbox.getBoundingClientRect();

    if (optionRect.top < listboxRect.top) {
      state.listbox.scrollTop -= listboxRect.top - optionRect.top;
    } else if (optionRect.bottom > listboxRect.bottom) {
      state.listbox.scrollTop += optionRect.bottom - listboxRect.bottom;
    }
  };

  const setActiveOption = (state, index) => {
    if (state.activeIndex > -1 && state.options[state.activeIndex]) {
      state.options[state.activeIndex].classList.remove('active');
    }

    state.activeIndex = index;

    if (state.activeIndex > -1) {
      const activeOption = state.options[state.activeIndex];
      activeOption.classList.add('active');
      if (!activeOption.id) activeOption.id = `${state.listbox.id || state.root.id || 'combobox'}-option-${state.activeIndex}`;
      state.input.setAttribute('aria-activedescendant', activeOption.id);
    } else {
      state.input.removeAttribute('aria-activedescendant');
    }
  };

  const syncEmptyState = (state) => {
    state.popover.dataset.empty = String(state.visibleOptions.length === 0);
  };

  const filterOptions = (state, { preserveActive = false } = {}) => {
    const previousActive = state.activeIndex > -1 ? state.options[state.activeIndex] : null;
    const search = state.input.value.trim().toLowerCase();
    state.visibleOptions = [];

    state.allOptions.forEach(option => {
      if (option.hasAttribute('data-force')) {
        option.setAttribute('aria-hidden', 'false');
        if (state.options.includes(option)) state.visibleOptions.push(option);
        return;
      }

      const optionText = (option.dataset.filter || option.dataset.label || option.textContent).trim().toLowerCase();
      const keywords = (option.dataset.keywords || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
      const matches = !search || optionText.includes(search) || keywords.some(keyword => keyword.includes(search));
      option.setAttribute('aria-hidden', String(!matches));
      if (matches && state.options.includes(option)) state.visibleOptions.push(option);
    });

    if (preserveActive && previousActive && state.visibleOptions.includes(previousActive)) {
      setActiveOption(state, state.options.indexOf(previousActive));
    } else {
      setActiveOption(state, state.autoHighlight && state.visibleOptions.length > 0 ? state.options.indexOf(state.visibleOptions[0]) : -1);
    }
    syncEmptyState(state);
  };

  const renderChips = (root) => {
    const state = states.get(root);
    if (!state.chips) return;

    state.chips.querySelectorAll('.combobox-chip').forEach(chip => chip.remove());
    const selected = state.options.filter(option => state.selectedOptions.has(option));

    selected.forEach(option => {
      const chip = document.createElement('span');
      chip.className = 'combobox-chip';
      chip.dataset.value = getValue(option);
      chip.textContent = getLabel(option);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'combobox-chip-remove';
      remove.setAttribute('aria-label', `Remove ${getLabel(option)}`);
      remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      remove.addEventListener('click', () => root.deselect(getValue(option)));

      chip.appendChild(remove);
      state.chips.insertBefore(chip, state.input);
    });
  };

  const updateValue = (root, optionOrOptions, triggerEvent = true) => {
    const state = states.get(root);
    let value;

    if (state.isMultiple) {
      const selected = Array.isArray(optionOrOptions) ? optionOrOptions : [];
      state.selectedOptions.clear();
      selected.forEach(option => state.selectedOptions.add(option));
      state.options.forEach(option => {
        if (state.selectedOptions.has(option)) {
          option.setAttribute('aria-selected', 'true');
        } else {
          option.removeAttribute('aria-selected');
        }
      });
      value = state.options.filter(option => state.selectedOptions.has(option)).map(getValue);
      state.hiddenInput.value = JSON.stringify(value);
      state.input.value = '';
      renderChips(root);
      filterOptions(state, { preserveActive: true });
    } else {
      const option = optionOrOptions;
      if (!option) return;
      state.options.forEach(opt => {
        if (opt === option) {
          opt.setAttribute('aria-selected', 'true');
        } else {
          opt.removeAttribute('aria-selected');
        }
      });
      value = getValue(option);
      state.hiddenInput.value = value;
      state.input.value = getLabel(option);
    }

    if (triggerEvent) {
      root.dispatchEvent(new CustomEvent('change', {
        detail: { value },
        bubbles: true,
      }));
    }
  };

  const closePopover = (state, focusInput = false) => {
    if (state.popover.getAttribute('aria-hidden') === 'true') return;
    state.popover.setAttribute('aria-hidden', 'true');
    state.input.setAttribute('aria-expanded', 'false');
    setActiveOption(state, -1);
    if (focusInput) state.input.focus();
  };

  const refreshCombobox = (root) => {
    const state = states.get(root);
    if (!state) return;

    const elements = getElements(root);
    if (!elements.input || !elements.popover || !elements.listbox || !elements.hiddenInput) {
      const missing = [];
      if (!elements.input) missing.push('input');
      if (!elements.popover) missing.push('popover');
      if (!elements.listbox) missing.push('listbox');
      if (!elements.hiddenInput) missing.push('hidden input');
      console.error(`Combobox refresh failed. Missing element(s): ${missing.join(', ')}`, root);
      return;
    }

    const previousValue = elements.hiddenInput.value;
    const previousInputValue = elements.input.value;
    Object.assign(state, elements, getOptions(elements.listbox));
    state.isMultiple = state.listbox.getAttribute('aria-multiselectable') === 'true' || root.dataset.multiple === 'true';
    state.closeOnSelect = root.dataset.closeOnSelect === 'true';
    state.autoHighlight = root.dataset.autoHighlight === 'true';
    if (state.isMultiple && !state.selectedOptions) state.selectedOptions = new Set();

    if (state.isMultiple) {
      let values = [];
      try {
        const parsed = JSON.parse(previousValue || '[]');
        values = Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        values = [];
      }
      const ariaSelected = state.options.filter(option => option.getAttribute('aria-selected') === 'true').map(getValue);
      const selectedValues = values.length ? values : ariaSelected;
      updateValue(root, state.options.filter(option => selectedValues.includes(getValue(option))), false);
    } else {
      const selected = state.options.find(option => getValue(option) === previousValue)
        || state.options.find(option => option.getAttribute('aria-selected') === 'true');
      if (selected) {
        updateValue(root, selected, false);
      } else {
        state.input.value = previousInputValue;
        state.options.forEach(option => option.removeAttribute('aria-selected'));
        filterOptions(state, { preserveActive: true });
      }
    }
  };

  const selectValue = (root, value) => {
    const state = states.get(root);
    const option = state.options.find(opt => getValue(opt) === value);
    if (!option) return;

    if (state.isMultiple) {
      const selected = new Set(state.selectedOptions);
      selected.add(option);
      updateValue(root, state.options.filter(opt => selected.has(opt)));
      if (state.closeOnSelect) root.close(true);
    } else {
      updateValue(root, option);
      root.close(true);
    }
  };

  const deselectValue = (root, value) => {
    const state = states.get(root);
    if (!state.isMultiple) return;
    const option = state.options.find(opt => getValue(opt) === value);
    if (!option || !state.selectedOptions.has(option)) return;
    const selected = new Set(state.selectedOptions);
    selected.delete(option);
    updateValue(root, state.options.filter(opt => selected.has(opt)));
  };

  const handleKeydown = (event, root) => {
    const state = states.get(root);
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End', 'Escape', 'Backspace'].includes(event.key)) return;

    const isOpen = state.popover.getAttribute('aria-hidden') === 'false';

    if (event.key === 'Backspace' && state.isMultiple && state.input.value === '') {
      const selected = state.options.filter(option => state.selectedOptions.has(option));
      const last = selected[selected.length - 1];
      if (last) root.deselect(getValue(last));
      return;
    }

    if (event.key === 'Escape') {
      root.close(true);
      return;
    }

    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      root.open();
    }

    if (state.popover.getAttribute('aria-hidden') === 'true') return;

    if (event.key === 'Enter') {
      if (state.activeIndex > -1) {
        event.preventDefault();
        const option = state.options[state.activeIndex];
        state.isMultiple ? root.toggle(getValue(option)) : root.select(getValue(option));
      }
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || state.visibleOptions.length === 0) return;
    event.preventDefault();

    const currentVisibleIndex = state.activeIndex > -1 ? state.visibleOptions.indexOf(state.options[state.activeIndex]) : -1;
    let nextVisibleIndex = currentVisibleIndex;

    if (event.key === 'ArrowDown') nextVisibleIndex = Math.min(currentVisibleIndex + 1, state.visibleOptions.length - 1);
    if (event.key === 'ArrowUp') nextVisibleIndex = currentVisibleIndex <= 0 ? 0 : currentVisibleIndex - 1;
    if (event.key === 'Home') nextVisibleIndex = 0;
    if (event.key === 'End') nextVisibleIndex = state.visibleOptions.length - 1;

    const nextOption = state.visibleOptions[nextVisibleIndex];
    setActiveOption(state, state.options.indexOf(nextOption));
    scrollOptionIntoListbox(state, nextOption);
  };

  const initCombobox = (root) => {
    if (root.dataset.comboboxInitialized) return;

    const state = { root, activeIndex: -1, allOptions: [], options: [], visibleOptions: [], selectedOptions: null };
    states.set(root, state);
    root.refresh = () => refreshCombobox(root);

    refreshCombobox(root);
    if (!state.input || !state.popover || !state.listbox || !state.hiddenInput) {
      states.delete(root);
      return;
    }

    root.open = () => {
      if (state.popover.getAttribute('aria-hidden') === 'false') return;
      document.dispatchEvent(new CustomEvent('basecoat:popover', { detail: { source: root } }));
      root.refresh();
      filterOptions(state);
      state.popover.setAttribute('aria-hidden', 'false');
      state.input.setAttribute('aria-expanded', 'true');
    };
    root.close = (focusInput = false) => closePopover(state, focusInput);

    root.select = (value) => selectValue(root, value);
    root.selectByValue = root.select;
    if (state.isMultiple) {
      root.deselect = (value) => deselectValue(root, value);
      root.toggle = (value) => {
        const option = state.options.find(opt => getValue(opt) === value);
        if (!option) return;
        state.selectedOptions.has(option) ? root.deselect(value) : root.select(value);
      };
      root.selectAll = () => updateValue(root, state.options);
      root.selectNone = () => updateValue(root, []);
    }

    state.input.addEventListener('focus', root.open);
    state.input.addEventListener('click', root.open);
    state.input.addEventListener('input', () => {
      root.open();
      filterOptions(state);
      if (!state.isMultiple) {
        state.hiddenInput.value = '';
        state.options.forEach(option => option.removeAttribute('aria-selected'));
      }
    });
    state.input.addEventListener('keydown', (event) => handleKeydown(event, root));

    state.listbox.addEventListener('mousemove', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && state.visibleOptions.includes(option)) setActiveOption(state, state.options.indexOf(option));
    });

    state.listbox.addEventListener('click', (event) => {
      const option = event.target.closest('[role="option"]');
      if (!option || !state.options.includes(option)) return;
      state.isMultiple ? root.toggle(getValue(option)) : root.select(getValue(option));
      if (state.isMultiple && !state.closeOnSelect) state.input.focus();
    });

    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) root.close(false);
    });

    document.addEventListener('basecoat:popover', (event) => {
      if (event.detail.source !== root) root.close(false);
    });

    state.popover.setAttribute('aria-hidden', 'true');
    state.input.setAttribute('aria-expanded', 'false');

    Object.defineProperty(root, 'value', {
      configurable: true,
      get: () => state.isMultiple ? state.options.filter(option => state.selectedOptions.has(option)).map(getValue) : state.hiddenInput.value,
      set: (value) => {
        if (state.isMultiple) {
          const values = Array.isArray(value) ? value : (value == null ? [] : [value]);
          updateValue(root, state.options.filter(option => values.includes(getValue(option))));
        } else {
          root.select(value);
        }
      },
    });

    root.dataset.comboboxInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('combobox', {
      selector: '.combobox:not([data-combobox-initialized])',
      init: initCombobox,
      refresh: refreshCombobox,
    });
  }
})();
