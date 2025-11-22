import './PresentationsList.css';
import presentationsData from '../data/presentations.json';
import type { Presentation } from '../types/data';

const typedPresentationsData = presentationsData as Presentation[];

const PresentationsList: React.FC = () => {
  // Sort presentations by year (descending)
  const sortedPresentations = [...typedPresentationsData].sort((a, b) => b.year - a.year);

  // Group presentations by section
  const groupedPresentations = sortedPresentations.reduce((acc, pres) => {
    if (!acc[pres.section]) {
      acc[pres.section] = [];
    }
    acc[pres.section].push(pres);
    return acc;
  }, {} as Record<string, Presentation[]>);

  // Highlight recent software/tech presentations
  const isSoftwareTech = (pres: Presentation) => {
    return pres.year >= 2024 && (
      pres.title.toLowerCase().includes('ai') ||
      pres.title.toLowerCase().includes('llm') ||
      pres.title.toLowerCase().includes('software') ||
      pres.title.toLowerCase().includes('command line') ||
      pres.title.toLowerCase().includes('eval')
    );
  };

  return (
    <div className="presentations-list">
      <h2>Presentations</h2>
      {Object.entries(groupedPresentations).map(([section, presentations]) => (
        <div key={section} className="presentation-section">
          <h3>{section}</h3>
          <div className="presentation-entries">
            {presentations.map((pres, index) => (
              <div
                key={index}
                className={`presentation-entry ${isSoftwareTech(pres) ? 'featured' : ''}`}
              >
                <div className="presentation-header">
                  <span className="presentation-title">{pres.title}</span>
                  {isSoftwareTech(pres) && <span className="featured-badge">Recent Software Work</span>}
                </div>
                <div className="presentation-event">{pres.event}</div>
                <div className="presentation-date">{pres.date}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresentationsList;
