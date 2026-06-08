(() => {
  const states = new WeakMap();

  const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true';

  const getElements = (root) => {
    const tablist = root.querySelector('[role="tablist"]');
    const tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"]')) : [];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))).filter(Boolean);
    return { tablist, tabs, panels };
  };

  const refreshTabs = (root) => {
    const state = states.get(root);
    if (!state) return;

    Object.assign(state, getElements(root));
    if (!state.tablist) return;

    const selected = state.tabs.find(tab => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab))
      || state.tabs.find(tab => !isDisabled(tab));
    if (selected) root.select(selected, false);
  };

  const initTabs = (root) => {
    if (root.dataset.tabsInitialized) return;

    const state = {};
    states.set(root, state);
    root.refresh = () => refreshTabs(root);

    const selectTab = (tabToSelect, focus = false) => {
      if (!tabToSelect || isDisabled(tabToSelect)) return;

      state.tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = true;
      });

      tabToSelect.setAttribute('aria-selected', 'true');
      tabToSelect.setAttribute('tabindex', '0');
      const activePanel = document.getElementById(tabToSelect.getAttribute('aria-controls'));
      if (activePanel) activePanel.hidden = false;
      if (focus) tabToSelect.focus();
    };

    root.select = selectTab;
    refreshTabs(root);
    if (!state.tablist) {
      states.delete(root);
      delete root.refresh;
      delete root.select;
      return;
    }

    const handleClick = (event) => {
      const clickedTab = event.target.closest('[role="tab"]');
      if (clickedTab) root.select(clickedTab);
    };

    const handleKeydown = (event) => {
      const currentTab = event.target;
      if (!state.tabs.includes(currentTab)) return;

      const enabledTabs = state.tabs.filter(tab => !isDisabled(tab));
      const currentIndex = enabledTabs.indexOf(currentTab);
      const orientation = state.tablist.getAttribute('aria-orientation') || 'horizontal';
      if (currentIndex === -1) return;

      let nextTab;
      if (event.key === 'ArrowRight' && orientation === 'horizontal') nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      if (event.key === 'ArrowLeft' && orientation === 'horizontal') nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      if (event.key === 'ArrowDown' && orientation === 'vertical') nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      if (event.key === 'ArrowUp' && orientation === 'vertical') nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      if (event.key === 'Home') nextTab = enabledTabs[0];
      if (event.key === 'End') nextTab = enabledTabs[enabledTabs.length - 1];
      if (!nextTab) return;

      event.preventDefault();
      root.select(nextTab, true);
    };

    state.tablist.addEventListener('click', handleClick);
    state.tablist.addEventListener('keydown', handleKeydown);

    root._destroy = () => {
      state.tablist.removeEventListener('click', handleClick);
      state.tablist.removeEventListener('keydown', handleKeydown);
      states.delete(root);
      delete root.refresh;
      delete root.select;
    };

    root.dataset.tabsInitialized = 'true';
    root.dispatchEvent(new CustomEvent('basecoat:initialized'));
  };

  if (window.basecoat) {
    window.basecoat.register('tabs', {
      selector: '.tabs:not([data-tabs-initialized])',
      init: initTabs,
      refresh: refreshTabs,
    });
  }
})();
