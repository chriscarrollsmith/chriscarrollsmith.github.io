export interface BlogPost {
  id: number;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  image?: string;
  script?: string;
}

export interface Project {
  title: string;
  url: string;
  description: string;
  img?: string;
  'icon-overlay'?: string;
  buttonText?: string;
}

export interface SocialProfiles {
  gitHub: string;
  instagram: string;
  linkedIn: string;
  twitter: string;
  facebook: string;
  mastodon: string;
  youTube: string;
}

export interface SiteProperties {
  name: string;
  title: string;
  calendlyUrl: string;
  convertKitFormId: string;
  convertKitDataUid: string;
  formspreeFormId: string;
  socialProfiles: SocialProfiles;
}

export interface SocialIcons {
  email: string;
  devDotTo: string;
  gitHub: string;
  instagram: string;
  linkedIn: string;
  medium: string;
  twitter: string;
  facebook: string;
  youTube: string;
  mastodon: string;
}

export interface HeroImage {
  name: string;
  src: string;
  shade: 'light' | 'dark';
  adjustment?: string;
  alt: string;
}

export interface Education {
  'School Name': string;
  'Start Date': number;
  'End Date': number;
  Notes: string;
  'Degree Name': string;
  'Verification URL': string | null;
}

export interface Publication {
  title: string;
  authors: string;
  journal: string;
  volume: string;
  issue: string;
  citations: string;
  year: string;
  full_text?: string;
  [key: string]: string | undefined; // Allow additional fields
}

export interface Presentation {
  section: string;
  year: number;
  title: string;
  event: string;
  date: string;
}

export interface Award {
  year: number;
  award: string;
  organization: string;
}
