(() => {
  function initCarousel(root) {
    if (root.dataset.carouselInitialized) return;
    const track = root.querySelector(':scope > ul');
    const previous = root.querySelector(':scope > button:first-of-type');
    const next = root.querySelector(':scope > button:last-of-type');
    if (!track || !previous || !next || previous === next) return;

    let target = null;
    let settleTimer;
    const vertical = () => root.dataset.orientation === 'vertical';
    const rtl = () => getComputedStyle(track).direction === 'rtl';
    const position = () => vertical() ? track.scrollTop : Math.abs(track.scrollLeft);
    const maximum = () => Math.max(0, vertical()
      ? track.scrollHeight - track.clientHeight
      : track.scrollWidth - track.clientWidth);
    const update = () => {
      const active = document.activeElement;
      previous.disabled = position() <= 1;
      next.disabled = position() >= maximum() - 1;
      // Keep keyboard focus inside the carousel when the active control disables.
      if ((active === previous || active === next) && active.disabled) {
        const other = active === previous ? next : previous;
        (other.disabled ? track : other).focus({ preventScroll: true });
      }
    };
    const move = (direction) => {
      const bounds = track.getBoundingClientRect();
      const current = position();
      const limit = maximum();
      const points = [...track.children].map(item => {
        const rect = item.getBoundingClientRect();
        const offset = vertical() ? rect.top - bounds.top
          : rtl() ? bounds.right - rect.right : rect.left - bounds.left;
        return Math.max(0, Math.min(limit, current + offset));
      });
      const from = Math.min(limit, target ?? current);
      target = direction > 0
        ? (points.find(point => point > from + 1) ?? limit)
        : (points.findLast(point => point < from - 1) ?? 0);
      track.scrollTo(vertical() ? { top: target } : { left: rtl() ? -target : target });
    };
    const releaseTarget = () => { target = null; };
    const onScroll = () => {
      update();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(releaseTarget, 180);
    };
    const onKeydown = (event) => {
      // Do not intercept keys from links, inputs, or other controls in a slide.
      if (![track, previous, next].includes(event.target) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      let direction = 0;
      if (vertical()) {
        if (event.key === 'ArrowUp') direction = -1;
        if (event.key === 'ArrowDown') direction = 1;
      } else {
        if (event.key === 'ArrowLeft') direction = rtl() ? 1 : -1;
        if (event.key === 'ArrowRight') direction = rtl() ? -1 : 1;
      }
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    const prevClick = () => move(-1);
    const nextClick = () => move(1);
    const resizeObserver = new ResizeObserver(() => { releaseTarget(); update(); });
    const refresh = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(track);
      [...track.children].forEach(item => resizeObserver.observe(item));
      releaseTarget();
      update();
    };
    const mutationObserver = new MutationObserver(refresh);
    mutationObserver.observe(track, { childList: true });
    previous.addEventListener('click', prevClick);
    next.addEventListener('click', nextClick);
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('wheel', releaseTarget, { passive: true });
    track.addEventListener('pointerdown', releaseTarget);
    root.addEventListener('keydown', onKeydown);
    previous.hidden = false;
    next.hidden = false;
    root.dataset.carouselInitialized = 'true';
    refresh();
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
    root._destroy = () => {
      clearTimeout(settleTimer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('wheel', releaseTarget);
      track.removeEventListener('pointerdown', releaseTarget);
      root.removeEventListener('keydown', onKeydown);
      previous.removeEventListener('click', prevClick);
      next.removeEventListener('click', nextClick);
      previous.hidden = true;
      next.hidden = true;
    };
  }

  if (window.basecoat) {
    window.basecoat.register('carousel', '.carousel:not([data-carousel-initialized])', initCarousel);
  }
})();
