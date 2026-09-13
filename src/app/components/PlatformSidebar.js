'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Users, 
  LogOut, Calendar, 
  MessageSquare, User, Newspaper, GraduationCap,
  TrendingUp, ClipboardCheck, PenSquare
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState('student');

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
        let userRole = data?.role;

        if (emailPrefix.startsWith('t-')) {
          userRole = 'teacher';
        } else if (emailPrefix.startsWith('p-')) {
          userRole = 'parent';
        } else if (!userRole || userRole === 'viewer') {
          userRole = 'student';
        }

        setRole(userRole);
      }
    }
    loadRole();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = {
    teacher: [
      { label: 'Dashboard', href: '/platform', icon: Home },
      { label: 'Internal News', href: '/i-news', icon: Newspaper },
      { label: 'School Clubs', href: '/i-clubs', icon: Calendar },
      { label: 'My Classes', href: '/i-classes', icon: Users },
      { label: 'Grading Hub', href: '/i-grading', icon: ClipboardCheck },
    ],
    student: [
      { label: 'Overview', href: '/platform', icon: Home },
      { label: 'Internal News', href: '/i-news', icon: Newspaper },
      { label: 'Clubs', href: '/i-clubs', icon: Calendar },
      { label: 'My Subjects', href: '/i-subjects', icon: GraduationCap },
      { label: 'My Grades', href: '/i-grades', icon: TrendingUp },
    ],
    parent: [
      { label: 'Overview', href: '/platform', icon: Home },
      { label: 'Internal News', href: '/i-news', icon: Newspaper },
      { label: 'School Clubs', href: '/i-clubs', icon: Calendar },
      { label: 'Child Progress', href: '/i-progress', icon: TrendingUp },
      { label: 'Teacher Messages', href: '/i-messages', icon: MessageSquare },
    ],
  };

  const links = navLinks[role] || navLinks.student;

  return (
    <aside className="w-64 border-r theme-border theme-bg-card p-6 hidden md:flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="space-y-6">
        <Link href="/platform" className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-emerald-500/30 shrink-0 bg-emerald-500/10 flex items-center justify-center p-0.5">
            <Image
              src="/school_logo.png"
              alt="School Logo"
              width={120}
              height={120}
              quality={100}
              className="object-contain w-full h-full rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm theme-text-primary leading-tight">Xonqa Tuman</h2>
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block mt-0.5">
              {role} portal
            </span>
          </div>
        </Link>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {role === 'teacher' && (
          <Link
            href="/editor"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Article</span>
          </Link>
        )}

        <div className="pt-4 border-t theme-border space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}