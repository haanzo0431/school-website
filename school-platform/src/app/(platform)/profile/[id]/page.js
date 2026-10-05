'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  ArrowRight,
  UserCheck,
  ArrowUpDown,
  Newspaper,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function AuthorProfilePage() {
  const params = useParams();
  const [posts, setPosts] = useState([]);
  const [authorName, setAuthorName] = useState('Teacher');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title_asc' | 'title_desc'

  useEffect(() => {
    async function fetchAuthorPosts() {
      if (!params?.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', params.id);

      if (!error && data) {
        setPosts(data);
        if (data.length > 0 && data[0].author_name) {
          setAuthorName(data[0].author_name);
        }
      }
      setLoading(false);
    }

    fetchAuthorPosts();
  }, [params?.id]);

  const getPostThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (!post.content) return null;
    const match = post.content.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  // Sort articles according to user choice
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'title_asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'title_desc') {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div>
        <Link
          href="/i-news"
          className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to News
        </Link>
      </div>

      {/* Author Header Card */}
      <div className="p-6 md:p-8 theme-bg-card border theme-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-serif text-2xl font-bold flex items-center justify-center shrink-0">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold">{authorName}</h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="w-3 h-3" /> Teacher Profile
              </span>
            </div>
            <p className="text-xs theme-text-secondary">
              Official Educator & Author at Xonqa Tuman Maktab Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l theme-border pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
          <div className="text-center md:text-left">
            <span className="text-2xl font-bold font-mono text-emerald-400 block">
              {posts.length}
            </span>
            <span className="text-[11px] theme-text-secondary font-medium">
              Articles Published
            </span>
          </div>
        </div>
      </div>

      {/* Articles Section Header + Priority Sorting Dropdown */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-4">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Published Articles ({posts.length})
          </h2>

          {/* Priority / Sort Control Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-mono theme-text-secondary shrink-0">Sort Priority:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#111111] theme-text-primary border theme-border focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer shadow-sm"
            >
              <option value="newest" className="bg-[#18181b] text-white">Newest First</option>
              <option value="oldest" className="bg-[#18181b] text-white">Oldest First</option>
              <option value="title_asc" className="bg-[#18181b] text-white">Title (A – Z)</option>
              <option value="title_desc" className="bg-[#18181b] text-white">Title (Z – A)</option>
            </select>
          </div>
        </div>

        {/* Articles Feed */}
        {sortedPosts.length === 0 ? (
          <div className="p-12 text-center theme-bg-card border theme-border rounded-2xl space-y-2">
            <Newspaper className="w-8 h-8 text-emerald-500/50 mx-auto" />
            <p className="text-sm font-semibold">No articles published yet.</p>
            <p className="text-xs theme-text-secondary">
              This author hasn't written any articles yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedPosts.map((post) => {
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
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold group-hover:text-emerald-400 transition-colors">
                      <Link href={`/i-news/${post.id}`}>{post.title}</Link>
                    </h3>

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
      </div>
    </div>
  );
}