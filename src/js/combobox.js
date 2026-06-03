(() => {
  const initCombobox = (combobox) => {
    const input = combobox.querySelector(':scope > input[role="combobox"], :scope > .combobox-chips input[role="combobox"]');
    const chips = combobox.querySelector(':scope > .combobox-chips');
    const popover = combobox.querySelector(':scope > [data-popover]');
    const listbox = popover ? popover.querySelector('[role="listbox"]') : null;
    const hiddenInput = combobox.querySelector(':scope > input[type="hidden"]');

    if (!input || !popover || !listbox || !hiddenInput) {
      const missing = [];
      if (!input) missing.push('input');
      if (!popover) missing.push('popover');
      if (!listbox) missing.push('listbox');
      if (!hiddenInput) missing.push('hidden input');
      console.error(`Combobox initialisation failed. Missing element(s): ${missing.join(', ')}`, combobox);
      return;
    }

    const allOptions = Array.from(listbox.querySelectorAll('[role="option"]'));
    const options = allOptions.filter(option => option.getAttribute('aria-disabled') !== 'true');
    const isMultiple = listbox.getAttribute('aria-multiselectable') === 'true' || combobox.dataset.multiple === 'true';
    const closeOnSelect = combobox.dataset.closeOnSelect === 'true';
    const autoHighlight = combobox.dataset.autoHighlight === 'true';
    const selectedOptions = isMultiple ? new Set() : null;
    let visibleOptions = [...options];
    let activeIndex = -1;

    const getValue = option => option.dataset.value ?? option.textContent.trim();
    const getLabel = option => option.dataset.label || option.textContent.trim();

    const scrollOptionIntoListbox = (option) => {
      const optionRect = option.getBoundingClientRect();
      const listboxRect = listbox.getBoundingClientRect();

      if (optionRect.top < listboxRect.top) {
        listbox.scrollTop -= listboxRect.top - optionRect.top;
      } else if (optionRect.bottom > listboxRect.bottom) {
        listbox.scrollTop += optionRect.bottom - listboxRect.bottom;
      }
    };

    const setActiveOption = (index) => {
      if (activeIndex > -1 && options[activeIndex]) {
        options[activeIndex].classList.remove('active');
      }

      activeIndex = index;

      if (activeIndex > -1) {
        const activeOption = options[activeIndex];
        activeOption.classList.add('active');
        if (!activeOption.id) activeOption.id = `${listbox.id || combobox.id || 'combobox'}-option-${activeIndex}`;
        input.setAttribute('aria-activedescendant', activeOption.id);
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    };

    const syncEmptyState = () => {
      popover.dataset.empty = String(visibleOptions.length === 0);
    };

    const filterOptions = ({ preserveActive = false } = {}) => {
      const previousActive = activeIndex > -1 ? options[activeIndex] : null;
      const search = input.value.trim().toLowerCase();
      visibleOptions = [];

      allOptions.forEach(option => {
        if (option.hasAttribute('data-force')) {
          option.setAttribute('aria-hidden', 'false');
          if (options.includes(option)) visibleOptions.push(option);
          return;
        }

        const optionText = (option.dataset.filter || option.dataset.label || option.textContent).trim().toLowerCase();
        const keywords = (option.dataset.keywords || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
        const matches = !search || optionText.includes(search) || keywords.some(keyword => keyword.includes(search));
        option.setAttribute('aria-hidden', String(!matches));
        if (matches && options.includes(option)) visibleOptions.push(option);
      });

      if (preserveActive && previousActive && visibleOptions.includes(previousActive)) {
        setActiveOption(options.indexOf(previousActive));
      } else {
        setActiveOption(autoHighlight && visibleOptions.length > 0 ? options.indexOf(visibleOptions[0]) : -1);
      }
      syncEmptyState();
    };

    const openPopover = () => {
      if (popover.getAttribute('aria-hidden') === 'false') return;

      document.dispatchEvent(new CustomEvent('basecoat:popover', {
        detail: { source: combobox }
      }));

      filterOptions();
      popover.setAttribute('aria-hidden', 'false');
      input.setAttribute('aria-expanded', 'true');
    };

    const closePopover = (focusInput = false) => {
      if (popover.getAttribute('aria-hidden') === 'true') return;
      popover.setAttribute('aria-hidden', 'true');
      input.setAttribute('aria-expanded', 'false');
      setActiveOption(-1);
      if (focusInput) input.focus();
    };

    const renderChips = () => {
      if (!chips) return;
      chips.querySelectorAll('.combobox-chip').forEach(chip => chip.remove());
      const selected = options.filter(option => selectedOptions.has(option));

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
        remove.addEventListener('click', () => deselect(getValue(option)));

        chip.appendChild(remove);
        chips.insertBefore(chip, input);
      });
    };

    const updateValue = (optionOrOptions, triggerEvent = true) => {
      let value;

      if (isMultiple) {
        const selected = Array.isArray(optionOrOptions) ? optionOrOptions : [];
        selectedOptions.clear();
        selected.forEach(option => selectedOptions.add(option));
        options.forEach(option => {
          if (selectedOptions.has(option)) {
            option.setAttribute('aria-selected', 'true');
          } else {
            option.removeAttribute('aria-selected');
          }
        });
        value = options.filter(option => selectedOptions.has(option)).map(getValue);
        hiddenInput.value = JSON.stringify(value);
        input.value = '';
        renderChips();
        filterOptions({ preserveActive: true });
      } else {
        const option = optionOrOptions;
        if (!option) return;
        options.forEach(opt => {
          if (opt === option) {
            opt.setAttribute('aria-selected', 'true');
          } else {
            opt.removeAttribute('aria-selected');
          }
        });
        value = getValue(option);
        hiddenInput.value = value;
        input.value = getLabel(option);
      }

      if (triggerEvent) {
        combobox.dispatchEvent(new CustomEvent('change', {
          detail: { value },
          bubbles: true
        }));
      }
    };

    const select = (value) => {
      const option = options.find(opt => getValue(opt) === value);
      if (!option) return;

      if (isMultiple) {
        const selected = new Set(selectedOptions);
        selected.add(option);
        updateValue(options.filter(opt => selected.has(opt)));
        if (closeOnSelect) closePopover(true);
      } else {
        updateValue(option);
        closePopover(true);
      }
    };

    const deselect = (value) => {
      if (!isMultiple) return;
      const option = options.find(opt => getValue(opt) === value);
      if (!option || !selectedOptions.has(option)) return;
      const selected = new Set(selectedOptions);
      selected.delete(option);
      updateValue(options.filter(opt => selected.has(opt)));
    };

    const toggle = (value) => {
      if (!isMultiple) return;
      const option = options.find(opt => getValue(opt) === value);
      if (!option) return;
      selectedOptions.has(option) ? deselect(value) : select(value);
    };

    const handleKeydown = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End', 'Escape', 'Backspace'].includes(event.key)) return;

      const isOpen = popover.getAttribute('aria-hidden') === 'false';

      if (event.key === 'Backspace' && isMultiple && input.value === '') {
        const selected = options.filter(option => selectedOptions.has(option));
        const last = selected[selected.length - 1];
        if (last) deselect(getValue(last));
        return;
      }

      if (event.key === 'Escape') {
        closePopover(true);
        return;
      }

      if (!isOpen && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        openPopover();
      }

      if (popover.getAttribute('aria-hidden') === 'true') return;

      if (event.key === 'Enter') {
        if (activeIndex > -1) {
          event.preventDefault();
          const option = options[activeIndex];
          isMultiple ? toggle(getValue(option)) : select(getValue(option));
        }
        return;
      }

      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || visibleOptions.length === 0) return;
      event.preventDefault();

      const currentVisibleIndex = activeIndex > -1 ? visibleOptions.indexOf(options[activeIndex]) : -1;
      let nextVisibleIndex = currentVisibleIndex;

      if (event.key === 'ArrowDown') nextVisibleIndex = Math.min(currentVisibleIndex + 1, visibleOptions.length - 1);
      if (event.key === 'ArrowUp') nextVisibleIndex = currentVisibleIndex <= 0 ? 0 : currentVisibleIndex - 1;
      if (event.key === 'Home') nextVisibleIndex = 0;
      if (event.key === 'End') nextVisibleIndex = visibleOptions.length - 1;

      const nextOption = visibleOptions[nextVisibleIndex];
      setActiveOption(options.indexOf(nextOption));
      scrollOptionIntoListbox(nextOption);
    };

    input.addEventListener('focus', openPopover);
    input.addEventListener('click', openPopover);
    input.addEventListener('input', () => {
      openPopover();
      filterOptions();
      if (!isMultiple) {
        hiddenInput.value = '';
        options.forEach(option => option.removeAttribute('aria-selected'));
      }
    });
    input.addEventListener('keydown', handleKeydown);

    listbox.addEventListener('mousemove', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && visibleOptions.includes(option)) setActiveOption(options.indexOf(option));
    });

    listbox.addEventListener('click', (event) => {
      const option = event.target.closest('[role="option"]');
      if (!option || !options.includes(option)) return;
      isMultiple ? toggle(getValue(option)) : select(getValue(option));
      if (isMultiple && !closeOnSelect) input.focus();
    });

    document.addEventListener('click', (event) => {
      if (!combobox.contains(event.target)) closePopover(false);
    });

    document.addEventListener('basecoat:popover', (event) => {
      if (event.detail.source !== combobox) closePopover(false);
    });

    if (isMultiple) {
      let initialValues = [];
      try {
        initialValues = JSON.parse(hiddenInput.value || '[]');
      } catch (_) {
        initialValues = [];
      }
      if (!Array.isArray(initialValues)) initialValues = [];
      const ariaSelected = options.filter(option => option.getAttribute('aria-selected') === 'true').map(getValue);
      const values = initialValues.length ? initialValues : ariaSelected;
      updateValue(options.filter(option => values.includes(getValue(option))), false);
    } else {
      const initialOption = options.find(option => getValue(option) === hiddenInput.value || option.getAttribute('aria-selected') === 'true');
      if (initialOption) updateValue(initialOption, false);
    }

    popover.setAttribute('aria-hidden', 'true');
    input.setAttribute('aria-expanded', 'false');

    Object.defineProperty(combobox, 'value', {
      get: () => isMultiple ? options.filter(option => selectedOptions.has(option)).map(getValue) : hiddenInput.value,
      set: (value) => {
        if (isMultiple) {
          const values = Array.isArray(value) ? value : (value == null ? [] : [value]);
          updateValue(options.filter(option => values.includes(getValue(option))));
        } else {
          select(value);
        }
      }
    });

    combobox.select = select;
    combobox.selectByValue = select;
    if (isMultiple) {
      combobox.deselect = deselect;
      combobox.toggle = toggle;
      combobox.selectAll = () => updateValue(options);
      combobox.selectNone = () => updateValue([]);
    }

    combobox.dataset.comboboxInitialized = true;
    combobox.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('combobox', '.combobox:not([data-combobox-initialized])', initCombobox);
  }
})();
