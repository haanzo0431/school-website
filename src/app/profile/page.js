'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Footer from '../components/Footer';
import { User, LogOut, Save, Moon, Sun, Flame, Upload } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [grade, setGrade] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState('night');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Prioritize active localStorage theme first, fallback to DB, then 'night'
      const activeTheme = localStorage.getItem('app-theme') || data?.theme || 'night';
      setTheme(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);

      if (data) {
        setName(data.name || '');
        setSurname(data.surname || '');
        setGrade(data.grade || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app-theme', newTheme);

    // Persist theme to Supabase instantly
    if (user) {
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          theme: newTheme,
          updated_at: new Date().toISOString()
        });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Please upload an image smaller than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          surname,
          grade,
          avatar_url: avatarUrl,
          theme,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen theme-bg-page">
        <p className="theme-text-secondary font-mono text-sm">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen theme-bg-page">
      <main className="flex-1 max-w-4xl w-full mx-auto p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b theme-border">
          <div>
            <h1 className="text-3xl font-serif font-bold theme-text-primary">Account Settings</h1>
            <p className="theme-text-secondary text-sm mt-1">Manage profile information and dashboard appearance.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition text-sm font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Picture Upload Section */}
          <div className="theme-bg-card border theme-border p-6 rounded-2xl flex items-center gap-6 shadow-sm">
            <div className="relative w-20 h-20 rounded-full theme-bg-input border theme-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 theme-text-secondary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold theme-text-primary mb-1">Profile Photo</h3>
              <p className="text-xs theme-text-secondary mb-3">Upload a JPG or PNG photo directly from your device.</p>
              
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border theme-border theme-bg-input theme-text-primary text-xs font-semibold hover:opacity-80 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File from Device
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase theme-text-secondary mb-2">First Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full theme-bg-input border theme-border rounded-lg px-4 py-2.5 text-sm outline-none theme-text-primary focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase theme-text-secondary mb-2">Surname</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full theme-bg-input border theme-border rounded-lg px-4 py-2.5 text-sm outline-none theme-text-primary focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase theme-text-secondary mb-2">Class / Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full theme-bg-input border theme-border rounded-lg px-4 py-2.5 text-sm outline-none theme-text-primary focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Theme Chooser */}
          <div className="theme-bg-card border theme-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold theme-text-primary mb-1">Platform Theme</h3>
            <p className="text-xs theme-text-secondary mb-4">Select a custom layout color scheme.</p>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('night')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  theme === 'night'
                    ? 'border-emerald-500 bg-neutral-900 text-emerald-400'
                    : 'theme-border theme-bg-input theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-semibold">Night</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-slate-200 text-slate-900'
                    : 'theme-border theme-bg-input theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-semibold">Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('warm')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  theme === 'warm'
                    ? 'border-amber-500 bg-stone-800 text-amber-400'
                    : 'theme-border theme-bg-input theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Flame className="w-5 h-5" />
                <span className="text-xs font-semibold">Warm</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}