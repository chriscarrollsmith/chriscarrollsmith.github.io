import './PresentationsList.css';
import presentationsData from '../data/presentations.json';
import type { CSLPresentation } from '../types/data';
import { Cite } from '../utils/citation';
import { useEffect, useState } from 'react';
import { getYearFromCSLDate } from '../utils/cslDate';

const typedPresentationsData = presentationsData as CSLPresentation[];

const PresentationsList: React.FC = () => {
  const [formattedPresentations, setFormattedPresentations] = useState<
    Array<{
      pres: CSLPresentation;
      formatted: string;
      section: string;
    }>
  >([]);

  useEffect(() => {
    // Sort presentations by year (descending)
    const sorted = [...typedPresentationsData].sort((a, b) => {
      const yearA = getYearFromCSLDate(a.issued) ?? 0;
      const yearB = getYearFromCSLDate(b.issued) ?? 0;
      return yearB - yearA;
    });

    // Format each presentation using citation.js
    const formatted = sorted.map((pres) => {
      const section = pres.custom?.section || 'Presentations';
      try {
        const cite = new Cite([pres]);
        const formatted = cite.format('bibliography', {
          format: 'html',
          template: 'apa',
          lang: 'en-US',
        });
        return { pres, formatted, section };
      } catch (error) {
        console.error('Error formatting citation:', error, pres);
        // Fallback to manual formatting if citation.js fails
        const title = pres.title || '';
        const event = pres['event-title'] || '';
        const dateParts = pres['event-date']?.['date-parts']?.[0];
        const dateStr = dateParts
          ? new Date(
              typeof dateParts[0] === 'number'
                ? dateParts[0]
                : parseInt(String(dateParts[0])),
              (typeof dateParts[1] === 'number'
                ? dateParts[1]
                : parseInt(String(dateParts[1] || 1))) - 1,
              typeof dateParts[2] === 'number'
                ? dateParts[2]
                : parseInt(String(dateParts[2] || 1))
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '';
        return {
          pres,
          formatted: `${title}. ${event}${dateStr ? `, ${dateStr}` : ''}.`,
          section,
        };
      }
    });

    setFormattedPresentations(formatted);
  }, []);

  // Group presentations by section, sorting featured first within each section
  const groupedPresentations = formattedPresentations.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof formattedPresentations>);

  // Sort each section: featured first, then by year
  Object.keys(groupedPresentations).forEach((section) => {
    groupedPresentations[section].sort((a, b) => {
      const aFeatured = a.pres.custom?.featured ? 1 : 0;
      const bFeatured = b.pres.custom?.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      const yearA = getYearFromCSLDate(a.pres.issued) ?? 0;
      const yearB = getYearFromCSLDate(b.pres.issued) ?? 0;
      return yearB - yearA;
    });
  });

  return (
    <div className="presentations-list">
      <h2>Presentations</h2>
      {Object.entries(groupedPresentations).map(([section, presentations]) => (
        <div key={section} className="presentation-section">
          <h3>{section}</h3>
          <div className="presentation-entries">
            {presentations.map((item, index) => {
              const { pres, formatted } = item;
              const isFeatured = pres.custom?.featured;
              return (
                <div
                  key={index}
                  className={`presentation-entry ${isFeatured ? 'presentation-entry-card' : 'presentation-entry-list'}`}
                >
                  {isFeatured && <span className="featured-label">Featured</span>}
                  <div
                    className="presentation-formatted"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                  {isFeatured && (pres.custom?.videoUrl || pres.custom?.slidesUrl) && (
                    <div className="presentation-links">
                      {pres.custom?.videoUrl && (
                        <a href={pres.custom.videoUrl} target="_blank" rel="noopener noreferrer">
                          Video
                        </a>
                      )}
                      {pres.custom?.slidesUrl && (
                        <a href={pres.custom.slidesUrl} target="_blank" rel="noopener noreferrer">
                          Slides
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresentationsList;
