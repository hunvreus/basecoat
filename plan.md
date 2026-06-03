# Basecoat Multi-Style + Theme Refactor Plan

## Goals

- Support the current shadcn/ui visual packs: `vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`.
- Keep current CDN and Tailwind/NPM usage working.
- Keep Basecoat's own class API (`btn`, `dialog`, `popover`, etc.).
- Split CSS into base tokens/utilities, component structure, style-pack visuals, and aggregate outputs.
- Make custom token themes, including TweakCN-style themes, predictable by loading them after Basecoat CSS.

## Current Upstream Reference

- Local repo: `../_sandbox/shadcn-ui`
- Style registry: `../_sandbox/shadcn-ui/apps/v4/registry/styles.tsx`
- Style files: `../_sandbox/shadcn-ui/apps/v4/registry/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`
- Base components: `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/ui/<component>.tsx`

## Target CSS Architecture

1. `src/css/base/base.css`
   - base layer, default token fallbacks, and semantic utilities needed by CDN users
2. `src/css/components/*.css`
   - Basecoat component selectors and shared structural behavior
3. `src/css/styles/*.css`
   - one file per style pack: `vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`
   - component visuals: size, spacing, radius, typography, shadows, focus rings, variant colors when style-owned
4. Aggregates
   - `src/css/basecoat.css`: backward-compatible Basecoat default aggregate, currently Vega
   - `src/css/basecoat-<style>.css`: standalone Tailwind source bundle per style
   - `src/css/basecoat-<style>.cdn.css`: standalone CDN source bundle per style
   - `src/css/basecoat.all.css`: explicit all-in-one Tailwind source
   - `src/css/basecoat.cdn.css`: CDN build entry

No `.style-*` wrapper is part of the Basecoat public contract for style selection. Users choose a style by importing a standalone style bundle or using a style-specific generated CDN asset. Docs switch by swapping the single active full stylesheet URL.

Do not load Vega/default first and then layer another style pack on top. Split files under `src/css/styles/*.css` are source organization and advanced composition only. They should map upstream style intent directly and avoid defensive resets whose only purpose is undoing another style pack.

## Per-Component File Checklist

For every component, check these files before editing:

- Basecoat component CSS: `src/css/components/<component>.css`
- Basecoat templates/macros if relevant: `src/nunjucks/*.njk`, `src/jinja/*.html.jinja`
- Basecoat docs examples: `docs/src/components/<component>.md`
- Upstream base component: `../_sandbox/shadcn-ui/apps/v4/registry/bases/base/ui/<component>.tsx`
- Upstream docs page: `../_sandbox/shadcn-ui/apps/v4/content/docs/components/{base,radix}/<component>.mdx`
- Upstream style packs: `../_sandbox/shadcn-ui/apps/v4/registry/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`
- Basecoat style packs: `src/css/styles/{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`

## Component Migration Workflow

1. Review current Basecoat CSS, markup, templates, and docs for the component.
2. Review the upstream base component and all eight upstream style files.
3. Decide what is shared structure versus style-pack-owned visual rules.
4. Remove outdated visual rules from shared component CSS when they are now style-owned.
5. Map upstream style intent onto Basecoat selectors. Do not port `cn-*` selectors.
6. Audit RTL support using upstream `*-rtl` examples and generated `ui-rtl` code when present.
7. Prefer logical utilities/properties (`ps`, `pe`, `rounded-s`, `rounded-e`, `border-s`, `start`, `end`) over duplicated `:dir(rtl)` branches.
8. Audit each style as a standalone full bundle, not as an override layered on another style.
9. Check state selectors during that audit: `focus-visible`, `aria-invalid`, `hover`, disabled, open, selected, checked, and pressed states.
10. Update the component section in all eight Basecoat style files.
11. Document non-trivial deltas as `intentional`, `drift fixed`, or `deferred`.
12. Align the component docs with the current upstream docs page:
   - equivalent examples
   - matching labels/anchors where reasonable
   - Basecoat-specific differences and extras
   - class/API reference
   - explicit notes for unsupported/deferred upstream features
   - RTL section when supported, or explicit RTL deferral
13. Update `migration-tracker.md`.
14. Run `npm run build`.
15. Run `npm run docs:build` when docs or docs style assets change.
16. Manually verify the docs page in light/dark, RTL, and all eight styles.

Do not mark a component done because CSS compiles. It needs a visual/state check.

## Packaging Contract

- Keep `@import "basecoat-css";` as the Basecoat backward-compatible default import. It currently resolves to Vega; this is not the upstream shadcn/ui generated default.
- Keep existing default CDN and JS bundle paths.
- Export standalone style bundles from `packages/css` as `basecoat-css/<style>` and `basecoat-css/<style>.css`.
- Export split style files from `packages/css` as `basecoat-css/styles/<style>` for advanced composition.
- Generate style-specific CDN assets for every style.
- Custom themes should load after Basecoat styles so their `:root` and `.dark` tokens override defaults.

## Component Migration Order

1. `button`
2. `button-group`
3. `input`
4. `textarea`
5. `native-select`
6. `select`
7. `checkbox`
8. `radio`
9. `switch`
10. `range`
11. `label`
12. `field`
13. `card`
14. `alert`
15. `badge`
16. `table`
17. `tabs`
18. `popover`
19. `dropdown-menu`
20. `dialog`
21. `command`
22. `sidebar`
23. `toast`
24. `tooltip`
25. `collapsible` (deferred: native `details`/`summary`; add `Disclosure` docs page)
26. `kbd`

## Current Status

- CSS split exists.
- Docs style switcher exists.
- Button and Button Group are migrated for current scope and tracked in `migration-tracker.md`.
- No other component should be considered migrated.

## TODO

- Add a `Disclosure` docs page for Basecoat's native `details`/`summary` pattern.
- Include examples for default, open by default, icon/chevron, accordion/group behavior, and RTL.
- Keep shadcn/ui `Collapsible` deferred unless Basecoat needs controlled JS state or animation hooks beyond native disclosure.

## Risks

- Selector drift between Basecoat markup and upstream shadcn/ui assumptions.
- Incorrectly leaving visual rules in shared component CSS.
- Bundle growth from style-specific assets.
- Docs style assets need base semantic utilities available during Tailwind compilation.
