import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const runtime = fs.readFileSync(new URL('../../src/js/basecoat.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../../src/js/drawer.js', import.meta.url), 'utf8');

// Model native dialog state and timers; execute the actual runtime and controller.
function setup(className, reducedMotion = false) {
  const timers = new Map();
  let timerId = 0;
  const dialog = Object.assign(new EventTarget(), {
    nodeType: 1,
    dataset: {},
    open: true,
    returnValue: '',
    firstElementChild: {},
    close(value) {
      this.open = false;
      this.returnValue = value;
    },
    hasAttribute(name) {
      return name === 'data-drawer-initialized' && !!this.dataset.drawerInitialized;
    },
    removeAttribute(name) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[key];
    },
    matches(selector) {
      return selector.includes(`.${className}:not([data-drawer-initialized])`) && !this.dataset.drawerInitialized;
    },
  });
  const document = {
    addEventListener() {},
    querySelectorAll(selector) {
      return dialog.matches(selector) || (selector === '[data-basecoat-component="drawer"]' && dialog.dataset.basecoatComponent === 'drawer') ? [dialog] : [];
    },
  };
  const window = {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    matchMedia: () => ({ matches: reducedMotion }),
  };
  const context = vm.createContext({
    window, document, console, CustomEvent,
    Node: { ELEMENT_NODE: 1 },
    getComputedStyle: () => ({ transitionDuration: '0.2s', transitionDelay: '0s' }),
  });
  vm.runInContext(runtime, context);
  vm.runInContext(source, context);
  window.basecoat.init('drawer');
  const flush = () => {
    for (const [id, callback] of timers) {
      timers.delete(id);
      callback();
    }
  };
  return { dialog, basecoat: window.basecoat, flush };
}

for (const className of ['drawer', 'sheet']) {
  test(`${className}: forced initialization finishes a pending close`, () => {
    const { dialog, basecoat, flush } = setup(className);
    dialog.close('saved');
    assert.equal(dialog.open, true, 'animation keeps the dialog open until it finishes');
    basecoat.init('drawer', { force: true });
    assert.equal(dialog.open, false);
    assert.equal(dialog.returnValue, 'saved');
    assert.equal(dialog.dataset.closing, undefined);
    dialog.open = true;
    flush();
    assert.equal(dialog.open, true, 'the cancelled timer must not close a reopened dialog');
    dialog.close('second');
    flush();
    assert.equal(dialog.open, false);
    assert.equal(dialog.returnValue, 'second');
  });

  test(`${className}: ordinary reinitialization preserves an open dialog`, () => {
    const { dialog, basecoat } = setup(className);
    basecoat.initAll({ force: true });
    assert.equal(dialog.open, true);
    assert.equal(dialog.dataset.closing, undefined);
  });

  test(`${className}: reduced motion closes immediately`, () => {
    const { dialog, basecoat, flush } = setup(className, true);
    dialog.close('saved');
    basecoat.initAll({ force: true });
    flush();
    assert.equal(dialog.open, false);
    assert.equal(dialog.returnValue, 'saved');
    assert.equal(dialog.dataset.closing, undefined);
  });
}
