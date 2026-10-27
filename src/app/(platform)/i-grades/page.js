'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function StudentGradebookPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('formative_view').select('*')
          .eq('student_id', user.id)
          .order('lesson_date', { ascending: false });
        setRows(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const bySubject = {};
  rows.forEach((r) => {
    (bySubject[r.subject] = bySubject[r.subject] || []).push(r);
  });
  const subjects = Object.entries(bySubject).map(([name, list]) => ({
    name,
    count: list.length,
    avg: list.reduce((s, r) => s + Number(r.total), 0) / list.length,
  }));
  const overall = subjects.length
    ? (subjects.reduce((s, x) => s + x.avg, 0) / subjects.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-2 text-xs font-mono theme-text-secondary">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="border-b theme-border pb-6">
        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
          Student Portal
        </span>
        <h1 className="text-3xl font-serif font-bold">My Grades</h1>
        <p className="text-xs theme-text-secondary mt-1">
          Formativ baho: 10 ball = ustoz (4) + classwork (6).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><Award className="w-6 h-6" /></div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">O'rtacha formativ</div>
            <div className="text-2xl font-bold font-mono">{overall} <span className="text-xs">/ 10</span></div>
          </div>
        </div>
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Fanlar</div>
            <div className="text-2xl font-bold font-mono">{subjects.length}</div>
          </div>
        </div>
      </div>

      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-sm font-serif font-bold border-b theme-border pb-4">Fanlar bo'yicha</h2>
        {subjects.length === 0 ? (
          <p className="text-xs font-mono theme-text-secondary py-8 text-center">Hali baho qo'yilmagan.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Fan</th>
                <th className="py-3 px-4">Darslar</th>
                <th className="py-3 px-4">O'rtacha (10)</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {subjects.map((s) => (
                <tr key={s.name}>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono">{s.count}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{s.avg.toFixed(1)} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > 0 && (
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
          <h2 className="text-sm font-serif font-bold border-b theme-border pb-4">Kunlik ballar</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Fan</th>
                <th className="py-3 px-4">Ustoz (4)</th>
                <th className="py-3 px-4">Classwork (6)</th>
                <th className="py-3 px-4">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 font-mono">{r.lesson_date}</td>
                  <td className="py-3 px-4">{r.subject}</td>
                  <td className="py-3 px-4 font-mono">{r.teacher_points}</td>
                  <td className="py-3 px-4 font-mono">{Number(r.classwork_points).toFixed(1)}</td>
                  <td className="py-3 px-4 font-mono font-bold">{Number(r.total).toFixed(1)} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}