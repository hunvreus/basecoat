---
templateEngineOverride: njk
layout: layouts/page.njk
title: Table
description: A responsive table component.
toc:
  - label: Usage
    id: usage
  - label: Examples
    id: examples
    children:
      - label: Footer
        id: example-footer
      - label: Actions
        id: example-actions
      - label: RTL
        id: example-rtl
---

{% from "macros/code_preview.njk" import code_preview %}
{% from "macros/code_block.njk" import code_block %}

{% set code %}<div class="table-container">
<table class="table">
  <caption>A list of your recent invoices.</caption>
  <thead>
    <tr>
      <th>Invoice</th>
      <th>Status</th>
      <th>Method</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="font-medium">INV001</td>
      <td>Paid</td>
      <td>Credit Card</td>
      <td class="text-end">$250.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV002</td>
      <td>Pending</td>
      <td>PayPal</td>
      <td class="text-end">$150.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV003</td>
      <td>Unpaid</td>
      <td>Bank Transfer</td>
      <td class="text-end">$350.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV004</td>
      <td>Paid</td>
      <td>Paypal</td>
      <td class="text-end">$450.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV005</td>
      <td>Paid</td>
      <td>Credit Card</td>
      <td class="text-end">$550.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV006</td>
      <td>Pending</td>
      <td>Bank Transfer</td>
      <td class="text-end">$200.00</td>
    </tr>
    <tr>
      <td class="font-medium">INV007</td>
      <td>Unpaid</td>
      <td>Credit Card</td>
      <td class="text-end">$300.00</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">Total</td>
      <td class="text-end">$2,500.00</td>
    </tr>
  </tfoot>
</table>
</div>{% endset %}
{{ code_preview("table", code, "w-full") }}

<h2 id="usage"><a href="#usage">Usage</a></h2>

<section class="prose">
  <p>Add the <code>table</code> class to your table element. Wrap it in <code>table-container</code> when horizontal scrolling is needed.</p>
</section>

{% set code %}<div class="table-container">
<table class="table">
  <!-- Content of your table -->
</table>
</div>{% endset %}
{{ code_block(code) }}

<h2 id="examples"><a href="#examples">Examples</a></h2>

<h3 id="example-footer"><a href="#example-footer">Footer</a></h3>

{% set code_footer %}<table class="table">
  <thead>
    <tr>
      <th>Invoice</th>
      <th class="text-end">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>INV001</td>
      <td class="text-end">$250.00</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td class="text-end">$250.00</td>
    </tr>
  </tfoot>
</table>{% endset %}
{{ code_preview("table-footer", code_footer, "w-full") }}

<h3 id="example-actions"><a href="#example-actions">Actions</a></h3>

{% set code_actions %}<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th class="text-end">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="font-medium">Project Alpha</td>
      <td class="text-end">
        <button type="button" class="btn-xs-outline">Open</button>
      </td>
    </tr>
  </tbody>
</table>{% endset %}
{{ code_preview("table-actions", code_actions, "w-full") }}

<h3 id="example-rtl"><a href="#example-rtl">RTL</a></h3>

<section class="prose">
  <p>Tables support right-to-left layouts through native table direction and logical alignment utilities such as <code>text-end</code>.</p>
</section>

{% set code_rtl %}<div class="table-container" dir="rtl">
  <table class="table">
    <caption>قائمة الفواتير الأخيرة.</caption>
    <thead>
      <tr>
        <th>الفاتورة</th>
        <th>الحالة</th>
        <th class="text-end">المبلغ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-medium">INV001</td>
        <td>مدفوعة</td>
        <td class="text-end">$250.00</td>
      </tr>
    </tbody>
  </table>
</div>{% endset %}
{{ code_preview("table-rtl", code_rtl, "w-full") }}
