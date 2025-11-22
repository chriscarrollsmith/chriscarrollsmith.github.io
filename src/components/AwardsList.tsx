import './AwardsList.css';
import awardsData from '../data/awards.json';
import type { Award } from '../types/data';

const typedAwardsData = awardsData.awards_and_fellowships as Award[];

const AwardsList: React.FC = () => {
  // Sort awards by year (descending)
  const sortedAwards = [...typedAwardsData].sort((a, b) => b.year - a.year);

  return (
    <div className="awards-list">
      <h2>Awards & Fellowships</h2>
      <div className="awards-entries">
        {sortedAwards.map((award, index) => (
          <div key={index} className="award-entry">
            <div className="award-header">
              <span className="award-title">{award.award}</span>
              <span className="award-year">{award.year}</span>
            </div>
            <div className="award-organization">{award.organization}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AwardsList;
