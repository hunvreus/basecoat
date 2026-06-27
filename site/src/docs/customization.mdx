# Customization

Basecoat customization has three layers:

1. Choose a style pack.
2. Override theme tokens such as colors and fonts.
3. Add small project-level CSS overrides when tokens are not enough.

For a full visual rewrite, import the Basecoat base layer and write your own style pack instead of overriding an existing one wholesale.

## Styles

Basecoat ships the same style families used by the current shadcn/ui registry: Vega, Nova, Maia, Lyra, Mira, Luma, Sera, and Rhea.

Pick one complete style bundle in your app CSS:

```css
@import "tailwindcss";
@import "basecoat-css/vega";
```

Swap the import to use another style:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
```

Each style bundle is standalone. Do not import Vega first and then load another style on top of it.
Keep the selected Basecoat style after Tailwind or any other stylesheet that emits a reset/base layer.

## Themes

Basecoat uses shadcn/ui-compatible CSS variables. You can use a theme from [TweakCN](https://tweakcn.com) or another shadcn/ui theme generator by importing the variables after Basecoat:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
@import "./theme.css";
```

`theme.css` should define token values such as `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--input`, and `--ring` for `:root` and `.dark` when needed.

Learn more in the [shadcn/ui theming docs](https://ui.shadcn.com/docs/theming).

## Fonts

Basecoat does not ship web font files by default. Its font tokens prefer [Geist Sans](https://fonts.google.com/specimen/Geist) and [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) when those fonts are available, then fall back to the full Tailwind default sans and mono stacks.

Install the fonts with Fontsource:

```bash
npm install @fontsource/geist-sans @fontsource/geist-mono
```

Then import the font files. Basecoat's default font tokens already reference Geist with full system fallbacks:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
@import "@fontsource/geist-sans/400.css";
@import "@fontsource/geist-sans/500.css";
@import "@fontsource/geist-sans/600.css";
@import "@fontsource/geist-sans/700.css";
@import "@fontsource/geist-mono/400.css";
@import "@fontsource/geist-mono/500.css";
@import "@fontsource/geist-mono/600.css";
@import "@fontsource/geist-mono/700.css";
```

If you use different fonts, override the font tokens after Basecoat:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-heading: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```

Keep font overrides in a small CSS file imported after Basecoat. Fonts are project-level customization, not a Basecoat default.

## Icons

Basecoat examples use [Lucide icons](https://lucide.dev), but Basecoat does not require an icon package.

You can:

- Copy SVGs from [lucide.dev/icons](https://lucide.dev/icons) and paste them into your HTML.
- Install [`lucide`](https://lucide.dev/guide/installation) and render icons from JavaScript.
- Use a framework-specific Lucide package if your app already uses a framework.

Inline SVG is the simplest option for plain HTML, Jinja, Nunjucks, Rails, Django, Laravel, or similar stacks.

## Project overrides

For small visual tweaks, add utilities or project CSS after Basecoat:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
@import "./app.css";
```

```html
<button class="btn font-normal" data-variant="outline">Click me</button>
```

Prefer theme tokens for broad changes and one-off utilities for local changes. Avoid copying generated Basecoat bundles into your app unless you intend to maintain a fork.

## Custom style packs

If you want a full custom style, import the styleless Basecoat base and then your own style file:

```css
@import "tailwindcss";
@import "basecoat-css/base";
@import "./styles/acme.css";
```

`basecoat-css/base` includes Basecoat tokens, semantic utilities, and component structure, but no Vega/Nova/Maia/etc. visual style pack. Your style file owns component visuals: colors, radius, shadows, focus rings, spacing, variants, and state treatment.

The practical way to start is to copy one existing style pack from `basecoat-css/styles/*`, rename it, and edit it:

```css
@import "basecoat-css/base";
@import "./styles/acme.css";
/* ./styles/acme.css can start as a copy of basecoat-css/styles/nova. */
```

Do not import a complete style bundle before your custom style. For example, avoid importing `basecoat-css/nova` and then overriding it wholesale. That loads Nova visuals and forces your file to undo them. Use `basecoat-css/base` instead.

## Compatibility

Basecoat 1.0 prefers `data-variant` and `data-size` over legacy variant classes. If you need old pre-1.0 aliases while migrating, import the compatibility layer after Basecoat:

```css
@import "tailwindcss";
@import "basecoat-css/vega";
@import "basecoat-css/compat";
```

The compatibility layer is for migration only. New code should use the documented 1.0 API.
