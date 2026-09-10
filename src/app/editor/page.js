'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Send,
} from 'lucide-react';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [currentUser, setCurrentUser] = useState(null);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef(null);

  // Auto-expand textarea height as the writer types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 500)}px`;
    }
  }, [content]);

  useEffect(() => {
    const initEditor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      if (editId) {
        const { data: post } = await supabase.from('posts').select('*').eq('id', editId).single();
        if (post) {
          if (post.author_id !== user.id) {
            alert('You can only edit your own posts.');
            router.push('/news');
            return;
          }
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
        }
        setFetching(false);
      }
    };

    initEditor();
  }, [editId, router]);

  const applyFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let textBefore = content.substring(0, start);
    const textAfter = content.substring(end);
    const selectedText = content.substring(start, end);

    if (showSlashMenu) {
      const slashIndex = textBefore.lastIndexOf('/');
      if (slashIndex !== -1) {
        textBefore = textBefore.substring(0, slashIndex);
      }
    }

    const replacement = `${prefix}${selectedText || ''}${suffix}`;
    const newContent = `${textBefore}${replacement}${textAfter}`;

    setContent(newContent);
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = textBefore.length + prefix.length + (selectedText.length || 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBefore = content.substring(0, cursor);
    const textAfter = content.substring(cursor);

    if (e.key === 'Enter') {
      const lastNewLine = textBefore.lastIndexOf('\n');
      const currentLine = textBefore.substring(lastNewLine + 1);

      const bulletMatch = currentLine.match(/^(\*\s|-\s|>\s|(\d+)\.\s)/);

      if (bulletMatch) {
        const fullMatch = bulletMatch[0];
        const numMatch = bulletMatch[2];

        if (currentLine.trim() === fullMatch.trim()) {
          e.preventDefault();
          const cleanBefore = textBefore.substring(0, lastNewLine + 1);
          setContent(cleanBefore + textAfter);

          setTimeout(() => {
            const targetPos = Math.max(0, lastNewLine + 1);
            textarea.setSelectionRange(targetPos, targetPos);
          }, 0);
          return;
        }

        e.preventDefault();
        let nextPrefix = fullMatch;
        if (numMatch) {
          nextPrefix = `${parseInt(numMatch, 10) + 1}. `;
        }

        const insertion = `\n${nextPrefix}`;
        setContent(textBefore + insertion + textAfter);

        setTimeout(() => {
          const newPos = cursor + insertion.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
    }

    if (e.key === '/') {
      if (cursor === 0 || textBefore.endsWith('\n') || textBefore.endsWith(' ')) {
        setShowSlashMenu(true);
      }
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, surname')
      .eq('id', currentUser.id)
      .single();

    const authorName = profile?.name
      ? `${profile.name} ${profile.surname || ''}`.trim()
      : currentUser.email.split('@')[0];

    if (editId) {
      const { error } = await supabase
        .from('posts')
        .update({ title, content, category })
        .eq('id', editId);

      setLoading(false);
      if (!error) router.push(`/news/${editId}`);
      else alert(error.message);
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ title, content, category, author_id: currentUser.id, author_name: authorName }])
        .select()
        .single();

      setLoading(false);
      if (!error && data) router.push(`/news/${data.id}`);
      else alert(error?.message || 'Failed to create post.');
    }
  };

  if (fetching) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen theme-bg-page">
        <p className="theme-text-secondary font-mono text-sm">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page relative pb-28">
      {/* Expanded max-width to max-w-5xl for a wider writing canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b theme-border">
          <Link href="/news" className="inline-flex items-center gap-2 theme-text-secondary hover:theme-text-primary text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>

          <button onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50">
            <Send className="w-4 h-4" />
            {loading ? 'Saving...' : editId ? 'Update Post' : 'Publish Post'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-fit theme-bg-input border theme-border rounded-xl px-4 py-2 text-xs font-mono theme-text-primary outline-none focus:border-emerald-500">
            <option value="General">GENERAL</option>
            <option value="Announcements">ANNOUNCEMENTS</option>
            <option value="Academic">ACADEMIC</option>
            <option value="Sports">SPORTS</option>
            <option value="Culture">CULTURE</option>
          </select>

          <input
            type="text"
            placeholder="Article Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full theme-bg-page text-4xl md:text-6xl font-serif font-bold theme-text-primary placeholder:theme-text-secondary/40 outline-none border-b theme-border pb-4"
            required
          />

          <div className="relative">
            {/* Disabled inner scrollbar and enabled smooth auto-expansion */}
            <textarea
              ref={textareaRef}
              placeholder="Write your story... (Type '/' for blocks)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full theme-bg-page text-lg md:text-xl font-serif theme-text-primary placeholder:theme-text-secondary/40 outline-none resize-none leading-relaxed min-h-[60vh] overflow-hidden"
              required
            />

            {showSlashMenu && (
              <div className="absolute left-0 top-12 z-50 w-64 theme-bg-card border theme-border rounded-2xl shadow-2xl p-2 space-y-1">
                <p className="text-[10px] font-mono uppercase theme-text-secondary px-3 py-1 font-semibold">Insert Block</p>
                <button type="button" onClick={() => applyFormatting('\n# ')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-500 text-left">
                  <Heading1 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">Heading 1</p>
                    <p className="text-[10px] theme-text-secondary">Main heading</p>
                  </div>
                </button>
                <button type="button" onClick={() => applyFormatting('\n## ')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-500 text-left">
                  <Heading2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">Heading 2</p>
                    <p className="text-[10px] theme-text-secondary">Sub-heading</p>
                  </div>
                </button>
                <button type="button" onClick={() => applyFormatting('\n* ')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-500 text-left">
                  <List className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">Bullet List</p>
                    <p className="text-[10px] theme-text-secondary">Unordered point</p>
                  </div>
                </button>
                <button type="button" onClick={() => applyFormatting('\n1. ')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-500 text-left">
                  <ListOrdered className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">Numbered List</p>
                    <p className="text-[10px] theme-text-secondary">Sequential point</p>
                  </div>
                </button>
                <button type="button" onClick={() => applyFormatting('\n> ')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-500 text-left">
                  <Quote className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">Quote Block</p>
                    <p className="text-[10px] theme-text-secondary">Callout block</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Floating Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 px-4 rounded-2xl theme-bg-card border theme-border shadow-2xl backdrop-blur-md">
        <div className="text-xs font-mono theme-text-secondary border-r theme-border pr-3 py-1">
          <span className="font-bold theme-text-primary">{wordCount}</span> words
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => applyFormatting('\n# ')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <Heading1 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('\n## ')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <Heading2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('**', '**')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('_', '_')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('<u>', '</u>')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <Underline className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('\n* ')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <List className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => applyFormatting('\n1. ')} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 theme-text-secondary">
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen theme-bg-page flex items-center justify-center font-mono text-xs theme-text-secondary">Loading Editor...</div>}>
      <EditorContent />
      <Footer />
    </Suspense>
  );
}