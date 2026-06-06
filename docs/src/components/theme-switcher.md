---
templateEngineOverride: njk
layout: layouts/page.njk
title: Theme Switcher
description: A simple button pattern for switching between light and dark mode.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Avoid the initial flash"
            id: usage-html-js-1
          - label: "Step 2: Add your switcher"
            id: usage-html-js-2
          - label: JavaScript API
            id: usage-html-js-3
---

<div class="alert mb-6">
  {% lucide "circle-alert" %}
  <h2>There is no dedicated theme switcher component in Basecoat.</h2>
  <section><p>Theme switching is handled by <code>window.basecoat.theme</code> and a small inline script that applies the stored mode before styles render.</p></section>
</div>

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code_switcher %}<button
  type="button"
  aria-label="Toggle dark mode"
  data-tooltip="Toggle dark mode"
  data-side="bottom"
  onclick="window.basecoat.theme.toggle()"
  class="btn-icon-outline size-8"
>
  <span class="hidden dark:block">{% lucide "sun" %}</span>
  <span class="block dark:hidden">{% lucide "moon" %}</span>
</button>{% endset %}
{{ code_preview("button", code_switcher) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Avoid the initial flash</a></h4>

<section class="prose">
  <p>Add this inline script before loading your styles. It applies the stored mode before the page renders.</p>
</section>

{% set code_head %}<script>
  (() => {
    try {
      const stored = localStorage.getItem('themeMode');
      if (stored ? stored === 'dark'
                  : matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    } catch (_) {}
  })();
</script>{% endset %}
{{ code_block(code_head | prettyHtml, "html") }}

<section class="prose">
  <p>Load <code>basecoat.js</code> or the bundled JavaScript before calling <code>window.basecoat.theme</code>.</p>
</section>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your switcher</a></h4>

{{ code_block(code_switcher | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">JavaScript API</a></h4>

<section class="prose">
  <dl>
    <dt><code>window.basecoat.theme.get()</code></dt>
    <dd>Returns <code>"dark"</code> or <code>"light"</code>.</dd>
    <dt><code>window.basecoat.theme.set(mode)</code></dt>
    <dd>Sets the mode to <code>"dark"</code> or <code>"light"</code> and stores it in <code>localStorage.themeMode</code>.</dd>
    <dt><code>window.basecoat.theme.toggle()</code></dt>
    <dd>Toggles between dark and light mode.</dd>
  </dl>
</section>

{% set code_methods %}<button type="button" onclick="window.basecoat.theme.toggle()">Toggle theme</button>
<button type="button" onclick="window.basecoat.theme.set('dark')">Set dark theme</button>{% endset %}
{{ code_block(code_methods | prettyHtml, "html") }}
