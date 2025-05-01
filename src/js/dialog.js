window.basecoat = window.basecoat || {};
window.basecoat.registerDialog = function(Alpine) {
  if (Alpine.components && Alpine.components.dialog) return;

  Alpine.data('dialog', (initialOpen = false, initialCloseOnOverlayClick = true) => ({
    id: null,
    open: false,
    closeOnOverlayClick: true,

    init() {
      this.id = this.$el.id;
      if (!this.id) {
        console.warn('Dialog component initialized without an `id`. This may cause issues with event targeting and accessibility.');
      }
      this.open = initialOpen;
      this.closeOnOverlayClick = initialCloseOnOverlayClick;
    },
    show() {
      if (!this.open) {
        this.open = true;
        this.$nextTick(() => {
          this.$el.dispatchEvent(new CustomEvent('dialog:opened', { bubbles: true, detail: { id: this.id } }));
          setTimeout(() => {
            const focusTarget = this.$refs.focusOnOpen || this.$el.querySelector('[role="dialog"]');
            if (focusTarget) focusTarget.focus();
          }, 50);
        });
      }
    },
    hide() {
      if (this.open) {
        this.open = false;
        this.$nextTick(() => {
          this.$el.dispatchEvent(new CustomEvent('dialog:closed', { bubbles: true, detail: { id: this.id } }));
        });
      }
    },

    $main: {
      '@dialog:open.window'(e) { if (e.detail && e.detail.id === this.id) this.show() },
      '@dialog:close.window'(e) { if (e.detail && e.detail.id === this.id) this.hide() },
      '@keydown.escape.window'() { this.open && this.hide(); },
    },
    $trigger: {
      '@click'() { this.show() },
      ':aria-expanded'() { return this.open }
    },
    $content: {
      ':inert'() { return !this.open },
      '@click.self'() { if (this.closeOnOverlayClick) this.hide() },
      'x-cloak': ''
    }
  }));
};