import type { GithubRepoMeta, Project, ProjectGithubMetaFile } from '../types/data';

export interface ProjectIndexEntry extends Omit<Project, 'language' | 'tags'> {
  tags: string[];
  language: string | null;
  stars: number | null;
  pushedAt: string | null;
  isGithub: boolean;
}

export function loadProjectIndex(
  projects: Project[],
  meta: ProjectGithubMetaFile,
): ProjectIndexEntry[] {
  return projects.map((project) => {
    const github: GithubRepoMeta | undefined = meta.repos[project.url];
    const isGithub = Boolean(github) || /github\.com\//i.test(project.url);
    return {
      ...project,
      tags: project.tags ?? [],
      language: github?.language ?? project.language ?? null,
      stars: typeof github?.stars === 'number' ? github.stars : null,
      pushedAt: github?.pushedAt || null,
      isGithub,
    };
  });
}

export function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function formatStars(stars: number): string {
  if (stars >= 1000) {
    const thousands = stars / 1000;
    return `${thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, '')}k`;
  }
  return String(stars);
}

export function formatPushedAt(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30));
    return `${months}mo ago`;
  }
  const years = Math.max(1, Math.floor(days / 365));
  return `${years}y ago`;
}
