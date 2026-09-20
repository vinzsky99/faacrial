import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  Edit3,
  Eye,
  Heart,
  MessageSquare,
  Lock,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Post, ThemeConfig, VerifiedAuthor, Attachment } from '../../types';
import {
  checkAuthorVerification,
  getVerifiedAuthors,
  insertPost,
  getAllPostsForAdmin,
  updateAuthorProfile
} from '../../lib/supabase';
import { createSafeSlug, sanitizeText } from '../../lib/security';

interface AuthorPortalPageProps {
  themeConfig: ThemeConfig;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onNavigateToBecomeAuthor: () => void;
}

export const AuthorPortalPage: React.FC<AuthorPortalPageProps> = ({
  themeConfig,
  onBack,
  onSelectPost,
  onNavigateToBecomeAuthor,
}) => {
  const [authorEmail, setAuthorEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('facrial_author_session') || '';
    }
    return '';
  });
  const [currentAuthor, setCurrentAuthor] = useState<VerifiedAuthor | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portal tabs: 'write' | 'my-posts' | 'profile'
  const [activeTab, setActiveTab] = useState<'write' | 'my-posts' | 'profile'>('write');

  // Posts created by this author
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Form State for Writing Post/Agenda
  const [isAgenda, setIsAgenda] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Post['category']>('Hukum & Politik');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
  );
  const [tagsString, setTagsString] = useState('Hukum, Reformasi1998, Sejarah');
  const [agendaDate, setAgendaDate] = useState('2026-10-20');
  const [agendaTime, setAgendaTime] = useState('09:00 - 12:00 WIB');
  const [agendaLocation, setAgendaLocation] = useState('Auditorium Fakultas Hukum & Daring');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Profile Edit State
  const [editBio, setEditBio] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Check login on mount
  useEffect(() => {
    if (authorEmail) {
      validateAndLoadAuthor(authorEmail);
    }
  }, [authorEmail]);

  const validateAndLoadAuthor = async (email: string) => {
    setIsVerifying(true);
    setLoginError(null);
    try {
      const verified = await checkAuthorVerification(email);
      if (verified) {
        setCurrentAuthor(verified);
        setEditBio(verified.bio || '');
        setEditWorkplace(verified.workplace || '');
        setEditAvatar(verified.avatar || '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('facrial_author_session', email);
        }
        loadMyPosts(verified.email);
      } else {
        setCurrentAuthor(null);
        setLoginError('Email ini belum terverifikasi sebagai Author resmi. Silakan ajukan pendaftaran di menu Gabung Author.');
      }
    } catch {
      setLoginError('Gagal memverifikasi author. Silakan coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadMyPosts = async (authorEmailToFilter: string) => {
    setIsLoadingPosts(true);
    try {
      const all = await getAllPostsForAdmin();
      const filtered = all.filter(
        (p) =>
          p.author?.email?.toLowerCase() === authorEmailToFilter.toLowerCase() ||
          p.author?.name === currentAuthor?.name
      );
      setMyPosts(filtered);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorEmail.trim()) return;
    validateAndLoadAuthor(authorEmail.trim());
  };

  const handleLogout = () => {
    setCurrentAuthor(null);
    setAuthorEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('facrial_author_session');
    }
  };

  // Quick Demo Login
  const handleQuickLogin = (email: string) => {
    setAuthorEmail(email);
    validateAndLoadAuthor(email);
  };

  // Submit Article/Agenda (sent as 'pending_approval')
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAuthor) return;
    setSubmitFeedback(null);

    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      setSubmitFeedback({
        success: false,
        msg: 'Harap isi Judul, Ringkasan, dan Konten tulisan.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = createSafeSlug(title);
      const newPost: Post = {
        id: 'post-auth-' + Date.now(),
        slug: `${slug}-${Math.floor(Math.random() * 899 + 100)}`,
        title: sanitizeText(title.trim()),
        content: content.trim(),
        excerpt: sanitizeText(excerpt.trim()),
        category,
        coverImage: coverImageUrl,
        images: [coverImageUrl],
        date: new Date().toISOString(),
        dayName: 'Sabtu',
        formattedDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        author: {
          id: currentAuthor.id,
          name: currentAuthor.name,
          role: currentAuthor.role,
          avatar: currentAuthor.avatar,
          bio: currentAuthor.bio || '',
          email: currentAuthor.email,
        },
        readTime: `${Math.max(2, Math.ceil(content.split(' ').length / 180))} mnt baca`,
        likes: 0,
        loves: 0,
        views: 0,
        commentsCount: 0,
        status: 'pending_approval', // Wajib persetujuan Admin!
        isAgenda,
        agenda: isAgenda
          ? {
              date: agendaDate,
              time: agendaTime,
              location: agendaLocation,
              status: 'Mendatang',
            }
          : undefined,
        attachments,
        tags: tagsString.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await insertPost(newPost, 'author');

      setSubmitFeedback({
        success: true,
        msg: '✅ Tulisan berhasil dikirim ke Redaksi! Saat ini berstatus "Menunggu Persetujuan Admin" sebelum tayang ke publik.',
      });

      // Reset form
      setTitle('');
      setContent('');
      setExcerpt('');
      loadMyPosts(currentAuthor.email);
    } catch {
      setSubmitFeedback({
        success: false,
        msg: 'Terjadi kesalahan saat menyimpan tulisan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAuthor) return;

    await updateAuthorProfile({
      id: currentAuthor.id,
      email: currentAuthor.email,
      bio: editBio,
      workplace: editWorkplace,
      avatar: editAvatar,
    });

    setCurrentAuthor((prev) => (prev ? { ...prev, bio: editBio, workplace: editWorkplace, avatar: editAvatar } : null));
    alert('Profil author berhasil diperbarui!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          id="btn-back-from-author"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda Publik
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Portal Khusus Author (/author)
          </span>
          {currentAuthor && (
            <button
              id="btn-author-logout"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          )}
        </div>
      </div>

      {!currentAuthor ? (
        /* LOGIN AUTHOR KHUSUS */
        <div className="max-w-md mx-auto py-12">
          <div
            className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
              themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                Login Portal Author
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Masukkan email terverifikasi Anda untuk mengelola artikel & agenda riset.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Author Terverifikasi
                </label>
                <input
                  id="author-login-email"
                  type="email"
                  required
                  placeholder="author@facrial.id"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                id="btn-login-author"
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi di Database...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Masuk ke Portal Author
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 text-center">
                Atau Masuk Cepat Sebagai Akun Author:
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="demo-author-1"
                  onClick={() => handleQuickLogin('fachrial.official2026@gmail.com')}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-all flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    F
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100">Fachrial, S.H., M.H.</div>
                    <div className="text-[10px] text-slate-400">fachrial.official2026@gmail.com</div>
                  </div>
                </button>

                <button
                  id="demo-author-2"
                  onClick={() => handleQuickLogin('redaksi.investigasi@facrial.id')}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-all flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    T
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100">Tim Advokasi & Riset HAM</div>
                    <div className="text-[10px] text-slate-400">redaksi.investigasi@facrial.id</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Belum terdaftar? */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Belum memiliki akun author? </span>
              <button
                id="btn-register-author-link"
                onClick={onNavigateToBecomeAuthor}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Daftar Menjadi Author di Sini
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHOR DASHBOARD SETELAH LOGIN */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Author Profile Card */}
          <div
            className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
              themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <img
                src={currentAuthor.avatar}
                alt={currentAuthor.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                    {currentAuthor.name}
                  </h2>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {currentAuthor.role}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>KTA: {currentAuthor.ktaNumber || 'RESMI-2026'}</span>
                  <span>•</span>
                  <span>{currentAuthor.workplace}</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="flex items-center gap-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl border border-blue-500/20 text-xs font-medium">
              <Clock className="w-4 h-4" />
              <span>Sistem Workflow: Postingan Author melalui Persetujuan Admin</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              id="tab-author-write"
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'write'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Tulis Artikel / Buat Agenda
            </button>
            <button
              id="tab-author-myposts"
              onClick={() => setActiveTab('my-posts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-posts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Tulisan Saya ({myPosts.length})
            </button>
            <button
              id="tab-author-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profil Author
            </button>
          </div>

          {/* TAB 1: FORM TULIS ARTIKEL / AGENDA */}
          {activeTab === 'write' && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Kirim Tulisan / Agenda untuk Persetujuan Redaksi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Karya Anda akan ditinjau oleh Admin Redaksi sebelum diterbitkan secara resmi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format:</span>
                  <button
                    id="author-toggle-format-post"
                    type="button"
                    onClick={() => setIsAgenda(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      !isAgenda ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Artikel Investigasi
                  </button>
                  <button
                    id="author-toggle-format-agenda"
                    type="button"
                    onClick={() => setIsAgenda(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      isAgenda ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Agenda Kegiatan
                  </button>
                </div>
              </div>

              {submitFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    submitFeedback.success
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {submitFeedback.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{submitFeedback.msg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitArticle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Tulisan / Agenda <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author-write-title"
                    type="text"
                    required
                    placeholder="Contoh: Rekonstruksi Yuridis Peristiwa Trisakti 12 Mei 1998"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kategori
                    </label>
                    <select
                      id="author-write-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Hukum & Politik">Hukum & Politik</option>
                      <option value="Reformasi 1998">Reformasi 1998</option>
                      <option value="Orde Baru">Orde Baru</option>
                      <option value="Tragedi & HAM">Tragedi & HAM</option>
                      <option value="Agenda">Agenda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      URL Cover Gambar
                    </label>
                    <input
                      id="author-write-cover"
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {isAgenda && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tanggal Agenda
                      </label>
                      <input
                        id="author-agenda-date"
                        type="date"
                        value={agendaDate}
                        onChange={(e) => setAgendaDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Waktu / Jam
                      </label>
                      <input
                        id="author-agenda-time"
                        type="text"
                        value={agendaTime}
                        onChange={(e) => setAgendaTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Lokasi / Link Daring
                      </label>
                      <input
                        id="author-agenda-loc"
                        type="text"
                        value={agendaLocation}
                        onChange={(e) => setAgendaLocation(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ringkasan Singkat (Excerpt) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="author-write-excerpt"
                    required
                    rows={2}
                    placeholder="Ringkasan 2-3 kalimat yang menggambarkan inti sari tulisan..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Isi Lengkap Tulisan (Mendukung Format Paragraf) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="author-write-content"
                    required
                    rows={8}
                    placeholder="Tuliskan analisis lengkap Anda di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Penulis: <strong className="text-slate-700 dark:text-slate-200">{currentAuthor.name}</strong>
                  </span>

                  <button
                    id="btn-submit-post-for-approval"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim ke Redaksi...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Kirim untuk Persetujuan Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: DAFTAR TULISAN SAYA */}
          {activeTab === 'my-posts' && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 ${
                themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Arsip & Status Tulisan Anda
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {myPosts.length} Tulisan Terdaftar
                </span>
              </div>

              {isLoadingPosts ? (
                <div className="py-12 text-center text-xs text-slate-500">Memuat data dari database...</div>
              ) : myPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <p>Anda belum memiliki tulisan.</p>
                  <button
                    id="btn-first-write"
                    onClick={() => setActiveTab('write')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Tulis artikel pertama Anda sekarang →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myPosts.map((post) => {
                    const status = post.status || 'approved';
                    return (
                      <div key={post.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            {status === 'approved' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Diterbitkan Resmi
                              </span>
                            )}
                            {status === 'pending_approval' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Menunggu Persetujuan Admin
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Ditolak / Perlu Revisi
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{post.formattedDate}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {post.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Statistik & Aksi */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {post.commentsCount || 0}
                          </span>
                          {status === 'approved' && (
                            <button
                              id={`view-post-${post.id}`}
                              onClick={() => onSelectPost(post.slug)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                            >
                              Lihat Publik
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFIL AUTHOR */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleUpdateProfile}
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 max-w-2xl ${
                themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-2">
                Edit Profil Publik Author
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Avatar (URL / Foto Baru)
                </label>
                <input
                  id="edit-author-avatar"
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institusi / Tempat Bekerja
                </label>
                <input
                  id="edit-author-workplace"
                  type="text"
                  value={editWorkplace}
                  onChange={(e) => setEditWorkplace(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografi Singkat & Fokus Riset
                </label>
                <textarea
                  id="edit-author-bio"
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                id="btn-save-author-profile"
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
              >
                Simpan Perubahan Profil
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
