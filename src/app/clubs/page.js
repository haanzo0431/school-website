'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Users, Plus, Check, UserPlus, Sparkles } from 'lucide-react';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');

  useEffect(() => {
    fetchUserDataAndClubs();
  }, []);

  const fetchUserDataAndClubs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    setCurrentUser(user);

    if (user) {
      const { data: memberData } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      setUserMemberships((memberData || []).map((m) => m.club_id));
    }

    const { data: clubsData } = await supabase
      .from('clubs')
      .select('*, club_members(count)')
      .order('created_at', { ascending: false });

    setClubs(clubsData || []);
    setLoading(false);
  };

  const handleToggleJoin = async (clubId) => {
    if (!currentUser) {
      alert('Please sign in to join clubs!');
      return;
    }

    const isMember = userMemberships.includes(clubId);

    if (isMember) {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', currentUser.id);

      if (!error) {
        setUserMemberships(userMemberships.filter((id) => id !== clubId));
        fetchUserDataAndClubs();
      }
    } else {
      const { error } = await supabase
        .from('club_members')
        .insert([{ club_id: clubId, user_id: currentUser.id }]);

      if (!error) {
        setUserMemberships([...userMemberships, clubId]);
        fetchUserDataAndClubs();
      }
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    const { error } = await supabase.from('clubs').insert([
      { title, description, category, teacher_id: currentUser.id },
    ]);

    if (!error) {
      setTitle('');
      setDescription('');
      setShowModal(false);
      fetchUserDataAndClubs();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Student Communities
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">School Clubs</h1>
            <p className="text-xs md:text-sm theme-text-secondary mt-1">
              Join active student organizations or start your own initiative.
            </p>
          </div>

          {!loading && currentUser && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Club
            </button>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20 font-mono text-xs theme-text-secondary">Loading...</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20 border theme-border rounded-2xl theme-bg-card">
            <Users className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-50" />
            <p className="theme-text-primary font-serif font-bold text-base mb-1">No Clubs Active Yet</p>
            <p className="text-xs theme-text-secondary">Be the first to create an official school club!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const memberCount = club.club_members?.[0]?.count || 0;
              const isJoined = userMemberships.includes(club.id);

              return (
                <div key={club.id} className="theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-mono px-3 py-1 rounded-full border border-emerald-500/20 uppercase font-semibold">
                        {club.category}
                      </span>
                      <span className="text-xs font-mono theme-text-secondary flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold theme-text-primary mb-2">{club.title}</h3>
                    <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3 mb-6">
                      {club.description || 'No description.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleJoin(club.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isJoined
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                    }`}
                  >
                    {isJoined ? <><Check className="w-4 h-4" /> Joined</> : <><UserPlus className="w-4 h-4" /> Join Club</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="theme-bg-card border theme-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-serif font-bold theme-text-primary mb-4">Create Club</h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500">
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs theme-text-secondary cursor-pointer">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}