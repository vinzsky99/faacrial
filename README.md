# Facrial - Portal Berita, Artikel & Agenda Modern (Next.js + Tailwind CSS + Supabase)

Portal publikasi berita, artikel teknologi, dan timeline interaktif dengan desain UI/UX modern, tema **Dark/Light Mode**, **Transparansi Navbar Melayang** yang dapat diatur fleksibel, dan perlindungan keamanan komprehensif dari serangan **XSS (Cross-Site Scripting)** dan **SQL Injection**.

---

## 📁 Struktur Direktori Proyek

Sesuai spesifikasi arsitektur:

```text
Facrial/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout utama website (Navbar melayang, Transparansi, Search Bar Anti-XSS, Footer)
│   │   ├── page.tsx           # Halaman utama (Cover FB style, Hero Motion Slider, Alternating Timeline Feed)
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx   # Halaman detail artikel blog timeline lengkap & komentar real-time
│   │   │       └── author.tsx # Halaman profil resmi author & linimasa karya
│   │   └── admin/
│   │       └── page.tsx       # Form input admin (Upload teks, foto motion slider, & lampiran berkas PDF)
│   ├── lib/
│   │   ├── supabase.ts        # Konfigurasi koneksi Supabase & fallback sinkronisasi realtime
│   │   └── security.ts        # Sanitasi keamanan Anti-XSS dan filter query pencarian
│   ├── components/
│   │   ├── VisiMisiView.tsx   # Halaman Visi & Misi ekosistem Facrial
│   │   ├── AgendaView.tsx     # Linimasa daftar agenda kegiatan & pendaftaran
│   │   └── QuickPostModal.tsx # Modal cepat bagi author menulis artikel/agenda seketika
│   ├── data/
│   │   └── initialData.ts     # Data awal starter (Artikel, agenda, profil Fachrial)
│   ├── types.ts               # Definisi tipe TypeScript
│   ├── index.css              # Custom styling Tailwind CSS & hover-light-glow 50%
│   └── App.tsx                # Client router SPA tanpa relog/refresh page
├── .env.local                 # File rahasia penyimpan kunci API (Jangan diupload ke GitHub)
├── .env.example               # Contoh referensi format variabel environment
├── package.json
└── README.md                  # Dokumentasi instalasi lengkap dari awal hingga akhir
```

---

## 🎨 Fitur Utama & Desain UI/UX

1. **Navbar Melayang di Atas (Floating Glassmorphism Navbar)**:
   - **Transparansi Dinamis**: Tingkat transparansi navbar dapat diatur dari 20% hingga 100% menggunakan tombol slider slider & preset (35%, 60%, 85%, 100%).
   - **Tombol Dark/Light On/Off**: Mengubah tema gelap/terang secara seketika.
   - **Kolom Pencarian Tengah Realtime**: Dilengkapi filter **Anti-XSS** untuk mencari artikel dan agenda secara aman.
   - **Menu Kanan**:
     - Menu **Beranda/Rumah**
     - Menu **Visi & Misi**
     - Menu **Agenda Kegiatan**
     - Menu **Kontak Saya** dengan **Auto Dropdown Responsive** (Logo Instagram, LinkedIn, dan Email).
     - **Efek Sentuh Cahaya (Light Glow 50%)**: Setiap tombol dan kartu disentuh memiliki efek cahaya stabil dengan kapasitas 50% yang lembut di mata.

2. **Landing Page FB-Style Cover & Hero Motion Slider**:
   - Cover banner lebar dengan slider gambar motion zoom dan teks sorotan.
   - Foto profil bulat dengan border kontras dan lencana terverifikasi resmi (Verified Badge).
   - Kotak komposer status Facebook: *"Apa berita, artikel teknologi, atau agenda baru yang ingin Anda bagikan hari ini, Fachrial?"*.

3. **Linimasa Selang-Seling Kiri & Kanan (Alternating Facebook Timeline)**:
   - Tampilan timeline zigzag kiri-kanan dengan sumbu vertikal di tengah.
   - Informasi detail: Judul, Hari, Tanggal, dan Jam waktu Indonesia (e.g. `Jumat, 19 September 2026 • 09:30 WIB`).
   - Fitur **"Baca Selengkapnya"** tanpa perlu refresh/relog halaman (Single Page Architecture).
   - Slider foto pada setiap postingan dengan tombol **Zoom In/Out** berlatar belakang buram (blurry effect).
   - Reaksi suka (Like), komentar, dan tombol salin link postingan.

4. **Sistem Keamanan Teruji**:
   - **Pencegahan XSS**: Menggunakan encoding karakter HTML khusus (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#x27;`) pada semua input pengguna, komentar, dan pencarian.
   - **Pencegahan SQL Injection**: Penggunaan prepared queries dan client SDK Supabase yang kebal terhadap manipulasi sintaks SQL.

---

## 🚀 Panduan Instalasi dari Awal di VS Code

### 1. Prasyarat Sistem
- **Node.js** versi 18.x atau 20.x ke atas.
- **Git** terinstal di komputer Anda.
- **Visual Studio Code** (VS Code).

### 2. Langkah di Terminal VS Code
Buka terminal di VS Code (`Ctrl + ~` atau `Cmd + ~`), lalu jalankan perintah berikut:

```bash
# 1. Clone repository dari GitHub Anda
git clone https://github.com/username-anda/facrial.git

# 2. Masuk ke direktori proyek
cd facrial

# 3. Install semua dependencies
npm install

# 4. Salin file environment
cp .env.example .env.local

# 5. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di `http://localhost:3000` untuk melihat website berjalan.

---

## 🐙 Panduan Menghubungkan ke GitHub

```bash
# 1. Inisialisasi Git di dalam folder (jika belum)
git init

# 2. Pastikan file rahasia diabaikan oleh Git
# Periksa apakah .env.local sudah ada di dalam .gitignore

# 3. Tambahkan semua file dan buat commit awal
git add .
git commit -m "feat: inisialisasi awal Facrial portal Next.js Tailwind Supabase"

# 4. Hubungkan remote repository GitHub Anda
git branch -M main
git remote add origin https://github.com/username-anda/facrial.git

# 5. Kirim kode ke GitHub
git push -u origin main
```

---

## ☁️ Panduan Deploy ke Vercel

1. Buka [https://vercel.com](https://vercel.com) dan masuk dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repository `facrial` yang baru saja Anda push.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci anonim publik Supabase Anda.
5. Klik **"Deploy"**. Vercel akan memproses build secara otomatis dalam waktu kurang dari 1 menit.

---

## 🗄️ Konfigurasi Supabase Realtime Database

Untuk menyinkronkan data secara realtime ke cloud:
1. Buat proyek baru di [https://supabase.com](https://supabase.com).
2. Salin `Project URL` dan `anon public API Key` ke file `.env.local`:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
3. Buka menu **SQL Editor** di Supabase Dashboard, lalu jalankan query skema berikut:

```sql
-- Buat tabel postingan dan agenda
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  date TIMESTAMPTZ DEFAULT now(),
  day_name TEXT,
  formatted_date TEXT,
  time TEXT,
  author JSONB NOT NULL,
  read_time TEXT,
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_agenda BOOLEAN DEFAULT false,
  agenda JSONB,
  attachments JSONB,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false
);

-- Buat tabel komentar
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  likes INT DEFAULT 0
);

-- Aktifkan Realtime Publikasi
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
```

---

## 🛡️ Standar Keamanan Aplikasi

- **Anti-XSS Filter**: Fungsi `sanitizeText()` otomatis mengubah entitas berbahaya sebelum dimasukkan ke dalam DOM.
- **Sanitasi Pencarian**: Menghapus tag `<script>`, tanda kutip SQL, dan karakter eksploitasi lainnya.
- **Proteksi Tautan**: Mencegah serangan injeksi protokol berbahaya seperti `javascript:` atau `data:`.

--- Update deploy ----

**Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.**
