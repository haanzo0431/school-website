'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md theme-bg-card border theme-border p-8 rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold theme-text-primary mb-2">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs theme-text-secondary">
              {isSignUp
                ? 'Enter your details to register on the platform'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider theme-text-secondary mb-2 font-semibold">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 theme-text-secondary pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@school.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl pl-10 pr-4 py-3 text-sm theme-text-primary placeholder:theme-text-secondary outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider theme-text-secondary mb-2 font-semibold">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 theme-text-secondary pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full theme-bg-input border theme-border rounded-xl pl-10 pr-10 py-3 text-sm theme-text-primary placeholder:theme-text-secondary outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 theme-text-secondary hover:theme-text-primary transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm mt-6 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t theme-border text-center text-xs theme-text-secondary">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"} </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
              }}
              className="text-emerald-500 font-bold hover:underline ml-1 cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}