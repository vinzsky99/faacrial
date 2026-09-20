import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, Comment, VerifiedAuthor, AuthorApplication } from '../types';
import { initialPosts } from '../data/initialData';
import { addNotification } from './notifications';

// Membaca URL dan Anon Key dari env (kompatibel Vite import.meta.env dan Next.js process.env)
const envUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  '';

const envKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(envUrl && envKey && !envUrl.includes('your-project-id'));

// Inisialisasi Supabase Client yang selalu siap digunakan (Safe fallback client untuk preview tanpa crash)
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(envUrl, envKey)
  : createClient('https://facrial-hukum-politik.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy');

// Local fallback state management agar demo aplikasi berjalan seketika (Zero-Setup Preview)
const LOCAL_STORAGE_KEY = 'facrial_posts_hukum_politik_v5';
const LOCAL_COMMENTS_KEY = 'facrial_comments_v2';
const LOCAL_AUTHORS_KEY = 'facrial_verified_authors_v5';
const LOCAL_APPLICATIONS_KEY = 'facrial_author_applications_v1';
const LOCAL_LOVED_POSTS_KEY = 'facrial_user_loved_posts_v1';

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('facrial_realtime_sync')
  : null;

// Daftar author terverifikasi awal (Hukum & Politik Indonesia) dengan Profil Lengkap ala Facebook
export const defaultVerifiedAuthors: VerifiedAuthor[] = [
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
export function getLocalPosts(): Post[] {
  if (typeof window === 'undefined') return initialPosts;
  try {
    ['facrial_posts_v1', 'facrial_posts_v2', 'facrial_posts_hukum_politik_v1', 'facrial_posts_hukum_politik_v2'].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPosts));
      return initialPosts;
    }
    const parsed: Post[] = JSON.parse(stored);

    const containsOldIT = parsed.some(
      (p: any) =>
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
  } catch {
    return initialPosts;
  }
}

// Helper menyimpan post
export function saveLocalPosts(posts: Post[]) {
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

// Mengambil seluruh postingan untuk publik (hanya yang berstatus 'approved' atau yang belum memiliki flag status)
export async function fetchAllPosts(): Promise<Post[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or('status.eq.approved,status.is.null')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) return data as Post[];
    } catch (err) {
      console.warn('Gagal menghubungi Supabase, beralih ke penyimpanan lokal:', err);
    }
  }
  const local = getLocalPosts();
  return local.filter((p) => !p.status || p.status === 'approved');
}

// Mengambil seluruh postingan untuk Admin (termasuk pending dan rejected)
export async function getAllPostsForAdmin(): Promise<Post[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) return data as Post[];
    } catch {
      // fallback to local
    }
  }
  return getLocalPosts();
}

// Update status persetujuan postingan (Approve / Reject oleh Admin)
export async function updatePostApprovalStatus(
  postId: string,
  newStatus: 'approved' | 'rejected'
): Promise<boolean> {
  const posts = getLocalPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    posts[idx].status = newStatus;
    saveLocalPosts(posts);

    if (newStatus === 'approved') {
      addNotification({
        type: 'approval',
        title: 'Postingan Disetujui & Diterbitkan',
        message: `Artikel "${posts[idx].title}" telah disetujui oleh Admin Redaksi dan resmi tayang ke publik.`,
        postSlug: posts[idx].slug,
        postId: posts[idx].id,
      });
    }
  }

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('posts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', postId);
    } catch (err) {
      console.warn('Supabase post update error:', err);
    }
  }

  return true;
}

// Hapus postingan secara permanen oleh Admin
export async function deletePostPermanently(postId: string): Promise<boolean> {
  const posts = getLocalPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  saveLocalPosts(filtered);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.warn('Supabase post delete error:', err);
    }
  }

  return true;
}

// Mengambil postingan berdasarkan slug
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) return data as Post;
    } catch {
      // Fallback
    }
  }
  const local = getLocalPosts();
  return local.find((p) => p.slug === slug) || null;
}

// Membuat postingan / agenda baru
export async function insertPost(newPost: Post, postedByRole: 'admin' | 'author' = 'admin'): Promise<boolean> {
  const postToSave: Post = {
    ...newPost,
    status: postedByRole === 'admin' ? 'approved' : 'pending_approval',
    loves: newPost.likes || 0,
    views: newPost.views || 1,
    commentsCount: 0,
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('posts').insert([postToSave]);
      if (error) console.error('Supabase insert error:', error);
    } catch (err) {
      console.warn('Gagal insert ke Supabase, menyimpan lokal:', err);
    }
  }

  const posts = getLocalPosts();
  const updated = [postToSave, ...posts];
  saveLocalPosts(updated);

  if (postedByRole === 'author') {
    addNotification({
      type: 'post',
      title: 'Postingan Baru Menunggu Persetujuan',
      message: `Author ${postToSave.author.name} mengirim artikel baru: "${postToSave.title}" untuk ditinjau Admin.`,
      postSlug: postToSave.slug,
      postId: postToSave.id,
      avatar: postToSave.author.avatar,
    });
  } else {
    addNotification({
      type: postToSave.isAgenda ? 'agenda' : 'post',
      title: postToSave.isAgenda ? 'Agenda Baru Diterbitkan' : 'Investigasi Baru Diterbitkan',
      message: `Redaksi telah menerbitkan: "${postToSave.title}".`,
      postSlug: postToSave.slug,
      postId: postToSave.id,
      avatar: postToSave.author.avatar,
    });
  }

  return true;
}

// =========================================================================
// REAL-TIME LOVE / SUKA (HATI) DENGAN DATABASE SUPABASE
// =========================================================================
export async function incrementPostLove(postId: string, userIdentifier: string = 'guest-user'): Promise<number> {
  const posts = getLocalPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return 0;
  
  posts[index].likes += 1;
  posts[index].loves = posts[index].likes;
  saveLocalPosts(posts);

  addNotification({
    type: 'love',
    title: 'Seseorang Memberikan Love ❤️',
    message: `Pembaca memberikan Love pada artikel: "${posts[index].title.slice(0, 45)}..."`,
    postSlug: posts[index].slug,
    postId: posts[index].id,
  });

  if (isSupabaseConfigured) {
    try {
      await supabase.from('post_loves').insert([{
        post_id: postId,
        user_identifier: userIdentifier + '_' + Date.now(),
      }]);

      await supabase
        .from('posts')
        .update({ loves: posts[index].likes, likes: posts[index].likes })
        .eq('id', postId);
    } catch {
      // Ignore
    }
  }
  return posts[index].likes;
}

export const incrementPostLike = incrementPostLove;

// =========================================================================
// REAL-TIME DILIHAT / VIEWS COUNTER
// =========================================================================
export async function incrementPostView(postId: string): Promise<number> {
  const posts = getLocalPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) return 0;

  posts[index].views = (posts[index].views || 0) + 1;
  saveLocalPosts(posts);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('post_views').insert([{
        post_id: postId,
        viewer_ip: 'client-ip',
      }]);
      await supabase
        .from('posts')
        .update({ views: posts[index].views })
        .eq('id', postId);
    } catch {
      // Ignore
    }
  }
  return posts[index].views;
}

// =========================================================================
// REAL-TIME KOMENTAR & MODERASI ADMIN
// =========================================================================
export function getCommentsForPost(postId: string): Comment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    const allComments: Comment[] = raw ? JSON.parse(raw) : [];
    return allComments.filter((c) => c.postId === postId && (c.status === undefined || c.status === 'approved'));
  } catch {
    return [];
  }
}

export function getAllCommentsForAdmin(): Comment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveComment(comment: Comment): Promise<Comment[]> {
  const newComment: Comment = {
    ...comment,
    status: 'approved',
    likes: 0,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const allComments: Comment[] = raw ? JSON.parse(raw) : [];
      const updated = [newComment, ...allComments];
      localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(updated));
    } catch {}
  }

  addNotification({
    type: 'comment',
    title: `Komentar Baru dari ${newComment.authorName}`,
    message: `"${newComment.content.slice(0, 70)}..."`,
    postId: newComment.postId,
    authorName: newComment.authorName,
  });

  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').insert([{
        id: newComment.id,
        post_id: newComment.postId,
        author_name: newComment.authorName,
        author_email: newComment.authorEmail,
        content: newComment.content,
        status: newComment.status,
      }]);
    } catch (err) {
      console.warn('Supabase comment insert notice:', err);
    }
  }

  return getCommentsForPost(comment.postId);
}

export async function updateCommentStatus(commentId: string, status: 'approved' | 'hidden'): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      if (raw) {
        const list: Comment[] = JSON.parse(raw);
        const idx = list.findIndex((c) => c.id === commentId);
        if (idx !== -1) {
          list[idx].status = status;
          localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(list));
        }
      }
    } catch {}
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').update({ status }).eq('id', commentId);
    } catch {}
  }
  return true;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      if (raw) {
        const list: Comment[] = JSON.parse(raw);
        const filtered = list.filter((c) => c.id !== commentId);
        localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
    } catch {}
  }
  return true;
}

// =========================================================================
// FITUR AUTHOR VERIFIKASI EMAIL KE DATABASE SUPABASE OTOMATIS
// =========================================================================

export async function getVerifiedAuthors(): Promise<VerifiedAuthor[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('verified_authors')
        .select('*')
        .order('verified_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as VerifiedAuthor[];
      }
    } catch (err) {
      console.warn('Gagal membaca verified_authors dari Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_AUTHORS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(LOCAL_AUTHORS_KEY, JSON.stringify(defaultVerifiedAuthors));
    } catch {
      // fallback
    }
  }
  return defaultVerifiedAuthors;
}

export async function verifyAndSaveAuthor(newAuthor: VerifiedAuthor): Promise<VerifiedAuthor[]> {
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

  const currentAuthors = await getVerifiedAuthors();
  const existingIdx = currentAuthors.findIndex(
    (a) => a.email.toLowerCase() === newAuthor.email.toLowerCase()
  );

  let updated: VerifiedAuthor[];
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

export async function updateAuthorProfile(updatedData: Partial<VerifiedAuthor> & { id: string }): Promise<VerifiedAuthor | null> {
  const currentAuthors = await getVerifiedAuthors();
  const idx = currentAuthors.findIndex((a) => a.id === updatedData.id || (updatedData.email && a.email.toLowerCase() === updatedData.email.toLowerCase()));

  if (idx === -1) return null;

  const merged: VerifiedAuthor = {
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
    } catch {
      // ignore
    }
  }

  return merged;
}

export async function checkAuthorVerification(email: string): Promise<VerifiedAuthor | null> {
  const cleanEmail = email.toLowerCase().trim();
  
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('verified_authors')
        .select('*')
        .eq('email', cleanEmail)
        .eq('verified', true)
        .single();
      if (!error && data) return data as VerifiedAuthor;
    } catch {
      // fallback
    }
  }

  const authors = await getVerifiedAuthors();
  const found = authors.find((a) => a.email.toLowerCase() === cleanEmail && a.verified);
  return found || null;
}

// =========================================================================
// FITUR PENDAFTARAN CALON AUTHOR (BECOME AN AUTHOR) KE SUPABASE
// =========================================================================

const defaultApplications: AuthorApplication[] = [
  {
    id: 'app-demo-1',
    name: 'Dr. Hendra Gunawan, S.H., M.Hum.',
    email: 'hendra.gunawan@ui.ac.id',
    phone: '081299887766',
    expertise: 'Hukum Hak Asasi Manusia & Sejarah Peradilan 1998',
    institution: 'Fakultas Hukum Universitas Indonesia',
    bioReason: 'Fokus meneliti arsip investigasi Komnas HAM mengenai Peristiwa Trisakti dan Semanggi I-II serta transparansi reformasi sektor keamanan.',
    portfolioUrl: 'https://scholar.google.com',
    verificationPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'pending',
    createdAt: 'Hari ini, 10:15 WIB',
  }
];

export async function getAuthorApplications(): Promise<AuthorApplication[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('author_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          expertise: d.expertise,
          institution: d.institution,
          bioReason: d.bio_reason || d.bioReason,
          portfolioUrl: d.portfolio_url || d.portfolioUrl,
          verificationPhoto: d.verification_photo || d.verificationPhoto,
          status: d.status,
          notes: d.notes,
          createdAt: d.created_at || d.createdAt,
          reviewedAt: d.reviewed_at,
          reviewedBy: d.reviewed_by,
        }));
      }
    } catch (err) {
      console.warn('Gagal membaca author_applications dari Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(defaultApplications));
      return defaultApplications;
    } catch {}
  }
  return defaultApplications;
}

export async function submitAuthorApplication(
  appData: Omit<AuthorApplication, 'id' | 'status' | 'createdAt'>
): Promise<AuthorApplication> {
  const newApp: AuthorApplication = {
    ...appData,
    id: 'app-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB',
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('author_applications').insert([{
        id: newApp.id,
        name: newApp.name,
        email: newApp.email.toLowerCase().trim(),
        phone: newApp.phone,
        expertise: newApp.expertise,
        institution: newApp.institution,
        bio_reason: newApp.bioReason,
        portfolio_url: newApp.portfolioUrl || '',
        verification_photo: newApp.verificationPhoto,
        status: 'pending',
      }]);
    } catch (err) {
      console.warn('Supabase application insert note:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const current = await getAuthorApplications();
      const updated = [newApp, ...current];
      localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(updated));
    } catch {}
  }

  addNotification({
    type: 'author_application',
    title: 'Pendaftaran Calon Author Baru',
    message: `${newApp.name} (${newApp.institution}) mengajukan pendaftaran sebagai Author Hukum & Politik. Segera konfirmasi di Portal Admin.`,
    authorName: newApp.name,
    avatar: newApp.verificationPhoto,
  });

  return newApp;
}

export async function updateAuthorApplicationStatus(
  appId: string,
  newStatus: 'approved' | 'rejected',
  adminNotes?: string
): Promise<boolean> {
  const applications = await getAuthorApplications();
  const idx = applications.findIndex((a) => a.id === appId);
  if (idx === -1) return false;

  const app = applications[idx];
  app.status = newStatus;
  app.notes = adminNotes || (newStatus === 'approved' ? 'Telah disetujui & diverifikasi resmi' : 'Belum memenuhi kriteria');
  app.reviewedAt = new Date().toISOString();
  app.reviewedBy = 'Admin Redaksi Facrial';

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(applications));
    } catch {}
  }

  // JIKA DISETUJUI, OTOMATIS TAMBAHKAN KE DAFTAR AUTHOR TERVERIFIKASI RESMI DI SUPABASE!
  if (newStatus === 'approved') {
    const newAuthor: VerifiedAuthor = {
      id: 'auth-' + app.id,
      email: app.email.toLowerCase().trim(),
      name: app.name,
      role: `Peneliti & Author Resmi (${app.expertise})`,
      verified: true,
      verifiedBy: 'Fachrial (Admin Redaksi)',
      verifiedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      articlesCount: 0,
      status: 'Aktif',
      avatar: app.verificationPhoto,
      coverPhoto: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
      bio: app.bioReason,
      workplace: app.institution,
      education: app.expertise,
      ktaNumber: `KTA-AUTH-${Date.now().toString().slice(-4)}/RED/2026`,
      socials: {
        email: app.email,
        instagram: '',
        facebook: '',
        linkedin: '',
        website: '',
        ...((app as any).socials || {}),
      } as any,
    } as any;

    await verifyAndSaveAuthor(newAuthor);

    // Kirim notifikasi sistem
    addNotification({
      type: 'approval',
      title: 'Author Resmi Baru Telah Disetujui',
      message: `${app.name} telah disetujui sebagai Author resmi dan dapat login di /author untuk mulai menulis.`,
      authorName: app.name,
      avatar: app.verificationPhoto,
    });
  }

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('author_applications')
        .update({
          status: newStatus,
          notes: app.notes,
          reviewed_at: app.reviewedAt,
          reviewed_by: app.reviewedBy,
        })
        .eq('id', appId);
    } catch {}
  }

  return true;
}

export async function deleteAuthorApplication(appId: string): Promise<boolean> {
  const applications = await getAuthorApplications();
  const filtered = applications.filter((a) => a.id !== appId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(filtered));
    } catch {}
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('author_applications').delete().eq('id', appId);
    } catch {}
  }
  return true;
}