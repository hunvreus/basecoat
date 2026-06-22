# Basecoat docs migration to latest ReallySimpleDocs

## Purpose

Migrate the Basecoat docs site to the latest local ReallySimpleDocs integration in `../reallysimpledocs`.

This plan is for the next agent. It is based on the current Basecoat repo at `/Users/hunvreus/Workspace/basecoat` and the current RSD repo at `/Users/hunvreus/Workspace/reallysimpledocs`.

## Current state

- Basecoat depends on RSD through `package.json`: `reallysimpledocs: "file:../reallysimpledocs"`.
- Basecoat docs source is already in `docs/src` and is now mostly `.mdx`.
- RSD now supports Markdown and MDX pages from `docsDir`, with default MDX components available without imports.
- Basecoat config already points RSD at source docs:
  - `docsDir: "./docs/src"`
  - `routeBase: "/"`
  - `style: "vega"`
  - `components.Head: "./docs/src/site/StyleHead.astro"`
  - `components.ContentHeader: "./docs/src/site/ContentHeader.astro"`
- Latest RSD no longer has a `js` option. It always inserts managed JavaScript for theme initialization, Basecoat JS, copy-code behavior, copy-page behavior, search, and TOC state.
- The old generated-docs flow is no longer the main path. `docs/generated/**` is ignored and should not be hand-edited.

## Current blocker

`npm run docs:build` currently fails after `npm run build` succeeds.

Observed failure:

```text
[@tailwindcss/vite:generate:build] Can't resolve
/Users/hunvreus/Workspace/basecoat/node_modules/reallysimpledocs/src/css/components.css
in /Users/hunvreus/Workspace/basecoat/.astro/reallysimpledocs/styles.css
```

Cause:

- `astro.config.mjs` has a custom `basecoatDocsStyles()` integration that writes `.astro/reallysimpledocs/styles.css`.
- That custom stylesheet imports private RSD internals that no longer exist in latest RSD:
  - `node_modules/reallysimpledocs/src/css/components.css`
  - `node_modules/reallysimpledocs/src/css/sources.css`
- Basecoat style-switcher assets also import removed private RSD style files:
  - `docs/src/assets/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`
  - each imports `node_modules/reallysimpledocs/src/css/styles/<style>.css`

Latest RSD no longer owns Basecoat style files. With managed CSS enabled, it imports public `basecoat-css` entrypoints and its own small CSS files:

- `basecoat-css/base`
- `basecoat-css/styles/<style>`
- `reallysimpledocs/css`
- `reallysimpledocs/css/styles/<style>`

Because Basecoat needs live style switching, Basecoat docs should set `css: false` and own the full docs stylesheet pipeline. Keep RSD-managed JavaScript on; there is no `js: false` option anymore.

## Migration target

Basecoat should stop depending on private RSD source CSS paths except, if strictly necessary, RSD's own stable small CSS files.

The docs site should use:

- Basecoat's own generated style bundles for Basecoat component visuals.
- `css: false` in the RSD integration, so Basecoat controls docs CSS and style switching.
- RSD-managed JavaScript, always on.
- RSD's integration for routing, layout, MDX, search, Markdown exports, `llms.txt`, and `llms-full.txt`.
- RSD component overrides for site-specific chrome.
- No `site.repository`-style UI metadata. Header actions belong in `ContentHeader`.

## Work plan

### 1. Remove the custom RSD stylesheet writer

Edit `astro.config.mjs`.

Remove:

- `fs`, `path`, and `fileURLToPath` imports if they become unused.
- `rsdCssPath()`.
- `basecoatDocsStyles()`.
- `basecoatDocsStyles()` from `integrations`.

Do not write `.astro/reallysimpledocs/styles.css` manually. Latest RSD already generates that virtual stylesheet.

Keep the RSD integration options:

```js
reallySimpleDocs({
  docsDir: "./docs/src",
  routeBase: "/",
  css: false,
  components: {
    Head: "./docs/src/site/StyleHead.astro",
    ContentHeader: "./docs/src/site/ContentHeader.astro",
  },
  site: { ... },
})
```

### 2. Move Basecoat docs CSS to owned style assets

Do not let RSD generate the docs stylesheet for Basecoat. Set `css: false`, then make `docs/src/assets/styles/style-*.css` the full docs stylesheets that `StyleHead.astro` swaps.

Do not import removed RSD CSS files from `docs/src/assets/styles/style-*.css`.

Recommended target for each style asset:

```css
@import "tailwindcss" source(none);
@reference "tailwindcss";
@reference "../../../../src/css/base/base.css";
@import "../../../../src/css/basecoat-vega.css";
@import "reallysimpledocs/css";
@import "reallysimpledocs/css/styles/vega";
```

Use the matching `basecoat-<style>.css` file for each style.
Use the matching `reallysimpledocs/css/styles/<style>` file for RSD's style-specific preview and code-surface rules.

Remove this line from every style asset:

```css
@import "../../../../node_modules/reallysimpledocs/src/css/styles/<style>.css";
```

`reallysimpledocs/css` is the public shared RSD CSS export. `reallysimpledocs/css/styles/<style>` provides the matching RSD style-specific CSS without importing Basecoat again.

Do not reintroduce removed `components.css`, `sources.css`, or `styles/*`.

### 3. Keep the style switcher, but make it compatible with latest RSD

Files:

- `docs/src/site/StyleHead.astro`
- `docs/src/site/ContentHeader.astro`
- `src/pages/index.astro`

Current behavior:

- Loads one docs style asset based on `localStorage.styleVariant`.
- Adds `data-style-variant` to `<html>`.
- Swaps `<link id="docs-style-variant">`.

Keep this behavior for Basecoat's style demo. With `css: false`, RSD's `style` option is unnecessary for Basecoat docs; Basecoat's style switcher owns the active stylesheet.

Audit duplication:

- Make sure the page does not load two competing full Basecoat style bundles in a way that makes non-Vega styles override Vega instead of standing alone.
- If duplicates are unavoidable during migration, document the temporary state in this file before handing off.

### 4. Fix navigation shape only if RSD rejects it

`docs/src/docs.json` currently uses item objects with `type: "item"`.

Latest RSD accepts page objects by `slug` and link objects by `url`; it does not require `type: "item"` for page/link entries based on current docs. Do not mass-rewrite navigation unless the build or runtime proves it is needed.

If there is a failure, normalize entries to:

```json
{ "slug": "installation", "label": "Installation", "icon": "download" }
```

and external links to:

```json
{ "label": "GitHub", "url": "https://github.com/hunvreus/basecoat", "icon": "github" }
```

Note: existing inline SVG icons in `docs.json` may or may not be supported by current RSD's icon pipeline. Verify before changing.

### 5. Verify MDX docs against current RSD components

Basecoat docs use RSD components heavily:

- `Preview`
- `Code`
- `CodeGroup`
- `Callout`
- `Steps`
- `Step`

Latest RSD makes common components available by default in MDX. Do not add imports unless a page fails.

Known special case:

- `docs/src/components/chart.mdx` imports `../site/chart-examples.js?url`.

Verify that MDX import still works after CSS fixes.

### 6. Validate generated outputs and routes

Run from `/Users/hunvreus/Workspace/basecoat`:

```bash
npm run build
npm run docs:build
```

Expected docs outputs include:

- `/index.html`
- component pages under `/components/.../index.html`
- `/search-index.json`
- per-page Markdown exports such as `/installation.md`
- `/llms.txt`
- `/llms-full.txt`

Then run:

```bash
npm run docs:dev
```

Browser-check:

- desktop and mobile widths
- search dialog
- Markdown/AI links
- style switcher for all eight styles
- dark mode
- component previews using JS behavior:
  - dropdown menu
  - select
  - combobox
  - command
  - dialog
  - tabs
  - toast
  - chart

### 7. Clean up stale docs once build passes

Update or remove outdated handoff text that says RSD does not support MDX. This file has already been updated for the latest RSD state.

Do not edit generated docs:

- `docs/generated/**`
- `dist/**`
- `packages/*/dist/**`

If build scripts regenerate committed source CSS entrypoints, use the scripts and review the generated source diffs before committing.

## Files likely touched

- `astro.config.mjs`
- `docs/src/assets/styles/style-vega.css`
- `docs/src/assets/styles/style-nova.css`
- `docs/src/assets/styles/style-maia.css`
- `docs/src/assets/styles/style-lyra.css`
- `docs/src/assets/styles/style-mira.css`
- `docs/src/assets/styles/style-luma.css`
- `docs/src/assets/styles/style-sera.css`
- `docs/src/assets/styles/style-rhea.css`
- Maybe `docs/src/site/StyleHead.astro`
- Maybe `docs/src/site/ContentHeader.astro`
- Maybe `docs/src/docs.json`

## Do not do

- Do not restore `basecoatDocsStyles()` by copying newer RSD internals.
- Do not import RSD files that are not public or intentionally stable.
- Do not add or use `js: false`; latest RSD always manages JavaScript.
- Do not reintroduce a generated `docs/generated` pipeline unless explicitly requested.
- Do not put GitHub/header actions into `site` metadata.
- Do not hand-edit build outputs.

## Open questions for the implementation agent

- Should inline SVG icons in `docs/src/docs.json` be kept, or should they move to Lucide icon names plus header/footer overrides?

## Recommended first patch

Start with the smallest build-fixing patch:

1. Delete `basecoatDocsStyles()` from `astro.config.mjs`.
2. Add `css: false` to the RSD integration options.
3. Remove all `node_modules/reallysimpledocs/src/css/styles/<style>.css` imports from `docs/src/assets/styles/style-*.css`.
4. Import Basecoat's own full style bundle in each style asset, plus RSD's own CSS through a public export if available.
5. Run `npm run docs:build`.
6. If layout CSS is missing, fix that through a public RSD CSS export instead of private source imports.
