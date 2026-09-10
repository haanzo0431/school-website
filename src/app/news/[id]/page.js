'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import Footer from '../../components/Footer';
import { ArrowLeft, Calendar, Edit3, Trash2, MessageSquare, Send } from 'lucide-react';

// Custom lightweight Markdown renderer
function RenderMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-4 pl-4 text-emerald-400 font-sans">
          {currentList.map((item, i) => (
            <li key={i} className="theme-text-primary text-base">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (text) => {
    // Process underline: <u>text</u>
    let parsed = text.replace(/<u>(.*?)<\/u>/g, '<u class="underline decoration-emerald-500 underline-offset-4">$1</u>');
    // Process bold: **text**
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold theme-text-primary">$1</strong>');
    // Process italic: _text_
    parsed = parsed.replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>');

    return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.substring(2));
      return;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl md:text-3xl font-serif font-bold theme-text-primary mt-8 mb-4 border-b theme-border pb-2">
          {parseInline(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl md:text-2xl font-serif font-bold theme-text-primary mt-6 mb-3">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={index} className="border-l-4 border-emerald-500 pl-4 py-2 my-4 italic theme-text-secondary bg-emerald-500/5 rounded-r-xl">
          {parseInline(trimmed.substring(2))}
        </blockquote>
      );
    } else if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="mb-4 leading-relaxed">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-2 font-serif text-base md:text-lg theme-text-primary">{elements}</div>;
}

export default function SingleArticlePage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPostAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: postData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && postData) {
        setPost(postData);

        if (postData.author_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url, name, surname')
            .eq('id', postData.author_id)
            .single();

          if (profileData) {
            setAuthorProfile(profileData);
          }
        }

        fetchComments();
      }
      setLoading(false);
    };

    fetchPostAndData();
  }, [id]);

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, surname, avatar_url')
        .in('id', userIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      setComments(
        commentsData.map((c) => ({
          ...c,
          profile: profileMap[c.user_id] || null,
        }))
      );
    } else {
      setComments([]);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) router.push('/news');
    else alert(error.message);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    const { error } = await supabase.from('comments').insert([
      { post_id: id, user_id: currentUser.id, content: newComment.trim() },
    ]);

    setSubmittingComment(false);
    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      alert(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) fetchComments();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen theme-bg-page">
        <p className="theme-text-secondary font-mono text-sm">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
        <main className="flex-1 max-w-3xl w-full mx-auto p-8 text-center py-20">
          <h1 className="text-2xl font-bold theme-text-primary mb-2">Article Not Found</h1>
          <Link href="/news" className="inline-flex items-center gap-2 text-emerald-500 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const authorDisplayName = authorProfile?.name
    ? `${authorProfile.name} ${authorProfile.surname || ''}`.trim()
    : post.author_name || 'Anonymous';

  const isAuthor = currentUser && currentUser.id === post.author_id;

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
      <main className="flex-1 max-w-3xl w-full mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/news" className="inline-flex items-center gap-2 theme-text-secondary hover:theme-text-primary text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link href={`/editor?edit=${post.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold theme-bg-card border theme-border px-3 py-1.5 rounded-xl hover:border-emerald-500 theme-text-primary">
                <Edit3 className="w-3.5 h-3.5 text-emerald-500" /> Edit
              </Link>
              <button onClick={handleDeletePost} className="inline-flex items-center gap-1.5 text-xs font-semibold theme-bg-card border theme-border px-3 py-1.5 rounded-xl hover:border-red-500 hover:text-red-500 theme-text-primary cursor-pointer">
                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
              </button>
            </div>
          )}
        </div>

        <article>
          <div className="flex items-center gap-3 text-xs font-mono mb-4">
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold uppercase">
              {post.category}
            </span>
            <span className="theme-text-secondary flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold theme-text-primary mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="pb-8 mb-8 border-b theme-border">
            <Link href={post.author_id ? `/profile/${post.author_id}` : '#'} className="inline-flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-full theme-bg-input border theme-border flex items-center justify-center font-bold text-base theme-text-primary overflow-hidden group-hover:border-emerald-500">
                {authorProfile?.avatar_url ? (
                  <img src={authorProfile.avatar_url} alt={authorDisplayName} className="w-full h-full object-cover" />
                ) : (
                  authorDisplayName[0]?.toUpperCase()
                )}
              </div>
              <div>
                <p className="font-bold theme-text-primary text-base group-hover:text-emerald-500 flex items-center gap-1.5">
                  {authorDisplayName}
                </p>
                <p className="text-xs theme-text-secondary">Author</p>
              </div>
            </Link>
          </div>

          {/* Render Markdown Content Properly */}
          <RenderMarkdown content={post.content} />
        </article>

        {/* Comments */}
        <section className="mt-16 pt-10 border-t theme-border">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-serif font-bold theme-text-primary">Comments ({comments.length})</h2>
          </div>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="mb-10">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full theme-bg-input border theme-border rounded-2xl p-4 text-sm theme-text-primary outline-none focus:border-emerald-500 transition"
              />
              <div className="flex justify-end mt-3">
                <button type="submit" disabled={submittingComment || !newComment.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="theme-bg-card border theme-border rounded-2xl p-6 text-center mb-10">
              <p className="text-xs theme-text-secondary mb-2">You must be signed in to comment.</p>
              <Link href="/login" className="text-xs text-emerald-500 font-bold hover:underline">
                Sign In to Join Discussion
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => {
              const cAuthorName = comment.profile?.name ? `${comment.profile.name} ${comment.profile.surname || ''}`.trim() : 'Student';
              const isCommentAuthor = currentUser && currentUser.id === comment.user_id;

              return (
                <div key={comment.id} className="theme-bg-card border theme-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full theme-bg-input border theme-border flex items-center justify-center font-bold text-xs theme-text-primary overflow-hidden">
                        {comment.profile?.avatar_url ? (
                          <img src={comment.profile.avatar_url} alt={cAuthorName} className="w-full h-full object-cover" />
                        ) : (
                          cAuthorName[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold theme-text-primary">{cAuthorName}</p>
                        <p className="text-[10px] theme-text-secondary">{new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isCommentAuthor && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="theme-text-secondary hover:text-red-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm theme-text-primary leading-relaxed">{comment.content}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}