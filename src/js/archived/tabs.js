window.basecoat = window.basecoat || {};
window.basecoat.registerTabs = function(Alpine) {
  if (Alpine.components && Alpine.components.tabs) return;
  
  Alpine.data('tabs', (initialTabIndex = 0) => ({
    activeTabIndex: initialTabIndex,
    tabs: [],
    panels: [],

    init() {
      this.$nextTick(() => {
        this.tabs = Array.from(this.$el.querySelectorAll(':scope > [role=tablist] [role=tab]:not([disabled])'));
        this.panels = Array.from(this.$el.querySelectorAll(':scope > [role=tabpanel]'));
        if (this.tabs.length > 0) {
          this.selectTab(this.tabs[initialTabIndex], false);
        }
      });
    },
    nextTab() {
      if (this.tabs.length === 0) return;
      let newIndex = (this.activeTabIndex + 1) % this.tabs.length;
      this.selectTab(this.tabs[newIndex]);
    },
    prevTab() {
      if (this.tabs.length === 0) return;
      let newIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length;
      this.selectTab(this.tabs[newIndex]);
    },
    selectTab(tab, focus = true) {
      if (!tab || this.tabs.length === 0) return;

      this.tabs.forEach((t, index) => {
        const isSelected = t === tab;
        t.setAttribute('aria-selected', isSelected);
        t.setAttribute('tabindex', isSelected ? '0' : '-1');
        if (isSelected) {
          this.activeTabIndex = index;
          this.activeTab = t;
          if (focus) {
            t.focus();
          }
        }
      });

      const panelId = tab.getAttribute('aria-controls');
      if (!panelId) return;

      this.panels.forEach(panel => {
          panel.hidden = (panel.getAttribute('id') !== panelId);
      });
    },

    $tablist: {
      ['@click'](event) {
          const clickedTab = event.target.closest('[role=tab]');
          if (clickedTab) {
              this.selectTab(clickedTab);
          }
      },
      ['@keydown.arrow-right.prevent']() { this.nextTab() },
      ['@keydown.arrow-left.prevent']() { this.prevTab() },
    },
  }));
};