# Basecoat Style Migration Tracker

Track migration of Basecoat components against the latest shadcn/ui v4 component source and all eight style packs.

Upstream source root: `../_sandbox/shadcn-ui`
Upstream style files: `apps/v4/registry/styles/style-{vega,nova,maia,lyra,mira,luma,sera,rhea}.css`

Legend:
- `pending`: not started
- `in-progress`: actively being migrated
- `done`: style-pack coverage implemented for current scope
- `deferred`: intentionally postponed

| Component | Status | Basecoat CSS | Upstream Base | Upstream Styles | Notes |
| --- | --- | --- | --- | --- | --- |
| alert | pending | `src/css/components/alert.css` | `apps/v4/registry/bases/base/ui/alert.tsx` | `style-*.css` |  |
| badge | pending | `src/css/components/badge.css` | `apps/v4/registry/bases/base/ui/badge.tsx` | `style-*.css` |  |
| button | done | `src/css/components/button.css` | `apps/v4/registry/bases/base/ui/button.tsx` | all 8 `style-*.css` | Standalone button rules are mapped across all eight styles, including xs sizing and icon-aware padding. Drift fixed: Maia base radius now uses upstream `rounded-4xl`. Button-group adjacency details remain separate and should be handled during button-group migration. |
| button-group | pending | `src/css/components/button-group.css` | `apps/v4/registry/bases/base/ui/button-group.tsx` | `style-*.css` |  |
| card | pending | `src/css/components/card.css` | `apps/v4/registry/bases/base/ui/card.tsx` | `style-*.css` |  |
| checkbox | pending | `src/css/components/checkbox.css` | `apps/v4/registry/bases/base/ui/checkbox.tsx` | `style-*.css` |  |
| collapsible | pending | `src/css/components/collapsible.css` | `apps/v4/registry/bases/base/ui/collapsible.tsx` | `style-*.css` |  |
| command | pending | `src/css/components/command.css` | `apps/v4/registry/bases/base/ui/command.tsx` | `style-*.css` |  |
| dialog | pending | `src/css/components/dialog.css` | `apps/v4/registry/bases/base/ui/dialog.tsx` | `style-*.css` |  |
| dropdown-menu | pending | `src/css/components/dropdown-menu.css` | `apps/v4/registry/bases/base/ui/dropdown-menu.tsx` | `style-*.css` |  |
| field | pending | `src/css/components/field.css` | `apps/v4/registry/bases/base/ui/field.tsx` | `style-*.css` |  |
| input | pending | `src/css/components/input.css` | `apps/v4/registry/bases/base/ui/input.tsx` | `style-*.css` |  |
| kbd | pending | `src/css/components/kbd.css` | `apps/v4/registry/bases/base/ui/kbd.tsx` | `style-*.css` |  |
| label | pending | `src/css/components/label.css` | `apps/v4/registry/bases/base/ui/label.tsx` | `style-*.css` |  |
| native-select | pending | `src/css/components/native-select.css` | `apps/v4/registry/bases/base/ui/native-select.tsx` | `style-*.css` |  |
| popover | pending | `src/css/components/popover.css` | `apps/v4/registry/bases/base/ui/popover.tsx` | `style-*.css` |  |
| radio | pending | `src/css/components/radio.css` | `apps/v4/registry/bases/base/ui/radio-group.tsx` | `style-*.css` |  |
| range | pending | `src/css/components/range.css` | `apps/v4/registry/bases/base/ui/slider.tsx` | `style-*.css` | Consider moving slider fill sync into shared JS. |
| select | pending | `src/css/components/select.css` | `apps/v4/registry/bases/base/ui/select.tsx` | `style-*.css` |  |
| sidebar | pending | `src/css/components/sidebar.css` | `apps/v4/registry/bases/base/ui/sidebar.tsx` | `style-*.css` |  |
| switch | pending | `src/css/components/switch.css` | `apps/v4/registry/bases/base/ui/switch.tsx` | `style-*.css` |  |
| table | pending | `src/css/components/table.css` | `apps/v4/registry/bases/base/ui/table.tsx` | `style-*.css` |  |
| tabs | pending | `src/css/components/tabs.css` | `apps/v4/registry/bases/base/ui/tabs.tsx` | `style-*.css` |  |
| textarea | pending | `src/css/components/textarea.css` | `apps/v4/registry/bases/base/ui/textarea.tsx` | `style-*.css` |  |
| toast | pending | `src/css/components/toast.css` | `apps/v4/registry/bases/base/ui/sonner.tsx` | `style-*.css` | Needs review against current Basecoat toast structure. |
| tooltip | pending | `src/css/components/tooltip.css` | `apps/v4/registry/bases/base/ui/tooltip.tsx` | `style-*.css` |  |
