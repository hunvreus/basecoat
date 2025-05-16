# basecoat-css

This package provides the core CSS styles for [Basecoat](https://basecoatui.com), a component library built with Tailwind CSS.

## Prerequisites

Your project must have [Tailwind CSS](https://tailwindcss.com/docs/installation) installed and configured, as Basecoat relies on Tailwind utility classes and theming.

## Installation

You can install `basecoat-css` using your preferred package manager:

```bash
# npm
npm install basecoat-css

# yarn
yarn add basecoat-css

# pnpm
pnpm add basecoat-css

# bun
bun add basecoat-css
```

Alternatively, you can download the `basecoat.css` file directly from the [GitHub repository](https://github.com/hunvreus/basecoat/blob/main/src/css/basecoat.css) (or the `dist/basecoat.css` file from this package after installation) and include it in your project.

## Usage

After installation, import `basecoat-css` into your main CSS file. Make sure to import it **after** Tailwind CSS and **before** any custom theme overrides.

```css
/* Your main CSS file (e.g., styles.css) */

@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@import "basecoat-css"; /* Or the path to basecoat.css if manually added */

/* Your custom styles or theme overrides (optional) */
/* @import "your-theme.css"; */
```

Once imported, you can start using Basecoat's component classes in your HTML.

## Documentation

For more detailed information on components, their usage, and customization options, please refer to the [Basecoat documentation](https://basecoatui.com/installation/#install-css).

## License

[MIT](https://github.com/hunvreus/basecoat/blob/main/LICENSE.md)