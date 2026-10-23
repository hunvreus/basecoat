# Contributing to Basecoat

- Support development by sponsoring the author: https://github.com/sponsors/hunvreus
- Submit pull requests (PRs) against the `main` branch.
- Branches:
  - `main` is the default branch. All work lands here, and https://main-basecoat.hunvreus.workers.dev previews it.
  - `release` is what https://basecoatui.com deploys. Only the release workflow moves it (see below).
  - New features are worked in `feature/name-of-the-feature` branches.
  - Issues are addressed in `issue/123-main-issue` branches.
  - When ready, open a PR against `main`.
- Keep changes focused: one feature or fix per PR.
- Test locally before submitting: `npm run check` (package) and `npm run check:site` (docs site). CI runs both on every PR.
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
- Production branch: `release`
- Enable builds for non-production branches for branch preview URLs.

## Releasing

The site at basecoatui.com deploys from the `release` branch, not `main`, so the docs always match the version on npm. Nobody commits to `release` directly.

To cut a release:

1. Bump the version on `main`: `npm version 1.1.0 --no-git-tag-version`, then commit (for example "Prepare 1.1.0 release") and push.
2. Tag that commit with the same version, with no `v` prefix, and push: `git tag 1.1.0 && git push origin 1.1.0`.
3. Publish a GitHub release for the tag: `gh release create 1.1.0 --generate-notes --latest --verify-tag`.
4. Approve the staged version on npmjs.com, in the package's Staged Packages tab, or with `npm stage approve <stage-id>`. Both ask for 2FA.

Publishing the release runs `.github/workflows/release.yml`:

- **publish** checks that the tag is on `main` and matches the version in `package.json`, runs `npm run check`, and stages the version on npm with `npm stage publish`, using trusted publishing. A staged version is not installable until a maintainer approves it. If the version is already staged or published, this step is skipped.
- **deploy-site** waits until the version is live on npm, then points `release` at the tag, and Cloudflare builds and deploys the site. It checks every 30 seconds for up to about 5h50m. If you approve later than that, the job fails with a message: after approving, use Re-run failed jobs on that run, which re-runs deploy-site and then announce. If staging fails or you reject the version, the site is not deployed.
- **announce** posts the release notes to Discord, only after deploy-site succeeded. By then the version is installable from npm and `release` has moved, so Cloudflare is building the new site (that takes a few minutes).

Do not run `npm publish` by hand. Versions reach npm only through this workflow and your approval. The workflow needs no npm token and adds a provenance statement linking each version to the commit it was built from. Prereleases are not staged, deployed or announced.

You can also run the Release workflow manually from the Actions tab, with a tag and a mode. A manual run never publishes to npm.

- `deploy` (default) redeploys or rolls back the site: it moves `release` to the tag, only if that version is already on npm. It doesn't post to Discord.
- `announce` posts the tag's GitHub release to Discord again, for example after a failed post. It doesn't deploy.
- `deploy and announce` does both, and announces only if the deploy succeeded.

Thanks for helping!
