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
      
      const elementToFocus = content.querySelector('[autofocus]');
      if (elementToFocus) {
        content.addEventListener('transitionend', () => {
          elementToFocus.focus();
        }, { once: true });
      }

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
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
      }
    };

    const handleDocumentClick = (event) => {
      if (!popoverComponent.contains(event.target)) {
        closePopover();
      }
    };

    const handleDocumentPopover = (event) => {
      if (event.detail.source !== popoverComponent) {
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
