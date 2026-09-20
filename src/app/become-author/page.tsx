import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  UserCheck,
  FileText,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  X,
  Lock,
  Compass
} from 'lucide-react';
import { ThemeConfig } from '../../types';
import { submitAuthorApplication } from '../../lib/supabase';

interface BecomeAuthorPageProps {
  themeConfig: ThemeConfig;
  onBack: () => void;
  onNavigateToAuthorLogin: () => void;
}

export const BecomeAuthorPage: React.FC<BecomeAuthorPageProps> = ({
  themeConfig,
  onBack,
  onNavigateToAuthorLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [expertise, setExpertise] = useState('Hukum Tata Negara & Konstitusi');
  const [customExpertise, setCustomExpertise] = useState('');
  const [institution, setInstitution] = useState('');
  const [bioReason, setBioReason] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [verificationPhoto, setVerificationPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Photo Upload (Convert to Data URL / Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap unggah berkas gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 5 MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setVerificationPhoto(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !institution.trim() || !bioReason.trim()) {
      setErrorMsg('Harap lengkapi semua kolom data yang berbintang merah (*).');
      return;
    }

    if (!verificationPhoto) {
      setErrorMsg('Wajib mengunggah Foto Verifikasi Profil / Kartu Identitas untuk diverifikasi oleh Admin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalExpertise = expertise === 'Lainnya' && customExpertise.trim()
        ? customExpertise.trim()
        : expertise;

      await submitAuthorApplication({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        expertise: finalExpertise,
        institution: institution.trim(),
        bioReason: bioReason.trim(),
        portfolioUrl: portfolioUrl.trim() || undefined,
        verificationPhoto: verificationPhoto,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kendala saat mengirim pendaftaran. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setInstitution('');
    setBioReason('');
    setPortfolioUrl('');
    setVerificationPhoto('');
    setPhotoPreview(null);
    setIsSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-300">
      {/* Tombol Kembali */}
      <button
        id="btn-back-to-home"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </button>

      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 shadow-xl relative overflow-hidden ${
        themeConfig.mode === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-slate-800'
          : 'bg-gradient-to-br from-white via-blue-50/50 to-slate-50 border-slate-200'
      }`}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            Portal Pendaftaran Author Resmi
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
            Bergabung Menjadi Author & Peneliti Facrial
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Menulis analisis yuridis, membuka dokumen Tragedi 1998, dan menyuarakan kebenaran sejarah konstitusi.
            Setiap pendaftar akan diverifikasi langsung oleh Dewan Redaksi sebelum mendapatkan hak publikasi.
          </p>
        </div>
      </div>

      {isSuccess ? (
        /* TAMPILAN SUKSES DENGAN DETAIL */
        <div className={`p-8 sm:p-10 rounded-3xl border text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 ${
          themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              Pendaftaran Berhasil Dikirim ke Supabase!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Terima kasih <strong className="text-blue-600 dark:text-blue-400">{name}</strong>. Data pengajuan, spesialisasi riset, dan foto verifikasi profil Anda telah tersimpan secara aman di database Redaksi.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin Redaksi akan meninjau berkas Anda. Pemberitahuan resmi dan aktivasi akun author Anda akan dikirimkan ke <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-goto-author-portal"
              onClick={onNavigateToAuthorLogin}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
            >
              Cek Portal Author (/author)
            </button>
            <button
              id="btn-back-home-after-register"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      ) : (
        /* FORMULIR PENDAFTARAN LENGKAP */
        <form
          onSubmit={handleSubmit}
          className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
            themeConfig.mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bagian 1: Identitas Calon Author */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> 1. Data Identitas & Kontak
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap & Gelar Akademik <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-author-name"
                  type="text"
                  required
                  placeholder="Contoh: Dr. Fachrial, S.H., M.H."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Aktif (Untuk Login & Komunikasi) <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-author-email"
                  type="email"
                  required
                  placeholder="email.resmi@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-author-phone"
                  type="tel"
                  required
                  placeholder="0812XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Universitas / Lembaga / Tempat Bekerja <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-author-institution"
                  type="text"
                  required
                  placeholder="Contoh: Universitas Indonesia / LBH Jakarta"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Bidang Keahlian & Alasan Riset */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> 2. Bidang Spesialisasi & Portofolio
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Spesialisasi Kajian <span className="text-red-500">*</span>
              </label>
              <select
                id="reg-author-expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Hukum Tata Negara & Konstitusi">Hukum Tata Negara & Konstitusi</option>
                <option value="Hak Asasi Manusia & Tragedi 1998">Hak Asasi Manusia & Tragedi 1998 (Trisakti / Semanggi)</option>
                <option value="Hukum Pidana & Korupsi Politik">Hukum Pidana & Korupsi Politik</option>
                <option value="Hukum Internasional & Perjanjian Bilateral">Hukum Internasional & Perjanjian Bilateral</option>
                <option value="Jurnalisme Investigasi & Sejarah Reformasi">Jurnalisme Investigasi & Sejarah Reformasi</option>
                <option value="Lainnya">Lainnya (Tuliskan sendiri)</option>
              </select>

              {expertise === 'Lainnya' && (
                <input
                  id="reg-custom-expertise"
                  type="text"
                  placeholder="Tuliskan bidang keahlian Anda..."
                  value={customExpertise}
                  onChange={(e) => setCustomExpertise(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Fokus Kajian, Riset, atau Alasan Ingin Menulis di Facrial <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reg-author-bioreason"
                required
                rows={4}
                placeholder="Ceritakan latar belakang riset Anda, topik hukum atau sejarah yang ingin Anda publikasikan, serta kontribusi Anda terhadap penegakan kebenaran..."
                value={bioReason}
                onChange={(e) => setBioReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Link Portofolio / Karya Tulis Ilmiah / Google Scholar (Opsional)
              </label>
              <input
                id="reg-author-portfolio"
                type="url"
                placeholder="https://scholar.google.com/... atau tautan artikel terdahulu"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Bagian 3: WAJIB PHOTO VERIFIKASI PROFILE DATABASE */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 3. Wajib: Foto Verifikasi Profil / Identitas
              </h3>
              <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Wajib Diunggah
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unggah foto formal profil Anda, KTP, atau Kartu Identitas Lembaga/Pers/Akademik untuk verifikasi Admin di database Supabase.
            </p>

            {photoPreview ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <img
                  src={photoPreview}
                  alt="Verifikasi Profil"
                  className="w-24 h-24 rounded-xl object-cover border-2 border-blue-500 shadow-md flex-shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Foto Berhasil Dipilih
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Foto ini akan disimpan di database Supabase dan menjadi foto profil author Anda setelah disetujui.
                  </p>
                  <label
                    htmlFor="reg-photo-input"
                    className="inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer hover:opacity-80"
                  >
                    Ganti Foto
                  </label>
                  <input
                    id="reg-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <label
                htmlFor="reg-photo-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klik untuk Unggah Foto Profil / Identitas
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Format JPG, PNG, atau WEBP (Maksimal 5MB)
                </span>
                <input
                  id="reg-photo-upload"
                  type="file"
                  required
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Tombol Submit */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Data Anda terlindungi oleh enkripsi Supabase RLS Policy.
            </div>

            <button
              id="btn-submit-author-app"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim ke Database Supabase...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Kirim Pendaftaran Menjadi Author
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
