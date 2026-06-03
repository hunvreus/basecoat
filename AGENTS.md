# Basecoat – Agent Guide

## What is Basecoat?

Basecoat is a vanilla JavaScript/HTML/CSS port of shadcn/ui components. It reuses shadcn/ui's design patterns and Tailwind CSS classes while maintaining semantic HTML, native browser elements, and full accessibility (ARIA attributes, proper hierarchies, keyboard navigation). The goal is to provide shadcn-quality components without React dependencies.

Basecoat is not a literal DOM port of shadcn/ui. It is an alternative implementation with the same visual language and comparable component coverage, but with simpler markup, less JavaScript, less CSS, and no React/runtime primitive dependency.

## Quickstart

- Install deps: `npm i`
- Dev docs server: `npm run docs:dev`
- Build CSS/JS: `npm run build`
- Build static docs: `npm run docs:build`

## What to edit (and what not)

- Edit sources only:
  - `src/css/base/base.css` – Shared base layer, tokens, and semantic utility classes
  - `src/css/components/*.css` – Component CSS classes (Tailwind + custom)
  - `src/css/styles/*.css` – Style-pack visual rules (`vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`)
  - `src/css/basecoat.css` – Aggregate CSS entrypoint
  - `src/js/*.js` – Individual component JS files (kebab-case, ESM) + `basecoat.js` (component registry)
  - `src/nunjucks/*.njk` and `src/jinja/*.html.jinja` – Component template macros
  - `docs/src/components/*.md` – Component documentation pages with examples; Markdown can embed Nunjucks macros
  - `docs/src/_includes/` – Layout templates, partials, and navigation
- Do not edit build outputs:
  - `packages/*/dist` – built CSS/JS bundles
  - `_site/` – generated docs site

## Project layout

- Workspaces: root npm workspace with publishable packages in `packages/*`.
- Packages:
  - `packages/css` – built CSS and JS bundles under `dist/`.
  - `packages/cli` – CLI; distributed assets live under `dist/`.
- Docs site: `docs/src` (Eleventy); output goes to `_site/`.

## Style system

- Basecoat keeps its own component class API (`btn`, `dialog`, `popover`, etc.). Do not introduce shadcn `cn-*` classes into Basecoat source.
- Shadcn/ui style packs are used as reference material, but must be mapped onto Basecoat markup and selectors.
- Style-pack architecture is one file per style:
  - `src/css/styles/vega.css`
  - `src/css/styles/nova.css`
  - `src/css/styles/maia.css`
  - `src/css/styles/lyra.css`
  - `src/css/styles/mira.css`
  - `src/css/styles/luma.css`
  - `src/css/styles/sera.css`
  - `src/css/styles/rhea.css`
- `basecoat.css` and the default CDN bundle remain Vega-compatible for Basecoat backward compatibility. This is a Basecoat compatibility decision; upstream shadcn/ui's current default generated config is Nova.
- Non-default styles must be selected through standalone style bundles (`basecoat-<style>.css`, `basecoat-<style>.cdn.css`, or docs `styles-<style>.css`). Do not load Vega/default first and then layer another style file on top.
- Split style files under `src/css/styles/*.css` are for source organization and advanced composition only. They must map upstream style intent directly and should not contain defensive resets whose only purpose is undoing another style pack.
- During migration, each component must be reviewed in two layers:
  - shared/base component CSS
  - style-pack CSS visual rules
- Do not assume existing Basecoat component CSS is still the right baseline. Reassess shared rules vs style-owned rules component by component.
- When Basecoat differs from upstream shadcn/ui, classify the difference as either intentional or drift, and prefer explicit decisions over silent divergence.

## Implementation philosophy

- Prefer the browser platform:
  - native elements before custom widgets
  - semantic HTML before generic `<div>` structures
  - CSS state selectors before JavaScript state when reliable
  - small vanilla JS behavior only when native HTML/CSS cannot provide the interaction
- Keep public markup small and obvious. A user should be able to read a component example and understand the DOM without learning shadcn/ui internals.
- Use the least JavaScript that preserves expected behavior, accessibility, and keyboard support.
- Use the least CSS that preserves the visual contract and style-pack differences.
- Use the least markup that remains semantic and accessible.
- Prefer a single public class on the component root. Avoid requiring child classes when semantic elements, native controls, ARIA roles, or documented attributes can identify the child.
- Child selectors should usually target meaningful HTML (`input`, `textarea`, `select`, `button`, `kbd`, `svg`, `header`, `footer`, `label`) or accessibility semantics (`role`, `aria-*`) rather than invented slot classes.
- Do not create classes or DOM structures just because shadcn/ui has internal slots. Map upstream intent onto Basecoat's existing selectors first.
- If a new public class, wrapper, `data-*` attribute, or macro argument is needed, treat it as API design. Make it explicit and document it.
- Prefer direct semantic selectors where Basecoat already has a semantic structure:
  - field labels: `.field > label`, not invented `.field-label`
  - field groups: semantic `fieldset`, `[role='group']`, or `[role='radiogroup']`, not arbitrary wrappers unless documented
  - native inputs/selects/textarea should remain actual native controls where possible
- Avoid purely decorative components when composition is enough. Document patterns instead of adding API surface.
- Keep generated or copied shadcn/ui implementation details out of Basecoat:
  - no `cn-*` classes
  - no `data-slot` dependency unless Basecoat explicitly owns that API
  - no React/Base UI/Radix-specific DOM assumptions
- Prefer intentional divergence over awkward imitation. If upstream behavior does not map cleanly to native markup, document the Basecoat behavior and why.

## Markup and accessibility rules

- Start from the semantic element that matches the control:
  - button action: `<button>`
  - navigation/action link: `<a>`
  - text input: `<input>`
  - multiline input: `<textarea>`
  - native select: `<select>`
  - grouped form controls: `<fieldset>` + `<legend>` when appropriate
  - dialog: native `<dialog>` when possible
- Add ARIA only when native semantics are insufficient or a custom interaction needs it.
- ARIA must reflect behavior, not styling. Do not add roles just to target CSS.
- Disabled items must be excluded from keyboard and pointer interactions where custom JS is involved.
- For composite widgets, keep keyboard behavior predictable:
  - roving/highlight state should skip disabled items
  - Escape closes popovers/dialogs where expected
  - Arrow keys should match orientation
  - Enter/Space behavior should match the control role
- RTL support should use logical properties/utilities by default. Use explicit `:dir(rtl)` only when logical utilities cannot express the behavior.
- Directional icons are not automatically flipped. Flip only icons whose meaning is directional.

## CSS architecture rules

- Shared component CSS in `src/css/components/*.css` should own structure, layout primitives, accessibility selectors, and behavior hooks.
- Style-pack CSS in `src/css/styles/*.css` should own visual choices:
  - color
  - radius
  - shadow/ring
  - typography
  - spacing that is style-specific
  - variant visuals
  - state visuals that differ by style
- Do not put style-pack defaults in component CSS and then override them later. Each style bundle must stand on its own.
- Avoid defensive resets that exist only because another style was loaded first. Non-default style bundles should not depend on Vega/default being loaded.
- Use Tailwind logical utilities (`ps`, `pe`, `ms`, `me`, `start`, `end`, `rounded-s`, `rounded-e`) instead of physical left/right when possible.
- Prefer compact selectors with `:is()` and `:has()`, but only when they keep the public API clearer.
- Use `border` for separators and lines, especially `<hr>`/separator elements. Avoid fake separator backgrounds unless upstream behavior requires it and markup supports it.
- Keep visual rules close to the component style block. Do not scatter one component's style-pack rules across unrelated sections.
- When using pseudo-elements for native controls, keep the native control accessible and form-submittable.
- Avoid `!important`. Use it only when matching upstream behavior or browser-native styling makes it unavoidable, and keep the selector narrow.

## JavaScript rules

- JavaScript files are behavior only. Do not use JS to paper over CSS architecture issues.
- Every JS component must register with `window.basecoat.register()` and be safe to initialize multiple times.
- Use `data-*-initialized` flags for idempotence.
- Emit custom events for meaningful user actions when useful for integration.
- Keep generated DOM minimal and consistent with the documented HTML structure.
- Do not couple unrelated components through hidden assumptions. If Select and Combobox share behavior, factor it deliberately or keep their files separate when the UX differs.
- Prefer native browser APIs:
  - native `<dialog>` before custom modal stacks
  - native form controls before custom controls
  - native events before synthetic abstractions
- If JS is needed only to sync visual state, keep it small and local. Example: `range.js` only syncs `--slider-value`.

## Basecoat vs upstream shadcn/ui

- Always check upstream before changing a migrated component:
  - component source under `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/ui/`
  - docs under `../_sandbox/shadcn-ui/apps/v4/content/docs/components/`
  - examples under `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/examples/`
  - all eight style packs under `../_sandbox/shadcn-ui/apps/v4/registry/styles/`
- Map upstream concepts, not upstream implementation details.
- When upstream uses composed React subcomponents, decide whether Basecoat needs:
  - one semantic element
  - a small documented structure
  - a macro helper
  - a JS component
  - only docs, with no new component
- When upstream supports behavior that does not map to Basecoat's native implementation, document the gap instead of faking it.
  - Example: Basecoat Slider uses native single-thumb range inputs; upstream Slider supports multi-thumb and vertical orientation.
  - Example: Basecoat Tooltip is CSS-only text content; upstream Tooltip supports portalled arbitrary content.
  - Example: Basecoat Select/Combobox popovers remain inline-positioned rather than matching every portalled positioning behavior.
- Style parity matters, but not at the cost of worse Basecoat markup.
- If a discrepancy is found, classify it:
  - `drift fixed`: Basecoat was simply out of date
  - `intentional`: Basecoat differs because of semantic/native/vanilla constraints
  - `deferred`: valid upstream feature, not implemented yet

## Documentation rules

- Component docs are part of the component API. Update docs whenever CSS, JS, templates, variants, supported states, or supported markup changes.
- Docs should be Basecoat docs, not copied React docs. Do not include useless React-specific API tables, `asChild`, or composition diagrams that do not match Basecoat markup.
- Prefer concrete HTML examples over abstract component trees.
- Each component page should generally include:
  - frontmatter title/description/toc
  - a top preview using the most common/default example
  - `Usage`
  - install/include notes for JS components
  - a minimal HTML example
  - `HTML structure` or class/API notes when the markup is not self-evident
  - examples aligned with upstream where they apply
  - Basecoat-specific differences and unsupported upstream features
  - RTL example or an explicit note if RTL is deferred
- For JS components, include:
  - required script tags (`basecoat.min.js` plus component file, unless included in all bundle)
  - initialization expectations
  - custom events when relevant
  - config object shape when relevant
  - macro links if Nunjucks/Jinja macros exist
- For CSS-only/native components, do not invent an API Reference section unless there is a real Basecoat API to document.
- Do not add "Composition" sections unless the component truly has a stable Basecoat composition pattern. If the section only mirrors shadcn/ui React internals, remove it.
- Examples should be realistic and named clearly:
  - `Default`
  - `Disabled`
  - `Invalid`
  - `Groups`
  - `Scrollable`
  - `RTL`
  - style/variant/size examples when applicable
- If Basecoat intentionally differs from upstream, say it near the relevant usage/example section.
- Keep snippets minimal. Avoid giant copied examples unless the structure is genuinely important.
- For deprecated or removed APIs, update the page and `CHANGELOG.md`/migration notes rather than leaving stale examples.

## Component migration workflow

For each component migration, follow this sequence:

1. Review the current Basecoat component CSS and markup/templates first.
2. Review the latest upstream shadcn/ui base component source for the equivalent component.
3. Review the relevant sections in all eight upstream style packs (`vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`).
4. Decide what belongs in shared Basecoat component CSS versus what belongs in style-pack CSS.
5. Keep Basecoat selectors and markup. Do not port shadcn `cn-*` selectors directly.
6. Remove outdated Basecoat visual rules from the shared component CSS if those rules are now style-owned.
7. Audit RTL support:
   - check upstream `*-rtl` examples and generated `ui-rtl` component code when present
   - prefer logical utilities/properties (`ps`, `pe`, `rounded-s`, `rounded-e`, `border-s`, `start`, `end`) over duplicated `:dir(rtl)` branches
   - flip only directional icons explicitly; do not auto-flip all icons
8. Audit standalone style behavior:
   - verify each style in its own full bundle, not layered over another style pack
   - compare state selectors (`focus-visible`, `aria-invalid`, `hover`, open/selected states) against upstream for that specific style
   - avoid `!important` unless upstream behavior or Basecoat markup truly requires it
9. Implement or update the component section in:
   - `src/css/components/<component>.css`
   - `src/css/styles/vega.css`
   - `src/css/styles/nova.css`
   - `src/css/styles/maia.css`
   - `src/css/styles/lyra.css`
   - `src/css/styles/mira.css`
   - `src/css/styles/luma.css`
   - `src/css/styles/sera.css`
   - `src/css/styles/rhea.css`
10. Document any non-trivial difference from upstream as either:
   - intentional
   - drift fixed
   - deferred
11. Update the migration tracker entry for the component.
12. Review and align the component docs against the current upstream docs page:
   - include equivalent examples where they apply
   - rename labels/anchors to match upstream where reasonable
   - document Basecoat-specific differences and extras
   - add or update the Basecoat class/API reference
   - call out unsupported or deferred upstream features explicitly
   - include an RTL section when supported, or document RTL as deferred
13. Run `npm run build` after each component migration.
14. Run `npm run docs:build` when docs or docs style assets change.
15. Manually verify the component in docs for:
   - light and dark mode
   - all supported variants and sizes
   - RTL with `dir="rtl"` when supported
   - interaction states (`hover`, `focus`, `disabled`, `aria-invalid`, open/selected states when relevant)

Per-component file checklist:

1. Basecoat component CSS: `src/css/components/<component>.css`
2. Basecoat templates/macros if relevant: `src/nunjucks/*.njk`, `src/jinja/*.html.jinja`
3. Basecoat docs page: `docs/src/components/<component>.md`
4. Upstream base component: `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/ui/<component>.tsx`
5. Upstream docs page: `../_sandbox/shadcn-ui/apps/v4/content/docs/components/{base,radix}/<component>.mdx`
6. Upstream styles: `../_sandbox/shadcn-ui/apps/v4/registry/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`
7. Basecoat styles: `src/css/styles/{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`

## Conventions

- ESM everywhere (`import`/`export`).
- Prettier defaults (2 spaces; single quotes per file preference).
- Filenames for assets: kebab-case (e.g., `dropdown-menu.js`, `basecoat.cdn.css`).
- JS naming: `camelCase` for vars/functions; `PascalCase` for DOM classes and exported component names when applicable.

## Design Principles

- **Minimal code**: Prefer native HTML elements and browser behavior over JavaScript abstractions
- **Accessibility-first**: Semantic HTML, proper ARIA attributes, keyboard navigation
- **CSS patterns**:
  - Use `border` for lines/separators (not `background` on `<hr>`)
  - Use `:is()` and `:has()` for compact selectors
  - Use `isolation: isolate` to contain z-index stacking contexts
  - Use `data-*` attributes for styling states, `aria-*` for accessibility semantics
- **Component patterns**:
  - Dialog variants use wrapper classes (e.g., `.command-dialog` wraps `.command`)
  - JavaScript components register with `window.basecoat.register()`
  - Emit custom events for user actions (e.g., `command:select`)
  - Filter disabled options (`aria-disabled="true"`) from all interactions
- **When NOT to create a component**:
  - If it's just composition of existing elements (users can do it with standard HTML/Tailwind)
  - If behavior is fully native (e.g., fieldset, legend)

## Adding new components

Before creating a component, ask:
1. Does shadcn/ui have it? → Port it
2. Is it pure composition? → Document pattern, no component
3. Does it need JS behavior? → Create component
4. Is it just CSS? → Add to basecoat.css, document usage

Examples:
- Field/Fieldset: CSS-only patterns (no JS component)
- Empty/Item: Pure composition unless a future pass proves a root class is needed
- Input Group: Lightweight CSS component with a single `.input-group` root class, semantic children, optional `data-align`, and `data-control` for custom controls
- Command/Select: JS behavior required (full component)

## Common tasks

- Update a component's CSS/JS: Edit `src/css/basecoat.css` and/or `src/js/*.js`.
- Update a component's CSS/JS: Edit the relevant file in `src/css/components/*.css`, `src/css/styles/*.css`, and/or `src/js/*.js`.
- Update a component template: Edit `src/nunjucks/*.njk` and/or `src/jinja/*.html.jinja`.
- Add a new component: Create JS, CSS, templates, and docs page under `docs/src/components/*.md`.
- Update navigation: Edit files in `docs/src/_includes/partials/`.

## Testing

No automated testing configured. User validates manually via the docs site (`npm run docs:dev`).

## Commits and PRs

- Commits: concise, imperative (≤72 chars), optional scope.
  - Example: `select: prevent change event on init`.
- PRs: include description, linked issues (e.g., `Closes #123`), and before/after screenshots or code snippets for visual/behavioral changes.
- Keep PRs focused; update docs examples when components or APIs change.

## Environment and tooling

- Node 18+ recommended.
- Eleventy config: `.eleventy.js`.
- Tailwind via `@tailwindcss/cli` v4.
- Build uses Tailwind CLI and `terser`; both are provided via devDependencies.

## Git workflow

- `.gitattributes` configures merge strategies for generated files
- `docs/src/assets/styles.css` auto-resolves to incoming changes (regenerated by Tailwind)
- Always run `npm run build` before publishing packages

## Publishing packages

1. Bump version in root `package.json`
2. Run `npm run build` to generate dist files
3. Run `npm publish --workspaces` to publish both packages

## Package references

- `packages/css` usage and details: see `packages/css/README.md`.
- `packages/cli` usage and details: see `packages/cli/README.md`.
