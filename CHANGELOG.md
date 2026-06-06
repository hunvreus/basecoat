# Changelog

## Unreleased

### Breaking Changes

- Removed the `.form` convenience selector for Basecoat 1.0. Use explicit component classes (`label`, `input`, `textarea`, `select`) or compose fields with `.field` / `.fieldset`.
- Changed Combobox markup and behavior to an input-first structure. The visible input now filters options, the hidden input stores the submitted value, single select stores the selected value, and multiple select stores a JSON array.
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

### Changed

- Reworked component CSS so shared component files own structure and behavior hooks while style-pack files own visual treatment.
- Updated Button, Button Group, Input, Textarea, Select, Combobox, Command, Dialog, Dropdown Menu, Popover, Field, Tabs, Table, Card, Alert, Badge, Kbd, Label, Skeleton, Radio, Switch, Empty, Item, and Input Group toward current shadcn/ui styles.
- Split Native Select documentation from custom Select documentation.
- Updated docs to use Basecoat-specific HTML usage instead of React/shadcn composition APIs.
- Updated docs site styling, navigation, fonts, and style switcher for the 1.0 style system.

### Removed

- Removed the old Form component page. Form layout should now be composed with Field, Fieldset, Input, Textarea, Select, Native Select, Checkbox, Radio, and Switch.

### Migration Notes

To keep the previous `.form` wrapper behavior, define it in your own Tailwind CSS:

```css
.form label { @apply label; }
.form input { @apply input; }
.form textarea { @apply textarea; }
.form select { @apply select; }
```

To keep the previous document-event command APIs, add bridge listeners in your app:

```js
document.addEventListener('basecoat:toast', (event) => {
  document.getElementById('toaster')?.toast(event.detail?.config || {});
});

document.addEventListener('basecoat:sidebar', (event) => {
  const sidebar = document.getElementById(event.detail?.id || 'sidebar');
  const action = event.detail?.action || 'toggle';
  if (['open', 'close', 'toggle'].includes(action)) sidebar?.[action]();
});

document.addEventListener('basecoat:theme', (event) => {
  const mode = event.detail?.mode;
  mode ? window.basecoat.theme.set(mode) : window.basecoat.theme.toggle();
});
```
