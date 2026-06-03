---
templateEngineOverride: njk
layout: layouts/page.njk
title: Dropdown Menu
description: Displays a menu to the user — such as a set of actions or functions — triggered by a button.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Include the JavaScript file"
            id: usage-html-js-1
          - label: "Step 2: Add your dropdown menu HTML"
            id: usage-html-js-2
          - label: HTML structure
            id: usage-html-js-3
          - label: JavaScript events
            id: usage-html-js-4
      - label: Jinja and Nunjucks
        id: usage-macro
  - label: Examples
    id: examples
    children:
      - label: Basic
        id: example-basic
      - label: Shortcuts
        id: example-shortcuts
      - label: Icons
        id: example-icons
      - label: Checkboxes
        id: example-checkboxes
      - label: Radio Group
        id: example-radio-group
      - label: Destructive
        id: example-destructive
      - label: RTL
        id: example-rtl
  - label: API Reference
    id: api-reference
---

{% from "macros/code_block.njk" import code_block %}
{% from "macros/code_preview.njk" import code_preview %}
{% from "dropdown-menu.njk" import dropdown_menu %}

{% set code_html %}
{% call dropdown_menu(
  id="demo-dropdown-menu",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="group" aria-labelledby="demo-dropdown-account">
  <div role="heading" id="demo-dropdown-account">My Account</div>
  <div role="menuitem">
    Profile
    <span data-shortcut>⇧⌘P</span>
  </div>
  <div role="menuitem">
    Billing
    <span data-shortcut>⌘B</span>
  </div>
  <div role="menuitem">Settings</div>
  <div role="menuitem">Keyboard shortcuts</div>
</div>
<hr role="separator">
<div role="menuitem">GitHub</div>
<div role="menuitem">Support</div>
<div role="menuitem" aria-disabled="true">API</div>
<hr role="separator">
<div role="menuitem">Log out</div>
{% endcall %}
{% endset %}

{{ code_preview("dropdown-menu", code_html | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Basecoat dropdown menus are inline-positioned relative to the <code>.dropdown-menu</code> wrapper. This differs from shadcn/ui's portalled Base UI implementation, but keeps the markup dependency-free and matches Basecoat's current popover/select positioning model.</p>
</section>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Include the JavaScript file</a></h4>

<section class="prose">
  <p>You can either <a href="/installation/#install-cdn-all">include the JavaScript file for all the components</a>, or just the one for this component by adding this to the <code>&lt;head&gt;</code> of your page:</p>
</section>

{% set code_script %}<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/dropdown-menu.min.js" defer></script>{% endset %}
{{ code_block(code_script | prettyHtml, "html") }}

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/installation/#install-js">
    Components with JavaScript
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="/cli">
    Use the CLI
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/js/dropdown-menu.js" target="_blank">
    dropdown-menu.js
    {% lucide "arrow-right" %}
  </a>
</div>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your dropdown menu HTML</a></h4>

{{ code_block(code_html | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">HTML structure</a></h4>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">&lt;div class="dropdown-menu"&gt;</code></dt>
    <dd>Relative wrapper for the trigger and inline menu content.
      <dl>
        <dt><code class="highlight language-html">&lt;button aria-haspopup="menu" aria-expanded="false"&gt;</code></dt>
        <dd>Trigger button. The script toggles <code>aria-expanded</code> and manages keyboard navigation.</dd>
        <dt><code class="highlight language-html">&lt;div data-popover aria-hidden="true"&gt;</code></dt>
        <dd>Menu content popover. Set <code>data-side="top|right|bottom|left"</code> and <code>data-align="start|center|end"</code> to control placement.
          <dl>
            <dt><code class="highlight language-html">&lt;div role="menu"&gt;</code></dt>
            <dd>Container for menu items, groups, labels, and separators.
              <dl>
                <dt><code class="highlight language-html">&lt;div role="group" aria-labelledby="{ HEADING_ID }"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Groups related menu items.</dd>
                <dt><code class="highlight language-html">&lt;div role="heading" id="{ HEADING_ID }"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Group heading/label.</dd>
                <dt><code class="highlight language-html">&lt;div role="menuitem"&gt;</code></dt>
                <dd>Standard action item. Use <code>aria-disabled="true"</code> for disabled items.</dd>
                <dt><code class="highlight language-html">&lt;div role="menuitemcheckbox" aria-checked="true"&gt;</code></dt>
                <dd>Checkbox-style item. Add a child with <code>data-indicator</code> for the checked icon.</dd>
                <dt><code class="highlight language-html">&lt;div role="menuitemradio" aria-checked="true"&gt;</code></dt>
                <dd>Radio-style item. Add a child with <code>data-indicator</code> for the selected icon.</dd>
                <dt><code class="highlight language-html">&lt;span data-shortcut&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Shortcut hint aligned to the inline end of the item.</dd>
                <dt><code class="highlight language-html">&lt;hr role="separator"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Separator between groups or options.</dd>
              </dl>
            </dd>
          </dl>
        </dd>
      </dl>
    </dd>
  </dl>
</section>

<h4 id="usage-html-js-4"><a href="#usage-html-js-4">JavaScript events</a></h4>

<section class="prose">
  <dl>
    <dt><code>basecoat:initialized</code></dt>
    <dd>Once the component is initialized, it dispatches a custom non-bubbling <code>basecoat:initialized</code> event on itself.</dd>
    <dt><code>basecoat:popover</code></dt>
    <dd>When the menu opens, the component dispatches a custom event on <code>document</code>. Other popover-based components listen for this to close any open popovers.</dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<div class="prose">
  <p>You can use the <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">dropdown_menu()</code> Nunjucks or Jinja macro for this component.</p>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/dropdown-menu.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/dropdown-menu.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{% call dropdown_menu(
  id="dropdown-menu",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="group" aria-labelledby="account-options">
  <div role="heading" id="account-options">My Account</div>
  <div role="menuitem">Profile</div>
  <div role="menuitem">Billing</div>
</div>
<hr role="separator">
<div role="menuitem">Team</div>
<div role="menuitem">Subscription</div>
{% endcall %}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-basic",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="group" aria-labelledby="dropdown-basic-account">
  <div role="heading" id="dropdown-basic-account">My Account</div>
  <div role="menuitem">Profile</div>
  <div role="menuitem">Billing</div>
  <div role="menuitem">Settings</div>
</div>
<hr role="separator">
<div role="menuitem">Team</div>
<div role="menuitem" aria-disabled="true">API</div>
{% endcall %}
{% endset %}
{{ code_preview("dropdown-menu-basic", code | prettyHtml) }}

<h3 id="example-shortcuts"><a href="#example-shortcuts">Shortcuts</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-shortcuts",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="menuitem">New Tab <span data-shortcut>⌘T</span></div>
<div role="menuitem">New Window <span data-shortcut>⌘N</span></div>
<div role="menuitem">New Private Window <span data-shortcut>⇧⌘N</span></div>
<hr role="separator">
<div role="menuitem">Print <span data-shortcut>⌘P</span></div>
{% endcall %}
{% endset %}
{{ code_preview("dropdown-menu-shortcuts", code | prettyHtml) }}

<h3 id="example-icons"><a href="#example-icons">Icons</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-icons",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="menuitem">{% lucide "user" %} Profile</div>
<div role="menuitem">{% lucide "credit-card" %} Billing</div>
<div role="menuitem">{% lucide "settings" %} Settings</div>
<hr role="separator">
<div role="menuitem">{% lucide "log-out" %} Log out</div>
{% endcall %}
{% endset %}
{{ code_preview("dropdown-menu-icons", code | prettyHtml) }}

<h3 id="example-checkboxes"><a href="#example-checkboxes">Checkboxes</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-checkboxes",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="group" aria-labelledby="dropdown-checkboxes-label">
  <div role="heading" id="dropdown-checkboxes-label">Appearance</div>
  <div role="menuitemcheckbox" aria-checked="true">
    <span data-indicator>{% lucide "check" %}</span>
    Status Bar
    <span data-shortcut>⌘S</span>
  </div>
  <div role="menuitemcheckbox" aria-checked="false">
    <span data-indicator>{% lucide "check" %}</span>
    Activity Bar
    <span data-shortcut>⌘A</span>
  </div>
  <div role="menuitemcheckbox" aria-checked="false" aria-disabled="true">
    <span data-indicator>{% lucide "check" %}</span>
    Panel
    <span data-shortcut>⌘P</span>
  </div>
</div>
{% endcall %}
<script>
(() => {
  const dropdownMenu = document.querySelector('#dropdown-checkboxes');
  const checkboxes = dropdownMenu.querySelectorAll('[role="menuitemcheckbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', () => {
      if (checkbox.getAttribute('aria-disabled') === 'true') return;
      checkbox.setAttribute('aria-checked', checkbox.getAttribute('aria-checked') !== 'true');
    });
  });
})();
</script>
{% endset %}
{{ code_preview("dropdown-menu-checkboxes", code | prettyHtml) }}

<h3 id="example-radio-group"><a href="#example-radio-group">Radio Group</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-radio-group",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="group" aria-labelledby="dropdown-radio-label">
  <div role="heading" id="dropdown-radio-label">Panel Position</div>
  <div role="menuitemradio" aria-checked="false">
    <span data-indicator>{% lucide "check" %}</span>
    Top
  </div>
  <div role="menuitemradio" aria-checked="true">
    <span data-indicator>{% lucide "check" %}</span>
    Bottom
  </div>
  <div role="menuitemradio" aria-checked="false">
    <span data-indicator>{% lucide "check" %}</span>
    Right
  </div>
</div>
{% endcall %}
<script>
(() => {
  const dropdownMenu = document.querySelector('#dropdown-radio-group');
  const radios = dropdownMenu.querySelectorAll('[role="menuitemradio"]');
  radios.forEach((radio) => {
    radio.addEventListener('click', () => {
      radios.forEach((item) => item.setAttribute('aria-checked', 'false'));
      radio.setAttribute('aria-checked', 'true');
    });
  });
})();
</script>
{% endset %}
{{ code_preview("dropdown-menu-radio-group", code | prettyHtml) }}

<h3 id="example-destructive"><a href="#example-destructive">Destructive</a></h3>

{% set code %}
{% call dropdown_menu(
  id="dropdown-destructive",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56"}
) %}
<div role="menuitem">Edit</div>
<div role="menuitem">Duplicate</div>
<hr role="separator">
<div role="menuitem" data-variant="destructive">
  {% lucide "trash-2" %}
  Delete
</div>
{% endcall %}
{% endset %}
{{ code_preview("dropdown-menu-destructive", code | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Dropdown menus support document direction. Set <code>dir="rtl"</code> on the dropdown root or a parent element. Use logical alignment data attributes where possible.</p>
</section>

{% set code %}
<div dir="rtl">
{% call dropdown_menu(
  id="dropdown-rtl",
  trigger="فتح",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "min-w-56", "data-align": "end"}
) %}
<div role="heading" id="dropdown-rtl-label">الحساب</div>
<div role="menuitem">الملف الشخصي <span data-shortcut>⌘P</span></div>
<div role="menuitem">الإعدادات <span data-shortcut>⌘S</span></div>
<hr role="separator">
<div role="menuitem" data-variant="destructive">حذف</div>
{% endcall %}
</div>
{% endset %}
{{ code_preview("dropdown-menu-rtl", code | prettyHtml) }}

<h2 id="api-reference"><a href="#api-reference">API Reference</a></h2>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">.dropdown-menu</code></dt>
    <dd>Root component class. Must wrap the trigger and the <code>[data-popover]</code> content.</dd>
    <dt><code class="highlight language-html">[data-popover]</code></dt>
    <dd>Inline menu popover. Supports <code>data-side</code> and <code>data-align</code> through the shared popover positioning rules.</dd>
    <dt><code class="highlight language-html">[role="menu"]</code></dt>
    <dd>Menu container referenced by the trigger's <code>aria-controls</code>.</dd>
    <dt><code class="highlight language-html">[role="menuitem"]</code></dt>
    <dd>Action item. Supports <code>aria-disabled="true"</code>, <code>data-inset</code>, and <code>data-variant="destructive"</code>.</dd>
    <dt><code class="highlight language-html">[role="menuitemcheckbox"]</code></dt>
    <dd>Checkbox item. Use <code>aria-checked="true|false"</code> and an optional <code>[data-indicator]</code> child.</dd>
    <dt><code class="highlight language-html">[role="menuitemradio"]</code></dt>
    <dd>Radio item. Use <code>aria-checked="true|false"</code> and an optional <code>[data-indicator]</code> child.</dd>
    <dt><code class="highlight language-html">[role="heading"]</code></dt>
    <dd>Group label. Supports <code>data-inset</code>.</dd>
    <dt><code class="highlight language-html">[role="separator"]</code></dt>
    <dd>Visual separator between groups or actions.</dd>
    <dt><code class="highlight language-html">[data-shortcut]</code></dt>
    <dd>Shortcut hint aligned to the inline end of a menu item.</dd>
    <dt><code class="highlight language-html">[data-indicator]</code></dt>
    <dd>Indicator slot for checkbox and radio menu items. It becomes visible when the item has <code>aria-checked="true"</code>.</dd>
  </dl>
</section>
