import React from 'react';
import {
  ShieldCheck,
  Instagram,
  Linkedin,
  Mail,
  Github,
  Heart,
  Sparkles,
  ArrowUp,
  Lock
} from 'lucide-react';
import { ActiveTab, Author } from '../types';

interface FooterProps {
  author: Author;
  setCurrentTab: (tab: ActiveTab) => void;
  transparency: number;
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  author,
  setCurrentTab,
  transparency,
  isDark
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <footer
      id="facrial-footer"
      style={{
        backgroundColor: isDark
          ? `rgba(15, 23, 42, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`,
        backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
      }}
      className={`mt-16 rounded-3xl border transition-all duration-300 shadow-xl ${
        isDark
          ? 'border-slate-800 text-slate-100 shadow-black/30'
          : 'border-slate-200 text-slate-800 shadow-slate-200/50'
      } p-6 sm:p-10 mb-8`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              F
            </div>
            <span className="font-extrabold text-xl tracking-tight">FACRIAL</span>
            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
          </div>
          <p className="text-xs sm:text-sm opacity-70 leading-relaxed max-w-md">
            Portal berita, artikel timeline selang-seling ala Facebook dengan floating navbar, tema light & dark, pengaturan transparansi kaca adaptif, dan integrasi realtime Supabase.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-500 pt-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>XSS & SQL Injection Free Architecture</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">
            Navigasi Utama
          </h4>
          <ul className="space-y-2 text-xs opacity-80">
            <li>
              <button
                onClick={() => { setCurrentTab('home'); scrollToTop(); }}
                className="hover:text-blue-500 transition-colors cursor-pointer"
              >
                Beranda Timeline
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('visi-misi'); scrollToTop(); }}
                className="hover:text-blue-500 transition-colors cursor-pointer"
              >
                Visi & Misi
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('agenda'); scrollToTop(); }}
                className="hover:text-blue-500 transition-colors cursor-pointer"
              >
                Agenda Kegiatan
              </button>
            </li>
          </ul>
        </div>

        {/* Connect & Social */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">
            Koneksi Resmi
          </h4>
          <div className="flex items-center gap-2 mb-4">
            <a
              href={author.instagram}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-all hover:shadow-[0_0_12px_rgba(236,72,153,0.5)]"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={author.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-all hover:shadow-[0_0_12px_rgba(14,165,233,0.5)]"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${author.email}`}
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href={author.github}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20 transition-all hover:shadow-[0_0_12px_rgba(100,116,139,0.5)]"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-blue-500/10 hover:text-blue-500 transition-all"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Atas</span>
          </button>
        </div>
      </div>

      {/* Required Bottom Copyright line */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-80 text-center sm:text-left">
        <div>
          Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.
        </div>
        <div className="flex items-center gap-2">
          <span>Keamanan Terjamin</span>
          <span>•</span>
          <span>Next.js 15 Ready</span>
          <span>•</span>
          <span>Supabase Realtime</span>
          <span>•</span>
          <button
            onClick={() => { setCurrentTab('admin'); scrollToTop(); }}
            className="text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors cursor-pointer p-1"
            title="Portal Khusus Author (Terkunci)"
          >
            <Lock className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
