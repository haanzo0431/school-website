'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, LayoutDashboard, LogOut, Check, Sun, Moon, 
  Sparkles, Globe, User, MessageSquare, Send, CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Feedback state
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState('School Proposal / Suggestion');
  const [contactInfo, setContactInfo] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Form State
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    class: '',
    age: '',
    theme: 'dark',
    language: 'uz',
  });

  const applyTheme = (themeName) => {
    const validTheme = themeName || 'dark';
    document.documentElement.setAttribute('data-theme', validTheme);
    localStorage.setItem('app-theme', validTheme);
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      setUserId(user.id);
      const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Priority: Local storage -> Database theme -> Fallback 'dark'
      const activeTheme = localStorage.getItem('app-theme') || data?.theme || 'dark';

      if (data) {
        setFormData({
          first_name: data.first_name || data.name || '',
          surname: data.surname || '',
          class: data.class || data.grade || '',
          age: data.age ? String(data.age) : '',
          theme: activeTheme,
          language: data.language || 'uz',
        });
      } else {
        setFormData((prev) => ({ ...prev, theme: activeTheme }));
      }

      applyTheme(activeTheme);

      // Role Detection Logic
      let computedRole = data?.role;
      if (emailPrefix.startsWith('t-')) {
        computedRole = 'teacher';
      } else if (emailPrefix.startsWith('p-')) {
        computedRole = 'parent';
      } else if (emailPrefix.startsWith('s-')) {
        computedRole = 'student';
      } else if (!computedRole || computedRole === 'viewer') {
        computedRole = 'student';
      }

      setRole(computedRole);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleThemeSelect = async (newTheme) => {
    setFormData((prev) => ({ ...prev, theme: newTheme }));
    applyTheme(newTheme);

    if (userId) {
      await supabase
        .from('profiles')
        .upsert({ id: userId, theme: newTheme, updated_at: new Date().toISOString() });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: formData.first_name,
          surname: formData.surname,
          class: formData.class,
          age: formData.age ? parseInt(formData.age, 10) : null,
          theme: formData.theme,
          language: formData.language,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      applyTheme(formData.theme);
      setMessage('Profile and preferences updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!userId || !feedbackMessage.trim()) return;
    setSubmittingFeedback(true);

    try {
      const fullName = `${formData.first_name} ${formData.surname}`.trim() || 'Anonymous User';

      const { error: dbError } = await supabase.from('feedback').insert([
        {
          user_id: userId,
          full_name: fullName,
          role: role,
          class: formData.class,
          age: formData.age ? parseInt(formData.age, 10) : null,
          contact_info: contactInfo,
          feedback_type: feedbackType,
          message: feedbackMessage,
        },
      ]);

      if (dbError) throw dbError;

      const telegramRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPlatform: true,
          fullName,
          role,
          userClass: formData.class,
          age: formData.age,
          contactInfo,
          category: feedbackType,
          message: feedbackMessage,
        }),
      });

      if (!telegramRes.ok) {
        throw new Error('Failed to deliver message to Telegram.');
      }

      setFeedbackSent(true);
      setFeedbackMessage('');
      setContactInfo('');
      setTimeout(() => setFeedbackSent(false), 5000);
    } catch (err) {
      alert('Error submitting proposal: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-xs font-mono theme-text-secondary">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="theme-bg-page theme-text-primary p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b theme-border pb-6 gap-4">
        <div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold">Account Settings</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Manage your personal information, active session, and preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border hover:border-emerald-500/50 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" /> Dashboard
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-serif font-bold">Personal Profile</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Jasur"
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">Surname</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                placeholder="e.g. Rahimov"
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">Class / Grade</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g. 10-A"
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 16"
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-serif font-bold">Theme Choice</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'warm', label: 'Warm', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const active = formData.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeSelect(t.id)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md font-bold'
                      : 'theme-bg-page theme-border theme-text-secondary hover:theme-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Preferences */}
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-serif font-bold">Language / Til</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'uz', label: "O'zbekcha (UZ)" },
              { id: 'en', label: 'English (EN)' },
              { id: 'ru', label: 'Русский (RU)' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setFormData({ ...formData, language: lang.id })}
                className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                  formData.language === lang.id
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-md font-bold'
                    : 'theme-bg-page theme-border theme-text-secondary hover:theme-text-primary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-red-400 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out of this device
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Feedback & Proposal Submission Box */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <h2 className="text-base font-serif font-bold">Suggestions, Publishing Requests & Technical Support</h2>
        </div>
        <p className="text-xs theme-text-secondary">
          Submit proposals directly to school leaders (e.g. requesting article publishing access, club ideas, or bug reports).
        </p>

        {feedbackSent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Thank you! Your submission has been received by the administration team.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold theme-text-secondary">Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                >
                  <option value="School Proposal / Suggestion">School Proposal / Suggestion</option>
                  <option value="Article Publishing Request (Literature / News)">Article Publishing Request (Literature / News)</option>
                  <option value="Technical Bug Report">Technical Bug Report</option>
                  <option value="Other Inquiry">Other Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold theme-text-secondary">
                  Contact Info (Telegram @username or Phone)
                </label>
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. @username or +99890..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">Message & Details</label>
              <textarea
                rows={4}
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Explain your proposal, role, or technical problem in detail..."
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingFeedback}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingFeedback ? 'Submitting...' : 'Send Proposal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}