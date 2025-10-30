# Basecoat – Agent Guide

## What is Basecoat?

Basecoat is a vanilla JavaScript/HTML/CSS port of shadcn/ui components. It reuses shadcn/ui's design patterns and Tailwind CSS classes while maintaining semantic HTML, native browser elements, and full accessibility (ARIA attributes, proper hierarchies, keyboard navigation). The goal is to provide shadcn-quality components without React dependencies.

## Quickstart

- Install deps: `npm i`
- Dev docs server: `npm run docs:dev`
- Build CSS/JS: `npm run build`
- Build static docs: `npm run docs:build`

## What to edit (and what not)

- Edit sources only:
  - `src/css/basecoat.css` – All component CSS classes (Tailwind + custom)
  - `src/js/*.js` – Individual component JS files (kebab-case, ESM) + `basecoat.js` (component registry)
  - `src/nunjucks/*.njk` and `src/jinja/*.html.jinja` – Component template macros
  - `docs/src/components/*.njk` – Component documentation pages with examples
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

## Conventions

- ESM everywhere (`import`/`export`).
- Prettier defaults (2 spaces; single quotes per file preference).
- Filenames for assets: kebab-case (e.g., `dropdown-menu.js`, `basecoat.cdn.css`).
- JS naming: `camelCase` for vars/functions; `PascalCase` for DOM classes and exported component names when applicable.

## Common tasks

- Update a component's CSS/JS: Edit `src/css/basecoat.css` and/or `src/js/*.js`.
- Update a component template: Edit `src/nunjucks/*.njk` and/or `src/jinja/*.html.jinja`.
- Add a new component: Create JS, CSS, templates, and docs page under `docs/src/components/*.njk`.
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

## Package references

- `packages/css` usage and details: see `packages/css/README.md`.
- `packages/cli` usage and details: see `packages/cli/README.md`.
