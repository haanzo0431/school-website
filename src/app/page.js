'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Sparkles, Newspaper, ChevronRight } from 'lucide-react';

export default function Home() {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      setLoading(true);
      
      const { data: newsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setLatestNews(newsData || []);
      setLoading(false);
    }

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="relative py-24 border-b theme-border overflow-hidden bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-4 uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to Xonqa Tuman
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight max-w-3xl mb-6">
            Shaping Future Leaders of Xorazm
          </h1>
          <p className="text-sm md:text-base theme-text-secondary max-w-xl leading-relaxed">
            Discover our modern educational programs, active student clubs, and vibrant school community platform.
          </p>
        </div>
      </section>

      <section className="py-16 border-t theme-border theme-bg-card/50 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-2 uppercase font-semibold">
                <Newspaper className="w-3.5 h-3.5" /> Updates
              </div>
              <h2 className="text-2xl font-serif font-bold theme-text-primary">Latest News & Press</h2>
            </div>
            <Link
              href="/news"
              className="text-xs font-semibold text-emerald-500 flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 font-mono text-xs theme-text-secondary">Loading stories...</div>
          ) : latestNews.length === 0 ? (
            <div className="text-center py-12 border theme-border rounded-2xl theme-bg-card">
              <p className="text-xs theme-text-secondary">No news articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((post) => (
                <article key={post.id} className="theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono theme-text-secondary block mb-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <h3 className="text-base font-serif font-bold theme-text-primary mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs theme-text-secondary line-clamp-3">{post.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}