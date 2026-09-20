import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  Bookmark,
  MessageSquare,
  Send,
  User,
  CheckCircle,
  FileText,
  MapPin,
  Tag,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { Post, Comment, ThemeConfig } from '../../../types';
import { sanitizeText, detectXSS } from '../../../lib/security';
import {
  supabase,
  incrementPostLove,
  incrementPostView,
  getCommentsForPost,
  saveComment,
} from '../../../lib/supabase';
import { addNotification } from '../../../lib/notifications';
import { ImageSlider } from '../../../components/ImageSlider';
import { DocumentAttachmentViewer } from '../../../components/DocumentAttachmentViewer';

interface BlogDetailPageProps {
  post?: Post | null;
  allPosts?: Post[];
  themeConfig?: any;
  onBack?: () => void;
  onSelectPost?: (slug: string) => void;
  onSelectAuthor?: () => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  post,
  allPosts = [],
  themeConfig,
  onBack = () => {},
  onSelectPost = () => {},
  onSelectAuthor = () => {},
}) => {
  // Guard jika post belum tersedia atau null
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 animate-in fade-in duration-300">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Artikel Tidak Ditemukan atau Sedang Dimuat
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Data artikel linimasa belum dapat diakses atau sedang disinkronkan.
        </p>
        <button
          id="btn-back-fallback"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa</span>
        </button>
      </div>
    );
  }

  // Proteksi array gambar untuk slider
  const allImages =
    post.images && Array.isArray(post.images) && post.images.length > 0
      ? post.images.filter(Boolean)
      : post.coverImage
      ? [post.coverImage]
      : [];

  // Loves & Views Real-time
  const [loves, setLoves] = useState(post.loves ?? post.likes ?? 0);
  const [hasLoved, setHasLoved] = useState(false);
  const [views, setViews] = useState(post.views || 1);

  // Increment views dengan penanganan Promise yang aman
  React.useEffect(() => {
    let isMounted = true;
    if (post?.id) {
      try {
        Promise.resolve(incrementPostView(post.id))
          .then((newViews) => {
            if (isMounted && typeof newViews === 'number') {
              setViews(newViews);
            }
          })
          .catch((err) => {
            console.warn('Gagal menambah tayangan artikel:', err);
          });
      } catch (err) {
        console.warn('Error saat memanggil incrementPostView:', err);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [post?.id]);

  // State Comments dengan jaminan Array (Mencegah "comments.map is not a function")
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const initial = post?.id ? getCommentsForPost(post.id) : [];
      return Array.isArray(initial) ? initial : [];
    } catch {
      return [];
    }
  });

  // Sinkronisasi komentar jika post berganti
  React.useEffect(() => {
    if (!post?.id) return;
    try {
      const result = getCommentsForPost(post.id);
      if (result instanceof Promise) {
        result.then((data) => {
          if (Array.isArray(data)) setComments(data);
        }).catch(console.warn);
      } else if (Array.isArray(result)) {
        setComments(result);
      }
    } catch (err) {
      console.warn('Gagal memuat komentar:', err);
    }
  }, [post?.id]);

  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);

  // Handle Love (Real-time in Supabase)
  const handleLove = async () => {
    if (hasLoved || !post?.id) return;
    try {
      const newLoves = await incrementPostLove(post.id);
      setLoves(typeof newLoves === 'number' ? newLoves : loves + 1);
      setHasLoved(true);
    } catch (err) {
      console.warn('Gagal memperbarui love:', err);
      setLoves((prev) => prev + 1);
      setHasLoved(true);
    }
  };

  // Handle Share dengan fallback salin iframe
  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        throw new Error('Clipboard API tidak tersedia');
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (copyErr) {
        console.warn('Gagal menyalin tautan:', copyErr);
      }
    }
  };

  // Handle Submit Comment with Anti-XSS Protection & Blocker
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockedError(null);
    setCommentSuccess(null);

    if (!commentContent.trim() || !commentName.trim()) return;

    // DETEKSI KETAT SERANGAN XSS: JIKA TERDETEKSI MAKA LANGSUNG DIBLOKIR
    const checkName = detectXSS(commentName);
    const checkContent = detectXSS(commentContent);

    if (checkName.isMalicious || checkContent.isMalicious) {
      const reason = checkName.isMalicious ? checkName.reason : checkContent.reason;
      setBlockedError(
        reason ||
          '⚠️ SERANGAN XSS TERDETEKSI: Nama atau ulasan Anda mengandung script berbahaya dan DIBLOKIR otomatis oleh sistem keamanan Facrial.'
      );
      return;
    }

    setIsSubmittingComment(true);

    try {
      const cleanName = sanitizeText(commentName.trim());
      const cleanContent = sanitizeText(commentContent.trim());

      const newComment: Comment = {
        id: 'comment-' + Date.now(),
        postId: post.id,
        authorName: cleanName,
        content: cleanContent,
        createdAt: 'Baru saja',
        likes: 0,
      };

      // Simpan komentar dengan aman
      const updated = await Promise.resolve(saveComment(newComment));
      if (Array.isArray(updated)) {
        setComments(updated);
      } else {
        setComments((prev) => [newComment, ...(Array.isArray(prev) ? prev : [])]);
      }

      // Notifikasi real-time
      try {
        await addNotification({
          type: 'comment',
          title: 'Komentar Baru',
          message: `${cleanName} berkomentar pada "${post.title || 'Artikel'}": "${cleanContent.slice(0, 75)}..."`,
          authorName: cleanName,
          postSlug: post.slug,
          postId: post.id,
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        });
      } catch (notifErr) {
        console.warn('Gagal menambahkan notifikasi:', notifErr);
      }

      setCommentContent('');
      setCommentName('');
      setCommentSuccess('Komentar Anda telah terverifikasi aman dan berhasil diterbitkan!');
      setTimeout(() => setCommentSuccess(null), 4000);
    } catch (err) {
      console.error('Terjadi kesalahan saat mengirim komentar:', err);
      setBlockedError('Gagal memproses komentar. Silakan coba kembali.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Postingan terkait dengan array null-safety
  const relatedPosts = Array.isArray(allPosts)
    ? allPosts
        .filter((p) => p && p.id !== post.id && p.category === post.category)
        .slice(0, 3)
    : [];

  const safeTags = Array.isArray(post.tags) ? post.tags : [];
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Bar: Back to Timeline */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="btn-back-to-timeline"
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa Timeline</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-share-article"
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative border border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Bagikan Tautan"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bagikan</span>
            {copiedLink && (
              <span className="absolute -top-7 right-0 px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded shadow-md animate-in fade-in">
                Tersalin!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ARTICLE CONTAINER */}
      <article
        id={`article-detail-${post.slug || post.id}`}
        className={`rounded-3xl border shadow-xl overflow-hidden transition-colors duration-300 ${
          themeConfig?.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header Metadata */}
        <div className="p-6 sm:p-8 pb-4 space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {post.category || 'Berita Utama'}
            </span>
            {post.isAgenda && (
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Agenda Kegiatan Resmi
              </span>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {post.readTime || '3 menit baca'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Format Hari, Tanggal, Jam WIB & Author Information */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
            <div
              id="author-info-trigger"
              onClick={onSelectAuthor}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={
                  post.author?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={post.author?.name || 'Penulis'}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {post.author?.name || 'Redaksi Investigasi'}
                  </span>
                  {post.author?.verified && (
                    <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {post.author?.role || 'Jurnalis Investigasi & Advokasi Hukum'}
                </span>
              </div>
            </div>

            {/* Time Stamp */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {post.dayName ? `${post.dayName}, ` : ''}
                {post.formattedDate || 'Hari ini'}
              </span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{post.time || '10:00 WIB'}</span>
            </div>
          </div>
        </div>

        {/* IMAGE SLIDER */}
        <div className="p-4 sm:p-6 pb-0">
          <ImageSlider images={allImages} alt={post.title} />
        </div>

        {/* Khusus Agenda: Detail Pelaksanaan */}
        {post.isAgenda && post.agenda && (
          <div className="mx-6 sm:mx-8 mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rincian Pelaksanaan Agenda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Waktu:</span>
                <span>
                  {post.agenda.eventDate || 'Akan diumumkan'} ({post.agenda.eventTime || 'WIB'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lokasi:</span>
                <span>{post.agenda.location || 'Lokasi Terbuka'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {post.agenda.status || 'Terbuka'}
                </span>
              </div>
              {post.agenda.registrationUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={post.agenda.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tautan Pendaftaran Resmi &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ISI ARTIKEL LENGKAP */}
        <div className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
          {post.excerpt && (
            <p className="font-semibold text-base sm:text-lg text-slate-800 dark:text-slate-100 border-l-4 border-blue-500 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          <div className="whitespace-pre-line space-y-4">
            {post.content}
          </div>

          {/* Tags */}
          {safeTags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-slate-500">Tagar:</span>
              {safeTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Lampiran Dokumen Otentik & Berkas Arsip PDF (Line 457 telah diperbaiki dengan `themeConfig as any`) */}
          {post.attachments && Array.isArray(post.attachments) && post.attachments.length > 0 && (
            <DocumentAttachmentViewer
              attachments={post.attachments}
              themeConfig={themeConfig as any}
              postTitle={post.title}
            />
          )}
        </div>

        {/* Reaction Bar & Stats */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-love-article"
            type="button"
            onClick={handleLove}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              hasLoved
                ? 'bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
            title="Beri Love pada Artikel Ini"
          >
            <Heart
              className={`w-4 h-4 ${
                hasLoved ? 'fill-white text-white' : 'fill-rose-500 text-rose-500 animate-pulse'
              }`}
            />
            <span>{hasLoved ? 'Dicintai (Loved)' : 'Beri Love'} ({loves})</span>
          </button>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{views} Dilihat Realtime</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>{safeComments.length} Komentar Realtime</span>
            </span>
          </div>
        </div>
      </article>

      {/* SEKSI KOMENTAR */}
      <section
        id="comments-section"
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
          themeConfig?.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              Komentar & Diskusi ({safeComments.length})
            </h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Proteksi Anti-XSS Aktif
          </span>
        </div>

        {/* Peringatan Serangan XSS yang Diblokir Otomatis */}
        {blockedError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold text-sm">Upaya Serangan Skrip XSS Diblokir!</strong>
              <p className="leading-relaxed">{blockedError}</p>
              <p className="text-[11px] text-red-500/80">
                Komentar tidak ditampilkan ke publik untuk menjaga keamanan sistem redaksi.
              </p>
            </div>
          </div>
        )}

        {/* Status Sukses */}
        {commentSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{commentSuccess}</span>
          </div>
        )}

        {/* Form Tulis Komentar */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="input-comment-name"
              type="text"
              required
              value={commentName}
              onChange={(e) => {
                setCommentName(e.target.value);
                if (blockedError) setBlockedError(null);
              }}
              placeholder="Nama lengkap Anda (Terproteksi Anti-XSS)"
              className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig?.mode === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
          <textarea
            id="input-comment-content"
            required
            rows={3}
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
              if (blockedError) setBlockedError(null);
            }}
            placeholder="Tulis ulasan, tanggapan hukum atau pertanyaan seputar topik ini..."
            className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              themeConfig?.mode === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
          <div className="flex justify-end">
            <button
              id="btn-submit-comment"
              type="submit"
              disabled={isSubmittingComment}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? 'Memverifikasi...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>

        {/* List Komentar */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {safeComments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              Belum ada komentar pada artikel ini. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            safeComments.map((c) => {
              const safeAuthorName = c?.authorName || 'Pengguna';
              const initialLetter = (safeAuthorName.charAt(0) || 'U').toUpperCase();
              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {initialLetter}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {safeAuthorName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.createdAt || 'Baru saja'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-8">
                    {c.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ARTIKEL TERKAIT */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Postingan Terkait Kategori {post.category || 'Terkait'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                id={`related-post-${rel.slug}`}
                onClick={() => onSelectPost(rel.slug)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 cursor-pointer transition-all group"
              >
                <img
                  src={
                    rel.coverImage ||
                    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={rel.title}
                  className="w-full h-28 rounded-xl object-cover mb-2.5"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-semibold text-blue-500">{rel.formattedDate}</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-500 mt-1">
                  {rel.title}
                </h4>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetailPage;