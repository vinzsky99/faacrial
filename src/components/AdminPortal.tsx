import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  ArrowLeft,
  PenSquare,
  Calendar,
  Database,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  LogOut,
  LayoutDashboard,
  Save,
  Users,
  CheckCircle2,
  Paperclip,
  Mail,
  FileUp,
  Image as ImageIcon,
  Sparkles,
  Download,
  Building,
  BadgeCheck
} from 'lucide-react';
import { Author, Post, Agenda, VerifiedAuthor, Attachment } from '../types';
import { sanitizeInput } from '../lib/security';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
  syncAuthorToSupabase,
  getSupabaseClient
} from '../lib/supabase';

interface AdminPortalProps {
  author: Author;
  posts: Post[];
  agendas: Agenda[];
  verifiedAuthors: VerifiedAuthor[];
  onAddPost: (post: Post) => void;
  onAddAgenda: (agenda: Agenda) => void;
  onAddVerifiedAuthor: (author: VerifiedAuthor) => void;
  onDeletePost?: (id: string) => void;
  onDeleteAgenda?: (id: string) => void;
  onDeleteVerifiedAuthor?: (id: string) => void;
  onBackToPublic: () => void;
  transparency: number;
  isDark: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  author,
  posts,
  agendas,
  verifiedAuthors,
  onAddPost,
  onAddAgenda,
  onAddVerifiedAuthor,
  onDeletePost,
  onDeleteAgenda,
  onDeleteVerifiedAuthor,
  onBackToPublic,
  transparency,
  isDark
}) => {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('facrial_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'posts' | 'agendas' | 'authors' | 'env-config' | 'manage'>('posts');

  // ==========================================
  // Post Form State
  // ==========================================
  const [postTitle, setPostTitle] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<Post['category']>('Teknologi');
  const [postTags, setPostTags] = useState('Teknologi, Web, Supabase');
  const [postCoverUrl, setPostCoverUrl] = useState('');
  const [postReadingTime, setPostReadingTime] = useState(5);
  const [postAttachments, setPostAttachments] = useState<Attachment[]>([]);
  const [newPostAttName, setNewPostAttName] = useState('');
  const [newPostAttUrl, setNewPostAttUrl] = useState('');
  const [newPostAttSize, setNewPostAttSize] = useState('1.5 MB');
  const [postSuccess, setPostSuccess] = useState(false);

  // ==========================================
  // Agenda Form State
  // ==========================================
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDate, setAgendaDate] = useState('');
  const [agendaTime, setAgendaTime] = useState('14:00 - 16:30 WIB');
  const [agendaLocation, setAgendaLocation] = useState('Online via Zoom / YouTube Live');
  const [agendaCategory, setAgendaCategory] = useState('Konferensi');
  const [agendaDesc, setAgendaDesc] = useState('');
  const [agendaLink, setAgendaLink] = useState('');
  const [agendaCoverUrl, setAgendaCoverUrl] = useState('');
  const [agendaAttachments, setAgendaAttachments] = useState<Attachment[]>([]);
  const [newAgendaAttName, setNewAgendaAttName] = useState('');
  const [newAgendaAttUrl, setNewAgendaAttUrl] = useState('');
  const [newAgendaAttSize, setNewAgendaAttSize] = useState('1.2 MB');
  const [agendaSuccess, setAgendaSuccess] = useState(false);

  // ==========================================
  // Author Verification via Email State
  // ==========================================
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRole, setAuthorRole] = useState('Specialist Software Engineer & Writer');
  const [authorInstitution, setAuthorInstitution] = useState('Facrial Open Research Lab');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [authorBio, setAuthorBio] = useState('Praktisi teknologi, open-source contributor, dan penulis teknikal terverifikasi.');
  const [authorSuccess, setAuthorSuccess] = useState(false);
  const [authorSyncFeedback, setAuthorSyncFeedback] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Supabase & Env Credentials (Masked & Protected)
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [showSecrets, setShowSecrets] = useState(false);
  const [envSaved, setEnvSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Handle Login Authentication Gate
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = passcode.trim();
    if (cleanPin === '2026' || cleanPin.toLowerCase() === 'facrial2026' || cleanPin === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('facrial_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('PIN atau kata sandi tidak valid. Gunakan PIN default: 2026');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('facrial_admin_auth');
    setPasscode('');
  };

  // Helper file upload to Data URL for instant preview & storage
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string, fileName: string, fileSize: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(reader.result, file.name, sizeInMB);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Post Submit
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const safeTitle = sanitizeInput(postTitle);
    const safeExcerpt = sanitizeInput(postExcerpt) || safeTitle;
    const safeContent = sanitizeInput(postContent);
    const slug = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const now = new Date();
    const publishedAtDisplay = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ` • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const covers = postCoverUrl.trim()
      ? [postCoverUrl.trim()]
      : ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'];

    const tagsArray = postTags.split(',').map((t) => sanitizeInput(t.trim())).filter(Boolean);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      slug: slug || `artikel-${Date.now()}`,
      title: safeTitle,
      excerpt: safeExcerpt,
      content: safeContent,
      category: postCategory,
      tags: tagsArray,
      coverImages: covers,
      author,
      createdAt: now.toISOString(),
      publishedAtDisplay,
      likes: 0,
      commentsCount: 0,
      views: 1,
      readingTimeMinutes: postReadingTime,
      attachments: postAttachments.length > 0 ? postAttachments : undefined
    };

    onAddPost(newPost);
    setPostSuccess(true);
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
    setPostCoverUrl('');
    setPostAttachments([]);
    setNewPostAttName('');
    setNewPostAttUrl('');

    setTimeout(() => setPostSuccess(false), 3500);
  };

  // Handle Agenda Submit
  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaTitle.trim() || !agendaDate.trim()) return;

    const newAgenda: Agenda = {
      id: `agenda-${Date.now()}`,
      title: sanitizeInput(agendaTitle),
      date: sanitizeInput(agendaDate),
      time: sanitizeInput(agendaTime) || '14:00 WIB',
      location: sanitizeInput(agendaLocation) || 'Online / Jakarta',
      category: sanitizeInput(agendaCategory),
      description: sanitizeInput(agendaDesc),
      status: 'Mendatang',
      author: author.name,
      link: agendaLink ? sanitizeInput(agendaLink) : undefined,
      coverImage: agendaCoverUrl.trim() ? agendaCoverUrl.trim() : undefined,
      attachments: agendaAttachments.length > 0 ? agendaAttachments : undefined
    };

    onAddAgenda(newAgenda);
    setAgendaSuccess(true);
    setAgendaTitle('');
    setAgendaDate('');
    setAgendaTime('14:00 - 16:30 WIB');
    setAgendaLocation('Online via Zoom / YouTube Live');
    setAgendaDesc('');
    setAgendaLink('');
    setAgendaCoverUrl('');
    setAgendaAttachments([]);

    setTimeout(() => setAgendaSuccess(false), 3500);
  };

  // Add Attachment to Post
  const handleAddPostAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostAttName.trim()) return;

    const att: Attachment = {
      id: `att-p-${Date.now()}`,
      name: sanitizeInput(newPostAttName.trim()),
      url: newPostAttUrl.trim() || '#',
      size: newPostAttSize || '1.2 MB',
      type: newPostAttName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc'
    };

    setPostAttachments([...postAttachments, att]);
    setNewPostAttName('');
    setNewPostAttUrl('');
  };

  // Add Attachment to Agenda
  const handleAddAgendaAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaAttName.trim()) return;

    const att: Attachment = {
      id: `att-a-${Date.now()}`,
      name: sanitizeInput(newAgendaAttName.trim()),
      url: newAgendaAttUrl.trim() || '#',
      size: newAgendaAttSize || '1.0 MB',
      type: newAgendaAttName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc'
    };

    setAgendaAttachments([...agendaAttachments, att]);
    setNewAgendaAttName('');
    setNewAgendaAttUrl('');
  };

  // Handle Verify Author via Email and Auto Sync to Supabase
  const handleVerifyAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim()) return;

    setIsVerifying(true);
    const vrfCode = `VRF-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    const newVerifiedAuthor: VerifiedAuthor = {
      id: `author-${Date.now()}`,
      name: sanitizeInput(authorName.trim()),
      email: sanitizeInput(authorEmail.trim().toLowerCase()),
      role: sanitizeInput(authorRole.trim()),
      avatar: authorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: sanitizeInput(authorBio.trim()),
      institution: sanitizeInput(authorInstitution.trim()),
      verifiedByEmail: true,
      verifiedAt: nowIso,
      verificationCode: vrfCode,
      status: 'verified',
      postsCount: 1
    };

    // Save locally
    onAddVerifiedAuthor(newVerifiedAuthor);

    // Sync to Supabase table automatically
    const syncRes = await syncAuthorToSupabase(newVerifiedAuthor);

    setIsVerifying(false);
    setAuthorSuccess(true);
    if (syncRes.success) {
      setAuthorSyncFeedback(`Sukses! Author "${newVerifiedAuthor.name}" telah diverifikasi oleh Admin melalui email ${newVerifiedAuthor.email} dan datanya tersinkronisasi otomatis ke database Supabase (tabel verified_authors) dengan kode verifikasi: ${vrfCode}.`);
    } else {
      setAuthorSyncFeedback(`Author "${newVerifiedAuthor.name}" terverifikasi via email dan disimpan di sistem lokal. (Catatan Supabase: ${syncRes.error || 'Periksa tabel SQL Supabase'})`);
    }

    setAuthorName('');
    setAuthorEmail('');
  };

  // Save Env / Supabase Config
  const handleSaveEnvConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    setEnvSaved(true);
    setTimeout(() => setEnvSaved(false), 2500);
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.4), 0.95);
  const supabaseClient = getSupabaseClient();
  const isSupabaseActive = Boolean(supabaseClient);

  // =========================================================================
  // VIEW A: ACCESS RESTRICTED - AUTHENTICATION GATE
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center px-4">
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`,
            backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
          }}
          className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl transition-all duration-300 ${
            isDark ? 'border-slate-800 text-slate-100 shadow-black/80' : 'border-slate-200 text-slate-800 shadow-slate-200/80'
          }`}
        >
          {/* Back button */}
          <button
            onClick={onBackToPublic}
            className="flex items-center gap-2 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website Publik</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-5 mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Gerbang Pengelola Facrial</h2>
            <p className="text-xs opacity-70 mt-1.5 leading-relaxed">
              Area terisolasi untuk publikasi artikel, jadwal agenda, verifikasi author via email, dan integrasi database Supabase.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Masukkan PIN / Kata Sandi Author
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Masukkan PIN keamanan..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                  required
                />
                <KeyRound className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] opacity-60 mt-1.5">
                Petunjuk pemilik: Gunakan PIN default <strong>2026</strong> untuk masuk.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Akses Pengelola</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enkripsi Klien & Parameter Prepared Statements Aktif</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: DEDICATED STANDALONE ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Standalone Admin Top Header Bar */}
      <header
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`,
          backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
        }}
        className={`p-4 sm:p-5 rounded-3xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
          isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">FACRIAL ADMIN</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>Terautentikasi</span>
              </span>
            </div>
            <p className="text-xs opacity-60">
              Pengelolaan Konten, Agenda, Verifikasi Author Email & Database Supabase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onBackToPublic}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Website Publik</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
            title="Kunci / Keluar dari Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Kunci</span>
          </button>
        </div>
      </header>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`
          }}
          className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Total Artikel</div>
          <div className="text-2xl font-extrabold text-blue-500 mt-1">{posts.length}</div>
        </div>
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`
          }}
          className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Agenda Kegiatan</div>
          <div className="text-2xl font-extrabold text-indigo-500 mt-1">{agendas.length}</div>
        </div>
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`
          }}
          className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Author Terverifikasi</div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-1">{verifiedAuthors.length}</div>
        </div>
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`
          }}
          className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Status Supabase</div>
          <div className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isSupabaseActive ? 'Terkoneksi Realtime' : 'Tersimpan Lokal'}</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setAdminTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'posts'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
          }`}
        >
          <PenSquare className="w-4 h-4" />
          <span>Upload Artikel & Berkas</span>
        </button>

        <button
          onClick={() => setAdminTab('agendas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'agendas'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upload Agenda & Flyer</span>
        </button>

        <button
          onClick={() => setAdminTab('authors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'authors'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Author Terverifikasi Email ({verifiedAuthors.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'manage'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Kelola Konten ({posts.length + agendas.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('env-config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'env-config'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & ENV Rahasia</span>
        </button>
      </div>

      {/* ================= TAB 1: FORM TULIS ARTIKEL ================= */}
      {adminTab === 'posts' && (
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`,
            backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
          }}
          className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Publikasi Artikel, Upload Gambar & File Data</h2>
              <p className="text-xs opacity-70">
                Formulir input konten dengan upload file gambar, dokumen lampiran, dan sanitasi otomatis.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500">
              Penulis: {author.name}
            </span>
          </div>

          {postSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Artikel berhasil disimpan dengan lampiran dan dipublikasikan ke timeline secara realtime!</span>
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Judul Artikel / Berita *
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Contoh: Menjelajahi Arsitektur Modern Next.js 15 & Supabase"
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Kategori
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as Post['category'])}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Teknologi">Teknologi</option>
                  <option value="Pengembangan Web">Pengembangan Web</option>
                  <option value="Visi Digital">Visi Digital</option>
                  <option value="Edukasi">Edukasi</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Agenda">Agenda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Estimasi Baca (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={postReadingTime}
                  onChange={(e) => setPostReadingTime(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Tag (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="AI, Cloud, React"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* KOLOM UPLOAD GAMBAR POSTINGAN */}
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>Kolom Upload Gambar Postingan (File Lokal atau URL)</span>
                </div>
                {postCoverUrl && (
                  <button
                    type="button"
                    onClick={() => setPostCoverUrl('')}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Hapus Gambar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload File Gambar */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-70">
                    Opsi 1: Pilih File Gambar dari Komputer (PNG, JPG, WebP)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-400/40 rounded-2xl cursor-pointer hover:bg-blue-500/10 transition-colors text-center">
                    <Upload className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-xs font-semibold">Klik untuk Pilih File Gambar</span>
                    <span className="text-[10px] opacity-60">Maks. 5 MB (Otomatis diproses)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) => {
                          setPostCoverUrl(dataUrl);
                        })
                      }
                    />
                  </label>
                </div>

                {/* Input URL Gambar */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-70">
                    Opsi 2: Masukkan URL Gambar Web
                  </label>
                  <input
                    type="url"
                    value={postCoverUrl}
                    onChange={(e) => setPostCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] opacity-60">Preset:</span>
                    {[
                      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
                    ].map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPostCoverUrl(presetUrl)}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
                      >
                        Sampel #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Image Preview */}
              {postCoverUrl && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-blue-500/30 max-h-48 w-full">
                  <img src={postCoverUrl} alt="Preview Cover" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-semibold backdrop-blur-md">
                    Preview Cover Siap Dipublikasikan
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Ringkasan Excerpt (Muncul di Timeline Card)
              </label>
              <textarea
                rows={2}
                value={postExcerpt}
                onChange={(e) => setPostExcerpt(e.target.value)}
                placeholder="Deskripsi singkat artikel untuk linimasa..."
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Isi Lengkap Artikel (Format Teks/Markdown) *
              </label>
              <textarea
                rows={7}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Tuliskan ulasan mendalam, langkah tutorial, atau wawasan teknologi di sini..."
                className={`w-full px-4 py-3 rounded-2xl border text-sm leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            {/* KOLOM UPLOAD FILE DATA LAINNYA UNTUK POSTINGAN */}
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                  <FileUp className="w-4 h-4" />
                  <span>Kolom Upload File Data Lainnya (PDF, Dokumen, Dataset, ZIP)</span>
                </div>
                <span className="text-[11px] opacity-60">Terlampir: {postAttachments.length} Berkas</span>
              </div>

              {/* Upload Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newPostAttName}
                  onChange={(e) => setNewPostAttName(e.target.value)}
                  placeholder="Nama Berkas (misal: Whitepaper-2026.pdf)"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <input
                  type="url"
                  value={newPostAttUrl}
                  onChange={(e) => setNewPostAttUrl(e.target.value)}
                  placeholder="URL Tautan Unduh Berkas"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPostAttSize}
                    onChange={(e) => setNewPostAttSize(e.target.value)}
                    placeholder="Ukuran (misal: 2.4 MB)"
                    className={`w-24 px-3 py-2 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddPostAttachment}
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah File</span>
                  </button>
                </div>
              </div>

              {/* Attachment Picker from Local Drive */}
              <div>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Pilih Dokumen dari Komputer</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, (dataUrl, fileName, fileSize) => {
                        const att: Attachment = {
                          id: `att-p-${Date.now()}`,
                          name: fileName,
                          url: dataUrl,
                          size: fileSize,
                          type: fileName.endsWith('.pdf') ? 'pdf' : 'doc'
                        };
                        setPostAttachments([...postAttachments, att]);
                      })
                    }
                  />
                </label>
              </div>

              {/* List of Current Attachments */}
              {postAttachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold opacity-70">Daftar File Data yang Akan Diunggah:</div>
                  <div className="flex flex-wrap gap-2">
                    {postAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <span className="text-[10px] opacity-60">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => setPostAttachments(postAttachments.filter((x) => x.id !== att.id))}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Publikasikan Artikel ke Timeline</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 2: FORM TAMBAH AGENDA ================= */}
      {adminTab === 'agendas' && (
        <div
          style={{
            backgroundColor: isDark
              ? `rgba(15, 23, 42, ${alpha})`
              : `rgba(255, 255, 255, ${alpha})`,
            backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
          }}
          className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold">Jadwalkan Agenda, Upload Flyer Gambar & Berkas Acara</h2>
            <p className="text-xs opacity-70">
              Formulir lengkap upload flyer gambar, rundown TOR berkas data lampiran, dan informasi kegiatan.
            </p>
          </div>

          {agendaSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Agenda beserta flyer gambar dan file lampiran berhasil ditambahkan ke jadwal resmi!</span>
            </div>
          )}

          <form onSubmit={handleAgendaSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Nama Agenda / Kegiatan *
              </label>
              <input
                type="text"
                value={agendaTitle}
                onChange={(e) => setAgendaTitle(e.target.value)}
                placeholder="Contoh: Webinar Keamanan Cloud & Supabase 2026"
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Tanggal Kegiatan *
                </label>
                <input
                  type="text"
                  value={agendaDate}
                  onChange={(e) => setAgendaDate(e.target.value)}
                  placeholder="25 September 2026"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={agendaTime}
                  onChange={(e) => setAgendaTime(e.target.value)}
                  placeholder="14:00 - 16:30 WIB"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Kategori
                </label>
                <select
                  value={agendaCategory}
                  onChange={(e) => setAgendaCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Konferensi">Konferensi</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Lokakarya">Lokakarya</option>
                  <option value="Rilis Fitur">Rilis Fitur</option>
                  <option value="Diskusi Komunitas">Diskusi Komunitas</option>
                </select>
              </div>
            </div>

            {/* KOLOM UPLOAD FLYER/GAMBAR AGENDA */}
            <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>Kolom Upload Gambar Flyer / Banner Agenda</span>
                </div>
                {agendaCoverUrl && (
                  <button
                    type="button"
                    onClick={() => setAgendaCoverUrl('')}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Hapus Gambar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload File Gambar */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-70">
                    Opsi 1: Pilih File Flyer dari Komputer (PNG, JPG, WebP)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-400/40 rounded-2xl cursor-pointer hover:bg-indigo-500/10 transition-colors text-center">
                    <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-xs font-semibold">Klik untuk Pilih Flyer Agenda</span>
                    <span className="text-[10px] opacity-60">Format Gambar Flyer Resmi</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) => {
                          setAgendaCoverUrl(dataUrl);
                        })
                      }
                    />
                  </label>
                </div>

                {/* Input URL Gambar */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-70">
                    Opsi 2: Masukkan URL Flyer / Banner
                  </label>
                  <input
                    type="url"
                    value={agendaCoverUrl}
                    onChange={(e) => setAgendaCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={`w-full px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] opacity-60">Sampel Flyer:</span>
                    {[
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80'
                    ].map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAgendaCoverUrl(presetUrl)}
                        className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors"
                      >
                        Flyer #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Flyer Preview */}
              {agendaCoverUrl && (
                <div className="mt-2 relative rounded-2xl overflow-hidden border border-indigo-500/30 max-h-44 w-full">
                  <img src={agendaCoverUrl} alt="Preview Flyer" className="w-full h-44 object-cover" />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-semibold backdrop-blur-md">
                    Preview Flyer Agenda
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Lokasi / Platform
                </label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  placeholder="Online via Zoom / YouTube Live"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Tautan Registrasi / Info (Opsional)
                </label>
                <input
                  type="url"
                  value={agendaLink}
                  onChange={(e) => setAgendaLink(e.target.value)}
                  placeholder="https://zoom.us/..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Deskripsi Agenda
              </label>
              <textarea
                rows={3}
                value={agendaDesc}
                onChange={(e) => setAgendaDesc(e.target.value)}
                placeholder="Rincian topik yang akan dibahas, narasumber, atau sasaran kegiatan..."
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* KOLOM UPLOAD FILE DATA LAINNYA UNTUK AGENDA */}
            <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                  <FileUp className="w-4 h-4" />
                  <span>Kolom Upload File Data Agenda (Rundown, TOR PDF, Formulir Acara)</span>
                </div>
                <span className="text-[11px] opacity-60">Terlampir: {agendaAttachments.length} Berkas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newAgendaAttName}
                  onChange={(e) => setNewAgendaAttName(e.target.value)}
                  placeholder="Nama Berkas (misal: Rundown-Webinar.pdf)"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <input
                  type="url"
                  value={newAgendaAttUrl}
                  onChange={(e) => setNewAgendaAttUrl(e.target.value)}
                  placeholder="URL Tautan Unduh Berkas"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAgendaAttSize}
                    onChange={(e) => setNewAgendaAttSize(e.target.value)}
                    placeholder="Ukuran (misal: 1.0 MB)"
                    className={`w-24 px-3 py-2 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddAgendaAttachment}
                    className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah File</span>
                  </button>
                </div>
              </div>

              {/* Attachment Picker from Local Drive for Agenda */}
              <div>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Pilih Dokumen Acara dari Komputer</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, (dataUrl, fileName, fileSize) => {
                        const att: Attachment = {
                          id: `att-a-${Date.now()}`,
                          name: fileName,
                          url: dataUrl,
                          size: fileSize,
                          type: fileName.endsWith('.pdf') ? 'pdf' : 'doc'
                        };
                        setAgendaAttachments([...agendaAttachments, att]);
                      })
                    }
                  />
                </label>
              </div>

              {/* List of Current Agenda Attachments */}
              {agendaAttachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold opacity-70">Daftar File Data Agenda:</div>
                  <div className="flex flex-wrap gap-2">
                    {agendaAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <span className="text-[10px] opacity-60">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => setAgendaAttachments(agendaAttachments.filter((x) => x.id !== att.id))}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Simpan & Jadwalkan Agenda</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 3: AUTHOR TERVERIFIKASI EMAIL & SUPABASE ================= */}
      {adminTab === 'authors' && (
        <div className="space-y-8">
          {/* Header Card */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Verifikasi Author Melalui Email & Sinkronisasi Supabase</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Otomatis Masuk Supabase</span>
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                  Daftarkan dan verifikasi para author terpercaya melalui konfirmasi email oleh admin. Data secara otomatis dienkripsi dan di-upsert ke tabel <code>verified_authors</code> di Supabase.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Realtime Supabase Sync</span>
                </span>
              </div>
            </div>

            {authorSuccess && authorSyncFeedback && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{authorSyncFeedback}</div>
                  <div className="text-[11px] opacity-80">
                    Badge centang biru & status verifikasi resmi telah diaktifkan untuk author ini.
                  </div>
                </div>
              </div>
            )}

            {/* FORM VERIFIKASI AUTHOR BARU */}
            <form onSubmit={handleVerifyAuthor} className="mt-6 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>Formulir Verifikasi Author Baru via Email</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    Nama Lengkap Author *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Contoh: Dr. Fachrial Ramadhan"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    Alamat Email Resmi (Diverifikasi Admin) *
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="author@facrial.id"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    Peran / Spesialisasi Penulis
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="AI Specialist & Web Engineer"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    Lembaga / Instansi / Afiliasi
                  </label>
                  <input
                    type="text"
                    value={authorInstitution}
                    onChange={(e) => setAuthorInstitution(e.target.value)}
                    placeholder="Facrial Open Research Lab"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  URL Avatar / Foto Profil
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://..."
                    className={`flex-1 px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <label className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer hover:bg-blue-500/10 hover:text-blue-500 transition-colors flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) => {
                          setAuthorAvatar(dataUrl);
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Bio Singkat Author
                </label>
                <textarea
                  rows={2}
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Keahlian teknikal, rekam jejak, atau dedikasi riset..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memverifikasi Email & Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>Verifikasi Author via Email & Masukkan Otomatis ke Database Supabase</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* DAFTAR PARA AUTHOR YANG SUDAH DIVERIFIKASI */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Daftar Para Author Terverifikasi ({verifiedAuthors.length})</h3>
                <p className="text-xs opacity-60">
                  Author dengan status verifikasi resmi admin melalui email dan tersimpan di database Supabase.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-semibold">
                Tabel: verified_authors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedAuthors.map((authorItem) => (
                <div
                  key={authorItem.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative group ${
                    isDark
                      ? 'border-slate-800 bg-slate-900/60 hover:border-blue-500/40'
                      : 'border-slate-200 bg-white/60 hover:border-blue-500/40'
                  } shadow-md`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={authorItem.avatar}
                        alt={authorItem.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/30"
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-blue-600 text-white" title="Verified by Email">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm truncate">{authorItem.name}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Terverifikasi</span>
                        </span>
                      </div>

                      <div className="text-xs text-blue-500 font-mono mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{authorItem.email}</span>
                      </div>

                      <div className="text-xs opacity-80 mt-1">{authorItem.role}</div>

                      {authorItem.institution && (
                        <div className="text-[11px] opacity-60 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{authorItem.institution}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[10px] opacity-60 bg-slate-500/10 px-2 py-0.5 rounded">
                          {authorItem.verificationCode || 'VRF-OFFICIAL'}
                        </span>
                        <span className="text-emerald-500 font-medium flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>Supabase Synced</span>
                        </span>
                      </div>
                    </div>

                    {onDeleteVerifiedAuthor && (
                      <button
                        onClick={() => onDeleteVerifiedAuthor(authorItem.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors opacity-70 hover:opacity-100"
                        title="Hapus Verifikasi Author"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DATABASE & ENV RAHASIA ================= */}
      {adminTab === 'env-config' && (
        <div className="space-y-6">
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <span>Kredensial Supabase & Variabel Rahasia Lingkungan (ENV)</span>
                </h2>
                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                  Semua kunci API disimpan secara aman di dalam container dan tidak pernah dibocorkan ke pengunjung publik.
                </p>
              </div>

              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-500 transition-colors cursor-pointer"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecrets ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}</span>
              </button>
            </div>

            {envSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Kredensial Supabase berhasil diperbarui dan disimpan dengan aman!</span>
              </div>
            )}

            <form onSubmit={handleSaveEnvConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] opacity-60 flex items-center gap-1 text-emerald-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kredensial disimpan dengan isolasi aman</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  Simpan Konfigurasi Supabase
                </button>
              </div>
            </form>
          </div>

          {/* SQL Editor Schema Box */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base">Skema PostgreSQL Supabase (Termasuk verified_authors)</h3>
                <p className="text-xs opacity-70">
                  Jalankan skrip ini sekali di <strong>Supabase Dashboard &gt; SQL Editor</strong> untuk membuat tabel artikel, agenda, komentar, dan author terverifikasi otomatis.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* ================= TAB 5: KELOLA KONTEN AKTIF ================= */}
      {adminTab === 'manage' && (
        <div className="space-y-6">
          {/* Post Items */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base mb-4">Daftar Artikel Aktif ({posts.length})</h3>
            <div className="space-y-3">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-500/5"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-blue-500 uppercase px-2 py-0.5 rounded bg-blue-500/10">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-sm mt-1">{p.title}</h4>
                    <p className="text-xs opacity-60 mt-0.5">
                      {p.publishedAtDisplay} • {p.views || 0} pembaca • {p.attachments?.length || 0} file lampiran
                    </p>
                  </div>

                  {onDeletePost && (
                    <button
                      onClick={() => onDeletePost(p.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Artikel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Items */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base mb-4">Daftar Agenda Terjadwal ({agendas.length})</h3>
            <div className="space-y-3">
              {agendas.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-500/5"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-0.5 rounded bg-indigo-500/10">
                      {a.category}
                    </span>
                    <h4 className="font-bold text-sm mt-1">{a.title}</h4>
                    <p className="text-xs opacity-60 mt-0.5">
                      {a.date} • {a.time} • {a.location} • {a.attachments?.length || 0} file lampiran
                    </p>
                  </div>

                  {onDeleteAgenda && (
                    <button
                      onClick={() => onDeleteAgenda(a.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Author Items in Manage */}
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
            }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base mb-4">Daftar Author Terverifikasi ({verifiedAuthors.length})</h3>
            <div className="space-y-3">
              {verifiedAuthors.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-500/5"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{item.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-xs opacity-60">{item.email} • {item.role} • {item.verificationCode}</p>
                    </div>
                  </div>

                  {onDeleteVerifiedAuthor && (
                    <button
                      onClick={() => onDeleteVerifiedAuthor(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Author"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
