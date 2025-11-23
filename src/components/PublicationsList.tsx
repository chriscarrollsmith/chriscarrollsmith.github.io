import './PublicationsList.css';
import publicationsData from '../data/publications.json';
import type { CSLPublication } from '../types/data';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { useEffect, useState } from 'react';
import { getYearFromCSLDate } from '../utils/cslDate';

const typedPublicationsData = publicationsData.items as CSLPublication[];

const PublicationsList: React.FC = () => {
  const [formattedPublications, setFormattedPublications] = useState<
    Array<{
      pub: CSLPublication;
      formatted: string;
    }>
  >([]);

  useEffect(() => {
    // Filter out excluded publications and format with citation.js
    const filtered = typedPublicationsData.filter(
      (pub) => !pub.custom?.exclude
    );

    // Sort by year (descending)
    const sorted = [...filtered].sort((a, b) => {
      const yearA = getYearFromCSLDate(a.issued) ?? 0;
      const yearB = getYearFromCSLDate(b.issued) ?? 0;
      return yearB - yearA;
    });

    // Format each publication using citation.js
    const formatted = sorted.map((pub) => {
      try {
        const cite = new Cite([pub]);
        const formatted = cite.format('bibliography', {
          format: 'html',
          template: 'apa',
          lang: 'en-US',
        });
        return { pub, formatted };
      } catch (error) {
        console.error('Error formatting citation:', error, pub);
        // Fallback to manual formatting if citation.js fails
        const authors =
          pub.author
            ?.map((a) => a.literal || `${a.given || ''} ${a.family || ''}`.trim())
            .join(', ') || '';
        const year = getYearFromCSLDate(pub.issued) ?? '';
        const container = pub['container-title'] || '';
        const volume = pub.volume ? ` ${pub.volume}` : '';
        const issue = pub.issue ? `(${pub.issue})` : '';
        return {
          pub,
          formatted: `${authors}. (${year}). ${pub.title}. ${container}${volume}${issue}.`,
        };
      }
    });

    setFormattedPublications(formatted);
  }, []);

  return (
    <div className="publications-list">
      <h2>Publications</h2>
      <div className="publications-entries">
        {formattedPublications.map((item, index) => {
          const { pub, formatted } = item;
          return (
            <div key={index} className="publication-entry">
              <div
                className="publication-formatted"
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
              {pub.custom?.citations && (
                <div className="publication-citations">
                  Citations: {pub.custom.citations}
                </div>
              )}
              {pub.URL && (
                <div className="publication-link">
                  <a href={pub.URL} target="_blank" rel="noopener noreferrer">
                    Full Text
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicationsList;
