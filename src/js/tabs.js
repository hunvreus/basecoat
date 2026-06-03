(() => {
  const initTabs = (tabsComponent) => {
    const tablist = tabsComponent.querySelector('[role="tablist"]');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))).filter(Boolean);

    const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true';
    const getEnabledTabs = () => tabs.filter(tab => !isDisabled(tab));

    const selectTab = (tabToSelect) => {
      if (isDisabled(tabToSelect)) return;

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
      const enabledTabs = getEnabledTabs();
      const currentIndex = enabledTabs.indexOf(currentTab);
      const orientation = tablist.getAttribute('aria-orientation') || 'horizontal';
      if (currentIndex === -1) return;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation !== 'horizontal') return;
          nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
          break;
        case 'ArrowLeft':
          if (orientation !== 'horizontal') return;
          nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
          break;
        case 'ArrowDown':
          if (orientation !== 'vertical') return;
          nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
          break;
        case 'ArrowUp':
          if (orientation !== 'vertical') return;
          nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
          break;
        case 'Home':
          nextTab = enabledTabs[0];
          break;
        case 'End':
          nextTab = enabledTabs[enabledTabs.length - 1];
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

  if (window.basecoat) {
    window.basecoat.register('tabs', '.tabs:not([data-tabs-initialized])', initTabs);
  }
})();
