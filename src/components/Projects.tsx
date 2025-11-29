import './Projects.css';
import heroData from '../data/heroimages.json';
import projectsData from '../data/projects.json';
import Card from './Card';
import type { HeroImage, Project } from '../types/data';

const typedHeroData = heroData as HeroImage[];
const typedProjectsData = projectsData as Project[];

const Projects: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'projects');

  return (
    <section className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`} id="projects">
      {hero && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
          <div className="hero-overlay" />
        </>
      )}
      <div className="hero-content">
        <div className="projects-grid">
          <div className="category-title-container">
            <h2 className="category-title">Open-Source Projects</h2>
          </div>
          {typedProjectsData.map((project, index) => (
            <Card key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;