window.basecoat = window.basecoat || {};
window.basecoat.registerPopover = function(Alpine) {
  if (Alpine.components && Alpine.components.popover) return;

  Alpine.data('popover', () => ({
    open: false,

    $trigger: {
      '@click'() { this.open = !this.open },
      '@keydown.escape.prevent'() {
        this.open = false;
        this.$refs.trigger.focus();
      },
      ':aria-expanded'() { return this.open },
      'x-ref': 'trigger'
    },
    $content: {
      '@keydown.escape.prevent'() {
        this.open = false;
        this.$refs.trigger.focus();
      },
      ':aria-hidden'() { return !this.open },
      'x-cloak': ''
    },
  }));
};
