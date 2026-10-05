'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
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

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="border-b theme-border pb-6">
        <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-emerald-500" /> School News & Press
        </h1>
        <p className="text-xs theme-text-secondary mt-1">
          Stay updated with official announcements, achievements, and student stories.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono theme-text-secondary">
          Loading news articles...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center theme-bg-card border theme-border rounded-2xl space-y-2">
          <p className="text-xs theme-text-secondary">No articles published yet.</p>
          <Link href="/editor" className="text-xs text-emerald-500 font-semibold hover:underline">
            Write the first post →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="p-6 theme-bg-card border theme-border rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-3 text-[11px] font-mono theme-text-secondary">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                  {post.category || 'General'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold hover:text-emerald-500 transition-colors">
                <Link href={`/i-news/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3">
                {post.content}
              </p>
              <div className="pt-2">
                <Link
                  href={`/i-news/${post.id}`}
                  className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  Read full article <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}