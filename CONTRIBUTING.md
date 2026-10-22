# Contributing to Basecoat

- Support development by sponsoring the author: https://github.com/sponsors/hunvreus
- Submit pull requests (PRs) against the `main` branch.
- For branches, we have:
  - `main` is our production and default branch. This is what we deploy to https://basecoatui.com and publish to https://www.npmjs.com/package/basecoat-css.
  - New features are worked in `feature/name-of-the-feature` branches.
  - Issues are addressed in `issue/123-main-issue` branches.
  - When ready, open a PR against `main`.
- Keep changes focused: one feature or fix per PR.
- Test locally before submitting.
- Follow existing code style.

## Cloudflare Workers deploys

Docs are built with ReallySimpleDocs/Astro and deployed as Workers Static Assets from `site/dist`.

- Local preview: `npm run workers:dev`
- Production deploy: `npm run workers:deploy`
- Preview version upload: `npm run workers:preview`

Workers Builds settings:

- Build command: `npm run docs:build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Production branch: `main`
- Enable builds for non-production branches for branch preview URLs.

Thanks for helping!
