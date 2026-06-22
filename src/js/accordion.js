(() => {
  const states = new WeakMap();

  const isDisabled = (details) => {
    const summary = details.querySelector(':scope > summary');
    return details.getAttribute('aria-disabled') === 'true'
      || details.dataset.disabled === 'true'
      || summary?.getAttribute('aria-disabled') === 'true';
  };

  const isMultiple = (root) => root.hasAttribute('data-multiple');

  const closeSiblings = (root, activeDetails) => {
    if (isMultiple(root) || !activeDetails.open) return;
    root.querySelectorAll(':scope > details[open]').forEach((details) => {
      if (details !== activeDetails) details.open = false;
    });
  };

  const initAccordion = (root) => {
    if (root.dataset.accordionInitialized) return;

    const handleClick = (event) => {
      const summary = event.target.closest('summary');
      const details = summary?.closest('details');
      if (!details || details.parentElement !== root || !isDisabled(details)) return;
      event.preventDefault();
    };

    const handleKeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const summary = event.target.closest('summary');
      const details = summary?.closest('details');
      if (!details || details.parentElement !== root || !isDisabled(details)) return;
      event.preventDefault();
    };

    const handleToggle = (event) => {
      const details = event.target;
      if (details.parentElement !== root) return;
      if (isDisabled(details)) {
        details.open = false;
        return;
      }
      closeSiblings(root, details);
    };

    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKeydown);
    root.addEventListener('toggle', handleToggle, true);
    root.querySelectorAll(':scope > details[open]').forEach((details) => closeSiblings(root, details));

    states.set(root, { handleClick, handleToggle });
    root._destroy = () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('keydown', handleKeydown);
      root.removeEventListener('toggle', handleToggle, true);
      states.delete(root);
    };

    root.dataset.accordionInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('accordion', '.accordion:not([data-accordion-initialized])', initAccordion);
  }
})();
