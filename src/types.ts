export interface Author {
  name: string;
  role: string;
  avatar: string;
  coverImages: string[];
  bio: string;
  verified: boolean;
  location: string;
  email: string;
  instagram: string;
  linkedin: string;
  github: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'archive' | 'doc';
  url: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Teknologi' | 'Pengembangan Web' | 'Edukasi' | 'Visi Digital' | 'Tutorial' | 'Agenda';
  tags: string[];
  coverImages: string[];
  author: Author;
  createdAt: string; // ISO date or formatted
  publishedAtDisplay: string; // e.g. "Jumat, 18 September 2026 • 14:30 WIB"
  likes: number;
  commentsCount: number;
  views: number;
  readingTimeMinutes: number;
  attachments?: Attachment[];
  timelineSide?: 'left' | 'right';
}

export interface Agenda {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  status: 'Mendatang' | 'Sedang Berlangsung' | 'Selesai';
  author: string;
  link?: string;
  coverImage?: string;
  attachments?: Attachment[];
}

export interface VerifiedAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  institution?: string;
  verifiedByEmail: boolean;
  verifiedAt: string;
  verificationCode?: string;
  status: 'verified' | 'pending';
  postsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

export type ThemeMode = 'dark' | 'light';

export type ActiveTab = 'home' | 'blog' | 'blog-detail' | 'agenda' | 'visi-misi' | 'admin';
