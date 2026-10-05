'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PublicNewsPage() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNewsArticles(data);
      }
      setLoading(false);
    }
    fetchPublicPosts();
  }, []);

  const getPostThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (!post.content) return null;
    const match = post.content.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black min-h-screen">
      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
            <Newspaper className="w-3.5 h-3.5" /> Official Announcements
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">School News & Press</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-1">
            Stay updated with official announcements, achievements, and student stories.
          </p>
        </div>
      </section>

      <div className="max-w-7xl w-full mx-auto px-6 py-12">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono theme-text-secondary theme-bg-card border theme-border rounded-2xl max-w-2xl mx-auto">
            Loading public news...
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="theme-bg-card border theme-border rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <Newspaper className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold mb-2">No Articles Published Yet</h3>
            <p className="text-xs theme-text-secondary">
              Check back soon for upcoming news, event recaps, and press releases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article) => {
              const thumbnail = getPostThumbnail(article);
              const cleanSnippet = (article.content || '')
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/#+\s/g, '')
                .trim();

              return (
                <article
                  key={article.id}
                  className="theme-bg-card border theme-border rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition-all duration-300 group shadow-sm"
                >
                  {/* Top Photo or Placeholder Banner */}
                  <div className="w-full h-48 border-b theme-border overflow-hidden relative bg-zinc-900/60">
                    {thumbnail ? (
                      <Link href={`/news/${article.id}`} className="block w-full h-full">
                        <img
                          src={thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/news/${article.id}`}
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800/80 via-zinc-900 to-black group-hover:from-zinc-800 transition-colors"
                      >
                        <Newspaper className="w-10 h-10 text-zinc-700/60 group-hover:text-emerald-500/40 transition-colors" />
                      </Link>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs theme-text-secondary font-mono mb-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase text-[10px]">
                          {article.category || 'GENERAL'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <h2 className="text-lg font-serif font-bold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        <Link href={`/news/${article.id}`}>{article.title}</Link>
                      </h2>

                      <p className="text-xs theme-text-secondary line-clamp-3 mb-4 leading-relaxed">
                        {cleanSnippet || 'No preview snippet available.'}
                      </p>
                    </div>

                    <Link
                      href={`/news/${article.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 mt-2 group-hover:translate-x-1 transition-transform"
                    >
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}