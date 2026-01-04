(() => {
  const initSelect = (selectComponent) => {
    const trigger = selectComponent.querySelector(':scope > button');
    const selectedLabel = trigger.querySelector(':scope > span');
    const popover = selectComponent.querySelector(':scope > [data-popover]');
    const listbox = popover ? popover.querySelector('[role="listbox"]') : null;
    const input = selectComponent.querySelector(':scope > input[type="hidden"]');
    const filter = selectComponent.querySelector('header input[type="text"]');

    if (!trigger || !popover || !listbox || !input) {
      const missing = [];
      if (!trigger) missing.push('trigger');
      if (!popover) missing.push('popover');
      if (!listbox) missing.push('listbox');
      if (!input) missing.push('input');
      console.error(`Select component initialisation failed. Missing element(s): ${missing.join(', ')}`, selectComponent);
      return;
    }

    const allOptions = Array.from(listbox.querySelectorAll('[role="option"]'));
    const options = allOptions.filter(opt => opt.getAttribute('aria-disabled') !== 'true');
    let visibleOptions = [...options];
    let activeIndex = -1;
    const isMultiple = listbox.getAttribute('aria-multiselectable') === 'true';
    let selectedValues = isMultiple ? new Set() : null;
    let placeholder = null;

    if (isMultiple) {
      placeholder = selectComponent.dataset.placeholder || '';
    }

    const setActiveOption = (index) => {
      if (activeIndex > -1 && options[activeIndex]) {
        options[activeIndex].classList.remove('active');
      }
      
      activeIndex = index;
      
      if (activeIndex > -1) {
        const activeOption = options[activeIndex];
        activeOption.classList.add('active');
        if (activeOption.id) {
          trigger.setAttribute('aria-activedescendant', activeOption.id);
        } else {
          trigger.removeAttribute('aria-activedescendant');
        }
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    };

    const hasTransition = () => {
      const style = getComputedStyle(popover);
      return parseFloat(style.transitionDuration) > 0 || parseFloat(style.transitionDelay) > 0;
    };

    const syncMultipleInputs = () => {
      if (!isMultiple) return;
      const values = Array.from(selectedValues);
      const inputs = Array.from(selectComponent.querySelectorAll(':scope > input[type="hidden"]'));
      inputs.slice(1).forEach(inp => inp.remove());

      if (values.length === 0) {
        input.value = '';
      } else {
        input.value = values[0];
        let insertAfter = input;
        for (let i = 1; i < values.length; i++) {
          const clone = input.cloneNode(true);
          clone.removeAttribute('id');
          clone.value = values[i];
          insertAfter.after(clone);
          insertAfter = clone;
        }
      }
    };

    const updateMultipleLabel = () => {
      if (!isMultiple) return;
      const selected = options.filter(opt => selectedValues.has(opt.dataset.value));
      if (selected.length === 0) {
        selectedLabel.textContent = placeholder;
        selectedLabel.classList.add('text-muted-foreground');
      } else {
        selectedLabel.textContent = selected.map(opt => opt.dataset.label || opt.textContent.trim()).join(', ');
        selectedLabel.classList.remove('text-muted-foreground');
      }
    };

    const updateValue = (optionOrOptions, triggerEvent = true) => {
      let value;

      if (isMultiple) {
        const opts = Array.isArray(optionOrOptions) ? optionOrOptions : [];
        selectedValues = new Set(opts.map(opt => opt.dataset.value));
        options.forEach(opt => {
          if (selectedValues.has(opt.dataset.value)) {
            opt.setAttribute('aria-selected', 'true');
          } else {
            opt.removeAttribute('aria-selected');
          }
        });
        updateMultipleLabel();
        syncMultipleInputs();
        value = Array.from(selectedValues);
      } else {
        const option = optionOrOptions;
        if (!option) return;
        selectedLabel.innerHTML = option.innerHTML;
        input.value = option.dataset.value;
        options.forEach(opt => {
          if (opt === option) {
            opt.setAttribute('aria-selected', 'true');
          } else {
            opt.removeAttribute('aria-selected');
          }
        });
        value = option.dataset.value;
      }

      if (triggerEvent) {
        selectComponent.dispatchEvent(new CustomEvent('change', {
          detail: { value },
          bubbles: true
        }));
      }
    };

    const toggleMultipleValue = (value, triggerEvent = true) => {
      if (!isMultiple || value == null) return;

      const newValues = new Set(selectedValues);
      if (newValues.has(value)) {
        newValues.delete(value);
      } else {
        newValues.add(value);
      }

      const selectedOptions = options.filter(opt => newValues.has(opt.dataset.value));
      updateValue(selectedOptions, triggerEvent);
    };

    const closePopover = (focusOnTrigger = true) => {
      if (popover.getAttribute('aria-hidden') === 'true') return;
      
      if (filter) {
        const resetFilter = () => {
          filter.value = '';
          visibleOptions = [...options];
          allOptions.forEach(opt => opt.setAttribute('aria-hidden', 'false'));
        };
        
        if (hasTransition()) {
          popover.addEventListener('transitionend', resetFilter, { once: true });
        } else {
          resetFilter();
        }
      }
      
      if (focusOnTrigger) trigger.focus();
      popover.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      setActiveOption(-1);
    }

    const selectOption = (option) => {
      if (!option) return;
      
      const oldValue = input.value;
      const newValue = option.dataset.value;

      if (newValue != null && newValue !== oldValue) {
        updateValue(option);
      }
      
      closePopover();
    };

    const selectByValue = (value) => {
      const option = options.find(opt => opt.dataset.value === value);
      if (isMultiple) {
        if (value != null && selectedValues.has(value)) return;
        if (option && value != null) {
          const newValues = new Set(selectedValues);
          newValues.add(value);
          const selectedOptions = options.filter(opt => newValues.has(opt.dataset.value));
          updateValue(selectedOptions);
        }
      } else {
        selectOption(option);
      }
    };

    const selectAll = () => {
      if (!isMultiple) return;
      updateValue(options.filter(opt => opt.dataset.value != null));
    };

    const selectNone = () => {
      if (!isMultiple) return;
      updateValue([]);
    };

    if (filter) {
      const filterOptions = () => {
        const searchTerm = filter.value.trim().toLowerCase();
        
        setActiveOption(-1);

        visibleOptions = [];
        allOptions.forEach(option => {
          if (option.hasAttribute('data-force')) {
            option.setAttribute('aria-hidden', 'false');
            if (options.includes(option)) {
              visibleOptions.push(option);
            }
            return;
          }

          const optionText = (option.dataset.filter || option.textContent).trim().toLowerCase();
          const keywordList = (option.dataset.keywords || '')
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(Boolean);
          const matchesKeyword = keywordList.some(keyword => keyword.includes(searchTerm));
          const matches = optionText.includes(searchTerm) || matchesKeyword;
          option.setAttribute('aria-hidden', String(!matches));
          if (matches && options.includes(option)) {
            visibleOptions.push(option);
          }
        });
      };
  
      filter.addEventListener('input', filterOptions);
    }

    if (isMultiple) {
      const validValues = new Set(options.map(opt => opt.dataset.value).filter(v => v != null));
      const inputs = Array.from(selectComponent.querySelectorAll(':scope > input[type="hidden"]'));
      const initialValues = inputs
        .map(inp => inp.value)
        .filter(v => v != null && validValues.has(v));

      let initialOptions;
      if (initialValues.length > 0) {
        initialOptions = options.filter(opt => initialValues.includes(opt.dataset.value));
      } else {
        initialOptions = options.filter(opt => opt.getAttribute('aria-selected') === 'true');
      }

      updateValue(initialOptions, false);
    } else {
      let initialOption = options.find(opt => opt.dataset.value === input.value);

      if (!initialOption) {
        initialOption = options.find(opt => opt.dataset.value !== undefined) ?? options[0];
      }

      if (initialOption) {
        updateValue(initialOption, false);
      }
    }

    const handleKeyNavigation = (event) => {
      const isPopoverOpen = popover.getAttribute('aria-hidden') === 'false';

      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End', 'Escape'].includes(event.key)) {
        return;
      }

      if (!isPopoverOpen) {
        if (event.key !== 'Enter' && event.key !== 'Escape') {
          event.preventDefault();
          trigger.click();
        }
        return;
      }
      
      event.preventDefault();

      if (event.key === 'Escape') {
        closePopover();
        return;
      }
      
      if (event.key === 'Enter') {
        if (activeIndex > -1) {
          if (isMultiple) {
            toggleMultipleValue(options[activeIndex].dataset.value);
          } else {
            selectOption(options[activeIndex]);
          }
        }
        return;
      }

      if (visibleOptions.length === 0) return;

      const currentVisibleIndex = activeIndex > -1 ? visibleOptions.indexOf(options[activeIndex]) : -1;
      let nextVisibleIndex = currentVisibleIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (currentVisibleIndex < visibleOptions.length - 1) {
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
          nextVisibleIndex = visibleOptions.length - 1;
          break;
      }

      if (nextVisibleIndex !== currentVisibleIndex) {
        const newActiveOption = visibleOptions[nextVisibleIndex];
        setActiveOption(options.indexOf(newActiveOption));
        newActiveOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    listbox.addEventListener('mousemove', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && visibleOptions.includes(option)) {
        const index = options.indexOf(option);
        if (index !== activeIndex) {
          setActiveOption(index);
        }
      }
    });

    listbox.addEventListener('mouseleave', () => {
      const selectedOption = listbox.querySelector('[role="option"][aria-selected="true"]');
      if (selectedOption) {
        setActiveOption(options.indexOf(selectedOption));
      } else {
        setActiveOption(-1);
      }
    });

    trigger.addEventListener('keydown', handleKeyNavigation);
    if (filter) {
      filter.addEventListener('keydown', handleKeyNavigation);
    }

    const openPopover = () => {
      document.dispatchEvent(new CustomEvent('basecoat:popover', {
        detail: { source: selectComponent }
      }));
      
      if (filter) {
        if (hasTransition()) {
          popover.addEventListener('transitionend', () => {
            filter.focus();
          }, { once: true });
        } else {
          filter.focus();
        }
      }

      popover.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      
      const selectedOption = listbox.querySelector('[role="option"][aria-selected="true"]');
      if (selectedOption) {
        setActiveOption(options.indexOf(selectedOption));
        selectedOption.scrollIntoView({ block: 'nearest' });
      }
    };

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closePopover();
      } else {
        openPopover();
      }
    });

    listbox.addEventListener('click', (event) => {
      const clickedOption = event.target.closest('[role="option"]');
      if (clickedOption) {
        if (isMultiple) {
          toggleMultipleValue(clickedOption.dataset.value);
          setActiveOption(options.indexOf(clickedOption));
          if (filter) {
            filter.focus();
          } else {
            trigger.focus();
          }
        } else {
          selectOption(clickedOption);
        }
      }
    });

    document.addEventListener('click', (event) => {
      if (!selectComponent.contains(event.target)) {
        closePopover(false);
      }
    });

    document.addEventListener('basecoat:popover', (event) => {
      if (event.detail.source !== selectComponent) {
        closePopover(false);
      }
    });

    popover.setAttribute('aria-hidden', 'true');

    selectComponent.selectByValue = selectByValue;
    if (isMultiple) {
      selectComponent.selectAll = selectAll;
      selectComponent.selectNone = selectNone;
    }
    selectComponent.dataset.selectInitialized = true;
    selectComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('select', 'div.select:not([data-select-initialized])', initSelect);
  }
})();
