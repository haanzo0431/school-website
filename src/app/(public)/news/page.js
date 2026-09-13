'use client';

import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

export default function PublicNewsPage() {
  // Sample data - replace with dynamic fetch from Supabase/API later
  const newsArticles = [];

  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black min-h-screen">
      {/* Hero Header */}
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

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 py-12">
        {newsArticles.length === 0 ? (
          <div className="theme-bg-card border theme-border rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <Newspaper className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold mb-2">No Articles Published Yet</h3>
            <p className="text-xs theme-text-secondary">
              Check back soon for upcoming news, event recaps, and press releases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article) => (
              <article key={article.id} className="theme-bg-card border theme-border rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition-colors">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs theme-text-secondary font-mono mb-3">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{article.date}</span>
                  </div>
                  <h2 className="text-lg font-serif font-bold mb-2 line-clamp-2">{article.title}</h2>
                  <p className="text-xs theme-text-secondary line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 mt-auto">
                    Read Story <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}