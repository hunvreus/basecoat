(() => {
  const init = (root) => {
    if (root.dataset.hoverCardInitialized) return;
    const trigger = root.querySelector(':scope > :is(a, button)');
    const panel = root.querySelector(':scope > [data-popover]');
    if (!trigger || !panel) return;

    const controller = new AbortController();
    const { signal } = controller;
    const delay = (name, fallback) => {
      const value = trigger.getAttribute(name);
      const ms = value === null || value.trim() === '' ? NaN : Number(value);
      return Number.isFinite(ms) && ms >= 0 && ms <= 2147483647 ? ms : fallback;
    };
    let timer;
    let pointerInside = false;
    let focusInside = false;
    let dismissed = false;
    const close = () => {
      clearTimeout(timer);
      panel.setAttribute('aria-hidden', 'true');
    };
    const scheduleOpen = () => {
      clearTimeout(timer);
      if (trigger.matches(':disabled, [aria-disabled="true"]')) return;
      if (!dismissed && panel.getAttribute('aria-hidden') === 'true') {
        timer = setTimeout(() => panel.setAttribute('aria-hidden', 'false'), delay('data-delay', 600));
      }
    };
    const scheduleClose = () => {
      if (pointerInside || focusInside) return;
      clearTimeout(timer);
      timer = setTimeout(close, delay('data-close-delay', 300));
    };
    root.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      pointerInside = true;
      dismissed = false;
      scheduleOpen();
    }, { signal });
    root.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      pointerInside = false;
      scheduleClose();
    }, { signal });
    root.addEventListener('focusin', event => {
      if (panel.contains(event.target)) {
        focusInside = true;
        clearTimeout(timer);
      } else if (event.target === trigger && trigger.matches(':focus-visible') && !root.contains(event.relatedTarget)) {
        focusInside = true;
        dismissed = false;
        scheduleOpen();
      }
    }, { signal });
    root.addEventListener('focusout', event => {
      if (root.contains(event.relatedTarget)) return;
      focusInside = false;
      scheduleClose();
    }, { signal });
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const dialog = event.target.closest('dialog[open]');
      if (dialog && root.contains(dialog) && dialog.matches(':modal')) return;
      if (panel.getAttribute('aria-hidden') === 'false') {
        event.preventDefault();
        event.stopPropagation();
        if (panel.contains(document.activeElement)) trigger.focus({ preventScroll: true });
      }
      dismissed = true;
      close();
    }, { signal });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !event.defaultPrevented && pointerInside && !root.contains(event.target)) {
        dismissed = true;
        close();
      }
    }, { signal });
    document.addEventListener('basecoat:popover', event => {
      if (!root.contains(event.detail?.source)) { dismissed = true; close(); }
    }, { signal });

    panel.setAttribute('aria-hidden', 'true');
    root.dataset.hoverCardInitialized = 'true';
    root._destroy = () => { clearTimeout(timer); controller.abort(); };
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };
  window.basecoat?.register('hover-card', '.hover-card:not([data-hover-card-initialized])', init);
})();
