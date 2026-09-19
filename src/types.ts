export type ThemeMode = 'light' | 'dark';

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  coverPhoto?: string;
  bio: string;
  verified: boolean;
  city?: string;
  workplace?: string;
  education?: string;
  ktaNumber?: string;
  socials: {
    instagram: string;
    facebook?: string;
    linkedin: string;
    email: string;
    github?: string;
  };
}

export interface VerifiedAuthor {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
  verifiedBy: string; // e.g. 'Admin Redaksi Facrial'
  verifiedAt: string;
  articlesCount: number;
  status: 'Aktif' | 'Menunggu Verifikasi' | 'Nonaktif';
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  city?: string;
  workplace?: string;
  education?: string;
  ktaNumber?: string;
  socials?: {
    instagram: string;
    facebook?: string;
    linkedin: string;
    email: string;
    github?: string;
  };
}

export interface Attachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'video' | 'document';
  url: string;
}

export interface AgendaDetails {
  eventDate: string; // e.g. "2026-10-15"
  eventTime: string; // e.g. "09:00 - 12:00 WIB"
  location: string;
  status: 'Mendatang' | 'Berlangsung' | 'Selesai';
  registrationUrl?: string;
}

export type PostCategory = string;

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: PostCategory;
  coverImage: string;
  images: string[]; // For motion slider zoom preview
  date: string; // ISO date string or formatted
  dayName: string; // e.g. "Jumat"
  formattedDate: string; // e.g. "19 September 2026"
  time: string; // e.g. "09:30 WIB"
  author: Author;
  readTime: string;
  likes: number;
  views: number;
  commentsCount: number;
  isAgenda?: boolean;
  agenda?: AgendaDetails;
  attachments?: Attachment[];
  tags: string[];
  isFeatured?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface NotificationItem {
  id: string;
  type: 'comment' | 'post' | 'agenda' | 'security';
  title: string;
  message: string;
  authorName?: string;
  postSlug?: string;
  postId?: string;
  createdAt: string;
  read: boolean;
  avatar?: string;
}

export interface SearchResult {
  post: Post;
  matchType: 'title' | 'content' | 'tag' | 'category';
}

export interface ThemeConfig {
  mode: ThemeMode;
  transparency: number; // 20 to 100 (%)
  blurBackdrop: boolean;
}
