import React from 'react';
import { Calendar, Clock, MapPin, ArrowLeft, PlusCircle, ExternalLink, Tag } from 'lucide-react';
import { Post, ThemeConfig } from '../types';

interface AgendaViewProps {
  posts: Post[];
  themeConfig: ThemeConfig;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onOpenNewAgendaModal: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  posts,
  themeConfig,
  onBack,
  onSelectPost,
  onOpenNewAgendaModal,
}) => {
  const agendaPosts = posts.filter((p) => p.isAgenda || p.category === 'Agenda');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800/60 hover-light-glow transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Linimasa</span>
        </button>

        <button
          onClick={onOpenNewAgendaModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover-light-glow transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          + Tulis Agenda Baru
        </button>
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Jadwal & Agenda Terverifikasi
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          Agenda Kegiatan & Workshop Facrial
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Ikuti rangkaian kegiatan workshop, seminar digital, rilis fitur, dan temu komunitas pengembang yang diselenggarakan secara berkala.
        </p>
      </div>

      {/* Grid Kartu Agenda */}
      <div className="space-y-4">
        {agendaPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Belum ada agenda kegiatan yang terdaftar saat ini.
          </div>
        ) : (
          agendaPosts.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border shadow-md transition-all hover-light-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex flex-col items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase mt-1">Agenda</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {item.agenda?.status || 'Mendatang'}
                    </span>
                    <span className="text-xs text-slate-400">{item.dayName}, {item.formattedDate}</span>
                  </div>
                  <h3
                    onClick={() => onSelectPost(item.slug)}
                    className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium flex-wrap">
                    {item.agenda && (
                      <>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {item.agenda.eventTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {item.agenda.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onSelectPost(item.slug)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover-light-glow shadow-md"
                >
                  Detail Agenda & Rincian &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
