import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  PlusCircle,
  FileText,
  MapPin,
  Tag,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  ExternalLink,
  Shield,
  Download
} from 'lucide-react';
import { Post, Author, ThemeConfig } from '../types';
import { primaryAuthor, heroSliderItems } from '../data/initialData';
import { supabase, incrementPostLike } from '../lib/supabase';

interface HomePageProps {
  posts: Post[];
  themeConfig: ThemeConfig;
  onSelectPost: (slug: string) => void;
  onOpenNewPostModal: (defaultType?: 'post' | 'agenda') => void;
  onSelectAuthor: () => void;
  onSelectAgenda: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  themeConfig,
  onSelectPost,
  onOpenNewPostModal,
  onSelectAuthor,
  onSelectAgenda,
}) => {
  // Hero Motion Slider State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Kategori filter
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modal Zoom Preview Gambar dengan Efek Blurry
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Copy notification toast
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Auto-play slider motion
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSliderItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Handle Like
  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    await incrementPostLike(postId);
  };

  // Handle Share link
  const handleShare = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#${post.slug}`);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  // Filter posts
  const filteredPosts = selectedCategory === 'Semua'
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const categories = ['Semua', 'Hukum & Politik', 'Reformasi 1998', 'Orde Baru', 'Tragedi & HAM', 'Agenda'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* ========================================================================= */}
      {/* 1. FACEBOOK-STYLE COVER & PROFILE SECTION DENGAN HERO MOTION SLIDER        */}
      {/* ========================================================================= */}
      <section id="facebook-profile-hero" className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
        {/* COVER BANNER DENGAN MOTION SLIDER TERBAIK */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900 group">
          {heroSliderItems.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-out transform ${
                idx === activeSlideIndex
                  ? 'opacity-100 scale-100 translate-x-0'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-75 contrast-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Slider Highlight Content Teaser */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 max-w-2xl text-white">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-md mb-2 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sorotan Terkini • {slide.category}
                </span>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold font-heading line-clamp-2 drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="hidden sm:block text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1 drop-shadow">
                  {slide.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => onSelectPost(slide.slug)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all hover-light-glow shadow-md flex items-center gap-1.5"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-300 font-medium">
                    {slide.date}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Navigation Arrows */}
          <button
            onClick={() => {
              setIsAutoPlay(false);
              setActiveSlideIndex((prev) =>
                prev === 0 ? heroSliderItems.length - 1 : prev - 1
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
            title="Slide Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setIsAutoPlay(false);
              setActiveSlideIndex((prev) => (prev + 1) % heroSliderItems.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
            title="Slide Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Indicators / Dots */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
            {heroSliderItems.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAutoPlay(false);
                  setActiveSlideIndex(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeSlideIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* PHOTO PROFILE SEPERTI FACEBOOK: OVERLAPPING AVATAR & BIO HEADER */}
        <div
          className={`px-6 sm:px-8 pb-6 pt-0 transition-colors duration-300 ${
            themeConfig.mode === 'dark' ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-30">
            {/* Foto Profil Lingkaran dengan border kontras */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-200">
                  <img
                    src={primaryAuthor.avatar}
                    alt={primaryAuthor.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div
                  className="absolute bottom-1 right-1 p-1.5 bg-blue-600 rounded-full text-white shadow-md border-2 border-white dark:border-slate-900"
                  title="Terverifikasi Resmi"
                >
                  <CheckCircle className="w-4 h-4 fill-white text-blue-600" />
                </div>
              </div>

              {/* Detail Identitas Fachrial */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
                    {primaryAuthor.name}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Official Author
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {primaryAuthor.role}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  {primaryAuthor.bio}
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat: Tulis Postingan / Agenda */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                id="btn-tulis-agenda"
                onClick={() => onOpenNewPostModal('agenda')}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-blue-600/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover-light-glow transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                + Buat Agenda Baru
              </button>
              <button
                id="btn-tulis-postingan"
                onClick={() => onOpenNewPostModal('post')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover-light-glow transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                + Tulis Postingan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FACEBOOK STYLE QUICK POST BOX ("Apa yang ingin dibagikan?")            */}
      {/* ========================================================================= */}
      <section
        id="quick-post-composer"
        className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors duration-200 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={primaryAuthor.avatar}
            alt={primaryAuthor.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => onOpenNewPostModal('post')}
            className={`flex-1 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
            }`}
          >
            Apa catatan hukum, analisis politik reformasi, atau agenda advokasi yang ingin Anda bagikan hari ini, Fachrial?
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <button
            onClick={() => onOpenNewPostModal('post')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover-light-glow transition-all hover:text-blue-500"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Artikel & Berita</span>
          </button>
          <button
            onClick={() => onOpenNewPostModal('agenda')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover-light-glow transition-all hover:text-amber-500"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Agenda Kegiatan</span>
          </button>
          <button
            onClick={onSelectAuthor}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover-light-glow transition-all hover:text-indigo-500"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Tentang Author</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FILTER KATEGORI (HORIZONTAL SCROLLABLE PILLS)                          */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`category-filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover-light-glow whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Menampilkan <span className="font-bold text-blue-500">{filteredPosts.length}</span> Postingan Timeline
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TIMELINE SEPERTI FACEBOOK: SELANG-SELING KIRI & KANAN                  */}
      {/* ========================================================================= */}
      <section id="facebook-alternating-timeline" className="relative">
        {/* Central Vertical Rail with subtle glow */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-sky-400 rounded-full opacity-30 dark:opacity-40" />

        <div className="space-y-12">
          {filteredPosts.map((post, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={post.id}
                id={`timeline-post-${post.id}`}
                className={`relative flex flex-col lg:flex-row items-center ${
                  isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-6 lg:gap-12`}
              >
                {/* Central Timeline Node Indicator (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 items-center justify-center z-10 shadow-lg shadow-blue-500/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                </div>

                {/* POST CARD UTAMA (KIRI / KANAN SELANG-SELING) */}
                <div className="w-full lg:w-1/2">
                  <article
                    className={`rounded-2xl border transition-all duration-300 shadow-md hover:shadow-xl hover-light-glow overflow-hidden ${
                      themeConfig.mode === 'dark'
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Header Postingan: Author & Tanggal Waktu Lengkap */}
                    <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-blue-500/40"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {post.author.name}
                            </span>
                            {post.author.verified && (
                              <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
                            )}
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {post.category}
                            </span>
                          </div>
                          {/* Format Hari, Tanggal, dan Jam Lengkap Sesuai Permintaan */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>{post.dayName}, {post.formattedDate}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {post.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      {post.isAgenda && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Calendar className="w-3 h-3" />
                          Agenda
                        </span>
                      )}
                    </div>

                    {/* Judul & Excerpt */}
                    <div className="p-4 sm:p-5 pt-3">
                      <h3
                        onClick={() => onSelectPost(post.slug)}
                        className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
                      >
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Khusus Agenda: Kotak Rincian Agenda Kegiatan */}
                      {post.isAgenda && post.agenda && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold">Tanggal Pelaksanaan:</span>
                            <span>{post.agenda.eventDate} ({post.agenda.eventTime})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold">Lokasi:</span>
                            <span>{post.agenda.location}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MOTION GAMBAR SLIDER & ZOOM IN/OUT BLURRY EFFECT */}
                    <div className="relative group overflow-hidden bg-slate-950">
                      <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 filter group-hover:brightness-95"
                          referrerPolicy="no-referrer"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Tombol Zoom Gambar Blurry */}
                        <button
                          onClick={() => setZoomedImage(post.coverImage)}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-blue-600 text-white backdrop-blur-md transition-all duration-200 shadow-lg flex items-center gap-1 text-xs font-semibold"
                          title="Perbesar Gambar (Zoom In / Blurry)"
                        >
                          <ZoomIn className="w-4 h-4" />
                          <span className="hidden sm:inline">Perbesar</span>
                        </button>

                        {/* Indikator Koleksi Foto jika lebih dari 1 */}
                        {post.images && post.images.length > 1 && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-white text-[11px] font-bold backdrop-blur-md">
                            +{post.images.length} Foto Slider
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attachment Dokumen/PDF jika ada */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="px-4 sm:px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium truncate max-w-xs">{post.attachments[0].name}</span>
                          <span className="text-[10px] text-slate-400">({post.attachments[0].size})</span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Lampiran
                        </span>
                      </div>
                    )}

                    {/* FOOTER KARTU: TOMBOL BACA SELENGKAPNYA (TANPA RELOG REFRESH) & REAKSI */}
                    <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                      {/* Tombol Baca Selengkapnya */}
                      <button
                        onClick={() => onSelectPost(post.slug)}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-600 hover:text-white transition-all duration-200 hover-light-glow flex items-center gap-1.5"
                      >
                        Baca Selengkapnya
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Tombol Reaksi Facebook: Suka, Komentar, Bagikan */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={(e) => handleLike(e, post.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all hover-light-glow"
                          title="Sukai Postingan"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => onSelectPost(post.slug)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-blue-500/10 transition-all hover-light-glow"
                          title="Lihat Komentar"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          <span>{post.commentsCount}</span>
                        </button>

                        <button
                          onClick={(e) => handleShare(e, post)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all hover-light-glow relative"
                          title="Bagikan Tautan"
                        >
                          <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                          {copiedPostId === post.id && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded shadow-md whitespace-nowrap">
                              Link Disalin!
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Sisi kosong untuk menyempurnakan grid zigzag desktop */}
                <div className="hidden lg:block w-1/2" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MODAL ZOOM GAMBAR SLIDER (ZOOM IN/OUT DENGAN BLURRY BACKDROP)          */}
      {/* ========================================================================= */}
      {zoomedImage && (
        <div
          id="image-zoom-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setZoomedImage(null);
            setZoomLevel(1);
          }}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Kontrol Zoom */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-semibold text-slate-300">
                Mode Tinjau Gambar Resolusi Tinggi • Facrial Motion Zoom
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoomedImage(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white ml-2"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Container Gambar */}
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl max-h-[80vh] flex items-center justify-center bg-black/50">
              <img
                src={zoomedImage}
                alt="Zoomed Detail"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[75vh] w-auto object-contain transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
