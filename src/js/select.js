(() => {
  const initSelect = (selectComponent) => {
    const trigger = selectComponent.querySelector(':scope > button');
    const selectedValue = trigger.querySelector(':scope > span');
    const popover = selectComponent.querySelector(':scope > [data-popover]');
    const listbox = popover.querySelector('[role="listbox"]');
    const input = selectComponent.querySelector(':scope > input[type="hidden"]');
    const filter = selectComponent.querySelector('header input[type="text"]');
    if (!trigger || !popover || !listbox || !input) return;
    
    const options = Array.from(listbox.querySelectorAll('[role="option"]'));
    let visibleOptions = [...options];
    let activeIndex = -1;

    const updateValue = (option) => {
      if (option) {
        selectedValue.innerHTML = option.dataset.label || option.innerHTML;
        input.value = option.dataset.value;
        listbox.querySelector('[role="option"][aria-selected="true"]')?.removeAttribute('aria-selected');
        option.setAttribute('aria-selected', 'true');
      }
    };

    const closePopover = () => {
      popover.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      if (filter) {
        filter.value = '';
        visibleOptions = [...options];
        options.forEach(opt => opt.setAttribute('aria-hidden', 'false'));
      }
      trigger.removeAttribute('aria-activedescendant');
      if (activeIndex > -1) options[activeIndex]?.classList.remove('active');
      activeIndex = -1;
    }

    const selectOption = (option) => {
      if (!option) return;
      
      if (option.dataset.value) {
        updateValue(option);
      }
      closePopover();
    };

    if (filter) {
      const filterOptions = () => {
        const searchTerm = filter.value.trim().toLowerCase();
        
        if (activeIndex > -1) {
          options[activeIndex].classList.remove('active');
          trigger.removeAttribute('aria-activedescendant');
          activeIndex = -1;
        }

        visibleOptions = [];
        options.forEach(option => {
          const optionText = (option.dataset.label || option.textContent).trim().toLowerCase();
          const matches = optionText.includes(searchTerm);
          option.setAttribute('aria-hidden', String(!matches));
          if (matches) {
            visibleOptions.push(option);
          }
        });
      };
  
      filter.addEventListener('input', filterOptions);
    }

    let initialOption = options.find(opt => input.value && opt.dataset.value === input.value);
    if (!initialOption && options.length > 0) initialOption = options[0];

    updateValue(initialOption);

    const handleKeyNavigation = (e) => {
      const isPopoverOpen = popover.getAttribute('aria-hidden') === 'false';

      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End', 'Escape'].includes(e.key)) {
        return;
      }

      if (!isPopoverOpen) {
        if (e.key !== 'Enter' && e.key !== 'Escape') {
          e.preventDefault();
          trigger.click();
        }
        return;
      }
      
      e.preventDefault();

      if (e.key === 'Escape') {
        closePopover();
        return;
      }
      
      if (e.key === 'Enter') {
        if (activeIndex > -1) {
          selectOption(visibleOptions[activeIndex]);
        }
        return;
      }

      if (visibleOptions.length === 0) return;

      const currentVisibleIndex = activeIndex > -1 ? visibleOptions.indexOf(options[activeIndex]) : -1;
      let nextVisibleIndex = currentVisibleIndex;

      switch (e.key) {
        case 'ArrowDown':
          if (currentVisibleIndex < visibleOptions.length - 1) {
            nextVisibleIndex = currentVisibleIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (currentVisibleIndex > 0) {
            nextVisibleIndex = currentVisibleIndex - 1;
          } else if (currentVisibleIndex === -1) {
            nextVisibleIndex = 0; // Start from top if nothing is active
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
        if (currentVisibleIndex > -1) {
          visibleOptions[currentVisibleIndex].classList.remove('active');
        }
        
        const newActiveOption = visibleOptions[nextVisibleIndex];
        newActiveOption.classList.add('active');
        activeIndex = options.indexOf(newActiveOption);
        
        if (newActiveOption.id) {
          trigger.setAttribute('aria-activedescendant', newActiveOption.id);
        }
        newActiveOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    trigger.addEventListener('keydown', handleKeyNavigation);
    if (filter) {
      filter.addEventListener('keydown', handleKeyNavigation);
    }

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closePopover();
      } else {
        popover.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        if (filter) filter.focus();
        
        const selectedOption = listbox.querySelector('[role="option"][aria-selected="true"]');
        if (selectedOption) {
          if (activeIndex > -1) {
            options[activeIndex]?.classList.remove('active');
          }
          activeIndex = options.indexOf(selectedOption);
          selectedOption.classList.add('active');
          if (selectedOption.id) {
            trigger.setAttribute('aria-activedescendant', selectedOption.id);
          }
          selectedOption.scrollIntoView({ block: 'nearest' });
        }
      }
    });

    listbox.addEventListener('click', (e) => {
      const clickedOption = e.target.closest('[role="option"]');
      if (clickedOption) {
        selectOption(clickedOption);
      }
    });

    document.addEventListener('click', (e) => {
      if (!selectComponent.contains(e.target)) {
        closePopover();
      }
    });

    popover.setAttribute('aria-hidden', 'true');
    selectComponent.dataset.selectInitialized = true;
  };

  document.querySelectorAll('div.select:not([data-select-initialized])').forEach(initSelect);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('div.select:not([data-select-initialized])')) {
            initSelect(node);
          }
          node.querySelectorAll('div.select:not([data-select-initialized])').forEach(initSelect);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();