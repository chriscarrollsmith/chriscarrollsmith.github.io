/**
 * The contrast contract between the background field and the copy above it.
 *
 * The field animates, so sampling one rendered frame proves nothing: an
 * automated audit can pass on the frame it happens to catch and fail on the
 * next. Instead the shader clamps every channel into a fixed band, and these
 * helpers let a test check the *worst* frame the shader is capable of drawing
 * rather than whichever one it saw.
 *
 * Both the shader (`field-background.ts`) and the test read the band from here,
 * so widening it without re-checking contrast is not possible by accident.
 */

/** Per-channel bounds, in sRGB 0..1, that the field shader clamps output to. */
export const FIELD_CHANNEL_MIN = 0.03;
export const FIELD_CHANNEL_MAX = 0.62;

export type Rgb = [number, number, number];
export type Rgba = [number, number, number, number];

/** WCAG 2.x relative luminance from sRGB channels in 0..1. */
export const relativeLuminance = ([r, g, b]: Rgb): number => {
  const linear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** Source-over composite of a translucent layer onto an opaque one. */
export const compositeOver = (layer: Rgba, base: Rgb): Rgb => {
  const alpha = layer[3];
  return [0, 1, 2].map((i) => layer[i] * alpha + base[i] * (1 - alpha)) as Rgb;
};

/** Parse a computed `rgb()` / `rgba()` string into 0..1 channels. */
export const parseCssColor = (value: string): Rgba => {
  const parts = value.match(/-?[\d.]+/g);
  if (!parts || parts.length < 3) {
    throw new Error(`Unparseable CSS color: ${value}`);
  }
  const [r, g, b, a] = parts.map(Number);
  return [r / 255, g / 255, b / 255, a === undefined ? 1 : a];
};

/**
 * Worst-case contrast between `text` and a scrim laid over the field, checked
 * against both ends of the field's clamped band.
 */
export const worstCaseContrast = (scrim: Rgba, text: Rgb): number => {
  const extremes: Rgb[] = [
    [FIELD_CHANNEL_MIN, FIELD_CHANNEL_MIN, FIELD_CHANNEL_MIN],
    [FIELD_CHANNEL_MAX, FIELD_CHANNEL_MAX, FIELD_CHANNEL_MAX],
  ];
  return Math.min(...extremes.map((field) => contrastRatio(text, compositeOver(scrim, field))));
};
