import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Paperclip,
  Eye,
  Sliders,
  Sparkles,
  UserCheck,
  Mail,
  UserPlus,
  Lock,
  Database,
  RefreshCw,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  BadgeCheck,
  Camera,
  Edit3
} from 'lucide-react';
import { Post, Attachment, AgendaDetails, ThemeConfig, VerifiedAuthor, Author } from '../../types';
import { sanitizeText, createSafeSlug } from '../../lib/security';
import { primaryAuthor } from '../../data/initialData';
import {
  supabase,
  insertPost,
  isSupabaseConfigured,
  getVerifiedAuthors,
  verifyAndSaveAuthor,
  checkAuthorVerification,
  updateAuthorProfile
} from '../../lib/supabase';

interface AdminPageProps {
  posts: Post[];
  themeConfig: ThemeConfig;
  onBack: () => void;
  onPostCreated: (newPost: Post) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  posts,
  themeConfig,
  onBack,
  onPostCreated,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'create' | 'authors' | 'manage'>('create');

  // Verification Portal State (Email Verification to Database)
  const [verifiedAuthorsList, setVerifiedAuthorsList] = useState<VerifiedAuthor[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('fachrial.official2026@gmail.com');
  const [isAuthorVerified, setIsAuthorVerified] = useState(true);
  const [activeAuthor, setActiveAuthor] = useState<VerifiedAuthor | null>(null);
  const [verificationInputEmail, setVerificationInputEmail] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // New Author Verification Form State (Admin adds & verifies authors to Supabase)
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('Peneliti Hukum & Sejarah HAM');
  const [newAuthorBio, setNewAuthorBio] = useState('Spesialis investigasi arsip sejarah dan rekonsiliasi nasional 1998.');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  );
  const [newAuthorCover, setNewAuthorCover] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80'
  );
  const [newAuthorKta, setNewAuthorKta] = useState('KTA-RED-00' + Math.floor(Math.random() * 89 + 11) + '/2026');
  const [newAuthorCity, setNewAuthorCity] = useState('DKI Jakarta, Indonesia');
  const [newAuthorWorkplace, setNewAuthorWorkplace] = useState('Lembaga Studi Hukum & Redaksi Facrial');
  const [newAuthorEducation, setNewAuthorEducation] = useState('Sarjana Hukum (S.H.), Universitas Indonesia');
  const [isRegisteringAuthor, setIsRegisteringAuthor] = useState(false);

  // Form State for Posting
  const [isAgenda, setIsAgenda] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Post['category']>('Hukum & Politik');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tagsString, setTagsString] = useState('Hukum, Reformasi1998, Sejarah, Keadilan');

  // Agenda Specific Fields
  const [agendaDate, setAgendaDate] = useState('2026-10-15');
  const [agendaTime, setAgendaTime] = useState('09:00 - 13:00 WIB');
  const [agendaLocation, setAgendaLocation] = useState('Gedung Mahkamah Konstitusi & Zoom Hybrid');
  const [agendaStatus, setAgendaStatus] = useState<'Mendatang' | 'Berlangsung' | 'Selesai'>('Mendatang');
  const [registrationUrl, setRegistrationUrl] = useState('');

  // Attachments State (PDF / Berkas Dokumen Otentik)
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentSize, setAttachmentSize] = useState('2.4 MB');

  // Feedback Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Verified Authors on Mount
  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    const list = await getVerifiedAuthors();
    setVerifiedAuthorsList(list);
    const verified = await checkAuthorVerification(currentUserEmail);
    setIsAuthorVerified(!!verified);
    setActiveAuthor(verified);
  };

  // Check Email Verification
  const handleCheckEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationFeedback(null);
    if (!verificationInputEmail.trim()) return;

    const verified = await checkAuthorVerification(verificationInputEmail.trim());
    if (verified) {
      setCurrentUserEmail(verified.email);
      setIsAuthorVerified(true);
      setActiveAuthor(verified);
      setVerificationFeedback(`Email ${verified.email} terverifikasi resmi sebagai ${verified.role}.`);
    } else {
      setVerificationFeedback(`Email ${verificationInputEmail} belum terdaftar atau belum diverifikasi oleh Redaksi.`);
    }
  };

  // Register & Verify New Author into Database
  const handleRegisterAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newAuthorEmail.trim()) return;

    setIsRegisteringAuthor(true);
    const newAuthor: VerifiedAuthor = {
      id: 'author-' + Date.now(),
      name: sanitizeText(newAuthorName.trim()),
      email: newAuthorEmail.trim().toLowerCase(),
      role: sanitizeText(newAuthorRole.trim()),
      bio: sanitizeText(newAuthorBio.trim()),
      avatar: newAuthorAvatar.trim(),
      coverPhoto: newAuthorCover.trim(),
      city: sanitizeText(newAuthorCity.trim()),
      workplace: sanitizeText(newAuthorWorkplace.trim()),
      education: sanitizeText(newAuthorEducation.trim()),
      ktaNumber: newAuthorKta.trim(),
      verified: true,
      verifiedBy: 'Admin Redaksi Facrial',
      verifiedAt: new Date().toISOString(),
      status: 'Aktif',
      articlesCount: 0,
      socials: {
        instagram: 'https://instagram.com/fachrial',
        facebook: 'https://facebook.com/fachrial.official',
        linkedin: 'https://linkedin.com/in/fachrial',
        email: newAuthorEmail.trim().toLowerCase(),
      },
    };

    const updatedList = await verifyAndSaveAuthor(newAuthor);
    setVerifiedAuthorsList(updatedList);
    setIsRegisteringAuthor(false);
    setSuccessMessage(`Author ${newAuthor.name} (${newAuthor.email}) berhasil diverifikasi dan tersimpan otomatis di database!`);

    // Reset Form
    setNewAuthorName('');
    setNewAuthorEmail('');
  };

  // File Upload Handlers (Mendukung Multi-Upload Gambar untuk Motion Slider & Berkas PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let imgCount = 0;
    let docCount = 0;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        imgCount++;
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            const dataUrl = uploadEvent.target.result as string;
            setCoverImageUrl((prev) => (prev ? prev : dataUrl));
            setAdditionalImages((prev) => [...prev, dataUrl]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        docCount++;
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const newAttachment: Attachment = {
          name: file.name,
          size: `${sizeMB} MB`,
          type: file.type.includes('pdf') ? 'pdf' : 'document',
          url: '#',
        };
        setAttachments((prev) => [...prev, newAttachment]);
      }
    });

    setSuccessMessage(
      `Berhasil memproses ${files.length} berkas: ${imgCount} foto untuk Motion Slider dan ${docCount} berkas arsip PDF.`
    );
  };

  // Additional Image for Motion Slider
  const handleAddSliderImage = () => {
    if (newImageUrl.trim()) {
      setAdditionalImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  // Manual Document Attachment
  const handleAddManualAttachment = () => {
    if (attachmentName.trim()) {
      setAttachments((prev) => [
        ...prev,
        {
          name: attachmentName.trim(),
          size: attachmentSize,
          type: 'pdf',
          url: '#',
        },
      ]);
      setAttachmentName('');
    }
  };

  // Submit Post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Judul berita dan isi konten investigasi wajib diisi!');
      return;
    }

    const cleanTitle = sanitizeText(title.trim());
    const cleanExcerpt = sanitizeText(excerpt.trim() || title.trim());
    const cleanContent = sanitizeText(content.trim());
    const safeSlug = createSafeSlug(cleanTitle) + '-' + Math.floor(Math.random() * 1000);

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

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const imagesArray = [coverImageUrl, ...additionalImages];

    let agendaObj: AgendaDetails | undefined = undefined;
    if (isAgenda) {
      agendaObj = {
        eventDate: agendaDate,
        eventTime: agendaTime,
        location: agendaLocation,
        status: agendaStatus,
        registrationUrl: registrationUrl.trim() || undefined,
      };
    }

    // Assign author from active author or primaryAuthor
    const postAuthor: Author = activeAuthor
      ? {
          id: activeAuthor.id,
          name: activeAuthor.name,
          role: activeAuthor.role,
          avatar: activeAuthor.avatar || primaryAuthor.avatar,
          bio: activeAuthor.bio || primaryAuthor.bio,
          verified: true,
          socials: {
            instagram: activeAuthor.socials?.instagram || primaryAuthor.socials.instagram,
            facebook: activeAuthor.socials?.facebook || primaryAuthor.socials.facebook,
            linkedin: activeAuthor.socials?.linkedin || primaryAuthor.socials.linkedin,
            email: activeAuthor.email,
          },
        }
      : primaryAuthor;

    const newPost: Post = {
      id: 'post-' + Date.now(),
      slug: safeSlug,
      title: cleanTitle,
      excerpt: cleanExcerpt,
      content: cleanContent,
      category: isAgenda ? 'Agenda' : category,
      coverImage: coverImageUrl,
      images: imagesArray,
      date: now.toISOString(),
      dayName,
      formattedDate,
      time: timeFormatted,
      author: postAuthor,
      readTime: `${Math.max(1, Math.ceil(cleanContent.split(' ').length / 150))} menit baca`,
      likes: 0,
      views: 1,
      commentsCount: 0,
      tags,
      isAgenda,
      agenda: agendaObj,
      attachments: attachments.length > 0 ? attachments : undefined,
      isFeatured: false,
    };

    try {
      await insertPost(newPost);
      onPostCreated(newPost);
      setSuccessMessage('Berita / agenda investigasi hukum berhasil diterbitkan dan disinkronkan ke database!');
      setTitle('');
      setExcerpt('');
      setContent('');
      setAdditionalImages([]);
      setAttachments([]);
    } catch {
      setErrorMessage('Terjadi kendala saat menyimpan. Mohon periksa koneksi data.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PORTAL STATUS                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border shadow-sm bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover-light-glow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Publik</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h1 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 dark:text-white">
                Portal Khusus Redaksi & Author Terverifikasi
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Akses khusus jurnalis investigasi hukum, reformasi, dan evaluasi sejarah Indonesia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured ? 'Supabase Database Connected' : 'Local Realtime Storage'}
          </span>
          {activeAuthor && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <UserCheck className="w-3.5 h-3.5" />
              {activeAuthor.name}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EMAIL VERIFICATION BADGE & LOGIN CHECK                                 */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Status Verifikasi Email:
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Terverifikasi Database ({currentUserEmail})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hanya author yang telah diverifikasi emailnya di database yang memiliki izin menerbitkan berita & agenda.
            </p>
          </div>
        </div>

        {/* Quick Email Switch / Check */}
        <form onSubmit={handleCheckEmailVerification} className="flex items-center gap-2">
          <input
            type="email"
            value={verificationInputEmail}
            onChange={(e) => setVerificationInputEmail(e.target.value)}
            placeholder="Cek email author lain..."
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Cek Status
          </button>
        </form>
      </div>

      {verificationFeedback && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{verificationFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TABS MENU                                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tulis Berita / Agenda & Upload Berkas</span>
        </button>

        <button
          onClick={() => setActiveTab('authors')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'authors'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Daftar Author Terverifikasi Database ({verifiedAuthorsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Arsip Berita Terbit ({posts.length})</span>
        </button>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs hover:underline">
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FORM INPUT KONTEN & UPLOAD FILE GAMBAR & DOKUMEN                    */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleSubmitPost}
          className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-colors duration-300 ${
            themeConfig.mode === 'dark'
              ? 'bg-slate-900/90 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Format Selection: Berita Investigasi vs Agenda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 gap-3">
            <div>
              <h4 className="text-sm font-bold">Pilih Jenis Publikasi Redaksi</h4>
              <p className="text-xs text-slate-400">
                Pilih apakah ini artikel ulasan hukum / tragedi sejarah 1998 atau agenda simposium & dengar pendapat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAgenda(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isAgenda
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Ulasan Hukum & Politik
              </button>
              <button
                type="button"
                onClick={() => setIsAgenda(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isAgenda
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Agenda Simposium / Sidang
              </button>
            </div>
          </div>

          {/* Judul, Kategori, dan Penulis Terverifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Judul Berita / Investigasi Sejarah *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Menyingkap Tabir Dokumen Otentik Peristiwa Reformasi 1998..."
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Kategori Berita / Tragedi (Teks Bebas Sesuai Keinginan) *
              </label>
              <textarea
                rows={2}
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Tulis kategori berita atau tragedi sesuai keinginan Anda (misal: Tragedi 1998, HAM, dll.)..."
                className={`w-full px-4 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  themeConfig.mode === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Ringkasan Singkat / Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ringkasan Eksekutif (Excerpt Linimasa)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Uraian ringkas kronologi atau poin pokok fakta hukum yang disajikan..."
              className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Khusus Agenda: Form Jadwal & Lokasi Simposium */}
          {isAgenda && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
              <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Rincian Jadwal Agenda Simposium / Diskusi Hukum
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Tanggal Acara</label>
                  <input
                    type="date"
                    value={agendaDate}
                    onChange={(e) => setAgendaDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={agendaTime}
                    onChange={(e) => setAgendaTime(e.target.value)}
                    placeholder="09:00 - 13:00 WIB"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Lokasi / Ruang Sidang</label>
                  <input
                    type="text"
                    value={agendaLocation}
                    onChange={(e) => setAgendaLocation(e.target.value)}
                    placeholder="Gedung Komnas HAM / Online"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Isi Investigasi Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Uraian Fakta, Analisis Hukum & Kronologi Lengkap *
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan ulasan investigasi lengkap berdasarkan bukti empiris, dokumen persidangan, atau kesaksian sejarah..."
              className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* KOLOM UPLOAD GAMBAR DAN FILE DOKUMEN DATA LAIN NYA */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                Kolom Upload Berkas Gambar & Dokumen Arsip Sejarah
              </h5>
              <span className="text-[11px] text-blue-500 font-semibold">
                Otomatis Menyimpan ke Database
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom 1: Upload File dari Komputer (Gambar / Dokumen Data) */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-50/60 dark:bg-slate-800/30 transition-all">
                <Upload className="w-9 h-9 text-blue-500 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Pilih / Unggah Berkas Dari Perangkat Anda
                </span>
                <span className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Mendukung foto dokumentasi (.JPG, .PNG, .WebP) dan berkas arsip hukum (.PDF, .DOCX)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Kolom 2: Tempel URL Gambar Cover Arsip */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Atau Tempel URL Gambar Cover Otentik:
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <div className="relative h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                  <img
                    src={coverImageUrl}
                    alt="Preview Cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-2 px-2 py-0.5 text-[9px] font-bold bg-black/70 text-white rounded">
                    Preview Media Cover
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Tambahan: Foto Bukti Slider Tambahan */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                Koleksi Foto Bukti Tambahan untuk Motion Slider & Zoom In/Out
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Masukkan URL foto dokumentasi peristiwa..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddSliderImage}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg"
                >
                  + Tambah Foto
                </button>
              </div>

              {additionalImages.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-2">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-400 shadow-sm">
                      <img src={img} alt="Bukti slider" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl"
                        title="Hapus"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kolom Tambahan: Lampiran File Data / PDF Dokumen Otentik */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-red-500" />
                Lampiran Berkas PDF / Dokumen Berita Acara & Risalah Sejarah
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Nama Dokumen (Contoh: Berkas-Hasil-Investigasi-Trisakti-1998.pdf)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddManualAttachment}
                  className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  + Tambah Dokumen
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="font-semibold truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tagar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tagar Terkait (Dipisahkan koma)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="Contoh: Hukum, Reformasi1998, OrdeBaru, Trisakti, HAM"
              className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Tombol Terbitkan Berita */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Sistem Otomatis Terhubung ke Database Redaksi
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover-light-glow shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Terbitkan Konten ke Linimasa
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAFTAR AUTHOR TERVERIFIKASI                                        */}
      {/* ========================================================================= */}
      {activeTab === 'authors' && (
        <div className="space-y-6">
          {/* Form Verifikasi & Tambah Author Baru oleh Admin */}
          <div
            className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm sm:text-base font-bold font-heading">
                  Verifikasi & Daftarkan Author Baru Terverifikasi
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Email Verifier Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan data jurnalis / peneliti hukum. Sistem akan memverifikasi dan menyimpan datanya secara otomatis di database Supabase.
            </p>

            <form onSubmit={handleRegisterAuthor} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Nama Lengkap Author & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="Contoh: Dr. Hendrawan Suwandi, S.H., LL.M."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Alamat Email Resmi untuk Verifikasi *
                </label>
                <input
                  type="email"
                  required
                  value={newAuthorEmail}
                  onChange={(e) => setNewAuthorEmail(e.target.value)}
                  placeholder="author.resmi@facrial.org"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Jabatan / Peran di Redaksi *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorRole}
                  onChange={(e) => setNewAuthorRole(e.target.value)}
                  placeholder="Peneliti Hukum Tata Negara & HAM"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Nomor KTA Pers / Redaksi *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorKta}
                  onChange={(e) => setNewAuthorKta(e.target.value)}
                  placeholder="KTA-RED-005/JKT/2026"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  URL Foto Sampul (Cover Photo Facebook) *
                </label>
                <input
                  type="url"
                  required
                  value={newAuthorCover}
                  onChange={(e) => setNewAuthorCover(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  URL Foto Profil (Avatar) *
                </label>
                <input
                  type="url"
                  required
                  value={newAuthorAvatar}
                  onChange={(e) => setNewAuthorAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Tempat Bekerja / Lembaga *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorWorkplace}
                  onChange={(e) => setNewAuthorWorkplace(e.target.value)}
                  placeholder="Lembaga Studi Hukum & Redaksi Facrial"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Pendidikan Terakhir / Almamater *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorEducation}
                  onChange={(e) => setNewAuthorEducation(e.target.value)}
                  placeholder="Magister Ilmu Hukum (M.H.), Universitas Indonesia"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Asal Kota / Domisili *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthorCity}
                  onChange={(e) => setNewAuthorCity(e.target.value)}
                  placeholder="DKI Jakarta, Indonesia"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Biografi Singkat & Latar Belakang Investigasi
                </label>
                <input
                  type="text"
                  value={newAuthorBio}
                  onChange={(e) => setNewAuthorBio(e.target.value)}
                  placeholder="Fokus pada pengungkapan fakta sejarah reformasi dan advokasi korban..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isRegisteringAuthor}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover-light-glow shadow-md flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isRegisteringAuthor ? 'Memverifikasi...' : 'Verifikasi & Simpan Profil ke Database'}
                </button>
              </div>
            </form>
          </div>

          {/* Grid Daftar Author Terverifikasi ala Facebook Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Author Terverifikasi Email Resmi ({verifiedAuthorsList.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {verifiedAuthorsList.map((author) => (
                <div
                  key={author.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden hover-light-glow transition-all"
                >
                  {/* Mini Cover Photo Facebook */}
                  <div className="h-24 w-full bg-slate-800 relative overflow-hidden">
                    <img
                      src={
                        author.coverPhoto ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt="Cover Author"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm border border-white/20">
                      Facebook Profile
                    </span>
                  </div>

                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-end justify-between -mt-9 mb-3">
                      <div className="relative">
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-18 h-18 rounded-2xl object-cover border-3 border-white dark:border-slate-900 shadow-lg bg-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white">
                          <CheckCircle className="w-3.5 h-3.5 fill-white text-blue-600" />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Terverifikasi Resmi
                        </span>
                      </div>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {author.name}
                    </h5>

                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      {author.role}
                    </p>

                    {/* Metadata Facebook Style */}
                    <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {author.ktaNumber && (
                        <div className="flex items-center gap-1.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span>No. KTA: {author.ktaNumber}</span>
                        </div>
                      )}
                      {author.workplace && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{author.workplace}</span>
                        </div>
                      )}
                      {author.education && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{author.education}</span>
                        </div>
                      )}
                      {author.city && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{author.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{author.email}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {author.bio}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          window.location.hash = '#author';
                        }}
                        className="text-slate-500 hover:text-blue-500 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lihat Profil Facebook
                      </button>

                      <button
                        onClick={() => {
                          setCurrentUserEmail(author.email);
                          setActiveAuthor(author);
                          setSuccessMessage(`Beralih ke profil author aktif: ${author.name}`);
                        }}
                        className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 transition-all text-xs"
                      >
                        Gunakan sebagai Penulis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAFTAR POSTINGAN & ARSIP SEJARAH TERBIT                           */}
      {/* ========================================================================= */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Linimasa Arsip Berita Terpublikasi ({posts.length})
            </h4>
            <span className="text-xs text-slate-400">
              Semua data tersinkronisasi secara persisten
            </span>
          </div>

          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.dayName}, {p.formattedDate}</span>
                      {p.isAgenda && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Agenda
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Oleh: {p.author.name} • {p.readTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <div>{p.likes} Suka</div>
                    <div>{p.views} Pembaca</div>
                  </div>
                  <span className="px-3 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    Terbit & Terverifikasi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
