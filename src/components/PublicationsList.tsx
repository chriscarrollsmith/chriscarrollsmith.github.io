import './PublicationsList.css';
import publicationsData from '../data/publications.json';
import type { Publication } from '../types/data';

const typedPublicationsData = publicationsData.items as Publication[];

const PublicationsList: React.FC = () => {
  // Sort publications by year (descending)
  const sortedPublications = [...typedPublicationsData].sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    return yearB - yearA;
  });

  return (
    <div className="publications-list">
      <h2>Publications</h2>
      <div className="publications-entries">
        {sortedPublications.map((pub, index) => (
          <div key={index} className="publication-entry">
            <div className="publication-title">{pub.title}</div>
            <div className="publication-authors">{pub.authors}</div>
            <div className="publication-details">
              <span className="publication-journal">{pub.journal}</span>
              {pub.volume && <span className="publication-volume"> {pub.volume}</span>}
              {pub.issue && <span className="publication-issue">({pub.issue})</span>}
              {pub.year && <span className="publication-year">, {pub.year}</span>}
            </div>
            {pub.citations && (
              <div className="publication-citations">
                Citations: {pub.citations}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicationsList;
