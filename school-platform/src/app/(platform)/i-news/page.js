'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Megaphone,
  BookOpen,
  Feather,
  FileText,
  Trophy,
  Users,
  Award,
  Sparkles,
  Layers,
  Globe,
  Lock,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const CATEGORIES = [
  { id: 'ALL', label: 'All Stories', icon: Layers },
  { id: 'ANNOUNCEMENT', label: 'Announcements', icon: Megaphone },
  { id: 'ACADEMICS', label: 'Academics', icon: BookOpen },
  { id: 'STORIES', label: 'Stories', icon: Feather },
  { id: 'POEMS', label: 'Poems & Creative', icon: Sparkles },
  { id: 'ARTICLES', label: 'Articles', icon: FileText },
  { id: 'SPORTS', label: 'Sports', icon: Trophy },
  { id: 'CLUBS', label: 'School Clubs', icon: Users },
  { id: 'ACHIEVEMENTS', label: 'Achievements', icon: Award },
];

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const getPostThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (!post.content) return null;
    const match = post.content.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  const filteredPosts =
    selectedCategory === 'ALL'
      ? posts
      : posts.filter(
          (post) =>
            post.category &&
            post.category.toUpperCase() === selectedCategory.toUpperCase()
        );

  const getCategoryCount = (catId) => {
    if (catId === 'ALL') return posts.length;
    return posts.filter(
      (p) => p.category && p.category.toUpperCase() === catId.toUpperCase()
    ).length;
  };

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="border-b theme-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-emerald-500" /> School News & Press
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            Stay updated with official announcements, achievements, and student stories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono theme-text-secondary theme-bg-card border theme-border rounded-2xl">
              Loading news articles...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center theme-bg-card border theme-border rounded-2xl space-y-3">
              <p className="text-sm font-semibold">No articles found in this category.</p>
              <p className="text-xs theme-text-secondary">
                No articles published under <span className="text-emerald-400 font-bold">{selectedCategory}</span> yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => {
                const thumbnail = getPostThumbnail(post);
                const cleanSnippet = (post.content || '')
                  .replace(/!\[.*?\]\(.*?\)/g, '')
                  .replace(/#+\s/g, '')
                  .trim();

                return (
                  <article
                    key={post.id}
                    className="p-6 theme-bg-card border theme-border rounded-2xl flex flex-col md:flex-row gap-6 items-start justify-between hover:border-emerald-500/40 transition-all duration-300 group"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 text-[11px] font-mono theme-text-secondary">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wide">
                          {post.category || 'General'}
                        </span>

                        {/* Visibility Badge */}
                        {post.is_public ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wide flex items-center gap-1 text-[10px]">
                            <Globe className="w-3 h-3" /> Website
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1 text-[10px]">
                            <Lock className="w-3 h-3" /> Internal
                          </span>
                        )}

                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-bold group-hover:text-emerald-400 transition-colors">
                        <Link href={`/i-news/${post.id}`}>{post.title}</Link>
                      </h2>
                      <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3">
                        {cleanSnippet}
                      </p>
                      <div className="pt-2">
                        <Link
                          href={`/i-news/${post.id}`}
                          className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200"
                        >
                          Read full article <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {thumbnail && (
                      <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden border theme-border bg-black/30 shrink-0 flex items-center justify-center p-1 group-hover:border-emerald-500/30 transition-colors">
                        <img
                          src={thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <aside className="lg:col-span-1 lg:sticky lg:top-8 space-y-4">
          <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                Topics & Sections
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                {posts.length} Total
              </span>
            </div>

            <nav className="space-y-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = getCategoryCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none border ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold border-emerald-500/30 shadow-sm'
                        : 'border-transparent theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10 hover:translate-x-1'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 scale-y-100'
                          : 'opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100'
                      }`}
                    />

                    <div className="flex items-center gap-2.5 pl-1.5 min-w-0 shrink">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isSelected ? 'text-emerald-400' : 'theme-text-secondary group-hover:text-emerald-400'
                        }`}
                      />
                      <span className="whitespace-nowrap truncate">{cat.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0 ml-2 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-black/20 theme-text-secondary group-hover:bg-emerald-500/20 group-hover:text-emerald-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}