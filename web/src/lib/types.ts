export type LinkType =
  | 'WHATSAPP'
  | 'CALL'
  | 'EMAIL'
  | 'WEBSITE'
  | 'PROJECTS'
  | 'SCHEDULE_MEETING'
  | 'SAVE_CONTACT'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'FACEBOOK'
  | 'YOUTUBE'
  | 'PDF'
  | 'CUSTOM';

export type BackgroundType = 'THEME' | 'SOLID' | 'GRADIENT';

export interface ProfileLink {
  id: string;
  type: LinkType;
  title: string;
  url: string;
  icon?: string | null;
  order: number;
  isActive: boolean;
  clickCount: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order: number;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface Profile {
  id: string;
  company?: Company | null;
  slug: string;
  hasSaveContact?: boolean;
  fullName: string;
  position?: string | null;
  companyName?: string | null;
  bio?: string | null;
  photo?: string | null;
  logo?: string | null;
  theme: 'LIGHT' | 'DARK';
  photoStyle: 'COLOR' | 'BLACK_AND_WHITE';
  isActive: boolean;
  backgroundType: BackgroundType;
  backgroundColor?: string | null;
  backgroundTo?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  textColor?: string | null;
  links: ProfileLink[];
  socialLinks: SocialLink[];
}
