import React, { useState, useEffect } from 'react';
import { ThemeConfig, Post } from './types';
import { initialPosts } from './data/initialData';
import { fetchAllPosts, getLocalPosts } from './lib/supabase';
import { Layout } from './app/layout';
import { HomePage } from './app/page';
import { BlogDetailPage } from './app/blog/[slug]/page';
import { AuthorPage } from './app/blog/[slug]/author';
import { AdminPage } from './app/admin/page';
import { VisiMisiView } from './components/VisiMisiView';
import { AgendaView } from './components/AgendaView';
import { QuickPostModal } from './components/QuickPostModal';

export default function App() {
  // Theme & Transparency State (Defaulting to modern Dark Mode with 85% glass transparency)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    return {
      mode: 'dark',
      transparency: 85,
      blurBackdrop: true,
    };
  });

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => getLocalPosts());
  const [activeView, setActiveView] = useState<
    'home' | 'blog-detail' | 'author' | 'admin' | 'agenda' | 'visimisi'
  >('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);

  // Quick Post Modal State
  const [isQuickPostModalOpen, setIsQuickPostModalOpen] = useState(false);
  const [quickPostDefaultType, setQuickPostDefaultType] = useState<'post' | 'agenda'>('post');

  // Load posts & attach broadcast channel / storage listener for realtime synchronization
  useEffect(() => {
    async function loadData() {
      const data = await fetchAllPosts();
      setPosts(data);
    }
    loadData();

    // Listen for realtime updates from other components or tabs
    const handleStorageChange = () => {
      setPosts(getLocalPosts());
    };

    window.addEventListener('storage', handleStorageChange);

    // Hash based routing support without page reload
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'home') {
        setActiveView('home');
        setSelectedPostSlug(null);
      } else if (hash === 'admin') {
        setActiveView('admin');
      } else if (hash === 'author') {
        setActiveView('author');
      } else if (hash === 'agenda') {
        setActiveView('agenda');
      } else if (hash === 'visimisi') {
        setActiveView('visimisi');
      } else {
        // Assume slug
        setSelectedPostSlug(hash);
        setActiveView('blog-detail');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update dark mode class on HTML body
  useEffect(() => {
    if (themeConfig.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeConfig.mode]);

  // Navigate to post detail without reload
  const handleSelectPost = (slug: string) => {
    window.location.hash = slug;
    setSelectedPostSlug(slug);
    setActiveView('blog-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Change view
  const handleNavigate = (
    view: 'home' | 'blog-detail' | 'author' | 'admin' | 'agenda' | 'visimisi'
  ) => {
    if (view === 'home') {
      window.location.hash = '';
      setSelectedPostSlug(null);
    } else {
      window.location.hash = view;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewPostModal = (defaultType: 'post' | 'agenda' = 'post') => {
    setQuickPostDefaultType(defaultType);
    setIsQuickPostModalOpen(true);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Find currently selected post if in blog-detail view
  const currentPost = selectedPostSlug
    ? posts.find((p) => p.slug === selectedPostSlug) || posts[0]
    : posts[0];

  return (
    <Layout
      themeConfig={themeConfig}
      setThemeConfig={setThemeConfig}
      posts={posts}
      activeView={activeView}
      setActiveView={handleNavigate}
      selectedPostSlug={selectedPostSlug}
      onSelectPost={handleSelectPost}
      onOpenNewPostModal={() => handleOpenNewPostModal('post')}
    >
      {/* Dynamic View Rendering (Zero Page Reload SPA) */}
      {activeView === 'home' && (
        <HomePage
          posts={posts}
          themeConfig={themeConfig}
          onSelectPost={handleSelectPost}
          onOpenNewPostModal={handleOpenNewPostModal}
          onSelectAuthor={() => handleNavigate('author')}
          onSelectAgenda={() => handleNavigate('agenda')}
        />
      )}

      {activeView === 'blog-detail' && currentPost && (
        <BlogDetailPage
          post={currentPost}
          allPosts={posts}
          themeConfig={themeConfig}
          onBack={() => handleNavigate('home')}
          onSelectPost={handleSelectPost}
          onSelectAuthor={() => handleNavigate('author')}
        />
      )}

      {activeView === 'author' && (
        <AuthorPage
          posts={posts}
          themeConfig={themeConfig}
          onBack={() => handleNavigate('home')}
          onSelectPost={handleSelectPost}
          onOpenNewPostModal={() => handleOpenNewPostModal('post')}
        />
      )}

      {activeView === 'agenda' && (
        <AgendaView
          posts={posts}
          themeConfig={themeConfig}
          onBack={() => handleNavigate('home')}
          onSelectPost={handleSelectPost}
          onOpenNewAgendaModal={() => handleOpenNewPostModal('agenda')}
        />
      )}

      {activeView === 'visimisi' && (
        <VisiMisiView
          themeConfig={themeConfig}
          onBack={() => handleNavigate('home')}
        />
      )}

      {activeView === 'admin' && (
        <AdminPage
          posts={posts}
          themeConfig={themeConfig}
          onBack={() => handleNavigate('home')}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Quick Post / Agenda Composer Modal */}
      <QuickPostModal
        isOpen={isQuickPostModalOpen}
        onClose={() => setIsQuickPostModalOpen(false)}
        defaultType={quickPostDefaultType}
        themeConfig={themeConfig}
        onPostCreated={handlePostCreated}
      />
    </Layout>
  );
}
