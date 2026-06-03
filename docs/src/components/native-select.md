---
templateEngineOverride: njk
layout: layouts/page.njk
title: Native Select
description: A styled native HTML select element with consistent design system integration.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Groups
        id: example-groups
      - label: Disabled
        id: example-disabled
      - label: Invalid
        id: example-invalid
      - label: Size
        id: example-size
      - label: RTL
        id: example-rtl
  - label: Native Select vs Select
    id: native-select-vs-select
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<select class="select w-[180px]" aria-label="Fruit">
  <option value="">Select a fruit</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="blueberry">Blueberry</option>
  <option value="pineapple">Pineapple</option>
</select>{% endset %}
{{ code_preview("native-select", code) }}

<section class="prose mt-6">
  <p>For a custom listbox with richer styling and JavaScript behavior, see the <a href="/components/select">Select</a> component.</p>
</section>

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>select</code> class to a native <code>&lt;select&gt;</code>. Use standard <code>&lt;option&gt;</code> and <code>&lt;optgroup&gt;</code> elements.</p>
</section>

{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-groups"><a href="#example-groups">Groups</a></h3>

{% set code %}<select class="select w-[220px]" aria-label="Food">
  <option value="">Select food</option>
  <optgroup label="Fruits">
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="blueberry">Blueberry</option>
  </optgroup>
  <optgroup label="Vegetables">
    <option value="carrot">Carrot</option>
    <option value="potato">Potato</option>
    <option value="tomato">Tomato</option>
  </optgroup>
</select>{% endset %}
{{ code_preview("native-select-groups", code) }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}<select class="select w-[220px]" aria-label="Fruit" disabled>
  <option value="">Select a fruit</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
</select>{% endset %}
{{ code_preview("native-select-disabled", code) }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code %}<div role="group" class="field" data-invalid="true">
  <label for="native-select-invalid">Fruit</label>
  <select id="native-select-invalid" class="select w-full" aria-invalid="true" aria-describedby="native-select-invalid-error">
    <option value="">Select a fruit</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
  </select>
  <p id="native-select-invalid-error" class="field-error">Select a fruit to continue.</p>
</div>{% endset %}
{{ code_preview("native-select-invalid", code, "w-full max-w-sm") }}

<h3 id="example-size"><a href="#example-size">Size</a></h3>

{% set code %}<div class="flex flex-wrap items-center gap-3">
  <select class="select w-[180px]" aria-label="Default size">
    <option>Default</option>
    <option>Apple</option>
    <option>Banana</option>
  </select>
  <select class="select w-[180px]" data-size="sm" aria-label="Small size">
    <option>Small</option>
    <option>Apple</option>
    <option>Banana</option>
  </select>
</div>{% endset %}
{{ code_preview("native-select-size", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Native select supports document direction. Set <code>dir="rtl"</code> on the select or a parent element.</p>
</section>

{% set code %}<select dir="rtl" class="select w-[220px]" aria-label="الفاكهة">
  <option value="">اختر فاكهة</option>
  <option value="apple">تفاح</option>
  <option value="banana">موز</option>
  <option value="blueberry">توت</option>
</select>{% endset %}
{{ code_preview("native-select-rtl", code) }}

<h2 id="native-select-vs-select"><a href="#native-select-vs-select">Native Select vs Select</a></h2>

<section class="prose">
  <ul>
    <li>Use <strong>Native Select</strong> for native browser behavior, better performance, form integration, and mobile-optimized pickers.</li>
    <li>Use <strong>Select</strong> for a custom popover, richer option content, multi-select behavior, or custom JavaScript events.</li>
  </ul>
</section>
