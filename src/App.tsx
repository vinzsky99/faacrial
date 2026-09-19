import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroProfile } from './components/HeroProfile';
import { TimelineFeed } from './components/TimelineFeed';
import { BlogDetail } from './components/BlogDetail';
import { AgendaView } from './components/AgendaView';
import { VisiMisiView } from './components/VisiMisiView';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';

import { Post, Agenda, ActiveTab, ThemeMode, VerifiedAuthor } from './types';
import { defaultAuthor } from './data/defaultData';
import {
  getInitialPosts,
  savePostsToStorage,
  getInitialAgendas,
  saveAgendasToStorage,
  getInitialVerifiedAuthors,
  saveVerifiedAuthorsToStorage
} from './lib/supabase';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('facrial_theme');
    return (saved as ThemeMode) || 'dark';
  });

  // Transparency percentage: default 75%
  const [transparency, setTransparency] = useState<number>(() => {
    const saved = localStorage.getItem('facrial_transparency');
    return saved ? Number(saved) : 75;
  });

  // Navigation tab (defaults to 'home', or 'admin' if hash is #admin)
  const [currentTab, setCurrentTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'home';
  });

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Data states
  const [posts, setPosts] = useState<Post[]>(() => getInitialPosts());
  const [agendas, setAgendas] = useState<Agenda[]>(() => getInitialAgendas());
  const [verifiedAuthors, setVerifiedAuthors] = useState<VerifiedAuthor[]>(() => getInitialVerifiedAuthors());

  // Listen to hash changes (e.g. #admin, #home)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentTab('admin');
      } else if (window.location.hash === '#agenda') {
        setCurrentTab('agenda');
      } else if (window.location.hash === '#visimisi') {
        setCurrentTab('visi-misi');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync tab change with URL hash cleanly
  const handleTabChange = (tab: ActiveTab) => {
    setCurrentTab(tab);
    if (tab === 'admin') {
      window.location.hash = 'admin';
    } else {
      if (window.location.hash === '#admin') {
        history.pushState(null, '', ' ');
      }
    }
  };

  // Apply dark mode class to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('facrial_theme', theme);
  }, [theme]);

  // Persist transparency
  useEffect(() => {
    localStorage.setItem('facrial_transparency', transparency.toString());
  }, [transparency]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Like post handler
  const handleLikePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    });
    setPosts(updated);
    savePostsToStorage(updated);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
    }
  };

  // Select post to read in detail without reloading page
  const handleSelectPost = (post: Post) => {
    // Increment view count
    const updated = posts.map((p) => {
      if (p.id === post.id) {
        return { ...p, views: p.views + 1 };
      }
      return p;
    });
    setPosts(updated);
    savePostsToStorage(updated);

    setSelectedPost({ ...post, views: post.views + 1 });
    setCurrentTab('blog-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new post from admin/author
  const handleAddPost = (newPost: Post) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    savePostsToStorage(updated);
  };

  // Delete post
  const handleDeletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    savePostsToStorage(updated);
  };

  // Add new agenda from admin/author
  const handleAddAgenda = (newAgenda: Agenda) => {
    const updated = [newAgenda, ...agendas];
    setAgendas(updated);
    saveAgendasToStorage(updated);
  };

  // Delete agenda
  const handleDeleteAgenda = (id: string) => {
    const updated = agendas.filter((a) => a.id !== id);
    setAgendas(updated);
    saveAgendasToStorage(updated);
  };

  // Add new verified author from admin
  const handleAddVerifiedAuthor = (newAuthor: VerifiedAuthor) => {
    const updated = [newAuthor, ...verifiedAuthors];
    setVerifiedAuthors(updated);
    saveVerifiedAuthorsToStorage(updated);
  };

  // Delete verified author
  const handleDeleteVerifiedAuthor = (id: string) => {
    const updated = verifiedAuthors.filter((a) => a.id !== id);
    setVerifiedAuthors(updated);
    saveVerifiedAuthorsToStorage(updated);
  };

  const isDark = theme === 'dark';

  // =========================================================================
  // SEPARATE STANDALONE ADMIN PAGE
  // If currentTab is 'admin', render ONLY the dedicated AdminPortal!
  // No public navbar, no public footer, no public timeline.
  // =========================================================================
  if (currentTab === 'admin') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white'
          : 'bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white'
      }`}>
        <AdminPortal
          author={defaultAuthor}
          posts={posts}
          agendas={agendas}
          verifiedAuthors={verifiedAuthors}
          onAddPost={handleAddPost}
          onAddAgenda={handleAddAgenda}
          onAddVerifiedAuthor={handleAddVerifiedAuthor}
          onDeletePost={handleDeletePost}
          onDeleteAgenda={handleDeleteAgenda}
          onDeleteVerifiedAuthor={handleDeleteVerifiedAuthor}
          onBackToPublic={() => handleTabChange('home')}
          transparency={transparency}
          isDark={isDark}
        />
      </div>
    );
  }

  // =========================================================================
  // PUBLIC WEBSITE LAYOUT
  // Clean public experience with floating navbar, dark/light toggle, and timeline
  // =========================================================================
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white'
        : 'bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white'
    }`}>
      {/* Floating Glassmorphism Navbar Melayang */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        theme={theme}
        toggleTheme={toggleTheme}
        transparency={transparency}
        setTransparency={setTransparency}
        posts={posts}
        onSelectPost={handleSelectPost}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* VIEW 1: HOME (Landing Page, Facebook Hero Profile & Timeline Feed) */}
        {currentTab === 'home' && (
          <>
            <HeroProfile
              author={defaultAuthor}
              featuredPosts={posts}
              onSelectPost={handleSelectPost}
              setCurrentTab={handleTabChange}
              transparency={transparency}
              isDark={isDark}
            />

            <TimelineFeed
              posts={posts}
              onSelectPost={handleSelectPost}
              onLikePost={handleLikePost}
              transparency={transparency}
              isDark={isDark}
              setCurrentTab={handleTabChange}
            />
          </>
        )}

        {/* VIEW 2: BLOG DETAIL (Specific Post in Timeline Detail View without Reload) */}
        {currentTab === 'blog-detail' && selectedPost && (
          <BlogDetail
            post={selectedPost}
            allPosts={posts}
            onBack={() => handleTabChange('home')}
            onSelectPost={handleSelectPost}
            onLikePost={handleLikePost}
            transparency={transparency}
            isDark={isDark}
          />
        )}

        {/* VIEW 3: AGENDA KEGIATAN */}
        {currentTab === 'agenda' && (
          <AgendaView
            agendas={agendas}
            setCurrentTab={handleTabChange}
            transparency={transparency}
            isDark={isDark}
          />
        )}

        {/* VIEW 4: VISI & MISI */}
        {currentTab === 'visi-misi' && (
          <VisiMisiView
            setCurrentTab={handleTabChange}
            verifiedAuthors={verifiedAuthors}
            transparency={transparency}
            isDark={isDark}
          />
        )}

        {/* Footer with exact required prompt styling */}
        <Footer
          author={defaultAuthor}
          setCurrentTab={handleTabChange}
          transparency={transparency}
          isDark={isDark}
        />
      </main>
    </div>
  );
}
