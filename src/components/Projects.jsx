import './Projects.css';
import heroData from '../data/heroimages.json';
import projectsData from '../data/projects.json';
import Card from './Card';

const Projects = () => {
  const hero = heroData.find(h => h.name === 'projects');

  return (
    <section className={hero ? "dark" : "black"} id="projects">
      {hero && (
        <img className="background" src={hero.src} alt={hero.alt} />
      )}
        {projectsData.map((category, categoryIndex) => (
          <div className="category-container" key={categoryIndex}>
            <h2>{category.category}</h2>
            <div className="projects-grid">
              {category.projects.map((project, projectIndex) => (
                <Card
                  key={projectIndex}
                  project={project}
                  featured={category.category === 'Hackathon winners'}
                />
              ))}
            </div>
          </div>
        ))}
    </section>
  );
};

export default Projects;