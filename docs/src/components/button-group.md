---
templateEngineOverride: njk
layout: layouts/page.njk
title: Button Group
description: A container that groups related buttons together with consistent styling.
toc:
  - label: Usage
    id: usage
  - label: Accessibility
    id: accessibility
  - label: Button Group vs Toggle Group
    id: button-group-vs-toggle-group
  - label: Examples
    id: examples
    children:
      - label: Orientation
        id: example-orientation
      - label: Size
        id: example-size
      - label: Nested
        id: example-nested
      - label: Separator
        id: example-separator
      - label: Split
        id: example-split
      - label: Input
        id: example-input
      - label: Input Group
        id: example-input-group
      - label: Dropdown Menu
        id: example-dropdown-menu
      - label: Select
        id: example-select
      - label: Popover
        id: example-popover
      - label: RTL
        id: example-rtl
---

{% from "dropdown-menu.njk" import dropdown_menu %}
{% from "popover.njk" import popover %}
{% from "select.njk" import select %}
{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code_default %}
<div class="flex w-fit items-stretch gap-2">
  <button type="button" class="btn-icon-outline" aria-label="Go Back">{% lucide "arrow-left" %}</button>
  
  <div role="group" class="button-group">
    <button type="button" class="btn-outline">Archive</button>
    <button type="button" class="btn-outline">Report</button>
  </div>

  <div role="group" class="button-group">
    <button type="button" class="btn-outline">Snooze</button>
    {% set trigger %}
      {% lucide "ellipsis" %}
    {% endset %}
    {% call dropdown_menu(
      trigger=trigger,
      trigger_attrs={"class": "btn-icon-outline"},
      popover_attrs={"data-align": "end"}
    ) %}
      <div role="menuitem">
        {% lucide "mail-check" %}
        Mark as Read
      </div>
      <div role="menuitem">
        {% lucide "archive" %}
        Archive
      </div>
      <hr role="separator">
      <div role="menuitem">
        {% lucide "clock" %}
        Snooze
      </div>
      <div role="menuitem">
        {% lucide "calendar" %}
        Add to Calendar
      </div>
      <div role="menuitem">
        {% lucide "list-filter-plus" %}
        Add to List
      </div>
      <hr role="separator">
      <div role="menuitem" class="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive [&_svg]:!text-destructive">
        {% lucide "trash-2" %}
        Trash
      </div>
    {% endcall %}
  </div>
</div>
{% endset %}

{{ code_preview("button-group-default", code_default | prettyHtml) }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Wrap related buttons or inputs in a <code>&lt;div role="group" class="button-group"&gt;</code> element. Add <code>aria-label</code> or <code>aria-labelledby</code> when the group purpose is not already clear from nearby text.</p>
  <p>Use <code>data-orientation="vertical"</code> to stack items vertically. Use <code>&lt;hr role="separator"&gt;</code> to visually divide non-outline buttons. Use <code>button-group-text</code> for static text inside a group.</p>
</section>

{% set code_simple %}  
<div role="group" aria-label="Message actions" class="button-group">
  <button type="button" class="btn-outline">Archive</button>
  <button type="button" class="btn-outline">Report</button>
</div>
{% endset %}
{{ code_block(code_simple | prettyHtml, "html") }}

<h2 id="accessibility"><a href="#accessibility">Accessibility</a></h2>

<section class="prose">
  <ul>
    <li>Use <code>role="group"</code> on the <code>button-group</code> container.</li>
    <li>Use <code>aria-label</code> or <code>aria-labelledby</code> to label groups whose purpose is not obvious.</li>
    <li>Keyboard navigation remains native: users tab through each button, input, select, dropdown trigger, or popover trigger.</li>
  </ul>
</section>

<h2 id="button-group-vs-toggle-group"><a href="#button-group-vs-toggle-group">Button Group vs Toggle Group</a></h2>

<section class="prose">
  <ul>
    <li>Use Button Group for related actions, such as archive/report/snooze.</li>
    <li>Use Toggle Group when each item controls selected/on state.</li>
  </ul>
</section>

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-orientation"><a href="#example-orientation">Orientation</a></h3>

<section class="prose">
  <p>Use <code>data-orientation="vertical"</code> to stack buttons vertically.</p>
</section>

{% set code_orientation %}
<div role="group" class="button-group" data-orientation="vertical">
  <button type="button" class="btn-icon-outline" aria-label="Zoom in">
    {% lucide "plus" %}
  </button>
  <button type="button" class="btn-icon-outline" aria-label="Zoom out">
    {% lucide "minus" %}
  </button>
</div>
{% endset %}

{{ code_preview("button-group-orientation", code_orientation | prettyHtml) }}

<h3 id="example-size"><a href="#example-size">Size</a></h3>

{% set code_size %}
<div class="flex flex-col items-start gap-8">
  <div role="group" class="button-group">
    <button type="button" class="btn-sm-outline">Small</button>
    <button type="button" class="btn-sm-outline">Button</button>
    <button type="button" class="btn-sm-outline">Group</button>
    <button type="button" class="btn-sm-icon-outline">{% lucide "plus" %}</button>
  </div>
  <div role="group" class="button-group">
    <button type="button" class="btn-outline">Default</button>
    <button type="button" class="btn-outline">Button</button>
    <button type="button" class="btn-outline">Group</button>
    <button type="button" class="btn-icon-outline">{% lucide "plus" %}</button>
  </div>
  <div role="group" class="button-group">
    <button type="button" class="btn-lg-outline">Large</button>
    <button type="button" class="btn-lg-outline">Button</button>
    <button type="button" class="btn-lg-outline">Group</button>
    <button type="button" class="btn-lg-icon-outline">{% lucide "plus" %}</button>
  </div>
</div>
{% endset %}

{{ code_preview("button-group-size", code_size | prettyHtml) }}

<h3 id="example-nested"><a href="#example-nested">Nested</a></h3>

{% set code_nested %}
<div role="group" aria-label="Pagination controls" class="button-group">
  <div role="group" class="button-group">
    <button type="button" class="btn-sm-outline">1</button>
    <button type="button" class="btn-sm-outline">2</button>
    <button type="button" class="btn-sm-outline">3</button>
    <button type="button" class="btn-sm-outline">4</button>
    <button type="button" class="btn-sm-outline">5</button>
  </div>
  <div role="group" class="button-group">
    <button type="button" class="btn-sm-icon-outline" aria-label="Previous page">
      {% lucide "chevron-left" %}
    </button>
    <button type="button" class="btn-sm-icon-outline" aria-label="Next page">
      {% lucide "chevron-right" %}
    </button>
  </div>
</div>
{% endset %}

{{ code_preview("button-group-nested", code_nested | prettyHtml) }}

<h3 id="example-separator"><a href="#example-separator">Separator</a></h3>

<section class="prose">
  <p>Use <code>&lt;hr role="separator"&gt;</code> to visually divide buttons within a group.</p>
</section>

{% set code_separator %}
<div role="group" class="button-group">
  <button type="button" class="btn-secondary">Copy</button>
  <hr role="separator">
  <button type="button" class="btn-secondary">Paste</button>
</div>
{% endset %}

{{ code_preview("button-group-separator", code_separator | prettyHtml) }}

<h3 id="example-split"><a href="#example-split">Split</a></h3>

<section class="prose">
  <p>Use a separator to create a split action with a primary action and a secondary menu trigger.</p>
</section>

{% set code_split %}
<div role="group" aria-label="Split save actions" class="button-group">
  <button type="button" class="btn-secondary">Save</button>
  <hr role="separator">
  {% set trigger_split %}
    {% lucide "chevron-down" %}
  {% endset %}
  {% call dropdown_menu(
    trigger=trigger_split,
    trigger_attrs={"class": "btn-icon-secondary", "aria-label": "More save options"},
    popover_attrs={"data-align": "end"}
  ) %}
    <div role="menuitem">Save as draft</div>
    <div role="menuitem">Save and publish</div>
    <div role="menuitem">Save as template</div>
  {% endcall %}
</div>
{% endset %}

{{ code_preview("button-group-split", code_split | prettyHtml) }}

<h3 id="example-input"><a href="#example-input">Input</a></h3>

{% set code_input %}
<div role="group" aria-label="Search" class="button-group w-full max-w-sm">
  <input type="text" class="input" placeholder="Search...">
  <button type="button" class="btn-icon-outline" aria-label="Search">{% lucide "search" %}</button>
</div>
{% endset %}

{{ code_preview("button-group-input", code_input | prettyHtml) }}

<h3 id="example-input-group"><a href="#example-input-group">Input Group</a></h3>

{% set code_input_group %}
<div role="group" aria-label="Amount" class="button-group w-full max-w-sm">
  <div class="button-group-text">$</div>
  <input type="text" class="input" placeholder="0.00">
  <div class="button-group-text">USD</div>
</div>
{% endset %}

{{ code_preview("button-group-input-group", code_input_group | prettyHtml) }}

<h3 id="example-dropdown-menu"><a href="#example-dropdown-menu">Dropdown Menu</a></h3>

{% set code_dropdown_menu %}
<div role="group" class="button-group">
  <button type="button" class="btn-outline">Follow</button>
  {% set trigger %}
    {% lucide "chevron-down" %}
  {% endset %}
  {% call dropdown_menu(
    trigger=trigger,
    trigger_attrs={"class": "btn-icon-outline"},
    popover_attrs={"data-align": "end"}
  ) %}
    <div role="menuitem">
      {% lucide "volume-off" %}
      Mute Conversation
    </div>
    <div role="menuitem">
      {% lucide "check" %}
      Mark as Read
    </div>
    <div role="menuitem">
      {% lucide "triangle-alert" %}
      Report Conversation
    </div>
    <div role="menuitem">
      {% lucide "user-round-x" %}
      Block User
    </div>
    <div role="menuitem">
      {% lucide "share" %}
      Share Conversation
    </div>
    <div role="menuitem">
      {% lucide "copy" %}
      Copy Conversation
    </div>
    <hr role="separator">
    <div role="menuitem" class="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive [&_svg]:!text-destructive">
      {% lucide "trash-2" %}
      Delete Conversation
    </div>
  {% endcall %}
</div>
{% endset %}

{{ code_preview("button-group-dropdown-menu", code_dropdown_menu | prettyHtml) }}

<h3 id="example-select"><a href="#example-select">Select</a></h3>

{% set code_select %}
<div class="flex w-fit items-stretch gap-2">
  <div role="group" aria-label="Currency amount" class="button-group">
    {% call select(trigger_attrs={"class": "[&_[data-name]]:hidden"}) %}
      <div role="option" data-value="$">$ <span class="text-muted-foreground" data-name>US Dollar</span></div>
      <div role="option" data-value="€">€ <span class="text-muted-foreground" data-name>Euro</span></div>
      <div role="option" data-value="£">£ <span class="text-muted-foreground" data-name>British Pound</span></div>
    {% endcall %}
    <input type="text" class="input" placeholder="10.00">
  </div>

  <button type="button" class="btn-icon-outline">{% lucide "arrow-right" %}</button>
</div>
{% endset %}

{{ code_preview("button-group-select", code_select | prettyHtml) }}

<h3 id="example-popover"><a href="#example-popover">Popover</a></h3>

{% set code_popover %}
<div role="group" class="button-group">
  <button type="button" class="btn-outline">
    {% lucide "bot" %}
    Copilot
  </button>
  {% set trigger_popover %}
    {% lucide "chevron-down" %}
  {% endset %}
  {% call popover(
    trigger=trigger_popover,
    trigger_attrs={"class": "btn-icon-outline"},
    popover_attrs={"class": "w-72 p-0", "data-align": "end"}
  ) %}
    <header class="px-4 py-3 text-sm font-medium border-b">Agent Tasks</header>
    <section class="p-4 text-sm space-y-2">
      <textarea class="textarea w-full mb-4" placeholder="Describe your task in natural language"></textarea>
      <p class="font-medium">Start a new task with Copilot</p>
      <p class="text-muted-foreground">
        Describe your task in natural language. Copilot will work in the
        background and open a pull request for your review.
      </p>
    </section>
  {% endcall %}
</div>
{% endset %}

{{ code_preview("button-group-popover", code_popover | prettyHtml) }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Button groups support right-to-left layouts through logical border and radius rules. Add <code>dir="rtl"</code> to the group or an ancestor. Directional icons should be flipped explicitly.</p>
</section>

{% set code_rtl %}
<div dir="rtl">
  <div role="group" aria-label="إجراءات الرسالة" class="button-group">
    <button type="button" class="btn-outline">أرشفة</button>
    <button type="button" class="btn-outline">تقرير</button>
    <button type="button" class="btn-outline">
      إرسال
      {% lucide "arrow-right", { "class": "rtl:rotate-180" } %}
    </button>
  </div>
</div>
{% endset %}

{{ code_preview("button-group-rtl", code_rtl | prettyHtml) }}
