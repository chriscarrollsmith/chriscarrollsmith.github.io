import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get('data/projects.json');
      setProjects(response.data);
    };

    const fetchHero = async () => {
      const response = await axios.get('data/heroimages.json');
      const projectsHero = response.data.find(img => img.name === "projects");
      setHero(projectsHero);
    };

    fetchProjects();
    fetchHero();
  }, []);

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
