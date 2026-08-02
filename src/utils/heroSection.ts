import heroData from '../data/heroimages.json';
import type { HeroImage } from '../types/data';

const heroes = heroData as HeroImage[];

/**
 * Class list for a home-page section.
 *
 * Three backing modes, in precedence order:
 *   - `field`: the section is transparent apart from a scrim, letting the
 *     fixed noise field show through (see `FieldBackground.astro`).
 *   - `src`: a hero image is painted into the section.
 *   - neither: a flat black or white section.
 *
 * Field sections that follow a section of the opposite shade also get a
 * `field-from-*` modifier, which cross-fades the two scrims across the top of
 * the lower section rather than cutting between them. The neighbour is read
 * from this file's own ordering because each section renders inside its own
 * `<astro-island>`, so the rendered `<section>` elements are not siblings and
 * CSS cannot see the adjacency itself.
 */
export const heroSectionClass = (hero?: HeroImage): string => {
  if (!hero) return 'hero white';
  if (!hero.field) {
    if (hero.src) return `hero ${hero.shade}`;
    return `hero ${hero.shade === 'dark' ? 'black' : 'white'}`;
  }

  const index = heroes.findIndex((entry) => entry.name === hero.name);
  const previous = index > 0 ? heroes[index - 1] : undefined;
  const crossFade = previous && previous.shade !== hero.shade ? ` field-from-${previous.shade}` : '';

  return `hero field ${hero.shade}${crossFade}`;
};
