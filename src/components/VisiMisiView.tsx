import React from 'react';
import {
  Compass,
  Target,
  Sparkles,
  ShieldCheck,
  Code2,
  Users,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Mail,
  Building,
  Database
} from 'lucide-react';
import { defaultVisiMisi, defaultAuthor } from '../data/defaultData';
import { ActiveTab, VerifiedAuthor } from '../types';

interface VisiMisiViewProps {
  setCurrentTab: (tab: ActiveTab) => void;
  verifiedAuthors?: VerifiedAuthor[];
  transparency: number;
  isDark: boolean;
}

export const VisiMisiView: React.FC<VisiMisiViewProps> = ({
  setCurrentTab,
  verifiedAuthors = [],
  transparency,
  isDark
}) => {
  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <div className="w-full pb-20 pt-20">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>Visi & Misi Resmi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Arah Langkah & Komitmen Facrial
        </h1>
        <p className="text-sm sm:text-base opacity-70 mt-2 leading-relaxed">
          Membangun masa depan digital yang aman, transparan, dan berdaya guna melalui keterbukaan pengetahuan serta rekayasa perangkat lunak modern.
        </p>
      </div>

      {/* Main Visi Card */}
      <div
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`,
          backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
        }}
        className={`p-8 sm:p-12 rounded-3xl border mb-10 shadow-2xl transition-all duration-300 ${
          isDark ? 'border-slate-800 text-slate-100 shadow-black/50' : 'border-slate-200 text-slate-800 shadow-slate-200/70'
        }`}
      >
        <div className="flex items-center gap-3 text-blue-500 font-bold text-sm uppercase tracking-wider mb-4">
          <Target className="w-5 h-5" />
          <span>Visi Utama</span>
        </div>
        <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed tracking-tight text-slate-900 dark:text-slate-100">
          &ldquo;{defaultVisiMisi.visi}&rdquo;
        </blockquote>
      </div>

      {/* 4 Misi Cards Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>4 Pilar Misi Strategis</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {defaultVisiMisi.misi.map((m, idx) => {
            const icons = [Code2, ShieldCheck, Sparkles, Users];
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: isDark
                    ? `rgba(15, 23, 42, ${alpha})`
                    : `rgba(255, 255, 255, ${alpha})`,
                  backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
                }}
                className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-lg ${
                  isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                } hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">
                  {m.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Authors Section */}
      {verifiedAuthors.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Dewan Penulis & Author Terverifikasi</span>
              </h2>
              <p className="text-xs opacity-70 mt-1">
                Para kontributor dan penulis resmi yang telah melalui verifikasi email oleh admin serta terintegrasi langsung dengan database Supabase.
              </p>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              <span>Database Terverifikasi</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedAuthors.map((author) => (
              <div
                key={author.id}
                style={{
                  backgroundColor: isDark
                    ? `rgba(15, 23, 42, ${alpha})`
                    : `rgba(255, 255, 255, ${alpha})`,
                  backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
                }}
                className={`p-5 rounded-3xl border transition-all duration-300 shadow-md ${
                  isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                } hover:shadow-[0_0_16px_rgba(59,130,246,0.3)] flex items-start gap-4`}
              >
                <div className="relative shrink-0">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-blue-600 text-white shadow-sm" title="Terverifikasi Resmi">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm truncate">{author.name}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Email Verified</span>
                    </span>
                  </div>

                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    {author.role}
                  </p>

                  {author.institution && (
                    <div className="text-[11px] opacity-70 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{author.institution}</span>
                    </div>
                  )}

                  {author.bio && (
                    <p className="text-xs opacity-75 mt-2 line-clamp-2 italic">
                      &ldquo;{author.bio}&rdquo;
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] opacity-60 font-mono">
                    <span>{author.verificationCode || 'VRF-FACRIAL-2026'}</span>
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Supabase Synced</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-600/30">
        <div>
          <h3 className="text-2xl font-bold">Mari Berkolaborasi Bersama</h3>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Punya gagasan artikel, usulan agenda riset, atau proyek open source? Hubungi Fachrial untuk kolaborasi langsung.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('home')}
          className="px-6 py-3 rounded-2xl bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] active:scale-95 cursor-pointer whitespace-nowrap"
        >
          Jelajahi Beranda
        </button>
      </div>
    </div>
  );
};
