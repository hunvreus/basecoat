---
templateEngineOverride: njk
layout: layouts/page.njk
title: Dialog
description: A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.
toc:
  - label: Usage
    id: usage
    children:
      - label: HTML
        id: usage-html
      - label: HTML structure
        id: usage-html-structure
      - label: Jinja and Nunjucks
        id: usage-macro
  - label: Examples
    id: examples
    children:
      - label: Custom Close Button
        id: example-custom-close-button
      - label: No Close Button
        id: example-no-close-button
      - label: Sticky Footer
        id: example-sticky-footer
      - label: Scrollable Content
        id: example-scrollable-content
      - label: RTL
        id: example-rtl
  - label: API Reference
    id: api-reference
---

{% from "macros/code_block.njk" import code_block %}
{% from "macros/code_preview.njk" import code_preview %}
{% from "dialog.njk" import dialog %}

{% set code_html %}
{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
  <button class="btn" onclick="this.closest('dialog').close()">Save changes</button>
{% endset %}
{% call dialog(
  id="demo-dialog-edit-profile",
  title="Edit profile",
  description="Make changes to your profile here. Click save when you're done.",
  trigger="Edit Profile",
  trigger_attrs={"class": "btn-outline"},
  footer=footer
) %}
<form class="grid gap-4">
  <div class="grid gap-3">
    <label class="label" for="demo-dialog-edit-profile-name">Name</label>
    <input class="input" type="text" value="Pedro Duarte" id="demo-dialog-edit-profile-name" autofocus>
  </div>
  <div class="grid gap-3">
    <label class="label" for="demo-dialog-edit-profile-username">Username</label>
    <input class="input" type="text" value="@peduarte" id="demo-dialog-edit-profile-username">
  </div>
</form>
{% endcall %}
{% endset %}

{{ code_preview("dialog", code_html | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Basecoat uses the native <code>&lt;dialog&gt;</code> element and <code>showModal()</code>. This differs from shadcn/ui's portalled Base UI implementation, but preserves native modality, focus handling, and inert page content without component JavaScript.</p>
</section>

<h3 id="usage-html"><a href="#usage-html">HTML</a></h3>

{{ code_block(code_html | prettyHtml, class="") }}

<h3 id="usage-html-structure"><a href="#usage-html-structure">HTML structure</a></h3>

<section class="prose">
  <p>The component has the following HTML structure:</p>
  <dl>
    <dt><code class="highlight language-html">&lt;button type="button" onclick="dialog.showModal()"&gt;</code> <span class="badge-secondary">Optional</span></dt>
    <dd>Trigger button. Basecoat intentionally uses the native <code>HTMLDialogElement.showModal()</code> method.</dd>
    <dt><code class="highlight language-html">&lt;dialog class="dialog" id="{ DIALOG_ID }"&gt;</code></dt>
    <dd>Native modal dialog. Add <code>aria-labelledby="{ TITLE_ID }"</code> and <code>aria-describedby="{ DESCRIPTION_ID }"</code> when title and description are present. The macro also adds backdrop-click close handling.
      <dl>
        <dt><code class="highlight language-html">&lt;div&gt;</code></dt>
        <dd>Dialog content surface.
          <dl>
            <dt><code class="highlight language-html">&lt;header&gt;</code> <span class="badge-secondary">Optional</span></dt>
            <dd>Dialog header.
              <dl>
                <dt><code class="highlight language-html">&lt;h2 id="{ TITLE_ID }"&gt;</code></dt>
                <dd>Dialog title. Reference it from <code>aria-labelledby</code>.</dd>
                <dt><code class="highlight language-html">&lt;p id="{ DESCRIPTION_ID }"&gt;</code> <span class="badge-secondary">Optional</span></dt>
                <dd>Dialog description. Reference it from <code>aria-describedby</code>.</dd>
              </dl>
            </dd>
            <dt><code class="highlight language-html">&lt;section&gt;</code> <span class="badge-secondary">Optional</span></dt>
            <dd>Dialog body/content area. Add overflow utilities when the body should scroll.</dd>
            <dt><code class="highlight language-html">&lt;footer&gt;</code> <span class="badge-secondary">Optional</span></dt>
            <dd>Action area. It stacks actions on small screens and aligns them to the end on larger screens.</dd>
            <dt><code class="highlight language-html">&lt;button type="button" onclick="this.closest('dialog').close()"&gt;</code> <span class="badge-secondary">Optional</span></dt>
            <dd>Close button. You can also wrap a button in <code>&lt;form method="dialog"&gt;</code>.</dd>
          </dl>
        </dd>
      </dl>
    </dd>
  </dl>
</section>

<h3 id="usage-macro"><a href="#usage-macro">Jinja and Nunjucks</a></h3>

<div class="prose">
  <p>You can use the <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">dialog()</code> Nunjucks or Jinja macro for this component.</p>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="/cli#macros" target="_blank">
    Use Nunjucks or Jinja macros
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/jinja/dialog.html.jinja" target="_blank">
    Jinja macro
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://github.com/hunvreus/basecoat/blob/main/src/nunjucks/dialog.njk" target="_blank">
    Nunjucks macro
    {% lucide "arrow-right" %}
  </a>
</div>

{% set raw_code %}{% raw %}{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
  <button class="btn" onclick="this.closest('dialog').close()">Save changes</button>
{% endset %}
{% call dialog(
  id="dialog-edit-profile",
  title="Edit profile",
  description="Make changes to your profile here.",
  trigger="Edit Profile",
  trigger_attrs={"class": "btn-outline"},
  footer=footer
) %}
  <form class="grid gap-4">...</form>
{% endcall %}{% endraw %}{% endset %}
{{ code_block(raw_code, "jinja") }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-custom-close-button"><a href="#example-custom-close-button">Custom Close Button</a></h3>

{% set code %}
{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">Close</button>
  <button class="btn" onclick="this.closest('dialog').close()">Continue</button>
{% endset %}
{% call dialog(
  id="dialog-custom-close",
  title="Custom close button",
  description="The default close icon is hidden and the footer provides the close action.",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  close_button=false,
  footer=footer
) %}
<p class="text-sm text-muted-foreground">Use <code>close_button=false</code> and add a close control where it fits your layout.</p>
{% endcall %}
{% endset %}
{{ code_preview("dialog-custom-close", code | prettyHtml) }}

<h3 id="example-no-close-button"><a href="#example-no-close-button">No Close Button</a></h3>

{% set code %}
{% set footer %}
  <button class="btn" onclick="this.closest('dialog').close()">I understand</button>
{% endset %}
{% call dialog(
  id="dialog-no-close",
  title="No close button",
  description="The dialog can still be closed with Escape or a custom action.",
  trigger="Open",
  trigger_attrs={"class": "btn-outline"},
  close_button=false,
  footer=footer
) %}
<p class="text-sm text-muted-foreground">Native dialogs remain keyboard-accessible even without the default close icon.</p>
{% endcall %}
{% endset %}
{{ code_preview("dialog-no-close", code | prettyHtml) }}

<h3 id="example-sticky-footer"><a href="#example-sticky-footer">Sticky Footer</a></h3>

{% set code %}
{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">Cancel</button>
  <button class="btn" onclick="this.closest('dialog').close()">Save</button>
{% endset %}
{% call dialog(
  id="dialog-sticky-footer",
  title="Sticky footer",
  description="Keep actions visible while the body scrolls.",
  trigger="Sticky Footer",
  trigger_attrs={"class": "btn-outline"},
  body_attrs={"class": "overflow-y-auto scrollbar"},
  footer_attrs={"class": "sticky bottom-0"},
  footer=footer
) %}
<div class="space-y-4 text-sm text-muted-foreground">
  {% for i in range(0, 8) %}
  <p>Dialog content row {{ i + 1 }}. Add enough content to make the body scroll while the footer remains available.</p>
  {% endfor %}
</div>
{% endcall %}
{% endset %}
{{ code_preview("dialog-sticky-footer", code | prettyHtml) }}

<h3 id="example-scrollable-content"><a href="#example-scrollable-content">Scrollable Content</a></h3>

{% set code %}
{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">Close</button>
{% endset %}
{% call dialog(
  id="dialog-scrollable",
  title="Scrollable Content",
  description="Long content can scroll inside the dialog body.",
  trigger="Scrollable Content",
  trigger_attrs={"class": "btn-outline"},
  body_attrs={"class": "overflow-y-auto scrollbar"},
  footer=footer
) %}
<div class="space-y-4 text-sm text-muted-foreground">
  {% for i in range(0, 10) %}
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non nibh sit amet augue commodo ultrices. Row {{ i + 1 }}.</p>
  {% endfor %}
</div>
{% endcall %}
{% endset %}
{{ code_preview("dialog-scrollable-content", code | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Dialog positioning and close button placement use logical properties. Set <code>dir="rtl"</code> on the dialog or a parent element.</p>
</section>

{% set code %}
<div dir="rtl">
{% set footer %}
  <button class="btn-outline" onclick="this.closest('dialog').close()">إلغاء</button>
  <button class="btn" onclick="this.closest('dialog').close()">حفظ</button>
{% endset %}
{% call dialog(
  id="dialog-rtl",
  title="تعديل الملف الشخصي",
  description="قم بتحديث بياناتك ثم احفظ التغييرات.",
  trigger="فتح",
  trigger_attrs={"class": "btn-outline"},
  footer=footer
) %}
<form class="grid gap-4">
  <div class="grid gap-3">
    <label class="label" for="dialog-rtl-name">الاسم</label>
    <input class="input" id="dialog-rtl-name" value="ليلى">
  </div>
</form>
{% endcall %}
</div>
{% endset %}
{{ code_preview("dialog-rtl", code | prettyHtml) }}

<h2 id="api-reference"><a href="#api-reference">API Reference</a></h2>

<section class="prose">
  <dl>
    <dt><code class="highlight language-html">.dialog</code></dt>
    <dd>Native dialog root. It owns the backdrop through <code>::backdrop</code> and the open state through the native <code>open</code> attribute.</dd>
    <dt><code class="highlight language-html">.dialog &gt; div</code></dt>
    <dd>Dialog content surface. This maps to shadcn/ui's <code>DialogContent</code>.</dd>
    <dt><code class="highlight language-html">.dialog &gt; div &gt; header</code></dt>
    <dd>Header area. Direct <code>h2</code> and <code>p</code> children are styled as title and description.</dd>
    <dt><code class="highlight language-html">.dialog &gt; div &gt; section</code></dt>
    <dd>Body/content area. Add utilities such as <code>overflow-y-auto</code> when you need scrolling.</dd>
    <dt><code class="highlight language-html">.dialog &gt; div &gt; footer</code></dt>
    <dd>Action area. Use Basecoat button classes for actions.</dd>
    <dt><code class="highlight language-html">close_button=false</code></dt>
    <dd>Macro option to hide the generated close icon.</dd>
  </dl>
</section>
