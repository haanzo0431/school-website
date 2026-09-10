'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/app/supabase';
import { User, LogOut, Globe, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState('UZ');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'uz', label: "O'zbekcha", short: 'UZ' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'ru', label: 'Русский', short: 'RU' },
  ];

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lightweight translation handler stub (Replace with i18n/localization client hook when ready)
  const changeLanguage = (langCode, shortCode) => {
    setCurrentLang(shortCode);
    setShowLangDropdown(false);
    
    // Future expansion: hook your localization router or state context here cleanly without DOM mutation hacks.
    console.log(`Switched language state to: ${langCode}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 theme-bg-card border-b theme-border backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo / Branding */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-serif font-bold text-lg">
            X
          </div>
          <div>
            <h2 className="font-serif font-bold theme-text-primary text-base">Xonqa Tuman</h2>
            <p className="text-[10px] font-mono theme-text-secondary uppercase">Maktab Platform</p>
          </div>
        </Link>

        {/* Centered Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about-school" className={`text-xs transition-colors font-medium ${pathname === '/about-school' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            About School
          </Link>
          <Link href="/teachers-team" className={`text-xs transition-colors font-medium ${pathname === '/teachers-team' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            Teachers Team
          </Link>
          <Link href="/achievements" className={`text-xs transition-colors font-medium ${pathname === '/achievements' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            Achievements
          </Link>
          <Link href="/clubs" className={`text-xs transition-colors font-medium ${pathname === '/clubs' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            Clubs
          </Link>
          <Link href="/news" className={`text-xs transition-colors font-medium ${pathname === '/news' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            News & Press
          </Link>
          <Link href="/contact" className={`text-xs transition-colors font-medium ${pathname === '/contact' ? 'text-emerald-500 font-semibold' : 'theme-text-secondary hover:theme-text-primary'}`}>
            Contact
          </Link>
        </nav>

        {/* Right Actions: Language Selector + Auth */}
        <div className="flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="px-3 py-2 rounded-xl border theme-border text-xs theme-text-secondary hover:theme-text-primary theme-bg-card flex items-center gap-2 transition-all cursor-pointer font-mono"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 theme-bg-card border theme-border rounded-xl shadow-xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code, l.short)}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentLang === l.short
                        ? 'text-emerald-500 font-semibold bg-emerald-500/10'
                        : 'theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/5'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="font-mono text-[10px]">{l.short}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Sign In */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl border theme-border text-xs theme-text-primary flex items-center gap-2 theme-bg-card">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-mono truncate max-w-[120px]">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl border theme-border text-xs theme-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}