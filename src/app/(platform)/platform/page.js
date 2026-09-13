'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Plus, BookOpen, Award, Bell, 
  Calendar, CheckCircle, MessageSquare, 
  TrendingUp, Users 
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PlatformPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }

          const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
          let userRole = profileData?.role;

          // Standardize role detection: prefix takes priority over generic 'viewer' DB roles
          if (emailPrefix.startsWith('t-')) {
            userRole = 'teacher';
          } else if (emailPrefix.startsWith('p-')) {
            userRole = 'parent';
          } else if (emailPrefix.startsWith('s-')) {
            userRole = 'student';
          } else if (!userRole || userRole === 'viewer') {
            userRole = 'student';
          }

          setRole(userRole);
        }
      } catch (error) {
        console.error('Error loading platform user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const rawName = user?.email ? user.email.split('@')[0] : 'User';
  const displayName = profile?.first_name || profile?.name || rawName;

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b theme-border pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {role.toUpperCase()} ACCOUNT
          </span>
          <h1 className="text-3xl font-serif font-bold mt-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            {role === 'teacher' && 'Manage your classes, publish announcements, and track student growth.'}
            {role === 'student' && 'Access your coursework, check upcoming events, and view your grades.'}
            {role === 'parent' && "Monitor your child's academic progress, attendance, and school notices."}
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border hover:border-emerald-500/50 transition-colors"
        >
          <User className="w-3.5 h-3.5 text-emerald-500" /> Edit Profile
        </Link>
      </div>

      {/* TEACHER DASHBOARD VIEW */}
      {role === 'teacher' && (
        <div className="space-y-6">
          <div className="p-6 theme-bg-card border theme-border rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Faculty Publishing Console
              </span>
              <h2 className="text-xl font-serif font-bold mt-1">Publish Announcements & News</h2>
              <p className="text-xs theme-text-secondary mt-1">
                Create official announcements, class updates, or school news directly onto the feed.
              </p>
            </div>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Post
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Class Rosters</h3>
              <p className="text-xs theme-text-secondary">View and manage enrolled students across assigned classes.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Curriculum Log</h3>
              <p className="text-xs theme-text-secondary">Update weekly lesson plans and upload study materials.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Attendance & Grading</h3>
              <p className="text-xs theme-text-secondary">Submit daily attendance marks and quarterly assessment grades.</p>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD VIEW */}
      {role === 'student' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">My Courses & Clubs</h3>
              <p className="text-xs theme-text-secondary">Access enrolled subjects, club activities, and homework logs.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Academic Record</h3>
              <p className="text-xs theme-text-secondary">Check current GPA, term achievements, and olympiad badges.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Schedule & Events</h3>
              <p className="text-xs theme-text-secondary">View daily bell schedules and upcoming school competitions.</p>
            </div>
          </div>

          <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-3">
            <h2 className="text-lg font-serif font-bold">Recent School Notices</h2>
            <div className="p-4 rounded-xl theme-bg-page border theme-border text-xs flex items-start gap-3">
              <Bell className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">District Math Olympiad Registration Open</span>
                <span className="theme-text-secondary">Submit applications before Friday through your math teacher.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARENT DASHBOARD VIEW */}
      {role === 'parent' && (
        <div className="space-y-6">
          <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Parent Guardian Portal
                </span>
                <h2 className="text-xl font-serif font-bold mt-1">Student Performance Summary</h2>
                <p className="text-xs theme-text-secondary mt-1">
                  Connected Student ID: <span className="font-mono font-bold theme-text-primary">S-10123</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Grade Progress</h3>
              <p className="text-xs theme-text-secondary">Track term GPA performance and exam evaluation reports.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Attendance Record</h3>
              <p className="text-xs theme-text-secondary">Review monthly attendance percentage and absence notes.</p>
            </div>
            <div className="p-5 theme-bg-card border theme-border rounded-2xl space-y-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold">Teacher Communication</h3>
              <p className="text-xs theme-text-secondary">Directly message homeroom teachers or schedule conferences.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}