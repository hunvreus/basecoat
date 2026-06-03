---
templateEngineOverride: njk
layout: layouts/page.njk
title: Customization
description: Configure icons, themes, fonts, and style overrides.
icon: settings-2
toc:
  - label: Icons
    id: icons
  - label: Theming
    id: theming
  - label: Fonts
    id: fonts
  - label: Custom styles
    id: custom-styles
  - label: Style overrides
    id: style-overrides
---

{% from "macros/code_block.njk" import code_block %}

<h2 id="icons"><a href="#icons">Icons</a></h2>

<div class="prose">
  <p>Basecoat uses <a href="https://lucide.dev" target="_blank">Lucide icons</a>. You have three options:</p>
  
  <ul>
    <li><b>Copy SVG code</b>: Visit <a href="https://lucide.dev/icons" target="_blank">lucide.dev/icons</a>, click any icon to copy the SVG, and paste it directly in your HTML. Best for simple projects or occasional icon usage.</li>
    <li><b>Install lucide</b>: Follow the <a href="https://lucide.dev/guide/installation" target="_blank">installation guide</a> to install the <code>lucide</code> package and dynamically render icons. Best for projects that need many icons or want tree-shaking.</li>
    <li><b>Use framework packages</b>: Browse <a href="https://lucide.dev/packages" target="_blank">framework-specific packages</a> (React, Vue, Angular, etc.) for component-based icon usage. Best if you're using a supported framework.</li>
  </ul>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="https://lucide.dev" target="_blank">
    Browse icons
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://lucide.dev/guide/installation" target="_blank">
    Installation guide
    {% lucide "arrow-right" %}
  </a>
  <a class="badge-outline" href="https://lucide.dev/packages" target="_blank">
    Packages
    {% lucide "arrow-right" %}
  </a>
</div>

<h2 id="theming"><a href="#theming">Theming</a></h2>

<div class="prose">
  <p>You can import any <a href="https://shadcn-ui.com" target="_blank">shadcn/ui</a> compatible theme (e.g. <a href="https://tweakcn.com" target="_blank">tweakcn</a>). For example:</p>
  <ul>
    <li>Go to <a href="https://ui.shadcn.com/themes" target="_blank">ui.shadcn.com/themes</a> and select a theme.</li>
    <li>Click "Copy code" and save the theme variables in a file (e.g. <code>theme.css</code>).</li>
    <li>
      Import the theme in your CSS file:
      {% set code %}@import "tailwindcss";
@import "basecoat-css/sera";
@import "./theme.css";{% endset %}
      {{ code_block(code, "css") }}
    </li>
  </ul>
</div>

<div class="flex flex-wrap gap-2 my-6">
  <a class="badge-outline" href="https://ui.shadcn.com/docs/theming" target="_blank">
    About shadcn/ui theming
    {% lucide "arrow-right" %}
  </a>
</div>

<h2 id="fonts"><a href="#fonts">Fonts</a></h2>

<div class="prose">
  <p>Basecoat does not ship web fonts by default. The Basecoat docs site uses the same font choices as the current shadcn/ui site: <a href="https://fonts.google.com/specimen/Geist" target="_blank">Geist Sans</a> for sans and heading text, and <a href="https://fonts.google.com/specimen/Geist+Mono" target="_blank">Geist Mono</a> for monospace text.</p>
  <p>To use the same setup, load the fonts and override the font tokens after importing Basecoat:</p>
</div>

{% set code %}@import "tailwindcss";
@import "basecoat-css/sera";
@import "@fontsource/geist-sans/400.css";
@import "@fontsource/geist-sans/500.css";
@import "@fontsource/geist-sans/600.css";
@import "@fontsource/geist-sans/700.css";
@import "@fontsource/geist-mono/400.css";
@import "@fontsource/geist-mono/500.css";
@import "@fontsource/geist-mono/600.css";
@import "@fontsource/geist-mono/700.css";

:root {
  --font-sans: "Geist Sans", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Geist Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}{% endset %}
{{ code_block(code, "css") }}

<div class="prose">
  <p>Keep font overrides in a small CSS file imported after Basecoat. This makes fonts a project-level customization instead of a Basecoat package default.</p>
</div>

<h2 id="custom-styles"><a href="#custom-styles">Custom styles</a></h2>

<div class="prose">
  <p>Basecoat style packs combine shared Basecoat structure with visual rules for each component. If you want to write a full custom style, import the styleless Basecoat base and then your own style file.</p>
</div>

{% set code %}@import "tailwindcss";
@import "basecoat-css/base";
@import "./style-acme.css";{% endset %}
{{ code_block(code, "css") }}

<div class="prose">
  <p><code>basecoat-css/base</code> includes Basecoat tokens, semantic utilities, and component structure, but no Vega/Nova/Maia/etc. visual style pack. Your style file is responsible for component visuals such as colors, radius, shadows, focus rings, spacing, and variant treatment.</p>
  <p>The practical way to start is to copy one existing style pack, rename it, and edit from there. The style files live in <code>src/css/styles/</code> and are also published under <code>basecoat-css/styles/*</code>.</p>
</div>

{% set code %}@import "basecoat-css/base";
@import "./style-acme.css";

/* style-acme.css can start as a copy of basecoat-css/styles/nova. */{% endset %}
{{ code_block(code, "css") }}

<div class="prose">
  <p>Do not load a full Basecoat style bundle and then override it wholesale. For example, avoid importing <code>basecoat-css/nova</code> before your custom style. That loads Nova component visuals and forces your file to undo them. Use <code>basecoat-css/base</code> instead.</p>
</div>

<h2 id="style-overrides"><a href="#style-overrides">Style overrides</a></h2>

<div class="prose">
  <p>You can override default styles using Tailwind:</p>
</div>

{% set code %}<button class="btn font-normal">Click me</button>{% endset %}
{{ code_block(code, "html") }}

<div class="prose">
  <p>You can also extend or override the existing styles in your own Tailwind files:</p>
</div>

{% set code %}@import "tailwindcss";
@import "basecoat-css/sera";
@import "./custom.css";{% endset %}
{{ code_block(code, "css") }}

<div class="prose">
  <p>More importantly, you can use the <a href="#theming">theme variables</a> to customize many aspects of the components (colors, fonts, sizes, etc).</p>
  
  <p><b>If you want to make more drastic changes</b>, you can <a href="https://github.com/hunvreus/basecoat/blob/main/src/css/basecoat.css" target="_blank">copy the <code>basecoat.css</code> file</a> into your project and make your changes there.</p>
</div>
