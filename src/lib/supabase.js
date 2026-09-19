 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createClient, } from '@supabase/supabase-js';

import { initialPosts } from '../data/initialData';

// Membaca URL dan Anon Key dari env (kompatibel Vite import.meta.env dan Next.js process.env)
const envUrl = 
  (typeof import.meta !== 'undefined' && _optionalChain([import.meta, 'access', _ => _.env, 'optionalAccess', _2 => _2.VITE_SUPABASE_URL])) ||
  (typeof process !== 'undefined' && _optionalChain([process, 'access', _3 => _3.env, 'optionalAccess', _4 => _4.NEXT_PUBLIC_SUPABASE_URL])) ||
  '';

const envKey = 
  (typeof import.meta !== 'undefined' && _optionalChain([import.meta, 'access', _5 => _5.env, 'optionalAccess', _6 => _6.VITE_SUPABASE_ANON_KEY])) ||
  (typeof process !== 'undefined' && _optionalChain([process, 'access', _7 => _7.env, 'optionalAccess', _8 => _8.NEXT_PUBLIC_SUPABASE_ANON_KEY])) ||
  '';

export const isSupabaseConfigured = Boolean(envUrl && envKey && !envUrl.includes('your-project-id'));

// Inisialisasi Supabase Client yang selalu siap digunakan (Safe fallback client untuk preview tanpa crash)
export const supabase = isSupabaseConfigured
  ? createClient(envUrl, envKey)
  : createClient('https://facrial-hukum-politik.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy');

// Local fallback state management agar demo aplikasi berjalan seketika (Zero-Setup Preview)
const LOCAL_STORAGE_KEY = 'facrial_posts_hukum_politik_v5';
const LOCAL_COMMENTS_KEY = 'facrial_comments_v2';
const LOCAL_AUTHORS_KEY = 'facrial_verified_authors_v5';

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('facrial_realtime_sync')
  : null;

// Daftar author terverifikasi awal (Hukum & Politik Indonesia) dengan Profil Lengkap ala Facebook
export const defaultVerifiedAuthors = [
  {
    id: 'auth-1',
    email: 'fachrial.official2026@gmail.com',
    name: 'Fachrial, S.H., M.H.',
    role: 'Pemimpin Redaksi & Peneliti Hukum Tata Negara',
    verified: true,
    verifiedBy: 'Sistem Pusat Redaksi Facrial',
    verifiedAt: '12 Januari 2026',
    articlesCount: 5,
    status: 'Aktif',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
    bio: 'Pemerhati konstitusi, penelusur dokumen Tragedi 1998, dan penganalisis regulasi politik nasional serta advokasi pemenuhan hak korban HAM.',
    city: 'DKI Jakarta, Indonesia',
    workplace: 'Lembaga Kajian Hukum Tata Negara & Redaksi Facrial',
    education: 'Magister Hukum Tata Negara (M.H.), Universitas Indonesia',
    ktaNumber: 'KTA-RED-001/JKT/2026',
    socials: {
      instagram: 'https://instagram.com/fachrial',
      facebook: 'https://facebook.com/fachrial.official',
      linkedin: 'https://linkedin.com/in/fachrial',
      email: 'fachrial.official2026@gmail.com',
    },
  },
  {
    id: 'auth-2',
    email: 'redaksi.investigasi@facrial.id',
    name: 'Tim Advokasi & Riset HAM',
    role: 'Author Verifikasi Dokumen & Sejarah',
    verified: true,
    verifiedBy: 'Fachrial, S.H., M.H.',
    verifiedAt: '01 Februari 2026',
    articlesCount: 8,
    status: 'Aktif',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
    bio: 'Kolektif jurnalisme data mengkaji kronologi Trisakti, Semanggi, dan kebenaran peristiwa sejarah kemanusiaan Indonesia.',
    city: 'Jakarta Pusat, Indonesia',
    workplace: 'Pusat Dokumentasi HAM & Reformasi',
    education: 'Kolektif Akademisi & Advokat Hak Asasi Manusia',
    ktaNumber: 'KTA-INV-002/HAM/2026',
    socials: {
      instagram: 'https://instagram.com/fachrial',
      facebook: 'https://facebook.com/fachrial.official',
      linkedin: 'https://linkedin.com/in/fachrial',
      email: 'redaksi.investigasi@facrial.id',
    },
  },
  {
    id: 'auth-3',
    email: 'kontributor.hukum@facrial.id',
    name: 'Dr. Hendra Wijaya, S.H.',
    role: 'Pakar Hukum Pidana & Pengadilan HAM',
    verified: true,
    verifiedBy: 'Admin Redaksi Facrial',
    verifiedAt: '18 Februari 2026',
    articlesCount: 3,
    status: 'Aktif',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1600&q=80',
    bio: 'Akademisi hukum berfokus pada yurisprudensi kejahatan kemanusiaan, pembaruan KUHP, dan keadilan transisional.',
    city: 'Bandung, Jawa Barat',
    workplace: 'Fakultas Hukum Universitas Padjadjaran',
    education: 'Doktor Ilmu Hukum Pidana (Dr. S.H.)',
    ktaNumber: 'KTA-AKD-003/PID/2026',
    socials: {
      instagram: 'https://instagram.com/fachrial',
      facebook: 'https://facebook.com/fachrial.official',
      linkedin: 'https://linkedin.com/in/fachrial',
      email: 'kontributor.hukum@facrial.id',
    },
  },
];

// Helper membaca post tersimpan (dengan pembersihan tuntas jika ada sampah cache berita IT lama)
export function getLocalPosts() {
  if (typeof window === 'undefined') return initialPosts;
  try {
    // Bersihkan key lama dari browser
    ['facrial_posts_v1', 'facrial_posts_v2', 'facrial_posts_hukum_politik_v1', 'facrial_posts_hukum_politik_v2'].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPosts));
      return initialPosts;
    }
    const parsed = JSON.parse(stored);

    // Cek apakah ada berita IT lama yang menyusup
    const containsOldIT = parsed.some(
      (p) =>
        p.category === 'Teknologi' ||
        p.category === 'Design & UI/UX' ||
        p.category === 'Pengumuman' ||
        (typeof p.title === 'string' &&
          (p.title.includes('Next.js') ||
            p.title.includes('React 19') ||
            p.title.includes('UI/UX') ||
            p.title.includes('Tailwind CSS v4')))
    );

    if (containsOldIT || !Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPosts));
      return initialPosts;
    }
    return parsed;
  } catch (e2) {
    return initialPosts;
  }
}

// Helper menyimpan post
export function saveLocalPosts(posts) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'POSTS_UPDATED', payload: posts });
    }
  } catch (err) {
    console.warn('Gagal menyimpan ke localStorage:', err);
  }
}

// Mengambil seluruh postingan (Dengan integrasi Supabase / Realtime Fallback)
export async function fetchAllPosts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data ;
    } catch (err) {
      console.warn('Gagal menghubungi Supabase, beralih ke penyimpanan lokal:', err);
    }
  }
  return getLocalPosts();
}

// Mengambil postingan berdasarkan slug
export async function fetchPostBySlug(slug) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) return data ;
    } catch (e3) {
      // Fallback
    }
  }
  const local = getLocalPosts();
  return local.find((p) => p.slug === slug) || null;
}

// Membuat postingan / agenda baru (Hukum & Politik Indonesia)
export async function insertPost(newPost) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('posts').insert([newPost]);
      if (error) console.error('Supabase insert error:', error);
    } catch (err) {
      console.warn('Gagal insert ke Supabase, menyimpan lokal:', err);
    }
  }

  const posts = getLocalPosts();
  const updated = [newPost, ...posts];
  saveLocalPosts(updated);
  return true;
}

// Menambah like ke postingan
export async function incrementPostLike(postId) {
  const posts = getLocalPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return 0;
  
  posts[index].likes += 1;
  saveLocalPosts(posts);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('posts')
        .update({ likes: posts[index].likes })
        .eq('id', postId);
    } catch (e4) {
      // Ignore
    }
  }
  return posts[index].likes;
}

// Komentar
export function getCommentsForPost(postId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    const allComments = raw ? JSON.parse(raw) : [];
    return allComments.filter((c) => c.postId === postId);
  } catch (e5) {
    return [];
  }
}

export function saveComment(comment) {
  if (typeof window === 'undefined') return [comment];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    const allComments = raw ? JSON.parse(raw) : [];
    const updated = [comment, ...allComments];
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(updated));
    return updated.filter((c) => c.postId === comment.postId);
  } catch (e6) {
    return [comment];
  }
}

// =========================================================================
// FITUR AUTHOR VERIFIKASI EMAIL KE DATABASE SUPABASE OTOMATIS
// =========================================================================

// Mengambil seluruh author yang telah diverifikasi
export async function getVerifiedAuthors() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('verified_authors')
        .select('*')
        .order('verified_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data ;
      }
    } catch (err) {
      console.warn('Gagal membaca verified_authors dari Supabase:', err);
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_AUTHORS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(defaultVerifiedAuthors));
    } catch (e7) {
      // fallback
    }
  }
  return defaultVerifiedAuthors;
}

// Memverifikasi atau mendaftarkan author baru via email (masuk database Supabase otomatis)
export async function verifyAndSaveAuthor(newAuthor) {
  // 1. Kirim otomatis ke Supabase database jika terkoneksi
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('verified_authors').upsert([
        {
          id: newAuthor.id,
          email: newAuthor.email.toLowerCase().trim(),
          name: newAuthor.name,
          role: newAuthor.role,
          verified: true,
          verified_by: newAuthor.verifiedBy,
          verified_at: newAuthor.verifiedAt,
          articles_count: newAuthor.articlesCount || 0,
          status: newAuthor.status || 'Aktif',
          avatar: newAuthor.avatar,
          cover_photo: newAuthor.coverPhoto,
          bio: newAuthor.bio,
          city: newAuthor.city,
          workplace: newAuthor.workplace,
          education: newAuthor.education,
          kta_number: newAuthor.ktaNumber,
        },
      ]);
      if (error) {
        console.warn('Supabase upsert author notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase author upsert error, fallback to local:', err);
    }
  }

  // 2. Simpan ke local storage agar seketika aktif
  const currentAuthors = await getVerifiedAuthors();
  const existingIdx = currentAuthors.findIndex(
    (a) => a.email.toLowerCase() === newAuthor.email.toLowerCase()
  );

  let updated;
  if (existingIdx >= 0) {
    updated = [...currentAuthors];
    updated[existingIdx] = { ...updated[existingIdx], ...newAuthor, verified: true };
  } else {
    updated = [newAuthor, ...currentAuthors];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(updated));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'AUTHORS_UPDATED', payload: updated });
      }
    } catch (err) {
      console.warn('Error saving local author:', err);
    }
  }

  return updated;
}

// Update Profil Author / Admin Terverifikasi (Facebook Profile style)
export async function updateAuthorProfile(updatedData) {
  const currentAuthors = await getVerifiedAuthors();
  const idx = currentAuthors.findIndex((a) => a.id === updatedData.id || (updatedData.email && a.email.toLowerCase() === updatedData.email.toLowerCase()));

  if (idx === -1) return null;

  const merged = {
    ...currentAuthors[idx],
    ...updatedData,
  };

  const updatedList = [...currentAuthors];
  updatedList[idx] = merged;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(updatedList));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'AUTHORS_UPDATED', payload: updatedList });
      }
    } catch (err) {
      console.warn('Error updating author profile locally:', err);
    }
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('verified_authors').upsert([
        {
          id: merged.id,
          email: merged.email,
          name: merged.name,
          role: merged.role,
          avatar: merged.avatar,
          cover_photo: merged.coverPhoto,
          bio: merged.bio,
          city: merged.city,
          workplace: merged.workplace,
          education: merged.education,
          kta_number: merged.ktaNumber,
        },
      ]);
    } catch (e8) {
      // ignore
    }
  }

  return merged;
}

// Verifikasi kredensial email author/admin
export async function checkAuthorVerification(email) {
  const cleanEmail = email.toLowerCase().trim();
  
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('verified_authors')
        .select('*')
        .eq('email', cleanEmail)
        .eq('verified', true)
        .single();
      if (!error && data) return data ;
    } catch (e9) {
      // fallback
    }
  }

  const authors = await getVerifiedAuthors();
  const found = authors.find((a) => a.email.toLowerCase() === cleanEmail && a.verified);
  return found || null;
}

