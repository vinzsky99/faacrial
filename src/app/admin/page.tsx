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
  Edit3,
  Check,
  X,
  MessageCircle,
  Clock,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Post, Attachment, AgendaDetails, ThemeConfig, VerifiedAuthor, Author, AuthorApplication, Comment } from '../../types';
import { sanitizeText, createSafeSlug } from '../../lib/security';
import { primaryAuthor } from '../../data/initialData';
import {
  supabase,
  insertPost,
  isSupabaseConfigured,
  getVerifiedAuthors,
  verifyAndSaveAuthor,
  checkAuthorVerification,
  updateAuthorProfile,
  getAuthorApplications,
  updateAuthorApplicationStatus,
  deleteAuthorApplication,
  getAllPostsForAdmin,
  updatePostApprovalStatus,
  deletePostPermanently,
  getAllCommentsForAdmin,
  updateCommentStatus,
  deleteComment
} from '../../lib/supabase';

interface AdminPageProps {
  posts: Post[];
  themeConfig: ThemeConfig;
  onBack: () => void;
  onPostCreated: (newPost: Post) => void;
  onSelectPost?: (slug: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  posts,
  themeConfig,
  onBack,
  onPostCreated,
  onSelectPost,
}) => {
  // Admin Login Security State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const sess = localStorage.getItem('facrial_admin_session');
      return sess === 'true' || sess === null; // Default true untuk kemudahan pratinjau langsung
    }
    return true;
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Navigation Tabs: 'approvals' | 'applications' | 'create' | 'authors' | 'comments' | 'manage'
  const [activeTab, setActiveTab] = useState<
    'approvals' | 'applications' | 'create' | 'authors' | 'comments' | 'manage'
  >('approvals');

  // Author Applications (Become an Author Queue)
  const [applications, setApplications] = useState<AuthorApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // All Posts (including Pending for Approval Queue)
  const [allAdminPosts, setAllAdminPosts] = useState<Post[]>(posts);
  const [isLoadingAdminPosts, setIsLoadingAdminPosts] = useState(false);

  // Comments for Moderation
  const [allComments, setAllComments] = useState<Comment[]>([]);

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

  // Load Verified Authors and Admin Data on Mount
  useEffect(() => {
    loadAuthors();
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setIsLoadingApplications(true);
    setIsLoadingAdminPosts(true);
    try {
      const [apps, allPosts] = await Promise.all([
        getAuthorApplications(),
        getAllPostsForAdmin(),
      ]);
      setApplications(apps);
      setAllAdminPosts(allPosts);
      setAllComments(getAllCommentsForAdmin());
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setIsLoadingApplications(false);
      setIsLoadingAdminPosts(false);
    }
  };

  // Handler: Persetujuan Postingan / Agenda
  const handleApprovePost = async (postId: string) => {
    await updatePostApprovalStatus(postId, 'approved');
    setSuccessMessage('Postingan berhasil disetujui dan resmi tayang ke publik!');
    loadAllAdminData();
  };

  const handleRejectPost = async (postId: string) => {
    await updatePostApprovalStatus(postId, 'rejected');
    setSuccessMessage('Postingan ditolak dan dikembalikan ke Author untuk revisi.');
    loadAllAdminData();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Yakin ingin menghapus postingan ini secara permanen dari database?')) return;
    await deletePostPermanently(postId);
    setSuccessMessage('Postingan berhasil dihapus secara permanen.');
    loadAllAdminData();
  };

  // Handler: Verifikasi Calon Author (Become an Author)
  const handleApproveApplication = async (appId: string) => {
    await updateAuthorApplicationStatus(appId, 'approved');
    setSuccessMessage('Calon author resmi disetujui! Akun telah dibuat otomatis di database verified_authors.');
    loadAllAdminData();
    loadAuthors();
  };

  const handleRejectApplication = async (appId: string) => {
    await updateAuthorApplicationStatus(appId, 'rejected');
    setSuccessMessage('Pendaftaran calon author telah ditolak.');
    loadAllAdminData();
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Hapus pendaftaran ini dari database?')) return;
    await deleteAuthorApplication(appId);
    setSuccessMessage('Berkas pendaftaran berhasil dihapus.');
    loadAllAdminData();
  };

  // Handler: Moderasi Komentar
  const handleToggleCommentStatus = async (commentId: string, currentStatus: string = 'approved') => {
    const nextStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
    await updateCommentStatus(commentId, nextStatus as 'approved' | 'hidden');
    setAllComments(getAllCommentsForAdmin());
    setSuccessMessage(`Komentar telah diubah statusnya menjadi: ${nextStatus === 'approved' ? 'Aktif' : 'Disembunyikan'}.`);
  };

  const handleDeleteCommentAction = async (commentId: string) => {
    if (!confirm('Hapus komentar ini secara permanen?')) return;
    await deleteComment(commentId);
    setAllComments(getAllCommentsForAdmin());
    setSuccessMessage('Komentar berhasil dihapus.');
  };

  // Handler: Login Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    if (adminPasswordInput === 'admin1998' || adminPasswordInput === 'redaksi1998' || adminPasswordInput.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('facrial_admin_session', 'true');
      }
    } else {
      setAdminLoginError('Kata sandi admin redaksi salah. (Gunakan kata sandi redaksi: admin1998)');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('facrial_admin_session');
    }
  };

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

  const pendingPosts = allAdminPosts.filter((p) => p.status === 'pending_approval');
  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PORTAL STATUS                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border shadow-sm bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            id="admin-btn-back"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover-light-glow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h1 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 dark:text-white">
                Portal Kontrol Admin Redaksi Facrial (/admin)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pusat kendali persetujuan naskah author, verifikasi calon peneliti, moderasi komentar, dan database Supabase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured ? 'Supabase Database Connected' : 'Local Realtime Storage'}
          </span>
          {isAdminLoggedIn ? (
            <button
              id="admin-btn-logout"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-3 h-3" />
              Keluar Admin
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lock className="w-3 h-3" /> Sesi Terkunci
            </span>
          )}
        </div>
      </div>

      {!isAdminLoggedIn ? (
        /* ========================================================================= */
        /* ADMIN LOGIN GATE                                                          */
        /* ========================================================================= */
        <div className="max-w-md mx-auto py-12">
          <div
            className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
              themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                Login Portal Administrator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Masukkan kata sandi Dewan Redaksi untuk mengakses data Supabase secara penuh.
              </p>
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kata Sandi Redaksi Admin
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  placeholder="Masukkan kata sandi (default: admin1998)"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                id="btn-login-admin-submit"
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Masuk Sebagai Administrator
              </button>
            </form>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                id="btn-demo-quick-admin-login"
                onClick={() => {
                  setIsAdminLoggedIn(true);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('facrial_admin_session', 'true');
                  }
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Atau Buka Cepat (Demo Mode Redaksi 1-Klik) →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                    Status Administrator Database:
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Admin Utama Aktif ({currentUserEmail})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Anda memiliki otoritas penuh untuk menyetujui artikel author, memverifikasi calon peneliti, dan memoderasi komentar.
                </p>
              </div>
            </div>

            {/* Quick Email Switch / Check */}
            <form onSubmit={handleCheckEmailVerification} className="flex items-center gap-2">
              <input
                type="email"
                value={verificationInputEmail}
                onChange={(e) => setVerificationInputEmail(e.target.value)}
                placeholder="Cek status email author..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Cek
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
          {/* 3. TABS MENU DENGAN COUNTER REALTIME                                      */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            {/* Tab: Persetujuan Post & Agenda */}
            <button
              id="tab-admin-approvals"
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Persetujuan Postingan</span>
              {pendingPosts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900 animate-pulse">
                  {pendingPosts.length} Menunggu
                </span>
              )}
            </button>

            {/* Tab: Verifikasi Calon Author */}
            <button
              id="tab-admin-applications"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Calon Author</span>
              {pendingApps.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                  {pendingApps.length} Pengajuan
                </span>
              )}
            </button>

            {/* Tab: Kontrol Komentar */}
            <button
              id="tab-admin-comments"
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kontrol Komentar ({allComments.length})</span>
            </button>

            {/* Tab: Manajemen Author Database */}
            <button
              id="tab-admin-authors"
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'authors'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Author Database ({verifiedAuthorsList.length})</span>
            </button>

            {/* Tab: Tulis Langsung (Admin) */}
            <button
              id="tab-admin-create"
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tulis Postingan (Admin)</span>
            </button>

            {/* Tab: Arsip Semua Postingan */}
            <button
              id="tab-admin-manage"
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'manage'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Semua Post ({allAdminPosts.length})</span>
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
          {/* TAB APPROVALS: DAFTAR PERSETUJUAN POST & AGENDA AUTHOR                    */}
          {/* ========================================================================= */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Antrean Persetujuan Postingan & Agenda Author
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sesuai kebijakan redaksi, setiap artikel atau agenda yang ditulis oleh Author harus disetujui Admin sebelum tayang di beranda publik.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {pendingPosts.length} Postingan Menunggu Persetujuan
                </div>
              </div>

              {isLoadingAdminPosts ? (
                <div className="py-12 text-center text-xs text-slate-500">Memuat antrean postingan...</div>
              ) : pendingPosts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/60" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Semua Antrean Bersih!
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tidak ada artikel atau agenda yang sedang menunggu persetujuan Admin saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className={`p-6 rounded-3xl border shadow-md space-y-4 ${
                        themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Menunggu Persetujuan
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {post.category}
                          </span>
                          {post.isAgenda && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              Format Agenda
                            </span>
                          )}
                          <span className="text-xs text-slate-400">• {post.formattedDate} ({post.time})</span>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Penulis:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{post.author.name}</span>
                          {post.author.email && <span className="text-[11px] text-slate-400">({post.author.email})</span>}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-start gap-4">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full md:w-48 h-32 rounded-2xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800"
                          />
                        )}
                        <div className="space-y-2 flex-1">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {post.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                          {post.isAgenda && post.agenda && (
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                              <div><strong>Tanggal:</strong> {post.agenda.eventDate} ({post.agenda.eventTime})</div>
                              <div><strong>Lokasi:</strong> {post.agenda.location}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tombol Aksi Persetujuan */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-400">
                          ID: {post.id} • Slug: {post.slug}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-approve-post-${post.id}`}
                            onClick={() => handleApprovePost(post.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            Setujui & Terbitkan
                          </button>

                          <button
                            id={`btn-reject-post-${post.id}`}
                            onClick={() => handleRejectPost(post.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            Kembalikan / Tolak
                          </button>

                          <button
                            id={`btn-delete-post-${post.id}`}
                            onClick={() => handleDeletePost(post.id)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB APPLICATIONS: VERIFIKASI CALON AUTHOR & FOTO DATABASE                 */}
          {/* ========================================================================= */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Antrean Verifikasi Calon Author & Foto Identitas Supabase
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calon author yang mendaftar melalui formulir pendaftaran. Admin dapat memeriksa identitas, portofolio, dan menyetujui akun author secara otomatis.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {applications.length} Total Pendaftar ({pendingApps.length} Baru)
                </div>
              </div>

              {isLoadingApplications ? (
                <div className="py-12 text-center text-xs text-slate-500">Memuat berkas calon author...</div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <UserPlus className="w-12 h-12 mx-auto text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Belum Ada Pengajuan Calon Author
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pendaftar baru dari halaman /become-author akan muncul di sini secara otomatis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {applications.map((app) => {
                    return (
                      <div
                        key={app.id}
                        className={`p-6 rounded-3xl border shadow-md space-y-4 ${
                          themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                app.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : app.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                              }`}
                            >
                              {app.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                              {app.status === 'rejected' && <X className="w-3 h-3" />}
                              {app.status === 'pending' && <Clock className="w-3 h-3" />}
                              {app.status === 'approved'
                                ? 'Resmi Menjadi Author'
                                : app.status === 'rejected'
                                ? 'Ditolak'
                                : 'Menunggu Verifikasi Admin'}
                            </span>
                            <span className="text-xs text-slate-400">
                              Didaftarkan: {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="text-xs font-mono text-slate-400">ID: {app.id}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Foto Verifikasi Profil */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block">
                              Foto Verifikasi Profil / KTP:
                            </span>
                            {app.verificationPhoto ? (
                              <div className="relative group rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md">
                                <img
                                  src={app.verificationPhoto}
                                  alt={`Verifikasi ${app.name}`}
                                  className="w-full h-44 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                  Tersimpan di Supabase
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                Tanpa Foto
                              </div>
                            )}
                          </div>

                          {/* Data Calon Author */}
                          <div className="md:col-span-3 space-y-3">
                            <div>
                              <h4 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                                {app.name}
                              </h4>
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {app.expertise} • {app.institution}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <div><strong>Email:</strong> {app.email}</div>
                              <div><strong>WhatsApp / Telp:</strong> {app.phone}</div>
                              {app.portfolioUrl && (
                                <div className="sm:col-span-2">
                                  <strong>Portofolio:</strong>{' '}
                                  <a
                                    href={app.portfolioUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    {app.portfolioUrl} <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                                Fokus Kajian & Alasan Bergabung:
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {app.bioReason}
                              </p>
                            </div>

                            {/* Tombol Aksi Verifikasi */}
                            <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
                              {app.status !== 'approved' && (
                                <button
                                  id={`btn-approve-author-${app.id}`}
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  Setujui Jadi Author Resmi
                                </button>
                              )}

                              {app.status === 'pending' && (
                                <button
                                  id={`btn-reject-author-${app.id}`}
                                  onClick={() => handleRejectApplication(app.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1.5"
                                >
                                  <X className="w-4 h-4" />
                                  Tolak
                                </button>
                              )}

                              <button
                                id={`btn-delete-author-app-${app.id}`}
                                onClick={() => handleDeleteApplication(app.id)}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB COMMENTS: KONTROL & MODERASI KOMENTAR REALTIME                        */}
          {/* ========================================================================= */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Kontrol & Moderasi Komentar Publik
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kelola diskusi publik, tanggapan pembaca, dan cegah spam atau ujaran kebencian.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {allComments.length} Total Komentar Terdaftar
                </span>
              </div>

              {allComments.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <MessageCircle className="w-12 h-12 mx-auto text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Belum Ada Komentar Publik
                  </h4>
                  <p className="text-xs text-slate-400">
                    Setiap komentar yang dikirim oleh pembaca akan tercatat dan dapat dikontrol di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  {allComments.map((comment) => (
                    <div key={comment.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {comment.authorName}
                          </span>
                          {comment.authorEmail && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({comment.authorEmail})
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              comment.status === 'hidden'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {comment.status === 'hidden' ? 'Disembunyikan' : 'Aktif Tayang'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {comment.content}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Post Slug: {comment.postSlug}
                        </div>
                      </div>

                      {/* Tombol Aksi Moderasi */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          id={`btn-toggle-comment-${comment.id}`}
                          onClick={() => handleToggleCommentStatus(comment.id, comment.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            comment.status === 'hidden'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20'
                          }`}
                        >
                          {comment.status === 'hidden' ? 'Tampilkan Kembali' : 'Sembunyikan'}
                        </button>

                        <button
                          id={`btn-delete-comment-${comment.id}`}
                          onClick={() => handleDeleteCommentAction(comment.id)}
                          className="p-1.5 rounded-xl text-red-600 hover:bg-red-500/10 transition-all"
                          title="Hapus Komentar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
        </>
      )}
    </div>
  );
};
