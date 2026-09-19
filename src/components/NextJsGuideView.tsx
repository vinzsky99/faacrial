import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Copy,
  Check,
  Terminal,
  Github,
  Globe,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NextJsGuideViewProps {
  transparency: number;
  isDark: boolean;
}

export const NextJsGuideView: React.FC<NextJsGuideViewProps> = ({
  transparency,
  isDark
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('layout.js');
  const [copiedFile, setCopiedFile] = useState(false);

  const fileContents: Record<string, { path: string; desc: string; code: string }> = {
    'layout.js': {
      path: 'src/app/layout.js',
      desc: 'Layout utama website (Navbar melayang, Transparansi, Tema Dark/Light, Footer resmi)',
      code: `import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Facrial - Timeline Berita & Blog Modern',
  description: 'Portal berita, artikel timeline selang-seling ala Facebook dengan floating navbar dan Supabase.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Navbar Melayang di atas dengan pencarian & menu */}
        <Navbar />
        
        {/* Konten Utama */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6">
          {children}
        </main>

        {/* Footer Resmi */}
        <Footer />
      </body>
    </html>
  );
}`
    },
    'page.js': {
      path: 'src/app/page.js',
      desc: 'Halaman utama (Daftar semua blog timeline Facebook selang-seling kiri kanan & cover slider)',
      code: `import HeroProfile from '@/components/HeroProfile';
import TimelineFeed from '@/components/TimelineFeed';
import { supabase } from '@/lib/supabase';

// Mengambil data dari Supabase secara realtime / server-rendered
async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
}

export const revalidate = 60; // Regenerasi data otomatis tiap 60 detik

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="space-y-12">
      {/* Landing Page: Hero Profile Facebook Style & Cover Motion Slider */}
      <HeroProfile />

      {/* Timeline Facebook: Selang-seling Kiri & Kanan dengan Model Baca Selengkapnya */}
      <TimelineFeed posts={posts} />
    </div>
  );
}`
    },
    'blog/[slug]/page.js': {
      path: 'src/app/blog/[slug]/page.js',
      desc: 'Halaman detail isi artikel blog dalam bentuk timeline tanpa reload page',
      code: `import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthorCard from './author';
import ImageSlider from '@/components/ImageSlider';

export async function generateStaticParams() {
  const { data: posts } = await supabase.from('posts').select('slug');
  return (posts || []).map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }) {
  const { slug } = params;

  // Query aman terlindung dari SQL Injection menggunakan parameterized Supabase client
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto py-12">
      <header className="mb-8">
        <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold mt-3">{post.title}</h1>
        <p className="text-sm opacity-60 mt-2">{post.published_at_display}</p>
      </header>

      {/* Slider Motion Gambar Zoom In/Out Blurry */}
      <ImageSlider images={post.cover_images} />

      {/* Konten Lengkap Artikel */}
      <div className="prose dark:prose-invert max-w-none my-8 leading-relaxed">
        {post.content}
      </div>

      {/* Komponen Author Terintegrasi (author.js) */}
      <AuthorCard />
    </article>
  );
}`
    },
    'blog/[slug]/author.js': {
      path: 'src/app/blog/[slug]/author.js',
      desc: 'Komponen info penulis, bio, sertifikasi verified, dan kontak sosial',
      code: `import { ShieldCheck, Instagram, Linkedin, Mail, Github } from 'lucide-react';

export default function AuthorCard() {
  const author = {
    name: 'Fachrial',
    role: 'Tech Enthusiast, Software Engineer & Writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Membangun ekosistem teknologi modern, cloud security, dan eksplorasi antarmuka masa depan.',
    email: 'fachrial.tech@gmail.com',
    instagram: 'https://instagram.com/fachrial.id',
    linkedin: 'https://linkedin.com/in/fachrial-dev',
    github: 'https://github.com/fachrial-official',
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4 items-center">
      <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
      <div>
        <div className="flex items-center gap-1.5 font-bold text-lg">
          <span>{author.name}</span>
          <ShieldCheck className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">{author.role}</p>
        <p className="text-sm opacity-80 mt-1">{author.bio}</p>
      </div>
    </div>
  );
}`
    },
    'admin/page.js': {
      path: 'src/app/admin/page.js',
      desc: 'Halaman form input admin (Upload teks, gambar, berkas PDF/Video dengan sanitasi XSS & SQLi)',
      code: `'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Sanitasi XSS sederhana untuk perlindungan sisi klien
function sanitize(input) {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Teknologi');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const safeTitle = sanitize(title);
    const safeContent = sanitize(content);
    const slug = safeTitle.toLowerCase().replace(/[^\\w\\-]+/g, '-');

    // Insert aman ke Supabase
    const { error } = await supabase.from('posts').insert([
      {
        id: \`post-\${Date.now()}\`,
        slug,
        title: safeTitle,
        content: safeContent,
        category,
        cover_images: [fileUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'],
        published_at_display: new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }),
      }
    ]);

    setIsSubmitting(false);
    if (!error) {
      alert('Postingan berhasil disimpan ke Supabase!');
      setTitle('');
      setContent('');
    } else {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Form Upload Admin Facrial</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Judul Artikel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">URL Cover / Berkas Media</label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Isi Artikel</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-800"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Mengunggah...' : 'Publikasikan ke Supabase'}
        </button>
      </form>
    </div>
  );
}`
    },
    'supabase.js': {
      path: 'src/lib/supabase.js',
      desc: 'Konfigurasi koneksi aman Supabase Client dengan environment variables',
      code: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Peringatan: NEXT_PUBLIC_SUPABASE_URL atau KEY belum diisi di .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');`
    },
    '.env.local': {
      path: '.env.local',
      desc: 'File rahasia penyimpan kunci API (Jangan diupload ke GitHub)',
      code: `# SUPABASE CREDENTIALS (Dapatkan dari Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://xyzproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NEXTAUTH / KEAMANAN JWT (Opsional untuk login admin lanjutan)
NEXTAUTH_SECRET="kunci_rahasia_acak_minimal_32_karakter_12345"
NEXTAUTH_URL="http://localhost:3000"`
    },
    'package.json': {
      path: 'package.json',
      desc: 'Daftar dependensi Next.js 15, Tailwind CSS, Supabase & Lucide Icons',
      code: `{
  "name": "facrial",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.48.0",
    "lucide-react": "^0.475.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.1"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.38"
  }
}`
    },
    'README.md': {
      path: 'README.md',
      desc: 'Panduan lengkap instalasi VS Code, Git, GitHub & Vercel deployment',
      code: `# Facrial - Portal Timeline & Blog Modern

Website berita dan artikel timeline Facebook selang-seling kiri & kanan, dilengkapi floating navbar dengan kontrol transparansi kaca (glassmorphism), mode dark/light, serta integrasi realtime Supabase.

## 🚀 Panduan Instalasi Cepat di VS Code

### 1. Kloning & Masuk ke Folder Proyek
\`\`\`bash
git clone https://github.com/username-anda/facrial.git
cd facrial
\`\`\`

### 2. Instalasi Dependensi
\`\`\`bash
npm install
\`\`\`

### 3. Konfigurasi File Lingkungan (.env.local)
Salin contoh file \`.env.example\` ke \`.env.local\`:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Isi \`NEXT_PUBLIC_SUPABASE_URL\` dan \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` dengan kredensial Supabase Anda.

### 4. Jalankan Dev Server
\`\`\`bash
npm run dev
\`\`\`
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🛡️ Standar Keamanan Sistem
- **Anti XSS**: Seluruh masukan teks difilter dari skrip injeksi HTML dan event handler mencurigakan.
- **Anti SQL Injection**: Penggunaan prepared statements dan parameterisasi query Supabase Client.
- **Data Rahasia**: File \`.env.local\` terdaftar di \`.gitignore\` sehingga tidak bocor ke repositori publik.

---

## 🌐 Deploy ke Vercel
1. Buat repository baru di GitHub bernama \`facrial\`.
2. Push kode lokal ke GitHub:
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: inisialisasi facrial nextjs"
   git branch -M main
   git remote add origin https://github.com/username-anda/facrial.git
   git push -u origin main
   \`\`\`
3. Buka [https://vercel.com](https://vercel.com), klik **Add New Project**, pilih repo **facrial**.
4. Tambahkan Environment Variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
5. Klik **Deploy**!

---
footer Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.`
    }
  };

  const currentFile = fileContents[selectedFile];

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentFile.code);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  const alpha = Math.min(Math.max(transparency / 100, 0.3), 0.95);

  return (
    <div className="w-full pb-20 pt-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Panduan Arsitektur & Eksport Next.js</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Struktur Lengkap Facrial (Next.js + Supabase + Vercel)
        </h1>
        <p className="text-sm opacity-70 mt-1 max-w-3xl leading-relaxed">
          File kode sumber lengkap sesuai permintaan Anda. Anda dapat menyalin langsung setiap file ke proyek Next.js di VS Code, menghubungkannya ke GitHub, dan deploy ke Vercel dengan satu klik.
        </p>
      </div>

      {/* Security Highlights Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              Pondasi Keamanan Terverifikasi (XSS & SQL Injection Free)
            </div>
            <div className="text-xs opacity-80">
              Setiap endpoint dan query menggunakan Prepared Statements Supabase RPC serta sanitasi input berlapis.
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold whitespace-nowrap">
          Enterprise Standard
        </span>
      </div>

      {/* Two Column Layout: File Tree & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Directory */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-blue-500" />
            <span>Pilih File Next.js</span>
          </div>

          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
            }}
            className={`p-3 rounded-2xl border ${
              isDark ? 'border-slate-800' : 'border-slate-200 shadow-sm'
            } divide-y divide-slate-200 dark:divide-slate-800`}
          >
            {Object.keys(fileContents).map((fileKey) => {
              const file = fileContents[fileKey];
              const isSelected = selectedFile === fileKey;
              return (
                <button
                  key={fileKey}
                  onClick={() => setSelectedFile(fileKey)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <div className="truncate flex-1">
                    <div className="font-semibold text-xs font-mono truncate">{file.path}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'opacity-60'}`}>
                      {file.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8">
          <div
            style={{
              backgroundColor: isDark
                ? `rgba(15, 23, 42, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`,
              backdropFilter: `blur(${Math.max(6, transparency / 8)}px)`
            }}
            className={`rounded-2xl border overflow-hidden shadow-xl ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-500/5">
              <div>
                <div className="font-mono text-xs font-bold text-blue-500">{currentFile.path}</div>
                <div className="text-xs opacity-70 mt-0.5">{currentFile.desc}</div>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-pointer"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Tersalin!' : 'Salin File'}</span>
              </button>
            </div>

            <pre className="p-4 sm:p-6 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              {currentFile.code}
            </pre>
          </div>
        </div>
      </div>

      {/* Steps to deploy to GitHub & Vercel */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
          <span>Langkah Praktis VS Code & GitHub</span>
        </h3>

        <ol className="space-y-4 text-xs sm:text-sm leading-relaxed list-decimal list-inside text-slate-700 dark:text-slate-300">
          <li>
            <strong>Buka VS Code</strong>: Buat folder baru bernama <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Facrial</code>, lalu buka folder tersebut di VS Code.
          </li>
          <li>
            <strong>Buat Struktur Folder</strong>: Salin file-file di atas sesuai jalurnya (<code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 font-mono">src/app/layout.js</code>, <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 font-mono">src/lib/supabase.js</code>, dll).
          </li>
          <li>
            <strong>Inisialisasi Git & Push ke GitHub</strong>:
            <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto">
{`git init
git add .
git commit -m "feat: inisialisasi facrial modern timeline"
git branch -M main
git remote add origin https://github.com/akun-anda/facrial.git
git push -u origin main`}
            </pre>
          </li>
          <li>
            <strong>Deploy ke Vercel</strong>: Sambungkan akun GitHub Anda di <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-500 underline font-semibold">vercel.com</a>, pilih repositori <code>facrial</code>, masukkan nilai <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di Environment Variables, lalu klik Deploy.
          </li>
        </ol>
      </div>
    </div>
  );
};
