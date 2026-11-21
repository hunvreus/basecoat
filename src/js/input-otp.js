(() => {
  function initInputOtp(root) {
    if (root.dataset.inputOtpInitialized) return;
    const input = root.querySelector(':scope > input[type="text"]');
    const slots = [...root.querySelectorAll(':scope > div > div > span')];
    if (!input || !slots.length || input.maxLength !== slots.length) return;

    let value = input.value;
    let start = input.selectionStart;
    let end = input.selectionEnd;
    const refresh = () => {
      const focused = document.activeElement === input;
      const caret = input.selectionStart;
      // A caret on existing text selects one slot. At the end of a partial code it can append.
      if (focused && caret === input.selectionEnd && (caret < input.value.length || caret === input.maxLength)) {
        const backward = caret === input.maxLength || (caret > 0 && start !== end && caret < end);
        const index = backward ? caret - 1 : caret;
        input.setSelectionRange(index, index + 1, backward ? 'backward' : 'forward');
      }
      value = input.value;
      start = input.selectionStart;
      end = input.selectionEnd;
      slots.forEach((slot, index) => {
        slot.textContent = value[index] || '';
        const active = focused && (start === end ? index === start : index >= start && index < end);
        slot.toggleAttribute('data-active', active);
        slot.toggleAttribute('data-caret', active && !slot.textContent);
      });
    };
    const onFocus = () => {
      input.setSelectionRange(Math.min(input.value.length, input.maxLength - 1), input.value.length);
      refresh();
    };
    const onInput = (event) => {
      if (input.hasAttribute('data-filter') && input.validity.patternMismatch) {
        input.value = value;
        input.setSelectionRange(start, end);
        event.stopImmediatePropagation();
      }
      refresh();
    };
    const onPasteIOS = (event) => {
      if (event.defaultPrevented || !event.clipboardData || input.readOnly || input.disabled) return;
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      const next = input.value.slice(0, input.selectionStart) + text + input.value.slice(input.selectionEnd);
      input.value = next.slice(0, input.maxLength);
      input.setSelectionRange(Math.min(input.value.length, input.maxLength - 1), input.value.length);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: text }));
    };
    let frame;
    const onReset = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(refresh); };
    const controller = new AbortController();
    const options = { signal: controller.signal };
    input.addEventListener('focus', onFocus, options);
    input.addEventListener('blur', refresh, options);
    input.addEventListener('selectionchange', refresh, options);
    input.addEventListener('input', onInput, { ...options, capture: true });
    if (CSS.supports('-webkit-touch-callout', 'none')) input.addEventListener('paste', onPasteIOS, options);
    input.form?.addEventListener('reset', onReset, options);
    root.refresh = refresh;
    root.dataset.inputOtpInitialized = 'true';
    refresh();
    root._destroy = () => {
      cancelAnimationFrame(frame);
      controller.abort();
      slots.forEach(slot => { slot.textContent = ''; delete slot.dataset.active; delete slot.dataset.caret; });
      delete root.refresh;
    };
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  }

  if (window.basecoat) {
    window.basecoat.register('input-otp', '.input-otp:not([data-input-otp-initialized])', initInputOtp);
  }
})();
