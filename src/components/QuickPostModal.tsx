import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Paperclip,
  Image as ImageIcon,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { Post, ThemeConfig, Attachment, VerifiedAuthor, Author } from '../types';
import { primaryAuthor } from '../data/initialData';
import { sanitizeText, createSafeSlug } from '../lib/security';
import { supabase, insertPost, getVerifiedAuthors } from '../lib/supabase';

interface QuickPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'post' | 'agenda';
  themeConfig: ThemeConfig;
  onPostCreated: (post: Post) => void;
}

export const QuickPostModal: React.FC<QuickPostModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'post',
  themeConfig,
  onPostCreated,
}) => {
  const [isAgenda, setIsAgenda] = useState(defaultType === 'agenda');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>(
    defaultType === 'agenda' ? 'Agenda' : 'Hukum & Politik'
  );
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
  );
  // Koleksi multi-gambar untuk Motion Slider
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageInputUrl, setNewImageInputUrl] = useState('');

  const [agendaDate, setAgendaDate] = useState('2026-10-20');
  const [agendaTime, setAgendaTime] = useState('10:00 - 13:00 WIB');
  const [agendaLocation, setAgendaLocation] = useState('Ruang Sidang & Zoom Hybrid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload State (PDF & Dokumen)
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [verifiedAuthors, setVerifiedAuthors] = useState<VerifiedAuthor[]>([]);
  const [selectedAuthorEmail, setSelectedAuthorEmail] = useState('fachrial.official2026@gmail.com');

  useEffect(() => {
    getVerifiedAuthors().then((authors) => {
      setVerifiedAuthors(authors);
      if (authors.length > 0) {
        setSelectedAuthorEmail(authors[0].email);
      }
    });
  }, []);

  if (!isOpen) return null;

  // Handle Multi-file Upload (Mendukung Banyak Gambar Sekaligus & Berkas PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (uploadEv) => {
          if (uploadEv.target?.result) {
            const dataUrl = uploadEv.target.result as string;
            setUploadedImages((prev) => [...prev, dataUrl]);
            setCoverUrl((prev) => (prev ? prev : dataUrl));
          }
        };
        reader.readAsDataURL(file);
      } else {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const newAttachment: Attachment = {
          name: file.name,
          size: `${sizeMB} MB`,
          type: file.type.includes('pdf') ? 'pdf' : 'document',
          url: '#',
        };
        setUploadedFiles((prev) => [...prev, newAttachment]);
      }
    });
  };

  const handleAddImageUrl = () => {
    if (newImageInputUrl.trim()) {
      setUploadedImages((prev) => [...prev, newImageInputUrl.trim()]);
      setNewImageInputUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const cleanTitle = sanitizeText(title.trim());
    const cleanContent = sanitizeText(content.trim());
    const slug = createSafeSlug(cleanTitle) + '-' + Math.floor(Math.random() * 1000);

    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[now.getDay()];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} 2026`;
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WIB`;

    const matchedAuthor = verifiedAuthors.find((a) => a.email === selectedAuthorEmail);
    const postAuthor: Author = matchedAuthor
      ? {
          id: matchedAuthor.id,
          name: matchedAuthor.name,
          role: matchedAuthor.role,
          avatar: matchedAuthor.avatar || primaryAuthor.avatar,
          bio: matchedAuthor.bio || primaryAuthor.bio,
          verified: true,
          socials: {
            instagram: matchedAuthor.socials?.instagram || primaryAuthor.socials.instagram,
            facebook: matchedAuthor.socials?.facebook || primaryAuthor.socials.facebook,
            linkedin: matchedAuthor.socials?.linkedin || primaryAuthor.socials.linkedin,
            email: matchedAuthor.email,
          },
        }
      : primaryAuthor;

    const finalImages = uploadedImages.length > 0 ? uploadedImages : [coverUrl];

    const newPost: Post = {
      id: 'quick-' + Date.now(),
      slug,
      title: cleanTitle,
      excerpt: cleanContent.slice(0, 150) + '...',
      content: cleanContent,
      category: isAgenda ? 'Agenda' : category,
      coverImage: finalImages[0],
      images: finalImages,
      date: now.toISOString(),
      dayName,
      formattedDate,
      time: timeFormatted,
      author: postAuthor,
      readTime: '3 menit baca',
      likes: 1,
      views: 12,
      commentsCount: 0,
      tags: [isAgenda ? 'Agenda' : category, 'HukumIndonesia', 'Reformasi'],
      isAgenda,
      agenda: isAgenda
        ? {
            eventDate: agendaDate,
            eventTime: agendaTime,
            location: agendaLocation,
            status: 'Mendatang',
          }
        : undefined,
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    await insertPost(newPost);
    onPostCreated(newPost);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative max-w-xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl transition-colors duration-200 max-h-[90vh] overflow-y-auto ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold font-heading">
              {isAgenda ? 'Publikasikan Agenda Simposium Hukum' : 'Tulis Berita Investigasi & Fakta Sejarah'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Postingan */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsAgenda(false)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                !isAgenda ? 'bg-blue-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              Ulasan Berita / Tragedi
            </button>
            <button
              type="button"
              onClick={() => setIsAgenda(true)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                isAgenda ? 'bg-amber-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              Agenda Kegiatan Hukum
            </button>
          </div>

          {/* Author Terverifikasi Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Author Terverifikasi Email Resmi
            </label>
            <select
              value={selectedAuthorEmail}
              onChange={(e) => setSelectedAuthorEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {verifiedAuthors.map((a) => (
                <option key={a.id} value={a.email}>
                  {a.name} ({a.email}) - {a.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Judul {isAgenda ? 'Agenda' : 'Berita Investigasi'} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mengungkap Fakta & Rekonstruksi Peristiwa 1998..."
              className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {isAgenda ? (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tanggal</label>
                <input
                  type="date"
                  value={agendaDate}
                  onChange={(e) => setAgendaDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Waktu</label>
                <input
                  type="text"
                  value={agendaTime}
                  onChange={(e) => setAgendaTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Lokasi</label>
                <input
                  type="text"
                  value={agendaLocation}
                  onChange={(e) => setAgendaLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kategori Berita / Tragedi (Teks Bebas Sesuai Keinginan) *
              </label>
              <textarea
                rows={2}
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Tulis kategori berita atau tragedi sesuai keinginan Anda (misal: Tragedi 1998, Investigasi HAM, Orde Baru, dll.)..."
                className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Uraian Fakta & Analisis *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Jelaskan ringkasan kronologi kejadian, bukti dokumen, atau agenda kegiatan..."
              className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* KOLOM UPLOAD GAMBAR (SLIDER MOTION) & FILE DATA (PDF) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                Upload Gambar Slider Motion & Berkas PDF
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold">Auto-Sync Supabase</span>
            </label>

            <div className="space-y-2">
              <label className="w-full cursor-pointer flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Pilih Banyak Gambar (Slider) atau Berkas PDF (Bisa Pilih Sekaligus)</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,.pdf,.doc,.docx" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {/* Tambah URL Gambar Tambahan */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageInputUrl}
                  onChange={(e) => setNewImageInputUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar tambahan untuk Motion Slider..."
                  className={`flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    themeConfig.mode === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  + Tambah Foto
                </button>
              </div>
            </div>

            {/* Preview Galeri Foto Slider */}
            {uploadedImages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  <span>📸 Foto Siap Ditampilkan Dalam Motion Slider ({uploadedImages.length}):</span>
                  {uploadedImages.length > 1 && (
                    <span className="text-blue-500 text-[10px]">✓ Slider Motion Aktif</span>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {uploadedImages.map((imgSrc, i) => (
                    <div key={i} className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0 bg-slate-900">
                      <img src={imgSrc} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center font-bold">
                        {i === 0 ? 'Cover' : `Slide ${i + 1}`}
                      </span>
                      {uploadedImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Berkas Lampiran PDF */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  📄 Berkas Dokumen Terlampir ({uploadedFiles.length}):
                </div>
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 truncate max-w-[240px]">
                      <FileText className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate text-[11px] font-medium">{f.name} ({f.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 text-[10px] font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Tervalidasi Database
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover-light-glow shadow-md shadow-blue-500/25"
              >
                {isSubmitting ? 'Menyimpan...' : 'Terbitkan Sekarang'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
