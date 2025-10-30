(() => {
  const initCommand = (dialog) => {
    const input = dialog.querySelector('header input');
    const listbox = dialog.querySelector('[role="listbox"]');

    if (!input || !listbox) {
      const missing = [];
      if (!input) missing.push('input');
      if (!listbox) missing.push('listbox');
      console.error(`Command component initialization failed. Missing element(s): ${missing.join(', ')}`, dialog);
      return;
    }

    const options = Array.from(listbox.querySelectorAll('[role="option"]'));
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
          input.setAttribute('aria-activedescendant', activeOption.id);
        } else {
          input.removeAttribute('aria-activedescendant');
        }
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    };

    const filterOptions = () => {
      const searchTerm = input.value.trim().toLowerCase();

      setActiveOption(-1);

      visibleOptions = [];
      options.forEach(option => {
        const optionText = (option.dataset.label || option.textContent).trim().toLowerCase();
        const keywords = (option.dataset.keywords || '').toLowerCase();
        const matches = optionText.includes(searchTerm) || keywords.includes(searchTerm);
        option.setAttribute('aria-hidden', String(!matches));
        if (matches) {
          visibleOptions.push(option);
        }
      });

      // empty state handled via CSS on [role="listbox"][data-empty]
    };

    const selectOption = (option) => {
      if (!option) return;

      const event = new CustomEvent('command:select', {
        detail: { value: option.dataset.value },
        bubbles: true
      });
      dialog.dispatchEvent(event);

      dialog.close();
    };

    input.addEventListener('input', filterOptions);

    const handleKeyNavigation = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (activeIndex > -1) {
          selectOption(options[activeIndex]);
        }
        return;
      }

      if (visibleOptions.length === 0) return;

      event.preventDefault();

      const currentVisibleIndex = activeIndex > -1 ? visibleOptions.indexOf(options[activeIndex]) : -1;
      let nextVisibleIndex = currentVisibleIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (currentVisibleIndex < visibleOptions.length - 1) {
            nextVisibleIndex = currentVisibleIndex + 1;
          } else if (currentVisibleIndex === -1) {
            nextVisibleIndex = 0;
          }
          break;
        case 'ArrowUp':
          if (currentVisibleIndex > 0) {
            nextVisibleIndex = currentVisibleIndex - 1;
          }
          break;
        case 'Home':
          nextVisibleIndex = 0;
          break;
        case 'End':
          nextVisibleIndex = visibleOptions.length - 1;
          break;
      }

      if (nextVisibleIndex !== currentVisibleIndex && nextVisibleIndex >= 0) {
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
      setActiveOption(-1);
    });

    listbox.addEventListener('click', (event) => {
      const clickedOption = event.target.closest('[role="option"]');
      if (clickedOption && visibleOptions.includes(clickedOption)) {
        selectOption(clickedOption);
      }
    });

    input.addEventListener('keydown', handleKeyNavigation);

    dialog.addEventListener('close', () => {
      input.value = '';
      visibleOptions = [...options];
      options.forEach(opt => opt.setAttribute('aria-hidden', 'false'));
      setActiveOption(-1);
    });

    dialog.dataset.commandInitialized = true;
    dialog.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      const firstCommand = document.querySelector('.command');
      if (firstCommand) {
        if (firstCommand.open) {
          firstCommand.close();
        } else {
          firstCommand.showModal();
          const input = firstCommand.querySelector('header input');
          if (input) input.focus();
        }
      }
    }
  });

  if (window.basecoat) {
    window.basecoat.register('command', '.command:not([data-command-initialized])', initCommand);
  }
})();
