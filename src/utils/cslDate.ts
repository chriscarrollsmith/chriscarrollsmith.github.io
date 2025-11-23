import type { CSLDate } from '../types/data';

/**
 * Safely extract the year component from a CSL-JSON date.
 */
export function getYearFromCSLDate(date?: CSLDate): number | undefined {
  const firstPart = date?.['date-parts']?.[0]?.[0];

  if (firstPart == null) {
    return undefined;
  }

  if (typeof firstPart === 'number') {
    return firstPart;
  }

  const parsed = parseInt(String(firstPart), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}


