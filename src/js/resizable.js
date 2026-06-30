(() => {
  const DEFAULT_MIN = 10;
  const DEFAULT_MAX = 90;
  const DEFAULT_STEP = 5;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getPanels = (root) => Array.from(root.children).filter((child) => child.getAttribute('role') !== 'separator');

  const getSeparators = (root) => Array.from(root.children).filter((child) => child.getAttribute('role') === 'separator');

  const readSize = (panel) => parseNumber(panel.dataset.size) ?? parseNumber(panel.style.getPropertyValue('--resizable-size'));
  const readMin = (panel) => parseNumber(panel.dataset.minSize) ?? DEFAULT_MIN;
  const readMax = (panel) => parseNumber(panel.dataset.maxSize) ?? DEFAULT_MAX;

  const resolveSizes = (panels, previousSizes = []) => {
    const sizes = panels.map((panel, index) => readSize(panel) ?? previousSizes[index] ?? null);
    const knownTotal = sizes.reduce((sum, size) => sum + (Number.isFinite(size) ? size : 0), 0);
    const missing = sizes.filter((size) => !Number.isFinite(size)).length;

    if (missing === 0) {
      return normalizeSizes(sizes);
    }

    const remaining = Math.max(0, 100 - knownTotal);
    const fallback = missing > 0 ? remaining / missing : 0;
    return normalizeSizes(sizes.map((size) => (Number.isFinite(size) ? size : fallback)));
  };

  const normalizeSizes = (sizes) => {
    const total = sizes.reduce((sum, size) => sum + size, 0) || 1;
    const rounded = sizes.map((size) => (size / total) * 100);
    const roundedTotal = rounded.reduce((sum, size) => sum + size, 0);
    const delta = 100 - roundedTotal;
    if (rounded.length) rounded[rounded.length - 1] += delta;
    return rounded;
  };

  const applySizes = (panels, sizes) => {
    panels.forEach((panel, index) => {
      const size = sizes[index] ?? 0;
      panel.style.setProperty('--resizable-size', `${size}%`);
    });
  };

  const collectStructure = (root) => {
    const panels = [];
    const handles = [];

    Array.from(root.children).forEach((child) => {
      if (child.getAttribute('role') === 'separator') {
        const leftIndex = panels.length - 1;
        const rightIndex = panels.length;
        if (leftIndex >= 0) {
          handles.push({ element: child, leftIndex, rightIndex });
        }
        return;
      }

      panels.push(child);
    });

    return { panels, handles };
  };

  const initResizable = (root) => {
    if (root.dataset.resizableInitialized) return;

    const state = {
      panels: [],
      handles: [],
      sizes: [],
      activeHandle: null,
      pointerId: null,
      dragStart: 0,
      dragSizes: [],
      direction: getComputedStyle(root).direction || 'ltr',
      destroyers: [],
    };

    const cleanupListeners = () => {
      while (state.destroyers.length) {
        const destroy = state.destroyers.pop();
        destroy();
      }
    };

    const updateHandleState = (handle, active) => {
      handle.dataset.active = active ? 'true' : 'false';
    };

    const syncSizes = (nextSizes = state.sizes) => {
      state.sizes = resolveSizes(state.panels, nextSizes);
      applySizes(state.panels, state.sizes);
    };

    const resizePair = (leftIndex, rightIndex, delta) => {
      const leftPanel = state.panels[leftIndex];
      const rightPanel = state.panels[rightIndex];
      if (!leftPanel || !rightPanel) return;

      const total = state.dragSizes[leftIndex] + state.dragSizes[rightIndex];
      const leftMin = Math.max(readMin(leftPanel), total - readMax(rightPanel));
      const leftMax = Math.min(readMax(leftPanel), total - readMin(rightPanel));
      const nextLeft = clamp(state.dragSizes[leftIndex] + delta, leftMin, leftMax);
      const nextRight = total - nextLeft;

      state.sizes[leftIndex] = nextLeft;
      state.sizes[rightIndex] = nextRight;
      applySizes(state.panels, state.sizes);
    };

    const finishDrag = () => {
      if (!state.activeHandle) return;
      updateHandleState(state.activeHandle, false);
      state.activeHandle = null;
      state.pointerId = null;
      state.dragStart = 0;
      state.dragSizes = [];
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };

    const handlePointerMove = (event) => {
      if (!state.activeHandle || event.pointerId !== state.pointerId) return;

      const rect = root.getBoundingClientRect();
      const isVertical = root.dataset.orientation === 'vertical';
      const inlineDirection = state.direction === 'rtl' && !isVertical ? -1 : 1;
      const movement = isVertical
        ? ((event.clientY - state.dragStart) / Math.max(rect.height, 1)) * 100
        : ((event.clientX - state.dragStart) / Math.max(rect.width, 1)) * 100 * inlineDirection;
      const delta = movement;

      resizePair(state.activeHandle.leftIndex, state.activeHandle.rightIndex, delta);
    };

    const startDrag = (handleMeta, event) => {
      if (event.button !== 0) return;
      event.preventDefault();

      state.activeHandle = handleMeta;
      state.pointerId = event.pointerId;
      state.dragStart = root.dataset.orientation === 'vertical' ? event.clientY : event.clientX;
      state.dragSizes = state.sizes.slice();
      updateHandleState(handleMeta.element, true);
      document.body.style.cursor = root.dataset.orientation === 'vertical' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', finishDrag);
      window.addEventListener('pointercancel', finishDrag);
    };

    const handleKeydown = (handleMeta, event) => {
      const isVertical = root.dataset.orientation === 'vertical';
      const key = event.key;
      const step = event.shiftKey ? 1 : DEFAULT_STEP;
      const inlineDirection = state.direction === 'rtl' && !isVertical ? -1 : 1;
      let delta = 0;

      if (!isVertical && key === 'ArrowLeft') delta = -step * inlineDirection;
      if (!isVertical && key === 'ArrowRight') delta = step * inlineDirection;
      if (isVertical && key === 'ArrowUp') delta = -step;
      if (isVertical && key === 'ArrowDown') delta = step;
      if (!delta) return;

      event.preventDefault();
      resizePair(handleMeta.leftIndex, handleMeta.rightIndex, delta);
    };

    const bindHandles = () => {
      cleanupListeners();
      state.handles.forEach((handleMeta) => {
        const { element } = handleMeta;
        if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
        if (!element.hasAttribute('aria-orientation')) {
          element.setAttribute('aria-orientation', root.dataset.orientation === 'vertical' ? 'horizontal' : 'vertical');
        }
        if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', 'Resize panels');

        const onPointerDown = (event) => startDrag(handleMeta, event);
        const onKeyDown = (event) => handleKeydown(handleMeta, event);

        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('keydown', onKeyDown);
        state.destroyers.push(() => {
          element.removeEventListener('pointerdown', onPointerDown);
          element.removeEventListener('keydown', onKeyDown);
        });
      });
    };

    const refresh = () => {
      const structure = collectStructure(root);
      state.panels = structure.panels;
      state.handles = structure.handles;
      state.direction = getComputedStyle(root).direction || 'ltr';
      syncSizes(state.sizes.length === state.panels.length ? state.sizes : []);
      bindHandles();
    };

    root.refresh = refresh;
    root._destroy = () => {
      finishDrag();
      cleanupListeners();
      delete root.refresh;
      delete root._destroy;
    };

    state.panels = collectStructure(root).panels;
    state.handles = collectStructure(root).handles;

    if (state.panels.length < 2 || state.handles.length === 0) {
      root._destroy();
      return;
    }

    root.dataset.orientation = root.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal';
    syncSizes();
    bindHandles();
    root.dataset.resizableInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('resizable', '.resizable:not([data-resizable-initialized])', initResizable);
  }
})();
