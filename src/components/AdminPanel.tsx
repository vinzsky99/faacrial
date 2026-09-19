import React, { useState } from 'react';
import {
  PenSquare,
  Calendar,
  Database,
  Upload,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  X,
  ArrowRight
} from 'lucide-react';
import { Post, Agenda, Author, Attachment } from '../types';
import { sanitizeInput, slugify, formatIndonesianDate } from '../lib/security';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';

interface AdminPanelProps {
  author: Author;
  onAddPost: (post: Post) => void;
  onAddAgenda: (agenda: Agenda) => void;
  transparency: number;
  isDark: boolean;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  author,
  onAddPost,
  onAddAgenda,
  transparency,
  isDark,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'article' | 'agenda' | 'supabase'>('article');

  // Article form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Post['category']>('Teknologi');
  const [tags, setTags] = useState('Next.js, Supabase, TailwindCSS');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [readingTime, setReadingTime] = useState(5);
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState<Attachment['type']>('pdf');
  const [postSuccess, setPostSuccess] = useState(false);

  // Agenda form states
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDate, setAgendaDate] = useState('28 September 2026');
  const [agendaTime, setAgendaTime] = useState('14:00 - 16:30 WIB');
  const [agendaLocation, setAgendaLocation] = useState('Auditorium Digital Jakarta & Zoom');
  const [agendaCategory, setAgendaCategory] = useState('Workshop');
  const [agendaDesc, setAgendaDesc] = useState('');
  const [agendaSuccess, setAgendaSuccess] = useState(false);

  // Supabase states
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.anonKey);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Add dummy attachment
  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    const item: Attachment = {
      id: `att-${Date.now()}`,
      name: newAttachmentName.trim(),
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      type: newAttachmentType,
      url: '#'
    };
    setAttachments([...attachments, item]);
    setNewAttachmentName('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Submit Article
  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Strict XSS Sanitization
    const safeTitle = sanitizeInput(title);
    const safeExcerpt = sanitizeInput(excerpt) || safeTitle;
    const safeContent = sanitizeInput(content);
    const safeSlug = slugify(safeTitle) || `post-${Date.now()}`;

    const tagList = tags
      .split(',')
      .map((t) => sanitizeInput(t.trim()))
      .filter(Boolean);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      slug: safeSlug,
      title: safeTitle,
      excerpt: safeExcerpt,
      content: safeContent,
      category,
      tags: tagList,
      coverImages: [coverUrl.trim()],
      author,
      createdAt: new Date().toISOString(),
      publishedAtDisplay: formatIndonesianDate(new Date()),
      likes: 1,
      commentsCount: 0,
      views: 1,
      readingTimeMinutes: readingTime || 5,
      attachments,
      timelineSide: 'left'
    };

    onAddPost(newPost);
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      onBack();
    }, 1800);
  };

  // Submit Agenda
  const handleSubmitAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaTitle.trim()) return;

    const safeTitle = sanitizeInput(agendaTitle);
    const safeDesc = sanitizeInput(agendaDesc);
    const safeLoc = sanitizeInput(agendaLocation);

    const newAgenda: Agenda = {
      id: `agenda-${Date.now()}`,
      title: safeTitle,
      date: sanitizeInput(agendaDate),
      time: sanitizeInput(agendaTime),
      location: safeLoc,
      category: sanitizeInput(agendaCategory),
      description: safeDesc,
      status: 'Mendatang',
      author: author.name
    };

    onAddAgenda(newAgenda);
    setAgendaSuccess(true);
    setTimeout(() => {
      setAgendaSuccess(false);
      onBack();
    }, 1800);
  };

  // Save Supabase Configuration
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleCopySchema = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2500);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <div className="w-full pb-20 pt-20">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panel Manajemen Author & Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Input Konten, Berkas & Supabase
          </h1>
        </div>

        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-slate-100'
          } hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]`}
        >
          Lihat Beranda
        </button>
      </div>

      {/* Admin Navigation Pills with 50% Touch Glow */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('article')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'article'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isDark
              ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95`}
        >
          <PenSquare className="w-4 h-4" />
          <span>Upload Artikel Baru</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isDark
              ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95`}
        >
          <Calendar className="w-4 h-4" />
          <span>Buat Agenda Kegiatan</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isDark
              ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95`}
        >
          <Database className="w-4 h-4" />
          <span>Koneksi Supabase</span>
        </button>
      </div>

      {/* Main Form Body with Customizable Glassmorphism */}
      <div
        id="admin-form-container"
        style={{
          backgroundColor: isDark
            ? `rgba(15, 23, 42, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`,
          backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
        }}
        className={`rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
          isDark
            ? 'border-slate-800 text-slate-100 shadow-black/50'
            : 'border-slate-200 text-slate-800 shadow-slate-200/70'
        }`}
      >
        {/* TAB 1: ARTICLE FORM */}
        {activeTab === 'article' && (
          <form onSubmit={handleSubmitArticle} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-lg">Form Publikasi Artikel & Berita</h3>
              </div>
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Proteksi XSS Aktif
              </span>
            </div>

            {postSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Artikel berhasil dipublikasikan ke Timeline!</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Judul Artikel / Berita *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Menguasai Edge Functions di Next.js 15..."
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-purple-500 ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
                required
              />
              <span className="text-[11px] opacity-60 mt-1 block">
                Slug otomatis: {slugify(title) || 'judul-artikel'}
              </span>
            </div>

            {/* Category, Reading Time, Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Post['category'])}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <option value="Teknologi">Teknologi</option>
                  <option value="Pengembangan Web">Pengembangan Web</option>
                  <option value="Visi Digital">Visi Digital</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Agenda">Agenda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Estimasi Baca (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Tags (Pisahkan Koma)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Next.js, Supabase, AI"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                URL Gambar Utama / Cover Slider
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>
              {coverUrl && (
                <div className="mt-2 relative h-36 rounded-xl overflow-hidden border border-slate-700">
                  <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px]">
                    Pratinjau Cover
                  </span>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Ringkasan Singkat (Excerpt)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Deskripsi singkat yang tampil di feed timeline Facebook..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Isi Konten Lengkap *
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan isi artikel lengkap di sini. Sistem akan otomatis memfilter script jahat."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-purple-500 font-mono ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
                required
              />
            </div>

            {/* Upload File / Lampiran (PDF, Doc, Image, Video) */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-500/5">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Lampiran Berkas (PDF, Gambar, Arsip, Dokumen)
              </label>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="Nama berkas, cth: Dokumentasi_Teknis.pdf"
                  className={`flex-1 px-4 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                />
                <select
                  value={newAttachmentType}
                  onChange={(e) => setNewAttachmentType(e.target.value as Attachment['type'])}
                  className={`px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="image">Gambar Asset</option>
                  <option value="doc">Dokumen / Teks</option>
                  <option value="archive">ZIP / Archive</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tambahkan Berkas</span>
                </button>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold">{att.name}</span>
                        <span className="opacity-50">({att.type.toUpperCase()} • {att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                        title="Hapus Lampiran"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button with 50% Touch Glow */}
            <button
              id="btn-publish-article"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Publikasikan Artikel Sekarang</span>
            </button>
          </form>
        )}

        {/* TAB 2: AGENDA FORM */}
        {activeTab === 'agenda' && (
          <form onSubmit={handleSubmitAgenda} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-lg">Buat Agenda / Kegiatan Baru</h3>
              </div>
              <span className="text-xs text-blue-500">Author: {author.name}</span>
            </div>

            {agendaSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Agenda kegiatan berhasil ditambahkan!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Nama Agenda / Acara *
              </label>
              <input
                type="text"
                value={agendaTitle}
                onChange={(e) => setAgendaTitle(e.target.value)}
                placeholder="Contoh: Meetup Komunitas Next.js & Supabase..."
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-purple-500 ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Tanggal
                </label>
                <input
                  type="text"
                  value={agendaDate}
                  onChange={(e) => setAgendaDate(e.target.value)}
                  placeholder="28 September 2026"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Waktu
                </label>
                <input
                  type="text"
                  value={agendaTime}
                  onChange={(e) => setAgendaTime(e.target.value)}
                  placeholder="19:00 - 21:00 WIB"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Lokasi / Venue
                </label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  placeholder="Live Zoom & Tech Space Jakarta"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Jenis Acara
                </label>
                <input
                  type="text"
                  value={agendaCategory}
                  onChange={(e) => setAgendaCategory(e.target.value)}
                  placeholder="Workshop / Webinar / Konferensi"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Deskripsi Agenda
              </label>
              <textarea
                rows={4}
                value={agendaDesc}
                onChange={(e) => setAgendaDesc(e.target.value)}
                placeholder="Rincian materi yang dibahas, pembicara, dan panduan peserta..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-purple-500 ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
              />
            </div>

            <button
              id="btn-publish-agenda"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Simpan Agenda Kegiatan</span>
            </button>
          </form>
        )}

        {/* TAB 3: SUPABASE CONFIGURATION & SCHEMA */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg">Konfigurasi Database Supabase Realtime</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                PostgreSQL Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              Website Facrial menggunakan arsitektur dual-mode: penyimpanan lokal reaktif instan saat preview, serta integrasi langsung ke Supabase Cloud saat kredensial URL dan Anon Key dimasukkan di bawah ini.
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  Simpan Konfigurasi Supabase
                </button>
                {configSaved && (
                  <span className="text-xs text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Kredensial tersimpan!
                  </span>
                )}
              </div>
            </form>

            {/* SQL Schema Copy Block */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Skema SQL Database Supabase (Copy-Paste ke Dashboard)</span>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSchema ? 'Tersalin!' : 'Salin Skema SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
