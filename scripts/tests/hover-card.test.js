import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../src/js/hover-card.js', import.meta.url), 'utf8');

test('Hover Card opens after its delay, stays open while entered, and closes on Escape', () => {
  const options = new Map();
  const trigger = Object.assign(new EventTarget(), {
    getAttribute: name => options.get(name) ?? null,
    matches: selector => selector === ':focus-visible',
  });
  const attributes = new Map();
  const panel = {
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: name => attributes.get(name),
  };
  const root = Object.assign(new EventTarget(), {
    dataset: {},
    querySelector: selector => selector.includes('data-popover') ? panel : trigger,
    contains: element => element === root || element === trigger || element === panel,
  });
  const document = new EventTarget();
  let pending;
  vm.runInNewContext(source, {
    window: { basecoat: { register: (_name, _selector, init) => init(root) } },
    document, CustomEvent, AbortController,
    setTimeout: (callback, delay) => (pending = { callback, delay }),
    clearTimeout: () => { pending = null; },
  });
  const mouse = type => Object.assign(new Event(type), { pointerType: 'mouse' });
  root.dispatchEvent(mouse('pointerenter'));
  assert.equal(pending.delay, 600);
  pending.callback();
  assert.equal(panel.getAttribute('aria-hidden'), 'false');
  assert.notEqual(panel.inert, true, 'the visible panel must remain hit-testable');
  root.dispatchEvent(mouse('pointerleave'));
  assert.equal(pending.delay, 300);
  root.dispatchEvent(mouse('pointerenter'));
  assert.equal(pending, null);
  document.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }));
  assert.equal(panel.getAttribute('aria-hidden'), 'true');
  root.dispatchEvent(mouse('pointerleave'));
  options.set('data-delay', '10');
  root.dispatchEvent(mouse('pointerenter'));
  assert.equal(pending.delay, 10);
  root.dispatchEvent(mouse('pointerleave'));
  options.set('data-delay', '999999999999');
  root.dispatchEvent(mouse('pointerenter'));
  assert.equal(pending.delay, 600, 'overflowing delays fall back to the default');
});
