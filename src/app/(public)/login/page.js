'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import { UserCheck, GraduationCap, Users, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  parent: 'Parent',
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('student'); 
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const rolePrefixes = {
    student: 'S-',
    teacher: 'T-',
    parent: 'P-',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const prefix = rolePrefixes[role];
    let cleanId = loginId.trim();

    if (!cleanId.toUpperCase().startsWith(prefix)) {
      cleanId = `${prefix}${cleanId}`;
    }

    const formattedEmail = `${cleanId.toLowerCase()}@xonqa.school`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password: password,
    });

    if (authError) {
      setError('ID yoki parol noto‘g‘ri kiritildi.');
      setLoading(false);
      return;
    }

    router.push('/platform');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-180px)] px-6 py-12 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md theme-bg-card border theme-border rounded-3xl p-8 shadow-xl">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold mb-2 theme-text-primary">Sign In</h1>
          <p className="text-xs theme-text-secondary">Select your account type to continue</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 theme-bg-page border theme-border rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              role === 'student'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              role === 'teacher'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              role === 'parent'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parent</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono theme-text-secondary mb-2">Login ID</label>
            <input
              type="text"
              required
              placeholder="For Example: 12345"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl theme-bg-page border theme-border theme-text-primary text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono theme-text-secondary mb-2">Password</label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-4 h-4 theme-text-secondary" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-page border theme-border theme-text-primary text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? 'Checking...' : `Sign In as  ${ROLE_LABELS[role]}`}
          </button>
        </form>
      </div>
    </div>
  );
}