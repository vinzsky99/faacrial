import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  Calendar,
  Share2,
  Check,
  ExternalLink,
  MapPin,
  Flame,
  BookOpen
} from 'lucide-react';
import { Author, Post, ActiveTab } from '../types';

interface HeroProfileProps {
  author: Author;
  featuredPosts: Post[];
  onSelectPost: (post: Post) => void;
  setCurrentTab: (tab: ActiveTab) => void;
  transparency: number;
  isDark: boolean;
}

export const HeroProfile: React.FC<HeroProfileProps> = ({
  author,
  featuredPosts,
  onSelectPost,
  setCurrentTab,
  transparency,
  isDark
}) => {
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const covers = author.coverImages;

  // Auto slide cover images every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsZooming(true);
      setTimeout(() => {
        setCurrentCoverIndex((prev) => (prev + 1) % covers.length);
        setIsZooming(false);
      }, 500);
    }, 7000);
    return () => clearInterval(timer);
  }, [covers.length]);

  const handlePrevCover = () => {
    setCurrentCoverIndex((prev) => (prev - 1 + covers.length) % covers.length);
  };

  const handleNextCover = () => {
    setCurrentCoverIndex((prev) => (prev + 1) % covers.length);
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <div className="w-full mb-10 pt-20">
      {/* Facebook-style Main Container Card */}
      <div
        id="profile-hero-card"
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`,
          backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
        }}
        className={`rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 ${
          isDark
            ? 'border-slate-800 shadow-black/40 text-slate-100'
            : 'border-slate-200 shadow-slate-200/60 text-slate-800'
        }`}
      >
        {/* Cover Photo Area with Motion Slider & Zoom In/Out Blurry Effect */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900 group select-none">
          {/* Cover Image Slider with Smooth Zoom & Blur Motion */}
          <div
            className={`w-full h-full bg-cover bg-center transition-all duration-1000 ease-out transform ${
              isZooming ? 'scale-110 blur-sm opacity-80' : 'scale-100 blur-0 opacity-100'
            }`}
            style={{ backgroundImage: `url(${covers[currentCoverIndex]})` }}
          />

          {/* Subtle dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Slider Controls (Prev & Next) */}
          <button
            onClick={handlePrevCover}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 hover:opacity-100 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
            title="Cover Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextCover}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 hover:opacity-100 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
            title="Cover Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
            {covers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCoverIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentCoverIndex === idx
                    ? 'w-6 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                title={`Lihat Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Cover Tagline Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Facrial Official Editorial & Tech Hub 2026</span>
          </div>
        </div>

        {/* Profile Info Area (Facebook Style Overlapping Avatar) */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-16 sm:-mt-20 md:-mt-24 mb-6">
            {/* Facebook-style Avatar with Ring & Verified Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 shadow-2xl relative z-10">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-full h-full object-cover rounded-full bg-slate-800 transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Online / Active status pulse */}
                  <div
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-md"
                    title="Online / Aktif Realtime"
                  />
                </div>
              </div>

              {/* Author Names & Bio Heading */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    {author.name}
                  </h1>
                  <span
                    className="inline-flex items-center text-blue-500"
                    title="Terverifikasi Resmi"
                  >
                    <ShieldCheck className="w-6 h-6 fill-blue-500/20" />
                  </span>
                </div>
                <p className="text-sm sm:text-base font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  {author.role}
                </p>
                <div className="flex items-center gap-3 text-xs opacity-60 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {author.location}
                  </span>
                  <span>•</span>
                  <span>Supabase Cloud Synced</span>
                  <span>•</span>
                  <span>Next.js 15 Ready</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons with 50% Touch Glow */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
              <button
                id="btn-action-visimisi"
                onClick={() => setCurrentTab('visi-misi')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 hover:shadow-[0_0_16px_rgba(59,130,246,0.5)] active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Visi & Misi</span>
              </button>

              <button
                id="btn-action-agenda"
                onClick={() => setCurrentTab('agenda')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200'
                } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Lihat Agenda</span>
              </button>

              <button
                id="btn-action-share"
                onClick={handleShareProfile}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200'
                } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
                title="Bagikan Tautan Profil"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Author Bio Quote */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &ldquo;{author.bio}&rdquo;
          </div>

          {/* Interactive Facebook-style Stories / Featured Highlights Slider */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Sorotan Artikel Unggulan (Featured Stories)</span>
              </div>
              <span className="text-xs text-blue-500 font-medium">
                {featuredPosts.length} Artikel Pilihan
              </span>
            </div>

            {/* Horizontal Story Card Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {featuredPosts.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(59,130,246,0.5)]"
                >
                  <img
                    src={post.coverImages[0]}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-semibold backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                        {post.publishedAtDisplay}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facebook-style Quick Reader Highlight Bar */}
          <div
            onClick={() => setCurrentTab('agenda')}
            className={`mt-5 p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all duration-200 ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-400'
                : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100 text-slate-500'
            } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)]`}
          >
            <img
              src={author.avatar}
              alt={author.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1 text-xs sm:text-sm">
              Eksplorasi berita, artikel teknologi, agenda kegiatan & pembaruan resmi Fachrial...
            </div>
            <div className="flex items-center gap-2 text-blue-500 text-xs font-medium">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Jadwal Agenda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
