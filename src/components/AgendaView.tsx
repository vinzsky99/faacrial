import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Users,
  Paperclip,
  FileText,
  Download
} from 'lucide-react';
import { Agenda, ActiveTab } from '../types';

interface AgendaViewProps {
  agendas: Agenda[];
  setCurrentTab: (tab: ActiveTab) => void;
  transparency: number;
  isDark: boolean;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  agendas,
  setCurrentTab,
  transparency,
  isDark
}) => {
  const [filter, setFilter] = useState<'Semua' | 'Mendatang' | 'Selesai'>('Semua');

  const filtered = filter === 'Semua'
    ? agendas
    : agendas.filter((a) => a.status === filter);

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <div className="w-full pb-20 pt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jadwal & Agenda Terverifikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Agenda Kegiatan & Kolaborasi
          </h1>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            Rangkaian workshop, webinar, dan temu komunitas yang diselenggarakan oleh Fachrial.
          </p>
        </div>

        <button
          id="btn-add-agenda-from-view"
          onClick={() => setCurrentTab('admin')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['Semua', 'Mendatang', 'Selesai'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === f
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            } hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Agenda Timeline List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
            }}
            className={`p-6 rounded-3xl border transition-all duration-300 shadow-lg ${
              isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
            } hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] flex flex-col md:flex-row gap-6 group`}
          >
            {/* Optional Agenda Banner / Flyer Image */}
            {item.coverImage && (
              <div className="md:w-56 h-44 sm:h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 relative">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>Flyer Agenda</span>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  {item.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                  {item.status}
                </span>
                <span className="text-xs opacity-60">Penyelenggara: {item.author}</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold group-hover:text-blue-500 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm opacity-80 leading-relaxed">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs opacity-70 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {item.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {item.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {item.location}
                </span>
              </div>

              {/* Attachments / File Data Lampiran Agenda */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3 text-blue-500" />
                    <span>File Lampiran & Berkas Data Agenda ({item.attachments.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url || '#'}
                        onClick={(e) => {
                          if (att.url === '#') {
                            e.preventDefault();
                            alert(`Mengunduh berkas data agenda: ${att.name}`);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-xs font-medium hover:border-blue-500 hover:text-blue-500 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate max-w-[180px]">{att.name}</span>
                        <span className="text-[10px] opacity-60">({att.size})</span>
                        <Download className="w-3 h-3 ml-1 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex md:flex-col justify-end items-end gap-2">
              <button
                onClick={() => alert(`Anda terdaftar untuk agenda: ${item.title}`)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Ikuti Agenda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
