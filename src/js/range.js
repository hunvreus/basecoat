(() => {
  function updateRange(element) {
    const min = parseFloat(element.min || '0');
    const max = parseFloat(element.max || '100');
    const value = parseFloat(element.value || '0');
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    element.style.setProperty('--slider-value', `${percent}%`);
  }

  function initRange(element) {
    if (element.dataset.rangeInitialized) return;

    updateRange(element);
    const handleInput = () => updateRange(element);
    element.addEventListener('input', handleInput);
    element._destroy = () => {
      element.removeEventListener('input', handleInput);
    };
    element.dataset.rangeInitialized = 'true';
  }

  if (window.basecoat) {
    window.basecoat.register('range', 'input[type="range"]:not([data-range-initialized])', initRange);
  }
})();
