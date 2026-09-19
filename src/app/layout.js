// Facrial - Next.js Root Layout
import './globals.css';

export const metadata = {
  title: 'Facrial - Timeline Berita & Blog Modern',
  description: 'Portal berita, artikel timeline selang-seling ala Facebook dengan floating navbar, tema light & dark, pengaturan transparansi, dan sinkronisasi Supabase.',
  keywords: ['Facrial', 'Next.js', 'Supabase', 'Tailwind CSS', 'Timeline Blog'],
  authors: [{ name: 'Fachrial' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-blue-600 selection:text-white">
        {/* Floating Navbar Container */}
        <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 max-w-7xl mx-auto">
          {/* Glassmorphism Floating Navbar */}
          <nav className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5 font-bold text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
                F
              </div>
              <span>FACRIAL</span>
            </div>

            {/* Kolom Pencarian Tengah (XSS & SQL Injection Safe) */}
            <div className="flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="Cari berita, artikel, agenda..."
                className="w-full px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Menu Navigasi Kanan */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <a href="/" className="px-3 py-1.5 rounded-xl hover:bg-blue-500/10 transition">Beranda</a>
              <a href="/#visimisi" className="px-3 py-1.5 rounded-xl hover:bg-blue-500/10 transition">Visi & Misi</a>
              <a href="/#agenda" className="px-3 py-1.5 rounded-xl hover:bg-blue-500/10 transition">Agenda</a>
              <a href="/admin" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">Admin</a>
            </div>
          </nav>
        </header>

        {/* Konten Utama */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          {children}
        </main>

        {/* Footer Resmi */}
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs opacity-75">
          <p>footer Design © 2026 Fachrial. Dibuat dengan Design UI UX Tailwind CSS.</p>
        </footer>
      </body>
    </html>
  );
}
