---
templateEngineOverride: njk
layout: layouts/page.njk
title: Alert
description: Displays a callout for user attention.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Destructive
        id: example-destructive
      - label: No description
        id: example-no-description
      - label: No icon
        id: example-no-icon
      - label: Action
        id: example-action
      - label: Custom Colors
        id: example-custom-colors
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}
<div class="grid w-full max-w-xl items-start gap-4">
  <div class="alert">
    {% lucide "circle-check" %}
    <h2>Success! Your changes have been saved</h2>
    <section>This is an alert with icon, title and description.</section>
  </div>
  <div class="alert">
    {% lucide "popcorn" %}
    <h2>This Alert has a title and an icon. No description.</h2>
    <section>This is an alert with icon, title and description.</section>
  </div>
  <div class="alert-destructive">
    {% lucide "circle-check" %}
    <h2>Unable to process your payment.</h2>
    <section>
      <p>Please verify your billing information and try again.</p>
      <ul class="list-inside list-disc text-sm">
        <li>Check your card details</li>
        <li>Ensure sufficient funds</li>
        <li>Verify billing address</li>
      </ul>
    </section>
  </div>
</div>
{% endset %}
{{ code_preview("alert", code | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Use the <code>alert</code> or <code>alert-destructive</code>.</p>
</section>

{% set code_simple %}
<div class="alert">
  {% lucide "circle-check" %}
  <h2>Success! Your changes have been saved</h2>
  <section>This is an alert with icon, title and description.</section>
</div>
{% endset %}
{{ code_block(code_simple | prettyHtml) }}

<section class="prose">
  <p>The component has the following HTML structure:</p>
  <dl>
    <dt><code class="highlight language-html">&lt;div class="alert"&gt;</code></dt>
    <dd>Main container. Use <code>alert</code> for default styling or <code>alert-destructive</code> for error states.
      <dl>
        <dt><code class="highlight language-html">&lt;svg&gt;</code> <span class="badge-secondary">Optional</span></dt>
        <dd>The icon.</dd>
        <dt><code class="highlight language-html">&lt;h2&gt;</code></dt>
        <dd>The title.</dd>
        <dt><code class="highlight language-html">&lt;section&gt;</code> <span class="badge-secondary">Optional</span></dt>
        <dd>The description.</dd>
        <dt><code class="highlight language-html">&lt;div data-action&gt;</code> <span class="badge-secondary">Optional</span></dt>
        <dd>An action aligned to the inline end of the alert.</dd>
      </dl>
    </dd>
  </dl>
</section>

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-destructive"><a href="#example-destructive">Destructive</a></h3>

{% set code %}<div class="alert-destructive">
  {% lucide "circle-alert" %}
  <h2>Something went wrong!</h2>
  <section>Your session has expired. Please log in again.</section>
</div>{% endset %}
{{ code_preview("alert-destructive", code) }}

<h3 id="example-no-description"><a href="#example-no-description">No description</a></h3>

{% set code %}
<div class="alert">
  {% lucide "shield-alert" %}
  <h2>This is a very long alert title that demonstrates how the component handles extended text content and potentially wraps across multiple lines</h2>
</div>{% endset %}
{{ code_preview("alert-no-description", code) }}

<h3 id="example-no-icon"><a href="#example-no-icon">No icon</a></h3>

{% set code %}<div class="alert">
  <h2>Success! Your changes have been saved</h2>
  <section>This is an alert with icon, title and description.</section>
</div>{% endset %}
{{ code_preview("alert-no-icon", code) }}

<h3 id="example-action"><a href="#example-action">Action</a></h3>

{% set code %}<div class="alert">
  {% lucide "info" %}
  <h2>Enable notifications</h2>
  <section>Receive updates when there is activity in your workspace.</section>
  <div data-action>
    <button type="button" class="btn-xs-outline">Enable</button>
  </div>
</div>{% endset %}
{{ code_preview("alert-action", code) }}

<h3 id="example-custom-colors"><a href="#example-custom-colors">Custom Colors</a></h3>

{% set code %}<div class="alert bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
  {% lucide "triangle-alert" %}
  <h2>Storage almost full</h2>
  <section class="text-amber-800 dark:text-amber-300">Upgrade your plan or delete unused files.</section>
</div>{% endset %}
{{ code_preview("alert-custom-colors", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Alerts support right-to-left layouts through logical spacing and native text flow. Add <code>dir="rtl"</code> to the alert or an ancestor.</p>
</section>

{% set code %}<div class="alert" dir="rtl">
  {% lucide "info" %}
  <h2>تم حفظ التغييرات</h2>
  <section>تم تحديث إعداداتك بنجاح.</section>
  <div data-action>
    <button type="button" class="btn-xs-outline">عرض</button>
  </div>
</div>{% endset %}
{{ code_preview("alert-rtl", code) }}
