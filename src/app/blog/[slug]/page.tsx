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
  AlertTriangle
} from 'lucide-react';
import { Post, Comment, ThemeConfig } from '../../../types';
import { sanitizeText, detectXSS } from '../../../lib/security';
import { supabase, incrementPostLike, getCommentsForPost, saveComment } from '../../../lib/supabase';
import { addNotification } from '../../../lib/notifications';
import { ImageSlider } from '../../../components/ImageSlider';
import { DocumentAttachmentViewer } from '../../../components/DocumentAttachmentViewer';

interface BlogDetailPageProps {
  post: Post;
  allPosts: Post[];
  themeConfig: ThemeConfig;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onSelectAuthor: () => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  post,
  allPosts,
  themeConfig,
  onBack,
  onSelectPost,
  onSelectAuthor,
}) => {
  // Motion slider index for multiple images
  const allImages = post.images && post.images.length > 0 
    ? post.images 
    : [post.coverImage];

  // Likes
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>(() => getCommentsForPost(post.id));
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);

  // Handle Like
  const handleLike = async () => {
    if (hasLiked) return;
    const newLikes = await incrementPostLike(post.id);
    setLikes(newLikes || likes + 1);
    setHasLiked(true);
  };

  // Handle Share
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Submit Comment with Anti-XSS Protection & Blocker
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockedError(null);
    setCommentSuccess(null);

    if (!commentContent.trim() || !commentName.trim()) return;

    // DETEKSI KETAT SERANGAN XSS: JIKA TERDETEKSI MAKA TIDAK BISA MUNCUL & LANGSUNG DIBLOKIR
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

    // Sanitasi input menggunakan modul anti-XSS
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

    // Simpan komentar aman ke database
    const updated = saveComment(newComment);
    setComments(updated);

    // Buat notifikasi real-time yang akan muncul di floating navbar seperti Facebook
    await addNotification({
      type: 'comment',
      title: 'Komentar Baru',
      message: `${cleanName} berkomentar pada "${post.title}": "${cleanContent.slice(0, 75)}..."`,
      authorName: cleanName,
      postSlug: post.slug,
      postId: post.id,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });

    setCommentContent('');
    setCommentName('');
    setCommentSuccess('Komentar Anda telah terverifikasi aman dan berhasil diterbitkan!');
    setTimeout(() => setCommentSuccess(null), 4000);
    setIsSubmittingComment(false);
  };

  // Related posts in same category
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Bar: Back to Timeline */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="btn-back-to-timeline"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800/60 hover-light-glow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa Timeline</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover-light-glow transition-all relative border border-slate-200 dark:border-slate-800"
            title="Bagikan Tautan"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bagikan</span>
            {copiedLink && (
              <span className="absolute -top-7 right-0 px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded shadow-md">
                Tersalin!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ARTICLE CONTAINER */}
      <article
        id={`article-detail-${post.slug}`}
        className={`rounded-3xl border shadow-xl overflow-hidden transition-colors duration-300 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header Metadata: Kategori, Hari Tanggal Waktu, Read Time */}
        <div className="p-6 sm:p-8 pb-4 space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {post.category}
            </span>
            {post.isAgenda && (
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Agenda Kegiatan Resmi
              </span>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Format Hari, Tanggal, Jam WIB & Author Information */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
            <div
              onClick={onSelectAuthor}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {post.author.name}
                  </span>
                  {post.author.verified && (
                    <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {post.author.role}
                </span>
              </div>
            </div>

            {/* Time Stamp */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{post.dayName}, {post.formattedDate}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{post.time}</span>
            </div>
          </div>
        </div>

        {/* MOTION IMAGE SLIDER DENGAN ZOOM & BLURRY PREVIEW */}
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
                <span>{post.agenda.eventDate} ({post.agenda.eventTime})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lokasi:</span>
                <span>{post.agenda.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {post.agenda.status}
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
          <p className="font-semibold text-base sm:text-lg text-slate-800 dark:text-slate-100 border-l-4 border-blue-500 pl-4 italic">
            {post.excerpt}
          </p>

          <div className="whitespace-pre-line space-y-4">
            {post.content}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold text-slate-500">Tagar:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Lampiran Dokumen Otentik & Berkas Arsip PDF */}
          {post.attachments && post.attachments.length > 0 && (
            <DocumentAttachmentViewer
              attachments={post.attachments}
              themeConfig={themeConfig}
              postTitle={post.title}
            />
          )}
        </div>

        {/* Reaction Bar & Stats */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover-light-glow ${
              hasLiked
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            <span>{hasLiked ? 'Disukai' : 'Sukai'} ({likes})</span>
          </button>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>{post.views} Dilihat</span>
            <span>•</span>
            <span>{comments.length} Komentar</span>
          </div>
        </div>
      </article>

      {/* ========================================================================= */}
      {/* SEKSI KOMENTAR DENGAN SANITASI ANTI-XSS & BLOKIR OTOMATIS                  */}
      {/* ========================================================================= */}
      <section
        id="comments-section"
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              Komentar & Diskusi ({comments.length})
            </h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Proteksi Anti-XSS Aktif
          </span>
        </div>

        {/* Peringatan Serangan XSS yang Diblokir Otomatis */}
        {blockedError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold text-sm">Upaya Serangan Skrip XSS Diblokir!</strong>
              <p className="leading-relaxed">{blockedError}</p>
              <p className="text-[11px] text-red-500/80">Komentar tidak ditampilkan ke publik untuk menjaga keamanan sistem redaksi.</p>
            </div>
          </div>
        )}

        {/* Status Sukses */}
        {commentSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{commentSuccess}</span>
          </div>
        )}

        {/* Form Tulis Komentar */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={commentName}
              onChange={(e) => {
                setCommentName(e.target.value);
                if (blockedError) setBlockedError(null);
              }}
              placeholder="Nama lengkap Anda (Terproteksi Anti-XSS)"
              className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
          <textarea
            required
            rows={3}
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
              if (blockedError) setBlockedError(null);
            }}
            placeholder="Tulis ulasan, tanggapan hukum atau pertanyaan seputar topik tragedi ini..."
            className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover-light-glow transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? 'Memverifikasi...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>

        {/* List Komentar */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              Belum ada komentar pada artikel ini. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-8">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ARTIKEL TERKAIT LINIMASA */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Postingan Terkait Kategori {post.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectPost(rel.slug)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover-light-glow cursor-pointer transition-all group"
              >
                <img
                  src={rel.coverImage}
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
