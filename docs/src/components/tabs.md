---
templateEngineOverride: njk
layout: layouts/page.njk
title: Tabs
description: A set of layered sections of content that are displayed one at a time.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Include the JavaScript files"
            id: usage-html-js-1
          - label: "Step 2: Add your tabs HTML"
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
      - label: Line
        id: example-line
      - label: Vertical
        id: example-vertical
      - label: Disabled
        id: example-disabled
      - label: Icons
        id: example-icons
      - label: RTL
        id: example-rtl
  - label: API Reference
    id: api-reference
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}
{% from "tabs.njk" import tabs %}

{% set account_panel %}
<div class="card">
  <header>
    <h2>Account</h2>
    <p>Make changes to your account here. Click save when you're done.</p>
  </header>
  <section>
    <form class="grid gap-4">
      <div role="group" class="field">
        <label for="demo-tabs-account-name">Name</label>
        <input type="text" id="demo-tabs-account-name" value="Pedro Duarte">
      </div>
      <div role="group" class="field">
        <label for="demo-tabs-account-username">Username</label>
        <input type="text" id="demo-tabs-account-username" value="@peduarte">
      </div>
    </form>
  </section>
  <footer>
    <button type="button" class="btn">Save changes</button>
  </footer>
</div>
{% endset %}

{% set password_panel %}
<div class="card">
  <header>
    <h2>Password</h2>
    <p>Change your password here. After saving, you'll be logged out.</p>
  </header>
  <section>
    <form class="grid gap-4">
      <div role="group" class="field">
        <label for="demo-tabs-password-current">Current password</label>
        <input type="password" id="demo-tabs-password-current">
      </div>
      <div role="group" class="field">
        <label for="demo-tabs-password-new">New password</label>
        <input type="password" id="demo-tabs-password-new">
      </div>
    </form>
  </section>
  <footer>
    <button type="button" class="btn">Save password</button>
  </footer>
</div>
{% endset %}

{% set tabsets_demo = [
  { tab: "Account", panel: account_panel },
  { tab: "Password", panel: password_panel }
] %}

{% set code_html %}
{{ tabs(
  id="demo-tabs-with-panels",
  tabsets=tabsets_demo,
  main_attrs={ "class": "w-full" },
  tablist_attrs={ "class": "w-full", "aria-orientation": "horizontal" }
) }}
{% endset %}

{{ code_preview("tabs", code_html | prettyHtml, "max-w-[400px] w-full") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Include the JavaScript files</a></h4>

<section class="prose">
  <p>You can either <a href="/installation/#install-cdn-all">include the JavaScript file for all the components</a>, or just the one for this component by adding this to the <code>&lt;head&gt;</code> of your page:</p>
</section>

{% set code_script %}<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/tabs.min.js" defer></script>{% endset %}
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
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/js/tabs.js" target="_blank">
    tabs.js
    {% lucide "arrow-right" %}
  </a>
</div>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your tabs HTML</a></h4>

{{ code_block(code_html | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">HTML structure</a></h4>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">&lt;div class="tabs"&gt;</code></dt>
    <dd>Root tabs container. It becomes horizontal or vertical based on the child tablist's <code>aria-orientation</code>.
      <dl>
        <dt><code class="highlight language-html">&lt;nav role="tablist" aria-orientation="horizontal"&gt;</code></dt>
        <dd>Tablist containing tab buttons. Set <code>aria-orientation="vertical"</code> for vertical tabs and <code>data-variant="line"</code> for the line style.
          <dl>
            <dt><code class="highlight language-html">&lt;button role="tab" id="{ TAB_ID }" aria-controls="{ PANEL_ID }" aria-selected="true" tabindex="0"&gt;</code></dt>
            <dd>Tab trigger. The active tab has <code>aria-selected="true"</code> and <code>tabindex="0"</code>. Inactive tabs use <code>tabindex="-1"</code>. Disabled tabs use <code>disabled</code> or <code>aria-disabled="true"</code>.</dd>
          </dl>
        </dd>
        <dt><code class="highlight language-html">&lt;div role="tabpanel" id="{ PANEL_ID }" aria-labelledby="{ TAB_ID }"&gt;</code></dt>
        <dd>Panel controlled by a tab. Inactive panels are hidden.</dd>
      </dl>
    </dd>
  </dl>
</section>

<h4 id="usage-html-js-4"><a href="#usage-html-js-4">JavaScript events</a></h4>

<section class="prose">
  <dl>
    <dt><code>basecoat:initialized</code></dt>
    <dd>Once the component is initialized, it dispatches a custom non-bubbling <code>basecoat:initialized</code> event on itself.</dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<div class="prose">
  <p>You can use the <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">tabs()</code> Nunjucks or Jinja macro for this component.</p>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/tabs.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/tabs.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{{ tabs(
  id="account-tabs",
  tabsets=[
    { tab: "Account", panel: account_panel },
    { tab: "Password", panel: password_panel }
  ],
  tablist_attrs={ "data-variant": "line" }
) }}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-line"><a href="#example-line">Line</a></h3>

{% set code %}
{{ tabs(
  id="tabs-line",
  tabsets=[
    { tab: "Account", panel: "Make changes to your account here." },
    { tab: "Password", panel: "Change your password here." },
    { tab: "Settings", panel: "Update your settings here." }
  ],
  tablist_attrs={ "data-variant": "line" }
) }}
{% endset %}
{{ code_preview("tabs-line", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-vertical"><a href="#example-vertical">Vertical</a></h3>

{% set code %}
{{ tabs(
  id="tabs-vertical",
  tabsets=[
    { tab: "Account", panel: "Manage account settings." },
    { tab: "Password", panel: "Update your password." },
    { tab: "Notifications", panel: "Configure notifications." }
  ],
  main_attrs={ "class": "w-full" },
  tablist_attrs={ "aria-orientation": "vertical" }
) }}
{% endset %}
{{ code_preview("tabs-vertical", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}
{{ tabs(
  id="tabs-disabled",
  tabsets=[
    { tab: "Account", panel: "Account content." },
    { tab: "Password", panel: "Password content.", tab_attrs: { "disabled": "disabled" } },
    { tab: "Settings", panel: "Settings content." }
  ]
) }}
{% endset %}
{{ code_preview("tabs-disabled", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-icons"><a href="#example-icons">Icons</a></h3>

{% set icon_account %}{% lucide "user" %}Account{% endset %}
{% set icon_password %}{% lucide "lock" %}Password{% endset %}
{% set icon_settings %}{% lucide "settings" %}Settings{% endset %}
{% set code %}
{{ tabs(
  id="tabs-icons",
  tabsets=[
    { tab: icon_account, panel: "Account content." },
    { tab: icon_password, panel: "Password content." },
    { tab: icon_settings, panel: "Settings content." }
  ]
) }}
{% endset %}
{{ code_preview("tabs-icons", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Tabs support document direction. Set <code>dir="rtl"</code> on the tabs root or a parent element.</p>
</section>

{% set code %}
<div dir="rtl">
{{ tabs(
  id="tabs-rtl",
  tabsets=[
    { tab: "الحساب", panel: "إعدادات الحساب." },
    { tab: "كلمة المرور", panel: "تحديث كلمة المرور." },
    { tab: "الإشعارات", panel: "إعدادات الإشعارات." }
  ],
  tablist_attrs={ "data-variant": "line" }
) }}
</div>
{% endset %}
{{ code_preview("tabs-rtl", code | prettyHtml, "w-full max-w-md") }}

<h2 id="api-reference"><a href="#api-reference">API Reference</a></h2>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">.tabs</code></dt>
    <dd>Root component class.</dd>
    <dt><code class="highlight language-html">[role="tablist"]</code></dt>
    <dd>Tablist. Supports <code>aria-orientation="horizontal"</code>, <code>aria-orientation="vertical"</code>, and <code>data-variant="line"</code>.</dd>
    <dt><code class="highlight language-html">[role="tab"]</code></dt>
    <dd>Tab trigger. Supports <code>aria-selected</code>, <code>disabled</code>, and <code>aria-disabled="true"</code>.</dd>
    <dt><code class="highlight language-html">[role="tabpanel"]</code></dt>
    <dd>Tab panel associated with a tab by <code>aria-controls</code> and <code>aria-labelledby</code>.</dd>
  </dl>
</section>
