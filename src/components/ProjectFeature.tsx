import './ProjectFeature.css';
import projectData from '../data/projectfeature.json';
import heroData from '../data/heroimages.json';
import type { ProjectFeature as ProjectFeatureType, HeroImage } from '../types/data';

const typedProjectData = projectData as ProjectFeatureType;
const typedHeroData = heroData as HeroImage[];

const ProjectFeature: React.FC = () => {
  const { portraitImage, landscapeImage, callToAction, buttonText, buttonUrl } = typedProjectData;
  const hero = typedHeroData.find(h => h.name === 'project-feature');

  return (
    <section className={hero?.src ? hero?.shade : hero?.shade === "dark" ? "black" : "white"} id="project-feature">
      <div className="project-feature-section">
        <div className="callout">
          <p dangerouslySetInnerHTML={{ __html: callToAction }} />
          <a href={buttonUrl} target="_blank" rel="noopener noreferrer" className="button">{buttonText}</a>
        </div>
        {landscapeImage?.src &&
        <div className="landscape-container">
          <img className="landscape-image" src={landscapeImage.src} alt="Landscape" />
        </div>
        }
        <div className="portrait-container">
          <img className="portrait-image" src={portraitImage.src} alt="Portrait" />
        </div>
      </div>
    </section>
  );
};

export default ProjectFeature;
