window.basecoat = window.basecoat || {};
window.basecoat.registerSidebar= function(Alpine) {
  if (Alpine.components && Alpine.components.sidebar) return;

  Alpine.data('sidebar', (initialOpen = true, initialMobileOpen = false) => ({
    open: window.innerWidth >= 768
      ? initialOpen
      : initialMobileOpen,

    init() {
      this.$nextTick(() => {
        this.$el.removeAttribute('data-uninitialized');
      });
    },

    $main: {
      '@sidebar:open.window'(e) { this.open = true },
      '@sidebar:close.window'(e) { this.open = false },
      '@sidebar:toggle.window'(e) { this.open = !this.open },
      '@click'(e) { if (e.target === this.$el) this.open = false },
      ':aria-hidden'() { return !this.open },
      ':inert'() { return !this.open }
    },
  }));
};