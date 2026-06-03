---
templateEngineOverride: njk
layout: layouts/page.njk
title: Input
description: A text input component for forms and user data entry with built-in styling and accessibility features.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Basic
        id: example-basic
      - label: Field
        id: example-field
      - label: Field Group
        id: example-field-group
      - label: Disabled
        id: example-disabled
      - label: Invalid
        id: example-invalid
      - label: File
        id: example-file
      - label: Inline
        id: example-inline
      - label: Grid
        id: example-grid
      - label: Required
        id: example-required
      - label: Badge
        id: example-badge
      - label: Input Group
        id: example-input-group
      - label: Button Group
        id: example-button-group
      - label: Form
        id: example-form
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<input class="input" type="email" placeholder="Email">{% endset %}
{{ code_preview("input", code, class="w-full max-w-xs") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>input</code> class to supported <code>&lt;input&gt;</code> elements. Inputs inside a <code>form</code> or <code>field</code> container also receive the same styling automatically for common text-like input types.</p>
  <p>Use native HTML attributes for behavior: <code>disabled</code> for disabled inputs, <code>required</code> for required fields, and <code>aria-invalid="true"</code> for invalid state styling.</p>
</section>

{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code_basic %}<input class="input" type="email" placeholder="Email">{% endset %}
{{ code_preview("input-basic", code_basic, class="w-full max-w-xs") }}

<h3 id="example-field"><a href="#example-field">Field</a></h3>

<section class="prose">
  <p>Use <code>field</code> with a label and description to create an accessible field.</p>
</section>

{% set code_field %}<div role="group" class="field w-full max-w-xs">
  <label for="input-field">Email</label>
  <input id="input-field" type="email" placeholder="m@example.com">
  <p>Enter your email address.</p>
</div>{% endset %}
{{ code_preview("input-field", code_field, class="w-full max-w-xs") }}

<h3 id="example-field-group"><a href="#example-field-group">Field Group</a></h3>

{% set code_field_group %}<div class="grid w-full max-w-xs gap-4">
  <div role="group" class="field">
    <label for="input-first-name">First name</label>
    <input id="input-first-name" type="text" placeholder="Jane">
  </div>
  <div role="group" class="field">
    <label for="input-last-name">Last name</label>
    <input id="input-last-name" type="text" placeholder="Doe">
  </div>
</div>{% endset %}
{{ code_preview("input-field-group", code_field_group, class="w-full max-w-xs") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code_disabled %}<input class="input" type="email" placeholder="Email" disabled>{% endset %}
{{ code_preview("input-disabled", code_disabled, class="w-full max-w-xs") }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code_invalid %}<div role="group" class="field w-full max-w-xs">
  <label for="input-invalid">Email</label>
  <input class="input" id="input-invalid" type="email" placeholder="Email" aria-invalid="true">
  <p>Please enter a valid email address.</p>
</div>{% endset %}
{{ code_preview("input-invalid", code_invalid, class="w-full max-w-xs") }}

<h3 id="example-file"><a href="#example-file">File</a></h3>

{% set code_file %}<input class="input" type="file">{% endset %}
{{ code_preview("input-file", code_file, class="w-full max-w-xs") }}

<h3 id="example-inline"><a href="#example-inline">Inline</a></h3>

{% set code_inline %}<div class="flex w-full max-w-xs items-center gap-2">
  <input class="input" type="search" placeholder="Search...">
  <button type="submit" class="btn">Search</button>
</div>{% endset %}
{{ code_preview("input-inline", code_inline, class="w-full max-w-xs") }}

<h3 id="example-grid"><a href="#example-grid">Grid</a></h3>

{% set code_grid %}<div class="grid w-full gap-4 md:grid-cols-2">
  <input class="input" type="text" placeholder="First name">
  <input class="input" type="text" placeholder="Last name">
  <input class="input md:col-span-2" type="email" placeholder="Email">
</div>{% endset %}
{{ code_preview("input-grid", code_grid, class="w-full max-w-xl") }}

<h3 id="example-required"><a href="#example-required">Required</a></h3>

{% set code_required %}<div role="group" class="field w-full max-w-xs">
  <label for="input-required">Username <span class="text-destructive">*</span></label>
  <input id="input-required" type="text" placeholder="hunvreus" required>
</div>{% endset %}
{{ code_preview("input-required", code_required, class="w-full max-w-xs") }}

<h3 id="example-badge"><a href="#example-badge">Badge</a></h3>

{% set code_badge %}<div role="group" class="field w-full max-w-xs">
  <label for="input-badge" class="flex items-center gap-2">
    Email
    <span class="badge-secondary">Recommended</span>
  </label>
  <input id="input-badge" type="email" placeholder="m@example.com">
</div>{% endset %}
{{ code_preview("input-badge", code_badge, class="w-full max-w-xs") }}

<h3 id="example-input-group"><a href="#example-input-group">Input Group</a></h3>

<section class="prose">
  <p>Use the <a href="/components/input-group/">Input Group</a> patterns to add icons, text, or buttons inside an input.</p>
</section>

{% set code_input_group %}<div class="relative w-full max-w-xs">
  <input class="input ps-9" type="search" placeholder="Search...">
  <div class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">
    {% lucide "search" %}
  </div>
</div>{% endset %}
{{ code_preview("input-input-group", code_input_group, class="w-full max-w-xs") }}

<h3 id="example-button-group"><a href="#example-button-group">Button Group</a></h3>

<section class="prose">
  <p>Use <a href="/components/button-group/">Button Group</a> when an input should be grouped with adjacent buttons.</p>
</section>

{% set code_button_group %}<div role="group" aria-label="Search" class="button-group w-full max-w-xs">
  <input class="input" type="search" placeholder="Search...">
  <button type="submit" class="btn-icon-outline" aria-label="Search">
    {% lucide "search" %}
  </button>
</div>{% endset %}
{{ code_preview("input-button-group", code_button_group, class="w-full max-w-xs") }}

<h3 id="example-form"><a href="#example-form">Form</a></h3>

{% set code_form %}<form class="w-full max-w-sm space-y-6">
  <div role="group" class="field">
    <label for="input-form-username">Username</label>
    <input id="input-form-username" type="text" placeholder="hunvreus" required>
    <p>This is your public display name.</p>
  </div>
  <div role="group" class="field">
    <label for="input-form-email">Email</label>
    <input id="input-form-email" type="email" placeholder="m@example.com" required>
  </div>
  <button type="submit" class="btn">Submit</button>
</form>{% endset %}
{{ code_preview("input-form", code_form, class="w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Inputs support right-to-left layouts through native browser direction handling. Add <code>dir="rtl"</code> to the input, field, or an ancestor.</p>
</section>

{% set code_rtl %}<div role="group" class="field w-full max-w-xs" dir="rtl">
  <label for="input-rtl-api-key">مفتاح API</label>
  <input id="input-rtl-api-key" type="password" placeholder="sk-...">
  <p>مفتاح API الخاص بك مشفر ومخزن بأمان.</p>
</div>{% endset %}
{{ code_preview("input-rtl", code_rtl, class="w-full max-w-xs") }}
