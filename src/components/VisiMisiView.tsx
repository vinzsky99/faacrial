import React, { useState } from 'react';
import {
  Compass,
  Target,
  Scale,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  FileText,
  AlertTriangle,
  History,
  Landmark,
  Gavel
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface VisiMisiViewProps {
  themeConfig: ThemeConfig;
  onBack: () => void;
}

export const VisiMisiView: React.FC<VisiMisiViewProps> = ({ themeConfig, onBack }) => {
  const [activePillar, setActivePillar] = useState<number>(0);

  const pillars = [
    {
      title: 'Pengungkapan Fakta Sejarah & Rekonsiliasi Nasional',
      icon: History,
      desc: 'Membuka tabir fakta otentik dan arsip historis tragedi kemanusiaan bangsa, termasuk Peristiwa 1965/G30S, Tragedi Trisakti, Kerusuhan Mei 1998, serta penculikan aktivis pro-demokrasi demi keadilan para korban dan rekonsiliasi kebangsaan yang bermartabat.',
      actions: [
        'Deklasifikasi arsip dokumen investigasi dan laporan TGPF (Tim Gabungan Pencari Fakta)',
        'Advokasi pengakuan resmi negara terhadap pelanggaran HAM berat masa lalu',
        'Dokumentasi lisan para saksi kunci dan keluarga korban rezim otoritarian'
      ]
    },
    {
      title: 'Pengawalan Konstitusionalitas & Independensi Peradilan',
      icon: Scale,
      desc: 'Mengawal kemurnian putusan Mahkamah Konstitusi (MK) dan Mahkamah Agung (MA) agar terbebas dari intervensi kekuasaan eksekutif, konflik kepentingan dinasti politik, dan rekayasa legislasi yang melemahkan sendi-sendi negara hukum (Rechtsstaat).',
      actions: [
        'Eksaminasi publik berkala terhadap pengujian undang-undang dan sengketa pemilu',
        'Pemberantasan mafia peradilan dan korupsi politik di lembaga yudikatif',
        'Penegakan prinsip *Checks and Balances* ketatanegaraan secara proporsional'
      ]
    },
    {
      title: 'Literasi Hukum Kritis & Pertahanan Demokrasi Warga',
      icon: Landmark,
      desc: 'Membangun kesadaran hukum masyarakat sipil agar mampu membela hak konstitusionalnya di hadapan kesewenang-wenangan aparat, menolak represi kebebasan berekspresi, serta mengikis oligarki yang membajak institusi kenegaraan.',
      actions: [
        'Publikasi panduan bantuan hukum cuma-cuma dan hak korban kriminalisasi',
        'Diseminasi ulasan hukum bahasa lugas bagi generasi muda dan mahasiswa',
        'Monitoring kebijakan publik dan rancangan regulasi bermasalah secara transparan'
      ]
    },
    {
      title: 'Wadah Jurnalisme Investigasi Independen Terverifikasi',
      icon: ShieldCheck,
      desc: 'Menjadi benteng jurnalisme hukum yang tidak dapat disuap, menyajikan data terverifikasi dengan metodologi investigasi mendalam, serta menjamin keselamatan dan integritas para author terverifikasi resmi.',
      actions: [
        'Standar verifikasi ketat berbasis KTA Redaksi dan rekam jejak riset akademik',
        'Perlindungan data narasumber melalui protokol enkripsi dan keamanan digital anti-XSS',
        'Publikasi laporan berani tanpa intervensi konglomerasi media manapun'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Tombol Kembali ke Linimasa */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800/60 hover-light-glow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa Berita</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          Manifesto Hukum & Politik
        </span>
      </div>

      {/* Header Utama Visi & Misi */}
      <div
        className={`p-6 sm:p-12 rounded-3xl border shadow-xl text-center space-y-4 relative overflow-hidden ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
          <Scale className="w-8 h-8" />
        </div>

        <span className="px-3.5 py-1 text-xs font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-widest">
          Fondasi Nilai Redaksi Facrial 2026
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
          Visi & Misi Penegakan Hukum, Politik & Kebenaran Sejarah
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Facrial berdiri sebagai benteng nurani bangsa dan platform jurnalisme investigasi yang menguak fakta hukum di balik tragedi politik nasional, mengawal supremasi konstitusi, serta menuntut akuntabilitas negara demi masa depan demokrasi Indonesia yang adil.
        </p>
      </div>

      {/* Visi Utama */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-4 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/85 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white">
              Visi Luhur Redaksi
            </h2>
            <p className="text-xs text-slate-400">Prinsip dasar yang menuntun setiap tinta investigasi kami</p>
          </div>
        </div>

        <blockquote className="p-5 rounded-2xl bg-blue-500/5 border-l-4 border-blue-600 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
          "Menjadi pilar kebenaran hukum dan politik terdepan di Indonesia yang berani membongkar kejahatan masa lalu yang terbungkam, mengawal integritas konstitusi dari ancaman otoritarianisme baru, serta mengembalikan kedaulatan hukum substantif kepada seluruh rakyat."
        </blockquote>
      </div>

      {/* Empat Pilar Misi Interaktif */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-500" />
            Empat Pilar Misi Perjuangan Redaksi
          </h3>
          <span className="text-xs text-slate-400">Pilih pilar untuk rincian strategi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isSelected = activePillar === idx;
            return (
              <button
                key={idx}
                onClick={() => setActivePillar(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : themeConfig.mode === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold font-heading line-clamp-2">
                  {pillar.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Konten Rincian Pilar yang Aktif */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-4 animate-in fade-in duration-200 ${
            themeConfig.mode === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              {React.createElement(pillars[activePillar].icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Pilar #{activePillar + 1}
              </span>
              <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                {pillars[activePillar].title}
              </h4>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {pillars[activePillar].desc}
          </p>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Langkah Nyata & Agenda Penegakan:
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {pillars[activePillar].actions.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nilai Utama Redaksi (Core Values) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-4 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
          Nilai Pokok Kode Etik Investigasi Facrial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              1. Veritas (Kebenaran)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Setiap kutipan, angka korban, dan kronologi didasarkan pada dokumen primer dan uji forensik sejarah.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              2. Iustitia (Keadilan)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Berpihak tanpa kompromi kepada korban pelanggaran HAM dan masyarakat yang dirugikan oleh kebijakan korup.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              3. Integritas (Bebas Tekanan)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menolak tunduk pada kekuasaan eksekutif, sponsor politik partisan, ataupun hegemoni konglomerat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-1.5">
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              4. Humanitas (Kemanusiaan)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menjunjung tinggi harkat martabat manusia sebagai fondasi tertinggi dalam konstitusi Republik Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
