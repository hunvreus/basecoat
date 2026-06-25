(() => {
  const toMs = (value) => {
    if (!value) return 0;
    const trimmed = value.trim();
    if (trimmed.endsWith('ms')) return parseFloat(trimmed) || 0;
    if (trimmed.endsWith('s')) return (parseFloat(trimmed) || 0) * 1000;
    return parseFloat(trimmed) || 0;
  };

  const maxTransitionMs = (element) => {
    if (!element) return 0;
    const styles = getComputedStyle(element);
    const durations = styles.transitionDuration.split(',').map(toMs);
    const delays = styles.transitionDelay.split(',').map(toMs);
    return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] || delays[0] || 0)));
  };

  const initDrawer = (drawer) => {
    if (drawer.dataset.drawerInitialized) return;

    const nativeClose = drawer.close.bind(drawer);
    let pointerStartedOnBackdrop = false;
    let closeTimer = null;

    const finishClose = (returnValue) => {
      window.clearTimeout(closeTimer);
      closeTimer = null;
      drawer.removeAttribute('data-closing');
      nativeClose(returnValue);
    };

    drawer.close = (returnValue = '') => {
      if (!drawer.open) return;
      if (drawer.dataset.closing) return;

      const content = drawer.firstElementChild;
      const duration = maxTransitionMs(content);

      if (duration === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishClose(returnValue);
        return;
      }

      drawer.dataset.closing = 'true';
      closeTimer = window.setTimeout(() => finishClose(returnValue), duration + 50);
    };

    const handleCancel = (event) => {
      event.preventDefault();
      drawer.close();
    };

    const handlePointerDown = (event) => {
      pointerStartedOnBackdrop = event.target === drawer;
    };

    const handlePointerUp = (event) => {
      if (pointerStartedOnBackdrop && event.target === drawer) {
        drawer.close();
      }
      pointerStartedOnBackdrop = false;
    };

    drawer.addEventListener('cancel', handleCancel);
    drawer.addEventListener('pointerdown', handlePointerDown);
    drawer.addEventListener('pointerup', handlePointerUp);

    drawer._destroy = () => {
      window.clearTimeout(closeTimer);
      drawer.removeEventListener('cancel', handleCancel);
      drawer.removeEventListener('pointerdown', handlePointerDown);
      drawer.removeEventListener('pointerup', handlePointerUp);
      drawer.close = nativeClose;
      delete drawer._destroy;
    };

    drawer.dataset.drawerInitialized = 'true';
    drawer.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('drawer', '.drawer:not([data-drawer-initialized])', initDrawer);
  }
})();
