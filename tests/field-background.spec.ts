import { test, expect } from '@playwright/test';
import {
  FIELD_CHANNEL_MAX,
  FIELD_CHANNEL_MIN,
  parseCssColor,
  worstCaseContrast,
  type Rgb,
} from '../src/utils/fieldContrast';

/**
 * The shared noise field replaced five decorative hero images with one
 * fixed-position canvas. These tests pin the properties that make that safe:
 * it stays out of the accessibility tree, it stays off other pages, it never
 * starts when motion is reduced, and — the one that automated audits cannot
 * check — the sections it backs hold their contrast on *every* frame the
 * shader can draw, not just the frame an audit happens to sample.
 */

const FIELD = '[data-site-field]';
const CANVAS = '[data-site-field-canvas]';
/** Sections whose background is the field rather than an image of their own. */
const FIELD_SECTIONS = ['#about', '#projects', '#project-feature', '#writing', '#events'];

test.describe('Field background', () => {
  test('is hidden from assistive technology and not focusable', async ({ page }) => {
    await page.goto('/');

    const field = page.locator(FIELD);
    await expect(field).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator(CANVAS)).toHaveCount(1);

    // A canvas with no tabindex is not a tab stop; assert rather than assume,
    // since adding one would silently drop a keyboard user into a decoration.
    await expect(page.locator(CANVAS)).not.toHaveAttribute('tabindex', /.*/);

    // Pointer events must pass through to the content stacked above it.
    const pointerEvents = await field.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).toBe('none');
  });

  test('is emitted only on the home page', async ({ request }) => {
    // Checked against the served HTML rather than a rendered page: the field is
    // a build-time inclusion, and rendering /cv here would also wait on
    // third-party assets that have nothing to do with what is being asserted.
    expect(await (await request.get('/')).text()).toContain('data-site-field');

    for (const path of ['/blog', '/cv']) {
      expect(await (await request.get(path)).text(), `${path} should not embed the field`).not.toContain(
        'data-site-field',
      );
    }
  });

  test('field-backed sections carry no hero image of their own', async ({ page }) => {
    await page.goto('/');

    for (const section of FIELD_SECTIONS) {
      const target = page.locator(section);
      await expect(target).toHaveClass(/\bfield\b/);
      await expect(target.locator('.hero-bg')).toHaveCount(0);
    }
  });

  test('falls back to the static gradient when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // No WebGL context is ever requested, so the canvas never goes live and the
    // host element's gradient is what the visitor sees.
    await expect(page.locator(`${CANVAS}.is-live`)).toHaveCount(0);

    const background = await page
      .locator(FIELD)
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(background).toContain('gradient');
  });

  test('does not run the shader on a software rasterizer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      if (!gl) return null;
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      return String(
        (info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '',
      );
    });

    test.skip(
      !renderer || !/swiftshader|llvmpipe|lavapipe|softpipe|software|basic render/i.test(renderer),
      `needs a software renderer to be meaningful (saw: ${renderer ?? 'no webgl'})`,
    );

    await page.waitForTimeout(2000);

    // Chrome hands back a SwiftShader context even with
    // failIfMajorPerformanceCaveat set, so the renderer is checked explicitly.
    // Without that check this burns CPU on a decoration and Chrome logs a
    // software-WebGL warning that trips the console-errors suite.
    await expect(page.locator(`${CANVAS}.is-live`)).toHaveCount(0);
  });

  test('section scrims hold AA contrast across the whole field brightness band', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (const section of FIELD_SECTIONS) {
      const { scrim, text } = await page.locator(section).evaluate((el) => {
        const style = getComputedStyle(el);
        return { scrim: style.backgroundColor, text: style.color };
      });

      const scrimColor = parseCssColor(scrim);
      const textColor = parseCssColor(text).slice(0, 3) as Rgb;

      // A fully opaque scrim would mean the field is not visible here at all,
      // which would silently undo the whole point of the change.
      expect(scrimColor[3], `${section} scrim should be translucent`).toBeLessThan(1);

      const ratio = worstCaseContrast(scrimColor, textColor);
      expect(
        ratio,
        `${section}: worst-case contrast over field band ` +
          `[${FIELD_CHANNEL_MIN}, ${FIELD_CHANNEL_MAX}] was ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
