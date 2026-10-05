'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Send,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Bold,
  Italic,
  LayoutDashboard,
  Image as ImageIcon,
  X,
  Loader2,
  Eye,
  Edit3,
  Globe,
  Lock,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const calculateWordCount = (text) => {
  if (!text) return 0;
  const cleaned = text
    .split('\n')
    .map((line) => line.replace(/^\s*#{1,6}\s+/, '').replace(/^\s*[*+-]\s+/, '').replace(/^\s*\d+\.\s+/, '').replace(/^\s*>\s+/, ''))
    .join(' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_`~#]/g, '')
    .trim();

  if (!cleaned) return 0;
  const words = cleaned.match(/[\p{L}\p{N}]+(?:[''-][\p{L}\p{N}]+)*/gu);
  return words ? words.length : 0;
};

const CATEGORY_OPTIONS = [
  'GENERAL',
  'ANNOUNCEMENT',
  'ACADEMICS',
  'STORIES',
  'POEMS',
  'ARTICLES',
  'SPORTS',
  'CLUBS',
  'ACHIEVEMENTS',
];

function EditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const textareaRef = useRef(null);
  const inlineFileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [wordCount, setWordCount] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  // Auth & Teacher Role Check + Load existing draft or post
  useEffect(() => {
    async function initEditor() {
      try {
        // 1. Get current logged-in user
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          alert('You must be logged in to access the editor.');
          router.push('/login');
          return;
        }

        // 2. Check role directly from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('[Editor] Error fetching profile:', profileError);
          alert('Could not verify account profile.');
          router.push('/i-news');
          return;
        }

        // 3. Strict Teacher Check
        if (profile.role !== 'teacher') {
          alert(`Access restricted. Your account role (${profile.role}) cannot write articles.`);
          router.push('/i-news');
          return;
        }

        setCheckingAuth(false);

        // 4. Load draft or existing post for editing
        if (!editId) {
          const savedDraft = localStorage.getItem('xonqa_editor_draft');
          if (savedDraft) {
            try {
              const { title: t, content: c, category: cat, coverImageUrl: img, isPublic: pub } = JSON.parse(savedDraft);
              if (t) setTitle(t);
              if (c) setContent(c);
              if (cat) setCategory(cat);
              if (img) setCoverImageUrl(img);
              if (pub !== undefined) setIsPublic(pub);
            } catch (err) {
              console.error('Failed to parse draft from localStorage', err);
            }
          }
          return;
        }

        setLoadingEdit(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', editId)
          .single();

        if (error || !data) {
          alert('Failed to load article for editing.');
          router.push('/i-news');
          return;
        }

        setTitle(data.title || '');
        setContent(data.content || '');
        setCategory(data.category || 'GENERAL');
        setIsPublic(!!data.is_public);
        setCoverImageUrl(data.image_url || '');
        setLoadingEdit(false);
      } catch (err) {
        console.error('[Editor] Initialization error:', err);
        setCheckingAuth(false);
      }
    }

    initEditor();
  }, [editId, router]);

  useEffect(() => {
    setWordCount(calculateWordCount(content));
  }, [content]);

  useEffect(() => {
    if (!editId && !checkingAuth) {
      const draft = { title, content, category, coverImageUrl, isPublic };
      localStorage.setItem('xonqa_editor_draft', JSON.stringify(draft));
    }
  }, [title, content, category, coverImageUrl, isPublic, editId, checkingAuth]);

  const uploadImageToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadImageToSupabase(file);
      if (url) setCoverImageUrl(url);
    } catch (err) {
      alert(`Cover image upload failed: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInline(true);
    try {
      const url = await uploadImageToSupabase(file);
      if (url) insertBlock(`\n![Image](${url})\n`);
    } catch (err) {
      alert(`Inline image upload failed: ${err.message}`);
    } finally {
      setUploadingInline(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || '';
    setShowSlashMenu(lastWord.startsWith('/'));
  };

  const insertBlock = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let textBefore = content.substring(0, start);
    let textAfter = content.substring(end);

    if (textBefore.endsWith('/')) textBefore = textBefore.slice(0, -1);

    const newContent = textBefore + prefix + suffix + textAfter;
    setContent(newContent);
    setShowSlashMenu(false);

    const newCursorPos = textBefore.length + prefix.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
      return;
    }
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
      if (numMatch) {
        const indent = numMatch[1];
        const num = parseInt(numMatch[2], 10);
        const itemText = numMatch[3];
        if (itemText.trim() === '') {
          e.preventDefault();
          const lineStart = start - currentLine.length;
          const newContent = content.substring(0, lineStart) + content.substring(start);
          setContent(newContent);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 10);
          return;
        } else {
          e.preventDefault();
          const nextPrefix = `\n${indent}${num + 1}. `;
          const textAfterCursor = content.substring(start);
          const newContent = textBeforeCursor + nextPrefix + textAfterCursor;
          setContent(newContent);
          const newPos = start + nextPrefix.length;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
          }, 10);
          return;
        }
      }

      const bulletMatch = currentLine.match(/^(\s*)([*|-])\s*(.*)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1];
        const bullet = bulletMatch[2];
        const itemText = bulletMatch[3];
        if (itemText.trim() === '') {
          e.preventDefault();
          const lineStart = start - currentLine.length;
          const newContent = content.substring(0, lineStart) + content.substring(start);
          setContent(newContent);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart, lineStart);
          }, 10);
          return;
        } else {
          e.preventDefault();
          const nextPrefix = `\n${indent}${bullet} `;
          const textAfterCursor = content.substring(start);
          const newContent = textBeforeCursor + nextPrefix + textAfterCursor;
          setContent(newContent);
          const newPos = start + nextPrefix.length;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
          }, 10);
          return;
        }
      }
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter both a title and article content.');
      return;
    }

    setPublishing(true);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert('You must be logged in to publish or update articles.');
      setPublishing(false);
      return;
    }

    // Double check profile role before publishing
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'teacher') {
      alert('Only teachers are authorized to publish articles.');
      setPublishing(false);
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: category,
      image_url: coverImageUrl || null,
      is_public: isPublic,
    };

    let error = null;

    if (editId) {
      const response = await supabase
        .from('posts')
        .update(payload)
        .eq('id', editId);
      error = response.error;
    } else {
      const authorName = user.email ? user.email.split('@')[0] : 'Teacher';
      const response = await supabase.from('posts').insert([
        {
          ...payload,
          author_id: user.id,
          author_name: authorName,
          created_at: new Date().toISOString(),
        },
      ]);
      error = response.error;
    }

    setPublishing(false);

    if (error) {
      console.error('Publish error details:', error.message || error);
      alert(`Failed to save post: ${error.message || 'Database error'}`);
    } else {
      if (!editId) localStorage.removeItem('xonqa_editor_draft');
      router.push(editId ? `/i-news/${editId}` : '/i-news');
    }
  };

  if (checkingAuth || loadingEdit) {
    return (
      <div className="min-h-screen theme-bg-page theme-text-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-4xl mx-auto flex flex-col justify-between">
      <input
        type="file"
        ref={inlineFileInputRef}
        onChange={handleInlineImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b theme-border pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/platform"
              className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
              Dashboard
            </Link>
            <span className="theme-text-secondary text-xs">•</span>
            <Link
              href="/i-news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to News
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="inline-flex items-center gap-1.5 theme-bg-card border theme-border hover:border-emerald-500/50 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Edit Mode</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Preview</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {publishing
                ? 'Saving...'
                : editId
                ? 'Update Post'
                : 'Publish Post'}
            </button>
          </div>
        </div>

        {/* Category & Public Toggle controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#111111] theme-text-primary border theme-border focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-wider cursor-pointer shadow-sm"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="bg-[#18181b] text-white py-1">
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                isPublic
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'theme-bg-card border-theme-border theme-text-secondary hover:theme-text-primary'
              }`}
            >
              {isPublic ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Publish to Website</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Platform Only</span>
                </>
              )}
            </button>
          </div>

          <input
            type="file"
            ref={coverFileInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />

          {!coverImageUrl && (
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 text-xs font-semibold theme-bg-card border theme-border px-4 py-2 rounded-xl hover:border-emerald-500/50 transition-all cursor-pointer"
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>Uploading Cover...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Add Cover Photo</span>
                </>
              )}
            </button>
          )}
        </div>

        {coverImageUrl && (
          <div className="relative group rounded-2xl overflow-hidden border theme-border bg-black/40 p-2 flex items-center justify-center max-h-[480px]">
            <img
              src={coverImageUrl}
              alt="Article Cover"
              className="w-full h-auto max-h-[460px] object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setCoverImageUrl('')}
              className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded-full transition-all border border-white/20"
              title="Remove cover photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder:theme-text-secondary"
        />

        {isPreview ? (
          <div className="min-h-[350px] p-6 rounded-2xl theme-bg-card border theme-border max-w-none text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 border-b theme-border pb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2 text-emerald-500">{children}</h2>,
                p: ({ children }) => <p className="mb-3 opacity-90 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 my-3">{children}</ol>,
                li: ({ children }) => <li className="pl-1 opacity-90">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 italic theme-bg-card rounded-r-xl opacity-90">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-bold text-emerald-400">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                img: ({ src, alt }) => (
                  <span className="block my-4 rounded-xl overflow-hidden border theme-border bg-black/30 p-2 text-center flex justify-center">
                    <img src={src} alt={alt || 'Inline Image'} className="max-h-[400px] w-auto object-contain rounded-lg" />
                  </span>
                ),
              }}
            >
              {content || '*No story written yet... Switch to Edit Mode to start writing.*'}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="relative min-h-[350px]">
            <textarea
              ref={textareaRef}
              placeholder="Write your story... (Type '/' for blocks)"
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              className="w-full h-[350px] bg-transparent border-none focus:outline-none resize-none text-sm leading-relaxed placeholder:theme-text-secondary font-sans"
            />

            {showSlashMenu && (
              <div className="absolute top-12 left-0 w-64 theme-bg-card border theme-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider theme-text-secondary px-3 py-1">
                  Insert Block
                </p>
                <div className="space-y-1 mt-1">
                  <button
                    type="button"
                    onClick={() => insertBlock('# ')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <Heading1 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Heading 1</p>
                      <p className="text-[10px] theme-text-secondary">Main section heading</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock('## ')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <Heading2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Heading 2</p>
                      <p className="text-[10px] theme-text-secondary">Sub-heading</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => inlineFileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Image</p>
                      <p className="text-[10px] theme-text-secondary">Embed inline photo</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock('* ')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <List className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Bullet List</p>
                      <p className="text-[10px] theme-text-secondary">Unordered point list</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock('1. ')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <ListOrdered className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Numbered List</p>
                      <p className="text-[10px] theme-text-secondary">Sequential steps</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock('> ')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                  >
                    <Quote className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Quote Block</p>
                      <p className="text-[10px] theme-text-secondary">Highlight callout block</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t theme-border flex items-center justify-between text-xs theme-text-secondary">
        <span className="font-mono">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={uploadingInline}
            onClick={() => inlineFileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors text-emerald-500"
            title="Upload Inline Photo"
          >
            {uploadingInline ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => insertBlock('# ')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><Heading1 className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertBlock('## ')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><Heading2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertBlock('**', '**')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><Bold className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertBlock('*', '*')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><Italic className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertBlock('* ')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><List className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertBlock('1. ')} className="p-1.5 rounded-lg hover:theme-bg-card transition-colors"><ListOrdered className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen theme-bg-page theme-text-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    }>
      <EditorForm />
    </Suspense>
  );
}