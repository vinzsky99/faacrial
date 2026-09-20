export interface PostAuthor {
  name: string;
  avatar: string;
  role?: string;
  verified?: boolean;
}

export interface PostAgenda {
  eventDate?: string;
  eventTime?: string;
  location?: string;
  status?: string;
  registrationUrl?: string;
}

export interface PostAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  category: string;
  date: string;
  formattedDate?: string;
  dayName?: string;
  time?: string;
  readTime?: string;
  author: PostAuthor;
  likes: number;
  loves?: number;
  views?: number;
  commentsCount?: number;
  isAgenda?: boolean;
  agenda?: PostAgenda;
  attachments?: PostAttachment[];
  tags?: string[];
  status?: 'approved' | 'pending_approval' | 'rejected';
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  likes?: number;
  status?: 'approved' | 'hidden';
}

export interface VerifiedAuthor {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  articlesCount?: number;
  status?: 'Aktif' | 'Nonaktif' | 'Suspended';
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  city?: string;
  workplace?: string;
  education?: string;
  ktaNumber?: string;
  phone?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

export interface AuthorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  institution: string;
  bioReason: string;
  portfolioUrl?: string;
  verificationPhoto?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AppNotification {
  id: string;
  type: 'post' | 'comment' | 'agenda' | 'author_application' | 'approval' | 'system' | 'love';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  postSlug?: string;
  postId?: string;
  authorName?: string;
  avatar?: string;
}

export type ActiveTab = 'home' | 'timeline' | 'agenda' | 'gallery' | 'authors' | 'admin' | 'notifications';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  transparency?: boolean;
  blurBackground?: boolean;
}