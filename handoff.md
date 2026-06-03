# Basecoat Multi-Style Migration Handoff

This handoff is for resuming the `release/1.0.0` work on Basecoat's split CSS architecture and shadcn/ui v4 style-pack support.

## Ground Truth

- Local Basecoat repo: `/Users/hunvreus/Workspace/basecoat`
- Local shadcn/ui upstream repo: `/Users/hunvreus/Workspace/_sandbox/shadcn-ui`
- Upstream branch/commit verified during this pass: `main` at `460ad60d8`
- Upstream style registry: `../_sandbox/shadcn-ui/apps/v4/registry/styles.tsx`
- Current upstream styles: `vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`

The earlier five-style assumption was wrong. Luma, Sera, and Rhea are current upstream styles and must be included in every component migration.

## Core Rules

- Keep Basecoat's own class API (`btn`, `btn-outline`, `dialog`, `popover`, etc.).
- Do not introduce shadcn/ui `cn-*` classes.
- Use upstream shadcn/ui as a style reference, not as selectors to copy directly.
- Translate upstream style intent to Basecoat selectors and markup.
- Component CSS should stay structural/shared when possible.
- Style-pack CSS owns visual differences: radius, density, spacing, typography, focus rings, shadows, and style-specific variant details.
- Default aggregate behavior remains Vega.
- Non-default styles are selected by importing or loading the relevant style file, not by requiring `.style-*` wrapper classes.

## Files To Check For Every Component

- Basecoat component CSS: `src/css/components/<component>.css`
- Basecoat templates/macros if relevant: `src/nunjucks/*.njk`, `src/jinja/*.html.jinja`
- Basecoat docs page: `docs/src/components/<component>.md`
- Upstream base component: `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/ui/<component>.tsx`
- Upstream styles: `../_sandbox/shadcn-ui/apps/v4/registry/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`
- Basecoat styles: `src/css/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`

## Required Process

1. Review current Basecoat CSS and markup/templates/docs.
2. Review upstream base component source.
3. Review the component section in all eight upstream style files.
4. Decide what belongs in shared component CSS versus each style file.
5. Remove outdated shared visual rules if those rules are now style-owned.
6. Implement the component section in all eight Basecoat style files.
7. Keep Basecoat selectors only.
8. Classify non-trivial differences as `intentional`, `drift fixed`, or `deferred`.
9. Update `migration-tracker.md`.
10. Run `npm run build`.
11. Run `npm run docs:build` when docs or docs style assets are touched.
12. Browser-check light/dark and all eight styles.

Do not mark a component done just because CSS compiles.

## What Has Been Done

- Split CSS source into:
  - `src/css/base/base.css`
  - `src/css/components/*.css`
  - `src/css/styles/style-*.css`
- Kept `src/css/basecoat.css` as the backward-compatible default aggregate.
- Added `src/css/basecoat.all.css` as an explicit all-in-one Tailwind source.
- Updated `scripts/build.js` to copy split CSS folders into `packages/css/dist`.
- Split `select` and `native-select`.
- Kept `src/css/components/form.css` as a convenience aggregate rather than nesting under `components/form/*`.
- Added docs style switcher in `docs/src/_includes/partials/header.njk`.
- Added docs stylesheet swapping in `docs/src/_includes/layouts/base.njk`.
- Added docs style entrypoints for all non-default styles:
  - `docs/css/style-nova.css`
  - `docs/css/style-maia.css`
  - `docs/css/style-lyra.css`
  - `docs/css/style-mira.css`
  - `docs/css/style-luma.css`
  - `docs/css/style-sera.css`
  - `docs/css/style-rhea.css`
- Added Basecoat style files for all eight upstream styles:
  - `src/css/styles/style-vega.css`
  - `src/css/styles/style-nova.css`
  - `src/css/styles/style-maia.css`
  - `src/css/styles/style-lyra.css`
  - `src/css/styles/style-mira.css`
  - `src/css/styles/style-luma.css`
  - `src/css/styles/style-sera.css`
  - `src/css/styles/style-rhea.css`

## Button Status

Button is the only component with style-pack sections currently present.

Files involved:

- `src/css/components/button.css`
- `src/css/styles/style-vega.css`
- `src/css/styles/style-nova.css`
- `src/css/styles/style-maia.css`
- `src/css/styles/style-lyra.css`
- `src/css/styles/style-mira.css`
- `src/css/styles/style-luma.css`
- `src/css/styles/style-sera.css`
- `src/css/styles/style-rhea.css`
- `docs/src/components/button.md`

Current button work includes:

- Shared button CSS moved toward structural rules.
- Visual rules moved into style files.
- `xs` button and icon size classes added.
- Icon-aware padding mapped with Basecoat selectors using `:has(> svg:first-child)` and `:has(> svg:last-child)`.
- All eight style files have Button sections.
- Docs include `btn-xs-outline` and `btn-xs-icon-outline` examples.

Button should remain `in-progress` until browser-audited across light/dark and all eight styles. Button-group adjacency is separate and should be handled during `button-group`.

## Current Component Status

- `button`: in progress / pending visual audit
- Everything else: pending

No component besides Button should be considered migrated.

## Issues Encountered

- The original migration plan assumed only five styles. Upstream now has eight.
- The first button attempt mixed old Basecoat visual rules with new style-pack rules, causing broken rendering.
- Some docs style entrypoints need `src/css/base/base.css` imported first so Tailwind can resolve semantic utilities like `focus-visible:border-ring`.
- Style switching should remove the override stylesheet `href` for Vega instead of setting `href=""`.
- Sidebar dropdown width was a tangent. The user explicitly said not to modify generic CSS for that; handle width with a Tailwind class only when that task is active.

## Things Learned

- Shadcn/ui icon-aware button padding is CSS-owned, not React-owned.
- Upstream uses data hooks like `has-data-[icon=inline-start]:pl-*`.
- Basecoat should map that to its own markup, currently `:has(> svg:first-child)` and `:has(> svg:last-child)`.
- Blind copy is not viable because upstream uses `cn-*` class composition while Basecoat uses explicit classes like `btn-xs-icon-outline`.

## Build And Validation Commands

```sh
npm run build
npm run docs:build
npm run docs:dev
```

Use `npm run docs:dev` for manual browser review.

## Remaining Work

1. Run build validation after the latest Luma/Sera/Rhea wiring.
2. Browser-check `/components/button` for all eight styles in light and dark mode.
3. Update Button tracker status only after visual audit.
4. Migrate `button-group` next because it interacts with button radius and adjacency.
5. Continue component-by-component using `migration-tracker.md`.

## Current Risks

- Button may still have visual deltas from upstream until audited.
- Docs style override assets may duplicate base CSS because they import base utilities for Tailwind compilation.
- The package does not currently generate separate style-specific CDN bundles beyond split style exports.
- The worktree includes unrelated sidebar template changes; do not revert or fold them into style migration unless explicitly requested.
