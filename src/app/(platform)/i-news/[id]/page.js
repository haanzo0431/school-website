'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, User, Clock, Share2, Edit3, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!params?.id) return;

      try {
        setLoading(true);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch post
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

    fetchData();
  }, [params?.id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    setDeleting(false);

    if (error) {
      alert(`Failed to delete article: ${error.message}`);
    } else {
      router.push('/i-news');
    }
  };

  const readingTime = post?.content
    ? Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200))
    : 1;

  const isAuthor = currentUser && post && currentUser.id === post.author_id;

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors font-medium"
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/i-news"
            className="inline-flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Articles
          </Link>

          <div className="flex items-center gap-2">
            {/* Author Actions */}
            {isAuthor && (
              <>
                <Link
                  href={`/editor?id=${post.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Edit3 size={14} />
                  Edit
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </>
            )}

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md theme-bg-card theme-border border hover:border-emerald-500 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              {copied ? 'Copied Link!' : 'Share'}
            </button>
          </div>
        </div>

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
            {post.author_id ? (
              <Link
                href={`/profile/${post.author_id}`}
                className="flex items-center gap-1.5 hover:text-emerald-400 hover:underline transition-colors font-semibold"
              >
                <User size={16} className="text-emerald-500" />
                <span>{post.author_name || 'Anonymous Teacher'}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-emerald-500" />
                <span>{post.author_name || 'Anonymous'}</span>
              </div>
            )}
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

        {post.image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden border theme-border bg-black/30 p-2 flex justify-center">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto max-h-[600px] object-contain rounded-xl"
            />
          </div>
        )}

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
              img: ({ src, alt }) => (
                <span className="block my-6 rounded-2xl overflow-hidden border theme-border bg-black/30 p-2 text-center flex justify-center">
                  <img
                    src={src}
                    alt={alt || 'Article Image'}
                    className="w-full h-auto max-h-[600px] object-contain rounded-xl inline-block"
                  />
                </span>
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