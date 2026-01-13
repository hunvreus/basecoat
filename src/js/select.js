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
    const selectedOptions = isMultiple ? new Set() : null;
    const placeholder = isMultiple ? (selectComponent.dataset.placeholder || '') : null;
    const closeOnSelect = selectComponent.dataset.closeOnSelect === 'true';

    const getValue = (opt) => opt.dataset.value ?? opt.textContent.trim();

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

    const updateValue = (optionOrOptions, triggerEvent = true) => {
      let value;

      if (isMultiple) {
        const opts = Array.isArray(optionOrOptions) ? optionOrOptions : [];
        selectedOptions.clear();
        opts.forEach(opt => selectedOptions.add(opt));

        // Get selected options in DOM order
        const selected = options.filter(opt => selectedOptions.has(opt));
        if (selected.length === 0) {
          selectedLabel.textContent = placeholder;
          selectedLabel.classList.add('text-muted-foreground');
        } else {
          selectedLabel.textContent = selected.map(opt => opt.dataset.label || opt.textContent.trim()).join(', ');
          selectedLabel.classList.remove('text-muted-foreground');
        }

        value = selected.map(getValue);
        input.value = JSON.stringify(value);
      } else {
        const option = optionOrOptions;
        if (!option) return;
        selectedLabel.innerHTML = option.innerHTML;
        value = getValue(option);
        input.value = value;
      }

      options.forEach(opt => {
        const isSelected = isMultiple ? selectedOptions.has(opt) : opt === optionOrOptions;
        if (isSelected) {
          opt.setAttribute('aria-selected', 'true');
        } else {
          opt.removeAttribute('aria-selected');
        }
      });

      if (triggerEvent) {
        selectComponent.dispatchEvent(new CustomEvent('change', {
          detail: { value },
          bubbles: true
        }));
      }
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
    };

    const toggleMultipleValue = (option) => {
      if (selectedOptions.has(option)) {
        selectedOptions.delete(option);
      } else {
        selectedOptions.add(option);
      }
      updateValue(options.filter(opt => selectedOptions.has(opt)));
    };

    const select = (value) => {
      if (isMultiple) {
        const option = options.find(opt => getValue(opt) === value && !selectedOptions.has(opt));
        if (!option) return;
        selectedOptions.add(option);
        updateValue(options.filter(opt => selectedOptions.has(opt)));
      } else {
        const option = options.find(opt => getValue(opt) === value);
        if (!option) return;
        if (input.value !== value) {
          updateValue(option);
        }
        closePopover();
      }
    };

    const deselect = (value) => {
      if (!isMultiple) return;
      const option = options.find(opt => getValue(opt) === value && selectedOptions.has(opt));
      if (!option) return;
      selectedOptions.delete(option);
      updateValue(options.filter(opt => selectedOptions.has(opt)));
    };

    const toggle = (value) => {
      if (!isMultiple) return;
      const option = options.find(opt => getValue(opt) === value);
      if (!option) return;
      toggleMultipleValue(option);
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

    // Initialization
    if (isMultiple) {
      const ariaSelected = options.filter(opt => opt.getAttribute('aria-selected') === 'true');
      try {
        const parsed = JSON.parse(input.value || '[]');
        const validValues = new Set(options.map(getValue));
        const initialValues = Array.isArray(parsed) ? parsed.filter(v => validValues.has(v)) : [];

        const initialOptions = [];
        if (initialValues.length > 0) {
          // Match values to options in order, allowing duplicates
          initialValues.forEach(val => {
            const opt = options.find(o => getValue(o) === val && !initialOptions.includes(o));
            if (opt) initialOptions.push(opt);
          });
        } else {
          initialOptions.push(...ariaSelected);
        }

        updateValue(initialOptions, false);
      } catch (e) {
        updateValue(ariaSelected, false);
      }
    } else {
      const initialOption = options.find(opt => getValue(opt) === input.value) || options[0];
      if (initialOption) updateValue(initialOption, false);
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
          const option = options[activeIndex];
          if (isMultiple) {
            toggleMultipleValue(option);
            if (closeOnSelect) {
              closePopover();
            }
          } else {
            if (input.value !== getValue(option)) {
              updateValue(option);
            }
            closePopover();
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
      if (!clickedOption) return;

      const option = options.find(opt => opt === clickedOption);
      if (!option) return;

      if (isMultiple) {
        toggleMultipleValue(option);
        if (closeOnSelect) {
          closePopover();
        } else {
          setActiveOption(options.indexOf(option));
          if (filter) {
            filter.focus();
          } else {
            trigger.focus();
          }
        }
      } else {
        if (input.value !== getValue(option)) {
          updateValue(option);
        }
        closePopover();
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

    // Public API
    Object.defineProperty(selectComponent, 'value', {
      get: () => {
        if (isMultiple) {
          return options.filter(opt => selectedOptions.has(opt)).map(getValue);
        } else {
          return input.value;
        }
      },
      set: (val) => {
        if (isMultiple) {
          const values = Array.isArray(val) ? val : (val != null ? [val] : []);
          const opts = [];
          values.forEach(v => {
            const opt = options.find(o => getValue(o) === v && !opts.includes(o));
            if (opt) opts.push(opt);
          });
          updateValue(opts);
        } else {
          const option = options.find(opt => getValue(opt) === val);
          if (option) {
            updateValue(option);
            closePopover();
          }
        }
      }
    });

    selectComponent.select = select;
    selectComponent.selectByValue = select; // Backward compatibility alias
    if (isMultiple) {
      selectComponent.deselect = deselect;
      selectComponent.toggle = toggle;
      selectComponent.selectAll = () => updateValue(options);
      selectComponent.selectNone = () => updateValue([]);
    }
    selectComponent.dataset.selectInitialized = true;
    selectComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('select', 'div.select:not([data-select-initialized])', initSelect);
  }
})();
