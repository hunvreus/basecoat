---
templateEngineOverride: njk
layout: layouts/page.njk
title: Textarea
description: Displays a form textarea or a component that looks like a textarea.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Field
        id: example-field
      - label: Disabled
        id: example-disabled
      - label: Invalid
        id: example-invalid
      - label: Button
        id: example-button
      - label: Form
        id: example-form
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<textarea class="textarea" placeholder="Type your message here"></textarea>{% endset %}
{{ code_preview("textarea", code, class="w-full max-w-xs") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>textarea</code> class to a <code>&lt;textarea&gt;</code> element. Textareas inside a <code>form</code> or <code>field</code> container also receive the same styling automatically.</p>
  <p>Use native HTML attributes for behavior: <code>disabled</code> for disabled textareas and <code>aria-invalid="true"</code> for invalid state styling.</p>
</section>

{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-field"><a href="#example-field">Field</a></h3>

<section class="prose">
  <p>Use <code>field</code> with a label and description to create an accessible textarea.</p>
</section>

{% set code_field %}<div role="group" class="field w-full max-w-xs">
  <label for="textarea-field">Message</label>
  <textarea id="textarea-field" placeholder="Type your message here"></textarea>
  <p>Write a short message.</p>
</div>{% endset %}
{{ code_preview("textarea-field", code_field, class="w-full max-w-xs") }}

<h3 id="example-disabled"><a href="#example-disabled">Disabled</a></h3>

{% set code_disabled %}<textarea class="textarea" placeholder="Type your message here" disabled></textarea>{% endset %}
{{ code_preview("textarea-disabled", code_disabled, class="w-full max-w-xs") }}

<h3 id="example-invalid"><a href="#example-invalid">Invalid</a></h3>

{% set code_invalid %}<div role="group" class="field w-full max-w-xs">
  <label for="textarea-invalid">Message</label>
  <textarea class="textarea" id="textarea-invalid" placeholder="Type your message here" aria-invalid="true"></textarea>
  <p>Message is required.</p>
</div>{% endset %}
{{ code_preview("textarea-invalid", code_invalid, class="w-full max-w-xs") }}

<h3 id="example-button"><a href="#example-button">Button</a></h3>

{% set code_button %}<div class="grid w-full max-w-xs gap-3">
  <textarea class="textarea" placeholder="Type your message here"></textarea>
  <button type="submit" class="btn">Submit</button>
</div>{% endset %}
{{ code_preview("textarea-button", code_button, class="w-full max-w-xs") }}

<h3 id="example-form"><a href="#example-form">Form</a></h3>

{% set code_form %}<form class="w-full max-w-sm space-y-6">
  <div role="group" class="field">
    <label for="textarea-form">Bio</label>
    <textarea id="textarea-form" placeholder="Tell us a bit about yourself"></textarea>
    <p>You can @mention other users and organizations.</p>
  </div>
  <button type="submit" class="btn">Submit</button>
</form>{% endset %}
{{ code_preview("textarea-form", code_form, class="w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Textareas support right-to-left layouts through native browser direction handling. Add <code>dir="rtl"</code> to the textarea, field, or an ancestor.</p>
</section>

{% set code_rtl %}<div role="group" class="field w-full max-w-xs" dir="rtl">
  <label for="textarea-rtl">التعليقات</label>
  <textarea id="textarea-rtl" placeholder="تعليقاتك تساعدنا على التحسين..." rows="4"></textarea>
  <p>شاركنا أفكارك حول الخدمة.</p>
</div>{% endset %}
{{ code_preview("textarea-rtl", code_rtl, class="w-full max-w-xs") }}
