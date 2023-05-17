import React from 'react';

const ProjectCard = ({ project }) => (
  <div className="card">
    <div className="title-section">
      <h3>{project.title}</h3>
    </div>
    <p>{project.description}</p>
    <a href={project.buttonLink} className="button">
      {project.buttonText}
    </a>
  </div>
);

export default ProjectCard;
