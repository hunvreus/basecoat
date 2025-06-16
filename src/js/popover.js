(() => {
  const initPopover = (popoverComponent) => {
    const trigger = popoverComponent.querySelector(':scope > button');
    const content = popoverComponent.querySelector(':scope > [data-popover]');

    if (!trigger || !content) {
      console.error('Popover component is missing a trigger button or a content element.', popoverComponent);
      return;
    }

    const closePopover = () => {
      if (trigger.getAttribute('aria-expanded') === 'false') return;
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
      trigger.focus();
    };

    const openPopover = () => {
      const elementToFocus = content.querySelector('[autofocus]');
      if (elementToFocus) {
        content.addEventListener('transitionend', () => {
          elementToFocus.focus();
        }, { once: true });
      }

      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
    };

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closePopover();
      } else {
        openPopover();
      }
    });

    popoverComponent.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePopover();
      }
    });

    document.addEventListener('click', (e) => {
      if (!popoverComponent.contains(e.target)) {
        closePopover();
      }
    });

    popoverComponent.dataset.popoverInitialized = true;
  };

  document.querySelectorAll('.popover:not([data-popover-initialized])').forEach(initPopover);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('.popover:not([data-popover-initialized])')) {
          initPopover(node);
        }
        node.querySelectorAll('.popover:not([data-popover-initialized])').forEach(initPopover);
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();
