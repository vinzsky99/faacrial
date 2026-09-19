import { Author, Post } from '../types';

export const primaryAuthor: Author = {
  id: 'author-fachrial',
  name: 'Fachrial, S.H., M.H.',
  role: 'Pemimpin Redaksi & Peneliti Hukum Tata Negara',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
  bio: 'Jurnalis investigasi hukum dan politik Indonesia. Berfokus pada penelusuran fakta otentik Reformasi 1998, evaluasi hegemoni Orde Baru, pemenuhan hak korban pelanggaran HAM berat, dan tegaknya supremasi hukum.',
  verified: true,
  city: 'DKI Jakarta, Indonesia',
  workplace: 'Lembaga Studi Hukum Tata Negara & Redaksi Facrial',
  education: 'Magister Hukum Tata Negara (M.H.), Universitas Indonesia',
  ktaNumber: 'KTA-RED-001/JKT/2026',
  socials: {
    instagram: 'https://instagram.com/fachrial',
    facebook: 'https://facebook.com/fachrial.official',
    linkedin: 'https://linkedin.com/in/fachrial',
    email: 'fachrial.official2026@gmail.com',
    github: 'https://github.com/fachrial',
  },
};

export const heroSliderItems = [
  {
    id: 'slider-1',
    title: 'Menyingkap Tabir Fakta Tragedi Trisakti 12 Mei 1998: Rekonstruksi Peristiwa, Peluru Tajam, dan Janji Keadilan yang Tertunda',
    category: 'Tragedi & HAM',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    date: '19 September 2026',
    slug: 'fakta-tragedi-trisakti-12-mei-1998',
    excerpt: 'Investigasi komprehensif atas gugurnya empat martir reformasi Trisakti, temuan balistik peluru tajam militer, serta kesaksian saksi kunci yang membongkar rekayasa kronologi resmi.',
  },
  {
    id: 'slider-2',
    title: 'Runtuhnya Tirani Orde Baru 21 Mei 1998: Detik-Detik Bersejarah Pengunduran Diri Soeharto dan Fajar Reformasi Indonesia',
    category: 'Orde Baru',
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
    date: '17 September 2026',
    slug: 'runtuhnya-orde-baru-21-mei-1998-reformasi',
    excerpt: 'Kilas balik 32 tahun hegemoni otoriter, gelombang pendudukan gedung DPR/MPR oleh puluhan ribu mahasiswa, dan manuver politik kabinet menjelang kejatuhan rezim.',
  },
  {
    id: 'slider-3',
    title: 'Dekonstruksi Sejarah Peristiwa G30S 1965: Kajian Yuridis TAP MPRS XXV/1966 dan Hak Keadilan Korban Kemanusiaan',
    category: 'Tragedi & HAM',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    date: '14 September 2026',
    slug: 'dekonstruksi-sejarah-g30s-1965-yuridis-ham',
    excerpt: 'Mengurai benang kusut historiografi politik 1965 melalui arsip deklasifikasi internasional, penahanan sewenang-wenang tanpa peradilan, dan arah pemulihan hak martabat bangsa.',
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'fakta-tragedi-trisakti-12-mei-1998',
    title: 'Menyingkap Tabir Fakta Tragedi Trisakti 12 Mei 1998: Rekonstruksi Peristiwa, Peluru Tajam, dan Janji Keadilan yang Tertunda',
    excerpt: 'Investigasi komprehensif atas gugurnya empat mahasiswa Universitas Trisakti, hasil uji balistik proyektil tajam, serta kesaksian saksi kunci yang menuntut pengadilan HAM ad hoc.',
    content: `Tanggal 12 Mei 1998 tercatat dalam tinta darah sejarah modern Indonesia. Aksi damai ribuan civitas akademika Universitas Trisakti yang menuntut reformasi ekonomi dan politik berakhir dengan dentuman senapan mematikan di Jalan Letjen S. Parman, Grogol, Jakarta Barat.
    
Empat mahasiswa gugur sebagai pahlawan reformasi:
1. **Elang Mulia Lesmana** (Fakultas Arsitektur, 1978–1998) - tertembak di dada kiri menembus punggung.
2. **Heri Hertanto** (Fakultas Teknik Industri, 1977–1998) - tertembak di punggung tembus ke dada.
3. **Hafidin Royan** (Fakultas Teknik Sipil, 1976–1998) - gugur seketika akibat tembakan di pelipis kanan.
4. **Hendriawan Sie** (Fakultas Ekonomi, 1978–1998) - tertembak di leher bagian belakang.

### Bukti Balistik dan Laporan Resmi TGPF
Hasil investigasi Tim Gabungan Pencari Fakta (TGPF) yang dipimpin oleh Marzuki Darusman serta temuan uji balistik di Pusat Laboratorium Forensik POLRI memastikan bahwa korban tidak tewas oleh peluru karet atau gas air mata, melainkan **proyektil tajam kaliber 5,56 mm**. Proyektil ini identik dengan senapan serbu standar SS-1 dan Steyr AUG yang saat itu dipegang oleh aparat keamanan di atas jembatan layang Grogol.

> "Kami tidak sedang memprovokasi, kami sedang berjalan kembali ke kampus secara tertib ketika rentetan tembakan dilepaskan dari flyover. Mereka menembaki mahasiswa yang berlindung di balik gedung!"
> — *Kutipan kesaksian saksi mata mahasiswa Fakultas Hukum Trisakti dalam berkas investigasi 1998.*

### Kendala Yuridis dan Status Pengadilan HAM
Hingga kini, berkas penyelidikan Komnas HAM tentang Peristiwa Trisakti, Semanggi I, dan Semanggi II (TSS) masih tertahan dalam tarik-ulur administratif dengan Kejaksaan Agung. Meskipun Mahkamah Militer pada tahun 1999 dan 2002 telah menjatuhkan vonis terhadap sejumlah prajurit lapangan, komando rantai komando tingkat perwira tinggi pengambil keputusan tak pernah tersentuh pengadilan pidana umum.

Pencarian kebenaran hakiki bukan sekadar meratapi masa lalu, melainkan memastikan bahwa negara tidak lagi menggunakan senjata api terhadap warganya sendiri yang menyuarakan kebenaran.`,
    category: 'Tragedi & HAM',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ],
    date: '2026-09-19',
    dayName: 'Jumat',
    formattedDate: '19 September 2026',
    time: '09:30 WIB',
    author: primaryAuthor,
    readTime: '6 menit baca',
    likes: 384,
    views: 3120,
    commentsCount: 42,
    tags: ['TragediTrisakti', 'Reformasi1998', 'HakAsasiManusia', 'HukumPidana', 'SejarahKelam'],
    isFeatured: true,
    attachments: [
      {
        name: 'Dokumen-Laporan-Akhir-TGPF-Peristiwa-Mei-1998.pdf',
        size: '4.8 MB',
        type: 'pdf',
        url: '#',
      },
    ],
  },
  {
    id: 'post-2',
    slug: 'runtuhnya-orde-baru-21-mei-1998-reformasi',
    title: 'Runtuhnya Tirani Orde Baru 21 Mei 1998: Detik-Detik Bersejarah Pengunduran Diri Soeharto dan Fajar Reformasi Indonesia',
    excerpt: 'Kilas balik 32 tahun hegemoni otoriter, gelombang pendudukan gedung parlemen oleh puluhan ribu mahasiswa, dan analisis ketatanegaraan transisi kekuasaan ke B.J. Habibie.',
    content: `Kamis pagi, 21 Mei 1998 pukul 09.05 WIB di Credential Room Istana Merdeka, sebuah babak kelam 32 tahun kediktatoran Orde Baru resmi berakhir. Presiden Soeharto membacakan naskah pernyataan berhenti dari jabatannya di hadapan pimpinan Mahkamah Agung.
    
### Gelombang Tekanan Politik dan Penolakan 14 Menteri
Kejatuhan rezim Soeharto bukan sekadar akibat krisis moneter Asia 1997 yang menghancurkan nilai tukar Rupiah dari Rp2.500 ke Rp16.000 per Dolar AS, melainkan akumulasi krisis legitimasi moral dan hukum. 

Pukulan telak terakhir terjadi pada malam 20 Mei 1998, ketika 14 menteri bidang ekonomi dan industri di bawah koordinasi Ginandjar Kartasasmita menandatangani surat bersama di Bappenas yang menolak duduk dalam 'Komite Reformasi' bentukan Soeharto. Penolakan kabinet internal ini, berpadu dengan desakan Ketua DPR/MPR Harmoko agar Presiden mundur, membuat benteng kekuasaan Orba roboh total.

### Polemik Konstitusional Pasal 8 UUD 1945
Pengalihan wewenang langsung kepada Wakil Presiden B.J. Habibie memicu perdebatan sengit pakar hukum tata negara pada saat itu. Apakah pengucapan sumpah jabatan di hadapan Ketua MA di Istana sah secara konstitusi jika tanpa Sidang Umum MPR?

> "Berdasarkan Pasal 8 UUD 1945, jika Presiden mangkat, berhenti, atau tidak dapat melakukan kewajibannya, ia digantikan oleh Wakil Presiden sampai habis waktunya. Namun tradisi hukum ketatanegaraan kita mengalami lompatan darurat yang menentukan keselamatan republik."
> — *Analisis Redaksi Hukum Facrial.*

Kini, tugas generasi penerus adalah merawat pilar demokrasi yang ditebus mahal dengan darah dan air mata: kebebasan pers, pembatasan masa jabatan presiden maksimal dua periode, pemberantasan KKN, dan independensi peradilan.`,
    category: 'Reformasi 1998',
    coverImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    ],
    date: '2026-09-17',
    dayName: 'Rabu',
    formattedDate: '17 September 2026',
    time: '14:15 WIB',
    author: primaryAuthor,
    readTime: '7 menit baca',
    likes: 295,
    views: 2450,
    commentsCount: 31,
    tags: ['OrdeBaru', 'Reformasi', 'Konstitusi', 'HukumTataNegara', 'SejarahPolitik'],
    isFeatured: true,
    attachments: [
      {
        name: 'Risalah-Sidang-Istimewa-MPR-Ketetapan-Reformasi.pdf',
        size: '3.2 MB',
        type: 'pdf',
        url: '#',
      },
    ],
  },
  {
    id: 'post-3',
    slug: 'dekonstruksi-sejarah-g30s-1965-yuridis-ham',
    title: 'Dekonstruksi Sejarah Peristiwa G30S 1965: Kajian Yuridis TAP MPRS XXV/1966 dan Hak Keadilan Korban Kemanusiaan',
    excerpt: 'Mengurai benang kusut historiografi politik 1965 melalui arsip deklasifikasi internasional, penahanan massal tanpa peradilan, dan arah pemulihan hak martabat bangsa.',
    content: `Peristiwa Gerakan 30 September 1965 (G30S) merupakan salah satu episentrum trauma terbesar dalam sejarah Republik Indonesia. Selama lebih dari tiga dekade, narasi tunggal versi Buku Putih Orde Baru mendominasi ruang pendidikan dan media, membenarkan perburuan massal dan dehumanisasi sistematis terhadap ratusan ribu warga sipil.

### Fakta Otentik Visum et Repertum Jenazah Pahlawan Revolusi
Salah satu titik balik pengungkapan kebenaran sejarah adalah terbukanya dokumen otentik hasil *Visum et Repertum* tim dokter forensik RSPAD yang memeriksa jenazah tujuh perwira militer di Lubang Buaya pada 4 Oktober 1965. Tim dokter yang dipimpin oleh dr. Frans Pattiasina dan dr. Sutomo Tjokronegoro menyatakan bahwa:
- Luka-luka mematikan disebabkan oleh tembakan senjata api jarak dekat dan tusukan sangkur.
- **Tidak ditemukan** adanya bukti pencungkilan mata atau pemotongan alat kelamin sebagaimana narasi propaganda media pada Oktober 1965 yang mengobarkan amarah publik.

### Dampak Yuridis TAP MPRS XXV/1966 dan Penahanan Pulau Buru
Ratusan ribu tahanan politik (Tapol) kategori B diasingkan ke Pulau Buru dan penjara-penjara lain selama belasan tahun tanpa pernah melewati proses dakwaan, pembelaan, maupun putusan pengadilan yang sah (*due process of law*). Kebijakan 'Surat Bersih Diri' dan pencantuman kode khusus pada KTP korban dan keluarganya melanggar hak asasi sipil yang mendasar.

> "Negara hukum tidak boleh melanggengkan stigma turun-temurun kepada anak-cucu korban sejarah. Pengakuan dan pemulihan martabat kemanusiaan adalah syarat mutlak rekonsiliasi nasional."
> — *Laporan Penyelidikan Pelanggaran HAM Berat Komnas HAM RI.*

Langkah non-yudisial melalui Inpres No. 2 Tahun 2023 harus diiringi dengan keberanian meluruskan kurikulum sejarah nasional secara jujur dan berimbang.`,
    category: 'Orde Baru',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ],
    date: '2026-09-14',
    dayName: 'Senin',
    formattedDate: '14 September 2026',
    time: '11:00 WIB',
    author: primaryAuthor,
    readTime: '8 menit baca',
    likes: 412,
    views: 3890,
    commentsCount: 56,
    tags: ['G30S1965', 'KajianYuridis', 'RekonsiliasiHAM', 'SejarahIndonesia', 'KeadilanTransisional'],
    isFeatured: true,
    attachments: [
      {
        name: 'Laporan-Penyelidikan-Komnas-HAM-Peristiwa-1965-1966.pdf',
        size: '5.6 MB',
        type: 'pdf',
        url: '#',
      },
    ],
  },
  {
    id: 'post-4',
    slug: 'tragedi-semanggi-dan-misteri-kasus-munir',
    title: 'Tragedi Semanggi I & II dan Misteri Pembunuhan Munir: Ujian Abadi Supremasi Hukum dan Keberanian Negara',
    excerpt: 'Menelusuri kronologi penembakan mahasiswa pada Sidang Istimewa 1998, tragedi Semanggi 1999, serta pembunuhan racun arsenik terhadap pejuang HAM Munir Said Thalib.',
    content: `Dua simbol perlawanan masyarakat sipil yang tak pernah padam menuntut keadilan adalah jeritan keluarga korban Tragedi Semanggi I (11–13 November 1998), Semanggi II (24 September 1999), dan pembunuhan aktivis HAM legendaris Munir Said Thalib di atas pesawat Garuda Indonesia GA-974 pada 7 September 2004.

### Kegigihan Aksi Kamisan dan Ibu Sumarsih
Setiap Kamis sore di depan Istana Merdeka, payung-payung hitam berdiri tegak dalam hening. Maria Catarina Sumarsih, ibunda dari almarhum Bernardinus Realino Norma Irawan (Wawan), mahasiswa Universitas Atma Jaya yang gugur saat menolong rekannya yang tertembak, tetap berdiri konsisten selama puluhan tahun.

Tuntutan mereka sederhana namun tegas: **buka kembali dokumen penyelidikan resmi dan bawa pelaku intelektual ke Pengadilan HAM Ad Hoc**.

### Konspirasi Pembunuhan Munir Said Thalib
Pakar toksikologi Belanda menemukan dosis fatal arsenik (senyawa As2O3) di dalam lambung dan darah almarhum Munir. Walaupun eksekutor lapangan telah menjalani hukuman, dokumen Tim Pencari Fakta (TPF) Kasus Munir yang rampung pada Juni 2005 hingga kini belum diumumkan secara terbuka oleh pemerintah sebagaimana mandat Kepres No. 111/2004.

Komnas HAM telah menetapkan kasus pembunuhan Munir sebagai dugaan **Pelanggaran HAM Berat**, yang berarti kasus ini tidak mengenal masa kedaluwarsa pidana (*statute of limitations*).

> "Selama impunitas masih dipelihara demi stabilitas kekuasaan, hukum di Indonesia hanyalah jaring laba-laba yang hanya mampu menjerat yang lemah namun robek ketika menyentuh yang berkuasa."
> — *Kutipan Pidato Alm. Munir Said Thalib.*`,
    category: 'Hukum & Politik',
    coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    ],
    date: '2026-09-10',
    dayName: 'Kamis',
    formattedDate: '10 September 2026',
    time: '16:30 WIB',
    author: primaryAuthor,
    readTime: '6 menit baca',
    likes: 320,
    views: 2780,
    commentsCount: 38,
    tags: ['TragediSemanggi', 'MunirSaidThalib', 'AksiKamisan', 'SupremasiHukum', 'AntiImpunitas'],
    attachments: [
      {
        name: 'Berkas-Hasil-Investigasi-Kematian-Munir-TPF.pdf',
        size: '3.9 MB',
        type: 'pdf',
        url: '#',
      },
    ],
  },
  {
    id: 'post-5',
    slug: 'agenda-simposium-nasional-hukum-dan-reformasi-2026',
    title: 'Agenda Simposium Nasional 2026: Mengawal Kebenaran Sejarah Menuju Tiga Dekade Reformasi Indonesia',
    excerpt: 'Undangan terbuka bagi akademisi hukum, jurnalis, korban pelanggaran HAM, dan mahasiswa dalam forum eksaminasi publik serta bedah berkas investigasi sejarah.',
    content: `Redaksi Facrial bersama koalisi masyarakat sipil dan pakar hukum tata negara mengundang seluruh elemen bangsa untuk hadir dalam Simposium Nasional: **"Kebenaran Sejarah dan Penuntasan Pelanggaran HAM: Jalan Terjal Supremasi Hukum Menuju 30 Tahun Reformasi"**.

Agenda ini dirancang untuk mendiskusikan temuan-temuan baru dokumen arsip deklasifikasi, penguatan pengadilan HAM ad hoc, serta rekomendasi kebijakan hukum nasional bagi pembentukan undang-undang komisi kebenaran dan rekonsiliasi.

### Rangkaian Kegiatan:
1. **Bedah Berkas Investigasi 1998**: Presentasi data balistik dan kronologi lapangan Tragedi Trisakti & Semanggi.
2. **Eksibisi Foto Jurnalisme & Arsip BAP**: Pameran memorabilia sejarah politik perlawanan mahasiswa.
3. **Penyusunan Kertas Kebijakan Publik (Policy Brief)**: Rekomendasi konkret kepada Komisi Kejaksaan dan Komisi III DPR RI.

### Waktu dan Pelaksanaan
- **Hari/Tanggal**: Sabtu, 10 Oktober 2026
- **Pukul**: 09:00 - 15:00 WIB
- **Tempat**: Auditorium LBH Jakarta & Siaran Langsung Hybrid via Facrial Live
- **Narasumber**: Komisioner Komnas HAM, Saksi Sejarah 98, dan Akademisi Hukum Konstitusi`,
    category: 'Agenda',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ],
    date: '2026-09-05',
    dayName: 'Sabtu',
    formattedDate: '05 September 2026',
    time: '10:00 WIB',
    author: primaryAuthor,
    readTime: '4 menit baca',
    likes: 198,
    views: 1840,
    commentsCount: 22,
    isAgenda: true,
    agenda: {
      eventDate: '2026-10-10',
      eventTime: '09:00 - 15:00 WIB',
      location: 'Auditorium LBH Jakarta / Zoom Webinar Hybrid',
      status: 'Mendatang',
      registrationUrl: 'https://forms.gle/facrial-hukum-politik-2026',
    },
    tags: ['SimposiumHukum', 'AgendaPublik', 'DiskusiKritis', 'ReformasiTotal', 'EksaminasiPublik'],
    isFeatured: true,
    attachments: [
      {
        name: 'Term-of-Reference-Simposium-Reformasi-2026.pdf',
        size: '1.9 MB',
        type: 'pdf',
        url: '#',
      },
    ],
  },
];

