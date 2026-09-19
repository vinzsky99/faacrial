// Facrial - Komponen Author (author.js)
export default function AuthorCard() {
  const author = {
    name: 'Fachrial',
    role: 'Tech Enthusiast, Software Engineer & Digital Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Membangun ekosistem teknologi modern, cloud security, dan eksplorasi antarmuka masa depan. Berbagi wawasan seputar Next.js, Supabase, dan rekayasa perangkat lunak enterprise.',
    email: 'fachrial.tech@gmail.com',
    instagram: 'https://instagram.com/fachrial.id',
    linkedin: 'https://linkedin.com/in/fachrial-dev',
    github: 'https://github.com/fachrial-official',
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-bold">{author.name}</h4>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-semibold">
            Penulis Terverifikasi
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{author.role}</p>
        <p className="text-sm opacity-80 leading-relaxed pt-1">{author.bio}</p>
        
        <div className="flex items-center gap-3 pt-3 text-xs font-semibold text-blue-500">
          <a href={author.instagram} target="_blank" rel="noreferrer" className="hover:underline">Instagram</a>
          <span>•</span>
          <a href={author.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
          <span>•</span>
          <a href={`mailto:${author.email}`} className="hover:underline">Email</a>
          <span>•</span>
          <a href={author.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </div>
    </div>
  );
}
