import { startTransition, useMemo, useState } from 'react';
import './Projects.css';
import heroData from '../data/heroimages.json';
import projectsData from '../data/projects.json';
import githubMeta from '../data/project-github-meta.json';
import type { HeroImage, Project, ProjectGithubMetaFile } from '../types/data';
import {
  formatPushedAt,
  formatStars,
  loadProjectIndex,
  uniqueSorted,
  type ProjectIndexEntry,
} from '../utils/projectsIndex';

const typedHeroData = heroData as HeroImage[];
const typedProjectsData = projectsData as Project[];
const typedGithubMeta = githubMeta as ProjectGithubMetaFile;

const ALL_PROJECTS = loadProjectIndex(typedProjectsData, typedGithubMeta);

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const Projects: React.FC = () => {
  const hero = typedHeroData.find((h) => h.name === 'projects');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const languages = useMemo(
    () => uniqueSorted(ALL_PROJECTS.map((project) => project.language)),
    [],
  );
  const tags = useMemo(
    () => uniqueSorted(ALL_PROJECTS.flatMap((project) => project.tags)),
    [],
  );

  const filtered = useMemo(() => {
    return ALL_PROJECTS.filter((project) => {
      if (
        selectedLanguages.length > 0 &&
        (!project.language || !selectedLanguages.includes(project.language))
      ) {
        return false;
      }
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => project.tags.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  }, [selectedLanguages, selectedTags]);

  const hasActiveFilters = selectedLanguages.length > 0 || selectedTags.length > 0;

  const clearFilters = () => {
    startTransition(() => {
      setSelectedLanguages([]);
      setSelectedTags([]);
    });
  };

  return (
    <section
      className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`}
      id="projects"
    >
      {hero && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
          <div className="hero-overlay" />
        </>
      )}
      <div className="hero-content">
        <div className="projects-index">
          <header className="projects-index-header">
            <h2 className="category-title">Open-Source Projects</h2>
            <p className="projects-index-subhead">
              Libraries, templates, and tools — filter by language or tag.
            </p>
          </header>

          <div className="projects-filters" role="group" aria-label="Filter projects">
            <div className="projects-filter-row">
              <span className="projects-filter-label" id="projects-language-label">
                Language
              </span>
              <div
                className="projects-filter-options"
                role="group"
                aria-labelledby="projects-language-label"
              >
                {languages.map((language) => {
                  const pressed = selectedLanguages.includes(language);
                  return (
                    <button
                      key={language}
                      type="button"
                      className="projects-filter-chip"
                      aria-pressed={pressed}
                      onClick={() =>
                        startTransition(() => {
                          setSelectedLanguages((prev) => toggleValue(prev, language));
                        })
                      }
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="projects-filter-row">
              <span className="projects-filter-label" id="projects-tag-label">
                Tag
              </span>
              <div
                className="projects-filter-options"
                role="group"
                aria-labelledby="projects-tag-label"
              >
                {tags.map((tag) => {
                  const pressed = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className="projects-filter-chip"
                      aria-pressed={pressed}
                      onClick={() =>
                        startTransition(() => {
                          setSelectedTags((prev) => toggleValue(prev, tag));
                        })
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="projects-filter-meta">
              <p className="projects-count" aria-live="polite">
                Showing {filtered.length} of {ALL_PROJECTS.length}
              </p>
              {hasActiveFilters && (
                <button type="button" className="projects-clear" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="projects-empty">No projects match these filters.</p>
          ) : (
            <ul className="projects-list">
              {filtered.map((project) => (
                <ProjectRow key={project.url} project={project} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

type ProjectRowProps = {
  project: ProjectIndexEntry;
};

const ProjectRow: React.FC<ProjectRowProps> = ({ project }) => {
  const external = /^https?:\/\//i.test(project.url);
  const pushedLabel = project.pushedAt ? formatPushedAt(project.pushedAt) : null;

  return (
    <li className="projects-row">
      <div className="projects-row-main">
        <a
          className="projects-row-title"
          href={project.url}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {project.title}
        </a>
        <div className="projects-row-signals">
          {project.language && (
            <span className="projects-signal projects-signal-language">{project.language}</span>
          )}
          {typeof project.stars === 'number' && (
            <span className="projects-signal" title={`${project.stars} GitHub stars`}>
              <span aria-hidden="true">★</span> {formatStars(project.stars)}
              <span className="visually-hidden"> stars</span>
            </span>
          )}
          {pushedLabel && (
            <span className="projects-signal" title={project.pushedAt ?? undefined}>
              Updated {pushedLabel}
            </span>
          )}
        </div>
      </div>
      <p className="projects-row-description">{project.description}</p>
      {project.tags.length > 0 && (
        <ul className="projects-row-tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Projects;
