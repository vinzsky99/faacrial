import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, Agenda, VerifiedAuthor } from '../types';
import { defaultPosts, defaultAgendas, defaultVerifiedAuthors } from '../data/defaultData';

const SUPABASE_CONFIG_KEY = 'facrial_supabase_config';
const LOCAL_POSTS_KEY = 'facrial_local_posts';
const LOCAL_AGENDAS_KEY = 'facrial_local_agendas';
const LOCAL_AUTHORS_KEY = 'facrial_local_verified_authors';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}

// Retrieve saved or env-based Supabase configuration
export function getSupabaseConfig(): SupabaseConfig {
  const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return {
    url: envUrl,
    anonKey: envKey,
    connected: Boolean(envUrl && envKey)
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const config: SupabaseConfig = {
    url: url.trim(),
    anonKey: anonKey.trim(),
    connected: Boolean(url.trim() && anonKey.trim())
  };
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    if (!cachedClient) {
      cachedClient = createClient(config.url, config.anonKey);
    }
    return cachedClient;
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
    return null;
  }
}

// Local persistence initializers
export function getInitialPosts(): Post[] {
  const saved = localStorage.getItem(LOCAL_POSTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(defaultPosts));
  return defaultPosts;
}

export function savePostsToStorage(posts: Post[]): void {
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
}

export function getInitialAgendas(): Agenda[] {
  const saved = localStorage.getItem(LOCAL_AGENDAS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(LOCAL_AGENDAS_KEY, JSON.stringify(defaultAgendas));
  return defaultAgendas;
}

export function saveAgendasToStorage(agendas: Agenda[]): void {
  localStorage.setItem(LOCAL_AGENDAS_KEY, JSON.stringify(agendas));
}

export function getInitialVerifiedAuthors(): VerifiedAuthor[] {
  const saved = localStorage.getItem(LOCAL_AUTHORS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(defaultVerifiedAuthors));
  return defaultVerifiedAuthors;
}

export function saveVerifiedAuthorsToStorage(authors: VerifiedAuthor[]): void {
  localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(authors));
}

/**
 * Automatically sync verified author into Supabase database table
 */
export async function syncAuthorToSupabase(author: VerifiedAuthor): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    // Stored safely locally
    return { success: true };
  }

  try {
    const { error } = await client
      .from('verified_authors')
      .upsert({
        id: author.id,
        name: author.name,
        email: author.email,
        role: author.role,
        avatar: author.avatar,
        bio: author.bio,
        institution: author.institution || '',
        verified_by_email: author.verifiedByEmail,
        verified_at: author.verifiedAt,
        verification_code: author.verificationCode || '',
        status: author.status,
        posts_count: author.postsCount || 0
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase author sync note:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase sync exception:', err);
    return { success: false, error: err?.message || 'Gagal tersambung' };
  }
}

/**
 * SQL Schema definition for users to copy/paste into Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SKEMA DATABASE FACRIAL SUPABASE (PostgreSQL)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ==========================================

-- 1. Buat Tabel Postingan Blog & Berita
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    cover_images TEXT[] DEFAULT '{}',
    author_name TEXT NOT NULL DEFAULT 'Fachrial',
    author_role TEXT DEFAULT 'Software Engineer & Writer',
    author_avatar TEXT,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 5,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at_display TEXT
);

-- 2. Buat Tabel Agenda Kegiatan
CREATE TABLE IF NOT EXISTS agendas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Mendatang',
    author TEXT DEFAULT 'Fachrial',
    link TEXT,
    cover_image TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat Tabel Author Terverifikasi via Email oleh Admin
CREATE TABLE IF NOT EXISTS verified_authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    institution TEXT,
    verified_by_email BOOLEAN DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_code TEXT,
    status TEXT DEFAULT 'verified',
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Buat Tabel Komentar Artikel
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Aktifkan Row Level Security (RLS) untuk perlindungan data
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 6. Buat Kebijakan Akses Baca Publik
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read Agendas" ON agendas FOR SELECT USING (true);
CREATE POLICY "Public Read Verified Authors" ON verified_authors FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON comments FOR SELECT USING (true);

-- 7. Kebijakan Tambah & Update Data
CREATE POLICY "Public Insert Posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Agendas" ON agendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert & Update Verified Authors" ON verified_authors FOR ALL USING (true);
CREATE POLICY "Public Insert Comments" ON comments FOR INSERT WITH CHECK (true);

-- 8. Aktifkan Fitur Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE agendas;
ALTER PUBLICATION supabase_realtime ADD TABLE verified_authors;
`;
