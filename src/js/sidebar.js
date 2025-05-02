window.basecoat = window.basecoat || {};
window.basecoat.registerSidebar= function(Alpine) {
  if (Alpine.components && Alpine.components.sidebar) return;

  Alpine.data('sidebar', (initialOpen = true) => ({
    id: null,
    open: true,

    init() {
      this.id = this.$el.id;
      this.open = initialOpen;
    },

    $main: {
      '@sidebar:open.window'(e) { if (!this.id || (e.detail && e.detail.id === this.id)) this.open = true },
      '@sidebar:close.window'(e) { if (!this.id || (e.detail && e.detail.id === this.id)) this.open = false },
      '@sidebar:toggle.window'(e) { if (!this.id || (e.detail && e.detail.id === this.id)) this.open = !this.open },
      '@click'(e) { if (e.target === this.$el) this.open = false },
      ':aria-hidden'() { return !this.open },
      ':inert'() { return !this.open },
    },
  }));
};