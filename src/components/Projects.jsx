import ProjectCard from './ProjectCard';
import './Projects.css';
import useFetchHero from '../hooks/useFetchHero';
import useFetchContent from '../hooks/useFetchContent';

const Projects = () => {
  const hero = useFetchHero('projects') || {};
  const projects = useFetchContent('data/projects.json') || [];

  return (
    <section className="dark" id="projects">
      {hero && (
        <img className="background" src={hero.src} alt={hero.alt} />
      )}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
