import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Eye,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  Calendar,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Post, ActiveTab } from '../types';

interface TimelineFeedProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onLikePost: (postId: string) => void;
  transparency: number;
  isDark: boolean;
  setCurrentTab: (tab: ActiveTab) => void;
}

export const TimelineFeed: React.FC<TimelineFeedProps> = ({
  posts,
  onSelectPost,
  onLikePost,
  transparency,
  isDark,
  setCurrentTab
}) => {
  // State for active image slide per post
  const [sliderIndex, setSliderIndex] = useState<Record<string, number>>({});
  const [zoomingPost, setZoomingPost] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Teknologi', 'Pengembangan Web', 'Visi Digital', 'Tutorial', 'Agenda'];

  const filteredPosts = selectedCategory === 'Semua'
    ? posts
    : posts.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handlePrevImage = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    const current = sliderIndex[post.id] || 0;
    const nextIdx = (current - 1 + post.coverImages.length) % post.coverImages.length;
    setZoomingPost(post.id);
    setTimeout(() => {
      setSliderIndex((prev) => ({ ...prev, [post.id]: nextIdx }));
      setZoomingPost(null);
    }, 250);
  };

  const handleNextImage = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    const current = sliderIndex[post.id] || 0;
    const nextIdx = (current + 1) % post.coverImages.length;
    setZoomingPost(post.id);
    setTimeout(() => {
      setSliderIndex((prev) => ({ ...prev, [post.id]: nextIdx }));
      setZoomingPost(null);
    }, 250);
  };

  const handleShare = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#blog-${post.slug}`);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <section className="w-full relative pb-16">
      {/* Section Header with Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Timeline Publikasi Terverifikasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Semua Postingan & Artikel
          </h2>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            Tampilan timeline interaktif selang-seling kiri & kanan disinkronkan secara realtime.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] active:scale-95`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stem & Cards Container */}
      <div className="relative">
        {/* Central Vertical Timeline Spine (Visible on md+) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-500 via-indigo-500/50 to-transparent pointer-events-none" />

        {/* Post Items */}
        <div className="space-y-10 md:space-y-16">
          {filteredPosts.map((post, index) => {
            // Alternating side logic
            const isLeft = index % 2 === 0;
            const currentImgIdx = sliderIndex[post.id] || 0;
            const currentImg = post.coverImages[currentImgIdx] || post.coverImages[0];
            const isZoomed = zoomingPost === post.id;

            return (
              <div
                key={post.id}
                className={`relative flex flex-col md:flex-row items-center ${
                  isLeft ? 'md:flex-row-reverse' : ''
                } gap-6 md:gap-12`}
              >
                {/* Center Node Anchor on Spine (md+) with 50% glow */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-4 border-white dark:border-slate-950 items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20">
                  <Calendar className="w-3.5 h-3.5" />
                </div>

                {/* Empty Half Column on opposite side for alternating rhythm on md+ */}
                <div className="hidden md:block w-1/2" />

                {/* Main Post Card Container (50% Width on md+) */}
                <div className="w-full md:w-1/2">
                  <article
                    id={`post-card-${post.slug}`}
                    style={{
                      backgroundColor: isDark
                        ? `rgba(15, 23, 42, ${alpha})`
                        : `rgba(255, 255, 255, ${alpha})`,
                      backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
                    }}
                    className={`rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 ${
                      isDark
                        ? 'border-slate-800 text-slate-100 shadow-black/40'
                        : 'border-slate-200 text-slate-800 shadow-slate-200/60'
                    } hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group`}
                  >
                    {/* Header Row: Author Photo, Name, Verified Tick, Indonesian Date */}
                    <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-sm">
                            <span>{post.author.name}</span>
                            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                          </div>
                          <div className="text-[11px] opacity-60 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{post.publishedAtDisplay}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Title */}
                    <div className="px-4 sm:px-5 pb-2">
                      <h3
                        onClick={() => onSelectPost(post)}
                        className="text-lg sm:text-xl font-bold leading-snug cursor-pointer group-hover:text-blue-500 transition-colors"
                      >
                        {post.title}
                      </h3>
                    </div>

                    {/* Image Slider with Zoom In / Out Blurry Effect */}
                    {post.coverImages.length > 0 && (
                      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900 select-none">
                        <div
                          className={`w-full h-full bg-cover bg-center transition-all duration-700 ease-out ${
                            isZoomed ? 'scale-110 blur-sm opacity-80' : 'scale-100 blur-0 opacity-100'
                          }`}
                          style={{ backgroundImage: `url(${currentImg})` }}
                          onClick={() => onSelectPost(post)}
                        />

                        {/* Slider Prev & Next arrows if multiple images */}
                        {post.coverImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => handlePrevImage(e, post)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-pointer"
                              title="Gambar Sebelumnya"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(e, post)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-pointer"
                              title="Gambar Selanjutnya"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                              {post.coverImages.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    currentImgIdx === idx
                                      ? 'w-5 bg-blue-500'
                                      : 'w-1.5 bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {/* Reading Time Badge */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span>{post.views} Dilihat</span>
                        </div>
                      </div>
                    )}

                    {/* Excerpt Body with "Baca Selengkapnya" */}
                    <div className="p-4 sm:p-5 pt-3">
                      <p className="text-sm leading-relaxed opacity-80 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Attachments pills if any (e.g. PDF, Docs) */}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {post.attachments.map((att) => (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20"
                            >
                              <Paperclip className="w-3 h-3 text-blue-500" />
                              <span>{att.name}</span>
                              <span className="opacity-60">({att.size})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Read More Button (Baca Selengkapnya) without reload */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <button
                          id={`btn-read-more-${post.slug}`}
                          onClick={() => onSelectPost(post)}
                          className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 transition-colors group cursor-pointer"
                        >
                          <span>Baca Selengkapnya</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Social Interaction Buttons: Like, Comment, Share with 50% Touch Glow */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onLikePost(post.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-rose-500/10 hover:text-rose-500 transition-all hover:shadow-[0_0_12px_rgba(244,63,94,0.5)] cursor-pointer"
                            title="Suka Postingan"
                          >
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                            <span>{post.likes}</span>
                          </button>

                          <button
                            onClick={() => onSelectPost(post)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-blue-500/10 hover:text-blue-500 transition-all hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-pointer"
                            title="Komentar"
                          >
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span>{post.commentsCount}</span>
                          </button>

                          <button
                            onClick={(e) => handleShare(e, post)}
                            className="p-1.5 rounded-xl hover:bg-slate-500/10 transition-all hover:shadow-[0_0_12px_rgba(100,116,139,0.5)] cursor-pointer"
                            title="Salin Tautan Artikel"
                          >
                            {copiedId === post.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Share2 className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
