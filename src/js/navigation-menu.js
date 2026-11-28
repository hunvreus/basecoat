(() => {
  const init = root => {
    if (root.dataset.navigationMenuInitialized) return;
    const list = root.querySelector(':scope > ul');
    const viewport = root.querySelector(':scope > [data-popover]');
    if (!list || !viewport) return;
    const triggers = Array.from(list.querySelectorAll(':scope > li > button[aria-controls]'));
    const panels = new Map(triggers.map(trigger => [trigger, document.getElementById(trigger.getAttribute('aria-controls'))])
      .filter(([, panel]) => panel && panel.parentElement === viewport));
    if (!panels.size) return;

    const controller = new AbortController();
    const { signal } = controller;
    let active = null;
    let openTimer;
    let closeTimer;
    let hoverOpened = false;
    const clearTimers = () => { clearTimeout(openTimer); clearTimeout(closeTimer); };
    const available = el => !el.disabled && el.getAttribute('aria-disabled') !== 'true' &&
      el.checkVisibility({ visibilityProperty: true }) && !el.closest('[inert]');
    const topItems = () => Array.from(list.querySelectorAll(':scope > li > :is(button, a[href])')).filter(available);
    const focusable = panel => Array.from(panel.querySelectorAll('a[href], button')).filter(available);
    const position = () => {
      if (!active) return;
      const panel = panels.get(active);
      const triggerRect = active.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const width = Math.min(panel.offsetWidth, document.documentElement.clientWidth - 16);
      const desired = getComputedStyle(root).direction === 'rtl' ? triggerRect.right - width : triggerRect.left;
      const left = Math.max(8, Math.min(desired, document.documentElement.clientWidth - width - 8));
      viewport.style.left = `${left - rootRect.left}px`;
      viewport.style.right = 'auto';
      viewport.style.width = `${width}px`;
      viewport.style.height = `${panel.offsetHeight}px`;
    };
    const close = (restoreFocus = false) => {
      clearTimers();
      if (!active) return;
      const trigger = active;
      const panel = panels.get(trigger);
      trigger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.inert = true;
      viewport.setAttribute('aria-hidden', 'true');
      active = null;
      hoverOpened = false;
      if (restoreFocus) trigger.focus({ preventScroll: true });
    };
    const show = (trigger, fromHover = false) => {
      clearTimers();
      if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
      if (active === trigger) return;
      const previous = active;
      const panel = panels.get(trigger);
      if (!panel) return;
      const direction = previous && triggers.indexOf(trigger) < triggers.indexOf(previous) ? -1 : 1;
      if (previous) {
        const oldPanel = panels.get(previous);
        previous.setAttribute('aria-expanded', 'false');
        oldPanel.setAttribute('aria-hidden', 'true');
        oldPanel.inert = true;
        oldPanel.dataset.motion = direction > 0 ? 'exit-start' : 'exit-end';
      }
      document.dispatchEvent(new CustomEvent('basecoat:popover', { detail: { source: root } }));
      active = trigger;
      hoverOpened = fromHover;
      panel.dataset.motion = previous ? (direction > 0 ? 'enter-end' : 'enter-start') : 'initial';
      panel.inert = false;
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      viewport.setAttribute('aria-hidden', 'false');
      position();
      requestAnimationFrame(() => { if (active === trigger) panel.dataset.motion = 'active'; });
    };
    const scheduleClose = () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => { if (hoverOpened && !root.matches(':hover') && !panels.get(active)?.contains(document.activeElement)) close(); }, 50);
    };
    for (const [trigger, panel] of panels) {
      trigger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.inert = true;
      trigger.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse') return;
        clearTimers();
        if (active) show(trigger, true);
        else openTimer = setTimeout(() => show(trigger, true), 50);
      }, { signal });
      trigger.addEventListener('click', () => {
        if (active === trigger && hoverOpened) { hoverOpened = false; return; }
        if (active === trigger) close(); else show(trigger);
      }, { signal });
    }
    for (const link of list.querySelectorAll(':scope > li > a')) {
      link.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') close();
      }, { signal });
    }
    root.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') scheduleClose(); }, { signal });
    window.addEventListener('resize', position, { signal });
    root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') clearTimeout(closeTimer); }, { signal });
    root.addEventListener('focusout', () => requestAnimationFrame(() => {
      if (!root.contains(document.activeElement) && (!hoverOpened || !root.matches(':hover'))) close();
    }), { signal });
    root.addEventListener('keydown', event => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape' && active) {
        const dialog = event.target.closest('dialog[open]');
        if (dialog && root.contains(dialog) && dialog.matches(':modal')) return;
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (active && panels.get(active).contains(event.target) && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
        const links = focusable(panels.get(active));
        const index = links.indexOf(event.target);
        if (index >= 0 && links.length) {
          event.preventDefault();
          const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
          links[(index + step + links.length) % links.length].focus();
        }
        return;
      }
      if (event.key === 'Tab' && active) {
        const links = focusable(panels.get(active));
        if (!event.shiftKey && event.target === active && links.length) {
          event.preventDefault();
          links[0].focus();
          return;
        }
        if (event.shiftKey && event.target === links[0]) {
          event.preventDefault();
          active.focus();
          return;
        }
        if (!event.shiftKey && event.target === links.at(-1)) {
          const items = topItems();
          const next = items[items.indexOf(active) + 1];
          if (next) { event.preventDefault(); close(); next.focus(); }
        }
      }
      const items = topItems();
      const index = items.indexOf(event.target);
      if (index < 0) return;
      const rtl = getComputedStyle(root).direction === 'rtl';
      let next;
      if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + items.length) % items.length;
      else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + items.length) % items.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      else if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && panels.has(event.target)) {
        event.preventDefault();
        show(event.target);
        const trigger = event.target;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (active === trigger && document.activeElement === trigger) focusable(panels.get(trigger))[0]?.focus();
        }));
        return;
      } else return;
      event.preventDefault();
      items[next].focus();
      if (active) { if (panels.has(items[next])) show(items[next]); else close(); }
    }, { signal });
    viewport.addEventListener('click', event => { if (event.target.closest('a')) close(); }, { signal });
    document.addEventListener('click', event => { if (!root.contains(event.target)) close(); }, { signal });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !event.defaultPrevented && active && !root.contains(event.target)) close(); }, { signal });
    document.addEventListener('basecoat:popover', event => { if (!root.contains(event.detail?.source)) close(); }, { signal });
    viewport.setAttribute('aria-hidden', 'true');
    root.dataset.navigationMenuInitialized = 'true';
    root._destroy = () => { close(); controller.abort(); };
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };
  window.basecoat?.register('navigation-menu', '.navigation-menu:not([data-navigation-menu-initialized])', init);
})();
