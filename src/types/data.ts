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
  img: string;
  'icon-overlay'?: string;
}

export interface ProjectCategory {
  category: string;
  projects: Project[];
}

export interface Writing {
  title: string;
  description: string;
  buttonText: string;
  url: string;
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

export interface TechIcon {
  alt: string;
  src: string;
}

export interface AboutMe {
  description: string;
  icons: TechIcon[];
  skills: string[];
  callToAction: string;
}

export interface HeroImage {
  name: string;
  src: string;
  shade: 'light' | 'dark';
  adjustment?: string;
  alt: string;
}

export interface ImageData {
  alt: string;
  src: string;
}

export interface ProjectFeature {
  portraitImage: ImageData;
  landscapeImage: ImageData;
  callToAction: string;
  buttonText: string;
  buttonUrl: string;
}
