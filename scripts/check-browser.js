// Run after npm run build. Set BASECOAT_CHROMIUM_CDP to reuse an existing browser.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const asset = name => fileURLToPath(new URL(`../dist/${name}`, import.meta.url));
const expanded = locator => locator.getAttribute('aria-expanded');
async function load(page, markup, ...components) {
  await page.goto('about:blank');
  await page.setContent(markup);
  await page.addStyleTag({ path: asset('basecoat-sera.cdn.min.css') });
  for (const component of ['basecoat', ...components]) {
    await page.addScriptTag({ path: asset(`js/${component}.min.js`) });
  }
  await page.evaluate(() => basecoat.initAll());
}

async function combobox(page) {
  await load(page, `<div class="combobox"><div class="input-group">
    <input role="combobox" aria-expanded="false"><button aria-haspopup="listbox">Toggle</button></div>
    <div data-popover aria-hidden="true"><div role="listbox"><div role="group"><span>Fruit</span>
    <div role="option" data-value="a">Apple</div></div></div></div><input type="hidden"></div>
    <input id="outside">`, 'combobox');
  const input = page.getByRole('combobox');
  await input.click();
  await page.getByText('Fruit', { exact: true }).click();
  assert.equal(await input.evaluate(el => document.activeElement === el), true);
  await page.getByText('Toggle').click();
  assert.equal(await expanded(input), 'false');
  await input.click();
  await page.locator('#outside').focus();
  assert.equal(await expanded(input), 'false');
}

async function multipleSelection(page) {
  await load(page, `<div class="combobox"><input role="combobox" aria-expanded="false">
    <div data-popover aria-hidden="true"><div role="listbox" aria-multiselectable="true">
    <div role="option" data-value="a">Apple</div><div role="option" data-value="b">Berry</div>
    </div></div><input type="hidden" value='["a"]'></div>`, 'combobox');
  const input = page.getByRole('combobox');
  await input.click();
  await page.getByRole('button', { name: 'Remove Apple' }).focus();
  await page.getByRole('option', { name: 'Berry' }).click();
  assert.deepEqual(JSON.parse(await page.locator('input[type=hidden]').inputValue()), ['a', 'b']);
  assert.equal(await expanded(input), 'true');
  assert.equal(await input.evaluate(el => el === document.activeElement), true);
  const chip = page.getByRole('button', { name: 'Remove Berry' });
  await chip.focus();
  await page.keyboard.press('Enter');
  assert.deepEqual(JSON.parse(await page.locator('input[type=hidden]').inputValue()), ['a']);
  assert.equal(await expanded(input), 'true');
}

async function navigation(page) {
  await load(page, `<nav class="navigation-menu"><ul><li><button aria-controls="first">First</button></li>
    <li hidden><button aria-controls="hidden-panel">Hidden</button></li><li><a href="#end">Last</a></li></ul>
    <div data-popover><section id="first"><a href="#one">A link with several words</a></section>
    <section id="hidden-panel"><a href="#two">Two</a></section></div></nav>`, 'navigation-menu');
  const first = page.getByText('First', { exact: true });
  for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((el, direction) => { el.dir = direction; }, dir);
    await first.focus();
    await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Last');
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement.closest('#first'));
    assert.equal(await page.locator('#first a').evaluate(el => el.getClientRects().length), 1);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Last');
    assert.equal(await expanded(first), 'false');
  }
}

async function nestedEscape(page) {
  await load(page, `<dialog><input id="outside-nav"><nav class="navigation-menu"><ul><li><button aria-controls="panel">Menu</button></li></ul>
    <div data-popover><section id="panel"><div class="select"><button aria-expanded="false"><span>Pick</span></button>
    <div data-popover aria-hidden="true"><div role="listbox"><div role="option" data-value="a">A</div></div></div>
    <input type="hidden"></div></section></div></nav></dialog>`, 'navigation-menu', 'select');
  await page.locator('dialog').evaluate(el => el.showModal());
  const menu = page.getByText('Menu', { exact: true });
  await menu.focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => document.activeElement.closest('.select'));
  await page.keyboard.press('ArrowDown');
  assert.equal(await expanded(page.locator('.select > button')), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await expanded(page.locator('.select > button')), 'false');
  assert.equal(await expanded(menu), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await expanded(menu), 'false');
  assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  await page.locator('dialog').evaluate(el => el.showModal());
  await page.locator('#outside-nav').focus();
  await menu.click();
  await page.keyboard.press('Escape');
  assert.equal(await expanded(menu), 'false');
  assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
}

async function hoverCard(page) {
  await load(page, `<div class="popover"><button aria-expanded="false">Outer</button><div data-popover aria-hidden="true">
    <div class="hover-card"><button data-delay="0" data-close-delay="0">Preview</button>
    <div data-popover aria-hidden="true"><a href="#link">Read more</a></div></div></div></div>`, 'popover', 'hover-card');
  const outer = page.getByText('Outer', { exact: true });
  const trigger = page.getByText('Preview', { exact: true });
  const card = page.locator('.hover-card > [data-popover]');
  await outer.focus();
  await page.keyboard.press('Enter');
  await trigger.focus();
  await page.waitForFunction(() => document.querySelector('.hover-card > div').getAttribute('aria-hidden') === 'false');
  await page.getByText('Read more').focus();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await card.getAttribute('aria-hidden'), 'false');
  await page.keyboard.press('Escape');
  assert.equal(await card.getAttribute('aria-hidden'), 'true');
  assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
  assert.equal(await expanded(outer), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await expanded(outer), 'false');
}

async function otp(page) {
  await load(page, `<div class="input-otp" data-input-otp-initialized><div><div><span data-active>1</span><span>2</span></div></div>
    <input aria-invalid="true"></div>`);
  await page.addStyleTag({ content: ".input-otp span { transition: none; }" });
  for (const dark of [false, true]) {
    await page.locator('html').evaluate((el, value) => el.classList.toggle('dark', value), dark);
    const slots = page.locator('.input-otp span');
    const input = page.locator('.input-otp input');
    await input.evaluate(el => el.removeAttribute('aria-invalid'));
    const valid = await slots.first().evaluate(el => getComputedStyle(el).borderBottomColor);
    await input.evaluate(el => el.setAttribute('aria-invalid', 'true'));
    const colors = await slots.evaluateAll(slots => slots.map(el => getComputedStyle(el).borderBottomColor));
    assert.notEqual(colors[0], valid, 'invalid state changes the active border');
    assert.equal(colors[0], colors[1], 'the active slot keeps the invalid border');
  }
}

async function conditionalStyles(page) {
  await load(page, `<div class="command"><header><input placeholder="Find"></header>
    <div role="menu"><div role="separator"></div></div></div>
    <details open><summary class="trace-line">Trace</summary><div>Details</div></details>
    <div class="field" data-orientation="horizontal"><input type="checkbox"><section>Description</section></div>`);
  const separator = page.locator('[role=separator]');
  await page.locator('.command input').fill('a');
  assert.equal(await separator.evaluate(el => getComputedStyle(el).display), 'none');
  await page.locator('.command input').fill('');
  assert.notEqual(await separator.evaluate(el => getComputedStyle(el).display), 'none');
  const overflow = await page.locator('details').evaluate(el => getComputedStyle(el, '::details-content').overflowX);
  assert.equal(overflow, 'clip');
  assert.equal(await page.locator('[type=checkbox]').evaluate(el => getComputedStyle(el).marginTop), '1px');
}

for (const engine of [chromium, firefox, webkit]) {
  const endpoint = engine === chromium && process.env.BASECOAT_CHROMIUM_CDP;
  const browser = endpoint ? await chromium.connectOverCDP(endpoint) : await engine.launch();
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    for (const check of [combobox, multipleSelection, navigation, nestedEscape, hoverCard, otp, conditionalStyles]) {
      await check(page);
      console.log(`${engine.name()}: ${check.name} passed`);
    }
  } finally {
    await context.close();
    if (!endpoint) await browser.close();
  }
}

// Disconnect the borrowed CDP transport when the checks finish. Its browser belongs to the caller.
if (process.env.BASECOAT_CHROMIUM_CDP) process.exit(0);
