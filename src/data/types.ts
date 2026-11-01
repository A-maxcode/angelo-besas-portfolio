// Shared content types. These mirror the shape the future CMS tables will use,
// so swapping mock data for backend queries only changes the data source.

export type ContentStatus = "placeholder" | "sample";

export interface Profile {
  name: string;
  headline: string;
  course: string;
  school: string;
  mainInterest: string;
  intro: string;
  about: string[];
  location?: string | undefined;
  email?: string | undefined;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  period: string;
  description: string;
  status: ContentStatus;
}

export interface Interest {
  id: string;
  title: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  featured?: boolean | undefined;
  status: ContentStatus;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string | undefined;
  imageUrl?: string | undefined;
  documentType: "image" | "pdf";
  status: ContentStatus;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  tech: string[];
  repoUrl?: string | undefined;
  liveUrl?: string | undefined;
  featured?: boolean | undefined;
  status: ContentStatus;
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: ContentStatus;
}
