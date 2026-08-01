import { describe, expect, test } from 'bun:test';
import { parseGithubRepo } from '../sync-github-projects';

describe('parseGithubRepo', () => {
  test('parses owner and repo from a standard GitHub URL', () => {
    expect(parseGithubRepo('https://github.com/chriscarrollsmith/taskqueue-mcp')).toEqual({
      owner: 'chriscarrollsmith',
      repo: 'taskqueue-mcp',
    });
  });

  test('strips .git suffix and ignores extra path segments', () => {
    expect(
      parseGithubRepo('https://github.com/Promptly-Technologies-LLC/etielle.git'),
    ).toEqual({
      owner: 'Promptly-Technologies-LLC',
      repo: 'etielle',
    });
    expect(
      parseGithubRepo('https://github.com/Promptly-Technologies-LLC/imfp/tree/main'),
    ).toEqual({
      owner: 'Promptly-Technologies-LLC',
      repo: 'imfp',
    });
  });

  test('returns null for non-GitHub URLs', () => {
    expect(parseGithubRepo('https://promptlytechnologies.com')).toBeNull();
    expect(parseGithubRepo('not-a-url')).toBeNull();
  });
});
