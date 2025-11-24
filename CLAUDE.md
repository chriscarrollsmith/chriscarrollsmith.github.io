## CLAUDE.md

## ⚠️ CRITICAL: Pre-Commit Checklist

**Run these steps BEFORE every commit. No exceptions.**

### 1. Visual QA (if ANY UI/styling changed)

**Start dev server:**
```bash
bun run dev
```

**Capture baseline screenshots BEFORE making changes:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --label baseline \
  --color-scheme both \
  "#home" "#about" "#projects" "#writing" "#events"
```

**After making changes, capture candidate screenshots:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --label candidate \
  --color-scheme both \
  "#home" "#about" "#projects" "#writing" "#events"
```

**Compare and verify no regressions:**
```bash
# For each major section, compare light and dark modes
llm -a visual_qa/screenshots/baseline/xl-home-light.png \
    -a visual_qa/screenshots/candidate/xl-home-light.png \
    "$(cat visual_qa/standard_rubric.md)

Compare these screenshots and score both using the rubric above."
```

**Fix any regressions, re-capture, and repeat until scores are equal or better.**

### 2. Build & Tests (ALWAYS required)

```bash
# Must succeed
bun run build

# Run tests if they exist
bun run test:e2e
```

### 3. Lint (if code changed)

```bash
bun run lint
```

### 4. Stage changes for user review

**After completing all checks above:**

```bash
git add -A
git status  # Show what will be committed
```

**IMPORTANT: Do NOT create commits.** The user will review staged changes and commit manually with GPG signing. Your job is to:
1. Complete all verification steps above
2. Stage the changes with `git add`
3. Inform the user that changes are ready for review

---

## Tech Stack

- **Runtime**: Bun (use `bun run dev`, `bun run build`, `bun run preview`)
- **Framework**: Astro 5 + React 18 (static site generation, file-based routing)
- **Language**: TypeScript with ES6 imports
- **Styling**: CSS with custom properties (no framework)
- **Testing**: Playwright for e2e, Lighthouse CI for performance
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

## Critical Rules (High-Likelihood Failures)

### MUST: Use root-absolute asset paths
- ✅ `/images/logo.svg`
- ❌ `images/logo.svg` (breaks on nested routes like `/blog/1`)

### MUST: Test dark mode for styling changes
- Site supports `@media (prefers-color-scheme: dark)`
- Use CSS custom properties from `src/App.css`: `var(--color-text)`, `var(--color-bg-light)`, `var(--color-link)`
- Define BOTH light and dark values in `:root` and `@media (prefers-color-scheme: dark)`
- **Always capture screenshots with `--color-scheme both`**

### MUST: Use correct React hydration directives
- Use `client:load` for interactive components
- Use `client:only="react"` for components using `window`/`document` or browser-only widgets
- Incorrect directives cause SSR errors

### MUST: Maintain accessibility for Lighthouse
- Forms need `autocomplete` attributes (`email`, `name`, or `off`)
- Keep labels, ARIA attributes, and semantic HTML
- Removing these breaks Lighthouse CI thresholds in `lighthouserc.json`

### MUST: Keep site URLs in sync
- Canonical URL defined in: `astro.config.mjs` (`site` field) AND `src/layouts/BaseLayout.astro` (`siteURL` constant)
- Update both when changing domain

### MUST: Preserve blog data schema
- Posts in `src/data/blogs.json` require: `id`, `title`, `date`, `excerpt`, `content`, `image`
- Optional: `script`
- Schema changes require updating all consumers

---

## Testing & Verification Reference

### Visual QA Workflow Detail

1. **Baseline**: Capture screenshots before changes
2. **Candidate**: Capture screenshots after changes
3. **Compare**: Use `llm` with standard rubric (see below)
4. **Fix**: Address regressions and re-capture
5. **Repeat**: Until no regressions remain

**Important**: Vision models are sensitive to file format and viewport. Always use:
- Same format (PNG)
- Same breakpoints
- Same color scheme settings
- Same anchor selectors

### Dark Mode Capture Examples

**Light mode only:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --label baseline \
  --color-scheme light \
  "#home"
```

**Dark mode only:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321/cv \
  --label baseline \
  --color-scheme dark \
  ".publications-list"
```

**Both modes (default, recommended):**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --label baseline \
  --color-scheme both \
  "#home"
```

Files saved as: `xl-home-light.png` and `xl-home-dark.png`

**Special attention**: Citations on `/cv` page must be readable in both modes. Use `.publications-list` selector.

### Playwright Tests

- Config: `playwright.config.js`
- Run: `bun run test:e2e`
- Reports: `playwright-report/index.html` (never opens automatically; view manually)

### Lighthouse CI

- Config: `lighthouserc.json`
- Run: `bun run lighthouse`
- **Note**: Fails in WSL2 due to Chrome limitations; runs correctly in CI

---

## Visual QA Reference

### Using `llm` Tool

Simon Willison's `llm` tool is available for vision model analysis.

**Attach images:**
```bash
llm -a path/to/image.png "Question about image"
```

**With schema:**
```bash
llm -a image.png "Score this" --schema "score int: Score 0-10"
```

**Extract JSON:**
```bash
llm -a image.png "Score this" --xl  # Extracts last fenced code block
```

**Note**: Model sees images by sequence, not filename.

### Standard Rubric (0–2 × 5 metrics = 0–10 composite)

**Must be kept in sync with `visual_qa/standard_rubric.md`**

Each metric scores **0, 1, or 2**:
- **0** = Fails this metric; clear problems
- **1** = Acceptable; minor issues but generally OK
- **2** = Exemplary; clearly strong and hard to improve without tradeoffs

**Metrics:**

1. **Color cohesion & contrast**
   - 0: Clashing colors, poor contrast, hard to perceive content
   - 1: Generally cohesive, adequate contrast, minor rough edges
   - 2: Harmonious palette, strong contrast, no distracting clashes

2. **Text readability**
   - 0: Hard to read (too small, low contrast, busy background, cramped)
   - 1: Readable but could improve (slightly small, borderline contrast)
   - 2: Very easy to read; deliberate sizing, weights, and line spacing

3. **Layout & spacing**
   - 0: Noticeable problems (overlaps, cramping, gaps, misalignment, clipping)
   - 1: Layout works; minor issues a designer would notice
   - 2: Clean, balanced composition with clear alignment and breathing room

4. **Responsiveness / hierarchy preservation**
   - 0: On mobile/alternate breakpoint, content lost/cramped/confusing
   - 1: Core hierarchy preserved but elements feel squeezed or awkward
   - 2: Alternate breakpoint preserves hierarchy and remains comfortable

5. **Cohesion & wow factor**
   - 0: Feels out of step with site or visually flat/detracts from experience
   - 1: Fits reasonably but unremarkable; trades cohesion for local improvements
   - 2: Feels cohesive with site; clear "wow" or polish factor

**Composite score** = sum of five metrics (0–10)

### Extending the Rubric

Add custom metrics by extending the base rubric. Max score increases by 2 per metric.

**Example with 6th metric:**
```bash
llm -a baseline.png \
    "$(cat visual_qa/standard_rubric.md)

6. Embedded image crispness and quality
   - 0: Blurry, pixelated, or low quality
   - 1: Generally acceptable, minor issues
   - 2: Crisp and very high quality

Score on all six metrics (0-12 max)." \
    --schema "color_score int, text_readability_score int, layout_spacing_score int, responsiveness_hierarchy_score int, cohesion_wow_score int, embedded_image_quality_score int"
```

### Other Uses for `llm`

Ask focused questions:
- "Is the nav bar obscuring any page content?"
- "Are the button colors consistent across sections?"
- "Is the dark mode text sufficiently contrasted?"
