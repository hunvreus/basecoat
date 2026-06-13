---
templateEngineOverride: njk
layout: layouts/page.njk
title: Command
description: Command menu for search and quick actions.
toc:
  - label: About
    id: about
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Include the JavaScript files"
            id: usage-html-js-1
          - label: "Step 2: Add your command HTML"
            id: usage-html-js-2
          - label: HTML structure
            id: usage-html-js-3
          - label: JavaScript API
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
      - label: Groups
        id: example-groups
      - label: Scrollable
        id: example-scrollable
      - label: RTL
        id: example-rtl
  - label: API Reference
    id: api-reference
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}
{% from "command.njk" import command, command_dialog %}

{% macro command_items(suggestions_id="suggestions", settings_id="settings", shortcuts=false) %}
<div role="group" aria-labelledby="{{ suggestions_id }}">
  <span role="heading" id="{{ suggestions_id }}">Suggestions</span>
  <div role="menuitem" data-filter="Calendar" data-keywords="date event schedule">
    {% lucide "calendar" %}
    <span>Calendar</span>
    {% if shortcuts %}<span data-shortcut>⌘K</span>{% endif %}
  </div>
  <div role="menuitem" data-filter="Search Emoji" data-keywords="emoji smile reaction">
    {% lucide "smile" %}
    <span>Search Emoji</span>
    {% if shortcuts %}<span data-shortcut>⌘E</span>{% endif %}
  </div>
  <div role="menuitem" aria-disabled="true">
    {% lucide "calculator" %}
    <span>Calculator</span>
  </div>
</div>
<hr role="separator">
<div role="group" aria-labelledby="{{ settings_id }}">
  <span role="heading" id="{{ settings_id }}">Settings</span>
  <div role="menuitem" data-filter="Profile" data-keywords="user account">
    {% lucide "user" %}
    <span>Profile</span>
    {% if shortcuts %}<span data-shortcut>⌘P</span>{% endif %}
  </div>
  <div role="menuitem" data-filter="Billing" data-keywords="invoice payment">
    {% lucide "credit-card" %}
    <span>Billing</span>
    {% if shortcuts %}<span data-shortcut>⌘B</span>{% endif %}
  </div>
  <div role="menuitem" data-filter="Settings" data-keywords="config preferences">
    {% lucide "settings" %}
    <span>Settings</span>
    {% if shortcuts %}<span data-shortcut>⌘S</span>{% endif %}
  </div>
</div>
{% endmacro %}

{% set code_standalone %}
{% call command(id="demo-command-standalone", main_attrs={ "class": "border" }) %}
{{ command_items("suggestions", "settings") }}
{% endcall %}
{% endset %}

{{ code_preview("command-standalone", code_standalone | prettyHtml, class="w-full max-w-sm") }}

<h2 id="about"><a href="#about">About</a></h2>

<section class="prose">
  <p>shadcn/ui's Command component is built on <code>cmdk</code>. Basecoat implements the same command-menu pattern with vanilla HTML, CSS, and a small JavaScript controller for filtering, active item navigation, and dialog closing.</p>
</section>

<h2 id="usage"><a href="#usage">Usage</a></h2>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Include the JavaScript files</a></h4>

<section class="prose">
  <p>You can either <a href="/installation/#install-cdn-all">include the JavaScript file for all the components</a>, or just the one for this component by adding this to the <code>&lt;head&gt;</code> of your page:</p>
</section>

{% set code_script %}<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/command.min.js" defer></script>{% endset %}
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
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/js/command.js" target="_blank">
    command.js
    {% lucide "arrow-right" %}
  </a>
</div>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your command HTML</a></h4>

{{ code_block(code_standalone | prettyHtml, "html") }}

<section class="prose">
  <p>Use <code>&lt;dialog class="command-dialog"&gt;</code> for the command palette variant.</p>
</section>

{% set code_dialog_usage %}<button class="btn-outline" onclick="document.getElementById('command-palette').showModal()">Open</button>
<dialog id="command-palette" class="command-dialog" aria-label="Command menu">
  <div class="command">
    <!-- Command content -->
  </div>
</dialog>{% endset %}
{{ code_block(code_dialog_usage | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">HTML structure</a></h4>

<section class="prose">
  <p>The command menu can be used standalone or inside a native dialog. The structure is:</p>
  <dl>
    <dt><code class="highlight language-html">&lt;dialog class="command-dialog"&gt;</code> <span class="badge-secondary">Optional</span></dt>
    <dd>Dialog variant. Wraps one <code>&lt;div class="command"&gt;</code>. Add <code>aria-label</code> or <code>aria-labelledby</code> for an accessible name.
      <dl>
        <dt><code class="highlight language-html">&lt;div class="command"&gt;</code></dt>
        <dd>Root command menu. Can also be used standalone without the dialog wrapper. Add <code>data-filter="manual"</code> when your app owns filtering, such as remote search or a local Lunr index.
          <dl>
            <dt><code class="highlight language-html">&lt;header&gt;</code></dt>
            <dd>Search input wrapper. The macro includes a search icon and input.
              <dl>
                <dt><code class="highlight language-html">&lt;input type="text" role="combobox"&gt;</code></dt>
                <dd>Filter input. Use <code>aria-expanded="true"</code> and <code>aria-controls="{ MENU_ID }"</code> to point to the command list.</dd>
              </dl>
            </dd>
            <dt><code class="highlight language-html">&lt;div role="menu" id="{ MENU_ID }"&gt;</code></dt>
            <dd>Command list. Set <code>data-empty</code> to customize the empty state.
              <dl>
                <dt><code class="highlight language-html">&lt;div role="group" aria-labelledby="{ HEADING_ID }"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Groups related command items. Hidden automatically when every item in the group is filtered out.</dd>
                <dt><code class="highlight language-html">&lt;span role="heading" id="{ HEADING_ID }"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Group heading. Use an <code>id</code> when the parent group uses <code>aria-labelledby</code>.</dd>
                <dt><code class="highlight language-html">&lt;div role="menuitem"&gt;</code> or <code class="highlight language-html">&lt;a role="menuitem"&gt;</code></dt>
                <dd>Selectable command item. Use <code>&lt;a&gt;</code> for navigation and <code>&lt;div&gt;</code> for actions. Supports <code>data-filter</code>, <code>data-keywords</code>, <code>data-force</code>, <code>data-keep-command-open</code>, and <code>aria-disabled="true"</code>.</dd>
                <dt><code class="highlight language-html">&lt;span data-shortcut&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Shortcut hint aligned to the inline end of the item.</dd>
                <dt><code class="highlight language-html">&lt;span data-indicator&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Item indicator. It becomes visible with <code>data-checked="true"</code> or <code>aria-selected="true"</code>.</dd>
                <dt><code class="highlight language-html">&lt;hr role="separator"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Separator between groups/items. Hidden while filtering.</dd>
              </dl>
            </dd>
          </dl>
        </dd>
      </dl>
    </dd>
  </dl>
</section>

<h4 id="usage-html-js-4"><a href="#usage-html-js-4">JavaScript API</a></h4>

<section class="prose">
  <dl>
    <dt><code>basecoat:initialized</code></dt>
    <dd>Once the component is initialized, it dispatches a custom non-bubbling <code>basecoat:initialized</code> event on itself.</dd>
    <dt><code>command.refresh()</code></dt>
    <dd>Rescans command items after changing children inside the existing <code>role="menu"</code> list.</dd>
    <dt><code>data-filter="manual"</code></dt>
    <dd>Disables Basecoat's built-in text filtering. Your app owns the visible result set: add, remove, or update items, set <code>aria-hidden="true"</code> on hidden items, then call <code>command.refresh()</code>.</dd>
    <dt><code>window.basecoat.refresh(command)</code></dt>
    <dd>Calls the component refresh method through the global dispatcher.</dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<div class="prose">
  <p>You can use the <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">command()</code> or <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">command_dialog()</code> Nunjucks or Jinja macros for this component.</p>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/command.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/command.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{% call command() %}
  <div role="menuitem" data-keywords="date event">
    <svg>...</svg>
    <span>Calendar</span>
  </div>
  <div role="menuitem" data-keywords="config preferences">
    <svg>...</svg>
    <span>Settings</span>
  </div>
{% endcall %}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

<section class="prose">
  <p>A simple command menu in a dialog. The button also shows the keyboard shortcut used in this example.</p>
</section>

{% set code_basic %}
<button type="button" class="btn-outline" onclick="document.getElementById('command-basic').showModal()">
  Open command menu
  <kbd class="kbd">⌘J</kbd>
</button>
{% call command_dialog(id="command-basic") %}
{{ command_items("command-basic-suggestions", "command-basic-settings") }}
{% endcall %}
<script>
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
      event.preventDefault();
      const dialog = document.getElementById('command-basic');
      dialog.open ? dialog.close() : dialog.showModal();
      dialog.querySelector('header input')?.focus();
    }
  });
</script>
{% endset %}
{{ code_preview("command-basic", code_basic | prettyHtml) }}

<h3 id="example-shortcuts"><a href="#example-shortcuts">Shortcuts</a></h3>

{% set code_shortcuts %}
{% call command(id="command-shortcuts", main_attrs={ "class": "border" }) %}
{{ command_items("command-shortcuts-suggestions", "command-shortcuts-settings", true) }}
{% endcall %}
{% endset %}
{{ code_preview("command-shortcuts", code_shortcuts | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-groups"><a href="#example-groups">Groups</a></h3>

{% set code_groups %}
{% call command(id="command-groups", main_attrs={ "class": "border" }) %}
{{ command_items("command-groups-suggestions", "command-groups-settings") }}
{% endcall %}
{% endset %}
{{ code_preview("command-groups", code_groups | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-scrollable"><a href="#example-scrollable">Scrollable</a></h3>

{% set code_scrollable %}
{% call command(id="command-scrollable", main_attrs={ "class": "border" }) %}
<div role="group" aria-labelledby="command-scrollable-heading">
  <span role="heading" id="command-scrollable-heading">Pages</span>
  {% for i in range(0, 18) %}
  <div role="menuitem" data-filter="Page {{ i + 1 }}">
    {% lucide "file" %}
    <span>Page {{ i + 1 }}</span>
  </div>
  {% endfor %}
</div>
{% endcall %}
{% endset %}
{{ code_preview("command-scrollable", code_scrollable | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Command supports document direction. Set <code>dir="rtl"</code> on the command root or a parent element.</p>
</section>

{% set code_rtl %}
<div dir="rtl">
{% call command(id="command-rtl", placeholder="اكتب أمراً أو ابحث...", main_attrs={ "class": "border" }) %}
<div role="group" aria-labelledby="command-rtl-suggestions">
  <span role="heading" id="command-rtl-suggestions">اقتراحات</span>
  <div role="menuitem" data-filter="Calendar">
    {% lucide "calendar" %}
    <span>التقويم</span>
    <span data-shortcut>⌘K</span>
  </div>
  <div role="menuitem" data-filter="Settings">
    {% lucide "settings" %}
    <span>الإعدادات</span>
    <span data-shortcut>⌘S</span>
  </div>
</div>
{% endcall %}
</div>
{% endset %}
{{ code_preview("command-rtl", code_rtl | prettyHtml, class="w-full max-w-sm") }}

<h2 id="api-reference"><a href="#api-reference">API Reference</a></h2>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">.command</code></dt>
    <dd>Root command menu.</dd>
    <dt><code class="highlight language-html">.command-dialog</code></dt>
    <dd>Native dialog variant. Closes automatically when an item is clicked unless that item has <code>data-keep-command-open</code>.</dd>
    <dt><code class="highlight language-html">data-filter</code></dt>
    <dd>Overrides item text used by the filter.</dd>
    <dt><code class="highlight language-html">data-keywords</code></dt>
    <dd>Additional whitespace- or comma-separated search terms.</dd>
    <dt><code class="highlight language-html">data-force</code></dt>
    <dd>Always keeps an item visible while filtering.</dd>
    <dt><code class="highlight language-html">data-empty</code></dt>
    <dd>Custom empty-state text on the menu element.</dd>
  </dl>
</section>
