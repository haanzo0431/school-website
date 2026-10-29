'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, Loader2, User, CalendarDays } from 'lucide-react';
import { supabase } from '@/app/supabase';
import { useUser } from '@/app/context/UserContext';

const ALL_SUBJECTS = [
  'Matematika', 'Fizika', 'Ona tili', 'Tarix', 'Informatika',
  'Ingliz tili', 'CHQBT', 'Jismoniy tarbiya', 'Tarbiya', 'Rus tili',
];

export default function ChildProgressPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [child, setChild] = useState(null);
  const [rows, setRows] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Hammasi');

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function load() {
      try {
        let childId = profile?.child_id;
        if (!childId) {
          const { data: alt } = await supabase
            .from('profiles').select('id').eq('parent_id', user.id).maybeSingle();
          childId = alt?.id;
        }
        if (!childId) {
          if (isMounted) setError('Farzandingiz akkauntga ulanmagan.');
          return;
        }

        const [{ data: kid }, { data: scores }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', childId).maybeSingle(),
          supabase.from('formative_view').select('*')
            .eq('student_id', childId)
            .order('lesson_date', { ascending: false }),
        ]);

        if (isMounted) {
          setChild(kid);
          setRows(scores || []);
        }
      } catch (e) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user, profile]);

  const loading = userLoading || (user ? dataLoading : false);

  const bySubject = {};
  rows.forEach((r) => {
    (bySubject[r.subject] = bySubject[r.subject] || []).push(r);
  });

  const subjectStats = ALL_SUBJECTS.map((name) => {
    const list = bySubject[name] || [];
    return {
      name,
      count: list.length,
      avg: list.length
        ? list.reduce((s, r) => s + Number(r.total), 0) / list.length
        : null,
    };
  });

  const graded = subjectStats.filter((s) => s.avg !== null);
  const overall = graded.length
    ? (graded.reduce((s, x) => s + x.avg, 0) / graded.length).toFixed(1)
    : '-';

  const visible = rows.filter((r) => filter === 'Hammasi' || r.subject === filter);
  const childName = child
    ? `${child.surname || ''} ${child.first_name || child.name || ''}`.trim()
    : '';

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-2 text-xs font-mono theme-text-secondary">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Yuklanmoqda...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-xs font-mono text-rose-400">{error}</div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="border-b theme-border pb-6">
        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
          Parent Portal
        </span>
        <h1 className="text-3xl font-serif font-bold">Child Progress</h1>
        <p className="text-xs theme-text-secondary mt-1 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-500" />
          {childName || 'Farzand'} {child?.class ? `• ${child.class} sinf` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">O'rtacha ball</div>
            <div className="text-2xl font-bold font-mono">
              {overall} <span className="text-xs">/ 10</span>
            </div>
          </div>
        </div>
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Baholangan fanlar</div>
            <div className="text-2xl font-bold font-mono">
              {graded.length} <span className="text-xs">/ {ALL_SUBJECTS.length}</span>
            </div>
          </div>
        </div>
        <div className="p-5 theme-bg-card border theme-border rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono theme-text-secondary uppercase">Baholangan kunlar</div>
            <div className="text-2xl font-bold font-mono">
              {new Set(rows.map((r) => r.lesson_date)).size}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-sm font-serif font-bold border-b theme-border pb-4">Fanlar bo'yicha</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Fan</th>
                <th className="py-3 px-4">Baholangan darslar</th>
                <th className="py-3 px-4">O'rtacha (10)</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {subjectStats.map((s) => (
                <tr key={s.name}>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono">{s.count}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {s.avg === null ? '-' : `${s.avg.toFixed(1)} / 10`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b theme-border pb-4">
          <h2 className="text-sm font-serif font-bold">Kunlik baholar</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
          >
            <option value="Hammasi">Hammasi</option>
            {ALL_SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="text-xs font-mono theme-text-secondary py-8 text-center">
            Hali baho qo'yilmagan.
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                {visible.map((r, i) => (
                  <tr key={i} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3 px-4 font-mono">{r.lesson_date}</td>
                    <td className="py-3 px-4">{r.subject}</td>
                    <td className="py-3 px-4 font-mono">{r.teacher_points}</td>
                    <td className="py-3 px-4 font-mono">{Number(r.classwork_points).toFixed(1)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {Number(r.total).toFixed(1)} / 10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}