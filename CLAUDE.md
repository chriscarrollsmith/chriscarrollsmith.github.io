## CLAUDE.md

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

**Start dev server:**
```bash
bun run dev
```

**Capture baseline screenshots:**
```bash
bun visual_qa/capture_anchors.mjs \
  --base-url http://localhost:4321 \
  --label baseline \
  "#home" "#about" "#projects" "#writing" "#events"
```

Kill the server when you're done.

---

## When You're Done

### 1. Build & Tests (ALWAYS required)

```bash
# Must succeed
bun run build

# Run tests if they exist
bun run test
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
  --label candidate \
  "#home" "#about" "#projects" "#writing" "#events"
```

**Option 1: Score baseline and candidate and compare:**
Visual scoring works best when one image is graded at a time. Use the rubric to separately score the baseline and candidate for each affected component, then compare the scores to verify no regressions.

```bash
llm -a visual_qa/screenshots/baseline/xl-home-light.png \
    "$(cat visual_qa/standard_rubric.md)

Score the website screenshot using the rubric above."
```

```bash
llm -a visual_qa/screenshots/candidate/xl-home-light.png \
    "$(cat visual_qa/standard_rubric.md)

Score the website screenshot using the rubric above."
```

**Option 2: Describe intended change and ask the model to compare baseline and candidate to flag regressions:**
```bash
llm -a visual_qa/screenshots/baseline/xl-home-light.png \
    visual_qa/screenshots/candidate/xl-home-light.png \
    "I made a CSS change to the home page to apply a dark overlay to the first (Home) section to improve text readability. Here are the before and after screenshots. Compare them, judge whether the change is an improvement, and flag any regressions."
```

**Fix any regressions, re-capture, and repeat until scores are equal or better.**

### 4. Stage changes for user review

**After completing all checks above:**

```bash
git add -A
git status  # Show what will be committed
```

The user will review staged changes and commit manually with GPG signing.

---

## Visual QA Reference

### Using `llm` Tool

Simon Willison's `llm` tool is available for vision model analysis.

**Attach images:**
```bash
llm -a path/to/image.png -a path/to/another/image.png "Compare these website screenshots"
```
**Note**: Model sees images by sequence, not filename.

**With schema:**
```bash
llm -a image.png "Score the image" --schema "score int: Score 0-10"
```

**Extract JSON for programmatic usage:**
```bash
llm -a image.png "Score the image" --schema "score int: Score 0-10" --xl | jq .  # Extracts last fenced code block
```

Other uses include asking focused questions for visual understanding:
- "Is the nav bar obscuring any page content?"
- "Are the button colors consistent across sections?"
- "Is the dark mode text sufficiently contrasted?"

### Standard Rubric (0–2 × 5 metrics = 0–10 composite)

**Keep this reference in sync with `visual_qa/standard_rubric.md`**

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
