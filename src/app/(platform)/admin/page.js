'use client';

import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, ShieldAlert, Key, User, BookOpen, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/app/supabase';

function generateSecurePassword(prefix = 'User') {
  const cleanPrefix = prefix.replace(/[^a-zA-Z]/g, '') || 'User';
  const cap = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1).toLowerCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  const symbols = '!@#$%*';
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${cap}${digits}${sym}`;
}

const EMPTY_FORM = {
  firstName: '',
  surname: '',
  gradeClass: '10-A',
  age: '',
  studentId: '',
  password: '',
  teacherId: '',
  parentId: '',
};

// Ommaviy yaratish ro'yxati (parollar endi kodda ochiq saqlanmaydi, on-demand generatsiya qilinadi)
const BULK_CLASS = '10-A';
const BULK_STUDENTS = [
  { firstName: 'Muhiddin', surname: 'Jumanazarov' },
  { firstName: 'Azizbek', surname: 'Baxtiyorov' },
  { firstName: 'Ibrohim', surname: 'Ilhomov' },
  { firstName: 'Jahongir', surname: 'Egamberdiyev' },
  { firstName: 'Elbek', surname: 'Davletov' },
  { firstName: 'Bunyot', surname: 'Ismoilov' },
  { firstName: 'Aminboy', surname: 'Allaquliyev' },
];
const STUDENT_LOGINS = [
  'jumanazarov_muhiddin', 'baxtiyorov_azizbek', 'ilhomov_ibrohim',
  'egamberdiyev_jahongir', 'davletov_elbek', 'ismoilov_bunyot', 'allaquliyev_aminboy',
];

const TEACHERS = [
  { loginId: 'matematika', subject: 'Matematika' },
  { loginId: 'fizika', subject: 'Fizika' },
  { loginId: 'onatili', subject: 'Ona tili' },
  { loginId: 'tarix', subject: 'Tarix' },
  { loginId: 'informatika', subject: 'Informatika' },
  { loginId: 'inglizTili', subject: 'Ingliz tili' },
  { loginId: 'chqbt', subject: 'CHQBT' },
  { loginId: 'jismoniy', subject: 'Jismoniy tarbiya' },
  { loginId: 'tarbiya', subject: 'Tarbiya' },
  { loginId: 'rustili', subject: 'Rus tili' },
];

const PARENTS = [
  { child: 'jumanazarov_muhiddin', first: 'Muhiddin', last: 'Jumanazarov' },
  { child: 'baxtiyorov_azizbek', first: 'Azizbek', last: 'Baxtiyorov' },
  { child: 'ilhomov_ibrohim', first: 'Ibrohim', last: 'Ilhomov' },
  { child: 'egamberdiyev_jahongir', first: 'Jahongir', last: 'Egamberdiyev' },
  { child: 'davletov_elbek', first: 'Elbek', last: 'Davletov' },
  { child: 'ismoilov_bunyot', first: 'Bunyot', last: 'Ismoilov' },
  { child: 'allaquliyev_aminboy', first: 'Aminboy', last: 'Allaquliyev' },
];

const inputBase =
  'w-full px-4 py-2.5 rounded-xl text-xs theme-bg-input border theme-border focus:outline-none focus:border-emerald-500';
const labelBase = 'block text-xs font-mono font-bold uppercase theme-text-secondary mb-2';

export default function AdminPage() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [staffRunning, setStaffRunning] = useState(false);
  const [staffResults, setStaffResults] = useState([]);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  };

  const callStaff = async (body, label) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setStaffResults((p) => [...p, { ok: res.ok, text: res.ok ? `${label}: ${body.loginId} / ${body.password}` : `${label}: ${data.error}` }]);
    } catch (e) {
      setStaffResults((p) => [...p, { ok: false, text: `${label}: ${e.message}` }]);
    }
  };

  const handleCreateStaff = async () => {
    if (!confirm('10 ustoz va 7 ota-ona akkaunti yaratiladi. Davom etasizmi?')) return;
    setStaffRunning(true);
    setStaffResults([]);
    for (const t of TEACHERS) {
      const password = generateSecurePassword(t.subject);
      await callStaff({
        kind: 'teacher', loginId: t.loginId, password,
        firstName: t.subject, surname: "o'qituvchisi",
        subject: t.subject, gradeClass: '10-A', students: STUDENT_LOGINS,
      }, `Ustoz ${t.subject}`);
    }
    for (const p of PARENTS) {
      const password = generateSecurePassword(`Parent${p.first}`);
      await callStaff({
        kind: 'parent', loginId: `${p.last}_${p.first}`.toLowerCase(), password,
        firstName: 'Ota-ona', surname: p.last, childLogin: p.child,
      }, `Ota-ona ${p.last} ${p.first}`);
    }
    setStaffRunning(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateFormPassword = () => {
    const pwd = generateSecurePassword(formData.firstName || 'Student');
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const headers = await getAuthHeaders();
      const finalPassword = formData.password.trim() || generateSecurePassword(formData.firstName || 'Student');

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...formData, password: finalPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create student.');

      setMessage({ type: 'success', text: `Account created! Login ID: ${data.user.email} | Parol: ${finalPassword}` });
      setFormData(EMPTY_FORM);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!confirm(`${BULK_STUDENTS.length} ta o'quvchi akkaunti yaratiladi. Davom etasizmi?`)) return;
    setBulkRunning(true);
    setBulkResults([]);

    const headers = await getAuthHeaders();

    for (const s of BULK_STUDENTS) {
      const loginId = `${s.surname}_${s.firstName}`.toLowerCase();
      const password = generateSecurePassword(s.firstName);
      let result;
      try {
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            firstName: s.firstName,
            surname: s.surname,
            gradeClass: BULK_CLASS,
            age: '',
            studentId: loginId,
            password: password,
            teacherId: '',
            parentId: '',
          }),
        });
        const data = await res.json();
        result = res.ok
          ? { ok: true, text: `${s.surname} ${s.firstName}: ${loginId} / ${password}` }
          : { ok: false, text: `${s.surname} ${s.firstName}: ${data.error}` };
      } catch (err) {
        result = { ok: false, text: `${s.surname} ${s.firstName}: ${err.message}` };
      }
      setBulkResults((prev) => [...prev, result]);
    }
    setBulkRunning(false);
  };

  const previewId = (formData.studentId || '10001').toLowerCase().replace(/\s+/g, '');

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto theme-text-primary space-y-8">
      <div className="border-b theme-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold uppercase mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> Admin Console
        </div>
        <h1 className="text-3xl font-serif font-bold">Student Account Provisioner</h1>
        <p className="theme-text-secondary text-sm mt-1">
          Generate official student logins and lock them directly into the school system.
        </p>
      </div>

      {/* Ommaviy yaratish */}
      <div className="theme-bg-card border theme-border p-6 rounded-3xl space-y-4">
        <h2 className="font-serif font-bold text-lg">Ommaviy yaratish ({BULK_STUDENTS.length} ta o'quvchi)</h2>
        <p className="text-xs theme-text-secondary">
          Sinf: {BULK_CLASS}. Login: familiya_ism (kichik harflarda). Student sifatida kiriladi.
        </p>
        <button
          type="button"
          onClick={handleBulkCreate}
          disabled={bulkRunning}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {bulkRunning ? 'Yaratilmoqda...' : `${BULK_STUDENTS.length} ta o'quvchini yaratish`}
        </button>

        {bulkResults.length > 0 && (
          <div className="space-y-2">
            {bulkResults.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border text-xs font-mono ${
                  r.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {r.ok ? 'OK  ' : 'XATO  '}
                {r.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="theme-bg-card border theme-border p-6 rounded-3xl space-y-4">
        <h2 className="font-serif font-bold text-lg">Ustozlar (10) va ota-onalar (7)</h2>
        <p className="text-xs theme-text-secondary">
          Avval o'quvchilar yaratilgan bo'lishi kerak. Har bir ustoz 7 o'quvchiga ulanadi, har bir ota-ona o'z farzandiga.
        </p>
        <button
          type="button"
          onClick={handleCreateStaff}
          disabled={staffRunning}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {staffRunning ? 'Yaratilmoqda...' : 'Ustoz va ota-onalarni yaratish'}
        </button>
        {staffResults.map((r, i) => (
          <div key={i} className={`p-3 rounded-xl border text-xs font-mono ${r.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
            {r.ok ? 'OK  ' : 'XATO  '}{r.text}
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Yakka o'quvchi yaratish formasi */}
      <form onSubmit={handleCreateStudent} className="theme-bg-card border theme-border p-6 rounded-3xl space-y-6">
        <h2 className="font-serif font-bold text-lg">Yakka o'quvchi yaratish</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>First Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="firstName" required placeholder="Ali"
                value={formData.firstName} onChange={handleChange}
                className={`${inputBase} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Surname</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="surname" required placeholder="Valiyev"
                value={formData.surname} onChange={handleChange}
                className={`${inputBase} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Class / Grade</label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="gradeClass" required placeholder="10-A"
                value={formData.gradeClass} onChange={handleChange}
                className={`${inputBase} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Age</label>
            <input type="number" name="age" placeholder="16"
              value={formData.age} onChange={handleChange} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Student ID Number</label>
            <input type="text" name="studentId" required placeholder="10001"
              value={formData.studentId} onChange={handleChange}
              className={`${inputBase} font-mono`} />
            <p className="text-[10px] theme-text-secondary mt-1">
              Login email will be: <span className="text-emerald-400 font-mono">s-{previewId}@xonqa.school</span>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase theme-text-secondary">Initial Password</label>
              <button
                type="button"
                onClick={handleGenerateFormPassword}
                className="text-[10px] font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Auto-generate
              </button>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="password" required placeholder="Click Auto-generate or enter password"
                value={formData.password} onChange={handleChange}
                className={`${inputBase} pl-10 font-mono`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Teacher ID (ixtiyoriy)</label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="teacherId" placeholder="teacher1"
                value={formData.teacherId} onChange={handleChange}
                className={`${inputBase} pl-10 font-mono`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Parent ID (ixtiyoriy)</label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="parentId" placeholder="parent1"
                value={formData.parentId} onChange={handleChange}
                className={`${inputBase} pl-10 font-mono`} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creating Student Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}