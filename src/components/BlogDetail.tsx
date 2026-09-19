import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Paperclip,
  Calendar,
  ShieldCheck,
  Instagram,
  Linkedin,
  Mail,
  Github,
  ChevronLeft,
  ChevronRight,
  Send,
  Download,
  Sparkles,
  FileText,
  Check
} from 'lucide-react';
import { Post, Comment } from '../types';
import { sanitizeInput, formatIndonesianDate } from '../lib/security';

interface BlogDetailProps {
  post: Post;
  allPosts: Post[];
  onBack: () => void;
  onSelectPost: (post: Post) => void;
  onLikePost: (postId: string) => void;
  transparency: number;
  isDark: boolean;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
  onLikePost,
  transparency,
  isDark
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c-1',
      postId: post.id,
      authorName: 'Rian Pratama',
      text: 'Struktur artikel yang sangat rapi! Sangat terbantu dengan penjelasan pencegahan XSS dan integrasi realtime Supabase.',
      createdAt: 'Kemarin • 16:40 WIB'
    },
    {
      id: 'c-2',
      postId: post.id,
      authorName: 'Dina Kusuma',
      text: 'Desain timeline Facebook selang-seling kiri dan kanan ini luar biasa nyaman di mata, apalagi dengan kontrol transparansi kaca.',
      createdAt: 'Hari ini • 10:15 WIB'
    }
  ]);
  const [isCopied, setIsCopied] = useState(false);

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + post.coverImages.length) % post.coverImages.length);
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % post.coverImages.length);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    // Sanitize input against XSS
    const safeName = sanitizeInput(commentName);
    const safeText = sanitizeInput(commentText);

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId: post.id,
      authorName: safeName,
      text: safeText,
      createdAt: formatIndonesianDate(new Date())
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  const otherArticles = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="w-full pb-20 pt-20">
      {/* Top Back Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="btn-back-to-timeline"
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
          } hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Timeline Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onLikePost(post.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all hover:shadow-[0_0_12px_rgba(244,63,94,0.5)] cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-rose-500/20" />
            <span>{post.likes} Suka</span>
          </button>
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
            } hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]`}
            title="Bagikan Tautan"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <article
        id="blog-detail-article"
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`,
          backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
        }}
        className={`rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 ${
          isDark
            ? 'border-slate-800 text-slate-100 shadow-black/50'
            : 'border-slate-200 text-slate-800 shadow-slate-200/70'
        }`}
      >
        {/* Article Header */}
        <div className="p-6 sm:p-10 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/30">
              {post.category}
            </span>
            <span className="text-xs opacity-60 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAtDisplay}
            </span>
            <span className="text-xs opacity-60">•</span>
            <span className="text-xs opacity-60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Estimasi Baca {post.readingTimeMinutes} Menit
            </span>
            <span className="text-xs opacity-60">•</span>
            <span className="text-xs opacity-60 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {post.views} Dilihat
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author Badge Banner */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{post.author.name}</span>
                <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                  Author Terverifikasi
                </span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">{post.author.role}</p>
            </div>
          </div>
        </div>

        {/* Gallery / Image Slider with Blur Effect */}
        {post.coverImages.length > 0 && (
          <div className="relative h-72 sm:h-96 md:h-[450px] w-full bg-slate-900 overflow-hidden group select-none">
            <div
              className="w-full h-full bg-cover bg-center transition-all duration-700 ease-out"
              style={{ backgroundImage: `url(${post.coverImages[activeImageIdx]})` }}
            />

            {post.coverImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
                  title="Gambar Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
                  title="Gambar Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {post.coverImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeImageIdx === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs">
              Slide {activeImageIdx + 1} dari {post.coverImages.length}
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div className="p-6 sm:p-10 text-base sm:text-lg leading-relaxed space-y-6">
          <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-blue-600 dark:text-blue-400 p-4 rounded-2xl bg-blue-500/5 border-l-4 border-blue-500">
            &ldquo;{post.excerpt}&rdquo;
          </p>

          <div className="whitespace-pre-line space-y-4 font-normal text-slate-800 dark:text-slate-200">
            {post.content}
          </div>

          {/* Attachments Section if uploaded */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-8 p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400 mb-3">
                <FileText className="w-4 h-4" />
                <span>Lampiran Berkas & Dokumentasi Teknis ({post.attachments.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {post.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate">{att.name}</div>
                        <div className="text-[10px] opacity-60 uppercase">{att.type} • {att.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Mengunduh file simulasi aman: ${att.name}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                      title="Unduh Lampiran"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author.js representation section */}
        <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-800 bg-slate-500/5">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tentang Author (author.js)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold">{post.author.name}</h4>
                <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />
              </div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                {post.author.role} • {post.author.location}
              </p>
              <p className="text-sm opacity-80 mt-2 leading-relaxed">
                {post.author.bio}
              </p>

              {/* Social Channels with 50% Touch Glow */}
              <div className="flex items-center gap-2 mt-4">
                <a
                  href={post.author.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-all hover:shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                  title="Instagram Author"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={post.author.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-all hover:shadow-[0_0_12px_rgba(14,165,233,0.5)]"
                  title="LinkedIn Author"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${post.author.email}`}
                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  title="Email Author"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={post.author.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20 transition-all hover:shadow-[0_0_12px_rgba(100,116,139,0.5)]"
                  title="GitHub Author"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section (Sanitized XSS Safe) */}
        <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span>Diskusi & Komentar ({comments.length})</span>
            </h3>
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> XSS Filtered
            </span>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8 space-y-3">
            <input
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="Nama Anda..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
              required
            />
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tuliskan tanggapan konstruktif Anda..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Komentar</span>
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-4">
            {comments.map((comm) => (
              <div
                key={comm.id}
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>{comm.authorName}</span>
                  <span className="opacity-50 font-normal">{comm.createdAt}</span>
                </div>
                <p className="text-sm opacity-80 leading-relaxed">{comm.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Other Recommended Articles */}
        {otherArticles.length > 0 && (
          <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4">Artikel Terkait Lainnya</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectPost(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  } hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                >
                  <img
                    src={art.coverImages[0]}
                    alt={art.title}
                    className="w-full h-32 object-cover rounded-xl mb-2"
                  />
                  <span className="text-[10px] font-semibold text-blue-500 uppercase">{art.category}</span>
                  <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 mt-1">{art.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
