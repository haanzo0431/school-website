'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Users, 
  LogOut, Calendar, 
  MessageSquare, User, Newspaper, GraduationCap,
  TrendingUp, ClipboardCheck, PenSquare, UserPlus,
  UserCheck, FileText
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [profile, setProfile] = useState(null);

  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
        }

        const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
        let userRole = data?.role;

        if (emailPrefix.startsWith('a-') || userRole === 'admin') {
          userRole = 'admin';
        } else if (emailPrefix.startsWith('t-') || userRole === 'teacher') {
          userRole = 'teacher';
        } else if (emailPrefix.startsWith('p-') || userRole === 'parent') {
          userRole = 'parent';
        } else if (!userRole || userRole === 'viewer') {
          userRole = 'student';
        }

        setRole(userRole);
      }
    }
    loadUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = {
    admin: [
      { label: 'Create Account', href: '/admin', icon: UserPlus },
      { label: 'Create Class', href: '/admin/classes', icon: Users },
    ],
    teacher: [
      { label: 'Dashboard', href: '/platform', icon: Home },
      { label: 'Daily Attendance', href: '/i-attendance', icon: UserCheck },
      { label: 'Grading Hub', href: '/i-grading', icon: ClipboardCheck },
      { label: 'Classwork', href: '/i-assignments', icon: FileText },
      { label: 'My Classes', href: '/i-classes', icon: Users },
      { label: 'Internal News', href: '/i-news', icon: Newspaper },
      { label: 'School Clubs', href: '/i-clubs', icon: Calendar },
    ],
    student: [
      { label: 'Overview', href: '/platform', icon: Home },
      { label: 'Internal News', href: '/i-news', icon: Newspaper },
      { label: 'Clubs', href: '/i-clubs', icon: Calendar },
      { label: 'My Subjects', href: '/i-subjects', icon: GraduationCap },
      { label: 'Classwork', href: '/i-assignments', icon: FileText },
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

  const currentRole = isAdminRoute ? 'admin' : role;
  const links = navLinks[currentRole] || navLinks.student;

  const avatarUrl = profile?.avatar_url || profile?.photo_url || profile?.avatar;
  const fullName = profile 
    ? `${profile.name || profile.first_name || ''} ${profile.surname || profile.last_name || ''}`.trim() 
    : 'Profile Settings';

  return (
    <aside className="w-64 border-r theme-border theme-bg-card p-6 hidden md:flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="space-y-6">
        <Link href={isAdminRoute ? "/admin" : "/platform"} className="flex items-center gap-3.5">
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
              {currentRole} portal
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
        {currentRole === 'teacher' && (
          <Link
            href="/editor"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Article</span>
          </Link>
        )}

        <div className="pt-4 border-t theme-border space-y-1">
          {/* Interactive Profile Link with Enlarged Photo (w-12 h-12) */}
          <Link
            href="/profile"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.18)] transition-all duration-200 cursor-pointer"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={fullName} 
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 group-hover:scale-105 transition-transform duration-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform duration-200">
                <User className="w-5 h-5" />
              </div>
            )}
            <span className="text-xs font-semibold theme-text-secondary group-hover:theme-text-primary group-hover:text-emerald-300 truncate transition-colors">
              {fullName}
            </span>
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