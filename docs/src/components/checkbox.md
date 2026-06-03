---
templateEngineOverride: njk
layout: layouts/page.njk
title: Checkbox
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
      - label: Disabled
        id: example-disabled
      - label: Group
        id: example-group
      - label: Table
        id: example-table
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<div role="group" class="field flex-row items-center gap-3">
  <input type="checkbox" id="terms" class="input">
  <label for="terms">Accept terms and conditions</label>
</div>{% endset %}
{{ code_preview("checkbox", code) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>input</code> class to your <code>&lt;input type="checkbox"&gt;</code> elements. Pair it with <a href="/components/field">Field</a> and a native <code>&lt;label&gt;</code> for proper layout and labeling.</p>
</section>

{% set code %}<input type="checkbox" class="input">{% endset %}
{{ code_block(code) }}

<h2 id="checked-state"><a href="#checked-state">Checked state</a></h2>

<section class="prose">
  <p>Use native HTML attributes for state. Add <code>checked</code> for an initially checked checkbox, or read and update the element's <code>checked</code> property in JavaScript.</p>
</section>

{% set code %}<input type="checkbox" class="input" checked>{% endset %}
{{ code_block(code) }}

<h2 id="invalid-state"><a href="#invalid-state">Invalid state</a></h2>

<section class="prose">
  <p>Set <code>aria-invalid="true"</code> on the checkbox and, when using <code>field</code>, set <code>data-invalid="true"</code> on the field wrapper.</p>
</section>

{% set code %}<div role="group" class="field flex-row items-start gap-3" data-invalid="true">
  <input type="checkbox" id="invalid-checkbox" class="input" aria-invalid="true">
  <div class="grid gap-1.5">
    <label for="invalid-checkbox">Accept terms and conditions</label>
    <p class="field-error">You must accept the terms to continue.</p>
  </div>
</div>{% endset %}
{{ code_preview("checkbox-invalid", code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code %}<div role="group" class="field flex-row items-center gap-3">
  <input type="checkbox" id="checkbox-basic" class="input">
  <label for="checkbox-basic">Accept terms and conditions</label>
</div>{% endset %}
{{ code_preview("checkbox-basic", code) }}

<h3 id="example-description"><a href="#example-description">Description</a></h3>

{% set code %}<div role="group" class="field flex-row items-start gap-3">
  <input type="checkbox" id="checkbox-description" class="input" aria-describedby="checkbox-description-text">
  <div class="grid gap-1.5">
    <label for="checkbox-description">Accept terms and conditions</label>
    <p id="checkbox-description-text" class="field-description">By clicking this checkbox, you agree to the terms and conditions.</p>
  </div>
</div>{% endset %}
{{ code_preview("checkbox-description", code) }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}<div role="group" class="field flex-row items-center gap-3" data-disabled="true">
  <input type="checkbox" id="checkbox-disabled" class="input" disabled>
  <label for="checkbox-disabled">Accept terms and conditions</label>
</div>{% endset %}
{{ code_preview("checkbox-disabled", code) }}

<h3 id="example-group"><a href="#example-group">Group</a></h3>

{% set code %}<fieldset class="fieldset">
  <legend>Sidebar</legend>
  <p>Select the items you want to display in the sidebar.</p>
  <div role="group" aria-label="Sidebar items" data-slot="checkbox-group">
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="checkbox" id="checkbox-recents" checked>
      <label for="checkbox-recents">Recents</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="checkbox" id="checkbox-home" checked>
      <label for="checkbox-home">Home</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="checkbox" id="checkbox-applications">
      <label for="checkbox-applications">Applications</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="checkbox" id="checkbox-desktop">
      <label for="checkbox-desktop">Desktop</label>
    </div>
  </div>
</fieldset>{% endset %}
{{ code_preview("checkbox-group", code) }}

<h3 id="example-table"><a href="#example-table">Table</a></h3>

{% set code %}<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th><input type="checkbox" class="input" aria-label="Select all"></th>
        <th>Status</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" class="input" aria-label="Select row 1" checked></td>
        <td>Active</td>
        <td>olivia@example.com</td>
      </tr>
      <tr>
        <td><input type="checkbox" class="input" aria-label="Select row 2"></td>
        <td>Inactive</td>
        <td>noah@example.com</td>
      </tr>
    </tbody>
  </table>
</div>{% endset %}
{{ code_preview("checkbox-table", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Checkbox layout uses document direction and logical spacing. Set <code>dir="rtl"</code> on a parent to render right-to-left.</p>
</section>

{% set code %}<div dir="rtl" class="field flex-row items-start gap-3">
  <input type="checkbox" id="checkbox-rtl" class="input" aria-describedby="checkbox-rtl-description" checked>
  <div class="grid gap-1.5">
    <label for="checkbox-rtl">قبول الشروط والأحكام</label>
    <p id="checkbox-rtl-description" class="field-description">يمكنك تغيير هذا الخيار في أي وقت.</p>
  </div>
</div>{% endset %}
{{ code_preview("checkbox-rtl", code) }}
