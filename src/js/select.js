(() => {
  const initSelect = (selectComponent) => {
    const trigger = selectComponent.querySelector(':scope > button');
    const selectedLabel = trigger.querySelector(':scope > span');
    const popover = selectComponent.querySelector(':scope > [data-popover]');
    const listbox = popover.querySelector('[role="listbox"]');
    const input = selectComponent.querySelector(':scope > input[type="hidden"]');
    const filter = selectComponent.querySelector('header input[type="text"]');
    if (!trigger || !popover || !listbox || !input) {
      const missing = [];
      if (!trigger) missing.push('trigger');
      if (!popover) missing.push('popover');
      if (!listbox) missing.push('listbox');
      if (!input)   missing.push('input');
      console.error(`Select component initialisation failed. Missing element(s): ${missing.join(', ')}`, selectComponent);
      return;
    }
    
    const isMultiSelect = listbox.getAttribute('aria-multiselectable') === 'true';
    const initialSelectedLabel = selectedLabel.cloneNode(true);
    const allowedMultiSelectBadgeVariants = ['secondary', 'destructive', 'ghost', 'outline'];

    const allOptions = Array.from(listbox.querySelectorAll('[role="option"]'));
    const options = allOptions.filter(opt => opt.getAttribute('aria-disabled') !== 'true');
    let visibleOptions = [...options];
    let activeIndex = -1;

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

    const updateValue = (option, triggerEvent = true) => {
      if (option) {
        if (isMultiSelect) {
          updateValueMultiSelect(option, triggerEvent);
        } else {
          selectedLabel.innerHTML = option.dataset.label || option.innerHTML;
          input.value = option.dataset.value;
          listbox.querySelector('[role="option"][aria-selected="true"]')?.removeAttribute('aria-selected');
          option.setAttribute('aria-selected', 'true');
          
          if (triggerEvent) {
            const event = new CustomEvent('change', {
              detail: { value: option.dataset.value },
              bubbles: true
            });
            selectComponent.dispatchEvent(event);
          }
        }   
      }
    };

    const updateValueMultiSelect = (option, triggerEvent = true) => {
      const selectedOption = option.getAttribute('aria-selected');
      if (selectedOption === 'true') {
        option.setAttribute('aria-selected', 'false');
      } else if (selectedOption === 'false') {
        option.setAttribute('aria-selected', 'true');
      }

      const selected = listbox.querySelectorAll('[role="option"][aria-selected="true"]');
      const threshold = listbox.dataset.multiselectThreshold || selected.length

      if (selected.length > threshold) {

        const thresholdText = document.createElement('p');
        thresholdText.textContent = `${selected.length} ` + (listbox.dataset.multiselectThresholdText || 'entries selected')

        if (listbox.getAttribute('aria-controls') !== null) {
          const controlledElementId = listbox.getAttribute('aria-controls');
          const controlledElement = document.getElementById(controlledElementId);
          if (controlledElement !== null) {
            controlledElement.replaceChildren(thresholdText);
          } else {
            console.error(`aria-controls of listbox references an element that does not exist: ${controlledElementId}`, selectComponent);
            return;
          }
        } else {
          selectedLabel.replaceChildren(thresholdText);
        }
      } else if (selected.length > 0) {
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'items-center gap-1 flex';

        selected.forEach(opt => {
          if (opt.dataset.multiselectDisplay !== undefined) {
            let display = document.getElementById(opt.dataset.multiselectDisplay);
            if (display === null) {
              console.error(`data-multiselect-display of option references an element that does not exist: ${opt}`, selectComponent);
              return;
            }
            display = display.cloneNode(true)
            display.removeAttribute('hidden')
            display.removeAttribute('id')

            badgeContainer.appendChild(display);
          } else {
            const span = document.createElement('span');
            const variant = opt.dataset.multiselectVariant;
            if (variant !== undefined && allowedMultiSelectBadgeVariants.includes(variant)) {
              span.className = `badge-${variant}`;
            } else {
              span.className = 'badge';
            }
            span.className += ' font-normal';
            span.textContent = opt.dataset.label || opt.innerHTML;

            const removeButton = document.createElement('button');
            removeButton.className = 'btn-ghost w-4 h-4 -m-1';
            removeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path> <path d="m6 6 12 12"></path></svg>`;
            removeButton.addEventListener('click', () => {
              updateValue(opt);
            });
            
            span.insertBefore(removeButton, span.firstChild);
            badgeContainer.appendChild(span);
          }
        });

        if (listbox.getAttribute('aria-controls') !== null) {
          const controlledElementId = listbox.getAttribute('aria-controls');
          const controlledElement = document.getElementById(controlledElementId);
          if (controlledElement !== null) {
            controlledElement.replaceChildren(...badgeContainer.childNodes);
          } else {
            console.error(`aria-controls of listbox references an element that does not exist: ${controlledElementId}`, selectComponent);
            return;
          }
        } else {
          selectedLabel.replaceChildren(badgeContainer);
        }

        const clearButton = listbox.querySelector('[data-multiselect-clearelement]');

        if (clearButton === null) {
          const listboxSeparator = document.createElement('hr');
          listboxSeparator.setAttribute('data-multiselect-clearelement', "");
          listboxSeparator.role = 'separator';

          const clearSelectionOption = document.createElement('button');
          clearSelectionOption.setAttribute('data-multiselect-clearelement', "");
          clearSelectionOption.className = 'btn-ghost w-full justify-center';
          clearSelectionOption.textContent = listbox.dataset.multiselectClosetext || 'Clear';
          clearSelectionOption.addEventListener('click', () => {
            const selected = listbox.querySelectorAll('[role="option"][aria-selected="true"]');
            selected.forEach(opt => {
              opt.setAttribute('aria-selected', 'false');
            });
            updateValue(clearSelectionOption);
          });
          listbox.append(listboxSeparator, clearSelectionOption)
        } 
      } else if (selected.length === 0) {
        if (listbox.getAttribute('aria-controls') !== null) {
          const controlledElementId = listbox.getAttribute('aria-controls');
          const controlledElement = document.getElementById(controlledElementId);
          if (controlledElement !== null) {
            controlledElement.replaceChildren();
          } else {
            console.error(`aria-controls of listbox references an element that does not exist: ${controlledElementId}`, selectComponent);
            return;
          }
        } else {
          let initial = initialSelectedLabel.cloneNode(true);
          selectedLabel.replaceChildren(...initial.childNodes);
        }

        const clearButtonElements = listbox.querySelectorAll('[data-multiselect-clearelement]');
        clearButtonElements.forEach(el => {
            listbox.removeChild(el);
          });
      }

      const inputValue = JSON.stringify(Array.from(selected).map(opt => opt.dataset.value))

      input.value = inputValue

      if (triggerEvent) {
        const event = new CustomEvent('change', {
          detail: { value: inputValue },
          bubbles: true
        });
        selectComponent.dispatchEvent(event);
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
    }

    const selectOption = (option) => {
      if (!option) return;
      
      const oldValue = input.value;
      const newValue = option.dataset.value;

      if (newValue != null && newValue !== oldValue) {
        updateValue(option);
      }
      
      if (!isMultiSelect)
      {
        closePopover();
      }
    };

    const selectByValue = (value) => {
      const option = options.find(opt => opt.dataset.value === value);
      selectOption(option);
    };

    if (filter) {
      const filterOptions = () => {
        const searchTerm = filter.value.trim().toLowerCase();
        
        setActiveOption(-1);

        visibleOptions = [];
        allOptions.forEach(option => {
          const optionText = (option.dataset.label || option.textContent).trim().toLowerCase();
          const matches = optionText.includes(searchTerm);
          option.setAttribute('aria-hidden', String(!matches));
          if (matches && options.includes(option)) {
            visibleOptions.push(option);
          }
        });
      };
  
      filter.addEventListener('input', filterOptions);
    }

    let initialOption = options.find(opt => opt.dataset.value === input.value);
    
    if (!initialOption) {
      initialOption = options.find(opt => opt.dataset.value !== undefined) ?? options[0];
    }

    if (!isMultiSelect) {
        updateValue(initialOption, false);
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
          selectOption(options[activeIndex]);
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
        selectOption(clickedOption);
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
    selectComponent.dataset.selectInitialized = true;
    selectComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('select', 'div.select:not([data-select-initialized])', initSelect);
  }
})();