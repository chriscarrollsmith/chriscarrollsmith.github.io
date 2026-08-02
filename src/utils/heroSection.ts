import type { HeroImage } from '../types/data';

/**
 * Class list for a home-page section.
 *
 * Three backing modes, in precedence order:
 *   - `field`: the section is transparent apart from a scrim, letting the
 *     fixed noise field show through (see `FieldBackground.astro`).
 *   - `src`: a hero image is painted into the section.
 *   - neither: a flat black or white section.
 */
export const heroSectionClass = (hero?: HeroImage): string => {
  if (!hero) return 'hero white';
  if (hero.field) return `hero field ${hero.shade}`;
  if (hero.src) return `hero ${hero.shade}`;
  return `hero ${hero.shade === 'dark' ? 'black' : 'white'}`;
};
