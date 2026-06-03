# Changelog

## Unreleased

- Removed the `.form` convenience selector for Basecoat 1.0. Use explicit component classes (`label`, `input`, `textarea`, `select`) or compose fields with `.field` / `.fieldset`.
- To keep the previous wrapper behavior, define it in your own Tailwind CSS:

```css
.form label { @apply label; }
.form input { @apply input; }
.form textarea { @apply textarea; }
.form select { @apply select; }
```
