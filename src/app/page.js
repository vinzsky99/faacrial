// Facrial - Next.js Home Page (Daftar semua blog timeline Facebook selang-seling & cover slider)
import { supabase } from '@/lib/supabase';

// Mengambil data artikel secara realtime / server-rendered dengan aman
async function getPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fallback ke data awal jika koneksi Supabase belum diatur.');
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export const revalidate = 60; // Regenerasi data setiap 60 detik (ISR)

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="space-y-12">
      {/* Landing Page: Hero Profile ala Facebook & Slider Motion */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
        {/* Cover Photo */}
        <div className="h-64 sm:h-80 w-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80')]" />

        {/* Profile Info Overlapping */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
              alt="Fachrial Profile"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-2xl"
            />
            <div className="pb-2">
              <h1 className="text-3xl font-extrabold flex items-center gap-2">
                <span>Fachrial</span>
                <span className="text-blue-500 text-lg">✓</span>
              </h1>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Tech Enthusiast, Software Engineer & Digital Architect
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Tulis Postingan
          </a>
        </div>
      </section>

      {/* Timeline Facebook: Selang-seling Kiri dan Kanan */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">Timeline Artikel & Berita</h2>
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="opacity-70">Belum ada postingan dari database Supabase.</p>
              <a href="/admin" className="text-blue-500 underline text-sm font-semibold mt-2 inline-block">
                Tambah postingan pertama lewat Admin
              </a>
            </div>
          ) : (
            posts.map((post, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div
                  key={post.id}
                  className={`flex flex-col md:flex-row ${isLeft ? 'md:flex-row-reverse' : ''} gap-6 items-center`}
                >
                  <div className="w-full md:w-1/2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold mt-2">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-500 transition">
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-xs opacity-60 mt-1">{post.published_at_display}</p>
                    <p className="text-sm opacity-80 mt-3 line-clamp-3">{post.excerpt || post.content}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Baca Selengkapnya →
                      </a>
                      <span className="text-xs opacity-60">{post.views || 0} Dilihat</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
