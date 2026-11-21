(() => {
  function initCodeBlock(root) {
    if (root.dataset.codeBlockInitialized) return;
    const code = root.querySelector(':scope > pre > code');
    if (!code || !root.querySelector('button[data-copy]')) return;

    const existingStatus = root.querySelector(':scope > output');
    const status = existingStatus || document.createElement('output');
    if (!existingStatus) root.append(status);
    let timer;
    let active = true;
    const reset = () => {
      root.querySelectorAll('button[data-copy]').forEach(button => delete button.dataset.copied);
      status.textContent = '';
    };
    const onClick = async (event) => {
      const button = event.target.closest('button[data-copy]');
      if (!button || button.closest('.code-block') !== root || button.disabled) return;
      clearTimeout(timer);
      reset();
      try {
        await navigator.clipboard.writeText(code.textContent);
        if (!active || !root.isConnected) return;
        button.dataset.copied = 'true';
        status.textContent = 'Copied to clipboard.';
        timer = setTimeout(reset, 2000);
      } catch (_) {
        if (active) status.textContent = 'Could not copy. Select the code and copy it manually.';
      }
    };
    reset();
    root.addEventListener('click', onClick);
    root.dataset.codeBlockInitialized = 'true';
    root._destroy = () => {
      active = false;
      clearTimeout(timer);
      root.removeEventListener('click', onClick);
      reset();
      if (!existingStatus) status.remove();
    };
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  }

  if (window.basecoat) {
    window.basecoat.register('code-block', '.code-block:not([data-code-block-initialized])', initCodeBlock);
  }
})();
