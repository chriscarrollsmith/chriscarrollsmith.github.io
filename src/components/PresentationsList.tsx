import './PresentationsList.css';
import presentationsData from '../data/presentations.json';
import type { CSLPresentation } from '../types/data';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
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

  // Group presentations by section
  const groupedPresentations = formattedPresentations.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof formattedPresentations>);

  // Highlight recent software/tech presentations
  const isSoftwareTech = (pres: CSLPresentation) => {
    const year = getYearFromCSLDate(pres.issued) ?? 0;
    return (
      year >= 2024 &&
      (pres.title?.toLowerCase().includes('ai') ||
        pres.title?.toLowerCase().includes('llm') ||
        pres.title?.toLowerCase().includes('software') ||
        pres.title?.toLowerCase().includes('command line') ||
        pres.title?.toLowerCase().includes('eval'))
    );
  };

  return (
    <div className="presentations-list">
      <h2>Presentations</h2>
      {Object.entries(groupedPresentations).map(([section, presentations]) => (
        <div key={section} className="presentation-section">
          <h3>{section}</h3>
          <div className="presentation-entries">
            {presentations.map((item, index) => {
              const { pres, formatted } = item;
              return (
                <div
                  key={index}
                  className={`presentation-entry ${
                    isSoftwareTech(pres) ? 'featured' : ''
                  }`}
                >
                  <div className="presentation-header">
                    <div
                      className="presentation-formatted"
                      dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                    {isSoftwareTech(pres) && (
                      <span className="featured-badge">Recent Software Work</span>
                    )}
                  </div>
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
