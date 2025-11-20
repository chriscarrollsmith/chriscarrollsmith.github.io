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
