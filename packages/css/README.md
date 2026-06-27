# basecoat-css

This package provides CSS, JavaScript helpers, and optional Nunjucks/Jinja templates for [Basecoat](https://basecoatui.com).

## Prerequisites

Your project must have [Tailwind CSS](https://tailwindcss.com/docs/installation) installed and configured, as Basecoat relies on Tailwind utility classes and theming.

## Installation

Install with any package manager:

```bash
npm install basecoat-css # or pnpm add / yarn add / bun add
```

## Usage

Add it just after Tailwind in your stylesheet:

```css
@import "tailwindcss";
@import "basecoat-css";
```

That's it, you can use any Basecoat class (`btn`, `card`, `input`, etc) in your markup.

To use a specific style, import its standalone bundle instead:

```css
@import "tailwindcss";
@import "basecoat-css/sera";
```

### (Optional) JavaScript

Some interactive components need JavaScript. Import all component scripts, or cherry-pick only the entrypoints you use.

With a build tool (ESM):

```js
import 'basecoat-css/all';
```

Or cherry-pick the components you need:

```js
import 'basecoat-css/tabs';
import 'basecoat-css/popover';
```

Without a build tool, copy the files from `node_modules`:

```bash
npx copyfiles -u 1 "node_modules/basecoat-css/dist/js/**/*" public/js/basecoat
```

Then reference what you need, e.g.

```html
<script src="/js/basecoat/tabs.min.js" defer></script>
```

### (Optional) Templates

Nunjucks and Jinja templates ship with the package. Copy the template folder for your engine into your app:

```bash
cp -R node_modules/basecoat-css/templates/nunjucks ./templates/basecoat
cp -R node_modules/basecoat-css/templates/jinja ./templates/basecoat
```

Templates are meant to be copied into your app and customized.

## Documentation

For more detailed information on components, their usage, and customization options, see the [Basecoat documentation](https://basecoatui.com/installation).

## License

[MIT](https://github.com/hunvreus/basecoat/blob/main/LICENSE.md)
