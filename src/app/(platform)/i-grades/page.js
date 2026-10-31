'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, Loader2, Printer, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/app/supabase';
import { useUser } from '@/app/context/UserContext';

export default function StudentGradebookPage() {
  const { user, profile, role, loading: userLoading } = useUser();
  const [rows, setRows] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [digestStatus, setDigestStatus] = useState(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function load() {
      const { data } = await supabase
        .from('formative_view').select('*')
        .eq('student_id', user.id)
        .order('lesson_date', { ascending: false });
      if (isMounted) {
        setRows(data || []);
        setDataLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [user]);

  const loading = userLoading || (user ? dataLoading : false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleSendDigest = async () => {
    setSendingDigest(true);
    setDigestStatus(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/reports/daily-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setDigestStatus({
        type: 'success',
        text: `Kunlik hisobot Telegram kanaliga yuborildi! (${data.studentCount || 0} o'quvchi).`,
      });
    } catch (err) {
      setDigestStatus({ type: 'error', text: err.message || 'Hisobotni yuborib bo\'lmadi.' });
    } finally {
      setSendingDigest(false);
      setTimeout(() => setDigestStatus(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-2 text-xs font-mono theme-text-secondary">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Yuklanmoqda...
      </div>
    );
  }

  const studentName = profile?.name || `${profile?.first_name || ''} ${profile?.surname || ''}`.trim() || user?.email?.split('@')[0] || 'O\'quvchi';
  const studentClass = profile?.class || '10-A';
  const todayDate = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Screen View */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 print:hidden">
        <div className="border-b theme-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
              Student Portal
            </span>
            <h1 className="text-3xl font-serif font-bold">My Grades</h1>
            <p className="text-xs theme-text-secondary mt-1">
              Formativ baho: 10 ball = ustoz (4) + classwork (6).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Download PDF / Print button (100% Free Client-side) */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border hover:border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold font-mono transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish / PDF yuklash</span>
            </button>

            {/* End-of-Day Daily Digest button (Teachers and Admins) */}
            {(role === 'teacher' || role === 'admin') && (
              <button
                onClick={handleSendDigest}
                disabled={sendingDigest}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {sendingDigest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Telegramga hisobot</span>
              </button>
            )}
          </div>
        </div>

        {digestStatus && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
              digestStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {digestStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 shrink-0" />}
            <span>{digestStatus.text}</span>
          </div>
        )}

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

      {/* Printable Official Report Card Layout (Rendered only on Print / Save as PDF) */}
      <div className="hidden print:block p-8 bg-white text-black font-serif min-h-screen">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider">Xonqa Tuman 1-Sonli Maktab</h1>
          <h2 className="text-sm uppercase tracking-widest text-gray-700 mt-1">O'quvchining Rasmiy Baholar Tabeli</h2>
          <p className="text-[11px] text-gray-600 mt-0.5">Xonqa tumani, Xorazm viloyati • www.xonqa.school</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-gray-300 p-4 rounded">
          <div>
            <p><strong>O'quvchi F.I.SH:</strong> {studentName}</p>
            <p className="mt-1"><strong>Sinf:</strong> {studentClass}</p>
          </div>
          <div className="text-right">
            <p><strong>Berilgan sana:</strong> {todayDate}</p>
            <p className="mt-1"><strong>Umumiy o'rtacha ball:</strong> <span className="font-bold text-sm">{overall} / 10</span></p>
          </div>
        </div>

        <table className="w-full text-left text-xs border border-collapse border-black mb-8">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-center font-bold">
              <th className="border border-black py-2 px-3 text-left">№</th>
              <th className="border border-black py-2 px-3 text-left">Fan Nomi</th>
              <th className="border border-black py-2 px-3">Topshirilgan Darslar</th>
              <th className="border border-black py-2 px-3">O'rtacha Baho (10 ballik)</th>
              <th className="border border-black py-2 px-3">Ko'rsatkich</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, index) => {
              const statusLabel = s.avg >= 8.5 ? "A'lo" : s.avg >= 6.5 ? "Yaxshi" : "Qoniqarli";
              return (
                <tr key={s.name} className="border-b border-gray-300">
                  <td className="border border-black py-2 px-3 text-center">{index + 1}</td>
                  <td className="border border-black py-2 px-3 font-semibold">{s.name}</td>
                  <td className="border border-black py-2 px-3 text-center font-mono">{s.count}</td>
                  <td className="border border-black py-2 px-3 text-center font-mono font-bold">{s.avg.toFixed(1)}</td>
                  <td className="border border-black py-2 px-3 text-center">{statusLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-16 pt-8 grid grid-cols-3 gap-8 text-xs text-center border-t border-gray-300">
          <div>
            <p className="border-b border-black pb-1 mb-1 font-semibold">Maktab Direktori</p>
            <p className="text-[10px] text-gray-500">(imzo / muhr)</p>
          </div>
          <div>
            <p className="border-b border-black pb-1 mb-1 font-semibold">Sinf Rahbari</p>
            <p className="text-[10px] text-gray-500">(imzo)</p>
          </div>
          <div>
            <p className="border-b border-black pb-1 mb-1 font-semibold">{todayDate}</p>
            <p className="text-[10px] text-gray-500">Tasdiqlangan sana</p>
          </div>
        </div>
      </div>
    </>
  );
}
