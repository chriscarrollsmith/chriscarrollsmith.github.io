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
  iconOverlay?: string;
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

export interface EventItem {
  title: string;
  start: string;
  end?: string;
  url?: string;
}

export interface Education {
  schoolName: string;
  startDate: number;
  endDate: number;
  notes: string;
  degreeName: string;
  verificationUrl: string | null;
}

// Import canonical CSL-JSON types from the official schema
import type {
  NameVariable as CSLAuthor,
  DateContentModel as CSLDate,
  HttpsResourceCitationstylesOrgSchemaV10InputJsonCslDataJson,
  CustomKeyValuePairs,
} from './csl-generated';

// Extract the item type from the array type
type CSLItem = HttpsResourceCitationstylesOrgSchemaV10InputJsonCslDataJson[number];

// Narrowed presentation item types derived from the canonical union
type PresentationType = Extract<CSLItem['type'], 'paper-conference' | 'speech'>;

// Custom fields we add to CSL items
export interface CSLCustom extends CustomKeyValuePairs {
  citations?: string;
  exclude?: boolean;
  featured?: boolean;
  awards?: Award[];
}

// CSL Publication type using canonical types from the official CSL-JSON schema
// We extend the canonical type to make id optional and add our custom fields
export type CSLPublication = Omit<CSLItem, 'id' | 'custom'> & {
  id?: CSLItem['id']; // Make id optional since we don't always have it
  custom?: CSLCustom; // Our custom fields (extends the base custom field)
};

// Re-export canonical types for convenience
export type { CSLAuthor, CSLDate };

// Custom fields for presentations
export interface CSLPresentationCustom extends CustomKeyValuePairs {
  section?: string; // "Panels Organized", "Papers Presented", "Respondent"
  featured?: boolean;
  videoUrl?: string;
  slidesUrl?: string;
}

// CSL Presentation type using canonical types from the official CSL-JSON schema
// Presentations use "paper-conference" or "speech" types
export type CSLPresentation = Omit<CSLItem, 'id' | 'custom' | 'type'> & {
  id?: CSLItem['id']; // Make id optional since we don't always have it
  type: PresentationType; // Restrict to presentation types, derived from the canonical union
  custom?: CSLPresentationCustom; // Our custom fields
};

// Legacy Presentation interface for backwards compatibility (deprecated)
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
