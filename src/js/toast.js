window.basecoat = window.basecoat || {};
window.basecoat.registerToast = function(Alpine) {
  if (Alpine.components && Alpine.components.toast) return;

  Alpine.store('toaster', { isPaused: false });
  Alpine.data('toast', (config={}) => ({
    config: config,
    open: false,
    timeoutDuration: null,
    timeoutId: null,

    init() {
      this.timeoutDuration = config.duration || (config.category === 'error' ? 5000 : 3000);
      this.timeoutId = setTimeout(() => { this.close() }, this.timeoutDuration);
      this.open = true;
      this.$watch('$store.toaster.isPaused', (isPaused) => {
        if (!this.open) return;
        if (isPaused) {
          this.pauseTimeout();
        } else {
          this.resumeTimeout();
        }
      });
    },
    pauseTimeout() {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    },
    resumeTimeout(index) {
      if (this.open && this.timeoutId === null) {
        this.timeoutId = setTimeout(() => { this.close() }, this.timeoutDuration);
      }
    },
    close() {
      this.pauseTimeout();
      this.open = false;
      this.$el.blur();
    },

    $toastBindings: {
      ['@mouseenter']() { this.$store.toaster.isPaused = true },
      ['@mouseleave']() { this.$store.toaster.isPaused = false },
      ['@keydown.escape.prevent']() { this.close() },
      [':aria-hidden']() { return !this.open }
    },
  }));

  Alpine.magic('toast', (el) => (config, toasterId='toaster') => {
    const toaster = document.getElementById(toasterId);
    const template = document.getElementById('toast-template');

    if (!toaster) {
      console.error(`Toaster container with id #${targetId} not found.`);
      return;
    }
    if (!template) {
      console.error('Toast template with id #toast-template not found.');
      return;
    }

    const clone = template.content.firstElementChild.cloneNode(true);

    clone.setAttribute('x-data', `toast(${JSON.stringify(config)})`);
    clone.removeAttribute('id'); 

    toaster.appendChild(clone);
  });
};