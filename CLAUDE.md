## CLAUDE.md

### Tech stack at a glance

- **Astro 5 + React 18**: Static site generation with file‑based routing and selectively hydrated React components via `@astrojs/react`.
- **TypeScript**: Primary language; keep code typed and consistent with existing patterns.
- **Imports**: Use ES6 module syntax for imports.
- **Runtime & scripts**: **Bun is canonical**. Use `bun run dev`, `bun run build`, and `bun run preview` for local work.
- **Tooling**: Vite, ESLint + `@typescript-eslint`, Playwright (`playwright.config.js`), Lighthouse CI (`lighthouserc.json`).
- **Hosting & deploy**: GitHub Actions build to static files in `dist/`, deployed to GitHub Pages.

### High‑likelihood failure cases (rules)

- **Asset paths**
  - Always use root‑absolute asset paths (starting with `/`) in Astro, React, and JSON data.  
  - Example: prefer `/images/logo.svg`, avoid `images/logo.svg`, which breaks on nested routes like `/blog/1`.

- **Site URL configuration**
  - The canonical site URL is defined in both the Astro config (`site` field) and `src/layouts/BaseLayout.astro` (`siteURL` constant).  
  - When changing the domain, keep these values in sync.

- **SEO and social images**
  - `BaseLayout.astro` already handles canonical URLs, Open Graph, Twitter Cards, and JSON‑LD for blog posts.  
  - Use existing helpers that convert image paths to absolute URLs; avoid hard‑coding relative image URLs in meta tags.

- **React hydration and browser APIs**
  - Use Astro’s `client:*` directives correctly when adding or modifying React components.  
  - For components that access `window`, `document`, or third‑party widgets that assume a browser (e.g., Calendly), use `client:only="react"` to avoid SSR errors.

- **Forms, accessibility, and Lighthouse**
  - Forms should follow accessibility best practices and include appropriate `autocomplete` attributes (e.g., `email`, `name`, or `off` where intentional).  
  - Changes that remove labels, ARIA attributes, or autocomplete hints are likely to break Lighthouse CI thresholds in `lighthouserc.json`.

- **Blog data shape**
  - Blog posts live in `src/data/blogs.json` and must follow the existing schema (including `id`, `title`, `date`, `excerpt`, `content`, `image`, optional `script`).  
  - Avoid schema changes unless you also update all consumers; when adding posts, ensure required fields are present and consistent with existing entries.

 - **Running and testing**
  - For local work, prefer:
    ```bash
    bun run dev
    bun run build
    bun run preview
    ```
  - End‑to‑end tests use Playwright (see `playwright.config.js`); Lighthouse CI audits are configured in `lighthouserc.json`. For substantial UI or performance changes, prefer to run these checks or at least ensure build output remains Lighthouse‑friendly.
  - **Playwright test output**: Always access test results programmatically via the list reporter. The HTML report viewer is configured with `open: 'never'` to prevent automatic browser display. If needed, the HTML report can be manually viewed at `playwright-report/index.html`.

### WSL2 and Lighthouse CI

- `bun run lighthouse` invokes `lhci autorun` and will fail with “Unable to connect to Chrome” when run in this environment under WSL2, due to known LHCI/Chrome limitations. LHCI will still run correctly in CI.
