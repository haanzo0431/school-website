'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Users, LogIn, PenSquare, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { supabase } from '../supabase';

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name, surname, avatar_url, theme')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          const currentLocalTheme = localStorage.getItem('app-theme');
          if (!currentLocalTheme && data.theme) {
            document.documentElement.setAttribute('data-theme', data.theme);
            localStorage.setItem('app-theme', data.theme);
          }
        }
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
            .select('name, surname, avatar_url, theme')
            .eq('id', currentUser.id)
            .single();

          if (data) {
            setProfile(data);
            const currentLocalTheme = localStorage.getItem('app-theme');
            if (!currentLocalTheme && data.theme) {
              document.documentElement.setAttribute('data-theme', data.theme);
              localStorage.setItem('app-theme', data.theme);
            }
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const displayName = profile?.name
    ? `${profile.name} ${profile.surname || ''}`.trim()
    : user?.email
    ? user.email.split('@')[0]
    : 'Guest User';

  const avatarLetter = profile?.name
    ? profile.name[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?';

  return (
    <aside 
      className={`sticky top-0 left-0 h-screen border-r theme-border theme-bg-nav flex flex-col justify-between z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 px-4 py-6' : 'w-64 p-6'
      }`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-10 theme-bg-card border theme-border theme-text-secondary hover:theme-text-primary p-1 rounded-full transition-colors z-50 shadow-md cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div>
        <Link href="/" className={`flex items-center group mb-12 w-full ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}`}>
          <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center border theme-border">
             <Image 
               src="/school_logo.jpg" 
               alt="School Logo" 
               width={96} 
               height={96} 
               className="object-cover w-full h-full scale-[1.03]"
               onError={(e) => (e.currentTarget.style.display = 'none')}
             />
          </div>
          <div className={`flex flex-col whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <span className="font-serif text-lg tracking-tight font-bold theme-text-primary leading-tight">
              Xonqa Tuman
            </span>
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest truncate">
              Maktab Platform
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-6 text-sm font-medium theme-text-secondary w-full">
          <Link href="/news" className={`flex items-center hover:theme-text-primary transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <Newspaper className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>News & Press</span>
          </Link>
          <Link href="/clubs" className={`flex items-center hover:theme-text-primary transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Clubs</span>
          </Link>
          <Link href="/editor" className={`flex items-center transition-colors text-emerald-500 hover:text-emerald-400 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <PenSquare className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Write Post</span>
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {!user && (
          <Link 
            href="/login" 
            className={`flex items-center font-semibold bg-emerald-500 text-black hover:bg-emerald-400 rounded-full transition-all duration-300 ${isCollapsed ? 'w-11 h-11 justify-center mx-auto' : 'w-full px-4 py-2.5 gap-2 justify-center text-sm'}`}
          >
            <LogIn className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Sign In
            </span>
          </Link>
        )}
        
        <div className={`flex items-center pt-4 border-t theme-border w-full ${isCollapsed ? 'flex-col gap-4' : 'justify-between gap-2'}`}>
          <Link 
            href={user ? "/profile" : "/login"}
            className={`flex items-center hover:opacity-80 transition-opacity flex-1 min-w-0 ${isCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="w-9 h-9 rounded-full theme-bg-input border theme-border flex items-center justify-center text-sm font-bold theme-text-primary flex-shrink-0 overflow-hidden">
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
            <span className={`text-sm font-medium theme-text-primary truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              {displayName}
            </span>
          </Link>

          <Link
            href="/profile"
            className="p-1.5 rounded-md theme-text-secondary hover:theme-text-primary hover:bg-white/5 transition-colors flex-shrink-0"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}