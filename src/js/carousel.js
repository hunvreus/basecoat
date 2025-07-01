(() => {
  const initCarousel = (carouselElement) => {
    const viewport = carouselElement.querySelector('.carousel-viewport');
    const content = carouselElement.querySelector('.carousel-content');
    const items = Array.from(carouselElement.querySelectorAll('.carousel-item'));
    const previousBtn = carouselElement.querySelector('.carousel-previous');
    const nextBtn = carouselElement.querySelector('.carousel-next');
    const indicators = Array.from(carouselElement.querySelectorAll('.carousel-indicator'));
    
    if (!content || items.length === 0) return;

    const orientation = carouselElement.dataset.orientation || 'horizontal';
    const isVertical = orientation === 'vertical';
    const autoplay = carouselElement.dataset.autoplay === 'true';
    const autoplayDelay = parseInt(carouselElement.dataset.autoplayDelay) || 3000;
    
    let currentIndex = 0;
    let autoplayInterval;

    const updateCarousel = (index, smooth = true) => {
      if (index < 0 || index >= items.length) return;
      
      currentIndex = index;
      const translateValue = isVertical ? 
        `translateY(-${currentIndex * 100}%)` : 
        `translateX(-${currentIndex * 100}%)`;
      
      if (smooth) {
        content.style.transition = isVertical ? 
          'transform 300ms ease-in-out' : 
          'transform 300ms ease-in-out';
      } else {
        content.style.transition = 'none';
      }
      
      content.style.transform = translateValue;

      // Update button states
      if (previousBtn) {
        previousBtn.disabled = currentIndex === 0;
        previousBtn.setAttribute('aria-disabled', currentIndex === 0);
      }
      if (nextBtn) {
        nextBtn.disabled = currentIndex === items.length - 1;
        nextBtn.setAttribute('aria-disabled', currentIndex === items.length - 1);
      }

      // Update indicators
      indicators.forEach((indicator, i) => {
        indicator.setAttribute('aria-selected', i === currentIndex);
      });

      // Update items aria-hidden
      items.forEach((item, i) => {
        item.setAttribute('aria-hidden', i !== currentIndex);
      });

      // Dispatch custom event
      carouselElement.dispatchEvent(new CustomEvent('basecoat:carousel:change', {
        detail: { currentIndex, currentItem: items[currentIndex] }
      }));
    };

    const goToPrevious = () => {
      if (currentIndex > 0) {
        updateCarousel(currentIndex - 1);
      }
    };

    const goToNext = () => {
      if (currentIndex < items.length - 1) {
        updateCarousel(currentIndex + 1);
      } else if (autoplay) {
        // Loop back to start for autoplay
        updateCarousel(0);
      }
    };

    const goToSlide = (index) => {
      updateCarousel(index);
    };

    const startAutoplay = () => {
      if (!autoplay) return;
      autoplayInterval = setInterval(goToNext, autoplayDelay);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    };

    // Event listeners
    if (previousBtn) {
      previousBtn.addEventListener('click', goToPrevious);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', goToNext);
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => goToSlide(index));
    });

    // Keyboard navigation
    carouselElement.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (!isVertical) {
            event.preventDefault();
            goToPrevious();
          }
          break;
        case 'ArrowRight':
          if (!isVertical) {
            event.preventDefault();
            goToNext();
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            goToPrevious();
          }
          break;
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            goToNext();
          }
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(items.length - 1);
          break;
      }
    });

    // Touch/swipe support (basic)
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (event) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isDragging = true;
      stopAutoplay();
    };

    const handleTouchEnd = (event) => {
      if (!isDragging) return;
      
      const touch = event.changedTouches[0];
      const diffX = startX - touch.clientX;
      const diffY = startY - touch.clientY;
      const threshold = 50;
      
      if (isVertical) {
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0) goToNext();
          else goToPrevious();
        }
      } else {
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) goToNext();
          else goToPrevious();
        }
      }
      
      isDragging = false;
      if (autoplay) startAutoplay();
    };

    carouselElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Pause autoplay on hover
    if (autoplay) {
      carouselElement.addEventListener('mouseenter', stopAutoplay);
      carouselElement.addEventListener('mouseleave', startAutoplay);
      carouselElement.addEventListener('focusin', stopAutoplay);
      carouselElement.addEventListener('focusout', startAutoplay);
    }

    // Initialize
    updateCarousel(0, false);
    if (autoplay) startAutoplay();
    
    // Set ARIA attributes
    carouselElement.setAttribute('role', 'region');
    carouselElement.setAttribute('aria-roledescription', 'carousel');
    if (!carouselElement.getAttribute('aria-label')) {
      carouselElement.setAttribute('aria-label', 'Carousel');
    }

    content.setAttribute('role', 'group');
    content.setAttribute('aria-live', autoplay ? 'off' : 'polite');

    items.forEach((item, index) => {
      item.setAttribute('role', 'group');
      item.setAttribute('aria-roledescription', 'slide');
      item.setAttribute('aria-label', `${index + 1} of ${items.length}`);
    });

    carouselElement.dataset.carouselInitialized = true;
    carouselElement.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  // Initialize existing carousels
  document.querySelectorAll('.carousel:not([data-carousel-initialized])').forEach(initCarousel);

  // Watch for new carousels
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('.carousel:not([data-carousel-initialized])')) {
            initCarousel(node);
          }
          node.querySelectorAll('.carousel:not([data-carousel-initialized])').forEach(initCarousel);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();