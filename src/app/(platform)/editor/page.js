'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function EditorPage() {
  const router = useRouter();
  const textareaRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Update word count and handle slash menu trigger logic
  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    // Calculate word count
    const trimmed = value.trim();
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);

    // Check if the current trailing text or word is a slash command
    const lines = value.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    const words = currentLine.split(' ');
    const lastWord = words[words.length - 1];

    // Show menu only if last word starts with '/'
    if (lastWord.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  // Close menu on key combinations like Escape or Backspace when line is cleared
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  // Insert a block template and remove the trigger '/'
  const insertBlock = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Remove trailing '/' character if present
    let updatedContent = content;
    if (updatedContent.endsWith('/')) {
      updatedContent = updatedContent.slice(0, -1);
    }

    const newText = `${updatedContent}${prefix}${suffix}`;
    setContent(newText);
    setShowSlashMenu(false);

    // Calculate word count for updated text
    const trimmed = newText.trim();
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);

    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter both a title and article content.');
      return;
    }

    setPublishing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to publish articles.');
      setPublishing(false);
      return;
    }

    const authorName = user.email ? user.email.split('@')[0] : 'Teacher';

    const { error } = await supabase.from('posts').insert([
      {
        author_id: user.id,
        author_name: authorName,
        title: title.trim(),
        content: content.trim(),
        category: category,
        created_at: new Date().toISOString(),
      },
    ]);

    setPublishing(false);

    if (error) {
      console.error('Publish error details:', error.message || error);
      alert(`Failed to publish post: ${error.message || 'Database error'}`);
    } else {
      router.push('/i-news');
    }
  };

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-4xl mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        {/* Navigation & Header */}
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

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {publishing ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>

        {/* Category Selector */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 uppercase tracking-wider"
          >
            <option value="GENERAL">GENERAL</option>
            <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
            <option value="ACADEMICS">ACADEMICS</option>
            <option value="SPORTS">SPORTS</option>
            <option value="CLUBS">CLUBS</option>
          </select>
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder:theme-text-secondary"
        />

        {/* Main Text Editor Area */}
        <div className="relative min-h-[350px]">
          <textarea
            ref={textareaRef}
            placeholder="Write your story... (Type '/' for blocks)"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="w-full h-[350px] bg-transparent border-none focus:outline-none resize-none text-sm leading-relaxed placeholder:theme-text-secondary"
          />

          {/* Floating Slash Popup */}
          {showSlashMenu && (
            <div className="absolute top-12 left-0 w-64 theme-bg-card border theme-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider theme-text-secondary px-3 py-1">
                Insert Block
              </p>
              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => insertBlock('\n# ')}
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
                  onClick={() => insertBlock('\n## ')}
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
                  onClick={() => insertBlock('\n* ')}
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
                  onClick={() => insertBlock('\n1. ')}
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
                  onClick={() => insertBlock('\n> ')}
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
      </div>

      {/* Bottom Status Toolbar */}
      <div className="pt-4 border-t theme-border flex items-center justify-between text-xs theme-text-secondary">
        <span className="font-mono">{wordCount} words</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => insertBlock('\n# ')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('\n## ')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('**', '**')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('*', '*')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('\n* ')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('\n1. ')}
            className="p-1.5 rounded-lg hover:theme-bg-card hover:theme-text-primary transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}