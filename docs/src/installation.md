---
templateEngineOverride: njk
layout: layouts/page.njk
title: Installation
description: How to install and use Basecoat in your app.
icon: download
toc:
  - label: Install using the CDN
    id: install-cdn
    children:
      - label: Install all components
        id: install-cdn-all
      - label: Install specific components
        id: install-cdn-specific
  - label: Installing using NPM
    id: install-npm
    children:
      - label: "Step 1: Add Tailwind CSS"
        id: install-npm-tailwind
      - label: "Step 2: Add Basecoat"
        id: install-npm-basecoat
      - label: "Step 3: Import Basecoat"
        id: install-npm-import
      - label: "Step 4: Add JavaScript files"
        id: install-npm-js
      - label: "Step 5: Use components"
        id: install-npm-done
  - label: Components with JavaScript
    id: install-js
---

{% from "macros/code_block.njk" import code_block %}
{% from "tabs.njk" import tabs %}

<h2 id="install-cdn"><a href="#install-cdn">Install using the CDN</a></h2>

<h3 id="install-cdn-all"><a href="#install-cdn-all">Install all components</a></h3>

<section class="prose">
  <p>Add the following to the <code>&lt;head&gt;</code> of your HTML file. This loads the default CDN stylesheet and the JavaScript bundle for every JavaScript component:</p>
</section>

{% set code %}<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/basecoat.cdn.min.css">
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/all.min.js" defer></script>{% endset %}
{{ code_block(code, "html") }}

<section class="prose">
  <p>The default CDN stylesheet is the Basecoat backward-compatible default. To use a specific style, load the matching standalone stylesheet instead:</p>
</section>

{% set code %}<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/basecoat-sera.cdn.min.css">{% endset %}
{{ code_block(code, "html") }}

<h3 id="install-cdn-specific"><a href="#install-cdn-specific">Install specific components</a></h3>

<section class="prose">
  <p>The CDN style bundles are aggregated. If you want to cherry-pick CSS, use the package component files through npm or your own asset pipeline.</p>
  <p>For JavaScript, you can cherry-pick the components you need as instructed in each component page. Include <code>basecoat.min.js</code> once, then include the component script.</p>
</section>

{% set code %}<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/basecoat.cdn.min.css">
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/basecoat.min.js" defer></script> <!-- Only needed once to register and initialize components -->
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@{{ pkg.version }}/dist/js/dropdown-menu.min.js" defer></script>{% endset %}
{{ code_block(code, "html") }}

<h2 id="install-npm"><a href="#install-npm">Install using NPM</a></h2>

<div class="grid gap-8 mb-12">
  <section>
    <h3 class="mb-4 scroll-m-20 font-semibold tracking-tight" id="install-npm-tailwind"><a href="#install-npm-tailwind">Step 1: Add Tailwind CSS</a></h3>
    <div class="prose">
      <p>Basecoat uses Tailwind CSS. You need to install it in your project.</p>
      <p><a href="https://tailwindcss.com/docs/installation" target="_blank">Follow the Tailwind CSS installation instructions to get started.</a></p>
    </div>
  </section>
  <section>
    <h3 class="mb-4 scroll-m-20 font-semibold tracking-tight" id="install-npm-basecoat"><a href="#install-npm-basecoat">Step 2: Add Basecoat</a></h3>
    <div class="prose">
      <p>Add Basecoat to your Tailwind CSS file.</p>
    </div>
    {% set code_npm %}npm install basecoat-css{% endset %}
    {% set code_pnpm %}pnpm add basecoat-css{% endset %}
    {% set code_bun %}bun add basecoat-css{% endset %}
    {% set code_yarn %}yarn add basecoat-css{% endset %}
    {% set tabsets = [
      { tab: "npm", panel: code_block(code_npm, class="") },
      { tab: "pnpm", panel: code_block(code_pnpm, class="") },
      { tab: "bun", panel: code_block(code_bun, class="") },
      { tab: "yarn", panel: code_block(code_yarn, class="") }
    ] %}
    {{ tabs(id="npm-install", tabsets=tabsets) }}
    <div class="prose">
      <p>Alternatively, you can directly <a href="https://github.com/hunvreus/basecoat/blob/main/src/css/basecoat.css" target="_blank">copy the <code>basecoat.css</code> file</a> into your project.</p>
    </div>
  </section>
  <section>
    <h3 class="mb-4 scroll-m-20 font-semibold tracking-tight" id="install-npm-import"><a href="#install-npm-import">Step 3: Import Basecoat</a></h3>
    {% set code %}@import "tailwindcss";
@import "basecoat-css";{% endset %}
    {{ code_block(code, "css") }}
    <div class="prose">
      <p>The default import is the Basecoat backward-compatible default. To use a specific style, import the standalone style bundle instead:</p>
    </div>
    {% set code %}@import "tailwindcss";
@import "basecoat-css/sera";{% endset %}
    {{ code_block(code, "css") }}
    <div class="prose">
      <p>You can also import lower-level bundles or individual component CSS files:</p>
    </div>
    {% set code %}@import "tailwindcss";

/* Base tokens and global utilities only. */
@import "basecoat-css/base";

/* All component structure without a style pack. */
@import "basecoat-css/components";

/* Individual component CSS. */
@import "basecoat-css/components/button";
@import "basecoat-css/components/select";

/* One standalone style pack. */
@import "basecoat-css/styles/sera";{% endset %}
    {{ code_block(code, "css") }}
  </section>
  <section>
    <h3 class="mb-4 scroll-m-20 font-semibold tracking-tight" id="install-npm-js"><a href="#install-npm-js">Step 4: Add JavaScript files</a></h3>
    <div class="prose">
      <p>Some components <a href="#install-js">need JavaScript</a>. You can either import the all-in-one bundle or only the components you use.</p>

      <h4 class="mt-6 font-semibold">Using a build tool (Vite, Webpack…)</h4>
      <p>To include all JavaScript components:</p>
    </div>
    {% set code %}{% raw %}import 'basecoat-css/all';{% endraw %}{% endset %}
    {{ code_block(code, "js") }}
    <div class="prose">
      <p>Or cherry-pick specific components. Import <code>basecoat-css/basecoat</code> once, then import the component scripts:</p>
    </div>
    {% set code %}{% raw %}import 'basecoat-css/basecoat';
import 'basecoat-css/popover';
import 'basecoat-css/tabs';{% endraw %}{% endset %}
    {{ code_block(code, "js") }}
    <div class="prose">
      <h4 class="mt-6 font-semibold">Without a build tool</h4>
      <p>Copy the pre-built files from <code>node_modules</code> into your public directory:</p>
    </div>
    {% set code %}npx copyfiles -u 1 "node_modules/basecoat-css/dist/js/**/*" public/js/basecoat{% endset %}
    {{ code_block(code, "bash") }}
    <div class="prose">
      <p>Then reference the script you need as well as the <code>basecoat.min.js</code> file (used to register and initialize components):</p>
    </div>
    {% set code %}<script src="/js/basecoat/basecoat.min.js" defer></script>
<script src="/js/basecoat/tabs.min.js" defer></script>{% endset %}
    {{ code_block(code, "html") }}
    <div class="prose">
      <p>See each component page for the minimal script required.</p>
    </div>
  </section>
  <section>
    <h3 class="mb-4 scroll-m-20 font-semibold tracking-tight" id="install-npm-done"><a href="#install-npm-done">Step 5: Use components</a></h3>
    <div class="prose">
      <p>You can now use any of the Basecoat classes in your project (e.g. <code>btn</code>, <code>card</code>, <code>input</code>, etc). Read the documentation about each component to get started (e.g. <a href="/components/button">button</a>, <a href="/components/card">card</a>, <a href="/components/input">input</a>, etc).</p>
      <p>Some components (e.g. <a href="/components/select">Select</a>) require <a href="#install-js">JavaScript code to work</a>.</p>
    </div>
  </section>
</div>

<h2 id="install-js"><a href="#install-js">Components with JavaScript</a></h2>

<div class="prose">
  <p><b>A handful of components require JavaScript code to work</b>, specifically <a href="/components/combobox">Combobox</a>, <a href="/components/command">Command</a>, <a href="/components/dropdown-menu">Dropdown Menu</a>, <a href="/components/popover">Popover</a>, <a href="/components/select">Select</a>, <a href="/components/sidebar">Sidebar</a>, <a href="/components/slider">Slider</a>, <a href="/components/tabs">Tabs</a> and <a href="/components/toast">Toast</a>.</p>

  <p>If a component requires JavaScript, the documentation page provides the minimal scripts. There are two options:</p>
    
  <ul>
    <li><b>All-in-one</b>: use <code>dist/js/all.min.js</code> from the CDN or <code>import "basecoat-css/all"</code> with a build tool.</li>
    <li><b>Per component</b>: load <code>basecoat.min.js</code> once, then load or import each component script, such as <code>select.min.js</code> or <code>basecoat-css/select</code>.</li>
  </ul>
</div>
