(() => {
  const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true';

  const initTabs = (root) => {
    if (root.dataset.tabsInitialized) return;

    let tablist;
    let tabs = [];
    const selectTab = (tabToSelect, focus = false) => {
      if (!tabs.includes(tabToSelect) || isDisabled(tabToSelect)) return;

      const activePanelId = tabToSelect.getAttribute('aria-controls');
      for (const tab of tabs) {
        const selected = tab === tabToSelect;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = panel.id !== activePanelId;
      }
      if (focus) tabToSelect.focus();
    };
    const refresh = () => {
      tablist = Array.from(root.querySelectorAll('[role="tablist"]')).find(list => list.closest('.tabs') === root);
      tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"]')) : [];
      const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab))
        || tabs.find(tab => !isDisabled(tab));
      if (selected) selectTab(selected);
    };

    refresh();
    if (!tablist) return;
    root.select = selectTab;
    root.refresh = refresh;

    const handleClick = (event) => {
      const clickedTab = event.target.closest('[role="tab"]');
      if (clickedTab) root.select(clickedTab);
    };

    const handleKeydown = (event) => {
      const currentTab = event.target;
      if (!tabs.includes(currentTab)) return;

      const enabledTabs = tabs.filter(tab => !isDisabled(tab));
      const currentIndex = enabledTabs.indexOf(currentTab);
      const orientation = tablist.getAttribute('aria-orientation') || 'horizontal';
      if (currentIndex === -1) return;

      const forward = getComputedStyle(tablist).direction === 'rtl' ? -1 : 1;
      let nextTab;
      if (event.key === 'ArrowRight' && orientation === 'horizontal') nextTab = enabledTabs[(currentIndex + forward + enabledTabs.length) % enabledTabs.length];
      if (event.key === 'ArrowLeft' && orientation === 'horizontal') nextTab = enabledTabs[(currentIndex - forward + enabledTabs.length) % enabledTabs.length];
      if (event.key === 'ArrowDown' && orientation === 'vertical') nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      if (event.key === 'ArrowUp' && orientation === 'vertical') nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      if (event.key === 'Home') nextTab = enabledTabs[0];
      if (event.key === 'End') nextTab = enabledTabs[enabledTabs.length - 1];
      if (!nextTab) return;

      event.preventDefault();
      root.select(nextTab, true);
    };

    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKeydown);

    root._destroy = () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('keydown', handleKeydown);
      delete root.refresh;
      delete root.select;
    };

    root.dataset.tabsInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('tabs', '.tabs:not([data-tabs-initialized])', initTabs);
  }
})();
