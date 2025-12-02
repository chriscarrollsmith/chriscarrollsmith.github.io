# CLAUDE.md

## Tech Stack

- **Runtime**: Bun (use `bun run dev`, `bun run build`, `bun run preview`)
- **Framework**: Astro 5 + React 18 (static site generation, file-based routing)
- **Language**: TypeScript with ES6 imports
- **Styling**: CSS with custom properties (no framework)
- **Testing**: Playwright for e2e, Axe-core for accessibility, Lighthouse in CI
- **Deploy**: GitHub Actions → GitHub Pages

### Responsive Breakpoints

| Name | Min-Width | Media Query |
|------|-----------|-------------|
| **xs** | 0px | _Base styles (mobile)_ |
| **sm** | 640px | `@media (min-width: 640px)` |
| **md** | 768px | `@media (min-width: 768px)` |
| **lg** | 1024px | `@media (min-width: 1024px)` |
| **xl** | 1280px | `@media (min-width: 1280px)` |

---

## Critical Rules

### Use root-absolute asset paths
- ✅ `/images/logo.svg`
- ❌ `images/logo.svg` (breaks on nested routes like `/blog/1`)

### Accommodate dark mode
- Blog and CV pages respect `@media (prefers-color-scheme: dark)`
- Use CSS custom properties from `src/App.css`: `var(--color-text)`, `var(--color-bg-light)`, `var(--color-link)`
- Define BOTH light and dark values in `:root` and `@media (prefers-color-scheme: dark)`
- Home page alternates between light and dark sections, so it mostly ignores dark mode

### Use client-side React hydration directives to avoid SSR errors
- Use `client:load` for interactive components
- Use `client:only="react"` for components using `window`/`document` or browser-only widgets

### Maintain accessibility features to pass Lighthouse/Axe-core checks
- Forms need `autocomplete` attributes (`email`, `name`, or `off`)
- Keep labels, ARIA attributes, and semantic HTML

### Keep site URLs in sync
- Canonical URL defined in: `astro.config.mjs` (`site` field) AND `src/layouts/BaseLayout.astro` (`siteURL` constant)

---

## Before You Start

Before making any code or content changes, you should *always* capture baseline screenshots.

**Capture baseline screenshots:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --start-dev \
  --label baseline \
  "#home" "#about" "#projects" "#writing" "#events" \
  "/cv" "/blog" "/blog/1"
```

The screenshot workflow takes 60-70 seconds to complete. Set `run_in_background` to `false` with a 2 minute timeout.

---

## When You're Done

### 1. Build & Tests (ALWAYS required)

```bash
# Must succeed
bun run build

# Run tests
bun run test:e2e
```

### 2. Lint (if code changed)

```bash
bun run lint
```

### 3. Run visual QA (if any UI/styling changed)

**After making changes, capture candidate screenshots:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --start-dev \
  --label candidate \
  "#home" "#about" "#projects" "#writing" "#events" \
  "/cv" "/blog" "/blog/1"
```

The script auto-compares to baseline and reports changed images. See `.claude/skills/visual-qa/SKILL.md` for scoring workflows, video capture for animations, and rubric extensions.

### 4. Stage changes for user review

**After completing all checks above:**

```bash
git add -A
git status  # Show what will be committed
```

The user will review staged changes and commit manually with GPG signing.

---

## Updating CLAUDE.md

Update minimalistically. Prioritize maintaining the integrity of the current rule set, and remember that brevity is the soul of wit.