'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Newspaper, Plus, Calendar, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);

    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
              <Newspaper className="w-3.5 h-3.5" /> School Chronicle
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">News & Press</h1>
            <p className="text-xs md:text-sm theme-text-secondary mt-1">The latest stories, announcements, and student journalism from Xonqa Tuman.</p>
          </div>

          {!loading && currentUser && (
            <Link href="/write" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all">
              <Plus className="w-4 h-4" /> Write Story
            </Link>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20 font-mono text-xs theme-text-secondary">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border theme-border rounded-2xl theme-bg-card">
            <Newspaper className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-50" />
            <p className="theme-text-primary font-serif font-bold text-base mb-1">No Stories Published Yet</p>
            <p className="text-xs theme-text-secondary">Check back soon for updates and press releases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-4 text-xs font-mono theme-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold theme-text-primary mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3 mb-6">{post.content}</p>
                </div>
                <Link href={`/news/${post.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}