import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  ExternalLink,
  Calendar,
  FileText,
  Sparkles,
  Share2,
  Clock,
  Briefcase,
  GraduationCap,
  MapPin,
  BadgeCheck,
  Camera,
  Edit3,
  X,
  Check,
  Save,
  Image as ImageIcon,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Author, Post, ThemeConfig, VerifiedAuthor } from '../../../types';
import { primaryAuthor } from '../../../data/initialData';
import { updateAuthorProfile } from '../../../lib/supabase';

interface AuthorPageProps {
  author?: Author;
  posts: Post[];
  themeConfig: ThemeConfig;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onOpenNewPostModal: () => void;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({
  author: initialAuthor = primaryAuthor,
  posts,
  themeConfig,
  onBack,
  onSelectPost,
  onOpenNewPostModal,
}) => {
  const [currentAuthor, setCurrentAuthor] = useState<Author>(initialAuthor);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'media' | 'kta'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Edit Profile Form State
  const [editCover, setEditCover] = useState(
    currentAuthor.coverPhoto ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80'
  );
  const [editAvatar, setEditAvatar] = useState(currentAuthor.avatar);
  const [editName, setEditName] = useState(currentAuthor.name);
  const [editRole, setEditRole] = useState(currentAuthor.role);
  const [editBio, setEditBio] = useState(currentAuthor.bio);
  const [editCity, setEditCity] = useState(currentAuthor.city || 'DKI Jakarta, Indonesia');
  const [editWorkplace, setEditWorkplace] = useState(
    currentAuthor.workplace || 'Lembaga Studi Hukum Tata Negara & Redaksi Facrial'
  );
  const [editEducation, setEditEducation] = useState(
    currentAuthor.education || 'Magister Ilmu Hukum Tata Negara (M.H.), Universitas Indonesia'
  );
  const [editKtaNumber, setEditKtaNumber] = useState(
    currentAuthor.ktaNumber || 'KTA-RED-001/JKT/2026'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const authorPosts = posts.filter(
    (p) => p.author.id === currentAuthor.id || p.author.name === currentAuthor.name
  );
  const totalLikes = authorPosts.reduce((acc, curr) => acc + curr.likes, 0);
  const totalViews = authorPosts.reduce((acc, curr) => acc + curr.views, 0);

  // Filter gambar dari postingan author untuk tab Media & Galeri
  const authorMediaImages = authorPosts.flatMap((p) => [p.coverImage, ...(p.images || [])]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedAuthor: Author = {
      ...currentAuthor,
      name: editName.trim(),
      role: editRole.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim(),
      coverPhoto: editCover.trim(),
      city: editCity.trim(),
      workplace: editWorkplace.trim(),
      education: editEducation.trim(),
      ktaNumber: editKtaNumber.trim(),
    };

    try {
      await updateAuthorProfile({
        id: currentAuthor.id,
        name: updatedAuthor.name,
        role: updatedAuthor.role,
        bio: updatedAuthor.bio,
        avatar: updatedAuthor.avatar,
        coverPhoto: updatedAuthor.coverPhoto,
        city: updatedAuthor.city,
        workplace: updatedAuthor.workplace,
        education: updatedAuthor.education,
        ktaNumber: updatedAuthor.ktaNumber,
      });

      setCurrentAuthor(updatedAuthor);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Gagal update profil author:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-800/70 hover-light-glow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Linimasa</span>
        </button>

        {copiedNotification && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1.5 shadow-md animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Tautan Profil Tersalin!
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. STRUKTUR PROFIL ALA FACEBOOK: COVER BANNER & OVERLAPPING AVATAR        */}
      {/* ========================================================================= */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xl transition-colors duration-300 ${
          themeConfig.mode === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200/90'
        }`}
      >
        {/* Cover Photo Facebook */}
        <div className="relative w-full h-52 sm:h-72 md:h-80 bg-slate-800 overflow-hidden group">
          <img
            src={
              currentAuthor.coverPhoto ||
              'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Cover Photo Profil"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Tombol Edit Sampul di Sudut Kanan Bawah Cover (Facebook Style) */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all shadow-lg"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Foto Sampul</span>
          </button>
        </div>

        {/* Bar Profil: Overlapping Avatar, Nama, KTA, dan Action Buttons */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-20 relative z-10">
            {/* Foto Profil Avatar Bulat dengan Badge Verifikasi */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={currentAuthor.avatar}
                  alt={currentAuthor.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-2xl ring-4 ring-blue-500/30 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                {currentAuthor.verified && (
                  <div
                    className="absolute bottom-2 right-2 p-1.5 bg-blue-600 rounded-full text-white shadow-lg border-2 border-white dark:border-slate-900"
                    title="Author Terverifikasi Resmi Redaksi"
                  >
                    <CheckCircle className="w-5 h-5 fill-white text-blue-600" />
                  </div>
                )}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ubah</span>
                </button>
              </div>

              {/* Nama & Role */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                    {currentAuthor.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Terverifikasi
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {currentAuthor.role}
                </p>
                {currentAuthor.ktaNumber && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>No. KTA: {currentAuthor.ktaNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Edit Profil, Tulis Berita, Bagikan (Facebook Style) */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap pt-2 md:pt-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover-light-glow transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profil Lengkap
              </button>

              <button
                onClick={onOpenNewPostModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover-light-glow shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                + Tulis Postingan / Agenda
              </button>

              <button
                onClick={handleShareProfile}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover-light-glow transition-all"
                title="Bagikan Tautan Profil"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Facebook Tab Navigation Bar */}
          <div className="flex items-center gap-1 sm:gap-4 border-t border-slate-200 dark:border-slate-800 mt-6 pt-3 text-xs sm:text-sm font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Postingan Linimasa ({authorPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tentang & Profil Lengkap
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'media'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Foto & Berkas Investigasi
            </button>
            <button
              onClick={() => setActiveTab('kta')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'kta'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              KTA & Verifikasi Redaksi
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LAYOUT FACEBOOK DUA KOLOM (KIRI: INTRO/ABOUT, KANAN: POSTINGAN)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (LEBAR 5/12): KOTAK PENGISIAN PROFIL LENGKAP ALA FACEBOOK */}
        <div className="lg:col-span-5 space-y-6">
          {/* Kotak "Intro / Pengenalan Diri" */}
          <div
            className={`p-6 rounded-3xl border shadow-md space-y-4 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                Pengenalan
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit Rincian
              </button>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center sm:text-left">
              {currentAuthor.bio}
            </p>

            {/* Rincian Profil Facebook */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800/80">
              {currentAuthor.workplace && (
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Bekerja di{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {currentAuthor.workplace}
                    </strong>
                  </span>
                </div>
              )}

              {currentAuthor.education && (
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Pernah belajar di{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {currentAuthor.education}
                    </strong>
                  </span>
                </div>
              )}

              {currentAuthor.city && (
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Tinggal di{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {currentAuthor.city}
                    </strong>
                  </span>
                </div>
              )}

              {currentAuthor.ktaNumber && (
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Nomor KTA Pers/Redaksi:{' '}
                    <strong className="font-semibold font-mono text-blue-600 dark:text-blue-400">
                      {currentAuthor.ktaNumber}
                    </strong>
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Status:{' '}
                  <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Author Terverifikasi Resmi
                  </strong>
                </span>
              </div>
            </div>

            {/* Media Sosial Author */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Kontak & Jaringan Sosial
              </h4>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {currentAuthor.socials.email && (
                  <a
                    href={`mailto:${currentAuthor.socials.email}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-emerald-500 flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Email</span>
                  </a>
                )}
                {currentAuthor.socials.facebook && (
                  <a
                    href={currentAuthor.socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span className="font-bold text-blue-600">FB</span>
                    <span>Facebook</span>
                  </a>
                )}
                {currentAuthor.socials.instagram && (
                  <a
                    href={currentAuthor.socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-pink-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span className="font-bold text-pink-600">IG</span>
                    <span>Instagram</span>
                  </a>
                )}
                {currentAuthor.socials.linkedin && (
                  <a
                    href={currentAuthor.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-sky-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span className="font-bold text-sky-600">IN</span>
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Kotak Galeri Foto Terkini (Facebook Style) */}
          <div
            className={`p-6 rounded-3xl border shadow-md space-y-4 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Foto Berita & Investigasi
              </h3>
              <span className="text-xs text-slate-400">{authorMediaImages.length} Foto</span>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {authorMediaImages.slice(0, 6).map((img, i) => (
                <div key={i} className="aspect-square bg-slate-800 overflow-hidden group">
                  <img
                    src={img}
                    alt={`Galeri ${i}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (LEBAR 7/12): POSTINGAN LINIMASA ATAU TAB LAIN */}
        <div className="lg:col-span-7 space-y-6">
          {/* Composer Cepat ala Facebook ("Apa fakta investigasi yang ingin Anda sampaikan?") */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-center gap-3 transition-colors ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <img
              src={currentAuthor.avatar}
              alt={currentAuthor.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onOpenNewPostModal}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all font-medium"
            >
              Apa analisis atau fakta hukum yang ingin Anda bagikan hari ini?
            </button>
            <button
              onClick={onOpenNewPostModal}
              className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
              title="Tulis Postingan Baru"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: POSTINGAN LINIMASA */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Daftar Postingan & Ulasan Diterbitkan ({authorPosts.length})
                </h3>
              </div>

              {authorPosts.length === 0 ? (
                <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
                  Belum ada postingan yang diterbitkan oleh author ini.
                </div>
              ) : (
                authorPosts.map((p) => (
                  <article
                    key={p.id}
                    className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 transition-all hover-light-glow ${
                      themeConfig.mode === 'dark'
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Header Postingan ala Facebook */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentAuthor.avatar}
                          alt={currentAuthor.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {currentAuthor.name}
                            </span>
                            <CheckCircle className="w-3.5 h-3.5 fill-blue-600 text-white" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{p.formattedDate}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPost(p.slug)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Buka Lengkap →
                      </button>
                    </div>

                    {/* Judul & Excerpt */}
                    <div className="space-y-1.5 cursor-pointer" onClick={() => onSelectPost(p.slug)}>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {p.excerpt}
                      </p>
                    </div>

                    {/* Gambar Postingan */}
                    {p.coverImage && (
                      <div
                        className="rounded-2xl overflow-hidden bg-slate-800 cursor-pointer max-h-96"
                        onClick={() => onSelectPost(p.slug)}
                      >
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Footer Post: Suka, Komentar, Bagikan (Facebook Style) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-full bg-blue-600 text-white">
                          <ThumbsUp className="w-3 h-3" />
                        </span>
                        <span>{p.likes} menyukai ulasan ini</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{p.commentsCount || 0} Komentar</span>
                        <span>{p.views} Kali dibaca</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <button
                        onClick={() => onSelectPost(p.slug)}
                        className="py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4 text-blue-500" />
                        <span>Sukai</span>
                      </button>
                      <button
                        onClick={() => onSelectPost(p.slug)}
                        className="py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span>Komentari</span>
                      </button>
                      <button
                        onClick={() => onSelectPost(p.slug)}
                        className="py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-purple-500" />
                        <span>Bagikan</span>
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TENTANG & PROFIL LENGKAP */}
          {activeTab === 'about' && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-6 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Informasi Lengkap Author Terverifikasi
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Nama & Gelar
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {currentAuthor.name}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Jabatan Redaksi / Fokus Penelitian
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {currentAuthor.role}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Tempat Bekerja / Lembaga
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {currentAuthor.workplace || '-'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Pendidikan Terakhir / Almamater
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {currentAuthor.education || '-'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Asal Kota / Domisili
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {currentAuthor.city || '-'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Nomor KTA Pers / Redaksi
                  </span>
                  <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {currentAuthor.ktaNumber || '-'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Biografi & Visi Kebenaran
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentAuthor.bio}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Perbarui Data Profil Ini
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & BERKAS */}
          {activeTab === 'media' && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-4 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Dokumentasi Visual & Berkas Investigasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Koleksi foto otentik, berkas rujukan hukum, dan dokumentasi sejarah yang telah diunggah oleh {currentAuthor.name}.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {authorMediaImages.map((img, i) => (
                  <div key={i} className="aspect-video bg-slate-800 rounded-xl overflow-hidden group">
                    <img
                      src={img}
                      alt={`Dokumentasi ${i}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KTA & VERIFIKASI REDAKSI */}
          {activeTab === 'kta' && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-6 ${
                themeConfig.mode === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Kartu Tanda Anggota (KTA) Redaksi Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sertifikasi jurnalis investigasi hukum dan politik terverifikasi sistem pusat Facrial
                  </p>
                </div>
              </div>

              {/* Tampilan Visual Kartu KTA ala Facebook/ID Card */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border-2 border-blue-500/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs">
                      F
                    </div>
                    <span className="font-extrabold text-sm tracking-wider">FACRIAL REDAKSI</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    RESMI & AKTIF
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={currentAuthor.avatar}
                    alt={currentAuthor.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <h4 className="text-base font-black">{currentAuthor.name}</h4>
                    <p className="text-xs text-blue-300 font-semibold">{currentAuthor.role}</p>
                    <p className="text-[11px] text-slate-300 font-mono">
                      No. KTA: {currentAuthor.ktaNumber || 'KTA-RED-001/JKT/2026'}
                    </p>
                    <p className="text-[10px] text-slate-400">{currentAuthor.workplace}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Jurnalis Terverifikasi Resmi</span>
                  <span>Berlaku s/d: 2029</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL EDIT PROFIL LENGKAP ALA FACEBOOK                                  */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold font-heading">
                  Edit Profil Lengkap (Ala Facebook Profile)
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Profil berhasil diperbarui dan tersinkronisasi resmi!
                </div>
              )}

              {/* 1. Foto Sampul (Cover Photo) */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>URL Foto Sampul (Cover Photo Facebook) *</span>
                  <span className="text-[10px] text-blue-500 font-normal">Resolusi tinggi (1600x800)</span>
                </label>
                <input
                  type="url"
                  required
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="https://images.unsplash.com/..."
                />
                {editCover && (
                  <div className="h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 mt-1">
                    <img
                      src={editCover}
                      alt="Preview Sampul"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* 2. Foto Profil (Avatar) */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  URL Foto Profil (Avatar Bulat) *
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editAvatar}
                    alt="Preview Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                    referrerPolicy="no-referrer"
                  />
                  <input
                    type="url"
                    required
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* 3. Nama Lengkap & Peran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Jabatan Redaksi / Peran *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 4. Nomor KTA & Asal Kota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Nomor KTA Pers / Redaksi *
                  </label>
                  <input
                    type="text"
                    required
                    value={editKtaNumber}
                    onChange={(e) => setEditKtaNumber(e.target.value)}
                    placeholder="KTA-RED-001/JKT/2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Asal Kota / Domisili *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="DKI Jakarta, Indonesia"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 5. Tempat Bekerja & Pendidikan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tempat Bekerja / Instansi *
                  </label>
                  <input
                    type="text"
                    required
                    value={editWorkplace}
                    onChange={(e) => setEditWorkplace(e.target.value)}
                    placeholder="Lembaga Studi Hukum & Redaksi Facrial"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Pendidikan Terakhir / Almamater *
                  </label>
                  <input
                    type="text"
                    required
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    placeholder="Magister Hukum Tata Negara (M.H.), Universitas Indonesia"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 6. Biografi */}
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Biografi Singkat & Visi Investigasi Kebenaran *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
