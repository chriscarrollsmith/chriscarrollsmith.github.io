# AGENTS.md

General tech-stack and code conventions live in `CLAUDE.md`. Standard scripts are
defined in `package.json` (`dev`, `build`, `lint`, `test`, `test:e2e`, `preview`).

## Cursor Cloud specific instructions

The dev environment is refreshed automatically by the update script (`bun install`
plus a Playwright Chromium refresh); `bun` and the Playwright browsers are already
present from the VM snapshot, so no manual install steps are needed.

Services and how to run them:

- Dev server (main app): `bun run dev` serves the Astro + React site on
  `http://localhost:4321`. This is all you need for interactive/UI work and hot reload.
- Production preview: `bun run build` then `bun run preview` (also on port 4321).
  `build` runs Substack/YouTube RSS sync, CV PDF generation, and Mermaid image
  rendering before `astro build`. The sync steps hit the network but fail/skip
  gracefully offline, so `build` still succeeds without connectivity.

Non-obvious gotchas:

- Tests run against the production `preview` build, not the dev server. Because
  `playwright.config.js` uses `reuseExistingServer: !process.env.CI`, a dev server
  already listening on port 4321 will be reused and the suite will fail. Run tests
  with `CI=1` (e.g. `CI=1 bun run test:e2e`) or ensure port 4321 is free first so
  Playwright starts its own `bun run preview` server.
- `bun run test:e2e` requires a prior successful `bun run build` (the preview server
  serves `dist/`).
- Substack HTML→markdown conversion in `scripts/sync-substack.ts` shells out to
  `pandoc`; it is only invoked when new Substack posts are found, so `build` works
  without `pandoc` in the common case.
