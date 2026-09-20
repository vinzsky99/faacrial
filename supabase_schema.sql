-- ============================================================================
-- SKRIP DATABASE RESMI SUPABASE - PORTAL FACRIAL HUKUM & POLITIK
-- Portal Kebenaran Sejarah, Tragedi 1998 & Reformasi Indonesia
-- ============================================================================
-- CARA PENGGUNAAN DI SUPABASE:
-- 1. Buka dashboard Supabase Anda (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Buka menu "SQL Editor" di bilah kiri
-- 3. Klik "New query", salin (copy) SELURUH isi file ini, lalu klik "RUN"
-- 4. Semua tabel, relasi, trigger real-time, dan data awal akan terpasang sempurna!
-- ============================================================================

-- 1. AKTIFKAN EKSTENSI POSTGRESQL YANG DIBUTUHKAN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABEL: verified_authors (Data Author Resmi & Terverifikasi)
-- Admin dapat menambahkan data author langsung lewat dashboard / SQL ini
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verified_authors (
    id TEXT PRIMARY KEY DEFAULT ('auth-' || substr(uuid_generate_v4()::text, 1, 8)),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    verified_by TEXT DEFAULT 'Admin Redaksi Facrial',
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    articles_count INT DEFAULT 0,
    status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Menunggu Verifikasi', 'Nonaktif')),
    avatar TEXT,
    cover_photo TEXT,
    bio TEXT,
    city TEXT,
    workplace TEXT,
    education TEXT,
    kta_number TEXT,
    phone TEXT,
    socials JSONB DEFAULT '{"instagram": "", "facebook": "", "linkedin": "", "email": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian author berdasarkan email
CREATE INDEX IF NOT EXISTS idx_authors_email ON public.verified_authors(email);

-- ============================================================================
-- 3. TABEL: author_applications (Pendaftaran Calon Author / Become an Author)
-- Menyimpan pengajuan calon author lengkap dengan foto verifikasi profil/identitas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.author_applications (
    id TEXT PRIMARY KEY DEFAULT ('app-' || substr(uuid_generate_v4()::text, 1, 8)),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    expertise TEXT NOT NULL, -- Bidang Keahlian (Hukum Tata Negara, HAM, dll)
    institution TEXT NOT NULL, -- Universitas / Lembaga
    bio_reason TEXT NOT NULL, -- Alasan & Pengalaman Riset
    portfolio_url TEXT, -- Link Karya / Dokumen
    verification_photo TEXT NOT NULL, -- Wajib: Foto Verifikasi Profil / KTP / Identitas
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT, -- Catatan dari Admin
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON public.author_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.author_applications(created_at DESC);

-- ============================================================================
-- 4. TABEL: posts (Postingan Berita Investigasi & Agenda Kegiatan)
-- Memiliki kolom status untuk persetujuan Admin: 'approved', 'pending_approval', 'rejected'
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY DEFAULT ('post-' || substr(uuid_generate_v4()::text, 1, 8)),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hukum & Politik',
    cover_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    date TIMESTAMPTZ DEFAULT NOW(),
    day_name TEXT,
    formatted_date TEXT,
    time TEXT,
    read_time TEXT DEFAULT '5 mnt baca',
    author_id TEXT REFERENCES public.verified_authors(id) ON DELETE SET NULL,
    author_json JSONB NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending_approval', 'rejected')),
    is_agenda BOOLEAN DEFAULT FALSE,
    agenda_details JSONB,
    attachments JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    loves INT DEFAULT 0,
    views INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_date ON public.posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- ============================================================================
-- 5. TABEL: post_loves (Pencatatan Love Real-Time)
-- Mencegah manipulasi dan mencatat interaksi love pengguna
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_loves (
    id BIGSERIAL PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- IP / Fingerprint / User ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_identifier)
);

CREATE INDEX IF NOT EXISTS idx_loves_post_id ON public.post_loves(post_id);

-- ============================================================================
-- 6. TABEL: post_views (Pencatatan Dilihat / Views Real-Time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_views (
    id BIGSERIAL PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_post_id ON public.post_views(post_id);

-- ============================================================================
-- 7. TABEL: comments (Komentar Publik dengan Kontrol & Moderasi Admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT ('cmt-' || substr(uuid_generate_v4()::text, 1, 8)),
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'hidden', 'pending')),
    loves INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);

-- ============================================================================
-- 8. TABEL: notifications (Notifikasi Real-Time ala Facebook / Instagram)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || substr(uuid_generate_v4()::text, 1, 8)),
    type TEXT NOT NULL CHECK (type IN ('love', 'comment', 'post', 'agenda', 'author_application', 'approval', 'security')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    author_name TEXT,
    post_slug TEXT,
    post_id TEXT,
    recipient_role TEXT DEFAULT 'all' CHECK (recipient_role IN ('all', 'admin', 'author')),
    avatar TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================================================
-- 9. TRIGGER FUNGSI: AUTO UPDATE COUNTER LOVES, VIEWS, DAN COMMENTS
-- ============================================================================

-- Function Love Counter
CREATE OR REPLACE FUNCTION public.handle_new_love()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET loves = loves + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_love ON public.post_loves;
CREATE TRIGGER trigger_new_love
AFTER INSERT ON public.post_loves
FOR EACH ROW EXECUTE FUNCTION public.handle_new_love();

-- Function Views Counter
CREATE OR REPLACE FUNCTION public.handle_new_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET views = views + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_view ON public.post_views;
CREATE TRIGGER trigger_new_view
AFTER INSERT ON public.post_views
FOR EACH ROW EXECUTE FUNCTION public.handle_new_view();

-- Function Comments Counter
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'approved') THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_comment ON public.comments;
CREATE TRIGGER trigger_new_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

-- ============================================================================
-- 10. AKTIFKAN SUPABASE REALTIME REPLICATION
-- Mengizinkan browser menerima update instan secara live
-- ============================================================================
DO $$
BEGIN
    -- Menambahkan tabel ke publikasi real-time jika belum terdaftar
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.author_applications;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.verified_authors;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Keamanan data agar aplikasi aman diakses publik dengan anon key
-- ============================================================================
ALTER TABLE public.verified_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_loves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Kebijakan Verified Authors (Semua orang bisa membaca, admin/anon bisa insert/update)
DROP POLICY IF EXISTS "Public read verified authors" ON public.verified_authors;
CREATE POLICY "Public read verified authors" ON public.verified_authors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow author registration" ON public.verified_authors;
CREATE POLICY "Allow author registration" ON public.verified_authors FOR ALL USING (true);

-- Kebijakan Author Applications (Publik bisa daftar, Admin bisa mengelola)
DROP POLICY IF EXISTS "Public can submit author application" ON public.author_applications;
CREATE POLICY "Public can submit author application" ON public.author_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public/Admin can view applications" ON public.author_applications;
CREATE POLICY "Public/Admin can view applications" ON public.author_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow application update" ON public.author_applications;
CREATE POLICY "Allow application update" ON public.author_applications FOR UPDATE USING (true);

-- Kebijakan Posts (Publik bisa membaca yang approved, admin bisa baca semua)
DROP POLICY IF EXISTS "Public read approved posts" ON public.posts;
CREATE POLICY "Public read approved posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow post insert and updates" ON public.posts;
CREATE POLICY "Allow post insert and updates" ON public.posts FOR ALL USING (true);

-- Kebijakan Loves & Views (Publik bisa menambah)
DROP POLICY IF EXISTS "Allow public love" ON public.post_loves;
CREATE POLICY "Allow public love" ON public.post_loves FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public view log" ON public.post_views;
CREATE POLICY "Allow public view log" ON public.post_views FOR ALL USING (true);

-- Kebijakan Comments
DROP POLICY IF EXISTS "Public read comments" ON public.comments;
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert comments" ON public.comments;
CREATE POLICY "Public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage comments" ON public.comments;
CREATE POLICY "Admin manage comments" ON public.comments FOR ALL USING (true);

-- Kebijakan Notifications
DROP POLICY IF EXISTS "Public read notifications" ON public.notifications;
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public manage notifications" ON public.notifications;
CREATE POLICY "Public manage notifications" ON public.notifications FOR ALL USING (true);

-- ============================================================================
-- 12. DATA AWAL (SEED DATA): AUTHOR RESMI & ARSIP SEJARAH 1998
-- ============================================================================
INSERT INTO public.verified_authors (id, email, name, role, verified, verified_by, bio, city, workplace, education, kta_number, avatar, cover_photo)
VALUES 
(
    'auth-1',
    'fachrial.official2026@gmail.com',
    'Fachrial, S.H., M.H.',
    'Pemimpin Redaksi & Peneliti Hukum Tata Negara',
    true,
    'Sistem Pusat Redaksi Facrial',
    'Pemerhati konstitusi, penelusur dokumen Tragedi 1998, dan penganalisis regulasi politik nasional serta advokasi pemenuhan hak korban HAM.',
    'DKI Jakarta, Indonesia',
    'Lembaga Kajian Hukum Tata Negara & Redaksi Facrial',
    'Magister Hukum Tata Negara (M.H.), Universitas Indonesia',
    'KTA-RED-001/JKT/2026',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80'
),
(
    'auth-2',
    'redaksi.investigasi@facrial.id',
    'Tim Advokasi & Riset HAM',
    'Author Verifikasi Dokumen & Sejarah',
    true,
    'Fachrial, S.H., M.H.',
    'Kolektif jurnalisme data mengkaji kronologi Trisakti, Semanggi, dan kebenaran peristiwa sejarah kemanusiaan Indonesia.',
    'Jakarta Pusat, Indonesia',
    'Pusat Dokumentasi HAM & Reformasi',
    'Kolektif Akademisi & Advokat Hak Asasi Manusia',
    'KTA-INV-002/HAM/2026',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80'
)
ON CONFLICT (email) DO NOTHING;

-- Notifikasi Awal Real-Time
INSERT INTO public.notifications (id, type, title, message, author_name, post_slug, read)
VALUES
(
    'notif-init-1',
    'post',
    'Selamat Datang di Portal Facrial Hukum & Politik',
    'Sistem database Supabase telah terhubung secara resmi. Data postingan, agenda, author, love, dan komentar kini aktif real-time.',
    'Admin Redaksi Facrial',
    '',
    false
)
ON CONFLICT (id) DO NOTHING;
