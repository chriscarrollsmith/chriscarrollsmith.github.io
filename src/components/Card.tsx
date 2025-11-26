import './Card.css';
import type { Project } from '../types/data';

interface CardProps {
  project: Project;
}

const Card: React.FC<CardProps> = ({ project }) => (
  <div className={`project-card ${project.iconOverlay ? 'featured' : ''}`}>
    <div className="content-wrapper">
      <div className="title-section">
        <div className="title-container">
          <h3>{project.title}</h3>
        </div>
      </div>
      {project.img && (
        <div className="image-section">
          <img src={`/images/${project.img}`} alt={project.title} />
        </div>
      )}
      <div className={`body-section ${project.img ? 'with-image' : ''}`}>
        <p>{project.description}</p>
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="button">
          View Project
        </a>
      </div>
    </div>
    {project.iconOverlay && (
      <img
        src={`/images/${project.iconOverlay}`}
        alt="Icon Overlay"
        className="icon-overlay"
      />
    )}
  </div>
);

export default Card;
