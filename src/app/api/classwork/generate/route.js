'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, CheckCircle2, Loader2, X, Play, Save, AlertCircle, Upload, FileCode, BookOpen,
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const ALL_SUBJECTS = [
  'Matematika', 'Fizika', 'Ona tili', 'Tarix', 'Informatika',
  'Ingliz tili', 'CHQBT', 'Jismoniy tarbiya', 'Tarbiya', 'Rus tili',
];
const CLASS_NAME = '10-A';
const Q_COUNT = 30;
const MAX_HTML = 2 * 1024 * 1024; // 2 MB
const todayStr = () => new Date().toISOString().slice(0, 10);
const emptyQs = () =>
  Array.from({ length: Q_COUNT }, () => ({ question: '', options: ['', '', '', ''], correct: 0 }));
const round1 = (n) => Math.round(n * 10) / 10;

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student');
  const [user, setUser] = useState(null);
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [date, setDate] = useState(todayStr());

  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [results, setResults] = useState([]);

  // ustoz
  const [form, setForm] = useState(emptyQs());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lessonHtml, setLessonHtml] = useState('');
  const [lessonName, setLessonName] = useState('');

  // o'quvchi / ota-ona
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [viewLesson, setViewLesson] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);
      const { data: me } = await supabase
        .from('profiles').select('role, subject, child_id').eq('id', u.id).maybeSingle();
      const r = me?.role || 'student';
      setRole(r);
      setSubject(me?.subject || '');
      if (r === 'student') setStudentId(u.id);
      if (r === 'parent') {
        let cid = me?.child_id;
        if (!cid) {
          const { data: alt } = await supabase
            .from('profiles').select('id').eq('parent_id', u.id).maybeSingle();
          cid = alt?.id;
        }
        setStudentId(cid || null);
      }
      setLoading(false);
    }
    init();
  }, []);

  const loadDay = useCallback(async () => {
    if (!user) return;

    let q = supabase.from('classwork_tests').select('*')
      .eq('class_name', CLASS_NAME).eq('test_date', date);
    if (role === 'teacher') q = q.eq('teacher_id', user.id);
    const { data: t } = await q;
    setTests(t || []);

    const ids = (t || []).map((x) => x.id);
    if (ids.length) {
      const { data: qs } = await supabase
        .from('classwork_test_questions').select('*')
        .in('test_id', ids).order('position');
      setQuestions(qs || []);
    } else {
      setQuestions([]);
    }

    if (role === 'teacher') {
      const mine = (t || [])[0];
      setLessonHtml(mine?.lesson_html || '');
      setLessonName(mine?.lesson_name || '');
      if (mine) {
        const { data: qs } = await supabase
          .from('classwork_test_questions').select('*')
          .eq('test_id', mine.id).order('position');
        const filled = emptyQs();
        (qs || []).slice(0, Q_COUNT).forEach((x, i) => {
          filled[i] = { question: x.question, options: x.options, correct: x.correct };
        });
        setForm(filled);
      } else {
        setForm(emptyQs());
      }
      const { data: att } = await supabase
        .from('classwork_attempts').select('*')
        .eq('teacher_id', user.id).eq('lesson_date', date);
      const { data: studs } = await supabase
        .from('profiles').select('id, first_name, surname, name')
        .eq('role', 'student').eq('class', CLASS_NAME);
      const rows = (studs || []).map((s) => {
        const mineAtt = (att || []).filter((a) => a.student_id === s.id);
        return {
          id: s.id,
          name: `${s.surname || ''} ${s.first_name || s.name || ''}`.trim(),
          count: mineAtt.length,
          avg: mineAtt.length
            ? mineAtt.reduce((a, b) => a + Number(b.score), 0) / mineAtt.length
            : 0,
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setResults(rows);
    } else if (studentId) {
      const { data: att } = await supabase
        .from('classwork_attempts').select('*')
        .eq('student_id', studentId).eq('lesson_date', date);
      setAttempts(att || []);
    }
  }, [user, role, date, studentId]);

  useEffect(() => { loadDay(); }, [loadDay]);

  // ---------- Ustoz ----------
  const setQ = (i, patch) =>
    setForm((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const setOpt = (i, j, v) =>
    setForm((f) => f.map((x, idx) =>
      idx === i ? { ...x, options: x.options.map((o, k) => (k === j ? v : o)) } : x));

  const onPickHtml = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      setToast({ type: 'error', text: 'Faqat .html fayl yuklang.' });
      return;
    }
    if (file.size > MAX_HTML) {
      setToast({ type: 'error', text: 'Fayl 2 MB dan katta.' });
      return;
    }
    setLessonHtml(await file.text());
    setLessonName(file.name);
    setToast({ type: 'success', text: `${file.name} yuklandi. "Testni saqlash" ni bosing.` });
  };

  const generateTest = async () => {
    if (!topic.trim() && !lessonHtml) {
      setToast({ type: 'error', text: 'Dars mavzusini yozing yoki HTML fayl yuklang.' });
      return;
    }
    setGenerating(true);
    setToast(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/classwork/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ subject, topic, className: CLASS_NAME, lessonHtml }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xato');
      setForm(data.questions.map((q) => ({
        question: q.question, options: q.options, correct: q.correct,
      })));
      setToast({ type: 'success', text: `${Q_COUNT} ta savol tayyor. Ko'rib chiqib, "Testni saqlash" ni bosing.` });
    } catch (e) {
      setToast({ type: 'error', text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const saveTest = async () => {
    for (let i = 0; i < Q_COUNT; i++) {
      const q = form[i];
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        setToast({ type: 'error', text: `${i + 1}-savol to'liq to'ldirilmagan.` });
        return;
      }
    }
    setSaving(true);
    setToast(null);
    const { data: test, error } = await supabase
      .from('classwork_tests')
      .upsert([{
        teacher_id: user.id, subject, class_name: CLASS_NAME, test_date: date,
        lesson_html: lessonHtml || null, lesson_name: lessonName || null,
      }], { onConflict: 'teacher_id,class_name,test_date' })
      .select().single();
    if (error) {
      setToast({ type: 'error', text: error.message });
      setSaving(false);
      return;
    }
    await supabase.from('classwork_test_questions').delete().eq('test_id', test.id);
    const { error: e2 } = await supabase.from('classwork_test_questions').insert(
      form.map((q, i) => ({
        test_id: test.id, position: i + 1,
        question: q.question.trim(), options: q.options.map((o) => o.trim()), correct: q.correct,
      }))
    );
    setToast(e2
      ? { type: 'error', text: e2.message }
      : { type: 'success', text: `${date} uchun dars va test saqlandi.` });
    setSaving(false);
    loadDay();
  };

  // ---------- O'quvchi ----------
  const testFor = (subj) => tests.find((t) => t.subject === subj);
  const qsFor = (test) => questions.filter((q) => q.test_id === test?.id);
  const attFor = (test) => attempts.filter((a) => a.teacher_id === test?.teacher_id);
  const avgFor = (test) => {
    const l = attFor(test);
    return l.length ? l.reduce((s, a) => s + Number(a.score), 0) / l.length : 0;
  };

  const submit = async () => {
    const list = qsFor(active);
    const correct = list.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
    const score = list.length ? round1((correct / list.length) * 6) : 0; // 6 ballik shkala
    setSaving(true);
    const { data, error } = await supabase.from('classwork_attempts').insert([{
      student_id: user.id, teacher_id: active.teacher_id, subject: active.subject,
      lesson_date: date, attempt_no: attFor(active).length + 1, score,
    }]).select().single();
    if (!error && data) setAttempts((p) => [...p, data]);
    setResult(error
      ? { error: error.message }
      : { correct, total: list.length, score });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-2 text-xs font-mono theme-text-secondary">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Yuklanmoqda...
      </div>
    );
  }

  const header = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Classwork
        </div>
        <h1 className="text-3xl font-serif font-bold">Classwork</h1>
        <p className="text-xs theme-text-secondary mt-1">
          {role === 'teacher'
            ? `Fan: ${subject || '-'} | Sinf: ${CLASS_NAME}. Har kun uchun 1 ta dars (HTML) va ${Q_COUNT} ta savollik test.`
            : `Sinf ${CLASS_NAME}. Test ${Q_COUNT} savol, natija 6 ballik shkalaga o'tkaziladi. Kuniga 3 urinish, o'rtacha olinadi.`}
        </p>
      </div>
      <input
        type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="px-3 py-2 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
      />
    </div>
  );

  // ================= USTOZ =================
  if (role === 'teacher') {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {header}

        {toast && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.text}
          </div>
        )}

        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
          <h2 className="font-serif font-bold text-lg">
            {date} uchun dars {tests.length ? '(tahrirlash)' : '(yangi)'}
          </h2>

          {/* HTML dars fayli */}
          <div className="p-4 rounded-2xl theme-bg-page border theme-border space-y-3">
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary">
              Dars fayli (HTML)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border hover:border-emerald-500 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" /> HTML fayl tanlash
                <input type="file" accept=".html,.htm,text/html" onChange={onPickHtml} className="hidden" />
              </label>
              {lessonName ? (
                <span className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <FileCode className="w-4 h-4" /> {lessonName}
                  <button type="button" onClick={() => { setLessonHtml(''); setLessonName(''); }}
                    className="text-rose-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  {lessonHtml && (
                    <button type="button" onClick={() => setViewLesson({ html: lessonHtml, name: lessonName })}
                      className="underline cursor-pointer">ko'rish</button>
                  )}
                </span>
              ) : (
                <span className="text-xs theme-text-secondary">Fayl yuklanmagan (maks. 2 MB).</span>
              )}
            </div>
          </div>

          {/* AI */}
          <div className="p-4 rounded-2xl theme-bg-page border border-emerald-500/30 space-y-3">
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary">
              Dars mavzusi (ixtiyoriy, HTML bo'lsa ham bo'ladi)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Kvadrat tenglamalar, diskriminant"
                className="flex-1 px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button" onClick={generateTest} disabled={generating || !subject}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Tuzilmoqda (1 daqiqagacha)...' : `${Q_COUNT} ta savol yaratish`}
              </button>
            </div>
            <p className="text-[10px] theme-text-secondary font-mono">
              HTML fayl yuklangan bo'lsa, savollar shu darsning matniga asoslanadi.
            </p>
          </div>

          {form.map((q, i) => (
            <div key={i} className="p-4 rounded-2xl theme-bg-page border theme-border space-y-3">
              <input
                type="text" placeholder={`${i + 1}-savol`} value={q.question}
                onChange={(e) => setQ(i, { question: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
              />
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((o, j) => (
                  <label key={j} className="flex items-center gap-2 text-xs">
                    <input type="radio" name={`c${i}`} checked={q.correct === j}
                      onChange={() => setQ(i, { correct: j })} />
                    <input
                      type="text" placeholder={`Variant ${j + 1}`} value={o}
                      onChange={(e) => setOpt(i, j, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={saveTest} disabled={saving || !subject}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-6 py-3 rounded-xl cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Dars va testni saqlash
            </button>
          </div>
        </div>

        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
          <h2 className="font-serif font-bold text-lg">{date} natijalari</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                <th className="py-3 px-4">O'quvchi</th>
                <th className="py-3 px-4">Urinishlar</th>
                <th className="py-3 px-4">O'rtacha (6)</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-semibold">{r.name}</td>
                  <td className="py-3 px-4 font-mono">{r.count} / 3</td>
                  <td className="py-3 px-4 font-mono font-bold">{r.avg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <LessonModal lesson={viewLesson} onClose={() => setViewLesson(null)} />
      </div>
    );
  }

  // ================= O'QUVCHI / OTA-ONA =================
  const isParent = role === 'parent';
  const activeQs = active ? qsFor(active) : [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {header}

      {isParent && !studentId && (
        <p className="text-xs font-mono text-rose-400">Farzandingiz akkauntga ulanmagan.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_SUBJECTS.map((subj) => {
          const test = testFor(subj);
          const used = test ? attFor(test).length : 0;
          return (
            <div key={subj} className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
              <h3 className="font-serif font-bold text-lg">{subj}</h3>
              {!test ? (
                <p className="text-xs theme-text-secondary">Bu kunga dars qo'yilmagan.</p>
              ) : (
                <>
                  <div className="text-xs font-mono theme-text-secondary space-y-1">
                    <div>Urinishlar: {used} / 3</div>
                    <div>
                      Classwork balli:{' '}
                      <span className="text-emerald-400 font-bold">{avgFor(test).toFixed(1)} / 6</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {test.lesson_html && (
                      <button
                        onClick={() => setViewLesson({ html: test.lesson_html, name: test.lesson_name || subj })}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-page border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Darsni ochish
                      </button>
                    )}
                    {!isParent && (
                      used >= 3 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono">
                          <CheckCircle2 className="w-4 h-4" /> Urinishlar tugadi
                        </span>
                      ) : (
                        <button
                          onClick={() => { setActive(test); setAnswers({}); setResult(null); }}
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" /> {used === 0 ? 'Testni boshlash' : `${used + 1}-urinish`}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="theme-bg-card border theme-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative">
            <button onClick={() => setActive(null)} className="absolute right-5 top-5 p-1 theme-text-secondary">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-serif font-bold">{active.subject}</h3>

            {result ? (
              <div className="space-y-4 text-center py-6">
                {result.error ? (
                  <p className="text-rose-400 text-xs font-mono">{result.error}</p>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-emerald-400">{result.correct} / {result.total}</div>
                    <p className="text-sm">Bu urinish: <b>{result.score.toFixed(1)} / 6</b> ball</p>
                    <p className="text-xs theme-text-secondary">
                      O'rtacha classwork balli: {avgFor(active).toFixed(1)} / 6
                    </p>
                  </>
                )}
                <button onClick={() => setActive(null)}
                  className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  Yopish
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-mono theme-text-secondary">
                  Javob berilgan: {Object.keys(answers).length} / {activeQs.length}
                </p>
                {activeQs.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-semibold">{i + 1}. {q.question}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((o, j) => (
                        <button key={j} type="button"
                          onClick={() => setAnswers((p) => ({ ...p, [i]: j }))}
                          className={`text-left px-4 py-2.5 rounded-xl text-xs border cursor-pointer ${
                            answers[i] === j
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                              : 'theme-bg-page theme-border'}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={submit} disabled={saving}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-3 rounded-xl text-xs font-bold cursor-pointer">
                  {saving ? 'Yuborilmoqda...' : 'Javoblarni yuborish'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <LessonModal lesson={viewLesson} onClose={() => setViewLesson(null)} />
    </div>
  );
}

// HTML dars oynasi. sandbox: skriptlar ishlaydi, lekin sayt ma'lumotlariga kira olmaydi.
function LessonModal({ lesson, onClose }) {
  if (!lesson) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="theme-bg-card border theme-border rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b theme-border">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
            <FileCode className="w-4 h-4" /> {lesson.name}
          </span>
          <button onClick={onClose} className="p-1 theme-text-secondary cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <iframe
          title={lesson.name}
          srcDoc={lesson.html}
          sandbox="allow-scripts"
          className="flex-1 w-full bg-white"
        />
      </div>
    </div>
  );
}