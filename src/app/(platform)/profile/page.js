'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, LayoutDashboard, LogOut, Check, Sun, Moon, 
  Sparkles, Globe, User, MessageSquare, Send, CheckCircle2,
  ShieldLock, Camera, Loader2, AlertCircle, GraduationCap, Calendar
} from 'lucide-react';
import { supabase } from '@/app/supabase';
import { useUser } from '@/app/context/UserContext';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { user, profile, role: contextRole, loading: userLoading, refreshUser } = useUser();

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Feedback state
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState('School Proposal / Suggestion');
  const [contactInfo, setContactInfo] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Preferences
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-theme') || 'dark';
    }
    return 'dark';
  });
  const [language, setLanguage] = useState('uz');

  // Authoritative identity values derived from profile
  const userId = user?.id;
  const role = contextRole || profile?.role || 'student';
  const firstName = profile?.first_name || profile?.name || '';
  const surname = profile?.surname || '';
  const userClass = profile?.class || profile?.grade || '';
  const age = profile?.age ? String(profile.age) : '';
  const currentAvatar = avatarUrl || profile?.avatar_url || profile?.photo_url || '';
  const initialLetter = firstName ? firstName.charAt(0).toUpperCase() : 'S';
  const fullName = [firstName, surname].filter(Boolean).join(' ') || 'Anonymous User';

  const applyTheme = (themeName) => {
    const validTheme = themeName || 'dark';
    document.documentElement.setAttribute('data-theme', validTheme);
    localStorage.setItem('app-theme', validTheme);
  };

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const activeTheme = localStorage.getItem('app-theme') || profile?.theme || 'dark';
    applyTheme(activeTheme);
  }, [user, profile, userLoading, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshUser();
      setMessage('Profile picture updated successfully!');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError(err.message || 'Failed to upload image.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleThemeSelect = async (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);

    if (userId) {
      await supabase
        .from('profiles')
        .upsert({ id: userId, theme: newTheme, updated_at: new Date().toISOString() });
      await refreshUser();
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
          theme,
          language,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      applyTheme(theme);
      await refreshUser();
      setMessage('Preferences saved successfully!');
    } catch (err) {
      setMessage('Failed to save preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!userId || !feedbackMessage.trim()) return;
    setSubmittingFeedback(true);

    try {
      const { error: dbError } = await supabase.from('feedback').insert([
        {
          user_id: userId,
          full_name: fullName,
          role: role,
          class: userClass,
          age: age ? parseInt(age, 10) : null,
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
          userClass,
          age,
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

  if (userLoading) {
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
            Manage your avatar picture, preferences, and active session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border hover:border-emerald-500/50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-500" /> Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Profile Picture Card */}
      <div className="p-6 md:p-8 theme-bg-card border theme-border rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden theme-bg-page border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-bold font-serif text-emerald-500 shadow-md">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>

          <button
            type="button"
            disabled={uploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
          >
            {uploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-serif font-bold">
              {fullName !== 'Anonymous User' ? fullName : 'School Member'}
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {role}
            </span>
          </div>
          <p className="text-xs theme-text-secondary">
            Your profile photo is optional and visible across articles and platform activities.
          </p>
          <button
            type="button"
            disabled={uploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
          </button>
        </div>
      </div>

      {/* Official Identity Record (Locked Fields) */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldLock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-serif font-bold">Official Identity Record</h2>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold">
            <ShieldLock className="w-3 h-3" /> Locked by School
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold theme-text-secondary">First Name</label>
            <div className="relative">
              <input
                type="text"
                value={firstName || 'Not set'}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border opacity-70 cursor-not-allowed select-none font-semibold"
              />
              <ShieldLock className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold theme-text-secondary">Surname</label>
            <div className="relative">
              <input
                type="text"
                value={surname || 'Not set'}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border opacity-70 cursor-not-allowed select-none font-semibold"
              />
              <ShieldLock className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold theme-text-secondary flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> Class / Grade
            </label>
            <div className="relative">
              <input
                type="text"
                value={userClass ? `Class ${userClass}` : 'Unassigned'}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border opacity-70 cursor-not-allowed select-none font-semibold"
              />
              <ShieldLock className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold theme-text-secondary flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Age
            </label>
            <div className="relative">
              <input
                type="text"
                value={age ? `${age} years old` : 'N/A'}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border opacity-70 cursor-not-allowed select-none font-semibold"
              />
              <ShieldLock className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Form (Theme & Language) */}
      <form onSubmit={handleSave} className="space-y-6">
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
              const active = theme === t.id;
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
                onClick={() => setLanguage(lang.id)}
                className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                  language === lang.id
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-md font-bold'
                    : 'theme-bg-page theme-border theme-text-secondary hover:theme-text-primary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}
        {avatarError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {avatarError}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving Changes...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Direct School Feedback & Proposal Box */}
      <div className="p-6 md:p-8 theme-bg-card border theme-border rounded-3xl space-y-6">
        <div className="flex items-center gap-3 border-b theme-border pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold">School Feedback & Suggestion Box</h2>
            <p className="text-xs theme-text-secondary">
              Submit ideas, platform improvements, or feedback directly to school administration.
            </p>
          </div>
        </div>

        {feedbackSent ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-emerald-400">Thank you for your feedback!</h3>
            <p className="text-xs theme-text-secondary">
              Your message was delivered directly to the administration channel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold theme-text-secondary">Topic Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="School Proposal / Suggestion">School Proposal / Suggestion</option>
                  <option value="Bug / Platform Issue">Bug / Technical Issue</option>
                  <option value="Curriculum & Learning Inquiry">Curriculum & Learning</option>
                  <option value="Club Activity Request">Club Activity Request</option>
                  <option value="Other / General Thought">Other / General Thought</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold theme-text-secondary">
                  Contact Info <span className="font-mono text-[10px]">(Optional for follow-up)</span>
                </label>
                <input
                  type="text"
                  placeholder="Telegram @username or phone number"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-secondary">Your Message</label>
              <textarea
                rows={4}
                required
                placeholder="Share your detailed feedback, ideas for the school, or feature suggestions..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500 font-medium leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingFeedback || !feedbackMessage.trim()}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submittingFeedback ? 'Submitting...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}