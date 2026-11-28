import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../src/js/popover.js', import.meta.url), 'utf8');

test('Popover autofocus runs on open and leaves subsequent focus changes alone', () => {
  let focused;
  const control = () => Object.assign(new EventTarget(), {
    getAttribute(name) { return this[name]; },
    setAttribute(name, value) { this[name] = value; },
    focus() { focused = this; },
  });
  const trigger = control(), content = control(), input = control(), outside = control();
  content.querySelector = () => input;
  const root = Object.assign(new EventTarget(), {
    dataset: {},
    closest: () => null,
    querySelector: selector => selector === ':scope > button' ? trigger : content,
    contains: element => [root, trigger, content, input].includes(element),
  });
  trigger.setAttribute('aria-expanded', 'false');
  const document = new EventTarget();
  const basecoat = { register: (_name, _selector, init) => init(root) };
  let afterTab;
  vm.runInNewContext(source, {
    window: { basecoat }, document, CustomEvent,
    requestAnimationFrame(callback) { afterTab = callback; },
  });
  const tabTo = target => {
    root.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Tab' }));
    target.focus();
    document.activeElement = target;
    afterTab();
  };

  trigger.dispatchEvent(new Event('click'));
  assert.equal(focused, input);
  tabTo(trigger);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  tabTo(outside);
  content.dispatchEvent(new Event('transitionend'));
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, outside);

  trigger.dispatchEvent(new Event('click'));
  outside.focus();
  document.dispatchEvent(new Event('click'));
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, outside);

  trigger.dispatchEvent(new Event('click'));
  root.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }));
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, trigger);
});
