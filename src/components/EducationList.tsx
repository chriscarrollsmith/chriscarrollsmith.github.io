import './EducationList.css';
import educationData from '../data/education.json';
import type { Education } from '../types/data';

const typedEducationData = educationData as Education[];

const EducationList: React.FC = () => {
  const visibleEducation = typedEducationData.filter((edu) => !edu.exclude);

  // Don't render the section if there is no education data
  if (visibleEducation.length === 0) {
    return null;
  }

  return (
    <div className="education-list">
      <h2>Education</h2>
      <div className="education-entries">
        {visibleEducation.map((edu, index) => (
          <div key={index} className="education-entry">
            <div className="education-header">
              <h3>{edu.degreeName}</h3>
              <span className="education-years">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
            <div className="education-school">{edu.schoolName}</div>
            <div className="education-notes">{edu.notes}</div>
            {edu.verificationUrl && (
              <a
                href={edu.verificationUrl}
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
