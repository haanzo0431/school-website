'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';
import Footer from '../../components/Footer';
import { ArrowLeft, User, Calendar, BookOpen, ArrowRight } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAuthorData = async () => {
      // 1. Fetch Author Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileData) {
        setAuthor(profileData);
      }

      // 2. Fetch All Articles Written By This Author
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }

      setLoading(false);
    };

    fetchAuthorData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen theme-bg-page">
        <p className="theme-text-secondary font-mono text-sm">Loading author profile...</p>
      </div>
    );
  }

  const fullName = author?.name
    ? `${author.name} ${author.surname || ''}`.trim()
    : 'School Reporter';

  const avatarInitial = fullName[0]?.toUpperCase() || 'A';

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
      <main className="flex-1 max-w-4xl w-full mx-auto p-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 theme-text-secondary hover:theme-text-primary transition-colors text-sm mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        {/* Author Header Card */}
        <div className="theme-bg-card border theme-border p-8 rounded-3xl shadow-sm mb-12 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-full theme-bg-input border theme-border flex items-center justify-center font-bold text-3xl theme-text-primary overflow-hidden flex-shrink-0 shadow-md">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold theme-text-primary mb-1">{fullName}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs theme-text-secondary mt-2">
              {author?.grade && (
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-semibold">
                  Class {author.grade}
                </span>
              )}
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                {posts.length} {posts.length === 1 ? 'Article Published' : 'Articles Published'}
              </span>
            </div>
          </div>
        </div>

        {/* Author's Published Articles */}
        <div>
          <h2 className="text-xl font-serif font-bold theme-text-primary mb-6 pb-3 border-b theme-border">
            Articles by {fullName}
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 theme-bg-card border theme-border rounded-2xl">
              <p className="theme-text-secondary text-sm">This author has not published any stories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.id}`}
                  className="group theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-mono mb-3">
                      <span className="text-emerald-500 font-semibold uppercase">{post.category}</span>
                      <span className="theme-text-secondary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-serif theme-text-primary mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="theme-text-secondary text-sm line-clamp-3 mb-6 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t theme-border text-xs text-emerald-500 font-medium">
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}