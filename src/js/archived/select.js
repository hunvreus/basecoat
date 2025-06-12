window.basecoat = window.basecoat || {};
window.basecoat.registerSelect = function(Alpine) {
  if (Alpine.components && Alpine.components.select) return;
  
  Alpine.data('select', (initialValue = null) => ({
    open: false,
    options: [],
    disabledOptions: [],
    focusedIndex: null,
    selectedLabel: null,
    selectedValue: null,
    query: '',
    
    init() {
      this.$nextTick(() => {
        this.options = Array.from(this.$el.querySelectorAll('[role=option]:not([aria-disabled])'));
        this.disabledOptions = Array.from(this.$el.querySelectorAll('[role=option][aria-disabled=true]'));
        if (this.options.length === 0) return;
        if (initialValue) {
          const option = this.options.find(opt => opt.getAttribute('data-value') === initialValue);
          this.selectOption(option, false);
          this.focusedIndex = this.options.indexOf(option);
        } else {
          this.selectOption(this.options[0], false);
        }
      });
    },
    focusOption() {
      if (this.options.length === 0) return;

      if (this.focusedIndex >= this.options.length) {
        this.focusedIndex = this.options.length - 1;
      } else if (this.focusedIndex < 0 || this.focusedIndex === null) {
        this.focusedIndex = 0;
      }
      this.options.forEach(opt => opt.removeAttribute('data-focus'));
      const option = this.options[this.focusedIndex];
      option.setAttribute('data-focus', '');
      option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    focusOnSelectedOption() {
      if (this.options.length === 0 || this.selectedValue === null) return;
      const option = this.options.find(opt => opt.getAttribute('data-value') === this.selectedValue);
      if (!option) return;
      this.focusedIndex = this.options.indexOf(option);
      this.focusOption();
    },
    moveOptionFocus(delta) {
      if (this.options.length === 0) return;

      if (!this.open) { 
        this.open = true;
        this.focusOnSelectedOption();
      } else {
        this.focusedIndex = this.focusedIndex === null
          ? 0
          : this.focusedIndex + delta;
      }
      this.focusOption();
    },
    handleOptionClick(event) {
      const option = event.target.closest('[role=option]');
      if (option && option.getAttribute('aria-disabled') !== 'true') {
        this.selectOption(option);
        this.open = false;
        this.$nextTick(() => this.$refs.trigger.focus());
      }
    },
    handleOptionMousemove(event) {
      const option = event.target.closest('[role=option]');
      if (option && option.getAttribute('aria-disabled') !== 'true') {
        this.focusedIndex = this.options.indexOf(option);
        this.focusOption();
      }
    },
    handleOptionEnter(event) {
      this.selectOption(this.options[this.focusedIndex]);
      this.open = !this.open;
    },
    selectValue(value, dispatch = true) {
      if (this.options.length === 0 || value == null) return;
      
      const option = this.options.find(opt => opt.getAttribute('data-value') === String(value));
      if (option) {
        this.selectOption(option, dispatch);
      }
    },
    selectOption(option, dispatch = true) {
      if (this.options.length === 0 || !option || option.disabled || option.getAttribute('data-value') == null) {
        return;
      }

      this.options.forEach(opt => {
        opt.setAttribute('aria-selected', opt === option);
      });
      this.selectedLabel = option.innerHTML;
      this.selectedValue = option.getAttribute('data-value');
      if (dispatch) {
        this.$dispatch('select:change', {
          value: this.selectedValue,
          label: this.selectedLabel
        });
        this.$dispatch('change'); 
      }
    },
    filterOptions(query) {
      if (query.length > 0) {
        this.disabledOptions.forEach(opt => { opt.setAttribute('aria-hidden', 'true'); });
      } else {
        this.disabledOptions.forEach(opt => { opt.removeAttribute('aria-hidden'); });
      }
      this.options.forEach(opt => {
        opt.removeAttribute('aria-hidden');
        if (opt.getAttribute('data-value') != null && !opt.innerHTML.toLowerCase().includes(query.toLowerCase())) {
          opt.setAttribute('aria-hidden', 'true');
        }
      });
    },

    $trigger: {
      '@click'() { this.open = !this.open; this.focusOnSelectedOption(); },
      '@keydown.escape.prevent'() {
        this.open = false;
        this.$refs.trigger.focus();
      },
      '@keydown.down.prevent'() { this.moveOptionFocus(+1); },
      '@keydown.up.prevent'() { this.moveOptionFocus(-1); },
      '@keydown.home.prevent'() { this.focusOption(0) },
      '@keydown.end.prevent'() { this.focusOption(this.options.length - 1) },
      '@keydown.enter.prevent'() {
        if (this.open) this.handleOptionEnter();
        else this.open = true;
      },
      ':aria-expanded'() { return this.open },
      'x-ref': 'trigger'
    },
    $content: {
      '@click'(e) { this.handleOptionClick(e) },
      '@mouseover'(e) { this.handleOptionMousemove(e) },
      ':aria-hidden'() { return !this.open },
      'x-cloak': ''
    },
    $filter: {
      '@input'(e) { this.filterOptions(e.target.value) },
      '@keydown.escape.prevent'() {
        this.open = false;
        this.$refs.trigger.focus();
      },
      '@keydown.down.prevent'() { this.moveOptionFocus(+1); },
      '@keydown.up.prevent'() { this.moveOptionFocus(-1); },
      '@keydown.home.prevent'() { this.focusOption(0) },
      '@keydown.end.prevent'() { this.focusOption(this.options.length - 1) },
      '@keydown.enter.prevent'() { this.handleOptionEnter() },
    }
  }));
};