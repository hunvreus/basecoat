---
templateEngineOverride: njk
layout: layouts/page.njk
title: Badge
description: Displays a badge or a component that looks like a badge.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Primary
        id: example-primary
      - label: Secondary
        id: example-secondary
      - label: Destructive
        id: example-destructive
      - label: Outline
        id: example-outline
      - label: With icon
        id: example-with-icon
      - label: Link
        id: example-link
      - label: Custom Colors
        id: example-custom-colors
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}
<div class="flex flex-col items-center gap-2">
  <div class="flex w-full flex-wrap gap-2">
    <span class="badge">Badge</span>
    <span class="badge-secondary">Secondary</span>
    <span class="badge-destructive">Destructive</span>
    <span class="badge-outline">Outline</span>
  </div>
  <div class="flex w-full flex-wrap gap-2">
    <span class="badge-secondary bg-blue-500 text-white dark:bg-blue-600">
      {% lucide "badge-check" %}
      Verified
    </span>
    <span class="badge rounded-full h-5 min-w-5 px-1 font-mono tabular-nums">8</span>
    <span class="badge-destructive rounded-full h-5 min-w-5 px-1 font-mono tabular-nums">99</span>
    <span class="badge-outline rounded-full h-5 min-w-5 px-1 font-mono tabular-nums">20+</span>
  </div>
</div>
{% endset %}
{{ code_preview("badge", code) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Use one of the badge classes: <code>badge</code>, <code>badge-primary</code>, <code>badge-secondary</code>, <code>badge-destructive</code>, <code>badge-outline</code>, <code>badge-ghost</code>, or <code>badge-link</code>.</p>
  <p>When an icon needs directional spacing, add <code>data-icon="inline-start"</code> or <code>data-icon="inline-end"</code> to the icon.</p>
</section>

{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-primary"><a href="#example-primary">Primary</a></h3>

{% set code %}<span class="badge">Primary</span>{% endset %}
{{ code_preview("badge-primary", code) }}

<h3 id="example-secondary"><a href="#example-secondary">Secondary</a></h3>

{% set code %}<span class="badge-secondary">Secondary</span>{% endset %}
{{ code_preview("badge-secondary", code) }}

<h3 id="example-destructive"><a href="#example-destructive">Destructive</a></h3>

{% set code %}<span class="badge-destructive">Destructive</span>{% endset %}
{{ code_preview("badge-destructive", code) }}

<h3 id="example-outline"><a href="#example-outline">Outline</a></h3>

{% set code %}<span class="badge-outline">Outline</span>{% endset %}
{{ code_preview("badge-outline", code) }}

<h3 id="example-with-icon"><a href="#example-with-icon">With icon</a></h3>

{% set code %}<span class="badge-destructive">
  {% lucide "circle-alert" %}
  With icon
</span>{% endset %}
{{ code_preview("badge-with-icon", code) }}

<h3 id="example-link"><a href="#example-link">Link</a></h3>

{% set code %}<a href="#" class="badge-outline">
  Link
  {% lucide "arrow-right", { "data-icon": "inline-end", "class": "rtl:rotate-180" } %}
</a>{% endset %}
{{ code_preview("badge-link", code) }}

<h3 id="example-custom-colors"><a href="#example-custom-colors">Custom Colors</a></h3>

{% set code %}<span class="badge bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
  Custom
</span>{% endset %}
{{ code_preview("badge-custom-colors", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Badges support right-to-left layouts through native text flow and logical icon spacing. Directional icons should be flipped explicitly.</p>
</section>

{% set code %}<div dir="rtl" class="flex flex-wrap gap-2">
  <span class="badge">نشط</span>
  <a href="#" class="badge-outline">
    التفاصيل
    {% lucide "arrow-right", { "data-icon": "inline-end", "class": "rtl:rotate-180" } %}
  </a>
</div>{% endset %}
{{ code_preview("badge-rtl", code) }}
