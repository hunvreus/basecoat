---
templateEngineOverride: njk
layout: layouts/page.njk
title: Kbd
description: Used to display textual user input from keyboard.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Group
        id: example-group
      - label: Button
        id: example-button
      - label: Input Group
        id: example-input-group
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code_html %}
<div class="flex flex-col items-center gap-4">
  <span class="kbd-group">
    <kbd class="kbd">⌘</kbd>
    <kbd class="kbd">⇧</kbd>
    <kbd class="kbd">⌥</kbd>
    <kbd class="kbd">⌃</kbd>
  </span>
  <span class="kbd-group">
    <kbd class="kbd">Ctrl</kbd>
    <span>+</span>
    <kbd class="kbd">B</kbd>
  </span>
</div>
{% endset %}

{{ code_preview("kbd", code_html | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Use the <code>&lt;kbd&gt;</code> element with the <code>kbd</code> class. Use <code>kbd-group</code> to group multiple keys.</p>
</section>

{% set code_simple %}
<kbd class="kbd">⌘K</kbd>
{% endset %}

{{ code_block(code_simple | prettyHtml, "html") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-group"><a href="#example-group">Group</a></h3>

{% set group_html %}
<p class="text-muted-foreground text-sm">
  Use
  <span class="kbd-group">
    <kbd class="kbd">Ctrl + B</kbd>
    <kbd class="kbd">Ctrl + K</kbd>
  </span>
  to open the command palette
</p>
{% endset %}

{{ code_preview("kbd-group", group_html | prettyHtml) }}

<h3 id="example-button"><a href="#example-button">Button</a></h3>

{% set button_html %}
<div class="flex flex-wrap items-center gap-x-4">
  <button class="btn-sm-outline pe-2">Accept <kbd class="kbd">⏎</kbd></button>
  <button class="btn-sm-outline pe-2">Cancel <kbd class="kbd">Esc</kbd></button>
</div>
{% endset %}

{{ code_preview("kbd-button", button_html | prettyHtml) }}

<h3 id="example-input-group"><a href="#example-input-group">Input Group</a></h3>

{% set input_group_html %}
<div class="relative w-full max-w-sm">
  <input type="search" class="input ps-9 pe-12" placeholder="Search...">
  {% lucide "search", { "class": "absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" } %}
  <kbd class="kbd absolute end-3 top-1/2 -translate-y-1/2">/</kbd>
</div>
{% endset %}

{{ code_preview("kbd-input-group", input_group_html | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Keyboard labels are direction-neutral. Surrounding spacing should use logical utilities when position matters.</p>
</section>

{% set rtl_html %}
<p dir="rtl" class="text-muted-foreground text-sm">
  استخدم
  <span class="kbd-group">
    <kbd class="kbd">Ctrl</kbd>
    <kbd class="kbd">K</kbd>
  </span>
  لفتح البحث
</p>
{% endset %}

{{ code_preview("kbd-rtl", rtl_html | prettyHtml) }}
