import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
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
const DEFAULT_TAGS = ['highlight'] as const;

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const Projects: React.FC = () => {
  const hero = typedHeroData.find((h) => h.name === 'projects');
  const [selectedTags, setSelectedTags] = useState<string[]>([...DEFAULT_TAGS]);
  const tagsFacetRef = useRef<HTMLDetailsElement>(null);

  const tags = useMemo(
    () => uniqueSorted(ALL_PROJECTS.flatMap((project) => project.tags)),
    [],
  );

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const details = tagsFacetRef.current;
      if (!details?.open) return;
      const target = event.target;
      if (!(target instanceof Node) || details.contains(target)) return;
      details.open = false;
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return ALL_PROJECTS;
    return ALL_PROJECTS.filter((project) =>
      selectedTags.some((tag) => project.tags.includes(tag)),
    );
  }, [selectedTags]);

  const isDefaultFilter =
    selectedTags.length === DEFAULT_TAGS.length &&
    DEFAULT_TAGS.every((tag) => selectedTags.includes(tag));

  const clearFilters = () => {
    startTransition(() => {
      setSelectedTags([...DEFAULT_TAGS]);
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
            <h2 className="category-title">Featured Open-Source Projects</h2>
            <p className="projects-index-subhead">
              Highlighted libraries, templates, and tools — filter by tag.
            </p>
          </header>

          <div className="projects-filters" role="group" aria-label="Filter projects">
            <div className="projects-filter-toolbar">
              <details ref={tagsFacetRef} className="projects-tag-facet">
                <summary>
                  Tag
                  {selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
                </summary>
                <div
                  className="projects-tag-options"
                  role="group"
                  aria-label="Filter by tag"
                >
                  {tags.map((tag) => (
                    <label key={tag} className="projects-tag-option">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() =>
                          startTransition(() => {
                            setSelectedTags((prev) => toggleValue(prev, tag));
                          })
                        }
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </details>

              <div className="projects-filter-meta">
                <p className="projects-count" aria-live="polite">
                  Showing {filtered.length} of {ALL_PROJECTS.length}
                </p>
                {!isDefaultFilter && (
                  <button type="button" className="projects-clear" onClick={clearFilters}>
                    Reset to highlights
                  </button>
                )}
              </div>
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
  const displayTags = project.tags.filter((tag) => tag !== 'highlight');

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
      {displayTags.length > 0 && (
        <ul className="projects-row-tags">
          {displayTags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Projects;
