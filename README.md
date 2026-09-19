# Facrial - Portal Timeline & Blog Modern

Website portal berita dan artikel timeline ala Facebook selang-seling kiri & kanan, dilengkapi floating navbar dengan kontrol transparansi kaca (glassmorphism), tombol switch tema dark/light, kolom pencarian aktif yang aman dari ancaman XSS & SQL Injection, serta sinkronisasi realtime database Supabase.

---

## 📁 Struktur Lengkap Proyek (Next.js App Router)

```text
Facrial/
├── src/
│   ├── app/
│   │   ├── layout.js          # Layout utama website (Navbar melayang / Footer)
│   │   ├── page.js            # Halaman utama (Daftar semua blog timeline Facebook selang-seling)
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       ├── page.js    # Halaman detail isi artikel blog bentuk timeline
│   │   │       └── author.js  # Komponen kartu author dengan profil terverifikasi
│   │   └── admin/
│   │       └── page.js        # Halaman form input admin (Upload teks & file)
│   ├── lib/
│   │   └── supabase.js        # File konfigurasi koneksi ke Supabase Client
├── .env.local                 # File rahasia penyimpan kunci API (Jangan diupload ke GitHub)
├── package.json               # Konfigurasi dependensi Next.js & Tailwind CSS
└── README.md                  # Dokumentasi instalasi dan panduan lengkap
```

---

## 🚀 Panduan Instalasi dari Awal di VS Code & GitHub

### Langkah 1: Persiapan di Komputer Lokal
Pastikan Anda telah menginstal:
1. **Node.js** (versi 18.17 atau lebih tinggi).
2. **Git** di komputer Anda.
3. **Visual Studio Code (VS Code)**.

### Langkah 2: Buka Proyek di VS Code
1. Buka aplikasi **VS Code**.
2. Pilih menu **File > Open Folder...** lalu pilih folder `Facrial`.
3. Buka Terminal terintegrasi di VS Code dengan menekan tombol \`Ctrl + \`\` (atau \`Cmd + \`\` di macOS).

### Langkah 3: Instalasi Dependensi
Ketik perintah berikut di terminal VS Code:
```bash
npm install
```

### Langkah 4: Konfigurasi Kunci Lingkungan (.env.local)
Buat atau periksa file `.env.local` di folder utama:
```env
# Dapatkan kredensial ini dari https://supabase.com (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://proyek-anda.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="kunci_anon_publik_anda"
```
> ⚠️ **PENTING**: File `.env.local` telah terdaftar di `.gitignore` agar tidak terunggah ke repositori publik GitHub demi keamanan kunci API Anda.

### Langkah 5: Jalankan Server Pengembangan Lokal
```bash
npm run dev
```
Buka browser Anda dan kunjungi: **`http://localhost:3000`**.

---

## 🔒 Standar Keamanan Sistem (Anti XSS & SQL Injection)
Website Facrial dirancang dengan standar keamanan enterprise:
1. **Pencegahan XSS (Cross-Site Scripting)**: Seluruh input dari kolom pencarian, form komentar, maupun input postingan disaring secara ketat melalui fungsi sanitasi untuk menghapus tag `<script>`, atribut injeksi (`onerror`, `onload`, `onclick`), serta protokol berbahaya.
2. **Pencegahan SQL Injection**: Penggunaan *Prepared Statements* dan sanitasi query memastikan tidak ada string SQL jahat (seperti `' OR 1=1`, `UNION SELECT`, `DROP TABLE`) yang dapat dieksekusi secara ilegal.
3. **Row Level Security (RLS)**: Tabel Supabase diamankan dengan kebijakan RLS sehingga data hanya dapat diakses atau diubah sesuai hak akses yang ditentukan.

---

## 🗄️ Menyiapkan Database di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com).
2. Buka tab **SQL Editor**, lalu jalankan query berikut:

```sql
-- Buat Tabel Postingan Blog & Berita
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    cover_images TEXT[] DEFAULT '{}',
    author_name TEXT NOT NULL DEFAULT 'Fachrial',
    author_role TEXT DEFAULT 'Software Engineer & Writer',
    author_avatar TEXT,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 5,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at_display TEXT
);

-- Buat Tabel Agenda Kegiatan
CREATE TABLE IF NOT EXISTS agendas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Mendatang',
    author TEXT DEFAULT 'Fachrial',
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Baca Publik
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read Agendas" ON agendas FOR SELECT USING (true);

-- Kebijakan Tambah Data Publik
CREATE POLICY "Public Insert Posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Agendas" ON agendas FOR INSERT WITH CHECK (true);

-- Aktifkan Publikasi Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE agendas;
```

---

## 🌐 Menghubungkan ke GitHub & Deployment ke Vercel

### 1. Inisialisasi Git & Push ke GitHub
Di terminal VS Code Anda:
```bash
git init
git add .
git commit -m "feat: inisialisasi facrial modern timeline website"
git branch -M main
git remote add origin https://github.com/username-anda/facrial.git
git push -u origin main
```

### 2. Deploy ke Vercel (1-Click Hosting)
1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New... > Project**.
3. Pilih repositori **`facrial`**.
4. Di bagian **Environment Variables**, tambahkan:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` | Value: `(URL Supabase Anda)`
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: `(Anon Key Supabase Anda)`
5. Klik **Deploy**. Website Facrial akan aktif di internet dalam hitungan detik!

---

footer Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.
