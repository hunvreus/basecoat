---
templateEngineOverride: njk
layout: layouts/page.njk
title: Radio Group
description: A set of checkable buttons where only one option can be selected at a time.
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
      - label: Fieldset
        id: example-fieldset
      - label: Disabled
        id: example-disabled
      - label: Invalid
        id: example-invalid
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<fieldset class="fieldset">
  <legend>Plan</legend>
  <div role="radiogroup" aria-label="Plan" data-slot="radio-group">
    <div role="group" class="field flex-row items-center gap-3">
      <input type="radio" id="plan-free" name="plan" value="free" class="input" checked>
      <label for="plan-free">Free</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input type="radio" id="plan-pro" name="plan" value="pro" class="input">
      <label for="plan-pro">Pro</label>
    </div>
  </div>
</fieldset>{% endset %}
{{ code_preview("radio-group", code, "w-full max-w-sm") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>input</code> class to your <code>&lt;input type="radio"&gt;</code> elements. Use a shared <code>name</code> attribute for mutually exclusive options, and wrap related options in a semantic <code>&lt;fieldset&gt;</code> or an element with <code>role="radiogroup"</code>.</p>
</section>

{% set code %}<input type="radio" name="plan" class="input">{% endset %}
{{ code_block(code) }}

<h2 id="checked-state"><a href="#checked-state">Checked state</a></h2>

<section class="prose">
  <p>Use native HTML state. Add <code>checked</code> for the initially selected option, or read and update the element's <code>checked</code> property in JavaScript.</p>
</section>

{% set code %}<input type="radio" name="plan" class="input" checked>{% endset %}
{{ code_block(code) }}

<h2 id="invalid-state"><a href="#invalid-state">Invalid state</a></h2>

<section class="prose">
  <p>Set <code>aria-invalid="true"</code> on the invalid radio and, when using <code>field</code>, set <code>data-invalid="true"</code> on the field wrapper.</p>
</section>

{% set code %}<div role="group" class="field flex-row items-start gap-3" data-invalid="true">
  <input type="radio" id="radio-invalid" name="radio-invalid" class="input" aria-invalid="true">
  <div class="grid gap-1.5">
    <label for="radio-invalid">I agree to the terms</label>
    <p class="field-error">You must select an option to continue.</p>
  </div>
</div>{% endset %}
{{ code_preview("radio-invalid-state", code, "w-full max-w-sm") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-basic"><a href="#example-basic">Basic</a></h3>

{% set code %}<div role="radiogroup" aria-label="View density" data-slot="radio-group">
  <div role="group" class="field flex-row items-center gap-3">
    <input type="radio" id="density-default" name="density" value="default" class="input">
    <label for="density-default">Default</label>
  </div>
  <div role="group" class="field flex-row items-center gap-3">
    <input type="radio" id="density-comfortable" name="density" value="comfortable" class="input" checked>
    <label for="density-comfortable">Comfortable</label>
  </div>
  <div role="group" class="field flex-row items-center gap-3">
    <input type="radio" id="density-compact" name="density" value="compact" class="input">
    <label for="density-compact">Compact</label>
  </div>
</div>{% endset %}
{{ code_preview("radio-basic", code, "w-full max-w-sm") }}

<h3 id="example-description"><a href="#example-description">Description</a></h3>

{% set code %}<div role="radiogroup" aria-label="Notifications" data-slot="radio-group">
  <div role="group" class="field flex-row items-start gap-3">
    <input type="radio" id="notify-all" name="notifications" value="all" class="input" checked aria-describedby="notify-all-description">
    <div class="grid gap-1.5">
      <label for="notify-all">All new messages</label>
      <p id="notify-all-description" class="field-description">Receive a notification for every new message.</p>
    </div>
  </div>
  <div role="group" class="field flex-row items-start gap-3">
    <input type="radio" id="notify-mentions" name="notifications" value="mentions" class="input" aria-describedby="notify-mentions-description">
    <div class="grid gap-1.5">
      <label for="notify-mentions">Direct messages and mentions</label>
      <p id="notify-mentions-description" class="field-description">Only notify me for direct messages and mentions.</p>
    </div>
  </div>
</div>{% endset %}
{{ code_preview("radio-description", code, "w-full max-w-sm") }}

<h3 id="example-choice-card"><a href="#example-choice-card">Choice Card</a></h3>

<section class="prose">
  <p>Wrap a <code>.field</code> in a native <code>&lt;label&gt;</code> when the whole card should select the option.</p>
</section>

{% set code %}<div role="radiogroup" aria-label="Plans" data-slot="radio-group" class="w-full max-w-md">
  <label>
    <div role="group" class="field flex-row items-center justify-between">
      <div class="grid gap-1.5">
        <span>Starter</span>
        <span class="field-description">For small teams getting started.</span>
      </div>
      <input type="radio" name="choice-plan" value="starter" class="input" checked>
    </div>
  </label>
  <label>
    <div role="group" class="field flex-row items-center justify-between">
      <div class="grid gap-1.5">
        <span>Team</span>
        <span class="field-description">Collaboration tools for growing teams.</span>
      </div>
      <input type="radio" name="choice-plan" value="team" class="input">
    </div>
  </label>
</div>{% endset %}
{{ code_preview("radio-choice-card", code, "w-full") }}

<h3 id="example-fieldset"><a href="#example-fieldset">Fieldset</a></h3>

{% set code %}<fieldset class="fieldset">
  <legend>Notify me about...</legend>
  <div role="radiogroup" aria-label="Notification preference" data-slot="radio-group">
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="radio" id="notify-all-fieldset" name="notify-fieldset" value="all" checked>
      <label for="notify-all-fieldset">All new messages</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="radio" id="notify-mentions-fieldset" name="notify-fieldset" value="mentions">
      <label for="notify-mentions-fieldset">Direct messages and mentions</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3">
      <input class="input" type="radio" id="notify-none-fieldset" name="notify-fieldset" value="none">
      <label for="notify-none-fieldset">Nothing</label>
    </div>
  </div>
</fieldset>{% endset %}
{{ code_preview("radio-fieldset", code, "w-full max-w-sm") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}<div role="radiogroup" aria-label="Disabled notifications" data-slot="radio-group">
  <div role="group" class="field flex-row items-center gap-3" data-disabled="true">
    <input type="radio" id="radio-disabled" name="radio-disabled" class="input" disabled>
    <label for="radio-disabled">Disabled option</label>
  </div>
  <div role="group" class="field flex-row items-center gap-3" data-disabled="true">
    <input type="radio" id="radio-disabled-checked" name="radio-disabled" class="input" checked disabled>
    <label for="radio-disabled-checked">Disabled checked option</label>
  </div>
</div>{% endset %}
{{ code_preview("radio-disabled", code, "w-full max-w-sm") }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code %}<fieldset class="fieldset" data-invalid="true">
  <legend>Plan</legend>
  <div role="radiogroup" aria-label="Invalid plan" data-slot="radio-group" aria-describedby="radio-group-error">
    <div role="group" class="field flex-row items-center gap-3" data-invalid="true">
      <input type="radio" id="radio-invalid-free" name="radio-invalid-plan" class="input" aria-invalid="true">
      <label for="radio-invalid-free">Free</label>
    </div>
    <div role="group" class="field flex-row items-center gap-3" data-invalid="true">
      <input type="radio" id="radio-invalid-pro" name="radio-invalid-plan" class="input" aria-invalid="true">
      <label for="radio-invalid-pro">Pro</label>
    </div>
  </div>
  <p id="radio-group-error" class="field-error">Select a plan to continue.</p>
</fieldset>{% endset %}
{{ code_preview("radio-invalid", code, "w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Radio group layout uses document direction and logical spacing. Set <code>dir="rtl"</code> on a parent to render right-to-left.</p>
</section>

{% set code %}<div dir="rtl" role="radiogroup" aria-label="طريقة العرض" data-slot="radio-group">
  <div role="group" class="field flex-row items-center gap-3">
    <input type="radio" id="radio-rtl-default" name="radio-rtl" value="default" class="input" checked>
    <label for="radio-rtl-default">افتراضي</label>
  </div>
  <div role="group" class="field flex-row items-center gap-3">
    <input type="radio" id="radio-rtl-comfortable" name="radio-rtl" value="comfortable" class="input">
    <label for="radio-rtl-comfortable">مريح</label>
  </div>
</div>{% endset %}
{{ code_preview("radio-rtl", code, "w-full max-w-sm") }}
