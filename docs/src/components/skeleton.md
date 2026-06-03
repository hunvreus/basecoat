---
templateEngineOverride: njk
layout: layouts/page.njk
title: Skeleton
description: Used to show a placeholder while content is loading.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Avatar
        id: example-avatar
      - label: Card
        id: example-card
      - label: Text
        id: example-text
      - label: Form
        id: example-form
      - label: Table
        id: example-table
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<div class="flex items-center gap-4">
  <div class="skeleton size-10 shrink-0 rounded-full"></div>
  <div class="grid gap-2">
    <div class="skeleton h-4 w-[150px]"></div>
    <div class="skeleton h-4 w-[100px]"></div>
  </div>
</div>{% endset %}
{{ code_preview("skeleton", code | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<p class="prose">Use the <code>skeleton</code> class with sizing utilities to create loading placeholders.</p>

{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-avatar"><a href="#example-avatar">Avatar</a></h3>

{% set code %}<div class="flex items-center gap-4">
  <div class="skeleton size-12 rounded-full"></div>
  <div class="grid gap-2">
    <div class="skeleton h-4 w-32"></div>
    <div class="skeleton h-4 w-48"></div>
  </div>
</div>{% endset %}
{{ code_preview("skeleton-avatar", code | prettyHtml) }}

<h3 id="example-card"><a href="#example-card">Card</a></h3>

{% set code %}<div class="card w-full @md:w-auto @md:min-w-sm">
  <header>
    <div class="skeleton h-4 w-2/3"></div>
    <div class="skeleton h-4 w-1/2"></div>
  </header>
  <section>
    <div class="skeleton aspect-square w-full"></div>
  </section>
</div>{% endset %}
{{ code_preview("skeleton-card", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-text"><a href="#example-text">Text</a></h3>

{% set code %}<div class="grid gap-2">
  <div class="skeleton h-4 w-full"></div>
  <div class="skeleton h-4 w-5/6"></div>
  <div class="skeleton h-4 w-2/3"></div>
</div>{% endset %}
{{ code_preview("skeleton-text", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-form"><a href="#example-form">Form</a></h3>

{% set code %}<div class="grid gap-4 w-full max-w-sm">
  <div class="skeleton h-4 w-24"></div>
  <div class="skeleton h-9 w-full"></div>
  <div class="skeleton h-4 w-32"></div>
  <div class="skeleton h-9 w-full"></div>
</div>{% endset %}
{{ code_preview("skeleton-form", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-table"><a href="#example-table">Table</a></h3>

{% set code %}<div class="grid gap-3 w-full">
  <div class="skeleton h-8 w-full"></div>
  <div class="skeleton h-8 w-full"></div>
  <div class="skeleton h-8 w-full"></div>
</div>{% endset %}
{{ code_preview("skeleton-table", code | prettyHtml, "w-full max-w-md") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Skeleton blocks are direction-neutral. Use logical layout utilities around them when spacing depends on direction.</p>
</section>

{% set code %}<div dir="rtl" class="flex items-center gap-4">
  <div class="skeleton size-10 shrink-0 rounded-full"></div>
  <div class="grid gap-2">
    <div class="skeleton h-4 w-[150px]"></div>
    <div class="skeleton h-4 w-[100px]"></div>
  </div>
</div>{% endset %}
{{ code_preview("skeleton-rtl", code | prettyHtml) }}
