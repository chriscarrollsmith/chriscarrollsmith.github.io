import { describe, expect, test } from 'bun:test';
import {
  formatPushedAt,
  formatStars,
  loadProjectIndex,
  uniqueSorted,
} from '../../src/utils/projectsIndex';
import type { Project, ProjectGithubMetaFile } from '../../src/types/data';

const projects: Project[] = [
  {
    title: 'etielle',
    url: 'https://github.com/Promptly-Technologies-LLC/etielle',
    description: 'ETL',
    tags: ['etl', 'data'],
  },
  {
    title: 'Promptly Technologies',
    url: 'https://promptlytechnologies.com',
    description: 'Site',
    language: 'TypeScript',
    tags: ['web'],
  },
];

const meta: ProjectGithubMetaFile = {
  fetchedAt: '2026-08-01T00:00:00.000Z',
  repos: {
    'https://github.com/Promptly-Technologies-LLC/etielle': {
      fullName: 'Promptly-Technologies-LLC/etielle',
      language: 'Python',
      stars: 1,
      pushedAt: '2026-07-02T00:08:55Z',
    },
  },
};

describe('loadProjectIndex', () => {
  test('merges GitHub meta and keeps manual language for non-GitHub projects', () => {
    const index = loadProjectIndex(projects, meta);
    expect(index[0].language).toBe('Python');
    expect(index[0].stars).toBe(1);
    expect(index[0].isGithub).toBe(true);
    expect(index[1].language).toBe('TypeScript');
    expect(index[1].stars).toBeNull();
    expect(index[1].isGithub).toBe(false);
  });
});

describe('formatters', () => {
  test('formatStars compactifies large counts', () => {
    expect(formatStars(71)).toBe('71');
    expect(formatStars(1500)).toBe('1.5k');
    expect(formatStars(12000)).toBe('12k');
  });

  test('formatPushedAt returns relative labels', () => {
    const now = new Date('2026-08-01T12:00:00Z');
    expect(formatPushedAt('2026-08-01T08:00:00Z', now)).toBe('today');
    expect(formatPushedAt('2026-07-31T08:00:00Z', now)).toBe('yesterday');
    expect(formatPushedAt('2026-07-10T08:00:00Z', now)).toBe('22d ago');
    expect(formatPushedAt('2026-05-01T08:00:00Z', now)).toBe('3mo ago');
    expect(formatPushedAt('2024-08-01T08:00:00Z', now)).toBe('2y ago');
  });

  test('uniqueSorted dedupes and sorts', () => {
    expect(uniqueSorted(['web', 'ai', 'web', null, ''])).toEqual(['ai', 'web']);
  });
});
