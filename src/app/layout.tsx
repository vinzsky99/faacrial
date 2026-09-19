import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Compass,
  Calendar,
  Mail,
  Sun,
  Moon,
  Search,
  Sliders,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';
import { ThemeConfig, Post } from '../types';
import { sanitizeSearchQuery } from '../lib/security';
import { isSupabaseConfigured } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  themeConfig: ThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  posts: Post[];
  activeView: 'home' | 'blog-detail' | 'author' | 'admin' | 'agenda' | 'visimisi';
  setActiveView: (view: 'home' | 'blog-detail' | 'author' | 'admin' | 'agenda' | 'visimisi') => void;
  selectedPostSlug: string | null;
  onSelectPost: (slug: string) => void;
  onOpenNewPostModal?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  themeConfig,
  setThemeConfig,
  posts,
  activeView,
  setActiveView,
  onSelectPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sanitasi query pencarian dari XSS & SQLi secara realtime
  const safeQuery = sanitizeSearchQuery(searchQuery).toLowerCase();

  const searchResults = safeQuery.trim().length > 1
    ? posts.filter((p) => {
        return (
          p.title.toLowerCase().includes(safeQuery) ||
          p.excerpt.toLowerCase().includes(safeQuery) ||
          p.category.toLowerCase().includes(safeQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(safeQuery))
        );
      }).slice(0, 6)
    : [];

  // Toggle dark/light theme
  const toggleTheme = () => {
    setThemeConfig((prev) => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsContactDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hitung transparansi navbar style berdasarkan persentase
  const navAlpha = themeConfig.transparency / 100;
  const navBg =
    themeConfig.mode === 'dark'
      ? `rgba(15, 23, 42, ${navAlpha})`
      : `rgba(255, 255, 255, ${navAlpha})`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        themeConfig.mode === 'dark'
          ? 'bg-slate-950 text-slate-100 dark'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* ========================================================================= */}
      {/* NAVBAR MELAYANG DI ATAS (FLOATING NAVBAR WITH ADJUSTABLE TRANSPARENCY)    */}
      {/* ========================================================================= */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav
          id="main-floating-navbar"
          style={{
            backgroundColor: navBg,
            backdropFilter: themeConfig.blurBackdrop ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: themeConfig.blurBackdrop ? 'blur(16px)' : 'none',
          }}
          className={`relative flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full border transition-all duration-300 shadow-xl ${
            themeConfig.mode === 'dark'
              ? 'border-slate-800/80 shadow-black/40'
              : 'border-slate-200/90 shadow-slate-300/40'
          }`}
        >
          {/* SISI KIRI: BRANDING & LOGO */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              title="Kembali ke Beranda"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                <span className="text-lg">F</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                    Facrial
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Hukum & Politik
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                  Portal Kebenaran Sejarah & Reformasi
                </p>
              </div>
            </button>
          </div>

          {/* SISI TENGAH: KOLOM PENCARIAN AKTIF (DENGAN ANTI-XSS & REALTIME FILTER) */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-2 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-input-navbar"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Cari berita reformasi, 98, trisakti, g30s..."
                className={`w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-slate-900/80 border-slate-700/70 text-slate-100 placeholder-slate-500'
                    : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* LIVE SEARCH DROPDOWN MODAL */}
            {isSearchOpen && searchQuery.trim().length > 1 && (
              <div
                id="search-results-dropdown"
                className={`absolute left-0 right-0 mt-2 p-2 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                    : 'bg-white/95 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Hasil Pencarian Berita & Arsip
                  </span>
                  <span className="text-[11px] text-blue-500 font-medium">
                    {searchResults.length} Ditemukan
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada arsip atau berita yang cocok dengan "{safeQuery}".
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {searchResults.map((post) => (
                      <button
                        key={post.id}
                        id={`search-item-${post.id}`}
                        onClick={() => {
                          onSelectPost(post.slug);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover-light-glow transition-all duration-150 group"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {post.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {post.formattedDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {post.excerpt}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SISI KANAN NAVBAR: MENU DENGAN HOVER LIGHT EFFECT 50% CAPABILITY */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 1. Menu Beranda/Rumah */}
            <button
              id="nav-beranda-btn"
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover-light-glow ${
                activeView === 'home'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Beranda / Rumah"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Beranda</span>
            </button>

            {/* 2. Menu Visi & Misi */}
            <button
              id="nav-visi-misi-btn"
              onClick={() => setActiveView('visimisi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover-light-glow ${
                activeView === 'visimisi'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visi & Misi Kebenaran Sejarah"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Visi & Misi</span>
            </button>

            {/* 3. Menu Agenda Kegiatan */}
            <button
              id="nav-agenda-btn"
              onClick={() => setActiveView('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover-light-glow ${
                activeView === 'agenda'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Agenda Simposium & Sidang"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Agenda</span>
            </button>

            {/* 4. Menu Kontak Saya (Dengan Auto Dropdown: Instagram, Facebook, LinkedIn, Email Lengkap dengan Logo) */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsContactDropdownOpen(true)}
              onMouseLeave={() => setIsContactDropdownOpen(false)}
            >
              <button
                id="nav-kontak-dropdown-btn"
                onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover-light-glow ${
                  isContactDropdownOpen
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kontak & Kanal Resmi"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kontak</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Sub-menu auto dropdown dengan 4 logo resmi: Instagram, Facebook, LinkedIn, Email */}
              {isContactDropdownOpen && (
                <div
                  id="submenu-kontak-dropdown"
                  className={`absolute right-0 mt-1.5 w-60 p-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    themeConfig.mode === 'dark'
                      ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Kanal Resmi & Redaksi
                  </div>

                  {/* Submenu 1: Instagram */}
                  <a
                    id="contact-instagram-link"
                    href="https://instagram.com/fachrial"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-medium hover-light-glow transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Instagram</div>
                        <div className="text-[10px] text-slate-400">@fachrial</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-500" />
                  </a>

                  {/* Submenu 2: Facebook */}
                  <a
                    id="contact-facebook-link"
                    href="https://facebook.com/fachrial.official"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-medium hover-light-glow transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Facebook</div>
                        <div className="text-[10px] text-slate-400">Fachrial Official</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                  </a>

                  {/* Submenu 3: LinkedIn */}
                  <a
                    id="contact-linkedin-link"
                    href="https://linkedin.com/in/fachrial"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-medium hover-light-glow transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0077B5] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">LinkedIn</div>
                        <div className="text-[10px] text-slate-400">in/fachrial</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                  </a>

                  {/* Submenu 4: Email */}
                  <a
                    id="contact-email-link"
                    href="mailto:fachrial.official2026@gmail.com"
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-medium hover-light-glow transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Email Redaksi</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">fachrial.official2026@gmail.com</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                  </a>
                </div>
              )}
            </div>

            {/* Catatan: Tombol Admin disembunyikan dari navbar publik sesuai instruksi pengguna */}

            {/* 5. Settings Transparansi & Efek Glass */}
            <div className="relative" ref={settingsRef}>
              <button
                id="nav-transparency-settings-btn"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-full text-xs font-medium transition-all duration-200 hover-light-glow ${
                  isSettingsOpen
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Atur Transparansi Navbar & Tema"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Popover Pengaturan Transparansi */}
              {isSettingsOpen && (
                <div
                  id="transparency-settings-popover"
                  className={`absolute right-0 mt-2 w-64 p-4 rounded-2xl shadow-2xl border backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    themeConfig.mode === 'dark'
                      ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold tracking-tight">Kustomisasi Transparansi</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {themeConfig.transparency}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span>Opacity Navbar</span>
                        <span>{themeConfig.transparency}%</span>
                      </div>
                      <input
                        id="transparency-range-slider"
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={themeConfig.transparency}
                        onChange={(e) =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            transparency: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Presets Button */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[35, 60, 85, 100].map((val) => (
                        <button
                          key={val}
                          id={`preset-transparency-${val}`}
                          onClick={() =>
                            setThemeConfig((prev) => ({ ...prev, transparency: val }))
                          }
                          className={`py-1 text-[10px] font-medium rounded-lg border transition-all duration-150 ${
                            themeConfig.transparency === val
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>

                    {/* Toggle Blur Backdrop */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-600 dark:text-slate-300">Glassmorphism Blur</span>
                      <button
                        id="toggle-glass-blur-btn"
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            blurBackdrop: !prev.blurBackdrop,
                          }))
                        }
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                          themeConfig.blurBackdrop ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            themeConfig.blurBackdrop ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Tombol On/Off Dark or Light Mode */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-200 hover-light-glow"
              title={themeConfig.mode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {themeConfig.mode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* KONTEN UTAMA HALAMAN                                                      */}
      {/* ========================================================================= */}
      <main className="pt-24 sm:pt-28 pb-16">{children}</main>

      {/* ========================================================================= */}
      {/* FOOTER RESMI: "Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS." */}
      {/* ========================================================================= */}
      <footer
        id="main-footer"
        className={`mt-20 border-t transition-colors duration-300 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-950 border-slate-800/80 text-slate-400'
            : 'bg-white border-slate-200/80 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Kolom 1: Profil Facrial */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                  F
                </div>
                <span className="text-xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
                  Facrial
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isSupabaseConfigured ? 'Supabase Realtime Live' : 'Local Realtime Sync'}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Portal jurnalisme investigasi hukum dan politik Indonesia. Mengulas fakta otentik peristiwa Reformasi 1998, evaluasi era Orde Baru, pemulihan martabat kemanusiaan, serta advokasi supremasi hukum.
              </p>
            </div>

            {/* Kolom 2: Navigasi Cepat */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                Navigasi Cepat
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setActiveView('home')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Beranda & Linimasa
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('visimisi')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Visi & Misi Kami
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('agenda')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Agenda & Simposium
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Kontak & Komunitas */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                Hubungi Kami
              </h5>
              <div className="space-y-2 text-xs">
                <a
                  href="mailto:fachrial.official2026@gmail.com"
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  fachrial.official2026@gmail.com
                </a>
                <a
                  href="https://instagram.com/fachrial"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px]">IG</span>
                  @fachrial
                </a>
                <a
                  href="https://facebook.com/fachrial.official"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px]">FB</span>
                  Fachrial Official
                </a>
                <a
                  href="https://linkedin.com/in/fachrial"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px]">IN</span>
                  Fachrial Professional
                </a>
              </div>
            </div>
          </div>

          {/* Copyright & Disclaimer Sesuai Perintah */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="font-medium text-slate-600 dark:text-slate-300">
              Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Anti-XSS & SQLi Protected
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
