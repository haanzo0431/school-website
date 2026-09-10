'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPostsAndAuthors = async () => {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && postsData) {
        const authorIds = [...new Set(postsData.map((p) => p.author_id).filter(Boolean))];
        
        if (authorIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, avatar_url, name, surname')
            .in('id', authorIds);

          const profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          const combined = postsData.map((post) => ({
            ...post,
            authorProfile: profilesMap[post.author_id] || null,
          }));

          setPosts(combined);
        } else {
          setPosts(postsData);
        }
      }
      setLoading(false);
    };

    fetchPostsAndAuthors();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b theme-border">
          <div>
            <h1 className="text-3xl font-serif font-bold theme-text-primary">News & Press</h1>
            <p className="theme-text-secondary text-sm mt-1">The latest stories, announcements, and student journalism.</p>
          </div>
          <Link
            href="/editor"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl transition text-sm flex items-center gap-2"
          >
            Write Story
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="theme-text-secondary font-mono text-sm">Loading latest stories...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 theme-bg-card border theme-border rounded-2xl">
            <Newspaper className="w-12 h-12 mx-auto theme-text-secondary mb-3 opacity-50" />
            <h3 className="text-lg font-bold theme-text-primary mb-1">No stories published yet</h3>
            <p className="theme-text-secondary text-sm mb-4">Be the first student or teacher to write an article!</p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 text-emerald-500 text-sm font-semibold hover:underline"
            >
              Create a Draft <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const authorName = post.authorProfile?.name
                ? `${post.authorProfile.name} ${post.authorProfile.surname || ''}`.trim()
                : post.author_name || 'Anonymous';

              return (
                <div
                  key={post.id}
                  onClick={() => router.push(`/news/${post.id}`)}
                  className="group theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-mono mb-3">
                      <span className="text-emerald-500 font-semibold uppercase">{post.category}</span>
                      <span className="theme-text-secondary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold font-serif theme-text-primary mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                      {post.title}
                    </h2>
                    <p className="theme-text-secondary text-sm line-clamp-3 mb-6 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t theme-border text-xs theme-text-secondary">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.author_id) {
                          router.push(`/profile/${post.author_id}`);
                        }
                      }}
                      className="flex items-center gap-2 font-medium hover:text-emerald-500 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full theme-bg-input border theme-border flex items-center justify-center overflow-hidden flex-shrink-0 text-[10px] font-bold theme-text-primary">
                        {post.authorProfile?.avatar_url ? (
                          <img
                            src={post.authorProfile.avatar_url}
                            alt={authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          authorName[0]?.toUpperCase() || 'A'
                        )}
                      </div>
                      <span className="underline-offset-2 hover:underline">{authorName}</span>
                    </button>

                    <span className="flex items-center gap-1 text-emerald-500 font-medium group-hover:translate-x-1 transition-transform">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}