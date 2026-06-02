(() => {
  let tabsInitialized = false;

  const initTabs = (tabsComponent) => {
    const tablist = tabsComponent.querySelector('[role="tablist"]');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))).filter(Boolean);

    const selectTab = (tabToSelect) => {
      tabs.forEach((tab, index) => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        if (panels[index]) panels[index].hidden = true;
      });

      tabToSelect.setAttribute('aria-selected', 'true');
      tabToSelect.setAttribute('tabindex', '0');
      const activePanel = document.getElementById(tabToSelect.getAttribute('aria-controls'));
      if (activePanel) activePanel.hidden = false;
    };

    tablist.addEventListener('click', (event) => {
      const clickedTab = event.target.closest('[role="tab"]');
      if (clickedTab) selectTab(clickedTab);
    });

    tablist.addEventListener('keydown', (event) => {
      const currentTab = event.target;
      if (!tabs.includes(currentTab)) return;

      let nextTab;
      const currentIndex = tabs.indexOf(currentTab);

      switch (event.key) {
        case 'ArrowRight':
          nextTab = tabs[(currentIndex + 1) % tabs.length];
          break;
        case 'ArrowLeft':
          nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
          break;
        case 'Home':
          nextTab = tabs[0];
          break;
        case 'End':
          nextTab = tabs[tabs.length - 1];
          break;
        default:
          return;
      }

      event.preventDefault();
      selectTab(nextTab);
      nextTab.focus();
    });

    tabsComponent.dataset.tabsInitialized = true;
    tabsComponent.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  // Watch for tab children changes and reinitialize when tabs change
  const watchTabsChildren = (tabsComponent) => {
    const tablist = tabsComponent.querySelector('[role="tablist"]');
    if (!tablist) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target.getAttribute('role') === 'tablist') {
          const hasTabsChanges = mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
          if (hasTabsChanges) {
            tabsComponent.removeAttribute('data-tabs-initialized');
            initTabs(tabsComponent);
          }
        }
      });
    });

    observer.observe(tablist, { childList: true, subtree: false });
  };

  const initAllTabs = () => {
    document.querySelectorAll('.tabs:not([data-tabs-initialized])').forEach((tabsComponent) => {
      initTabs(tabsComponent);
      watchTabsChildren(tabsComponent);
    });
    tabsInitialized = true;
  };

  if (window.basecoat) {
    window.basecoat.register('tabs', '.tabs:not([data-tabs-initialized])', (el) => {
      initTabs(el);
      watchTabsChildren(el);
    });

    // Override reinit to also re-watch for children changes
    const originalInit = window.basecoat.init;
    window.basecoat.init = (componentName) => {
      if (componentName === 'tabs') {
        document.querySelectorAll('[data-tabs-initialized]').forEach((el) => {
          el.removeAttribute('data-tabs-initialized');
          initTabs(el);
          watchTabsChildren(el);
        });
      } else {
        originalInit?.(componentName);
      }
    };
  }

  document.addEventListener('basecoat:initialized', () => {
    if (!tabsInitialized) initAllTabs();
  });

  if (document.readyState !== 'loading') {
    initAllTabs();
  } else {
    document.addEventListener('DOMContentLoaded', initAllTabs);
  }
})();