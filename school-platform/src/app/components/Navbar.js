'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  Users,
  LogIn,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, name, surname, avatar_url, theme')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error('Navbar user fetch error:', err);
      }
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, name, surname, avatar_url, theme')
            .eq('id', currentUser.id)
            .single();

          if (data) setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const rawEmailName = user?.email ? user.email.split('@')[0] : 'Guest';
  const cleanEmailName = rawEmailName.replace(/^[stp]-/i, '');
  const formattedEmailName =
    cleanEmailName.charAt(0).toUpperCase() + cleanEmailName.slice(1);

  const firstName = profile?.first_name || profile?.name;
  const displayName = firstName
    ? `${firstName} ${profile?.surname || ''}`.trim()
    : formattedEmailName;

  const avatarLetter = displayName[0]?.toUpperCase() || '?';

  const isActive = (path) => pathname === path;

  const navItemClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isCollapsed ? 'justify-center' : ''
    } ${
      isActive(path)
        ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
        : 'theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10 hover:text-emerald-400'
    }`;

  return (
    <aside
      className={`sticky top-0 left-0 h-screen border-r theme-border theme-bg-nav flex flex-col justify-between z-50 transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? 'w-20 px-3 py-6' : 'w-64 p-6'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-10 theme-bg-card border theme-border theme-text-secondary hover:theme-text-primary p-1 rounded-full transition-colors z-50 shadow-md cursor-pointer"
        aria-label="Toggle Navigation"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Brand Header */}
      <div className="space-y-6">
        <Link href={user ? '/platform' : '/'} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border theme-border shrink-0 bg-emerald-500/10 flex items-center justify-center">
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
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif font-bold text-sm leading-tight theme-text-primary group-hover:text-emerald-500 transition-colors">
                Xonqa Tuman
              </h1>
              <p className="text-[10px] font-mono theme-text-secondary uppercase tracking-wider">
                Maktab Platform
              </p>
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {user && (
            <Link href="/platform" className={navItemClass('/platform')}>
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isActive('/platform') ? 'text-emerald-400' : ''}`} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          )}

          <Link href="/news" className={navItemClass('/news')}>
            <Newspaper className={`w-4 h-4 shrink-0 ${isActive('/news') ? 'text-emerald-400' : ''}`} />
            {!isCollapsed && <span>News & Press</span>}
          </Link>

          <Link href="/clubs" className={navItemClass('/clubs')}>
            <Users className={`w-4 h-4 shrink-0 ${isActive('/clubs') ? 'text-emerald-400' : ''}`} />
            {!isCollapsed && <span>Clubs</span>}
          </Link>

          <Link href="/editor" className={navItemClass('/editor')}>
            <PenSquare className={`w-4 h-4 shrink-0 ${isActive('/editor') ? 'text-emerald-400' : ''}`} />
            {!isCollapsed && <span>Write Post</span>}
          </Link>
        </nav>
      </div>

      {/* User Section */}
      <div className="pt-4 border-t theme-border space-y-2">
        {!user ? (
          <Link
            href="/login"
            className={`flex items-center font-semibold bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl transition-all ${
              isCollapsed
                ? 'w-10 h-10 justify-center mx-auto'
                : 'w-full px-4 py-2.5 gap-2 justify-center text-xs'
            }`}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign In</span>}
          </Link>
        ) : (
          <div
            className={`flex items-center justify-between ${
              isCollapsed ? 'justify-center' : 'gap-2'
            }`}
          >
            <Link
              href="/profile"
              className={`flex items-center hover:opacity-80 transition-opacity min-w-0 ${
                isCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold theme-text-primary truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] theme-text-secondary truncate">
                    View Profile
                  </p>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <Link
                href="/profile"
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  isActive('/profile')
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
                }`}
                title="Account Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}