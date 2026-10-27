'use client';

import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, ShieldAlert, Key, User, BookOpen, Users } from 'lucide-react';

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

// Ommaviy yaratish ro'yxati
const BULK_CLASS = '10-A';
const BULK_STUDENTS = [
  { firstName: 'Muhiddin', surname: 'Jumanazarov', password: 'Muhiddin4827' },
  { firstName: 'Azizbek', surname: 'Baxtiyorov', password: 'Azizbek5139' },
  { firstName: 'Ibrohim', surname: 'Ilhomov', password: 'Ibrohim7264' },
  { firstName: 'Jahongir', surname: 'Egamberdiyev', password: 'Jahongir8416' },
  { firstName: 'Elbek', surname: 'Davletov', password: 'Elbek2953' },
  { firstName: 'Bunyot', surname: 'Ismoilov', password: 'Bunyot6071' },
  { firstName: 'Aminboy', surname: 'Allaquliyev', password: 'Aminboy9348' },
];
const STUDENT_LOGINS = [
  'jumanazarov_muhiddin', 'baxtiyorov_azizbek', 'ilhomov_ibrohim',
  'egamberdiyev_jahongir', 'davletov_elbek', 'ismoilov_bunyot', 'allaquliyev_aminboy',
];

const TEACHERS = [
  { loginId: 'matematika', subject: 'Matematika', password: 'Matematika4821' },
  { loginId: 'fizika', subject: 'Fizika', password: 'Fizika5937' },
  { loginId: 'onatili', subject: 'Ona tili', password: 'OnaTili6143' },
  { loginId: 'tarix', subject: 'Tarix', password: 'Tarix7259' },
  { loginId: 'informatika', subject: 'Informatika', password: 'Informatika8364' },
  { loginId: 'inglizTili', subject: 'Ingliz tili', password: 'Ingliz9472' },
  { loginId: 'chqbt', subject: 'CHQBT', password: 'Chqbt3586' },
  { loginId: 'jismoniy', subject: 'Jismoniy tarbiya', password: 'Jismoniy2695' },
  { loginId: 'tarbiya', subject: 'Tarbiya', password: 'Tarbiya4718' },
  { loginId: 'rustili', subject: 'Rus tili', password: 'RusTili5829' },
];

const PARENTS = [
  { child: 'jumanazarov_muhiddin', first: 'Muhiddin', last: 'Jumanazarov', password: 'ParentMuhiddin3517' },
  { child: 'baxtiyorov_azizbek', first: 'Azizbek', last: 'Baxtiyorov', password: 'ParentAzizbek4628' },
  { child: 'ilhomov_ibrohim', first: 'Ibrohim', last: 'Ilhomov', password: 'ParentIbrohim5739' },
  { child: 'egamberdiyev_jahongir', first: 'Jahongir', last: 'Egamberdiyev', password: 'ParentJahongir6841' },
  { child: 'davletov_elbek', first: 'Elbek', last: 'Davletov', password: 'ParentElbek7952' },
  { child: 'ismoilov_bunyot', first: 'Bunyot', last: 'Ismoilov', password: 'ParentBunyot8163' },
  { child: 'allaquliyev_aminboy', first: 'Aminboy', last: 'Allaquliyev', password: 'ParentAminboy9274' },
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

  const callStaff = async (body, label) => {
    try {
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      await callStaff({
        kind: 'teacher', loginId: t.loginId, password: t.password,
        firstName: t.subject, surname: "o'qituvchisi",
        subject: t.subject, gradeClass: '10-A', students: STUDENT_LOGINS,
      }, `Ustoz ${t.subject}`);
    }
    for (const p of PARENTS) {
      await callStaff({
        kind: 'parent', loginId: `${p.last}_${p.first}`.toLowerCase(), password: p.password,
        firstName: 'Ota-ona', surname: p.last, childLogin: p.child,
      }, `Ota-ona ${p.last} ${p.first}`);
    }
    setStaffRunning(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create student.');

      setMessage({ type: 'success', text: `Account created! Login ID: ${data.user.email}` });
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

    for (const s of BULK_STUDENTS) {
      const loginId = `${s.surname}_${s.firstName}`.toLowerCase();
      let result;
      try {
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: s.firstName,
            surname: s.surname,
            gradeClass: BULK_CLASS,
            age: '',
            studentId: loginId,
            password: s.password,
            teacherId: '',
            parentId: '',
          }),
        });
        const data = await res.json();
        result = res.ok
          ? { ok: true, text: `${s.surname} ${s.firstName}: ${loginId} / ${s.password}` }
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

      {/* Bitta o'quvchi formasi */}
      <form onSubmit={handleCreateStudent} className="theme-bg-card border theme-border p-6 md:p-8 rounded-3xl space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelBase}>First Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="firstName" required placeholder="Jasur"
                value={formData.firstName} onChange={handleChange}
                className={`${inputBase} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelBase}>Surname</label>
            <input type="text" name="surname" required placeholder="Rahimov"
              value={formData.surname} onChange={handleChange} className={inputBase} />
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
            <label className={labelBase}>Initial Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input type="text" name="password" required placeholder="student123"
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