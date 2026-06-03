---
templateEngineOverride: njk
layout: layouts/page.njk
title: Popover
description: Displays rich content triggered by a button.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML + JavaScript
        id: usage-html-js
        children:
          - label: "Step 1: Include the JavaScript file"
            id: usage-html-js-1
          - label: "Step 2: Add your popover HTML"
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
      - label: Align
        id: example-align
      - label: With Form
        id: example-form
      - label: RTL
        id: example-rtl
  - label: API Reference
    id: api-reference
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}
{% from "popover.njk" import popover %}

{% set code_html %}
{% call popover(
  id="demo-popover",
  trigger="Open popover",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "w-72"}
) %}
  <header>
    <h4>Dimensions</h4>
    <p>Set the dimensions for the layer.</p>
  </header>
  <form class="grid gap-2">
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="demo-popover-width">Width</label>
      <input type="text" id="demo-popover-width" value="100%" class="input col-span-2 h-8" autofocus>
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="demo-popover-max-width">Max. width</label>
      <input type="text" id="demo-popover-max-width" value="300px" class="input col-span-2 h-8">
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="demo-popover-height">Height</label>
      <input type="text" id="demo-popover-height" value="25px" class="input col-span-2 h-8">
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="demo-popover-max-height">Max. height</label>
      <input type="text" id="demo-popover-max-height" value="none" class="input col-span-2 h-8">
    </div>
  </form>
{% endcall %}
{% endset %}

{{ code_preview("popover", code_html | prettyHtml) }}

{% set code_form %}
{% call popover(
  id="popover-form",
  trigger="Open popover",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "w-72"}
) %}
  <header>
    <h4>Dimensions</h4>
    <p>Set the dimensions for the layer.</p>
  </header>
  <form class="grid gap-2">
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="popover-form-width">Width</label>
      <input type="text" id="popover-form-width" value="100%" class="input col-span-2 h-8" autofocus>
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="popover-form-max-width">Max. width</label>
      <input type="text" id="popover-form-max-width" value="300px" class="input col-span-2 h-8">
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="popover-form-height">Height</label>
      <input type="text" id="popover-form-height" value="25px" class="input col-span-2 h-8">
    </div>
    <div class="grid grid-cols-3 items-center gap-4">
      <label for="popover-form-max-height">Max. height</label>
      <input type="text" id="popover-form-max-height" value="none" class="input col-span-2 h-8">
    </div>
  </form>
{% endcall %}
{% endset %}


<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Basecoat popovers are inline-positioned relative to the <code>.popover</code> wrapper. This differs from shadcn/ui's portalled Base UI implementation, but keeps the markup dependency-free and works with Basecoat's existing dropdown/select positioning model.</p>
</section>

<h3 id="usage-html-js"><a href="#usage-html-js">HTML + JavaScript</a></h3>

<h4 id="usage-html-js-1"><a href="#usage-html-js-1">Step 1: Include the JavaScript file</a></h4>

<section class="prose">
  <p>You can either <a href="/installation/#install-cdn-all">include the JavaScript file for all the components</a>, or just the one for this component by adding this to the <code>&lt;head&gt;</code> of your page:</p>
</section>

{% set code_script %}<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/popover.min.js" defer></script>{% endset %}
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
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/js/popover.js" target="_blank">
    popover.js
    {% lucide "arrow-right" %}
  </a>
</div>

<h4 id="usage-html-js-2"><a href="#usage-html-js-2">Step 2: Add your popover HTML</a></h4>

{{ code_block(code_html | prettyHtml, "html") }}

<h4 id="usage-html-js-3"><a href="#usage-html-js-3">HTML structure</a></h4>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">&lt;div class="popover"&gt;</code></dt>
    <dd>Relative wrapper for the trigger and inline popover content.
      <dl>
        <dt><code class="highlight language-html">&lt;button type="button" aria-expanded="false" aria-controls="{ POPOVER_ID }"&gt;</code></dt>
        <dd>Trigger button. The script toggles <code>aria-expanded</code> and opens/closes the content.</dd>
        <dt><code class="highlight language-html">&lt;div data-popover id="{ POPOVER_ID }" aria-hidden="true"&gt;</code></dt>
        <dd>Popover content. Set <code>data-side="top|right|bottom|left"</code> and <code>data-align="start|center|end"</code> to control placement.
          <dl>
            <dt><code class="highlight language-html">&lt;header&gt;</code> <span class="badge-secondary">Optional</span></dt>
            <dd>Header area. A heading inside the header is styled as the popover title, and a paragraph is styled as the description.</dd>
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
    <dd>When the popover opens, the component dispatches a custom event on <code>document</code>. Other popover-based components listen for this to close any open popovers.</dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<div class="prose">
  <p>You can use the <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">popover()</code> Nunjucks or Jinja macro for this component.</p>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/popover.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/popover.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{% call popover(
  id="demo-popover",
  trigger="Open popover",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "w-72", "data-align": "center"}
) %}
  <header>
    <h4>Title</h4>
    <p>Description text here.</p>
  </header>
{% endcall %}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code %}
{% call popover(
  id="popover-basic",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  popover_attrs={"class": "w-72"}
) %}
  <header>
    <h4>Title</h4>
    <p>Description text here.</p>
  </header>
{% endcall %}
{% endset %}
{{ code_preview("popover-basic", code | prettyHtml) }}

<h3 id="example-align"><a href="#example-align">Align</a></h3>

{% set code %}<div class="flex flex-wrap gap-3">
  {% call popover(id="popover-align-start", trigger="Start", trigger_attrs={"class": "btn-outline"}, popover_attrs={"class": "w-56", "data-align": "start"}) %}
    <p>Aligned to start.</p>
  {% endcall %}
  {% call popover(id="popover-align-center", trigger="Center", trigger_attrs={"class": "btn-outline"}, popover_attrs={"class": "w-56", "data-align": "center"}) %}
    <p>Aligned to center.</p>
  {% endcall %}
  {% call popover(id="popover-align-end", trigger="End", trigger_attrs={"class": "btn-outline"}, popover_attrs={"class": "w-56", "data-align": "end"}) %}
    <p>Aligned to end.</p>
  {% endcall %}
</div>{% endset %}
{{ code_preview("popover-align", code | prettyHtml) }}

<h3 id="example-form"><a href="#example-form">With Form</a></h3>

{{ code_preview("popover-form", code_form | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Popover alignment uses logical start and end offsets. Set <code>dir="rtl"</code> on a parent to flip start/end alignment.</p>
</section>

{% set code %}<div dir="rtl">
  {% call popover(
    id="popover-rtl",
    trigger="فتح",
    trigger_attrs={"class": "btn-outline"},
    popover_attrs={"class": "w-72", "data-align": "start"}
  ) %}
    <header>
      <h4>العنوان</h4>
      <p>نص الوصف هنا.</p>
    </header>
  {% endcall %}
</div>{% endset %}
{{ code_preview("popover-rtl", code | prettyHtml) }}

<h2 id="api-reference"><a href="#api-reference">API Reference</a></h2>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">.popover</code></dt>
    <dd>Root wrapper. Must contain the trigger button and direct <code>[data-popover]</code> content.</dd>
    <dt><code class="highlight language-html">[data-popover]</code></dt>
    <dd>Popover content. Supports <code>data-side</code>, <code>data-align</code>, and <code>aria-hidden</code>.</dd>
    <dt><code class="highlight language-html">data-side</code></dt>
    <dd>Placement side: <code>top</code>, <code>right</code>, <code>bottom</code>, or <code>left</code>. Defaults to <code>bottom</code>.</dd>
    <dt><code class="highlight language-html">data-align</code></dt>
    <dd>Alignment: <code>start</code>, <code>center</code>, or <code>end</code>. Defaults to <code>start</code>.</dd>
  </dl>
</section>
