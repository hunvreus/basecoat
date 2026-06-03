---
templateEngineOverride: njk
layout: layouts/page.njk
title: Label
description: Renders an accessible label associated with controls.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Disabled
        id: example-disabled
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<label class="label gap-3">
  <input type="checkbox" class="input">
  Accept terms and conditions
</label>{% endset %}
{{ code_preview("label", code) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>label</code> class to your <code>&lt;label&gt;</code> element. Labels' style may be affected by the presence of a disabled peer or child element.</p>
</section>

{% set code %}<label class="label" for="email">Your email address</label>{% endset %}
{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code %}<div class="grid gap-3">
  <label class="label" for="email">Email</label>
  <input class="input" id="email" type="email" placeholder="Email" disabled>
</div>{% endset %}
{{ code_preview("label-disabled", code) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Labels support right-to-left layouts through native text flow. Add <code>dir="rtl"</code> to the label or an ancestor.</p>
</section>

{% set code %}<div class="grid gap-3" dir="rtl">
  <label class="label" for="email-rtl">البريد الإلكتروني</label>
  <input class="input" id="email-rtl" type="email" placeholder="name@example.com">
</div>{% endset %}
{{ code_preview("label-rtl", code) }}
