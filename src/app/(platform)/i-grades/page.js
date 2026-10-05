'use client';

import { useState, useEffect } from 'react';
import { 
  Award, BookOpen, TrendingUp, Loader2 
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function StudentGradebookPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: gradesData, error: gradesError } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', user.id);

          if (gradesError) {
            console.error('Error fetching grades:', gradesError);
          }

          // Deduplicate items (keeps latest record per subject)
          const deduplicated = {};
          (gradesData || []).forEach((item) => {
            const key = (item.subject || item.subject_name || 'unknown').toLowerCase().trim();
            if (!deduplicated[key] || item.id > deduplicated[key].id) {
              deduplicated[key] = item;
            }
          });

          setGrades(Object.values(deduplicated));
        }
      } catch (err) {
        console.error('Error fetching student gradebook:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGrades();
  }, []);

  // Safe GPA & Stat Calculations
  const calculateAverage = (g) => {
    const rawScores = [g.q1, g.q2, g.exam];
    const validScores = rawScores
      .map((val) => (val !== null && val !== undefined && val !== '' ? Number(val) : NaN))
      .filter((num) => !isNaN(num));

    if (validScores.length === 0) return '0.0';
    const sum = validScores.reduce((a, b) => a + b, 0);
    return (sum / validScores.length).toFixed(1);
  };

  const validGradesWithAvg = grades
    .map((curr) => parseFloat(calculateAverage(curr)))
    .filter((avg) => avg > 0);

  const gpa = validGradesWithAvg.length > 0
    ? (validGradesWithAvg.reduce((acc, curr) => acc + curr, 0) / validGradesWithAvg.length).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        Loading personal gradebook...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Clean Header */}
      <div className="border-b theme-border pb-6">
        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
          Student Portal
        </span>
        <h1 className="text-3xl font-serif font-bold">Personal Gradebook</h1>
        <p className="text-xs theme-text-secondary mt-1">
          Detailed term breakdown, quarterly evaluations, and official subject marks.
        </p>
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
            <div className="text-sm font-bold text-amber-400">
              {parseFloat(gpa) >= 4.5 ? 'Honor Roll Candidate' : parseFloat(gpa) >= 3.5 ? 'Good Academic Standing' : 'Needs Academic Review'}
            </div>
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
                  const numericAvg = parseFloat(avg);
                  const subjectTitle = g.subject || g.subject_name || 'Subject';

                  return (
                    <tr key={g.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{subjectTitle}</td>
                      <td className="py-3.5 px-4 font-mono">{g.q1 ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono">{g.q2 ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono">{g.exam ?? '-'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{avg}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          numericAvg >= 4.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          numericAvg >= 3.5 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {numericAvg >= 4.5 ? 'Excellent' : numericAvg >= 3.5 ? 'Good' : 'Needs Focus'}
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