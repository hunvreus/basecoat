(() => {
  const states = new WeakMap();
  const slideSelector = ':scope > [aria-roledescription="slide"]';

  const isVertical = (root) => root.dataset.orientation === "vertical";
  const isRtl = (element) => getComputedStyle(element).direction === "rtl";
  const ownedBy = (root) => (element) => element.closest(".carousel") === root;

  const getElements = (root) => {
    const viewport =
      Array.from(root.children).find((child) =>
        child.querySelector(slideSelector),
      ) || null;
    const slides = viewport
      ? Array.from(viewport.querySelectorAll(slideSelector))
      : [];
    const prev =
      Array.from(root.querySelectorAll("[data-carousel-prev]")).find(
        ownedBy(root),
      ) || null;
    const next =
      Array.from(root.querySelectorAll("[data-carousel-next]")).find(
        ownedBy(root),
      ) || null;
    return { viewport, slides, prev, next };
  };

  // Lists the scroll positions the carousel can stop at. When more than one slide
  // is visible at a time, the last few slides are already in view at the end, so
  // there are fewer positions than slides.
  const getSnaps = (root, state) => {
    const { viewport, slides } = state;
    const vertical = isVertical(root);
    const rtl = !vertical && isRtl(viewport);
    const align = root.dataset.align || "center";
    const position = vertical ? viewport.scrollTop : viewport.scrollLeft;
    const range = vertical
      ? viewport.scrollHeight - viewport.clientHeight
      : viewport.scrollWidth - viewport.clientWidth;
    const min = rtl ? -range : 0;
    const max = rtl ? 0 : range;
    const viewportRect = viewport.getBoundingClientRect();
    const [startEdge, endEdge] = vertical
      ? ["top", "bottom"]
      : rtl
        ? ["right", "left"]
        : ["left", "right"];

    const snaps = [];
    slides.forEach((slide) => {
      const rect = slide.getBoundingClientRect();
      let offset;
      if (align === "start") offset = rect[startEdge] - viewportRect[startEdge];
      else if (align === "end") offset = rect[endEdge] - viewportRect[endEdge];
      else
        offset = vertical
          ? rect.top +
            rect.height / 2 -
            (viewportRect.top + viewportRect.height / 2)
          : rect.left +
            rect.width / 2 -
            (viewportRect.left + viewportRect.width / 2);

      const snap = Math.round(Math.min(max, Math.max(min, position + offset)));
      if (!snaps.length || Math.abs(snap - snaps[snaps.length - 1]) > 1)
        snaps.push(snap);
    });
    return snaps;
  };

  const getClosestIndex = (root, state) => {
    const { viewport, snaps } = state;
    const position = isVertical(root)
      ? viewport.scrollTop
      : viewport.scrollLeft;
    let closest = 0;
    snaps.forEach((snap, index) => {
      if (Math.abs(snap - position) < Math.abs(snaps[closest] - position))
        closest = index;
    });
    return closest;
  };

  const updateCarousel = (root) => {
    const state = states.get(root);
    if (!state?.viewport) return;

    state.snaps = getSnaps(root, state);
    const count = state.snaps.length;
    const index = Math.min(
      count - 1,
      state.target ?? getClosestIndex(root, state),
    );
    const loop = root.hasAttribute("data-loop");

    if (state.prev) state.prev.disabled = count < 2 || (!loop && index <= 0);
    if (state.next)
      state.next.disabled = count < 2 || (!loop && index >= count - 1);

    if (index === state.index && count === state.count) return;
    const isFirstUpdate = state.index === undefined;
    state.index = index;
    state.count = count;
    if (!isFirstUpdate) {
      root.dispatchEvent(
        new CustomEvent("change", { detail: { index, count }, bubbles: true }),
      );
    }
  };

  const refreshCarousel = (root) => {
    const state = states.get(root);
    if (!state) return;

    const previousViewport = state.viewport;
    Object.assign(state, getElements(root));
    if (state.viewport !== previousViewport) {
      if (previousViewport) {
        previousViewport.removeEventListener("scroll", state.handleScroll);
        state.resizeObserver.unobserve(previousViewport);
      }
      if (state.viewport) {
        state.viewport.addEventListener("scroll", state.handleScroll, {
          passive: true,
        });
        state.resizeObserver.observe(state.viewport);
      }
    }
    updateCarousel(root);
  };

  const initCarousel = (root) => {
    if (root.dataset.carouselInitialized) return;

    const state = { ...getElements(root), target: null };
    if (!state.viewport) return;
    states.set(root, state);

    let frame = null;
    let settleTimer = null;

    // Scroll events stop firing once the viewport is still, including after smooth scrolling.
    const scheduleSettle = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        state.target = null;
        updateCarousel(root);
      }, 150);
    };

    state.handleScroll = () => {
      if (frame === null) {
        frame = requestAnimationFrame(() => {
          frame = null;
          updateCarousel(root);
        });
      }
      scheduleSettle();
    };

    state.resizeObserver = new ResizeObserver(() => updateCarousel(root));

    const scrollToIndex = (index) => {
      if (!state.viewport) return;
      updateCarousel(root);
      const { snaps } = state;
      if (!snaps.length) return;

      const target = Math.min(snaps.length - 1, Math.max(0, index));
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      state.target = target;
      state.viewport.scrollTo({
        [isVertical(root) ? "top" : "left"]: snaps[target],
        behavior: reduceMotion ? "auto" : "smooth",
      });
      updateCarousel(root);
      scheduleSettle();
    };

    const scrollBySnap = (step) => {
      if (!state.viewport) return;
      updateCarousel(root);
      const { index, count } = state;
      let target = index + step;
      if (root.hasAttribute("data-loop")) target = (target + count) % count;
      if (target < 0 || target >= count) return;
      scrollToIndex(target);
    };

    root.scrollPrev = () => scrollBySnap(-1);
    root.scrollNext = () => scrollBySnap(1);
    root.scrollToIndex = scrollToIndex;
    root.refresh = () => refreshCarousel(root);
    Object.defineProperty(root, "index", {
      configurable: true,
      get: () => state.index,
    });
    Object.defineProperty(root, "count", {
      configurable: true,
      get: () => state.count,
    });

    const handleClick = (event) => {
      const button = event.target.closest(
        "[data-carousel-prev], [data-carousel-next]",
      );
      if (!button || !ownedBy(root)(button)) return;
      if (button.hasAttribute("data-carousel-prev")) root.scrollPrev();
      else root.scrollNext();
    };

    const handleKeydown = (event) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      if (!ownedBy(root)(event.target)) return;
      if (
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
      )
        return;

      let step = 0;
      if (isVertical(root)) {
        if (event.key === "ArrowUp") step = -1;
        if (event.key === "ArrowDown") step = 1;
      } else {
        const forward = isRtl(root) ? "ArrowLeft" : "ArrowRight";
        const backward = isRtl(root) ? "ArrowRight" : "ArrowLeft";
        if (event.key === backward) step = -1;
        if (event.key === forward) step = 1;
      }
      if (!step) return;

      event.preventDefault();
      scrollBySnap(step);
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("keydown", handleKeydown);
    state.viewport.addEventListener("scroll", state.handleScroll, {
      passive: true,
    });
    state.resizeObserver.observe(state.viewport);

    // Jump to data-start-index before the first update, so it doesn't animate or fire `change`.
    const startIndex = Number.parseInt(root.dataset.startIndex, 10);
    if (startIndex > 0) {
      const snaps = getSnaps(root, state);
      state.viewport.scrollTo({
        [isVertical(root) ? "top" : "left"]: snaps[Math.min(snaps.length - 1, startIndex)],
        behavior: "instant",
      });
    }
    updateCarousel(root);

    root._destroy = () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("keydown", handleKeydown);
      state.viewport?.removeEventListener("scroll", state.handleScroll);
      state.resizeObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      states.delete(root);
      delete root.scrollPrev;
      delete root.scrollNext;
      delete root.scrollToIndex;
      delete root.refresh;
      delete root.index;
      delete root.count;
    };

    root.dataset.carouselInitialized = "true";
    root.dispatchEvent(new CustomEvent("basecoat:initialized"));
  };

  if (window.basecoat) {
    window.basecoat.register("carousel", {
      selector: ".carousel:not([data-carousel-initialized])",
      init: initCarousel,
      refresh: refreshCarousel,
    });
  }
})();
