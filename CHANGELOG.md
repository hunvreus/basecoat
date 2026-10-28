# Changelog

## [Unreleased]

### Added

- Added the Carousel component (`.carousel`), built on native CSS scroll snapping with no dependencies. It supports `basis-*` slide sizes, spacing utilities, `data-orientation="vertical"`, `data-align="start|center|end"`, `data-loop` (rewinds to the other end), `data-start-index`, arrow keys, RTL, and a JavaScript API (`scrollPrev()`, `scrollNext()`, `scrollToIndex()`, `index`, `count`, `refresh()` and a `change` event). Unlike shadcn/ui's Embla-based carousel, it does not support mouse dragging or endless looping at the moment.

## [1.1.0] - 2026-10-23

### Upgrading

- Toast `title`, `description`, `action.label` and `cancel.label` are now escaped as text by default. If you pass HTML in any of them, add `html: true` to your `toaster.toast()` call.

### Added

- Added vertical separators: `<hr aria-orientation="vertical">` renders as a 1px line that fills its row.
- Added single-file `.bundle.css` builds (`dist/basecoat.bundle.css` and `dist/basecoat-{style}.bundle.css`) with every Basecoat import inlined, so the standalone Tailwind CLI can use Basecoat without npm. Based on the standalone CLI setup proposed by [@ytsruh](https://github.com/ytsruh) in [#150](https://github.com/hunvreus/basecoat/pull/150).
- Added an `html: true` option to `toaster.toast()` for callers that need to pass raw HTML in the title, description or action labels.

### Changed

- Toast `title`, `description`, `action.label` and `cancel.label` are now escaped as text by default, matching Sonner. Pass `html: true` to keep the previous raw-HTML behavior.
- Changed the default `--font-sans` to start with `"Geist"`, the family name used by Google Fonts, Bunny Fonts and Fontsource, with `"Geist Sans"` kept as a fallback. The customization docs now install `@fontsource/geist`.
- Updated the docs dependency to `reallysimpledocs@^1.0.14`, so `llms.txt` links to the Markdown version of each page.
- Documented how to use Tailwind utilities with Basecoat's theme colors alongside the CDN build and the Tailwind Play CDN.

### Fixed

- Prevented Escape from dismissing an enclosing dialog while closing an open Combobox popup.
- Fixed long Tooltip text clipping instead of showing an ellipsis across all style packs.
- Locked page scroll while a modal Dialog, Alert Dialog, Command Dialog or Drawer is open.
- Kept a parent Popover, Dropdown Menu, Select or Combobox open when a nested one opens inside it. Sibling components still close each other.
- Scoped Sidebar navigation styles to the sidebar's direct child `nav` (`.sidebar > nav`), so other `nav` elements inside a sidebar, such as a Tabs list, are no longer fixed and stacked.
- Stopped Dialogs and Command Dialogs from closing when a press starts inside the dialog and the drag ends on the backdrop. Updated the Nunjucks and Jinja templates and the docs examples. Based on [#104](https://github.com/hunvreus/basecoat/pull/104) by [@PhilipdeRijk](https://github.com/PhilipdeRijk).
- Fixed iOS auto-zoom when tapping the Combobox input, the Combobox chips input, the Command search input, native Selects, and Input Group inputs and textareas by using `text-base` below the `md` breakpoint, like regular inputs. The compact Lyra and Mira styles keep their smaller sizes.
- Fixed Slider thumb hover and focus rings, the RTL Sidebar submenu chevron, and some dark mode and tooltip arrow styles not applying in the unminified CDN files, because the rules were nested under pseudo-elements.
- Fixed CDN `.min.css` builds occasionally dropping rules (such as hidden Combobox, Command and Select options) by minifying with esbuild instead of Tailwind's minifier.
- Stopped the Toast docs example from pushing its fragment URL into the browser history with HTMX.
- Replaced the `.form` migration snippet in the 1.0.0 notes, which fails in Tailwind v4, with markup that works.

### Contributors

- Thanks to [@ytsruh](https://github.com/ytsruh), [@PhilipdeRijk](https://github.com/PhilipdeRijk), [@sgruendel](https://github.com/sgruendel), [@alexander-posztos](https://github.com/alexander-posztos) and [@Jezda1337](https://github.com/Jezda1337) for their contributions to this release.

## [1.0.2] - 2026-07-06

### Added

- Added `data-size="sm"` support to Alert Dialog for the compact upstream size.

### Changed

- Removed global font smoothing from Basecoat's package CSS so `antialiased` remains an application-level choice.

## [1.0.1] - 2026-06-28

### Added

- Added explicit `force: true` support to `window.basecoat.init()` and `window.basecoat.initAll()` for rehydrating restored DOM after framework or navigation cache restores.

### Fixed

- Reinitialized Basecoat components after HTMX history restores in the docs site.

## [1.0.0] - 2026-06-27

### Breaking Changes

- Removed the CLI workspace from the repo. Template files now ship with `basecoat-css` under `templates/nunjucks` and `templates/jinja`; copy them from `node_modules/basecoat-css/templates/*` instead of installing `basecoat-cli`.

### Added

- Added Nunjucks and Jinja template files to the `basecoat-css` package.
- Added a custom docs 404 page for Cloudflare static asset fallback.

### Changed

- Narrowed dark-mode generated selectors to `html.dark` to reduce broad style recalculation work.
- Switched the docs site to Astro's sitemap integration and updated `robots.txt` to point at the generated sitemap index.

### Fixed

- Updated Scroll Area examples to use Card surfaces so framed examples inherit style-pack radius and border treatment.

## [1.0.0-beta.7] - 2026-06-25

### Added

- Added a beta Drawer component with native `<dialog>` markup, side placement, animated close behavior, backdrop and Escape handling, style-pack visuals, JavaScript entrypoints, and docs.

### Changed

- Updated the docs dependency to `reallysimpledocs@^1.0.2`.
- Marked Chart and Drawer as beta components in the docs navigation.
- Promoted the Chart docs warning from alpha to beta.
- Updated installation CDN examples for `basecoat-css@1.0.0-beta.7`.

### Fixed

- Aligned Drawer examples more closely with upstream shadcn/ui while avoiding Chart API coupling in Drawer docs.

## [1.0.0-beta.6] - 2026-06-23

### Changed

- Updated docs dependency to the published `reallysimpledocs@1.0.0-beta.5` package.
- Refined component documentation examples across the docs site, including Select, Table, Tabs, Switch, and Theme Switcher.
- Clarified CDN and npm installation guidance for default and named style bundles.
- Updated Table examples to avoid inline overlay menus inside scrollable table containers and documented the overflow limitation.

### Fixed

- Fixed dark-mode unchecked Switch thumb colors across all style packs to match upstream shadcn/ui behavior.

## [1.0.0-beta.5] - 2026-06-22

### Added

- Added a dedicated Accordion component with native `<details>` markup, single-item JavaScript behavior, `data-multiple`, disabled item handling, style-pack spacing, and docs.
- Added a dedicated Breadcrumb component with semantic `nav`/`ol` markup, style-pack visuals, collapsed and dropdown examples, and docs.
- Added documented Card action support with `.card-action`.
- Added Combobox clear button, popup trigger, and input-group support, with docs aligned to upstream examples.

### Fixed

- Fixed Combobox single selection reopening immediately after selection and filtering the reopened list to the selected value.
- Improved Combobox multiple chips and remove buttons to match style-pack button sizing more closely.

## [1.0.0-beta.4] - 2026-06-20

### Changed

- Renamed the compact scrollbar utility from `scrollbar-thin` to `scrollbar-sm`; `scrollbar-thin` remains available through the compatibility stylesheet.

## [1.0.0-beta.3] - 2026-06-20

### Breaking Changes

- Changed Button, Badge, Card, Avatar, and Alert visual APIs to use a canonical root class plus data attributes instead of composed visual classes. For example, use `class="btn" data-variant="outline"`, `class="badge" data-variant="secondary"`, `class="card" data-size="sm"`, `class="avatar" data-size="lg"`, and `class="alert" data-variant="destructive"`. Legacy aliases are available only through the optional compatibility stylesheet.
- Changed icon-only Button sizing from `data-icon="only"` plus optional `data-size` to upstream-aligned `data-size="icon|icon-xs|icon-sm|icon-lg"`.

### Added

- Added an opt-in `basecoat-css/compat` stylesheet for pre-1.0 default Basecoat class aliases.
- Added an optional Chart.js helper with `window.basecoat.chart()`, chart CSS, generated tooltips, generated legends, and docs.
- Added shared Alert action layout support for direct child `<footer>` action regions.
- Added dedicated Avatar and Avatar Group component styles and docs.
- Added dedicated Progress component styles and docs with label, controlled, and RTL examples.

## [1.0.0-beta.2] - 2026-06-14

### Breaking Changes

- Removed the `.form` convenience selector for Basecoat 1.0. Use explicit component classes (`label`, `input`, `textarea`, `select`) or compose fields with `.field` / `.fieldset`.
- Changed Combobox markup and behavior to an input-first structure. The visible input now filters options, the hidden input stores the submitted value, single select stores the selected value, and multiple select stores a JSON array.
- Removed Combobox `data-multiple`; use `aria-multiselectable="true"` on the Combobox listbox, matching Select.
- Changed Command markup to the migrated Basecoat structure: `.command-dialog` wraps `.command`, the search input lives in the command header, and items use role-based menu markup with `role="menuitem"`.
- Removed Combobox-specific search-header behavior from Select. Use the dedicated Combobox component for editable/filterable selection.
- Removed built-in document command events for Toast, Sidebar, and Theme. Use element methods instead: `toaster.toast(config)`, `sidebar.open()`, `sidebar.close()`, `sidebar.toggle()`, and `window.basecoat.theme.*`.
- Reworked style loading for style packs. Non-default styles are standalone bundles and should not be loaded on top of the default/Vega bundle.

### Added

- Added standalone style packs: Vega, Nova, Maia, Lyra, Mira, Luma, Sera, and Rhea.
- Added dedicated Empty component styles and docs.
- Added dedicated Item component styles and docs.
- Added dedicated Input Group component styles and docs.
- Added dedicated Spinner docs and examples using `animate-spin` and `size-4` patterns.
- Added style-specific package entrypoints such as `basecoat-css/nova` and styleless base entrypoints for custom themes.
- Added `window.basecoat.refresh(element)` as a generic dispatcher for components that expose `refresh()`.
- Added `refresh()` methods to Command, Select, Combobox, Dropdown Menu, and Tabs for dynamic child lists.
- Added method APIs for Sidebar, Toast, and Theme.
- Added `data-format="object"` to Select and Combobox for opt-in hidden input serialization as `{ value, label }` objects.
- Added `selected` details to Select and Combobox change events and JavaScript properties.
- Added `data-filter="manual"` to Command and Combobox for app-owned remote or local-search result filtering.

### Changed

- Changed `window.basecoat.init(name)` and `window.basecoat.initAll()` to initialize uninitialized components only, instead of forcing global reinitialization.
- Added internal destroy hooks for JavaScript components so removed component roots clean up event listeners and runtime state.
- Reworked component CSS so shared component files own structure and behavior hooks while style-pack files own visual treatment.
- Updated Button, Button Group, Input, Textarea, Select, Combobox, Command, Dialog, Dropdown Menu, Popover, Field, Tabs, Table, Card, Alert, Badge, Kbd, Label, Skeleton, Radio, Switch, Empty, Item, and Input Group toward current shadcn/ui styles.
- Split Native Select documentation from custom Select documentation.
- Updated docs to use Basecoat-specific HTML usage instead of React/shadcn composition APIs.
- Updated docs site styling, navigation, fonts, and style switcher for the 1.0 style system.
- Migrated the docs build to ReallySimpleDocs/Astro while keeping Basecoat's Nunjucks source examples as a pre-render step.
- Changed docs build scripts so local Basecoat package assets are generated before ReallySimpleDocs resolves `basecoat-css`.

### Removed

- Removed the old Form component page. Form layout should now be composed with Field, Fieldset, Input, Textarea, Select, Native Select, Checkbox, Radio, and Switch.

### Fixed

- Fixed destructive Alert descriptions/content using muted text instead of destructive text across all style packs.

### Migration Notes

The `.form` wrapper can't be recreated with `@apply`: Tailwind v4 only applies utilities, not Basecoat's component classes. Wrap each label and control in a `.field` instead:

```html
<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" />
</div>
```

Or add the component class to each element: `class="label"`, `class="input"`, `class="textarea"`, or `class="select"` on a native `<select>`.

To keep the previous document-event command APIs, add bridge listeners in your app:

```js
document.addEventListener("basecoat:toast", (event) => {
  document.getElementById("toaster")?.toast(event.detail?.config || {});
});

document.addEventListener("basecoat:sidebar", (event) => {
  const sidebar = document.getElementById(event.detail?.id || "sidebar");
  const action = event.detail?.action || "toggle";
  if (["open", "close", "toggle"].includes(action)) sidebar?.[action]();
});

document.addEventListener("basecoat:theme", (event) => {
  const mode = event.detail?.mode;
  mode ? window.basecoat.theme.set(mode) : window.basecoat.theme.toggle();
});
```
