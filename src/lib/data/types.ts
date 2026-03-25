export interface Stat {
  value: number;
  label: string;
  suffix: string;
  iconName: string;
  delay: number;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logoWhite: string;
  logoColor: string;
  description: string;
  category: 'ar-ge' | 'sosyal';
  members?: number;
  founded?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image: string;
  category: string[];
  url?: string;
  tags: string[];
}

export interface Site {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  image: string;
  iconName?: string;
  category: 'project' | 'tool' | 'resource' | 'platform' | 'other' | 'community' | 'education';
  featured: boolean;
  tags: string[];
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  image: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
}

export interface BoardSection {
  management: BoardMember[];
  supervision: BoardMember[];
}

export interface SocialLink {
  platform: string;
  url: string;
  iconName: string;
}

export interface ClubInfo {
  name: string;
  fullName: string;
  description: string;
  founded: string;
  university: string;
  email: string;
  socialLinks: SocialLink[];
}