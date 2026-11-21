(() => {
  const initPopover = (popoverComponent) => {
    if (popoverComponent.dataset.popoverInitialized) return;

    const trigger = popoverComponent.querySelector(':scope > button');
    const content = popoverComponent.querySelector(':scope > [data-popover]');

    if (!trigger || !content) {
      const missing = [];
      if (!trigger) missing.push('trigger');
      if (!content) missing.push('content');
      console.error(`Popover initialisation failed. Missing element(s): ${missing.join(', ')}`, popoverComponent);
      return;
    }

    const closePopover = (focusOnTrigger = true) => {
      if (trigger.getAttribute('aria-expanded') === 'false') return;
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
      if (focusOnTrigger) {
        trigger.focus();
      }
    };

    const openPopover = () => {
      document.dispatchEvent(new CustomEvent('basecoat:popover', {
        detail: { source: popoverComponent }
      }));

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
      content.querySelector('[autofocus]')?.focus();
    };

    const handleTriggerClick = () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closePopover();
      } else {
        openPopover();
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        closePopover();
      } else if (event.key === 'Tab' && trigger.getAttribute('aria-expanded') === 'true') {
        // Check focus after the browser has moved it to the next control.
        requestAnimationFrame(() => {
          if (!popoverComponent.contains(document.activeElement)) closePopover(false);
        });
      }
    };

    const handleDocumentClick = (event) => {
      if (!popoverComponent.contains(event.target)) {
        closePopover(false);
      }
    };

    const handleDocumentPopover = (event) => {
      if (!popoverComponent.contains(event.detail.source)) {
        closePopover(false);
      }
    };

    trigger.addEventListener('click', handleTriggerClick);
    popoverComponent.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('basecoat:popover', handleDocumentPopover);

    popoverComponent._destroy = () => {
      trigger.removeEventListener('click', handleTriggerClick);
      popoverComponent.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('basecoat:popover', handleDocumentPopover);
    };

    popoverComponent.dataset.popoverInitialized = true;
    popoverComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('popover', '.popover:not([data-popover-initialized])', initPopover);
  }
})();
