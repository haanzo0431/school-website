'use client';

import { useState, useEffect } from 'react';
import {
  Users, Clock, MapPin, Search, Loader2, UserX, Save,
  CheckCircle2, AlertCircle, CalendarDays,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const CLASS_OPTIONS = ['10-A'];
const DAY_NAMES = {
  1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba',
  4: 'Payshanba', 5: 'Juma', 6: 'Shanba',
};
const today = () => new Date().toISOString().slice(0, 10);

export default function TeacherClassesPage() {
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0]);
  const [lessonDate, setLessonDate] = useState(today());
  const [teacherId, setTeacherId] = useState(null);
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [students, setStudents] = useState([]);
  const [points, setPoints] = useState({});
  const [classwork, setClasswork] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadTeacher() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setTeacherId(user.id);

      const { data: me } = await supabase
        .from('profiles').select('subject').eq('id', user.id).maybeSingle();
      setSubject(me?.subject || '');

      const { data: sched } = await supabase
        .from('schedule').select('*')
        .eq('teacher_id', user.id)
        .order('weekday').order('lesson_no');
      setSchedule(sched || []);
    }
    loadTeacher();
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      const { data } = await supabase
        .from('profiles').select('*')
        .eq('role', 'student')
        .or(`class.eq.${selectedClass},class_name.eq.${selectedClass}`);

      const list = (data || [])
        .map((s) => ({
          id: s.id,
          name: `${s.surname || ''} ${s.first_name || s.name || ''}`.trim() || s.email,
          email: s.email,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setStudents(list);
      setLoading(false);
    }
    loadStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (!teacherId || students.length === 0) return;
    async function loadScores() {
      const { data: fs } = await supabase
        .from('formative_scores').select('student_id, teacher_points')
        .eq('teacher_id', teacherId).eq('lesson_date', lessonDate);

      const { data: fv } = await supabase
        .from('formative_view').select('student_id, classwork_points')
        .eq('teacher_id', teacherId).eq('lesson_date', lessonDate);

      const p = {};
      const c = {};
      students.forEach((s) => {
        p[s.id] = 4;
        c[s.id] = 0;
      });
      (fs || []).forEach((r) => { p[r.student_id] = r.teacher_points; });
      (fv || []).forEach((r) => { c[r.student_id] = Number(r.classwork_points); });
      setPoints(p);
      setClasswork(c);
    }
    loadScores();
  }, [teacherId, students, lessonDate]);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    const rows = students.map((s) => ({
      student_id: s.id,
      teacher_id: teacherId,
      subject: subject || '-',
      lesson_date: lessonDate,
      teacher_points: Number(points[s.id] ?? 4),
    }));
    const { error } = await supabase
      .from('formative_scores')
      .upsert(rows, { onConflict: 'student_id,teacher_id,lesson_date' });

    setToast(
      error
        ? { type: 'error', text: `Saqlanmadi: ${error.message}` }
        : { type: 'success', text: `${selectedClass} (${lessonDate}) ballari saqlandi.` }
    );
    setSaving(false);
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const byDay = {};
  schedule.forEach((s) => {
    (byDay[s.weekday] = byDay[s.weekday] || []).push(s);
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
            FACULTY CONSOLE
          </span>
          <h1 className="text-3xl font-serif font-bold tracking-tight">My Classes</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Fan: <span className="font-semibold">{subject || '-'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-base font-serif font-bold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-400" /> Haftalik dars jadvali ({selectedClass})
        </h2>
        {schedule.length === 0 ? (
          <p className="text-xs theme-text-secondary font-mono">Jadval kiritilmagan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(byDay).map((d) => (
              <div key={d} className="p-4 rounded-2xl theme-bg-page border theme-border space-y-2">
                <div className="text-xs font-bold text-emerald-400">{DAY_NAMES[d]}</div>
                {byDay[d].map((l) => (
                  <div key={l.id} className="text-xs font-mono theme-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {l.lesson_no}-dars
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {String(l.start_time).slice(0, 5)}-{String(l.end_time).slice(0, 5)}
                    </span>
                    {l.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {l.room}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="p-6 md:p-8 theme-bg-card border theme-border rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              {selectedClass} o'quvchilari ({students.length})
            </h2>
            <p className="text-xs font-mono theme-text-secondary mt-1">
              Siz 10 balldan 4 tasini qo'yasiz. Qolgan 6 ball classwork'dan keladi.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
            />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono theme-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <UserX className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs font-mono theme-text-secondary">{selectedClass} da o'quvchi topilmadi.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">O'quvchi</th>
                    <th className="py-3 px-4">Ustoz balli (10 dan)</th>
                    <th className="py-3 px-4">Classwork (6 dan)</th>
                    <th className="py-3 px-4">Jami (10 dan)</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {filtered.map((s) => {
                    const t = Number(points[s.id] ?? 4);
                    const c = Number(classwork[s.id] ?? 0);
                    return (
                      <tr key={s.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-[10px] font-mono theme-text-secondary">{s.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t}
                            onChange={(e) => setPoints((p) => ({ ...p, [s.id]: Number(e.target.value) }))}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                          >
                            {[4, 3, 2, 1, 0].map((n) => (
                              <option key={n} value={n}>{n} / 10</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 font-mono theme-text-secondary">{c} / 6</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {(t + c).toFixed(1)} / 10
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saqlanmoqda...' : 'Ballarni saqlash'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}