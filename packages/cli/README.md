# basecoat-cli

This package provides a Command Line Interface (CLI) to help you quickly scaffold [Basecoat](https://basecoatui.com) components into your project.

## Prerequisites

- Ensure you have Node.js and npm (or your preferred package manager) installed.
- For the components to function correctly, your project should have:
  - [Tailwind CSS](https://tailwindcss.com/docs/installation) installed and configured.
  - The `basecoat-css` package installed and imported (or `basecoat.css` manually added).
  - [Alpine.js](https://alpinejs.dev/docs/installation) installed and initialized, as Basecoat components rely on it for interactivity.

## Usage

Use the `add` command to add components to your project:

```bash
# npx
npx basecoat-cli add [component]

# pnpm
pnpm dlx basecoat-cli add [component]

# bun
bunx basecoat-cli add [component]

# yarn
yarn dlx basecoat-cli add [component]
```

Replace `[component]` with the name of the component you wish to add (e.g., `dialog`, `select`) or leave it out if you want to pick from the list of available components
or install all of them at once.

The CLI will prompt you for:

1.  **Template Engine:** Choose between Nunjucks (`.njk`) or Jinja (`.html.jinja`).
2.  **Assets Directory:** The path where component assets (like JavaScript files) should be placed (e.g., `src/assets/js/components`).
3.  **Macros Directory:** The path where component macros should be placed (e.g., `src/_includes/macros/components`).

The CLI will then copy the necessary JavaScript files and Nunjucks/Jinja macros for the selected component into the specified directories.

### Example

To add the `dialog` component:

```bash
npx basecoat-cli add dialog
```

## Documentation

For more detailed information on components, their usage, and customization options, please refer to the [Basecoat documentation](https://basecoatui.com/installation/#install-cli).

## License

[MIT](https://github.com/hunvreus/basecoat/blob/main/LICENSE.md)