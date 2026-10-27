'use client';

import { useState, useEffect } from 'react';
import { BookOpen, User, Clock, Building, Loader2 } from 'lucide-react';
import { supabase } from '@/app/supabase';

const DAYS = { 1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba' };

export default function StudentSubjectsPage() {
  const [cls, setCls] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: me } = await supabase.from('profiles').select('class, class_name').eq('id', user.id).maybeSingle();
      const className = me?.class || me?.class_name || '10-A';
      setCls(className);

      const { data: sched } = await supabase.from('schedule').select('*')
        .eq('class_name', className).order('weekday').order('lesson_no');
      const ids = [...new Set((sched || []).map((s) => s.teacher_id))];
      const { data: teachers } = await supabase.from('profiles').select('id, subject').in('id', ids);

      const map = {};
      (sched || []).forEach((s) => {
        const t = (teachers || []).find((x) => x.id === s.teacher_id);
        const name = t?.subject || 'Fan';
        map[name] = map[name] || { name, slots: [], rooms: new Set() };
        map[name].slots.push(s);
        if (s.room) map[name].rooms.add(s.room);
      });
      setSubjects(Object.values(map));
      setLoading(false);
    }
    load();
  }, []);

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
          Class {cls}
        </div>
        <h1 className="text-3xl font-serif font-bold">My Subjects & Schedule</h1>
      </div>

      {subjects.length === 0 ? (
        <p className="text-xs font-mono theme-text-secondary text-center py-12">Dars jadvali topilmadi.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <div key={s.name} className="p-6 theme-bg-card border theme-border rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h3 className="font-serif font-bold text-lg">{s.name}</h3>
              </div>
              <div className="pt-2 border-t theme-border space-y-1.5">
                <div className="flex items-center gap-2 theme-text-secondary text-[10px] font-mono uppercase">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> Dars vaqtlari
                </div>
                {s.slots.map((l) => (
                  <div key={l.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg theme-bg-page border theme-border text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold">{DAYS[l.weekday]} ({l.lesson_no}-dars)</span>
                    <span className="theme-text-secondary">
                      {String(l.start_time).slice(0, 5)}-{String(l.end_time).slice(0, 5)}
                    </span>
                  </div>
                ))}
                {s.rooms.size > 0 && (
                  <div className="flex items-center gap-2 theme-text-secondary text-xs pt-1">
                    <Building className="w-3.5 h-3.5 text-emerald-500" /> {[...s.rooms].join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}