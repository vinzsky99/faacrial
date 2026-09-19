// Facrial - Next.js Detail Artikel Blog dalam bentuk Timeline
import { notFound } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AuthorCard from './author';

export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase.from('posts').select('slug');
    return (posts || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = params;

  // Query aman terlindung dari SQL Injection dengan prepared query
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <a href="/" className="text-xs font-semibold text-blue-500 hover:underline">
          ← Kembali ke Timeline
        </a>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-semibold">
            {post.category}
          </span>
          <span className="text-xs opacity-60">{post.published_at_display}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
          {post.title}
        </h1>
      </header>

      {/* Cover Image */}
      {post.cover_images && post.cover_images[0] && (
        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl max-h-[450px]">
          <img
            src={post.cover_images[0]}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Konten Lengkap */}
      <div className="text-base sm:text-lg leading-relaxed whitespace-pre-line border-b border-slate-200 dark:border-slate-800 pb-10">
        {post.content}
      </div>

      {/* Komponen Author Terintegrasi (author.js) */}
      <AuthorCard />
    </article>
  );
}
