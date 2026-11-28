import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../src/js/navigation-menu.js', import.meta.url), 'utf8');

test('hovering a top-level link closes an open menu and cancels pending opens', () => {
  const element = () => {
    const attrs = new Map();
    return Object.assign(new EventTarget(), {
      dataset: {}, style: {},
      getClientRects: () => [{ width: 100 }], closest: () => null,
      getAttribute: name => attrs.get(name),
      setAttribute: (name, value) => attrs.set(name, value),
      getBoundingClientRect: () => ({ left: 0, right: 100 }),
    });
  };
  const trigger = element(), link = element(), panel = element(), viewport = element();
  trigger.setAttribute('aria-controls', 'panel');
  trigger.focus = () => {};
  panel.parentElement = viewport;
  panel.offsetWidth = 100;
  panel.offsetHeight = 100;
  const list = { querySelectorAll: selector => selector.includes('button[aria-controls]') ? [trigger] : selector.includes(':is(button, a[href])') ? [trigger, link] : [link] };
  let focused = null;
  const item = element();
  item.focus = () => { focused = item; };
  const second = element();
  second.focus = () => { focused = second; };
  panel.querySelectorAll = () => [item, second];
  panel.contains = node => node === item || node === second;
  trigger.getBoundingClientRect = () => ({ left: 950, right: 1000 });
  const root = Object.assign(element(), {
    querySelector: selector => selector === ':scope > ul' ? list : viewport,
    contains: node => [root, list, trigger, link, viewport, panel].includes(node),
  });
  const document = Object.assign(new EventTarget(), { activeElement: trigger, getElementById: () => panel, documentElement: { clientWidth: 1024 } });
  let pending;
  const frames = [];
  const window = Object.assign(new EventTarget(), { basecoat: { register: (_name, _selector, init) => init(root) } });
  vm.runInNewContext(source, {
    window,
    document, CustomEvent, AbortController,
    getComputedStyle: () => ({ direction: 'ltr', visibility: 'visible' }),
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: callback => (pending = callback),
    clearTimeout: callback => { if (pending === callback) pending = null; },
  });
  const enter = target => target.dispatchEvent(Object.assign(new Event('pointerenter'), { pointerType: 'mouse' }));

  enter(trigger);
  assert.ok(pending);
  enter(link);
  assert.equal(pending, null, 'a pending hover open must be canceled');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');

  enter(trigger);
  pending();
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(viewport.style.left, '916px', 'the panel stays inside the viewport');
  document.documentElement.clientWidth = 500;
  window.dispatchEvent(new Event('resize'));
  assert.equal(viewport.style.left, '392px', 'the panel repositions on resize');
  enter(link);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(viewport.getAttribute('aria-hidden'), 'true');

  const key = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowDown' });
  Object.defineProperty(key, 'target', { value: trigger });
  root.dispatchEvent(key);
  assert.equal(focused, null, 'focus waits for the panel to become visible');
  while (frames.length) for (const frame of frames.splice(0)) frame();
  assert.equal(focused, item, 'ArrowDown focuses the first panel link');
  const arrow = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowDown' });
  Object.defineProperty(arrow, 'target', { value: item });
  root.dispatchEvent(arrow);
  assert.equal(focused, second, 'ArrowDown moves to the next panel link');
  root.dispatchEvent(arrow);
  assert.equal(focused, second);
  const back = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowUp' });
  Object.defineProperty(back, 'target', { value: second });
  root.dispatchEvent(back);
  assert.equal(focused, item, 'ArrowUp moves to the previous panel link');
  const escape = Object.assign(new Event('keydown', { cancelable: true }), { key: 'Escape' });
  root.dispatchEvent(escape);
  const enterKey = Object.assign(new Event('keydown', { cancelable: true }), { key: 'Enter' });
  Object.defineProperty(enterKey, 'target', { value: trigger });
  focused = null;
  root.dispatchEvent(enterKey);
  while (frames.length) for (const frame of frames.splice(0)) frame();
  assert.equal(focused, item, 'Enter opens the panel and focuses its first link');
});
