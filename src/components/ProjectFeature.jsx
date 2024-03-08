import './ProjectFeature.css';
import projectData from '../data/projectfeature.json';
import heroData from '../data/heroimages.json';

const ProjectFeature = () => {
  const { portraitImage, landscapeImage, callToAction, buttonText } = projectData;
  const hero = heroData.find(h => h.name === 'project-feature');
  
  return (
    <section className={hero?.src ? hero?.shade : hero?.shade === "dark" ? "black" : "white"} id="project-feature">
      <div className="project-feature-section">
        <div className="callout">
          <p dangerouslySetInnerHTML={{ __html: callToAction }} />
          <button>{buttonText}</button>
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
