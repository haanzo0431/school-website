'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!params?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Article not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params?.id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const readingTime = post?.content
    ? Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200))
    : 1;

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{error || 'Article not found'}</h1>
        <Link
          href="/i-news"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary py-10 px-4 sm:px-6">
      <main className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/i-news"
            className="inline-flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Articles
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md theme-bg-card theme-border border hover:border-emerald-500 transition-colors"
          >
            <Share2 size={14} />
            {copied ? 'Copied Link!' : 'Share'}
          </button>
        </div>

        {/* Article Header */}
        <header className="mb-8 border-b theme-border pb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {post.category || 'General'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm opacity-75">
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-emerald-500" />
              <span>{post.author_name || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-emerald-500" />
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-emerald-500" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Markdown Rendered Article Body */}
        <article className="prose dark:prose-invert max-w-none theme-text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b theme-border pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-emerald-500">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed opacity-90">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1 pl-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1 pl-2">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-4 opacity-80 theme-bg-card py-2 rounded-r">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-emerald-500">{children}</strong>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}