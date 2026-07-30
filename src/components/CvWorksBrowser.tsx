import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Fuse from 'fuse.js';
import {
  loadCvWorks,
  sortSections,
  sortWorks,
  uniqueSorted,
  uniqueYears,
  type CvWork,
} from '../utils/cvWorks';
import { getYearFromCSLDate } from '../utils/cslDate';
import type { CSLPresentation, CSLPublication } from '../types/data';
import CitationCopyMenu from './CitationCopyMenu';
import './CvWorksBrowser.css';
import './PublicationsList.css';
import './PresentationsList.css';

type Density = 'comfortable' | 'compact';

const ALL_WORKS = loadCvWorks();

function fallbackHtml(item: CSLPublication | CSLPresentation): string {
  const year = getYearFromCSLDate(item.issued) ?? '';
  const title = item.title || 'Untitled';
  return `<div>${title}${year ? ` (${year})` : ''}</div>`;
}

const CvWorksBrowser: React.FC = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [density, setDensity] = useState<Density>('comfortable');
  const [formattedHtml, setFormattedHtml] = useState<Record<string, string>>({});
  const facetsRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => uniqueYears(ALL_WORKS), []);
  const types = useMemo(() => {
    const byLabel = new Map<string, string>();
    for (const work of ALL_WORKS) {
      if (!byLabel.has(work.typeLabel)) {
        byLabel.set(work.typeLabel, work.type);
      }
    }
    return [...byLabel.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }, []);
  const venues = useMemo(() => uniqueSorted(ALL_WORKS.map((w) => w.venue)), []);

  const fuse = useMemo(
    () =>
      new Fuse(ALL_WORKS, {
        keys: ['title', 'searchText', 'venue', 'typeLabel', 'section'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void import('../utils/citation').then(({ Cite }) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const work of ALL_WORKS) {
        try {
          const cite = new Cite([work.item]);
          map[work.id] = cite.format('bibliography', {
            format: 'html',
            template: 'apa',
            lang: 'en-US',
          });
        } catch (error) {
          console.error('Error formatting citation:', error, work.item);
          map[work.id] = fallbackHtml(work.item);
        }
      }
      setFormattedHtml(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const root = facetsRef.current;
      if (!root || root.contains(event.target as Node)) return;
      root.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((details) => {
        details.open = false;
      });
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const filteredWorks = useMemo(() => {
    let works: CvWork[] = ALL_WORKS;

    const q = deferredQuery.trim();
    if (q) {
      works = fuse.search(q).map((result) => result.item);
    }

    if (selectedYears.length > 0) {
      works = works.filter((w) => selectedYears.includes(w.year));
    }
    if (selectedTypes.length > 0) {
      works = works.filter((w) => selectedTypes.includes(w.type));
    }
    if (selectedVenue) {
      works = works.filter((w) => w.venue === selectedVenue);
    }

    return sortWorks(works);
  }, [deferredQuery, fuse, selectedYears, selectedTypes, selectedVenue]);

  const publications = filteredWorks.filter((w) => w.kind === 'publication');
  const presentations = filteredWorks.filter((w) => w.kind === 'presentation');

  const publicationSections = sortSections(
    [...new Set(publications.map((w) => w.section))],
    'publication',
  );
  const presentationSections = sortSections(
    [...new Set(presentations.map((w) => w.section))],
    'presentation',
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedYears.length > 0 ||
    selectedTypes.length > 0 ||
    selectedVenue.length > 0;

  const clearFilters = () => {
    startTransition(() => {
      setQuery('');
      setSelectedYears([]);
      setSelectedTypes([]);
      setSelectedVenue('');
    });
  };

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const renderEntry = (work: CvWork) => {
    const pub = work.kind === 'publication' ? (work.item as CSLPublication) : null;
    const pres = work.kind === 'presentation' ? (work.item as CSLPresentation) : null;
    const isFeatured = work.featured && density === 'comfortable';
    const hasAwards = Boolean(pub?.custom?.awards?.length);
    const badgeLabel = hasAwards ? 'Award Winner' : 'Featured';
    const entryClass =
      work.kind === 'publication'
        ? `publication-entry ${isFeatured ? 'publication-entry-card' : 'publication-entry-list'}`
        : `presentation-entry ${isFeatured ? 'presentation-entry-card' : 'presentation-entry-list'}`;
    const formattedClass =
      work.kind === 'publication' ? 'publication-formatted' : 'presentation-formatted';
    const hasPubMeta =
      isFeatured && pub && (pub.custom?.citations || pub.URL || hasAwards);
    const hasPresLinks =
      isFeatured && pres && (pres.custom?.videoUrl || pres.custom?.slidesUrl);

    return (
      <div key={work.id} className={entryClass}>
        {isFeatured && <span className="featured-label">{badgeLabel}</span>}
        <div className="cv-work-entry-body">
          <div
            className={formattedClass}
            dangerouslySetInnerHTML={{
              __html: formattedHtml[work.id] || fallbackHtml(work.item),
            }}
          />
          <CitationCopyMenu item={work.item} title={work.title} />
        </div>
        {hasPubMeta && pub && (
          <div className="publication-meta">
            {hasAwards &&
              pub.custom?.awards?.map((award, i) => (
                <span key={i} className="publication-award">
                  {award.award} ({award.organization}, {award.year})
                </span>
              ))}
            {pub.custom?.citations && (
              <span className="publication-citations">
                Citations: {pub.custom.citations}
              </span>
            )}
            {pub.URL && (
              <a
                href={pub.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="publication-link"
              >
                Full Text
              </a>
            )}
          </div>
        )}
        {hasPresLinks && pres && (
          <div className="presentation-links">
            {pres.custom?.videoUrl && (
              <a
                href={pres.custom.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Video
              </a>
            )}
            {pres.custom?.slidesUrl && (
              <a
                href={pres.custom.slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Slides
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const toolbar = (
    <div className="cv-works-toolbar">
      <div className="cv-works-toolbar-row">
        <label className="cv-works-search">
          <span className="visually-hidden">Search publications and presentations</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, venues, authors…"
            autoComplete="off"
          />
        </label>
        <div className="cv-works-density" role="group" aria-label="List density">
          <button
            type="button"
            aria-pressed={density === 'comfortable'}
            onClick={() => setDensity('comfortable')}
          >
            Comfortable
          </button>
          <button
            type="button"
            aria-pressed={density === 'compact'}
            onClick={() => setDensity('compact')}
          >
            Compact
          </button>
        </div>
      </div>

      <div className="cv-works-facets" ref={facetsRef}>
        <details className="cv-works-facet" name="cv-facets">
          <summary>
            Year
            {selectedYears.length > 0 ? ` (${selectedYears.length})` : ''}
          </summary>
          <div className="cv-works-facet-options" role="group" aria-label="Filter by year">
            {years.map((year) => (
              <label key={year} className="cv-works-chip">
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => toggleYear(year)}
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        </details>

        <details className="cv-works-facet" name="cv-facets">
          <summary>
            Type
            {selectedTypes.length > 0 ? ` (${selectedTypes.length})` : ''}
          </summary>
          <div className="cv-works-facet-options" role="group" aria-label="Filter by type">
            {types.map((type) => (
              <label key={type.value} className="cv-works-chip">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </details>

        <label className="cv-works-venue">
          <span className="visually-hidden">Filter by venue</span>
          <select
            value={selectedVenue}
            onChange={(event) => setSelectedVenue(event.target.value)}
            autoComplete="off"
          >
            <option value="">All venues</option>
            {venues.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button type="button" className="cv-works-clear" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <p className="cv-works-count" aria-live="polite">
        Showing {filteredWorks.length} of {ALL_WORKS.length} works
        {publications.length > 0 || presentations.length > 0
          ? ` · ${publications.length} publications · ${presentations.length} presentations`
          : ''}
      </p>
    </div>
  );

  return (
    <div className={`cv-works-browser density-${density}`}>
      <div className="publications-list">
        <h2>Publications</h2>
        {toolbar}
        {publicationSections.map((section) => {
          const entries = publications.filter((w) => w.section === section);
          return (
            <div key={section} className="publication-section">
              <h3>{section}</h3>
              <div className="publications-entries">{entries.map(renderEntry)}</div>
            </div>
          );
        })}
        {publications.length === 0 && (
          <p className="cv-works-empty">No publications match these filters.</p>
        )}
      </div>

      {presentationSections.length > 0 && (
        <div className="presentations-list">
          <h2>Presentations</h2>
          {presentationSections.map((section) => {
            const entries = presentations.filter((w) => w.section === section);
            return (
              <div key={section} className="presentation-section">
                <h3>{section}</h3>
                <div className="presentation-entries">{entries.map(renderEntry)}</div>
              </div>
            );
          })}
        </div>
      )}

      {filteredWorks.length === 0 && (
        <p className="cv-works-empty visually-hidden">No works match these filters.</p>
      )}
    </div>
  );
};

export default CvWorksBrowser;
