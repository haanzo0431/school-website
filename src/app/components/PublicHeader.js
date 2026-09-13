'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Check, Sun, Moon, Flame } from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'warm', label: 'Warm', icon: Flame },
];

export default function PublicHeader() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  const themeRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    setThemeOpen(false);
    localStorage.setItem('theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const ActiveThemeIcon = THEMES.find((t) => t.id === currentTheme)?.icon || Moon;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b theme-border theme-bg-page sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500/20 shrink-0 bg-emerald-500/10 flex items-center justify-center">
          <Image
            src="/school_logo.png"
            alt="School Logo"
            width={120}
            height={120}
            quality={95}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1 className="font-serif font-bold text-sm theme-text-primary">Xonqa Region</h1>
          <p className="text-[10px] font-mono theme-text-secondary uppercase tracking-wider">
            Specialized School
          </p>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-bold theme-text-primary">
        <Link href="/about-school" className="hover:text-emerald-400 transition-colors">
          About School
        </Link>
        <Link href="/teachers-team" className="hover:text-emerald-400 transition-colors">
          Teachers Team
        </Link>
        <Link href="/achievements" className="hover:text-emerald-400 transition-colors">
          Achievements
        </Link>
        <Link href="/clubs" className="hover:text-emerald-400 transition-colors">
          Clubs
        </Link>
        <Link href="/news" className="hover:text-emerald-400 transition-colors">
          News
        </Link>
        <Link href="/contact" className="hover:text-emerald-400 transition-colors">
          Contact
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {/* Theme Dropdown */}
        <div className="relative hidden md:block" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-primary px-3 py-1.5 rounded-full border theme-border theme-bg-card transition-all focus:outline-none focus:border-emerald-500/50"
          >
            <ActiveThemeIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="capitalize">{currentTheme}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`} />
          </button>

          <div
            className={`absolute right-0 mt-2 w-32 py-1.5 theme-bg-card border theme-border rounded-xl shadow-xl z-50 transition-all duration-200 ease-out origin-top-right ${
              themeOpen
                ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
                : 'opacity-0 scale-95 pointer-events-none -translate-y-1'
            }`}
          >
            {THEMES.map((theme) => {
              const IconComponent = theme.icon;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-emerald-500/10 transition-colors ${
                    currentTheme === theme.id ? 'text-emerald-500 font-bold' : 'theme-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className="w-3.5 h-3.5" />
                    {theme.label}
                  </span>
                  {currentTheme === theme.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href="/login"
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md ml-1"
        >
          Kirish
        </Link>
      </div>
    </header>
  );
}