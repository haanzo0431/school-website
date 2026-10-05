'use client';

import { useState, useEffect } from 'react';
import { 
  Award, BookOpen, TrendingUp, CheckCircle2, 
  AlertCircle, Loader2, User 
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function StudentGradebookPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndGrades() {
      setLoading(true);
      try {
        // 1. Get logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 2. Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) setUserProfile(profile);

          // 3. Fetch grades for current student
          const { data: gradesData } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', user.id);

          setGrades(gradesData || []);
        }
      } catch (err) {
        console.error('Error fetching student gradebook:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserAndGrades();
  }, []);

  // GPA & Stat Calculations
  const calculateAverage = (g) => {
    const scores = [g.q1, g.q2, g.exam].filter((val) => typeof val === 'number');
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const gpa = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + parseFloat(calculateAverage(curr)), 0) / grades.length).toFixed(2)
    : 'N/A';

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        Loading your personal gradebook...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
            Student Portal
          </span>
          <h1 className="text-3xl font-serif font-bold">Personal Gradebook</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Detailed term breakdown, quarterly evaluations, and official subject marks.
          </p>
        </div>

        {/* Read-Only Student Badge */}
        <div className="flex items-center gap-3 theme-bg-card border theme-border px-4 py-2.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            {userProfile?.name?.[0] || <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary">Logged-in Student</div>
            <div className="text-xs font-bold text-white">
              {userProfile ? `${userProfile.name} ${userProfile.surname}` : 'Student Account'} 
              <span className="ml-1.5 text-[10px] font-mono text-emerald-400">
                ({userProfile?.class_name || 'Class 10-A'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Cumulative GPA</div>
            <div className="text-2xl font-bold font-mono">{gpa} <span className="text-xs text-neutral-500">/ 5.0</span></div>
          </div>
        </div>

        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Active Subjects</div>
            <div className="text-2xl font-bold font-mono">{grades.length}</div>
          </div>
        </div>

        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Academic Standing</div>
            <div className="text-sm font-bold text-amber-400">Honor Roll Candidate</div>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b theme-border pb-4">
          <h2 className="text-sm font-serif font-bold">Subject Scores & Evaluations</h2>
          <span className="text-[10px] font-mono theme-text-secondary">Grade Scale: 1 (F) - 5 (A)</span>
        </div>

        {grades.length === 0 ? (
          <p className="text-xs font-mono theme-text-secondary py-8 text-center">
            No grades published for your account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Q1</th>
                  <th className="py-3 px-4">Q2</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Average</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {grades.map((g) => {
                  const avg = calculateAverage(g);
                  return (
                    <tr key={g.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{g.subject_name}</td>
                      <td className="py-3.5 px-4 font-mono">{g.q1 ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono">{g.q2 ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono">{g.exam ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{avg}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          parseFloat(avg) >= 4.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          parseFloat(avg) >= 3.5 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {parseFloat(avg) >= 4.5 ? 'Excellent' : parseFloat(avg) >= 3.5 ? 'Good' : 'Needs Focus'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 theme-text-secondary italic max-w-xs truncate">
                        {g.feedback || 'No feedback provided yet.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}