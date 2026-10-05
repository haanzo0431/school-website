'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Plus, BookOpen, 
  CheckCircle, MessageSquare, 
  TrendingUp, Users, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function PlatformPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true);

  // Dynamic state loaded from Supabase
  const [studentGrades, setStudentGrades] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [tomorrowsLessons, setTomorrowsLessons] = useState([]);

  // Helper function to calculate average dynamically from q1, q2, exam
  const calculateAverage = (g) => {
    if (!g) return null;
    const rawScores = [g.q1, g.q2, g.exam];
    const validScores = rawScores
      .map((val) => (val !== null && val !== undefined && val !== '' ? Number(val) : NaN))
      .filter((num) => !isNaN(num));

    if (validScores.length === 0) return null;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return (sum / validScores.length).toFixed(1);
  };

  useEffect(() => {
    async function loadUserDataAndContent() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          // Fetch Profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }

          // Determine Role
          const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
          let userRole = profileData?.role;

          if (emailPrefix.startsWith('t-')) {
            userRole = 'teacher';
          } else if (emailPrefix.startsWith('p-')) {
            userRole = 'parent';
          } else if (emailPrefix.startsWith('s-')) {
            userRole = 'student';
          } else if (emailPrefix.startsWith('a-') || emailPrefix === 'admin' || userRole === 'admin') {
            userRole = 'admin';
          } else if (!userRole || userRole === 'viewer') {
            userRole = 'student';
          }

          // Immediate Admin Redirect Guard
          if (userRole === 'admin') {
            router.replace('/admin/classes');
            return;
          }

          setRole(userRole);

          // Fetch Real Backend Data for Students
          if (userRole === 'student') {
            // 1. Fetch Student Grades from Supabase
            const { data: gradesData } = await supabase
              .from('grades')
              .select('*')
              .eq('student_id', user.id);

            if (gradesData && gradesData.length > 0) {
              const deduplicated = {};
              gradesData.forEach((item) => {
                const key = (item.subject || item.subject_name || 'unknown').toLowerCase().trim();
                if (!deduplicated[key] || item.id > deduplicated[key].id) {
                  deduplicated[key] = item;
                }
              });

              setStudentGrades(Object.values(deduplicated));
            } else {
              setStudentGrades([]);
            }

            // 2. Fetch Real Posts from 'posts'
            const { data: newsData, error: newsError } = await supabase
              .from('posts')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(6);

            if (newsError) {
              console.error('Supabase posts fetch error:', newsError);
            }

            if (newsData && newsData.length > 0) {
              setLatestArticles(newsData);
            }

            // 3. Fetch Tomorrow's Lessons from Supabase
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('*')
              .order('period', { ascending: true });

            if (lessonsData && lessonsData.length > 0) {
              setTomorrowsLessons(lessonsData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading platform user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserDataAndContent();
  }, [router]);

  const rawName = user?.email ? user.email.split('@')[0] : 'Student';
  const displayName = profile?.first_name || profile?.name || rawName;

  const scrollGrades = (direction) => {
    const container = document.getElementById('grades-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    const s = String(status).toLowerCase();
    if (s.includes('excellent') || s.includes('top')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s.includes('good') || s.includes('great')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (s.includes('focus') || s.includes('warning') || s.includes('low')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b theme-border pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {role.toUpperCase()} ACCOUNT
          </span>
          <h1 className="text-3xl font-serif font-bold mt-2">
            Welcome, {displayName}
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            {role === 'teacher' && 'Manage your classes, publish announcements, and track student growth.'}
            {role === 'student' && 'Check your recent grades, school news, and tomorrow’s schedule.'}
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

      {/* STUDENT DASHBOARD VIEW */}
      {role === 'student' && (
        <div className="space-y-8">
          
          {/* SECTION 1: GRADES SLIDER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold">Recent Subject Grades</h2>
                <p className="text-xs theme-text-secondary">Swipe or scroll through your subject performance</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollGrades('left')}
                  className="p-2 rounded-xl theme-bg-card border theme-border hover:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollGrades('right')}
                  className="p-2 rounded-xl theme-bg-card border theme-border hover:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              id="grades-container"
              className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {studentGrades.length === 0 ? (
                <p className="text-xs font-mono theme-text-secondary py-4">
                  No published grades available yet.
                </p>
              ) : (
                studentGrades.map((grade, index) => {
                  const subjectTitle = grade.subject || grade.subject_name || grade.name || 'Subject';
                  
                  const computedAvg = calculateAverage(grade);
                  const scoreDisplay = computedAvg ?? grade.average ?? grade.score ?? '—';
                  const numericAvg = scoreDisplay !== '—' ? parseFloat(scoreDisplay) : null;
                  
                  const statusText = grade.status || (
                    numericAvg === null ? 'Needs Focus' :
                    numericAvg >= 4.5 ? 'Excellent' :
                    numericAvg >= 3.5 ? 'Good' : 'Needs Focus'
                  );

                  return (
                    <div
                      key={grade.id || index}
                      className="min-w-[180px] md:min-w-[210px] snap-start p-4 rounded-2xl theme-bg-card border theme-border flex flex-col justify-between space-y-3 shrink-0 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate pr-2">{subjectTitle}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${getStatusBadgeClass(statusText)}`}>
                          {scoreDisplay}
                        </span>
                      </div>
                      <div>
                        <span className="text-2xl font-serif font-bold">{scoreDisplay}</span>
                        <p className="text-[10px] theme-text-secondary font-mono mt-0.5">{statusText}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 2: LATEST (STORIES, NEWS, POEMS) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-serif font-bold">Latest School Feed</h2>
              <p className="text-xs theme-text-secondary">Read recent student stories, school announcements, and creative poems</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-5 rounded-2xl theme-bg-card border theme-border hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {article.category || article.type || 'NEWS'}
                      </span>
                      <span className="text-[10px] theme-text-secondary font-mono">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold line-clamp-2">{article.title}</h3>
                    {article.content && (
                      <p className="text-xs theme-text-secondary line-clamp-2">{article.content}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t theme-border text-[11px] theme-text-secondary">
                    <span>By {article.author || article.author_name || 'Admin'}</span>
                    <Link href="/i-news" className="text-emerald-400 hover:underline font-medium">Read →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: TOMORROW'S LESSONS TABLE */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-serif font-bold">Tomorrow&apos;s Lessons</h2>
              <p className="text-xs theme-text-secondary">Your schedule and room assignments for tomorrow</p>
            </div>

            <div className="theme-bg-card border theme-border rounded-3xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="theme-bg-page border-b theme-border font-mono text-[11px] uppercase theme-text-secondary">
                  <tr>
                    <th className="p-4 w-16 text-center">#</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Room #</th>
                    <th className="p-4">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {tomorrowsLessons.map((lesson) => (
                    <tr key={lesson.id || lesson.period} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="p-4 text-center font-mono font-bold text-emerald-500">
                        {lesson.period}
                      </td>
                      <td className="p-4 font-semibold theme-text-primary">
                        {lesson.subject}
                      </td>
                      <td className="p-4 font-mono theme-text-secondary">
                        {lesson.room}
                      </td>
                      <td className="p-4 theme-text-secondary">
                        {lesson.teacher}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

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