(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseBoolean = (value, defaultValue) => {
    if (value == null) return defaultValue;
    if (value === '') return true;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  };

  const parseNumber = (value, defaultValue) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  };

  const parseSnapPoints = (value) => {
    const raw = (value || '')
      .split(',')
      .map(s => Number.parseFloat(s.trim()))
      .filter(n => Number.isFinite(n))
      .map(n => clamp(n, 0, 1));

    const points = Array.from(new Set([0, ...raw, 1])).sort((a, b) => a - b);
    return points.length ? points : [0, 1];
  };

  const getSide = (drawer) => (drawer.dataset.side || 'bottom').toLowerCase();

  const getSideConfig = (side) => {
    switch (side) {
      case 'top':
        return { axis: 'y', closeSign: -1 };
      case 'bottom':
        return { axis: 'y', closeSign: 1 };
      case 'left':
        return { axis: 'x', closeSign: -1 };
      case 'right':
        return { axis: 'x', closeSign: 1 };
      default:
        return { axis: 'y', closeSign: 1 };
    }
  };

  const getClosedTranslate = (side) => {
    switch (side) {
      case 'top':
      case 'left':
        return '-100%';
      case 'bottom':
      case 'right':
      default:
        return '100%';
    }
  };

  const getPanel = (drawer) => drawer.querySelector(':scope > div');

  const setTranslatePercent = (drawer, openFraction) => {
    const panel = getPanel(drawer);
    if (!panel) return;

    const side = getSide(drawer);
    const { closeSign } = getSideConfig(side);

    const open = clamp(openFraction, 0, 1);
    let translate = (1 - open) * 100 * closeSign;
    if (Math.abs(translate) < 0.001) translate = 0;

    panel.style.setProperty('--bc-drawer-translate', `${translate}%`);
    drawer.__basecoatDrawerSnap = open;
  };

  const setBackdropOpacity = (drawer, value) => {
    drawer.style.setProperty(
      '--bc-drawer-backdrop-opacity',
      clamp(value, 0, 1).toString()
    );
  };

  const getFocusable = (root) => {
    const candidates = root.querySelectorAll(
      [
        'a[href]:not([tabindex="-1"])',
        'area[href]:not([tabindex="-1"])',
        'button:not([disabled]):not([tabindex="-1"])',
        'input:not([disabled]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        'iframe:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]:not([tabindex="-1"])',
      ].join(',')
    );

    return Array.from(candidates).filter(el => {
      const styles = window.getComputedStyle(el);
      if (styles.display === 'none' || styles.visibility === 'hidden') return false;
      return el.offsetParent !== null || styles.position === 'fixed';
    });
  };

  const focusAutofocus = (drawer) => {
    const panel = getPanel(drawer);
    if (!panel) return;

    const autofocus = panel.querySelector('[autofocus]');
    if (autofocus) {
      autofocus.focus();
      return;
    }

    const focusables = getFocusable(panel);
    if (focusables.length) {
      focusables[0].focus();
    }
  };

  const setTriggersExpanded = (drawer, expanded) => {
    const id = drawer.id;
    if (!id) return;
    document
      .querySelectorAll(`[data-drawer-trigger="${CSS.escape(id)}"]`)
      .forEach(trigger => trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
  };

  let scrollLockCount = 0;
  let prevOverflow = null;
  let prevPaddingRight = null;

  const lockScroll = () => {
    scrollLockCount += 1;
    if (scrollLockCount !== 1) return;

    const root = document.documentElement;
    prevOverflow = root.style.overflow;
    prevPaddingRight = root.style.paddingRight;

    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      root.style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const unlockScroll = () => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount !== 0) return;

    const root = document.documentElement;
    root.style.overflow = prevOverflow || '';
    root.style.paddingRight = prevPaddingRight || '';
    prevOverflow = null;
    prevPaddingRight = null;
  };

  const waitForTransformTransition = (panel, callback) => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      panel.removeEventListener('transitionend', onEnd);
      callback();
    };

    const onEnd = (event) => {
      if (event.target !== panel) return;
      if (event.propertyName !== 'transform') return;
      finish();
    };

    panel.addEventListener('transitionend', onEnd);

    const parseTimeMs = (time) => {
      const value = time.trim();
      if (!value) return 0;
      if (value.endsWith('ms')) return Number.parseFloat(value) || 0;
      if (value.endsWith('s')) return (Number.parseFloat(value) || 0) * 1000;
      return (Number.parseFloat(value) || 0) * 1000;
    };

    const styles = window.getComputedStyle(panel);
    const durations = styles.transitionDuration.split(',').map(parseTimeMs);
    const delays = styles.transitionDelay.split(',').map(parseTimeMs);
    const maxMs = Math.max(
      ...durations.map((d, i) => d + (delays[i] || 0))
    );
    window.setTimeout(finish, Math.max(0, maxMs) + 50);
  };

  const openDrawer = (drawer, trigger = null) => {
    if (!(drawer instanceof HTMLDialogElement)) return;
    if (drawer.open) return;

    const panel = getPanel(drawer);
    if (!panel) {
      console.error('Drawer initialization failed. Missing panel element.', drawer);
      return;
    }

    const side = getSide(drawer);
    const snapPoints = parseSnapPoints(drawer.dataset.snapPoints);
    const defaultSnap = clamp(
      parseNumber(drawer.dataset.defaultSnap, Math.max(...snapPoints)),
      0,
      1
    );

    drawer.__basecoatDrawerLastTrigger = trigger || document.activeElement;
    drawer.__basecoatDrawerFocusOnClose = true;

    drawer.dataset.drawerDragging = 'false';
    drawer.dataset.drawerState = 'opening';

    panel.style.setProperty('--bc-drawer-translate', getClosedTranslate(side));
    setBackdropOpacity(drawer, 0);

    try {
      drawer.showModal();
    } catch (error) {
      console.error('Failed to open drawer with showModal().', error, drawer);
      return;
    }

    lockScroll();
    setTriggersExpanded(drawer, true);

    document.dispatchEvent(new CustomEvent('basecoat:drawer', { detail: { source: drawer } }));
    drawer.dispatchEvent(new CustomEvent('drawer:open', { detail: { snap: defaultSnap } }));

    requestAnimationFrame(() => {
      drawer.dataset.drawerState = 'open';
      setTranslatePercent(drawer, defaultSnap);
      setBackdropOpacity(drawer, defaultSnap);
      focusAutofocus(drawer);
      drawer.dispatchEvent(new CustomEvent('drawer:snap', { detail: { snap: defaultSnap } }));
    });
  };

  const closeDrawer = (drawer, { focusOnTrigger = true } = {}) => {
    if (!(drawer instanceof HTMLDialogElement)) return;
    if (!drawer.open) return;

    const panel = getPanel(drawer);
    if (!panel) return;

    drawer.__basecoatDrawerFocusOnClose = focusOnTrigger;
    drawer.dataset.drawerDragging = 'false';
    drawer.dataset.drawerState = 'closing';

    setBackdropOpacity(drawer, 0);
    panel.style.setProperty('--bc-drawer-translate', getClosedTranslate(getSide(drawer)));

    waitForTransformTransition(panel, () => {
      if (!drawer.open) return;
      drawer.close();
    });
  };

  const snapDrawer = (drawer, snap, { closeOnSnapToZero = true } = {}) => {
    const snapPoints = parseSnapPoints(drawer.dataset.snapPoints);
    const target = clamp(snap, 0, 1);

    if (closeOnSnapToZero && target === 0) {
      closeDrawer(drawer);
      return;
    }

    drawer.dataset.drawerState = 'open';
    setTranslatePercent(drawer, target);
    setBackdropOpacity(drawer, target);
    drawer.dispatchEvent(new CustomEvent('drawer:snap', { detail: { snap: target, snapPoints } }));
  };

  const chooseSnapPoint = (snapPoints, currentOpen, velocityClose, velocityThreshold) => {
    const points = [...snapPoints].sort((a, b) => a - b);
    const current = clamp(currentOpen, 0, 1);
    const threshold = Math.max(0, velocityThreshold);
    const epsilon = 0.001;

    if (velocityClose > threshold) {
      const lower = points.filter(p => p < current - epsilon);
      return lower.length ? lower[lower.length - 1] : 0;
    }

    if (velocityClose < -threshold) {
      const higher = points.filter(p => p > current + epsilon);
      return higher.length ? higher[0] : 1;
    }

    return points.reduce((nearest, p) => {
      if (nearest == null) return p;
      return Math.abs(p - current) < Math.abs(nearest - current) ? p : nearest;
    }, null);
  };

  const initDrawer = (drawer) => {
    if (!(drawer instanceof HTMLDialogElement)) {
      console.error('Drawer must be a <dialog> element.', drawer);
      return;
    }

    const panel = getPanel(drawer);
    if (!panel) {
      console.error('Drawer initialization failed. Missing panel element.', drawer);
      return;
    }

    const handle = drawer.querySelector('[data-drawer-handle]');
    const id = drawer.id;

    drawer.dataset.drawerState = drawer.open ? 'open' : 'closed';
    drawer.dataset.drawerDragging = 'false';
    drawer.__basecoatDrawerSnap = 1;

    setTriggersExpanded(drawer, drawer.open);
    setBackdropOpacity(drawer, drawer.open ? 1 : 0);

    drawer.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDrawer(drawer);
    });

    drawer.addEventListener('click', (event) => {
      if (event.target !== drawer) return;
      const closeOnOverlayClick = parseBoolean(drawer.dataset.closeOnOverlayClick, true);
      if (!closeOnOverlayClick) return;
      closeDrawer(drawer);
    });

    drawer.addEventListener('close', () => {
      drawer.dataset.drawerState = 'closed';
      drawer.dataset.drawerDragging = 'false';

      unlockScroll();
      setTriggersExpanded(drawer, false);
      setBackdropOpacity(drawer, 0);

      const lastTrigger = drawer.__basecoatDrawerLastTrigger;
      const focusOnClose = drawer.__basecoatDrawerFocusOnClose !== false;

      if (focusOnClose && lastTrigger instanceof HTMLElement && document.contains(lastTrigger)) {
        lastTrigger.focus();
      }

      drawer.dispatchEvent(new CustomEvent('drawer:close', { detail: { id } }));
    });

    drawer.addEventListener('basecoat:drawer', (event) => {
      const action = event.detail?.action;
      if (!action) return;
      if (event.detail?.id && event.detail.id !== drawer.id) return;
      if (action === 'open') openDrawer(drawer);
      if (action === 'close') closeDrawer(drawer, { focusOnTrigger: false });
    });

    const startDrag = (event) => {
      if (!drawer.open) return;
      if (event.button != null && event.button !== 0) return;

      const handleOnly = parseBoolean(drawer.dataset.handleOnly, true);
      if (handleOnly && handle && event.target !== handle && !event.target.closest('[data-drawer-handle]')) {
        return;
      }
      if (!handleOnly && event.target.closest('button, a, input, textarea, select, [role="button"], [data-drawer-no-drag]')) {
        return;
      }

      drawer.dataset.drawerDragging = 'true';
      drawer.dataset.drawerState = 'dragging';

      const side = getSide(drawer);
      const { axis } = getSideConfig(side);
      const rect = panel.getBoundingClientRect();
      const size = axis === 'y' ? rect.height : rect.width;

      const startX = event.clientX;
      const startY = event.clientY;
      const snapPoints = parseSnapPoints(drawer.dataset.snapPoints);
      const startOpen = clamp(drawer.__basecoatDrawerSnap ?? 1, 0, 1);
      const startCloseOffset = (1 - startOpen) * size;

      let lastTime = performance.now();
      let lastCloseOffset = startCloseOffset;
      let velocityClose = 0;

      const dragTarget = handleOnly && handle ? handle : panel;
      dragTarget.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        const deltaClose = side === 'bottom'
          ? dy
          : side === 'top'
            ? -dy
            : side === 'right'
              ? dx
              : -dx;

        const closeOffset = clamp(startCloseOffset + deltaClose, 0, size);
        const open = size > 0 ? 1 - closeOffset / size : 1;

        setTranslatePercent(drawer, open);
        setBackdropOpacity(drawer, open);

        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
          velocityClose = (closeOffset - lastCloseOffset) / dt;
          lastTime = now;
          lastCloseOffset = closeOffset;
        }

        moveEvent.preventDefault();
      };

      const finishDrag = () => {
        drawer.dataset.drawerDragging = 'false';

        const open = clamp(drawer.__basecoatDrawerSnap ?? 1, 0, 1);
        const velocityThreshold = parseNumber(drawer.dataset.velocityThreshold, 1);
        const targetSnap = chooseSnapPoint(snapPoints, open, velocityClose, velocityThreshold);

        drawer.dispatchEvent(new CustomEvent('drawer:snap', { detail: { snap: targetSnap } }));

        if (targetSnap === 0) {
          closeDrawer(drawer);
          return;
        }

        drawer.dataset.drawerState = 'open';
        snapDrawer(drawer, targetSnap, { closeOnSnapToZero: false });
      };

      const onUp = () => {
        dragTarget.removeEventListener('pointermove', onMove);
        dragTarget.removeEventListener('pointerup', onUp);
        dragTarget.removeEventListener('pointercancel', onUp);
        finishDrag();
      };

      dragTarget.addEventListener('pointermove', onMove);
      dragTarget.addEventListener('pointerup', onUp);
      dragTarget.addEventListener('pointercancel', onUp);
    };

    panel.addEventListener('pointerdown', startDrag);

    drawer.addEventListener('click', (event) => {
      const closeButton = event.target.closest('[data-drawer-close]');
      if (!closeButton) return;
      if (!drawer.contains(closeButton)) return;
      closeDrawer(drawer);
    });

    drawer.dataset.drawerInitialized = true;
    drawer.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  const installGlobalHandlers = () => {
    if (window.__basecoatDrawerGlobalHandlersInstalled) return;
    window.__basecoatDrawerGlobalHandlersInstalled = true;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-drawer-trigger]');
      if (!trigger) return;

      const id = trigger.getAttribute('data-drawer-trigger');
      if (!id) return;

      const drawer = document.getElementById(id);
      if (!drawer || !drawer.classList.contains('drawer')) return;

      if (!drawer.dataset.drawerInitialized) {
        initDrawer(drawer);
      }

      openDrawer(drawer, trigger);
    });

    document.addEventListener('basecoat:drawer', (event) => {
      const source = event.detail?.source;
      if (!source) return;

      document.querySelectorAll('dialog.drawer[open]').forEach((drawer) => {
        if (drawer === source) return;
        closeDrawer(drawer, { focusOnTrigger: false });
      });
    });
  };

  installGlobalHandlers();

  if (window.basecoat) {
    window.basecoat.register('drawer', '.drawer:not([data-drawer-initialized])', initDrawer);
  }
})();
