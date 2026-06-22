(() => {
  const states = new WeakMap();

  const getElements = (root) => {
    const popover = root.querySelector(':scope > [data-popover]');
    const input = root.querySelector(':scope > input[role="combobox"], :scope > .input-group input[role="combobox"], :scope > .combobox-chips input[role="combobox"]')
      || popover?.querySelector('input[role="combobox"]');
    const chips = root.querySelector(':scope > .combobox-chips');
    const popupTrigger = root.querySelector(':scope > button[aria-haspopup="listbox"]');
    const trigger = popupTrigger || root.querySelector(':scope > .input-group button[aria-haspopup="listbox"]');
    const clearButton = root.querySelector('[data-clear]');
    const valueTarget = popupTrigger?.querySelector('[data-value]') || (popupTrigger?.matches('[data-value]') ? popupTrigger : null);
    const listbox = popover ? popover.querySelector('[role="listbox"]') : null;
    const hiddenInput = root.querySelector(':scope > input[type="hidden"]');
    return { input, chips, trigger, clearButton, valueTarget, popover, listbox, hiddenInput };
  };

  const ensureMultipleInputSurface = (root, elements) => {
    if (elements.listbox?.getAttribute('aria-multiselectable') !== 'true' || elements.chips || !elements.input) return elements;
    if (elements.input.parentElement !== root) return elements;

    const chips = document.createElement('div');
    chips.className = 'combobox-chips';
    root.insertBefore(chips, elements.input);
    chips.appendChild(elements.input);

    return getElements(root);
  };

  const getValue = option => option.dataset.value ?? option.textContent.trim();
  const getLabel = option => option.dataset.label || option.textContent.trim();
  const getFormat = root => root.dataset.format === 'object' ? 'object' : 'value';
  const isDisabled = option => option.getAttribute('aria-disabled') === 'true';
  const toSelected = option => ({ value: getValue(option), label: getLabel(option) });
  const normalizeEntry = entry => {
    if (entry && typeof entry === 'object') {
      const value = entry.value == null ? '' : String(entry.value);
      return value ? { value, label: String(entry.label ?? entry.value) } : null;
    }
    const value = entry == null ? '' : String(entry);
    return value ? { value, label: value } : null;
  };

  const getOptions = (listbox) => {
    const allOptions = Array.from(listbox.querySelectorAll('[role="option"]'));
    return {
      allOptions,
      options: allOptions.filter(option => !isDisabled(option)),
    };
  };

  const getSelection = (state) => Array.from(state.selected.values());
  const getCanonicalValue = (state) => state.isMultiple ? getSelection(state).map(item => item.value) : (getSelection(state)[0]?.value || '');
  const getSelectedDetail = (state) => state.isMultiple ? getSelection(state) : (getSelection(state)[0] || null);

  const serializeSelection = (state) => {
    const selected = getSelection(state);
    if (state.format === 'object') {
      return JSON.stringify(state.isMultiple ? selected : (selected[0] || null));
    }
    const value = selected.map(item => item.value);
    return state.isMultiple ? JSON.stringify(value) : (value[0] || '');
  };

  const parseStoredSelection = (storedValue, inputValue, state) => {
    if (state.isMultiple) {
      let parsed = [];
      try {
        parsed = JSON.parse(storedValue || '[]');
      } catch (_) {
        parsed = [];
      }
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        const entry = normalizeEntry(state.format === 'object' ? item : { value: item, label: state.selected.get(String(item))?.label ?? item });
        if (!entry) return null;
        const option = state.options.find(opt => getValue(opt) === entry.value);
        return option ? toSelected(option) : entry;
      }).filter(Boolean);
    }

    if (state.format === 'object') {
      try {
        const entry = normalizeEntry(JSON.parse(storedValue || 'null'));
        if (!entry) return [];
        const option = state.options.find(opt => getValue(opt) === entry.value);
        return [option ? toSelected(option) : entry];
      } catch (_) {
        return [];
      }
    }

    const value = storedValue || '';
    if (!value) return [];
    const option = state.options.find(opt => getValue(opt) === value);
    return [option ? toSelected(option) : { value, label: state.selected.get(value)?.label || inputValue || value }];
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

  const filterOptions = (state, { preserveActive = false, search: forcedSearch } = {}) => {
    const previousActive = state.activeIndex > -1 ? state.options[state.activeIndex] : null;
    state.visibleOptions = [];

    if (state.manualFilter) {
      state.visibleOptions = state.options.filter(option => option.getAttribute('aria-hidden') !== 'true');

      if (preserveActive && previousActive && state.visibleOptions.includes(previousActive)) {
        setActiveOption(state, state.options.indexOf(previousActive));
      } else {
        setActiveOption(state, state.autoHighlight && state.visibleOptions.length > 0 ? state.options.indexOf(state.visibleOptions[0]) : -1);
      }
      syncEmptyState(state);
      return;
    }

    const search = (forcedSearch ?? state.input.value).trim().toLowerCase();

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

    getSelection(state).forEach(entry => {
      const chip = document.createElement('span');
      chip.className = 'combobox-chip';
      chip.dataset.value = entry.value;

      const label = document.createElement('span');
      label.textContent = entry.label;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'combobox-chip-remove btn';
      remove.dataset.variant = 'ghost';
      remove.dataset.size = 'icon-xs';
      remove.setAttribute('aria-label', `Remove ${entry.label}`);
      remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      remove.addEventListener('click', (event) => {
        event.stopPropagation();
        root.deselect(entry.value);
        state.input.focus();
      });

      chip.appendChild(label);
      chip.appendChild(remove);
      state.chips.insertBefore(chip, state.input);
    });
  };

  const syncTriggerValue = (state) => {
    if (!state.valueTarget) return;
    const selected = getSelection(state);
    state.valueTarget.textContent = state.isMultiple
      ? selected.map(entry => entry.label).join(', ')
      : (selected[0]?.label || state.valueTarget.dataset.placeholder || '');
  };

  const syncClearButton = (state) => {
    if (!state.clearButton) return;
    state.clearButton.hidden = getSelection(state).length === 0 && state.input.value === '';
  };

  const syncSelectedOptions = (state) => {
    state.options.forEach(option => {
      if (state.selected.has(getValue(option))) {
        option.setAttribute('aria-selected', 'true');
      } else {
        option.removeAttribute('aria-selected');
      }
    });
  };

  const setSelected = (root, entries, triggerEvent = true) => {
    const state = states.get(root);
    const normalized = (Array.isArray(entries) ? entries : [entries]).map(normalizeEntry).filter(Boolean);

    state.selected.clear();
    if (state.isMultiple) {
      normalized.forEach(entry => state.selected.set(entry.value, entry));
      state.input.value = '';
    } else if (normalized[0]) {
      state.selected.set(normalized[0].value, normalized[0]);
      state.input.value = state.valueTarget ? '' : normalized[0].label;
    } else {
      state.input.value = '';
    }

    state.hiddenInput.value = serializeSelection(state);
    syncSelectedOptions(state);
    if (state.isMultiple) {
      renderChips(root);
      filterOptions(state, { preserveActive: true });
    }
    syncTriggerValue(state);
    syncClearButton(state);

    if (triggerEvent) {
      root.dispatchEvent(new CustomEvent('change', {
        detail: { value: getCanonicalValue(state), selected: getSelectedDetail(state) },
        bubbles: true,
      }));
    }
  };

  const closePopover = (state, focusInput = false) => {
    if (state.popover.getAttribute('aria-hidden') === 'true') return;
    state.popover.setAttribute('aria-hidden', 'true');
    state.input.setAttribute('aria-expanded', 'false');
    state.trigger?.setAttribute('aria-expanded', 'false');
    setActiveOption(state, -1);
    if (focusInput) {
      state.skipOpenOnFocus = true;
      state.input.focus();
      requestAnimationFrame(() => { state.skipOpenOnFocus = false; });
    }
  };

  const openPopover = (state) => {
    const { root } = state;
    if (state.popover.getAttribute('aria-hidden') === 'false') return;
    document.dispatchEvent(new CustomEvent('basecoat:popover', { detail: { source: root } }));
    root.refresh();
    const selected = getSelection(state)[0];
    if (state.valueTarget) state.input.value = '';
    const search = !state.isMultiple && selected && state.input.value === selected.label ? '' : undefined;
    filterOptions(state, { search });
    state.popover.setAttribute('aria-hidden', 'false');
    state.input.setAttribute('aria-expanded', 'true');
    state.trigger?.setAttribute('aria-expanded', 'true');
    if (state.trigger) state.input.focus();
  };

  const refreshCombobox = (root) => {
    const state = states.get(root);
    if (!state) return;

    let elements = getElements(root);
    if (!elements.input || !elements.popover || !elements.listbox || !elements.hiddenInput) {
      const missing = [];
      if (!elements.input) missing.push('input');
      if (!elements.popover) missing.push('popover');
      if (!elements.listbox) missing.push('listbox');
      if (!elements.hiddenInput) missing.push('hidden input');
      console.error(`Combobox refresh failed. Missing element(s): ${missing.join(', ')}`, root);
      return;
    }

    elements = ensureMultipleInputSurface(root, elements);
    const previousValue = elements.hiddenInput.value;
    const previousInputValue = elements.input.value;
    Object.assign(state, elements, getOptions(elements.listbox));
    state.isMultiple = state.listbox.getAttribute('aria-multiselectable') === 'true';
    state.closeOnSelect = root.dataset.closeOnSelect === 'true';
    state.autoHighlight = root.dataset.autoHighlight === 'true';
    state.manualFilter = root.dataset.filter === 'manual';
    state.format = getFormat(root);

    const stored = parseStoredSelection(previousValue, previousInputValue, state);
    if (stored.length > 0) {
      setSelected(root, stored, false);
    } else {
      const selectedOptions = state.options.filter(option => option.getAttribute('aria-selected') === 'true').map(toSelected);
      if (selectedOptions.length > 0) {
        setSelected(root, state.isMultiple ? selectedOptions : selectedOptions[0], false);
      } else if (state.isMultiple) {
        setSelected(root, [], false);
      } else {
        state.input.value = previousInputValue;
        state.selected.clear();
        state.hiddenInput.value = '';
        syncSelectedOptions(state);
        filterOptions(state, { preserveActive: true });
      }
    }
    syncTriggerValue(state);
    syncClearButton(state);
  };

  const resolveEntry = (state, value) => {
    if (value && typeof value === 'object') {
      const entry = normalizeEntry(value);
      if (!entry) return null;
      const option = state.options.find(opt => getValue(opt) === entry.value);
      return option ? toSelected(option) : entry;
    }

    const option = state.options.find(opt => getValue(opt) === value);
    if (option) return toSelected(option);
    const existing = state.selected.get(String(value));
    return existing || null;
  };

  const selectValue = (root, value) => {
    const state = states.get(root);
    const entry = resolveEntry(state, value);
    if (!entry) return;

    if (state.isMultiple) {
      setSelected(root, [...getSelection(state).filter(item => item.value !== entry.value), entry]);
      if (state.closeOnSelect) root.close(true);
    } else {
      setSelected(root, entry);
      root.close(state.trigger ? false : true);
      state.trigger?.focus();
    }
  };

  const deselectValue = (root, value) => {
    const state = states.get(root);
    if (!state.isMultiple) return;
    const normalized = String(value);
    if (!state.selected.has(normalized)) return;
    setSelected(root, getSelection(state).filter(item => item.value !== normalized));
  };

  const clearValue = (root) => {
    const state = states.get(root);
    setSelected(root, [], true);
    state.input.value = '';
    filterOptions(state);
    syncClearButton(state);
    if (state.popover.getAttribute('aria-hidden') === 'false') state.input.focus();
  };

  const handleKeydown = (event, root) => {
    const state = states.get(root);
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End', 'Escape', 'Backspace'].includes(event.key)) return;

    const isOpen = state.popover.getAttribute('aria-hidden') === 'false';

    if (event.key === 'Backspace' && state.isMultiple && state.input.value === '') {
      const selected = getSelection(state);
      const last = selected[selected.length - 1];
      if (last) root.deselect(last.value);
      return;
    }

    if (event.key === 'Escape') {
      root.close(true);
      return;
    }

    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      openPopover(state);
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

    const state = { root, activeIndex: -1, allOptions: [], options: [], visibleOptions: [], selected: new Map(), format: 'value', manualFilter: false, skipOpenOnFocus: false };
    states.set(root, state);
    root.refresh = () => refreshCombobox(root);

    refreshCombobox(root);
    if (!state.input || !state.popover || !state.listbox || !state.hiddenInput) {
      states.delete(root);
      delete root.refresh;
      return;
    }

    root.close = (focusInput = false) => closePopover(state, focusInput);

    root.select = (value) => selectValue(root, value);
    root.selectByValue = root.select;
    root.setValue = (value) => {
      const entries = state.isMultiple ? (Array.isArray(value) ? value : (value == null ? [] : [value])) : [value];
      const resolved = entries.map(entry => resolveEntry(state, entry) || normalizeEntry(entry)).filter(Boolean);
      setSelected(root, state.isMultiple ? resolved : resolved[0]);
    };
    if (state.isMultiple) {
      root.deselect = (value) => deselectValue(root, value);
      root.toggle = (value) => {
        const entry = resolveEntry(state, value);
        if (!entry) return;
        state.selected.has(entry.value) ? root.deselect(entry.value) : root.select(entry);
      };
      root.selectAll = () => setSelected(root, state.options.map(toSelected));
      root.selectNone = () => setSelected(root, []);
    }

    const handleInputFocus = () => {
      if (state.skipOpenOnFocus) return;
      openPopover(state);
    };
    const handleInputClick = () => openPopover(state);
    const handleInput = () => {
      openPopover(state);
      filterOptions(state);
      if (!state.isMultiple) {
        state.hiddenInput.value = '';
        state.selected.clear();
        syncSelectedOptions(state);
        syncTriggerValue(state);
        syncClearButton(state);
      }
    };
    const handleTriggerClick = () => {
      if (state.popover.getAttribute('aria-hidden') === 'false') {
        root.close(false);
      } else {
        openPopover(state);
      }
    };
    const handleClearClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearValue(root);
    };
    const handleInputKeydown = (event) => handleKeydown(event, root);
    const handleListboxMousemove = (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && state.visibleOptions.includes(option)) setActiveOption(state, state.options.indexOf(option));
    };
    const handleListboxClick = (event) => {
      const option = event.target.closest('[role="option"]');
      if (!option || !state.options.includes(option)) return;
      state.isMultiple ? root.toggle(getValue(option)) : root.select(getValue(option));
      if (state.isMultiple && !state.closeOnSelect) state.input.focus();
    };
    const handleDocumentClick = (event) => {
      if (!root.contains(event.target)) root.close(false);
    };
    const handleDocumentPopover = (event) => {
      if (event.detail.source !== root) root.close(false);
    };

    state.input.addEventListener('focus', handleInputFocus);
    state.input.addEventListener('click', handleInputClick);
    state.input.addEventListener('input', handleInput);
    state.input.addEventListener('keydown', handleInputKeydown);
    state.trigger?.addEventListener('click', handleTriggerClick);
    state.clearButton?.addEventListener('click', handleClearClick);
    state.listbox.addEventListener('mousemove', handleListboxMousemove);
    state.listbox.addEventListener('click', handleListboxClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('basecoat:popover', handleDocumentPopover);

    root._destroy = () => {
      state.input.removeEventListener('focus', handleInputFocus);
      state.input.removeEventListener('click', handleInputClick);
      state.input.removeEventListener('input', handleInput);
      state.input.removeEventListener('keydown', handleInputKeydown);
      state.trigger?.removeEventListener('click', handleTriggerClick);
      state.clearButton?.removeEventListener('click', handleClearClick);
      state.listbox.removeEventListener('mousemove', handleListboxMousemove);
      state.listbox.removeEventListener('click', handleListboxClick);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('basecoat:popover', handleDocumentPopover);
      state.chips?.querySelectorAll('.combobox-chip').forEach(chip => chip.remove());
      states.delete(root);
      delete root.refresh;
      delete root.close;
      delete root.select;
      delete root.selectByValue;
      delete root.setValue;
      delete root.clear;
      delete root.deselect;
      delete root.toggle;
      delete root.selectAll;
      delete root.selectNone;
    };

    state.popover.setAttribute('aria-hidden', 'true');
    state.input.setAttribute('aria-expanded', 'false');
    state.trigger?.setAttribute('aria-expanded', 'false');
    root.clear = () => clearValue(root);

    Object.defineProperty(root, 'value', {
      configurable: true,
      get: () => getCanonicalValue(state),
      set: (value) => root.setValue(value),
    });

    Object.defineProperty(root, 'selected', {
      configurable: true,
      get: () => getSelectedDetail(state),
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
