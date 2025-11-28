import './PublicationsList.css';
import publicationsData from '../data/publications.json';
import type { CSLPublication } from '../types/data';
import { Cite } from '../utils/citation';
import { useEffect, useState } from 'react';
import { getYearFromCSLDate } from '../utils/cslDate';

const typedPublicationsData = publicationsData.items as CSLPublication[];

// Section display order (sections not in this list appear last in alphabetical order)
const SECTION_ORDER = ['Academic Publications', 'Fiction'];

const PublicationsList: React.FC = () => {
  const [formattedPublications, setFormattedPublications] = useState<
    Array<{
      pub: CSLPublication;
      formatted: string;
      section: string;
    }>
  >([]);

  useEffect(() => {
    // Filter out excluded publications and format with citation.js
    const filtered = typedPublicationsData.filter(
      (pub) => !pub.custom?.exclude
    );

    // Format each publication using citation.js
    const formatted = filtered.map((pub) => {
      const section = pub.custom?.section || 'Academic Publications';
      try {
        const cite = new Cite([pub]);
        const formatted = cite.format('bibliography', {
          format: 'html',
          template: 'apa',
          lang: 'en-US',
        });
        return { pub, formatted, section };
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
          section,
        };
      }
    });

    setFormattedPublications(formatted);
  }, []);

  // Group publications by section
  const groupedPublications = formattedPublications.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof formattedPublications>);

  // Sort each section: featured first, then by year (descending)
  Object.keys(groupedPublications).forEach((section) => {
    groupedPublications[section].sort((a, b) => {
      const aFeatured = a.pub.custom?.featured ? 1 : 0;
      const bFeatured = b.pub.custom?.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      const yearA = getYearFromCSLDate(a.pub.issued) ?? 0;
      const yearB = getYearFromCSLDate(b.pub.issued) ?? 0;
      return yearB - yearA;
    });
  });

  // Sort sections by defined order
  const sortedSections = Object.keys(groupedPublications).sort((a, b) => {
    const aIndex = SECTION_ORDER.indexOf(a);
    const bIndex = SECTION_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Don't render the section if there are no publications
  if (sortedSections.length === 0) {
    return null;
  }

  return (
    <div className="publications-list">
      <h2>Publications</h2>
      {sortedSections.map((section) => (
        <div key={section} className="publication-section">
          <h3>{section}</h3>
          <div className="publications-entries">
            {groupedPublications[section].map((item, index) => {
              const { pub, formatted } = item;
              const isFeatured = pub.custom?.featured;
              const hasAwards = pub.custom?.awards && pub.custom.awards.length > 0;
              const hasMeta = isFeatured && (pub.custom?.citations || pub.URL || hasAwards);
              // Award Winner badge replaces Featured badge; show Featured only if no awards
              const badgeLabel = hasAwards ? 'Award Winner' : 'Featured';
              return (
                <div
                  key={index}
                  className={`publication-entry ${isFeatured ? 'publication-entry-card' : 'publication-entry-list'}`}
                >
                  {isFeatured && <span className="featured-label">{badgeLabel}</span>}
                  <div
                    className="publication-formatted"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                  {hasMeta && (
                    <div className="publication-meta">
                      {hasAwards && pub.custom?.awards?.map((award, i) => (
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
                        <a href={pub.URL} target="_blank" rel="noopener noreferrer" className="publication-link">
                          Full Text
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

export default PublicationsList;
