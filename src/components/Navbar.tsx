import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Compass,
  Calendar,
  Mail,
  Sun,
  Moon,
  Search,
  Sliders,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Users
} from 'lucide-react';
import { ActiveTab, ThemeMode, Post } from '../types';
import { sanitizeInput, sanitizeSqlQuery } from '../lib/security';

interface NavbarProps {
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  transparency: number;
  setTransparency: (val: number) => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  theme,
  toggleTheme,
  transparency,
  setTransparency,
  posts,
  onSelectPost
}) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);

  const contactRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setIsContactOpen(false);
      }
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setIsSliderOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sanitized search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const sanitized = sanitizeInput(rawVal);
    const { hadSuspiciousPattern } = sanitizeSqlQuery(rawVal);

    if (hadSuspiciousPattern) {
      setSearchWarning('Pola query SQL injection dinetralisir untuk keamanan sistem.');
    } else {
      setSearchWarning(null);
    }

    setSearchQuery(sanitized);
  };

  const filteredSearchResults = searchQuery.trim() === ''
    ? []
    : posts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.author.name.toLowerCase().includes(q)
        );
      }).slice(0, 5);

  // Background opacity calculation based on transparency percentage (e.g., 30% to 100%)
  const alphaValue = Math.min(Math.max(transparency / 100, 0.25), 0.98);

  const isDark = theme === 'dark';

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      {/* Floating Navbar Shell */}
      <nav
        id="facrial-floating-navbar"
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alphaValue})`
            : `rgba(255, 255, 255, ${alphaValue})`,
          backdropFilter: `blur(${Math.max(8, transparency / 6)}px)`
        }}
        className={`w-full rounded-2xl border transition-all duration-300 shadow-lg ${
          isDark
            ? 'border-slate-700/60 shadow-black/30 text-slate-100'
            : 'border-slate-200/80 shadow-slate-300/40 text-slate-800'
        } px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 md:gap-4`}
      >
        {/* Brand Logo with 50% Touch Glow */}
        <button
          id="btn-brand-logo"
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none rounded-xl p-1.5 transition-all duration-200 hover:shadow-[0_0_16px_rgba(59,130,246,0.5)] active:scale-95"
          title="Beranda Facrial"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
            F
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg leading-tight">
              <span>FACRIAL</span>
              <ShieldCheck className="w-4 h-4 text-blue-500 inline fill-blue-500/20" />
            </div>
            <span className="text-[10px] tracking-wider uppercase font-medium opacity-60">
              Media & Timeline Portal
            </span>
          </div>
        </button>

        {/* Center Active Search Bar (Sanitized XSS & SQLi Safe) */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-1 sm:mx-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              isDark
                ? 'bg-slate-800/60 border-slate-700 focus-within:border-blue-500 focus-within:bg-slate-800'
                : 'bg-slate-100/80 border-slate-200 focus-within:border-blue-500 focus-within:bg-white'
            } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)]`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Cari berita, artikel, agenda, tag..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Warning badge if suspicious query was sanitized */}
          {searchWarning && (
            <div className="absolute top-full left-0 right-0 mt-1 px-3 py-1.5 text-xs rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 z-50">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{searchWarning}</span>
            </div>
          )}

          {/* Live Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden z-50 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/60'
                  : 'bg-white border-slate-200 text-slate-800 shadow-slate-400/40'
              }`}
            >
              <div className="p-2 border-b text-xs font-semibold uppercase tracking-wider opacity-60 flex justify-between items-center">
                <span>Hasil Pencarian ({filteredSearchResults.length})</span>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> XSS/SQLi Protected
                </span>
              </div>
              {filteredSearchResults.length === 0 ? (
                <div className="p-4 text-center text-sm opacity-60">
                  Tidak ditemukan artikel dengan kata kunci &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {filteredSearchResults.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => {
                        onSelectPost(post);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-blue-500/10 transition-colors flex items-start gap-2.5 group"
                    >
                      <img
                        src={post.coverImages[0]}
                        alt={post.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm group-hover:text-blue-500 truncate">
                          {post.title}
                        </div>
                        <div className="text-xs opacity-60 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
                            {post.category}
                          </span>
                          <span>{post.publishedAtDisplay}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation & Action Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Beranda Button with 50% subtle light effect */}
          <button
            id="nav-btn-home"
            onClick={() => setCurrentTab('home')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentTab === 'home'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-200'
            } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
            title="Halaman Beranda"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Beranda</span>
          </button>

          {/* Visi & Misi Button with 50% subtle light effect */}
          <button
            id="nav-btn-visimisi"
            onClick={() => setCurrentTab('visi-misi')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentTab === 'visi-misi'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-200'
            } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
            title="Visi & Misi Fachrial"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden lg:inline">Visi & Misi</span>
          </button>

          {/* Agenda Kegiatan Button with 50% subtle light effect */}
          <button
            id="nav-btn-agenda"
            onClick={() => setCurrentTab('agenda')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentTab === 'agenda'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-200'
            } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
            title="Agenda Kegiatan"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden lg:inline">Agenda</span>
          </button>

          {/* Kontak Saya with Responsive Auto Dropdown & Icons */}
          <div ref={contactRef} className="relative">
            <button
              id="nav-btn-kontak"
              onClick={() => setIsContactOpen(!isContactOpen)}
              onMouseEnter={() => setIsContactOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isContactOpen
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-200'
              } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
              title="Kontak Saya"
            >
              <Mail className="w-4 h-4 text-blue-500" />
              <span className="hidden md:inline">Kontak</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Submenu Dropdown with Motion & Brand Logos */}
            {isContactOpen && (
              <div
                onMouseLeave={() => setIsContactOpen(false)}
                className={`absolute right-0 mt-2 w-60 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-black/70'
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/50'
                } backdrop-blur-xl`}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center justify-between">
                  <span>Kontak & Sosial Media</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                {/* 1. Instagram */}
                <a
                  href="https://instagram.com/fachrial.id"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-all hover:shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Instagram</div>
                    <div className="text-[10px] opacity-60">@fachrial.id</div>
                  </div>
                </a>

                {/* 2. Facebook */}
                <a
                  href="https://facebook.com/fachrial.official"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Facebook</div>
                    <div className="text-[10px] opacity-60">Fachrial Official Timeline</div>
                  </div>
                </a>

                {/* 3. LinkedIn */}
                <a
                  href="https://linkedin.com/in/fachrial-dev"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 transition-all hover:shadow-[0_0_12px_rgba(14,165,233,0.5)]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0077b5] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">LinkedIn</div>
                    <div className="text-[10px] opacity-60">Fachrial Professional</div>
                  </div>
                </a>

                {/* 4. Email */}
                <a
                  href="mailto:fachrial.tech@gmail.com"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-[10px] opacity-60">fachrial.tech@gmail.com</div>
                  </div>
                </a>

                {/* 5. GitHub */}
                <a
                  href="https://github.com/fachrial-official"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-500/10 transition-all hover:shadow-[0_0_12px_rgba(100,116,139,0.5)]"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">GitHub</div>
                    <div className="text-[10px] opacity-60">@fachrial-official</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Transparency Slider Popover with 50% light glow */}
          <div ref={sliderRef} className="relative">
            <button
              id="nav-btn-transparency"
              onClick={() => setIsSliderOpen(!isSliderOpen)}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isSliderOpen
                  ? 'bg-blue-500/20 text-blue-500'
                  : 'hover:bg-blue-500/10 text-slate-600 dark:text-slate-300'
              } hover:shadow-[0_0_14px_rgba(59,130,246,0.5)] active:scale-95`}
              title="Atur Transparansi Navbar & Card (Glassmorphism)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {isSliderOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 p-4 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/80'
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/60'
                } backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Transparansi Kaca (Glass)
                  </span>
                  <span className="text-blue-500 font-mono">{transparency}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={transparency}
                  onChange={(e) => setTransparency(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] opacity-60 mt-1">
                  <span>Ultra Transparan</span>
                  <span>Solid</span>
                </div>
                <div className="mt-3 text-[11px] leading-relaxed opacity-70 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  Mengatur opacity & efek blur melayang pada seluruh komponen website secara realtime.
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Theme Toggle Button with 50% subtle light effect */}
          <button
            id="nav-btn-theme-toggle"
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            } hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95`}
            title={isDark ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
};
