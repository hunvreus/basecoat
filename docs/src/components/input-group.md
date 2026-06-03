---
templateEngineOverride: njk
layout: layouts/page.njk
title: Input Group
description: Add icons, text, buttons, and helper content to inputs and textareas.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Align
        id: example-align
        children:
          - label: inline-start
            id: align-inline-start
          - label: inline-end
            id: align-inline-end
          - label: block-start
            id: align-block-start
          - label: block-end
            id: align-block-end
      - label: Icon
        id: example-icon
      - label: Text
        id: example-text
      - label: Button
        id: example-button
      - label: Kbd
        id: example-kbd
      - label: Dropdown
        id: example-dropdown
      - label: Spinner
        id: example-spinner
      - label: Textarea
        id: example-textarea
      - label: Custom Input
        id: example-custom-input
      - label: RTL
        id: example-rtl
---

{% from "macros/code_block.njk" import code_block %}
{% from "macros/code_preview.njk" import code_preview %}
{% from "dropdown-menu.njk" import dropdown_menu %}

{% set spinner_icon %}{% lucide "loader-circle", { "role": "status", "aria-label": "Loading", "class": "animate-spin" } %}{% endset %}

{% set code_default %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="Search...">
    <span data-align="start" aria-hidden="true">{% lucide "search" %}</span>
    <span data-align="end">12 results</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="example.com">
    <span data-align="start">https://</span>
    <button type="button" class="btn-xs-icon-ghost rounded-full" data-align="end" aria-label="Info">
      {% lucide "info" %}
    </button>
  </div>

  <div class="input-group min-h-32" data-orientation="vertical">
    <textarea placeholder="Ask, Search or Chat..."></textarea>
    <footer data-align="end" role="group" aria-label="Message actions">
      <button type="button" class="btn-xs-icon-outline rounded-full" aria-label="Add attachment">{% lucide "plus" %}</button>
      {% set trigger %}Auto{% endset %}
      {{ dropdown_menu(
        main_attrs={"class": "min-w-0"},
        trigger=trigger,
        trigger_attrs={"class": "btn-xs-ghost"},
        popover_attrs={"data-side": "top", "data-align": "start", "class": "min-w-28 [--radius:0.95rem]"},
        items=[
          { type: "item", label: "Auto" },
          { type: "item", label: "Agent" },
          { type: "item", label: "Manual" }
        ]
      ) }}
      <span class="ms-auto">52% used</span>
      <hr role="separator" class="h-4">
      <button type="button" class="btn-xs-icon rounded-full" disabled aria-label="Send">{% lucide "arrow-up" %}</button>
    </footer>
  </div>

  <div class="input-group">
    <input type="text" placeholder="@shadcn">
    <span data-align="end" aria-hidden="true">
      <span class="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {% lucide "check", { "class": "size-3" } %}
      </span>
    </span>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-default", code_default | prettyHtml, class="w-full max-w-sm") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

{% set code_usage %}
<div class="input-group">
  <input type="text" placeholder="Search...">
  <span data-align="start" aria-hidden="true">
    <!-- icon -->
  </span>
  <span data-align="end">12 results</span>
</div>
{% endset %}

{{ code_block(code_usage | prettyHtml, "html") }}

<section class="prose">
  <p>Use <code>.input-group</code> on the root. The group owns the visible shell. Native controls stay semantic and become borderless children inside that shell.</p>
  <p>The component has the following HTML structure:</p>
  <dl>
    <dt><code class="highlight language-html">&lt;div class="input-group"&gt;</code></dt>
    <dd>The root shell. Add <code>role="group"</code> and an accessible label only when the group itself needs to be named.
      <dl>
        <dt><code class="highlight language-html">&lt;input&gt;</code>, <code class="highlight language-html">&lt;textarea&gt;</code>, <code class="highlight language-html">&lt;select&gt;</code></dt>
        <dd>The native control. Use <code>aria-invalid="true"</code> for invalid state and <code>disabled</code> for disabled state.</dd>
        <dt><code class="highlight language-html">&lt;span&gt;</code>, <code class="highlight language-html">&lt;svg&gt;</code>, <code class="highlight language-html">&lt;kbd&gt;</code></dt>
        <dd>Decorative or helper content. Use <code>aria-hidden="true"</code> for decorative icons.</dd>
        <dt><code class="highlight language-html">&lt;button&gt;</code>, <code class="highlight language-html">&lt;div role="group"&gt;</code></dt>
        <dd>Interactive actions. Use <code>role="group"</code> with an accessible label when multiple related actions share one side of the input.</dd>
        <dt><code class="highlight language-html">&lt;header&gt;</code>, <code class="highlight language-html">&lt;footer&gt;</code></dt>
        <dd>Header or footer addon rows for vertically oriented input groups.</dd>
        <dt><code class="highlight language-html">data-align="start|end"</code></dt>
        <dd>Optional visual placement. Values use logical direction, so start/end automatically flip in RTL. Use <code>data-orientation="vertical"</code> on the root for header/footer layouts.</dd>
        <dt><code class="highlight language-html">[data-control]</code></dt>
        <dd>Escape hatch for custom controls that are not native <code>input</code>, <code>textarea</code>, or <code>select</code>.</dd>
      </dl>
    </dd>
  </dl>
</section>

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-align"><a href="#example-align">Align</a></h3>

<section class="prose">
  <p>Use <code>data-align="start|end"</code> on addon wrappers to position them inline. Use <code>data-orientation="vertical"</code> with <code>header</code> or <code>footer</code> for block placement.</p>
</section>

<h4 id="align-inline-start"><a href="#align-inline-start">inline-start</a></h4>

{% set code_align_inline_start %}
<div class="field max-w-sm">
  <label for="inline-start-input">Input</label>
  <div class="input-group">
    <input id="inline-start-input" type="text" placeholder="Search...">
    <span role="group" data-align="start" aria-hidden="true">
      {% lucide "search", { "class": "text-muted-foreground" } %}
    </span>
  </div>
  <p>Icon positioned at the start.</p>
</div>
{% endset %}

{{ code_preview("input-group-inline-start", code_align_inline_start | prettyHtml, class="w-full max-w-sm") }}

<h4 id="align-inline-end"><a href="#align-inline-end">inline-end</a></h4>

{% set code_align_inline_end %}
<div class="field max-w-sm">
  <label for="inline-end-input">Input</label>
  <div class="input-group">
    <input id="inline-end-input" type="password" placeholder="Enter password">
    <span role="group" data-align="end" aria-hidden="true">
      {% lucide "eye-off" %}
    </span>
  </div>
  <p>Icon positioned at the end.</p>
</div>
{% endset %}

{{ code_preview("input-group-inline-end", code_align_inline_end | prettyHtml, class="w-full max-w-sm") }}

<h4 id="align-block-start"><a href="#align-block-start">block-start</a></h4>

{% set code_align_block_start %}
<div role="group" aria-label="Block start input group examples" class="fieldset max-w-sm">
  <div class="field">
    <label for="block-start-input">Input</label>
    <div class="input-group" data-orientation="vertical">
      <input id="block-start-input" type="text" placeholder="Enter your name">
      <header data-align="start">
        <span>Full Name</span>
      </header>
    </div>
    <p>Header positioned above the input.</p>
  </div>

  <div class="field">
    <label for="block-start-textarea">Textarea</label>
    <div class="input-group" data-orientation="vertical">
      <textarea id="block-start-textarea" class="font-mono text-sm" placeholder="console.log('Hello, world!');"></textarea>
      <header data-align="start">
        {% lucide "file-code", { "class": "text-muted-foreground" } %}
        <span class="font-mono">script.js</span>
        <button type="button" class="btn-xs-icon-ghost ml-auto" aria-label="Copy">
          {% lucide "copy" %}
        </button>
      </header>
    </div>
    <p>Header positioned above the textarea.</p>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-block-start", code_align_block_start | prettyHtml, class="w-full max-w-sm") }}

<h4 id="align-block-end"><a href="#align-block-end">block-end</a></h4>

{% set code_align_block_end %}
<div role="group" aria-label="Block end input group examples" class="fieldset max-w-sm">
  <div class="field">
    <label for="block-end-input">Input</label>
    <div class="input-group" data-orientation="vertical">
      <input id="block-end-input" type="text" placeholder="Enter amount">
      <footer data-align="end">
        <span>USD</span>
      </footer>
    </div>
    <p>Footer positioned below the input.</p>
  </div>

  <div class="field">
    <label for="block-end-textarea">Textarea</label>
    <div class="input-group" data-orientation="vertical">
      <textarea id="block-end-textarea" placeholder="Write a comment..."></textarea>
      <footer data-align="end">
        <span>0/280</span>
        <button type="button" class="btn-sm ml-auto">Post</button>
      </footer>
    </div>
    <p>Footer positioned below the textarea.</p>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-block-end", code_align_block_end | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-icon"><a href="#example-icon">Icon</a></h3>

{% set code_icon %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="Search...">
    <span data-align="start" aria-hidden="true">{% lucide "search" %}</span>
  </div>

  <div class="input-group">
    <input type="email" placeholder="Enter your email">
    <span data-align="start" aria-hidden="true">{% lucide "mail" %}</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Card number">
    <span data-align="start" aria-hidden="true">{% lucide "credit-card" %}</span>
    <span data-align="end" aria-hidden="true">{% lucide "check" %}</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Card number">
    <span data-align="end" aria-hidden="true">
      {% lucide "star" %}
      {% lucide "info" %}
    </span>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-icon", code_icon | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-text"><a href="#example-text">Text</a></h3>

{% set code_text %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="0.00">
    <span data-align="start">$</span>
    <span data-align="end">USD</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="example.com">
    <span data-align="start">https://</span>
    <span data-align="end">.com</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Enter your username">
    <span data-align="end">@company.com</span>
  </div>

  <div class="input-group" data-orientation="vertical">
    <textarea placeholder="Enter your message"></textarea>
    <footer data-align="end">
      <span class="text-xs text-muted-foreground">120 characters left</span>
    </footer>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-text", code_text | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-button"><a href="#example-button">Button</a></h3>

{% set code_button %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" readonly placeholder="https://x.com/shadcn">
    <button type="button" class="btn-xs-icon-ghost" data-align="end" aria-label="Copy" title="Copy">
      {% lucide "copy" %}
    </button>
  </div>

  <div class="input-group [--radius:9999px]">
    <button type="button" class="btn-xs-icon-secondary" data-align="start" aria-label="Connection information">
      {% lucide "info" %}
    </button>
    <span data-align="start" class="text-muted-foreground">https://</span>
    <input type="text" id="input-secure-19">
    <button type="button" class="btn-xs-icon-ghost" data-align="end" aria-label="Favorite">
      {% lucide "star" %}
    </button>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Type to search...">
    <button type="button" class="btn-secondary" data-align="end">Search</button>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-button", code_button | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-kbd"><a href="#example-kbd">Kbd</a></h3>

{% set code_kbd %}
<div class="input-group">
  <input type="text" placeholder="Search...">
  <span data-align="start" aria-hidden="true">{% lucide "search" %}</span>
  <kbd data-align="end">⌘K</kbd>
</div>
{% endset %}

{{ code_preview("input-group-kbd", code_kbd | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-dropdown"><a href="#example-dropdown">Dropdown</a></h3>

{% set code_dropdown %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="Enter file name">
    {% set trigger %}{% lucide "ellipsis" %}{% endset %}
    {{ dropdown_menu(
      main_attrs={"data-align": "end"},
      trigger=trigger,
      trigger_attrs={"class": "btn-xs-icon-ghost", "aria-label": "Open file actions"},
      popover_attrs={"data-align": "end", "class": "min-w-32"},
      items=[
        { type: "item", label: "Settings" },
        { type: "item", label: "Copy path" },
        { type: "item", label: "Open location" }
      ]
    ) }}
  </div>

  <div class="input-group [--radius:1rem]">
    <input type="text" placeholder="Enter search query">
    {% set trigger %}Search In... {% lucide "chevron-down", { "class": "size-3" } %}{% endset %}
    {{ dropdown_menu(
      main_attrs={"data-align": "end"},
      trigger=trigger,
      trigger_attrs={"class": "btn-xs-ghost pr-1.5! text-xs"},
      popover_attrs={"data-align": "end", "class": "min-w-32 [--radius:0.95rem]"},
      items=[
        { type: "item", label: "Documentation" },
        { type: "item", label: "Blog Posts" },
        { type: "item", label: "Changelog" }
      ]
    ) }}
  </div>
</div>
{% endset %}

{{ code_preview("input-group-dropdown", code_dropdown | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-spinner"><a href="#example-spinner">Spinner</a></h3>

{% set code_spinner %}
<div class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="Searching...">
    <span data-align="end">{{ spinner_icon | safe }}</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Processing...">
    <span data-align="start">{{ spinner_icon | safe }}</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Saving changes...">
    <span data-align="end">
      Saving...
      {{ spinner_icon | safe }}
    </span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="Refreshing data...">
    <span data-align="start" aria-hidden="true">{% lucide "loader", { "class": "animate-spin" } %}</span>
    <span data-align="end" class="text-muted-foreground">Please wait...</span>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-spinner", code_spinner | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-textarea"><a href="#example-textarea">Textarea</a></h3>

{% set code_textarea %}
<div class="input-group min-h-[200px]" data-orientation="vertical">
  <textarea placeholder="console.log('Hello, world!');"></textarea>
  <footer data-align="end" class="border-t">
    <span>Line 1, Column 1</span>
    <button type="button" class="btn-sm ml-auto">Run {% lucide "corner-down-left" %}</button>
  </footer>
  <header data-align="start" class="border-b">
    {% lucide "file-code", { "class": "text-muted-foreground" } %}
    <span>script.js</span>
    <div role="group" aria-label="File actions" class="ml-auto flex gap-1">
      <button type="button" class="btn-xs-icon-ghost">{% lucide "refresh-ccw" %}</button>
      <button type="button" class="btn-xs-icon-ghost">{% lucide "copy" %}</button>
    </div>
  </header>
</div>
{% endset %}

{{ code_preview("input-group-textarea", code_textarea | prettyHtml, class="w-full max-w-md") }}

<h3 id="example-custom-input"><a href="#example-custom-input">Custom Input</a></h3>

{% set code_custom %}
<div class="input-group" data-orientation="vertical">
  <textarea
    data-control
    placeholder="Autoresize textarea..."
    class="field-sizing-content min-h-16 resize-none"
  ></textarea>
  <footer data-align="end">
    <button type="button" class="btn-sm ml-auto">Submit</button>
  </footer>
</div>
{% endset %}

{{ code_preview("input-group-custom", code_custom | prettyHtml, class="w-full max-w-sm") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

{% set code_rtl %}
<div dir="rtl" class="grid gap-6">
  <div class="input-group">
    <input type="text" placeholder="بحث...">
    <span role="group" data-align="start" aria-hidden="true">{% lucide "search" %}</span>
    <span role="group" data-align="end">١٢ نتيجة</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="جاري البحث...">
    <span role="group" data-align="end">{{ spinner_icon | safe }}</span>
  </div>

  <div class="input-group">
    <input type="text" placeholder="جاري حفظ التغييرات...">
    <span role="group" data-align="end">
      جاري الحفظ...
      {{ spinner_icon | safe }}
    </span>
  </div>

  <div class="field">
    <label for="rtl-textarea">منطقة النص</label>
    <div class="input-group" data-orientation="vertical">
      <textarea id="rtl-textarea" placeholder="اكتب تعليقًا..."></textarea>
      <footer data-align="end">
        <span>٠/٢٨٠</span>
        <button type="button" class="btn-sm ms-auto">نشر</button>
      </footer>
    </div>
    <p>تذييل موضع أسفل منطقة النص.</p>
  </div>
</div>
{% endset %}

{{ code_preview("input-group-rtl", code_rtl | prettyHtml, class="w-full max-w-sm") }}
