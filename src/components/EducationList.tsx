import './EducationList.css';
import educationData from '../data/education.json';
import type { Education } from '../types/data';

const typedEducationData = educationData as Education[];

const EducationList: React.FC = () => {
  return (
    <div className="education-list">
      <h2>Education</h2>
      <div className="education-entries">
        {typedEducationData.map((edu, index) => (
          <div key={index} className="education-entry">
            <div className="education-header">
              <h3>{edu['Degree Name']}</h3>
              <span className="education-years">
                {edu['Start Date']} - {edu['End Date']}
              </span>
            </div>
            <div className="education-school">{edu['School Name']}</div>
            <div className="education-notes">{edu.Notes}</div>
            {edu['Verification URL'] && (
              <a
                href={edu['Verification URL']}
                target="_blank"
                rel="noopener noreferrer"
                className="education-verify"
              >
                View Certificate
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationList;
