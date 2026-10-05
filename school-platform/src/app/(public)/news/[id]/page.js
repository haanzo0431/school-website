'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, User, Newspaper } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PublicArticleDetail({ params }) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('is_public', true)
        .single();

      if (!error && data) {
        setArticle(data);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary p-12 text-center text-xs font-mono theme-text-secondary">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <Newspaper className="w-12 h-12 text-emerald-500/50 mx-auto" />
        <h2 className="text-xl font-bold">Article Not Found</h2>
        <p className="text-xs theme-text-secondary">
          This article might be private, deleted, or moving locations.
        </p>
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs text-emerald-500 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to News
        </Link>

        <div className="space-y-4 border-b theme-border pb-6">
          <div className="flex items-center gap-3 text-xs font-mono theme-text-secondary">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">
              {article.category || 'General'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              {new Date(article.created_at).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              {article.author_name || 'School Staff'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {article.image_url && (
        <div className="rounded-2xl overflow-hidden border theme-border bg-black/40 max-h-[500px] flex items-center justify-center">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-none text-sm md:text-base leading-relaxed space-y-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 border-b theme-border pb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2 text-emerald-500">{children}</h2>,
            p: ({ children }) => <p className="mb-4 opacity-90 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 my-4">{children}</ol>,
            li: ({ children }) => <li className="pl-1 opacity-90">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 italic theme-bg-card rounded-r-xl opacity-90">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => <strong className="font-bold text-emerald-400">{children}</strong>,
            img: ({ src, alt }) => (
              <span className="block my-6 rounded-xl overflow-hidden border theme-border bg-black/30 p-2 text-center flex justify-center">
                <img src={src} alt={alt || 'Article Image'} className="max-h-[450px] w-auto object-contain rounded-lg" />
              </span>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}