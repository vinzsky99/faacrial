// Facrial - Next.js Halaman Form Input Admin (Upload teks & file)
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

// Sanitasi dasar mencegah Cross-Site Scripting (XSS)
function sanitize(str) {
  if (!str) return '';
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi');
  const [fileUrl, setFileUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const safeTitle = sanitize(title);
    const safeContent = sanitize(content);
    const safeExcerpt = sanitize(excerpt) || safeTitle;
    const slug = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPost = {
      id: `post-${Date.now()}`,
      slug,
      title: safeTitle,
      excerpt: safeExcerpt,
      content: safeContent,
      category,
      cover_images: [fileUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'],
      author_name: 'Fachrial',
      published_at_display: new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    const { error } = await supabase.from('posts').insert([newPost]);

    setLoading(false);
    if (error) {
      setStatusMsg({ type: 'error', text: `Gagal menyimpan: ${error.message}` });
    } else {
      setStatusMsg({ type: 'success', text: 'Artikel berhasil disimpan ke Supabase realtime!' });
      setTitle('');
      setContent('');
      setExcerpt('');
      setFileUrl('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel Admin & Upload Konten</h1>
        <p className="text-sm opacity-60">Unggah teks artikel, cover gambar, atau lampiran berkas ke database Supabase.</p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Judul Artikel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Teknologi">Teknologi</option>
              <option value="Pengembangan Web">Pengembangan Web</option>
              <option value="Visi Digital">Visi Digital</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Agenda">Agenda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">URL Gambar / Berkas Media</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-1">Ringkasan (Excerpt)</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Teks singkat yang muncul di feed timeline..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-1">Isi Konten Lengkap *</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan isi artikel..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm font-mono focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          {loading ? 'Menyimpan ke Supabase...' : 'Publikasikan Artikel Sekarang'}
        </button>
      </form>
    </div>
  );
}
