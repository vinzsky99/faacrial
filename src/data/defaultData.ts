import { Author, Post, Agenda } from '../types';

export const defaultAuthor: Author = {
  name: 'Fachrial',
  role: 'Tech Enthusiast, Software Engineer & Digital Architect',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  coverImages: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80', // Abstract futuristic waves
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80', // Retro hardware & neon
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80', // Matrix code / cyber
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'  // Electronic circuit
  ],
  bio: 'Membangun ekosistem teknologi modern, arsitektur cloud, keamanan web, dan eksplorasi antarmuka masa depan. Berbagi wawasan terkini seputar Next.js, Supabase, dan rekayasa perangkat lunak berskala tinggi.',
  verified: true,
  location: 'Jakarta, Indonesia',
  email: 'fachrial.tech@gmail.com',
  instagram: 'https://instagram.com/fachrial.id',
  linkedin: 'https://linkedin.com/in/fachrial-dev',
  github: 'https://github.com/fachrial-official'
};

export const defaultPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'arsitektur-modern-nextjs-dan-supabase-2026',
    title: 'Membangun Arsitektur Web Skala Tinggi dengan Next.js & Realtime Supabase',
    excerpt: 'Panduan mendalam tentang integrasi Next.js App Router dengan Supabase Database, Row Level Security (RLS), serta mitigasi serangan XSS dan SQL Injection pada tingkat aplikasi enterprise.',
    content: `Dalam lanskap rekayasa web modern tahun 2026, keandalan dan keamanan data bukan lagi opsi tambahan, melainkan pondasi utama. Artikel ini mengupas tuntas bagaimana kami mengonfigurasi Next.js bersama Supabase untuk menciptakan sistem postingan timeline dengan performa optimal.

### 1. Keamanan Aplikasi: Pencegahan XSS & SQL Injection
Sebelum data disimpan ke tabel Supabase, setiap input melalui lapisan pembersihan ketat:
- **Sanitasi HTML**: Menghilangkan atribut berbahaya seperti \`onerror\`, \`onload\`, dan skrip tak dikenal.
- **Parameterized Queries**: Menggunakan Supabase client berbasis RPC dan Prepared Statements sehingga risiko SQL Injection tereliminasi total.
- **Content Security Policy (CSP)**: Membatasi sumber skrip eksternal di sisi browser.

### 2. Desain Timeline Selang-Seling (Alternating Feed)
Tampilan timeline Facebook-style yang dirancang dengan selang-seling kiri dan kanan memberikan ritme visual yang nyaman bagi pembaca. Setiap postingan dilengkapi gambar beranimasi halus, slider interaktif, dan status waktu lokal yang presisi.

### 3. Keunggulan Realtime Database
Dengan mengaktifkan fitur Postgres Changes dari Supabase, setiap postingan baru yang diunggah oleh admin langsung disiarkan ke semua klien tanpa perlu memuat ulang halaman (zero-reload architecture).`,
    category: 'Teknologi',
    tags: ['Next.js', 'Supabase', 'CyberSecurity', 'TailwindCSS', 'FullStack'],
    coverImages: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
    ],
    author: defaultAuthor,
    createdAt: '2026-09-18T14:30:00.000Z',
    publishedAtDisplay: 'Jumat, 18 September 2026 • 14:30 WIB',
    likes: 142,
    commentsCount: 28,
    views: 1850,
    readingTimeMinutes: 5,
    attachments: [
      {
        id: 'att-1',
        name: 'Arsitektur_Nextjs_Supabase_Enterprise.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: '#'
      },
      {
        id: 'att-2',
        name: 'Skema_Database_SQL_Production.sql',
        size: '14 KB',
        type: 'doc',
        url: '#'
      }
    ],
    timelineSide: 'left'
  },
  {
    id: 'post-2',
    slug: 'filosofi-ui-ux-glassmorphism-dan-transparansi-adaptif',
    title: 'Filosofi Desain UI/UX: Floating Glassmorphism & Kontrol Transparansi Adaptif',
    excerpt: 'Eksplorasi estetika antarmuka melayang dengan efek backlight 50% lembut, blur transparan yang dapat disesuaikan pengguna, serta ergonomi dark dan light mode.',
    content: `Estetika digital modern kini bergeser dari sekadar warna statis ke arah tekstur dinamis dan kedalaman visual (depth perception).

### Menghindari "AI Slop" dalam Desain
Desain yang baik tidak menumpuk gradien norak atau bayangan menyala yang mengganggu mata. Pada website Facrial, kami menerapkan:
- **Luminositas Terkontrol 50%**: Efek cahaya saat kursor atau sentuhan menyentuh tombol diatur dengan opacity stabil 50%, memberikan umpan balik taktil tanpa menyilaukan.
- **Navbar Melayang Fleksibel**: Bilah navigasi berada di posisi atas mengambang dengan latar belakang kaca (backdrop-blur). Pengguna memiliki kendali penuh untuk menaikkan atau menurunkan intensitas transparansi.
- **Dual-Mode Ergonomis**: Transisi antara mode gelap (dark obsidian) dan mode terang (clean milk-white) berlangsung instan dan tanpa flicker.`,
    category: 'Visi Digital',
    tags: ['UI/UX', 'Glassmorphism', 'DesignSystem', 'Motion', 'TailwindCSS'],
    coverImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80'
    ],
    author: defaultAuthor,
    createdAt: '2026-09-17T09:15:00.000Z',
    publishedAtDisplay: 'Kamis, 17 September 2026 • 09:15 WIB',
    likes: 98,
    commentsCount: 16,
    views: 1290,
    readingTimeMinutes: 4,
    timelineSide: 'right'
  },
  {
    id: 'post-3',
    slug: 'agenda-akselerasi-ai-dan-rekayasa-perangkat-lunak-2026',
    title: 'Roadmap & Agenda: Akselerasi Kecerdasan Artifisial dalam Pengembangan Web',
    excerpt: 'Ringkasan agenda riset dan workshop mendatang mengenai pemanfaatan model bahasa generasi terbaru dan edge runtime untuk aplikasi berskala global.',
    content: `Perkembangan sistem komputasi terdistribusi membuka peluang baru bagi rekayasa perangkat lunak di Indonesia. Kami menjadwalkan rangkaian agenda kegiatan diskusi, workshop kode bersih, dan telaah keamanan sistem.

### Agenda Prioritas
1. Penguatan fondasi API aman tanpa kebocoran kunci rahasia.
2. Sinkronisasi multi-klien realtime menggunakan Supabase channels.
3. Otomasi pipeline CI/CD GitHub menuju platform hosting Vercel.

Seluruh materi dan presentasi akan dirilis secara terbuka bagi komunitas developer.`,
    category: 'Agenda',
    tags: ['Agenda', 'AI', 'Cloud', 'Workshop', 'Komunitas'],
    coverImages: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80'
    ],
    author: defaultAuthor,
    createdAt: '2026-09-16T19:45:00.000Z',
    publishedAtDisplay: 'Rabu, 16 September 2026 • 19:45 WIB',
    likes: 215,
    commentsCount: 42,
    views: 2420,
    readingTimeMinutes: 6,
    timelineSide: 'left'
  },
  {
    id: 'post-4',
    slug: 'panduan-komprehensif-deployment-vercel-dan-github',
    title: 'Panduan Komprehensif Deployment Next.js dari VS Code ke GitHub & Vercel',
    excerpt: 'Langkah praktis menghubungkan repositori lokal di VS Code, konfigurasi variabel lingkungan di .env.local, dan deploy otomatis tanpa hambatan.',
    content: `Banyak pengembang pemula menghadapi kendala saat mempublikasikan kode mereka ke internet. Panduan ini menguraikan alur kerja standar industri:

1. **Inisialisasi Git Lokal**: Menyiapkan repository bersih dengan file .gitignore yang mengecualikan folder node_modules dan file rahasia .env.local.
2. **Koneksi Remote ke GitHub**: Menggunakan SSH atau Personal Access Token untuk keamanan otentikasi.
3. **Impor Proyek di Dashboard Vercel**: Vercel secara otomatis mendeteksi konfigurasi Next.js dan menjalankan \`npm run build\`.
4. **Konfigurasi Environment Variable**: Menyuntikkan URL dan Anon Key Supabase langsung di dashboard Vercel settings.`,
    category: 'Tutorial',
    tags: ['Tutorial', 'GitHub', 'Vercel', 'VSCode', 'Deployment'],
    coverImages: [
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1200&q=80'
    ],
    author: defaultAuthor,
    createdAt: '2026-09-15T11:20:00.000Z',
    publishedAtDisplay: 'Selasa, 15 September 2026 • 11:20 WIB',
    likes: 184,
    commentsCount: 31,
    views: 1980,
    readingTimeMinutes: 7,
    attachments: [
      {
        id: 'att-3',
        name: 'Cheatsheet_Git_VSCode_Vercel.pdf',
        size: '1.8 MB',
        type: 'pdf',
        url: '#'
      }
    ],
    timelineSide: 'right'
  }
];

export const defaultAgendas: Agenda[] = [
  {
    id: 'agenda-1',
    title: 'Webinar Arsitektur Next.js 15 & Supabase Security Hardening',
    date: '25 September 2026',
    time: '19:30 - 21:30 WIB',
    location: 'Live Zoom & YouTube Streaming',
    category: 'Webinar Online',
    description: 'Bedah tuntas integrasi database Supabase, konfigurasi Row Level Security (RLS) anti bocor, dan implementasi floating UI yang responsif.',
    status: 'Mendatang',
    author: 'Fachrial',
    link: 'https://zoom.us',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    attachments: [
      {
        id: 'att-ag-1',
        name: 'TOR_Rundown_Webinar_Supabase_2026.pdf',
        size: '1.8 MB',
        type: 'pdf',
        url: '#'
      },
      {
        id: 'att-ag-2',
        name: 'Slide_Materi_Intro_RLS.pdf',
        size: '3.2 MB',
        type: 'pdf',
        url: '#'
      }
    ]
  },
  {
    id: 'agenda-2',
    title: 'Workshop Desain Sistem: Glassmorphism & Micro-Interaction Motion',
    date: '02 Oktober 2026',
    time: '13:00 - 16:30 WIB',
    location: 'Tech Hub Jakarta & Hybrid Online',
    category: 'Hands-on Workshop',
    description: 'Membangun komponen interaktif dengan Tailwind CSS v4, Motion animasi halus, dan kontrol transparansi real-time.',
    status: 'Mendatang',
    author: 'Fachrial',
    link: 'https://techhub.id',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
    attachments: [
      {
        id: 'att-ag-3',
        name: 'Starter_Pack_Figma_Token_v2.zip',
        size: '5.4 MB',
        type: 'archive',
        url: '#'
      }
    ]
  },
  {
    id: 'agenda-3',
    title: 'Diskusi Terbuka: Masa Depan Open-Source & Komunitas Developer Indonesia',
    date: '10 Oktober 2026',
    time: '15:00 - 18:00 WIB',
    location: 'Ruang Kolaborasi Digital, Bandung',
    category: 'Meetup Komunitas',
    description: 'Sesi networking santai, berbagi portofolio, dan peluang kolaborasi proyek rekayasa perangkat lunak.',
    status: 'Mendatang',
    author: 'Fachrial',
    link: '#',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    attachments: [
      {
        id: 'att-ag-4',
        name: 'Proposal_Kolaborasi_Komunitas.pdf',
        size: '1.1 MB',
        type: 'pdf',
        url: '#'
      }
    ]
  }
];

export const defaultVerifiedAuthors = [
  {
    id: 'author-1',
    name: 'Fachrial',
    email: 'fachrial.tech@gmail.com',
    role: 'Founder & Principal Software Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Pengembang web spesialis arsitektur sistem skala tinggi, keamanan cloud Supabase, dan desain pengalaman pengguna modern.',
    institution: 'Facrial Digital Lab',
    verifiedByEmail: true,
    verifiedAt: '2026-09-01T08:00:00.000Z',
    verificationCode: 'VRF-FAC-99218',
    status: 'verified' as const,
    postsCount: 14
  },
  {
    id: 'author-2',
    name: 'Sarah Dian Pratiwi',
    email: 'sarah.pratiwi@techwriter.id',
    role: 'Senior Tech & Security Journalist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    bio: 'Menulis riset mendalam tentang keamanan siber, tren API, dan perlindungan privasi data pengguna di Asia Tenggara.',
    institution: 'CyberWatch Media',
    verifiedByEmail: true,
    verifiedAt: '2026-09-10T11:20:00.000Z',
    verificationCode: 'VRF-SAR-48201',
    status: 'verified' as const,
    postsCount: 8
  },
  {
    id: 'author-3',
    name: 'Rian Kusuma Adhitama',
    email: 'rian.adhitama@cloudnative.dev',
    role: 'DevOps & Cloud Database Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Praktisi infrastruktur cloud, automated CI/CD pipeline, dan optimasi query database PostgreSQL/Supabase.',
    institution: 'Nusantara Cloud System',
    verifiedByEmail: true,
    verifiedAt: '2026-09-15T15:45:00.000Z',
    verificationCode: 'VRF-RIA-10932',
    status: 'verified' as const,
    postsCount: 5
  }
];

export const defaultVisiMisi = {
  visi: 'Menjadi wadah publikasi dan kolaborasi digital terdepan yang menginspirasi generasi technopreneur melalui penyajian konten teknologi, rekayasa perangkat lunak, dan estetika desain antarmuka berkualitas tinggi serta aman.',
  misi: [
    {
      id: 'm1',
      title: 'Pendidikan & Literasi Teknologi Terbuka',
      desc: 'Menyajikan tutorial, dokumentasi arsitektur, dan studi kasus pemrograman yang mendalam, mudah dipahami, dan relevan dengan standar industri terkini.'
    },
    {
      id: 'm2',
      title: 'Keamanan Data & Privasi Terjamin',
      desc: 'Mempromosikan standar pengembangan web yang aman dari ancaman siber seperti XSS, SQL Injection, dan eksploitasi data dengan arsitektur modern.'
    },
    {
      id: 'm3',
      title: 'Desain Pengalaman Pengguna (UI/UX) Bermartabat',
      desc: 'Menggabungkan keindahan tipografi, interaktivitas gerak (motion), dan kontrol aksesibilitas (dark/light & transparansi) untuk kenyamanan optimal pembaca.'
    },
    {
      id: 'm4',
      title: 'Kolaborasi dan Pertumbuhan Komunitas',
      desc: 'Menyediakan ruang bagi para author, pengembang, dan pemerhati teknologi untuk berinteraksi, bertukar agenda, dan berkarya bersama.'
    }
  ]
};
