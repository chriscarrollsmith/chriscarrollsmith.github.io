export const SITE_URL = 'https://christophercarrollsmith.com';

export const SITE_NAME = 'Christopher Carroll Smith';

export const SITE_DESCRIPTION =
  'Website of Christopher Carroll Smith, software architect, data storyteller, and president of Promptly Technologies, LLC.';

export const PERSON_JOB_TITLE = 'Software Architect';

export const PERSON_DESCRIPTION =
  'Software architect, data storyteller, and president of Promptly Technologies, LLC';

export const PERSON_SAME_AS = [
  'https://orcid.org/0009-0008-1756-612X',
  'https://scholar.google.com/citations?user=IY53lNkAAAAJ&hl=en',
  'https://twitter.com/christophcsmith',
  'https://github.com/chriscarrollsmith',
  'https://linkedin.com/in/chriscarrollsmith',
] as const;

export function buildPersonSchema(extras: Record<string, unknown> = {}) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_NAME,
    url: SITE_URL,
    jobTitle: PERSON_JOB_TITLE,
    description: PERSON_DESCRIPTION,
    sameAs: [...PERSON_SAME_AS],
    ...extras,
  };
}

export function buildWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': `${SITE_URL}/#person` },
  };
}

export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebsiteSchema(), buildPersonSchema()],
  };
}
