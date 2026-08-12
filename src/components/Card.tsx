import './Card.css';
import type { Project } from '../types/data';

interface CardProps {
  project: Project;
}

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

const Card: React.FC<CardProps> = ({ project }) => {
  const external = isExternalUrl(project.url);

  return (
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
          <p className="small">{project.description}</p>
          <a
            href={project.url}
            className="button"
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {project.buttonText || 'View Project'}
          </a>
        </div>
      </div>
      {project.iconOverlay && (
        <img
          src={`/images/${project.iconOverlay}`}
          alt=""
          className="icon-overlay"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Card;
