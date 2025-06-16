# basecoat-css

This package provides the core CSS styles for [Basecoat](https://basecoatui.com), a component library built with Tailwind CSS.

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

### (Optional) JavaScript files

Some interactive components (Dropdown Menu, Popover, Select, Sidebar, Tabs, Toast) need some JavaScript.

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

## Documentation

For more detailed information on components, their usage, and customization options, please refer to the [Basecoat documentation](https://basecoatui.com/installation/#install-css).

## License

[MIT](https://github.com/hunvreus/basecoat/blob/main/LICENSE.md)