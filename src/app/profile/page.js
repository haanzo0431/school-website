'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import { 
  User, 
  Key, 
  Share2, 
  ShieldCheck, 
  Save, 
  Lock, 
  Globe, 
  Sparkles,
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';

// Custom social SVG icons
const GithubIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
export default function ProfilePage() {
  
  // Profile Data States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [role, setRole] = useState('Student'); // Default read-only role
  const [bio, setBio] = useState('');

  // Socials State
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Theme State
  const [theme, setTheme] = useState('night');

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setFirstName(data.first_name || '');
          setSurname(data.surname || '');
          setGradeClass(data.grade_class || '');
          setRole(data.role || 'Student');
          setBio(data.bio || '');
          setGithubUrl(data.github_url || '');
          setLinkedinUrl(data.linkedin_url || '');
          setWebsiteUrl(data.website_url || '');
          setTheme(data.theme || 'night');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          surname: surname,
          grade_class: gradeClass,
          bio: bio,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          website_url: websiteUrl,
          theme: theme,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      localStorage.setItem('app_theme', theme);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change via Supabase Auth
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordStatus({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32 text-neutral-400 font-mono text-sm">
        Loading profile data...
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-16">
        <header className="mb-12 border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-serif font-bold tracking-tight">Account Settings</h1>
              {/* Role / Account Type Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {role}
              </span>
            </div>
            <p className="text-neutral-400 text-base">
              Manage your personal information, public profile, and security preferences.
            </p>
          </div>
        </header>

        {statusMessage.text && (
          <div className={`mb-8 p-4 rounded-xl border text-sm flex items-center gap-3 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-12">
          {/* Section 1: Basic Information */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jasur"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Surname</label>
                <input 
                  type="text" 
                  value={surname} 
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. Karimov"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Class / Grade</label>
                <input 
                  type="text" 
                  value={gradeClass} 
                  onChange={(e) => setGradeClass(e.target.value)}
                  placeholder="e.g. 10-A"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Account Role</label>
                <input 
                  type="text" 
                  value={role} 
                  disabled 
                  className="w-full bg-neutral-950/50 border border-neutral-800/60 rounded-xl px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bio / About Me */}
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Bio / About Me</label>
              <textarea 
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro, your favorite subjects, or personal goals..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </section>

          {/* Section 2: Social Links */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold">Linked Accounts & Socials</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">GitHub Profile</label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 absolute left-4 top-3.5 text-neutral-500" />
                  <input 
                    type="url" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">LinkedIn Profile</label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 absolute left-4 top-3.5 text-neutral-500" />
                  <input 
                    type="url" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Personal Portfolio / Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-4 top-3.5 text-neutral-500" />
                  <input 
                    type="url" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Profile Button */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-500 text-black font-semibold px-6 py-3 rounded-full hover:bg-emerald-400 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Section 3: Security & Password Update */}
        <section className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
            <Key className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-serif font-bold">Change Password</h2>
          </div>

          {passwordStatus.text && (
            <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
              passwordStatus.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {passwordStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{passwordStatus.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-neutral-500" />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-neutral-500" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={updatingPassword || !newPassword}
                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-950 font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-300 transition disabled:opacity-50 text-sm"
              >
                <Key className="w-4 h-4" />
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}