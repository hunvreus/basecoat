(() => {
  let toaster;
  const toasts = new WeakMap();
  let isPaused = false;
  const ICONS = {
    success: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    error: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    info: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    warning: '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
  };

  function initToaster(toasterElement) {
    if (toasterElement.dataset.toasterInitialized) return;
    toaster = toasterElement;

    toaster.addEventListener('mouseenter', pauseAllTimeouts);
    toaster.addEventListener('mouseleave', resumeAllTimeouts);
    toaster.addEventListener('click', (event) => {
      const actionLink = event.target.closest('.toast footer a');
      const actionButton = event.target.closest('.toast footer button');
      if (actionLink || actionButton) {
        closeToast(event.target.closest('.toast'));
      }
    });

    toaster.querySelectorAll('.toast:not([data-toast-initialized])').forEach(initToast);
    toaster.dataset.toasterInitialized = 'true';
    toaster.dispatchEvent(new CustomEvent('basecoat:initialized'));
  }

  function initToast(element) {
    if (element.dataset.toastInitialized) return;

    const duration = parseInt(element.dataset.duration);
    const timeoutDuration = duration !== -1
      ? duration || (element.dataset.category === 'error' ? 5000 : 3000)
      : -1;
    
    const state = {
      remainingTime: timeoutDuration,
      timeoutId: null,
      startTime: null,
    };
    
    if (timeoutDuration !== -1) {
      if (isPaused) {
        state.timeoutId = null;
      } else {
        state.startTime = Date.now();
        state.timeoutId = setTimeout(() => closeToast(element), timeoutDuration);
      }
    }
    toasts.set(element, state);
    
    element.dataset.toastInitialized = 'true';
  }

  function pauseAllTimeouts() {
    if (isPaused) return;

    isPaused = true;
    
    toaster.querySelectorAll('.toast:not([aria-hidden="true"])').forEach(element => {
      if (!toasts.has(element)) return;
      
      const state = toasts.get(element);
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
        state.remainingTime -= Date.now() - state.startTime;
      }
    });
  }

  function resumeAllTimeouts() {
    if (!isPaused) return;

    isPaused = false;

    toaster.querySelectorAll('.toast:not([aria-hidden="true"])').forEach(element => {
      if (!toasts.has(element)) return;

      const state = toasts.get(element);
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
    if (!toasts.has(element)) return;

    const state = toasts.get(element);
    clearTimeout(state.timeoutId);
    toasts.delete(element);
    
    if (element.contains(document.activeElement)) document.activeElement.blur();
    element.setAttribute('aria-hidden', 'true');
    element.addEventListener('transitionend', () => element.remove(), { once: true });
  }

  function executeAction(button, toast) {
    const actionString = button.dataset.toastAction;
    if (!actionString) return;
    try {
      const func = new Function('close', actionString);
      func(() => closeToast(toast));
    } catch (event) {
      console.error('Error executing toast action:', event);
    }
  }

  function createToast(config) {
    const {
      category = 'info',
      title,
      description,
      action,
      cancel,
      duration,
      icon,
    } = config;

    const iconHtml = icon || (category && ICONS[category]) || '';
    const titleHtml = title ? `<h2>${title}</h2>` : '';
    const descriptionHtml = description ? `<p>${description}</p>` : '';
    const actionHtml = action?.href
      ? `<a href="${action.href}" class="btn" data-toast-action>${action.label}</a>`
      : action?.onclick
        ? `<button type="button" class="btn" data-toast-action onclick="${action.onclick}">${action.label}</button>`
        : '';
    const cancelHtml = cancel
      ? `<button type="button" class="btn-outline h-6 text-xs px-2.5 rounded-sm" data-toast-cancel onclick="${cancel?.onclick}">${cancel.label}</button>`
      : '';

    const footerHtml = actionHtml || cancelHtml ? `<footer>${actionHtml}${cancelHtml}</footer>` : '';

    const html = `
      <div
        class="toast"
        role="${category === 'error' ? 'alert' : 'status'}"
        aria-atomic="true"
        ${category ? `data-category="${category}"` : ''}
        ${duration !== undefined ? `data-duration="${duration}"` : ''}
      >
        <div class="toast-content">
          ${iconHtml}
          <section>
            ${titleHtml}
            ${descriptionHtml}
          </section>
          ${footerHtml}
          </div>
        </div>
      </div>
    `;
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  document.addEventListener('basecoat:toast', (event) => {
    if (!toaster) {
      console.error('Cannot create toast: toaster container not found on page.');
      return;
    }
    const config = event.detail?.config || {};
    const toastElement = createToast(config);
    toaster.appendChild(toastElement);
  });

  if (window.basecoat) {
    window.basecoat.register('toaster', '#toaster:not([data-toaster-initialized])', initToaster);
    window.basecoat.register('toast', '.toast:not([data-toast-initialized])', initToast);
  }
})();