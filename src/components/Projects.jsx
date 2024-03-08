import './Projects.css';
import heroData from '../data/heroimages.json';
import projectsData from '../data/projects.json';
import Card from './Card';

const Projects = () => {
  const hero = heroData.find(h => h.name === 'projects');

  return (
    <section className={hero.src ? hero.shade : hero.shade === "dark" ? "black" : "white"} id="projects">
      {hero && (
        <img className="background" src={hero.src} alt={hero.alt} />
      )}
        {projectsData.map((category, categoryIndex) => (
          <div className="category-container" key={categoryIndex}>
            <div className="projects-grid">
              <div className="category-title-container">
                <h2 className="category-title">{category.category}</h2>
              </div>
              {category.projects.map((project, projectIndex) => (
                <Card
                  key={projectIndex}
                  project={project}
                />
              ))}
            </div>
          </div>
        ))}
    </section>
  );
};

export default Projects;