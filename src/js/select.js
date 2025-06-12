(() => {
  const initSelect = (select) => {
    const trigger = select.querySelector(':scope > [popovertarget]');
    const selectedValue = trigger.querySelector(':scope > span');
    const popover = select.querySelector(':scope > [popover]');
    const listbox = popover.querySelector('[role="listbox"]');
    const input = select.querySelector(':scope > input[type="hidden"]');
    if (!trigger || !popover || !listbox || !input) return;
    
    const options = Array.from(listbox.querySelectorAll('[role="option"]'));
    let activeIndex = -1;

    const updateValue = (option) => {
      if (option) {
        selectedValue.innerHTML = option.dataset.label || option.innerHTML;
        input.value = option.dataset.value;
        listbox.querySelector('[role="option"][aria-selected="true"]')?.removeAttribute('aria-selected');
        option.setAttribute('aria-selected', 'true');
      }
    };

    const selectOption = (option) => {
      if (!option) return;
      
      updateValue(option);
      
      trigger.removeAttribute('aria-activedescendant');
      options.forEach(opt => opt.classList.remove('active'));
      activeIndex = -1;
      popover.hidePopover();
    };

    let initialOption = options.find(opt => input.value && opt.dataset.value === input.value);
    if (!initialOption && options.length > 0) initialOption = options[0];

    updateValue(initialOption);

    trigger.addEventListener('keydown', (e) => {
      if (!popover.matches(':popover-open')) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > -1) options[activeIndex]?.classList.remove('active');
        
        if (e.key === 'ArrowDown') activeIndex = (activeIndex + 1) % options.length;
        else activeIndex = (activeIndex - 1 + options.length) % options.length;

        const activeOption = options[activeIndex];
        if (activeOption) {
          activeOption.classList.add('active');
          if (activeOption.id) {
            trigger.setAttribute('aria-activedescendant', activeOption.id);
          }
          activeOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectOption(options[activeIndex]);
      }
    });

    listbox.addEventListener('click', (e) => {
      const clickedOption = e.target.closest('[role="option"]');
      if (clickedOption) selectOption(clickedOption);
    });

    popover.addEventListener('toggle', (e) => {
      if (e.newState === 'closed') {
        trigger.removeAttribute('aria-activedescendant');
        if (activeIndex > -1) options[activeIndex]?.classList.remove('active');
        activeIndex = -1;
      }
    });

    select.dataset.selectInitialized = true;
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

  // Start observing the whole document
  observer.observe(document.body, { childList: true, subtree: true });
})();