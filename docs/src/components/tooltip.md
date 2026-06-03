---
templateEngineOverride: njk
layout: layouts/page.njk
title: Tooltip
description: A popup that displays information related to an element when the mouse hovers over it.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Default
        id: example-default
      - label: Sides
        id: example-sides
      - label: Icon Button
        id: example-icon-button
      - label: Disabled Button
        id: example-disabled-button
      - label: Link
        id: example-link
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<button class="btn-outline" data-tooltip="Add to library">Hover</button>{% endset %}
{{ code_preview("tooltip", code) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add <code>data-tooltip</code> to the trigger element. Use <code>data-side</code> and <code>data-align</code> to change the position.</p>
  <p>Basecoat tooltips are CSS-only and text-only. This intentionally differs from shadcn/ui's composed tooltip content, which can render arbitrary markup and uses a portal.</p>
</section>

{% set code %}<button class="btn-outline" data-tooltip="Tooltip text" data-side="bottom" data-align="center">Bottom</button>{% endset %}
{{ code_block(code | prettyHtml, "html") }}

<section class="prose">
  <dl>
    <dt><code>data-tooltip</code></dt>
    <dd>Tooltip text.</dd>
    <dt><code>data-side</code> <span class="badge-secondary">Optional</span></dt>
    <dd><code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, <code>inline-start</code>, or <code>inline-end</code>. Defaults to <code>top</code>.</dd>
    <dt><code>data-align</code> <span class="badge-secondary">Optional</span></dt>
    <dd><code>start</code>, <code>center</code>, or <code>end</code>. Defaults to <code>center</code>.</dd>
  </dl>
</section>

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-default"><a href="#example-default">Default</a></h3>

{% set code %}<button class="btn-outline" data-tooltip="Default tooltip">Default</button>{% endset %}
{{ code_preview("tooltip-default", code) }}

<h3 id="example-sides"><a href="#example-sides">Sides</a></h3>

{% set code %}<div class="flex flex-wrap gap-2">
  <button class="btn-outline" data-tooltip="Tooltip" data-side="inline-start">Inline Start</button>
  <button class="btn-outline" data-tooltip="Tooltip" data-side="top">Top</button>
  <button class="btn-outline" data-tooltip="Tooltip" data-side="bottom">Bottom</button>
  <button class="btn-outline" data-tooltip="Tooltip" data-side="inline-end">Inline End</button>
</div>{% endset %}
{{ code_preview("tooltip-sides", code) }}

<h3 id="example-icon-button"><a href="#example-icon-button">Icon Button</a></h3>

{% set code %}<button class="btn-icon-ghost" data-tooltip="Additional information">
  {% lucide "info" %}
  <span class="sr-only">Info</span>
</button>{% endset %}
{{ code_preview("tooltip-icon-button", code) }}

<h3 id="example-disabled-button"><a href="#example-disabled-button">Disabled Button</a></h3>

{% set code %}<span class="inline-block" data-tooltip="This feature is currently unavailable">
  <button class="btn-outline" disabled>Disabled</button>
</span>{% endset %}
{{ code_preview("tooltip-disabled-button", code) }}

<h3 id="example-link"><a href="#example-link">Link</a></h3>

{% set code %}<a href="#" class="text-primary text-sm underline-offset-4 hover:underline" data-tooltip="Click to read the documentation">Learn more</a>{% endset %}
{{ code_preview("tooltip-link", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

{% set code %}<div dir="rtl" class="flex gap-2">
  <button class="btn-outline" data-tooltip="تلميح" data-side="inline-start">Inline Start</button>
  <button class="btn-outline" data-tooltip="تلميح" data-side="inline-end">Inline End</button>
</div>{% endset %}
{{ code_preview("tooltip-rtl", code) }}
