---
templateEngineOverride: njk
layout: layouts/page.njk
title: Switch
description: A control that allows the user to toggle between checked and not checked.
toc:
  - label: Usage
    id: usage
  - label: Checked state
    id: checked-state
  - label: Invalid state
    id: invalid-state
  - label: Examples
    id: examples
    children:
      - label: Basic
        id: example-basic
      - label: Description
        id: example-description
      - label: Choice Card
        id: example-choice-card
      - label: Disabled
        id: example-disabled
      - label: Invalid
        id: example-invalid
      - label: Size
        id: example-size
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<div role="group" class="field flex-row items-center justify-between">
  <label for="airplane-mode">Airplane Mode</label>
  <input type="checkbox" id="airplane-mode" role="switch" class="input">
</div>{% endset %}
{{ code_preview("switch", code, "w-full max-w-sm") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add <code>role="switch"</code> and the <code>input</code> class to a native <code>&lt;input type="checkbox"&gt;</code>. Use a native <code>&lt;label&gt;</code> or <code>aria-label</code> for accessible naming.</p>
</section>

{% set code %}<input type="checkbox" role="switch" class="input">{% endset %}
{{ code_block(code) }}

<h2 id="checked-state"><a href="#checked-state">Checked state</a></h2>

<section class="prose">
  <p>Use native HTML state. Add <code>checked</code> for an initially enabled switch, or read and update the element's <code>checked</code> property in JavaScript.</p>
</section>

{% set code %}<input type="checkbox" role="switch" class="input" checked>{% endset %}
{{ code_block(code) }}

<h2 id="invalid-state"><a href="#invalid-state">Invalid state</a></h2>

<section class="prose">
  <p>Set <code>aria-invalid="true"</code> on the switch and, when using <code>field</code>, set <code>data-invalid="true"</code> on the field wrapper.</p>
</section>

{% set code %}<div role="group" class="field flex-row items-start justify-between gap-3" data-invalid="true">
  <div class="grid gap-1.5">
    <label for="switch-invalid-state">Marketing emails</label>
    <p class="field-error">Choose whether marketing emails are enabled.</p>
  </div>
  <input type="checkbox" id="switch-invalid-state" role="switch" class="input" aria-invalid="true">
</div>{% endset %}
{{ code_preview("switch-invalid-state", code, "w-full max-w-sm") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code %}<div role="group" class="field flex-row items-center justify-between">
  <label for="switch-basic">Airplane Mode</label>
  <input type="checkbox" id="switch-basic" role="switch" class="input">
</div>{% endset %}
{{ code_preview("switch-basic", code, "w-full max-w-sm") }}

<h3 id="example-description"><a href="#example-description">Description</a></h3>

{% set code %}<div role="group" class="field flex-row items-start justify-between gap-3">
  <div class="grid gap-1.5">
    <label for="switch-description">Marketing emails</label>
    <p id="switch-description-text" class="field-description">Receive emails about new products, features, and more.</p>
  </div>
  <input type="checkbox" id="switch-description" role="switch" class="input" aria-describedby="switch-description-text" checked>
</div>{% endset %}
{{ code_preview("switch-description", code, "w-full max-w-sm") }}

<h3 id="example-choice-card"><a href="#example-choice-card">Choice Card</a></h3>

<section class="prose">
  <p>Wrap a <code>.field</code> in a native <code>&lt;label&gt;</code> when the whole card should toggle the switch.</p>
</section>

{% set code %}<label class="w-full max-w-md">
  <div role="group" class="field flex-row items-center justify-between">
    <div class="grid gap-1.5">
      <span>Marketing emails</span>
      <span class="field-description">Receive emails about new products, features, and more.</span>
    </div>
    <input type="checkbox" role="switch" class="input" checked>
  </div>
</label>{% endset %}
{{ code_preview("switch-choice-card", code, "w-full") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}<div role="group" class="field flex-row items-center justify-between" data-disabled="true">
  <label for="switch-disabled">Airplane Mode</label>
  <input type="checkbox" id="switch-disabled" role="switch" class="input" disabled>
</div>{% endset %}
{{ code_preview("switch-disabled", code, "w-full max-w-sm") }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code %}<div role="group" class="field flex-row items-start justify-between gap-3" data-invalid="true">
  <div class="grid gap-1.5">
    <label for="switch-invalid">Marketing emails</label>
    <p class="field-error">Choose whether marketing emails are enabled.</p>
  </div>
  <input type="checkbox" id="switch-invalid" role="switch" class="input" aria-invalid="true">
</div>{% endset %}
{{ code_preview("switch-invalid", code, "w-full max-w-sm") }}

<h3 id="example-size"><a href="#example-size">Size</a></h3>

{% set code %}<div class="grid gap-4">
  <div role="group" class="field flex-row items-center justify-between">
    <label for="switch-size-default">Default</label>
    <input type="checkbox" id="switch-size-default" role="switch" class="input" checked>
  </div>
  <div role="group" class="field flex-row items-center justify-between">
    <label for="switch-size-sm">Small</label>
    <input type="checkbox" id="switch-size-sm" role="switch" class="input" data-size="sm" checked>
  </div>
</div>{% endset %}
{{ code_preview("switch-size", code, "w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Switch field layout uses document direction. Set <code>dir="rtl"</code> on a parent to render right-to-left.</p>
</section>

{% set code %}<div dir="rtl" class="field flex-row items-center justify-between">
  <label for="switch-rtl">وضع الطيران</label>
  <input type="checkbox" id="switch-rtl" role="switch" class="input" checked>
</div>{% endset %}
{{ code_preview("switch-rtl", code, "w-full max-w-sm") }}
