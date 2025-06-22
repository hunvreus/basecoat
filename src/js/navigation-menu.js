class NavigationMenu {
  constructor(element) {
    this.element = element;
    this.triggers = element.querySelectorAll('.navigation-menu-trigger');
    this.contents = element.querySelectorAll('.navigation-menu-content');
    this.viewport = element.querySelector('.navigation-menu-viewport');
    this.indicator = element.querySelector('.navigation-menu-indicator');
    this.activeContent = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupKeyboardNavigation();
    this.setupFocusTrapping();
  }
  
  bindEvents() {
    this.triggers.forEach((trigger, index) => {
      const content = this.contents[index];
      
      // Mouse events
      trigger.addEventListener('mouseenter', () => this.showContent(trigger, content));
      trigger.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, trigger, content));
      
      // Click events
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleContent(trigger, content);
      });
      
      // Content mouse events
      if (content) {
        content.addEventListener('mouseenter', () => this.keepContentOpen(content));
        content.addEventListener('mouseleave', () => this.hideContent());
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        this.hideContent();
      }
    });
  }
  
  setupKeyboardNavigation() {
    this.element.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          this.hideContent();
          break;
        case 'ArrowDown':
          if (this.activeContent) {
            e.preventDefault();
            this.focusFirstLink();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          this.navigateHorizontally(e);
          break;
      }
    });
  }
  
  setupFocusTrapping() {
    this.contents.forEach(content => {
      const links = content.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      
      links.forEach((link, index) => {
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && index === 0) {
              e.preventDefault();
              this.focusTrigger(content);
            } else if (!e.shiftKey && index === links.length - 1) {
              e.preventDefault();
              this.hideContent();
            }
          }
        });
      });
    });
  }
  
  showContent(trigger, content) {
    if (!content) return;
    
    clearTimeout(this.hideTimeout);
    
    // Hide other contents
    this.contents.forEach(c => {
      if (c !== content) {
        this.setContentState(c, false);
      }
    });
    
    // Reset trigger states
    this.triggers.forEach(t => {
      t.setAttribute('data-state', t === trigger ? 'open' : 'closed');
      t.setAttribute('aria-expanded', t === trigger ? 'true' : 'false');
    });
    
    // Show current content
    this.setContentState(content, true);
    this.activeContent = content;
    this.isOpen = true;
    
    // Update viewport
    this.updateViewport(content);
    
    // Position indicator
    this.positionIndicator(trigger);
    
    // Dispatch event
    this.dispatchEvent('basecoat:navigation-menu:open', { trigger, content });
  }
  
  hideContent() {
    this.hideTimeout = setTimeout(() => {
      if (this.activeContent) {
        this.setContentState(this.activeContent, false);
        this.activeContent = null;
        this.isOpen = false;
        
        // Reset trigger states
        this.triggers.forEach(trigger => {
          trigger.setAttribute('data-state', 'closed');
          trigger.setAttribute('aria-expanded', 'false');
        });
        
        // Hide viewport and indicator
        if (this.viewport) {
          this.viewport.setAttribute('data-state', 'closed');
        }
        if (this.indicator) {
          this.indicator.setAttribute('data-state', 'hidden');
        }
        
        // Dispatch event
        this.dispatchEvent('basecoat:navigation-menu:close');
      }
    }, 150);
  }
  
  toggleContent(trigger, content) {
    if (this.activeContent === content) {
      this.hideContent();
    } else {
      this.showContent(trigger, content);
    }
  }
  
  keepContentOpen(content) {
    clearTimeout(this.hideTimeout);
  }
  
  handleMouseLeave(e, trigger, content) {
    const relatedTarget = e.relatedTarget;
    if (!content || !content.contains(relatedTarget)) {
      this.hideContent();
    }
  }
  
  setContentState(content, isOpen) {
    content.setAttribute('data-state', isOpen ? 'open' : 'closed');
    content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    
    if (isOpen) {
      content.style.display = 'block';
    } else {
      setTimeout(() => {
        if (content.getAttribute('data-state') === 'closed') {
          content.style.display = 'none';
        }
      }, 200);
    }
  }
  
  updateViewport(content) {
    if (!this.viewport) return;
    
    this.viewport.setAttribute('data-state', 'open');
    
    // Set viewport dimensions based on content
    const rect = content.getBoundingClientRect();
    this.viewport.style.setProperty('--radix-navigation-menu-viewport-width', `${rect.width}px`);
    this.viewport.style.setProperty('--radix-navigation-menu-viewport-height', `${rect.height}px`);
  }
  
  positionIndicator(trigger) {
    if (!this.indicator) return;
    
    this.indicator.setAttribute('data-state', 'visible');
    
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = this.element.getBoundingClientRect();
    const offset = triggerRect.left - menuRect.left + (triggerRect.width / 2);
    
    this.indicator.style.left = `${offset}px`;
  }
  
  focusFirstLink() {
    if (!this.activeContent) return;
    
    const firstLink = this.activeContent.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    if (firstLink) {
      firstLink.focus();
    }
  }
  
  focusTrigger(content) {
    const index = Array.from(this.contents).indexOf(content);
    if (index !== -1 && this.triggers[index]) {
      this.triggers[index].focus();
    }
  }
  
  navigateHorizontally(e) {
    e.preventDefault();
    
    const currentTrigger = document.activeElement;
    const currentIndex = Array.from(this.triggers).indexOf(currentTrigger);
    
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (e.key === 'ArrowLeft') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : this.triggers.length - 1;
    } else {
      nextIndex = currentIndex < this.triggers.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextTrigger = this.triggers[nextIndex];
    const nextContent = this.contents[nextIndex];
    
    nextTrigger.focus();
    
    if (this.isOpen) {
      this.showContent(nextTrigger, nextContent);
    }
  }
  
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: { navigationMenu: this, ...detail },
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }
}

// Auto-initialize navigation menus
function initNavigationMenus() {
  const menus = document.querySelectorAll('.navigation-menu:not([data-navigation-menu-initialized])');
  
  menus.forEach(menu => {
    new NavigationMenu(menu);
    menu.setAttribute('data-navigation-menu-initialized', 'true');
    
    // Dispatch initialization event
    menu.dispatchEvent(new CustomEvent('basecoat:initialized', {
      detail: { component: 'navigation-menu' },
      bubbles: true
    }));
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigationMenus);
} else {
  initNavigationMenus();
}

// Re-initialize when new content is added
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.matches('.navigation-menu:not([data-navigation-menu-initialized])')) {
          new NavigationMenu(node);
          node.setAttribute('data-navigation-menu-initialized', 'true');
        }
        
        const nestedMenus = node.querySelectorAll('.navigation-menu:not([data-navigation-menu-initialized])');
        nestedMenus.forEach(menu => {
          new NavigationMenu(menu);
          menu.setAttribute('data-navigation-menu-initialized', 'true');
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});