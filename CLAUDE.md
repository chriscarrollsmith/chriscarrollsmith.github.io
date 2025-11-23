## CLAUDE.md

### Tech stack at a glance

- **Astro 5 + React 18**: Static site generation with file‑based routing and selectively hydrated React components via `@astrojs/react`.
- **TypeScript**: Primary language; keep code typed and consistent with existing patterns.
- **Imports**: Use ES6 module syntax for imports.
- **Runtime & scripts**: **Bun is canonical**. Use `bun run dev`, `bun run build`, and `bun run preview` for local work.
- **Tooling**: Vite, ESLint + `@typescript-eslint`, Playwright (`playwright.config.js`), Lighthouse CI (`lighthouserc.json`).
- **Hosting & deploy**: GitHub Actions build to static files in `dist/`, deployed to GitHub Pages.

### Responsive breakpoints

The site uses a **Tailwind CSS-inspired** breakpoint scale for responsive design:

| Name | Min-Width | Use Case | Media Query |
|------|-----------|----------|-------------|
| **xs** | 0px | Mobile (default) | _Base styles_ |
| **sm** | 640px | Large mobile | `@media (min-width: 640px)` |
| **md** | 768px | Tablet | `@media (min-width: 768px)` |
| **lg** | 1024px | Small desktop | `@media (min-width: 1024px)` |
| **xl** | 1280px | Large desktop | `@media (min-width: 1280px)` |


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

Simon Willison's `llm` tool is installed in this environment, and you can use it to interact with a vision model.

## Workflow (high-level)

1. Capture **baseline screenshots** for each viewport-height pane at the relevant breakpoints (e.g., desktop, mobile).
2. Capture **candidate screenshots** for the same panes and breakpoints after a visual change.
3. Run a **rubric-based comparison** in `llm` between baseline and candidate screenshots.
4. Adjust the frontend based on the feedback and re-run the comparison, aiming for strictly better scores on the affected panes and no regressions elsewhere.

Vision models can be sensitive to **file format, compression level, and crop**. Always keep **file format, encoding, viewport, breakpoint, and crop** consistent when comparing before/after shots.

## Basic usage of `llm`

- Attach screenshots with `-a` (e.g., `llm -a path/to/image.png "Question about image"`).
- Specify a schema for the output with the syntax, `--schema "variable_name type: Description"`.
- If desired for piping output to `jq` or JSON file for programmatic usage, use `--xl` (short for `--extract-last` fenced code block) to extract fenced json from the LLM's markdown response.

Note that you can attach multiple images with `-a`, and the AI model can distinguish them by sequence, but the model will not know the filenames.

## Standard rubric (0–2 × 5 metrics = 0–10 composite)

This section is a copy of `visual_qa/standard_rubric.md` and **must be kept in sync** with that file. The rubric consists of **five metrics**, each scored **0, 1, or 2**. Sum them into a **composite score from 0–10**. Separately score the baseline and candidate on the rubric, then compare the scores.

For all metrics:
- 0 = Fails this metric; clear problems.
- 1 = Acceptable; minor issues but generally OK.
- 2 = Exemplary; clearly strong and hard to improve without tradeoffs.

**Metrics**

1. Color cohesion & contrast
   - 0: Clashing or incoherent colors, poor contrast, or backgrounds that make content hard to perceive.
   - 1: Generally cohesive palette with adequate contrast, minor rough edges or slightly off tones.
   - 2: Harmonious, intentional palette with strong contrast where needed and no distracting clashes.

2. Text readability
   - 0: Text is hard to read (too small, low contrast, busy background, cramped line spacing).
   - 1: Text is readable but could be improved (slightly small, borderline contrast, or minor background interference).
   - 2: Text is very easy to read; sizes, weights, and line spacing feel deliberate and comfortable.

3. Layout & spacing
   - 0: Noticeable visual problems (overlaps, cramped sections, awkward gaps, misalignment, or clipping).
   - 1: Layout works, with minor alignment or spacing issues that a user would tolerate but a designer would notice.
   - 2: Clean, balanced composition with clear alignment, breathing room, and no obvious spacing issues.

4. Responsiveness / hierarchy preservation
   - 0: On the alternate breakpoint (e.g., mobile), important content feels lost, cramped, or re-ordered in a confusing way.
   - 1: The core hierarchy is preserved but some elements feel squeezed, de-emphasized, or visually awkward.
   - 2: The alternate breakpoint clearly preserves the hierarchy and intent of the primary layout while remaining comfortable to use.

5. Cohesion & wow factor
   - 0: The pane feels out of step with the rest of the site or visually flat in a way that detracts from the experience.
   - 1: Fits the site reasonably well but is unremarkable, or trades a bit of cohesion for local improvements.
   - 2: Feels cohesive with the rest of the site and has a clear “wow” or polish factor without breaking consistency.

The **composite score** is the sum of the five metric scores (0–10).

## Extending the standard rubric

The standard rubric is extensible; simply add 2 to the max composite score for each new metric. For example,

```bash
llm -a visual-qa/baseline/home-desktop.webp \
    "$(
      cat visual-qa/standard_rubric.md
    )

6. Embedded image crispness and quality
   - 0: An embedded image is blurry, pixelated, or otherwise low quality.
   - 1: Embedded images are generally acceptable, with minor potential issues.
   - 2: Embedded images are crisp and very high quality.

Score image on all six metrics using 0/1/2." \
    --schema "color_score int, text_readability_score int, layout_spacing_score int, responsiveness_hierarchy_score int, cohesion_wow_score int, embedded_image_quality_score int"
```

If baseline and candidate score the same, you can also submit both images to the vision model and ask whether the first candidate is **better, same, or worse** than the second, and ask for a short note on why.

You can also use `llm` for answering more focused questions, like, "Is the placement of the nav bar at the top of the page partially obscuring any page content?"
