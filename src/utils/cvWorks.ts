import publicationsData from '../data/publications.json';
import presentationsData from '../data/presentations.json';
import type { CSLPublication, CSLPresentation } from '../types/data';
import { getYearFromCSLDate } from './cslDate';

export type WorkKind = 'publication' | 'presentation';

export interface CvWork {
  id: string;
  kind: WorkKind;
  section: string;
  year: number;
  type: string;
  typeLabel: string;
  venue: string;
  title: string;
  searchText: string;
  featured: boolean;
  item: CSLPublication | CSLPresentation;
}

const TYPE_LABELS: Record<string, string> = {
  'article-journal': 'Journal article',
  'article-magazine': 'Magazine article',
  chapter: 'Book chapter',
  thesis: 'Thesis',
  speech: 'Speech',
  'paper-conference': 'Conference paper',
};

function authorNames(item: CSLPublication | CSLPresentation): string {
  return (
    item.author
      ?.map((a) => a.literal || `${a.given || ''} ${a.family || ''}`.trim())
      .filter(Boolean)
      .join(' ') || ''
  );
}

function venueFor(item: CSLPublication | CSLPresentation, kind: WorkKind): string {
  if (kind === 'presentation') {
    return item['event-title'] || item['container-title'] || '';
  }
  return item['container-title'] || item.publisher || '';
}

function toWork(
  item: CSLPublication | CSLPresentation,
  kind: WorkKind,
  index: number,
): CvWork | null {
  if (kind === 'publication' && (item as CSLPublication).custom?.exclude) {
    return null;
  }

  const year = getYearFromCSLDate(item.issued) ?? 0;
  const venue = venueFor(item, kind);
  const title = item.title || '';
  const type = item.type || 'document';
  const section =
    item.custom?.section ||
    (kind === 'publication' ? 'Academic Publications' : 'Presentations');
  const featured = Boolean(item.custom?.featured);

  const searchText = [
    title,
    authorNames(item),
    venue,
    type,
    TYPE_LABELS[type] || type,
    section,
    year ? String(year) : '',
    item.DOI || '',
    'abstract' in item && typeof item.abstract === 'string' ? item.abstract : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    id: `${kind}-${index}-${title.slice(0, 40)}`,
    kind,
    section,
    year,
    type,
    typeLabel: TYPE_LABELS[type] || type,
    venue,
    title,
    searchText,
    featured,
    item,
  };
}

const PUBLICATION_SECTION_ORDER = ['Academic Publications', 'Fiction'];
const PRESENTATION_SECTION_ORDER = [
  'Panels Organized',
  'Papers Presented',
  'Respondent',
];

export function loadCvWorks(): CvWork[] {
  const pubs = (publicationsData.items as CSLPublication[])
    .map((item, i) => toWork(item, 'publication', i))
    .filter((w): w is CvWork => w != null);

  const presentations = (presentationsData as CSLPresentation[])
    .map((item, i) => toWork(item, 'presentation', i))
    .filter((w): w is CvWork => w != null);

  return [...pubs, ...presentations];
}

export function sortWorks(works: CvWork[]): CvWork[] {
  return [...works].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.year !== b.year) return b.year - a.year;
    return a.title.localeCompare(b.title);
  });
}

export function sortSections(sections: string[], kind: WorkKind): string[] {
  const order =
    kind === 'publication' ? PUBLICATION_SECTION_ORDER : PRESENTATION_SECTION_ORDER;
  return [...sections].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function uniqueYears(works: CvWork[]): number[] {
  return [...new Set(works.map((w) => w.year).filter((y) => y > 0))].sort((a, b) => b - a);
}
