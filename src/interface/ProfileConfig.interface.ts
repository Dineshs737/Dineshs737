import { TechItem } from "./TechItem.interface";

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  color: string;
  logo: string;
}

export interface SvgDimensions {
  width: number;
  height: number;
}

export interface ProfileConfig {
  defaults: {
    name: string;
    location: string;
    bio: string;
    company: string;
    blog: string;
  };
  techStack: TechItem[];
  quote: string;
  socialLinks: SocialLink[];
  svg: SvgDimensions;
  theme: string;
  skills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    databases: string[];
    tools: string[];
    learning: string[];
  };
}
