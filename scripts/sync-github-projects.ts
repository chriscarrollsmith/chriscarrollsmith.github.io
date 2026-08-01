/**
 * Fetches GitHub stars, primary language, and last-push dates for curated
 * project URLs and bakes them into static JSON for the work index.
 * Skips gracefully when the API is unreachable so builds still succeed offline.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = import.meta.dir ? join(import.meta.dir, '..') : process.cwd();
const PROJECTS_PATH = join(ROOT, 'src/data/projects.json');
const META_PATH = join(ROOT, 'src/data/project-github-meta.json');
const FETCH_TIMEOUT_MS = 10000;

export interface ProjectSource {
  title: string;
  url: string;
  description: string;
  tags?: string[];
  language?: string;
}

export interface GithubRepoMeta {
  fullName: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface ProjectGithubMetaFile {
  fetchedAt: string;
  repos: Record<string, GithubRepoMeta>;
}

export function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      return null;
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repoRaw] = parts;
    const repo = repoRaw.replace(/\.git$/i, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

function loadExistingMeta(): ProjectGithubMetaFile {
  try {
    const raw = readFileSync(META_PATH, 'utf8');
    const parsed = JSON.parse(raw) as ProjectGithubMetaFile;
    if (parsed && typeof parsed === 'object' && parsed.repos) {
      return parsed;
    }
  } catch {
    // No prior file or invalid JSON — start fresh.
  }
  return { fetchedAt: '', repos: {} };
}

async function fetchRepoMeta(
  owner: string,
  repo: string,
): Promise<GithubRepoMeta | null> {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'christophercarrollsmith-website-build',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`  GitHub API ${response.status} for ${owner}/${repo}`);
      return null;
    }

    const data = (await response.json()) as {
      full_name?: string;
      language?: string | null;
      stargazers_count?: number;
      pushed_at?: string;
    };

    return {
      fullName: data.full_name ?? `${owner}/${repo}`,
      language: data.language ?? null,
      stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : 0,
      pushedAt: data.pushed_at ?? '',
    };
  } catch (error) {
    console.warn(`  Failed to fetch ${owner}/${repo}:`, error);
    return null;
  }
}

export async function syncGithubProjects(
  projects: ProjectSource[] = JSON.parse(readFileSync(PROJECTS_PATH, 'utf8')) as ProjectSource[],
): Promise<ProjectGithubMetaFile> {
  const existing = loadExistingMeta();
  const next: ProjectGithubMetaFile = {
    fetchedAt: new Date().toISOString(),
    repos: { ...existing.repos },
  };

  const githubProjects = projects.filter((project) => parseGithubRepo(project.url));
  console.log(`Syncing GitHub metadata for ${githubProjects.length} projects…`);

  let updated = 0;
  let failed = 0;

  for (const project of githubProjects) {
    const parsed = parseGithubRepo(project.url);
    if (!parsed) continue;

    const meta = await fetchRepoMeta(parsed.owner, parsed.repo);
    if (meta) {
      next.repos[project.url] = meta;
      updated += 1;
      console.log(
        `  ${meta.fullName}: ${meta.stars}★ ${meta.language ?? 'n/a'} ${meta.pushedAt.slice(0, 10)}`,
      );
    } else {
      failed += 1;
      if (!next.repos[project.url]) {
        console.warn(`  No cached metadata for ${project.url}`);
      } else {
        console.warn(`  Keeping cached metadata for ${project.url}`);
      }
    }
  }

  // Drop stale keys that are no longer in projects.json
  const liveUrls = new Set(githubProjects.map((p) => p.url));
  for (const url of Object.keys(next.repos)) {
    if (!liveUrls.has(url)) {
      delete next.repos[url];
    }
  }

  mkdirSync(dirname(META_PATH), { recursive: true });
  writeFileSync(META_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${META_PATH} (${updated} updated, ${failed} failed)`);
  return next;
}

if (import.meta.main) {
  syncGithubProjects().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
