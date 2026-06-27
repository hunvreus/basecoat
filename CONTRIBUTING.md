# Contributing to Basecoat

- Support development by sponsoring the author: https://github.com/sponsors/hunvreus
- Submit pull requests (PRs) against the `development` branch, not `main`.
- For branches, we have:
  - `main` is our production and default branch. This is what we deploy to https://basecoatui.com and publish to https://www.npmjs.com/package/basecoat-css.
  - `development` is for staging. We will deploy it soon at https://dev.basecoatui.com.
  - New features are worked in `feature/name-of-the-feature` branches.
  - Issues are addressed in `issue/123-main-isse` branches.
  - When ready, we PR against `development`, test it and then finally merge to `main`.
- Keep changes focused: one feature or fix per PR.
- Test locally before submitting.
- Follow existing code style.

## Cloudflare Workers deploys

Docs are built with 11ty and deployed as Workers Static Assets from `_site`.

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
