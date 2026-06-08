---
templateEngineOverride: njk
layout: layouts/page.njk
title: Combobox
description: Autocomplete input with a list of suggestions.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Include the JavaScript files"
            id: usage-html-js-1
          - label: "Step 2: Add your combobox HTML"
            id: usage-html-js-2
          - label: HTML structure
            id: usage-html-js-3
          - label: JavaScript events
            id: usage-html-js-4
          - label: JavaScript methods
            id: usage-html-js-5
      - label: Jinja and Nunjucks
        id: usage-macro
  - label: Examples
    id: examples
    children:
      - label: Multiple
        id: example-multiple
      - label: Groups
        id: example-groups
      - label: Custom Items
        id: example-custom
      - label: Invalid
        id: example-invalid
      - label: Disabled
        id: example-disabled
      - label: Auto Highlight
        id: example-auto-highlight
      - label: Top Side
        id: example-top
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}
{% from "combobox.njk" import combobox %}

{% set frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] %}
{% set code_html %}
{% call combobox(
  id="framework-combobox",
  name="framework",
  placeholder="Select a framework",
  input_attrs={"class": "w-[240px]"},
  listbox_attrs={"data-empty": "No framework found."}
) %}
  {% for framework in frameworks %}
  <div role="option" data-value="{{ framework }}">{{ framework }}</div>
  {% endfor %}
{% endcall %}
{% endset %}

{{ code_preview("combobox", code_html | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Include the JavaScript files</a></h4>

<section class="prose">
  <p>You can either <a href="/installation/#install-cdn-all">include the JavaScript file for all the components</a>, or just the one for this component:</p>
</section>

{% set code_script %}<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/combobox.min.js" defer></script>{% endset %}
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
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/js/combobox.js" target="_blank">
    combobox.js
    {% lucide "arrow-right" %}
  </a>
</div>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your combobox HTML</a></h4>

<section class="prose">
  <p>Combobox is input-first. The visible input filters the list; the hidden input stores the submitted value.</p>
</section>

{{ code_block(code_html | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">HTML structure</a></h4>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">&lt;div class="combobox"&gt;</code></dt>
    <dd>Root element. Add <code>data-auto-highlight="true"</code> to highlight the first match while filtering. Add <code>data-format="object"</code> to serialize selected values as <code>{ value, label }</code> objects in the hidden input. Add <code>data-filter="manual"</code> when your app owns filtering, such as remote autocomplete or a local Lunr index.</dd>
    <dt><code class="highlight language-html">&lt;input type="text" role="combobox"&gt;</code></dt>
    <dd>The editable control. It should include <code>aria-expanded</code>, <code>aria-controls</code>, and <code>aria-autocomplete="list"</code>.</dd>
    <dt><code class="highlight language-html">&lt;div class="combobox-chips"&gt;</code> <span class="badge-secondary">Multiple only</span></dt>
    <dd>Wraps selected chips and the editable input in multiple mode.</dd>
    <dt><code class="highlight language-html">&lt;div data-popover&gt;</code></dt>
    <dd>The suggestions popup. Use <code>data-side</code> and <code>data-align</code> like Popover.</dd>
    <dt><code class="highlight language-html">&lt;div role="listbox"&gt;</code></dt>
    <dd>The suggestions list. Add <code>aria-multiselectable="true"</code> in multiple mode and <code>data-empty</code> for the empty message.</dd>
    <dt><code class="highlight language-html">&lt;div role="option" data-value="..."&gt;</code></dt>
    <dd>Selectable option. Options can contain custom HTML; use <code>data-label</code> when the visible input should use different text than the rendered content.</dd>
    <dt><code class="highlight language-html">&lt;input type="hidden"&gt;</code></dt>
    <dd>Submitted value. Single mode stores a string; multiple mode stores a JSON array. With <code>data-format="object"</code>, single mode stores a JSON object and multiple mode stores a JSON array of objects.</dd>
  </dl>
</section>

<h4 id="usage-html-js-4"><a href="#usage-html-js-4">JavaScript events</a></h4>

<section class="prose">
  <dl>
    <dt><code>basecoat:initialized</code></dt>
    <dd>Dispatched on the component after initialization.</dd>
    <dt><code>basecoat:popover</code></dt>
    <dd>Dispatched on <code>document</code> when the popup opens so other popup components can close.</dd>
    <dt><code>change</code></dt>
    <dd>Dispatched on selection changes with <code>event.detail.value</code> and <code>event.detail.selected</code>. <code>value</code> is the canonical value or array of values; <code>selected</code> is the matching <code>{ value, label }</code> object or array.</dd>
  </dl>
</section>

<h4 id="usage-html-js-5"><a href="#usage-html-js-5">JavaScript methods</a></h4>

<section class="prose">
  <dl>
    <dt><code>value</code></dt>
    <dd>Gets or sets the selected value. Multiple mode uses an array.</dd>
    <dt><code>selected</code></dt>
    <dd>Gets the selected <code>{ value, label }</code> object. Multiple mode returns an array.</dd>
    <dt><code>setValue(value)</code></dt>
    <dd>Sets the selected value. Accepts plain values or <code>{ value, label }</code> objects, which is useful when hydrating remote autocomplete selections before the option exists in the list.</dd>
    <dt><code>select(value)</code></dt>
    <dd>Selects an option by value.</dd>
    <dt><code>deselect(value)</code> <span class="badge-secondary">Multiple only</span></dt>
    <dd>Removes a selected value.</dd>
    <dt><code>toggle(value)</code> <span class="badge-secondary">Multiple only</span></dt>
    <dd>Toggles a selected value.</dd>
    <dt><code>refresh()</code></dt>
    <dd>Rescans options after changing children inside the existing <code>role="listbox"</code> element.</dd>
    <dt><code>data-filter="manual"</code></dt>
    <dd>Disables Basecoat's built-in text filtering. Update the listbox options yourself, then call <code>combobox.refresh()</code>.</dd>
    <dt><code>window.basecoat.refresh(combobox)</code></dt>
    <dd>Calls the component refresh method through the global dispatcher.</dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<section class="prose">
  <p>Use the <code>combobox()</code> macro for Nunjucks or Jinja.</p>
</section>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/combobox.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/combobox.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{% call combobox(
  placeholder="Select a framework",
  listbox_attrs={"data-empty": "No framework found."}
) %}
  <div role="option" data-value="nextjs">Next.js</div>
  <div role="option" data-value="sveltekit">SvelteKit</div>
  <div role="option" data-value="nuxtjs">Nuxt.js</div>
{% endcall %}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-multiple"><a href="#example-multiple">Multiple</a></h3>

{% set code %}
{% call combobox(
  id="frameworks-combobox",
  name="frameworks",
  multiple=true,
  selected=["Next.js"],
  placeholder="Add framework",
  input_attrs={"class": "w-[320px]"},
  listbox_attrs={"data-empty": "No framework found."},
  auto_highlight=true
) %}
  {% for framework in frameworks %}
  <div role="option" data-value="{{ framework }}">{{ framework }}</div>
  {% endfor %}
{% endcall %}
{% endset %}
{{ code_preview("combobox-multiple", code | prettyHtml) }}

<h3 id="example-groups"><a href="#example-groups">Groups</a></h3>

{% set code %}
{% call combobox(
  id="timezone-combobox",
  placeholder="Search timezone",
  input_attrs={"class": "w-[280px]"},
  listbox_attrs={"data-empty": "No timezone found."}
) %}
  <div role="group" aria-labelledby="timezone-americas">
    <div role="heading" id="timezone-americas">Americas</div>
    <div role="option" data-value="America/New_York">(GMT-5) New York</div>
    <div role="option" data-value="America/Los_Angeles">(GMT-8) Los Angeles</div>
    <div role="option" data-value="America/Sao_Paulo">(GMT-3) São Paulo</div>
  </div>
  <hr role="separator">
  <div role="group" aria-labelledby="timezone-europe">
    <div role="heading" id="timezone-europe">Europe</div>
    <div role="option" data-value="Europe/London">(GMT+0) London</div>
    <div role="option" data-value="Europe/Paris">(GMT+1) Paris</div>
    <div role="option" data-value="Europe/Berlin">(GMT+1) Berlin</div>
  </div>
{% endcall %}
{% endset %}
{{ code_preview("combobox-groups", code | prettyHtml) }}

<h3 id="example-custom"><a href="#example-custom">Custom Items</a></h3>

{% set code %}
{% call combobox(
  id="country-combobox",
  placeholder="Search countries",
  input_attrs={"class": "w-[280px]"},
  listbox_attrs={"data-empty": "No country found."}
) %}
  <div role="option" data-value="argentina" data-label="Argentina" data-filter="Argentina South America">
    <span class="flex flex-col">
      <span>Argentina</span>
      <span class="text-muted-foreground text-xs">South America (ar)</span>
    </span>
  </div>
  <div role="option" data-value="japan" data-label="Japan" data-filter="Japan Asia">
    <span class="flex flex-col">
      <span>Japan</span>
      <span class="text-muted-foreground text-xs">Asia (jp)</span>
    </span>
  </div>
  <div role="option" data-value="united-states" data-label="United States" data-filter="United States North America USA">
    <span class="flex flex-col">
      <span>United States</span>
      <span class="text-muted-foreground text-xs">North America (us)</span>
    </span>
  </div>
{% endcall %}
{% endset %}
{{ code_preview("combobox-custom", code | prettyHtml) }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code %}
<div role="group" class="field" data-invalid="true">
  <label for="invalid-combobox-input">Framework</label>
  {% call combobox(
    id="invalid-combobox",
    placeholder="Select a framework",
    input_attrs={"id": "invalid-combobox-input", "aria-invalid": "true", "class": "w-[240px]"},
    listbox_attrs={"data-empty": "No framework found."}
  ) %}
    {% for framework in frameworks %}
    <div role="option" data-value="{{ framework }}">{{ framework }}</div>
    {% endfor %}
  {% endcall %}
  <p class="field-error" role="alert">Select a framework to continue.</p>
</div>
{% endset %}
{{ code_preview("combobox-invalid", code | prettyHtml, "w-full max-w-sm") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}
{% call combobox(
  placeholder="Select a framework",
  input_attrs={"disabled": "disabled", "class": "w-[240px]"}
) %}
  <div role="option" data-value="nextjs">Next.js</div>
{% endcall %}
{% endset %}
{{ code_preview("combobox-disabled", code | prettyHtml) }}

<h3 id="example-auto-highlight"><a href="#example-auto-highlight">Auto Highlight</a></h3>

{% set code %}
{% call combobox(
  placeholder="Select a framework",
  input_attrs={"class": "w-[240px]"},
  auto_highlight=true
) %}
  {% for framework in frameworks %}
  <div role="option" data-value="{{ framework }}">{{ framework }}</div>
  {% endfor %}
{% endcall %}
{% endset %}
{{ code_preview("combobox-auto-highlight", code | prettyHtml) }}

<h3 id="example-top"><a href="#example-top">Top Side</a></h3>

{% set code %}
{% call combobox(
  placeholder="Select a framework",
  input_attrs={"class": "w-[240px]"},
  popover_attrs={"data-side": "top"}
) %}
  {% for framework in frameworks %}
  <div role="option" data-value="{{ framework }}">{{ framework }}</div>
  {% endfor %}
{% endcall %}
{% endset %}
{{ code_preview("combobox-top", code | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

{% set code %}
<div dir="rtl">
  {% call combobox(
    placeholder="اختر إطار عمل",
    input_attrs={"class": "w-[240px]"}
  ) %}
    <div role="option" data-value="nextjs">Next.js</div>
    <div role="option" data-value="sveltekit">SvelteKit</div>
    <div role="option" data-value="astro">Astro</div>
  {% endcall %}
</div>
{% endset %}
{{ code_preview("combobox-rtl", code | prettyHtml) }}
