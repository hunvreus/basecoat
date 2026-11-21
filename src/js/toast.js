(() => {
  let toaster;
  let resizeObserver;
  const toasts = new WeakMap();
  let isPaused = false;
  let focusBeforeToasts;
  const STACK_GAP = 12;
  const STACK_VISIBLE = 3;
  const ICONS = {
    success: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    error: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    info: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    loading: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    warning: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
  };

  function initToaster(toasterElement) {
    if (toasterElement.dataset.toasterInitialized) return;
    toaster = toasterElement;
    isPaused = toaster.matches(':hover, :focus-within');
    let swipe;

    const handleClick = (event) => {
      const control = event.target.closest('.toast footer a, .toast footer button');
      if (control) closeToast(control.closest('.toast'));
    };
    const handleFocusIn = (event) => {
      if (event.relatedTarget instanceof HTMLElement && event.relatedTarget !== document.body && !toaster.contains(event.relatedTarget)) {
        focusBeforeToasts = event.relatedTarget;
      }
      syncPause();
    };
    const syncPause = () => swipe || toaster.matches(':hover, :focus-within')
      ? pauseAllTimeouts()
      : resumeAllTimeouts();

    const handlePointerDown = (event) => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('a, button, input, textarea, select, [contenteditable]')) return;
      const element = event.target.closest('.toast:not([aria-hidden="true"])');
      if (!element) return;
      const rtl = getComputedStyle(toaster).direction === 'rtl';
      const sign = (rtl ? -1 : 1) * (toaster.dataset.align === 'start' ? -1 : 1);
      swipe = { element, id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, distance: 0, sign };
      element.setPointerCapture(event.pointerId);
      syncPause();
    };
    const handlePointerMove = (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      const x = (event.clientX - swipe.x) * swipe.sign;
      const y = event.clientY - swipe.y;
      if (!swipe.axis) {
        if (Math.max(x, y) < 8) return;
        swipe.axis = x > y ? 'x' : 'y';
        swipe.element.dataset.toastSwiping = '';
        updateStack();
      }
      swipe.distance = Math.max(0, swipe.axis === 'x' ? x : y);
      swipe.element.style.setProperty(`--toast-swipe-${swipe.axis}`, `${swipe.distance * (swipe.axis === 'x' ? swipe.sign : 1)}px`);
    };
    const handlePointerEnd = (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      const { element, axis, distance, sign, time } = swipe;
      const dismiss = event.type !== 'pointercancel' && (distance > 40 || (distance > 10 && distance / Math.max(1, event.timeStamp - time) > 0.5));
      delete element.dataset.toastSwiping;
      if (dismiss) {
        element.dataset.toastSwipe = axis;
        element.style.setProperty('--toast-swipe-end', `${sign * 150}%`);
        closeToast(element);
      } else {
        element.style.removeProperty('--toast-swipe-x');
        element.style.removeProperty('--toast-swipe-y');
      }
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      swipe = null;
      syncPause();
      updateStack();
    };

    const handleFocusOut = (event) => {
      if (!toasterElement.contains(event.relatedTarget)) syncPause();
    };
    const listeners = new AbortController();
    const { signal } = listeners;
    toaster.addEventListener('mouseenter', syncPause, { signal });
    toaster.addEventListener('mouseleave', syncPause, { signal });
    toaster.addEventListener('focusin', handleFocusIn, { signal });
    toaster.addEventListener('focusout', handleFocusOut, { signal });
    toaster.addEventListener('click', handleClick, { signal });
    toaster.addEventListener('pointerdown', handlePointerDown, { signal });
    toaster.addEventListener('pointermove', handlePointerMove, { signal });
    toaster.addEventListener('pointerup', handlePointerEnd, { signal });
    toaster.addEventListener('pointercancel', handlePointerEnd, { signal });
    window.addEventListener('pointerup', handlePointerEnd, { signal });
    window.addEventListener('pointercancel', handlePointerEnd, { signal });

    toasterElement.toast = (config = {}) => {
      const toastElement = createToast(config);
      toasterElement.appendChild(toastElement);
      initToast(toastElement, config);
      return toastElement;
    };
    toasterElement.closeAll = () => {
      toasterElement.querySelectorAll('.toast:not([aria-hidden="true"])').forEach(closeToast);
    };

    const observer = new ResizeObserver(updateStack);
    resizeObserver = observer;
    toaster.querySelectorAll('.toast:not([data-toast-initialized])').forEach(element => initToast(element));
    toasterElement._destroy = () => {
      listeners.abort();
      swipe = null;
      toasterElement.querySelectorAll('.toast[data-toast-initialized]').forEach(toast => toast._destroy?.());
      observer.disconnect();
      delete toasterElement.toast;
      delete toasterElement.closeAll;
      if (toaster === toasterElement) {
        resizeObserver = null;
        isPaused = false;
        focusBeforeToasts = null;
        toaster = null;
      }
    };
    toaster.dataset.toasterInitialized = 'true';
    updateStack();
    toaster.dispatchEvent(new CustomEvent('basecoat:initialized'));
  }

  function updateStack() {
    if (!toaster) return;

    const elements = Array.from(toaster.querySelectorAll('.toast:not([aria-hidden="true"])')).reverse();
    let offset = 0;

    const expanded = toaster.matches(':hover, :focus-within, :has([data-toast-swiping])');
    const entries = elements.map(element => {
      const content = element.querySelector('.toast-content') || element;
      const styles = getComputedStyle(element);
      return { element, content, height: content.offsetHeight + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth) };
    });

    entries.forEach(({ element, content, height }, index) => {
      element.style.setProperty('--toast-offset', `${offset}px`);
      element.style.setProperty('--toast-index', index);
      element.style.setProperty('--toast-height', `${height}px`);
      element.style.setProperty('--toast-front-height', `${entries[0].height}px`);
      element.toggleAttribute('data-toast-stack-overflow', index >= STACK_VISIBLE);
      // Keep hidden content out of the tab order; hovering/focusing expands the stack.
      const hidden = index >= STACK_VISIBLE || (!expanded && index > 0);
      if (hidden && content.contains(document.activeElement)) {
        const target = entries[0].content.querySelector('button:not(:disabled), a[href]') || (focusBeforeToasts?.isConnected ? focusBeforeToasts : toaster);
        if (target === toaster && !toaster.hasAttribute('tabindex')) toaster.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      content.inert = hidden;
      offset += height + STACK_GAP;
    });
  }

  function resetTimeout(element, state) {
    clearTimeout(state.timeoutId);
    const duration = parseInt(element.dataset.duration);
    state.remainingTime = Number.isNaN(duration) || duration === 0
      ? element.dataset.category === 'loading' ? -1 : element.dataset.category === 'error' ? 5000 : 3000
      : duration;
    state.timeoutId = null;
    if (state.remainingTime !== -1 && (!isPaused || !toaster?.contains(element))) {
      state.startTime = Date.now();
      state.timeoutId = setTimeout(() => closeToast(element), state.remainingTime);
    }
  }

  function initToast(element, config) {
    if (element.dataset.toastInitialized) return;
    const state = { remainingTime: -1, timeoutId: null, startTime: null };
    toasts.set(element, state);
    resetTimeout(element, state);

    const content = element.querySelector('.toast-content') || element;
    resizeObserver?.observe(content);
    element.close = () => closeToast(element);
    if (config !== undefined) {
      let currentConfig = { ...config };
      element.update = (changes = {}) => {
        // An async result must not resurrect a dismissed toast.
        if (!toasts.has(element) || !element.isConnected) return;
        currentConfig = { ...currentConfig, ...changes };
        const replacement = createToast(currentConfig);
        const controls = [...element.querySelectorAll('footer a, footer button')];
        const focusedIndex = controls.indexOf(document.activeElement);
        content.replaceChildren(...replacement.firstElementChild.childNodes);
        content.setAttribute('role', replacement.firstElementChild.getAttribute('role'));
        for (const attribute of ['data-category', 'data-duration']) {
          if (replacement.hasAttribute(attribute)) element.setAttribute(attribute, replacement.getAttribute(attribute));
          else element.removeAttribute(attribute);
        }
        if (focusedIndex >= 0) {
          const nextControls = element.querySelectorAll('footer a, footer button');
          const target = nextControls[focusedIndex] || nextControls[0] || toaster;
          if (target && target === toaster && !target.hasAttribute('tabindex')) target.tabIndex = -1;
          target?.focus({ preventScroll: true });
        }
        resetTimeout(element, toasts.get(element));
        updateStack();
        return element;
      };
    }
    element._destroy = () => {
      clearTimeout(state.timeoutId);
      resizeObserver?.unobserve(content);
      toasts.delete(element);
      delete element.close;
      delete element.dataset.toastInitialized;
      // Keep update callable for pending promises and forced reinitialization.
      if (!element.isConnected) updateStack();
    };
    updateStack();
    // Flush the initial offscreen position before transitioning to the stack.
    element.getBoundingClientRect();
    element.dataset.toastInitialized = 'true';
    element.dataset.basecoatComponent = 'toast';
  }

  function pauseAllTimeouts() {
    if (isPaused || !toaster) return;

    isPaused = true;
    updateStack();

    toaster.querySelectorAll('.toast:not([aria-hidden="true"])').forEach(element => {
      const state = toasts.get(element);
      if (!state) return;
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
        state.remainingTime = Math.max(0, state.remainingTime - (Date.now() - state.startTime));
      }
    });
  }

  function resumeAllTimeouts() {
    if (!isPaused || !toaster) return;

    isPaused = false;
    updateStack();

    toaster.querySelectorAll('.toast:not([aria-hidden="true"])').forEach(element => {
      const state = toasts.get(element);
      if (!state) return;
      if (state.remainingTime !== -1 && !state.timeoutId) {
        if (state.remainingTime > 0) {
          state.startTime = Date.now();
          state.timeoutId = setTimeout(() => closeToast(element), state.remainingTime);
        } else {
          closeToast(element);
        }
      }
    });
  }

  function closeToast(element) {
    if (!element || !toasts.has(element)) return;

    const host = toaster?.contains(element) ? toaster : null;
    const state = toasts.get(element);
    clearTimeout(state.timeoutId);
    resizeObserver?.unobserve(element.querySelector('.toast-content') || element);
    toasts.delete(element);

    if (element.contains(document.activeElement)) {
      const remaining = [...(host?.querySelectorAll('.toast:not([aria-hidden="true"])') || [])].filter(toast => toast !== element);
      const nextControl = remaining.at(-1)?.querySelector('button:not(:disabled), a[href]');
      const keyboard = document.activeElement.matches(':focus-visible');
      const focusTarget = (keyboard && nextControl) || (host && focusBeforeToasts?.isConnected ? focusBeforeToasts : null);
      if (!focusTarget) document.activeElement.blur();
      else {
        focusTarget.focus({ preventScroll: true });
        if (element.contains(document.activeElement)) {
          host.tabIndex = -1;
          host.focus({ preventScroll: true });
        }
      }
    }
    if (host?.matches(':hover, :focus-within, :has([data-toast-swiping])')) element.dataset.toastExpanded = '';
    element.setAttribute('aria-hidden', 'true');
    element.inert = true;
    updateStack();

    const remove = () => {
      if (!element.isConnected) return;
      element.remove();
      updateStack();
    };
    requestAnimationFrame(() => {
      const animations = element.getAnimations();
      if (!animations.length) return remove();
      Promise.allSettled(animations.map(animation => animation.finished)).then(remove);
    });
  }

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function createToast(config) {
    const {
      category = 'info',
      title,
      description,
      action,
      cancel,
      duration,
      icon,
      closeButton = true,
      html: allowHtml = false,
    } = config;

    // Text is escaped unless `html: true`. `icon` is always raw markup (SVG).
    const text = (value) => (allowHtml ? String(value) : escapeHtml(value));

    const iconHtml = icon || (category && ICONS[category]) || '';
    const titleHtml = title ? `<h2>${text(title)}</h2>` : '';
    const descriptionHtml = description ? `<p>${text(description)}</p>` : '';
    const actionHtml = action?.href
      ? `<a href="${escapeHtml(action.href)}" class="btn" data-variant="outline" data-size="sm" data-toast-action>${text(action.label)}</a>`
      : action
        ? `<button type="button" class="btn" data-variant="outline" data-size="sm" data-toast-action ${action.onclick ? `onclick="${escapeHtml(action.onclick)}"` : ''}>${text(action.label)}</button>`
        : '';
    const cancelHtml = cancel
      ? `<button type="button" class="btn" data-variant="outline" data-size="sm" data-toast-cancel ${cancel.onclick ? `onclick="${escapeHtml(cancel.onclick)}"` : ''}>${text(cancel.label)}</button>`
      : '';

    const closeHtml = closeButton
      ? '<button type="button" class="btn" data-variant="ghost" data-size="icon-sm" aria-label="Close toast"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>'
      : '';
    const footerHtml = actionHtml || cancelHtml || closeHtml ? `<footer>${actionHtml}${cancelHtml}${closeHtml}</footer>` : '';

    const html = `
      <li
        class="toast"
        ${category ? `data-category="${escapeHtml(category)}"` : ''}
        ${duration !== undefined ? `data-duration="${escapeHtml(duration)}"` : ''}
      >
        <div class="toast-content" role="${category === 'error' ? 'alert' : 'status'}" aria-atomic="true">
          ${iconHtml}
          <section>
            ${titleHtml}
            ${descriptionHtml}
          </section>
          ${footerHtml}
        </div>
      </li>
    `;
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  if (window.basecoat) {
    window.basecoat.register('toaster', '#toaster:not([data-toaster-initialized])', initToaster);
    window.basecoat.register('toast', '.toast:not([data-toast-initialized])', initToast);
  }
})();
