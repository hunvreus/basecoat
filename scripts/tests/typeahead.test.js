import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

function setup(component, markup) {
  const { window, document } = parseHTML(`<html><body>${markup}</body></html>`);
  Object.defineProperty(document, 'activeElement', { value: document.body, writable: true });
  window.HTMLElement.prototype.focus = function () { document.activeElement = this; };
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 0, bottom: 10 });
  const root = document.querySelector(`#${component}`);
  window.basecoat = { register: (_name, options) => options.init(root) };
  vm.runInNewContext(fs.readFileSync(new URL(`../../src/js/${component}.js`, import.meta.url), 'utf8'), {
    window, document, CustomEvent: window.CustomEvent, requestAnimationFrame: callback => callback(),
  });
  const press = (target, key, extra = {}) => {
    const event = new window.Event('keydown', { bubbles: true, cancelable: true });
    Object.assign(event, { key, ...extra });
    target.dispatchEvent(event);
  };
  return { document, root, press };
}

const items = `<div role="option" data-value="apple">Apple</div>
<div role="option" aria-disabled="true">Berry disabled</div>
<div role="option" data-value="banana">Banana</div>
<div role="option" data-value="blueberry">Blueberry</div>
<div role="option" data-value="blackberry">Blackberry</div>`;

function active(document, element) {
  return document.getElementById(element.getAttribute('aria-activedescendant'))?.textContent.trim();
}

test('Select typeahead skips disabled options and exposes the active option', () => {
  const { document, root, press } = setup('select', `<div id="select" class="select" data-placeholder="Choose">
    <button aria-expanded="false"><span>Choose</span></button><div data-popover aria-hidden="true"><div role="listbox">${items}</div></div><input type="hidden">
  </div>`);
  const trigger = root.querySelector('button');
  assert.equal(trigger.getAttribute('role'), 'combobox');
  root.open();
  press(trigger, 'b');
  assert.equal(active(document, trigger), 'Banana');
  press(trigger, 'b');
  assert.equal(active(document, trigger), 'Blueberry');
  press(trigger, 'Enter');
  assert.equal(root.value, 'blueberry');
  assert.equal(trigger.getAttribute('aria-activedescendant'), null);
  root.value = '';
  root.open();
  press(trigger, 'b');
  press(trigger, 'l');
  assert.equal(active(document, trigger), 'Blueberry');
  press(trigger, 'Escape');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('Dropdown Menu typeahead identifies the active item on the focused menu', () => {
  const menuItems = items.replaceAll('role="option"', 'role="menuitem"');
  const { document, root, press } = setup('dropdown-menu', `<div id="dropdown-menu" class="dropdown-menu">
    <button aria-expanded="false">Menu</button><div data-popover aria-hidden="true"><div role="menu">${menuItems}</div></div>
  </div>`);
  const trigger = root.querySelector('button'), menu = root.querySelector('[role="menu"]');
  trigger.focus();
  root.open();
  assert.equal(document.activeElement, menu);
  assert.equal(active(document, menu), 'Apple');
  press(menu, 'b');
  assert.equal(active(document, menu), 'Banana');
  press(menu, 'b');
  assert.equal(active(document, menu), 'Blueberry');
  press(menu, 'Escape');
  assert.equal(document.activeElement, trigger);
  assert.equal(menu.getAttribute('aria-activedescendant'), null);
  root.open();
  press(menu, 'b');
  press(menu, 'l');
  assert.equal(active(document, menu), 'Blueberry');
  press(menu, 'Tab');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});
