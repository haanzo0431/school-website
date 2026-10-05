'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, CheckCircle2, Clock, 
  XCircle, Send, Loader2, Sparkles, Building2, 
  BookOpen, Filter, FileText, Check, X, User
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function ClubsPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeRole, setActiveRole] = useState('student'); // Controls which sub-view (for teachers)
  
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Selection states (for testing/selecting as parent/admin)
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyingClub, setApplyingClub] = useState(null);
  const [applicationText, setApplicationText] = useState('');

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states for creating a club
  const [newClub, setNewClub] = useState({
    title: '',
    category: 'STEM & Tech',
    description: '',
    schedule: 'Wednesdays @ 15:30',
    room: 'Lab 101',
  });

  // Effect to load user profile and set initial view role
  useEffect(() => {
    async function loadUserProfile() {
      setProfileLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          // Auto-set the active role based on real user role
          if (profile.role === 'teacher' || profile.role === 'admin') {
            setActiveRole('teacher');
            setSelectedTeacherId(profile.id);
          } else {
            setActiveRole('student');
            setSelectedStudentId(profile.id);
          }
        }
      }
      setProfileLoading(false);
    }
    loadUserProfile();
    loadInitialData(); // Load standard lists
  }, []);

  // Effect to refetch clubs/apps when view, user, or profiles change
  useEffect(() => {
    if (!profileLoading) {
      fetchClubsAndApps();
    }
  }, [profileLoading, activeRole, userProfile]);

  const loadInitialData = async () => {
    try {
      const { data: profileList } = await supabase
        .from('profiles')
        .select('id, name, surname, email, role');

      if (profileList) {
        const studentList = profileList.filter((p) => p.role === 'student');
        const teacherList = profileList.filter((p) => p.role === 'teacher' || p.role === 'admin');

        setStudents(studentList);
        setTeachers(teacherList);
      }
    } catch (err) {
      console.error('Error loading profiles:', err.message);
    }
  };

const fetchClubsAndApps = async () => {
    setLoading(true);
    try {
      // 1. Fetch raw clubs table
      const { data: clubsData, error: clubsErr } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (clubsErr) throw clubsErr;

      // 2. Fetch raw applications table
      const { data: appsData, error: appsErr } = await supabase
        .from('club_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsErr) throw appsErr;

      // 3. Fetch raw profiles table
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, surname, email');

      // Create lookup maps for client-side joining
      const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));
      const clubsMap = new Map((clubsData || []).map((c) => [c.id, c]));

      // 4. Attach profile and club details manually
      const enrichedClubs = (clubsData || []).map((club) => ({
        ...club,
        profiles: profilesMap.get(club.advisor_id) || null,
      }));

      const enrichedApps = (appsData || []).map((app) => ({
        ...app,
        profiles: profilesMap.get(app.student_id) || null,
        clubs: clubsMap.get(app.club_id) || null,
      }));

      setClubs(enrichedClubs);
      setApplications(enrichedApps);
    } catch (err) {
      console.error('Error fetching clubs/apps:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new club (Teacher Action)
  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClub.title || !newClub.description || !selectedTeacherId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('clubs').insert([
        {
          title: newClub.title,
          category: newClub.category,
          description: newClub.description,
          schedule: newClub.schedule,
          room: newClub.room,
          advisor_id: selectedTeacherId,
        },
      ]);

      if (error) throw error;

      showToast('success', `Club "${newClub.title}" created successfully!`);
      setShowCreateModal(false);
      setNewClub({
        title: '',
        category: 'STEM & Tech',
        description: '',
        schedule: 'Wednesdays @ 15:30',
        room: 'Lab 101',
      });
      fetchClubsAndApps();
    } catch (err) {
      showToast('error', err.message || 'Failed to create club.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit join application (Student Action)
  const handleApplyToClub = async (e) => {
    e.preventDefault();
    if (!applicationText || !applyingClub || !selectedStudentId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('club_applications').upsert(
        [
          {
            club_id: applyingClub.id,
            student_id: selectedStudentId,
            answers: applicationText,
            status: 'pending',
          },
        ],
        { onConflict: 'student_id, club_id' }
      );

      if (error) throw error;

      showToast('success', `Application for ${applyingClub.title} submitted!`);
      setApplyingClub(null);
      setApplicationText('');
      fetchClubsAndApps();
    } catch (err) {
      showToast('error', err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update application status (Teacher Action)
  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const { error } = await supabase
        .from('club_applications')
        .update({ status })
        .eq('id', appId);

      if (error) throw error;

      showToast('success', `Application updated to ${status}.`);
      fetchClubsAndApps();
    } catch (err) {
      showToast('error', 'Failed to update application status.');
    }
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Filters
  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isTeacherOrAdmin = userProfile?.role === 'teacher' || userProfile?.role === 'admin';
  const studentApplications = applications.filter((a) => a.student_id === selectedStudentId);

  // Render a loading state while fetching user profile
  if (profileLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center h-screen theme-text-secondary gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-mono">Loading your platform profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Users className="w-3.5 h-3.5" /> Extracurricular Activities
          </div>
          <h1 className="text-3xl font-serif font-bold">School Clubs & Societies</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Join student-led clubs, build projects, or launch a new club as an advisor.
          </p>
        </div>

        {/* Dynamic Controls - ONLY shown to Teachers/Admins */}
        {isTeacherOrAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-neutral-900 border theme-border p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setActiveRole('student')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'student' ? 'bg-emerald-500 text-black font-bold' : 'theme-text-secondary'
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => setActiveRole('teacher')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'teacher' ? 'bg-emerald-500 text-black font-bold' : 'theme-text-secondary'
                }`}
              >
                Teacher Admin
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Club</span>
            </button>
          </div>
        )}
      </div>

      {/* TEACHER ADMIN: APPLICATION REVIEW PANEL - Exclusive to teachers in teacher view */}
      {isTeacherOrAdmin && activeRole === 'teacher' && (
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Club Join Requests ({applications.length})
            </h2>
            <span className="text-xs font-mono theme-text-secondary">Google Forms Style Submissions</span>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs font-mono theme-text-secondary py-6 text-center">
              No student applications submitted yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              {/* ... The application review table from the previous turn ... */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Applied Club</th>
                    <th className="py-3 px-4">Motivation / Form Answer</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {applications.map((app) => {
                    const studentName = app.profiles
                      ? `${app.profiles.name || ''} ${app.profiles.surname || ''}`.trim()
                      : 'Student';

                    return (
                      <tr key={app.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold">
                          <div>{studentName}</div>
                          <div className="text-[10px] font-mono theme-text-secondary">{app.profiles?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-medium">
                          {app.clubs?.title || 'Unknown Club'}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate theme-text-secondary italic">
                          "{app.answers}"
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {app.status === 'approved' && (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Approved</span>
                          )}
                          {app.status === 'rejected' && (
                            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Rejected</span>
                          )}
                          {app.status === 'pending' && (
                            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Pending</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-black transition-all"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STUDENT: APPLICATION TRACKER - Shown in student view */}
      {activeRole === 'student' && studentApplications.length > 0 && (
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4 animate-in fade-in">
          <h2 className="text-sm font-serif font-bold text-emerald-400 flex items-center gap-2">
            <User className="w-4 h-4" /> Your Submitted Applications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentApplications.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl border theme-border theme-bg-page flex items-center justify-between text-xs hover:border-emerald-500/30 transition-all">
                <div>
                  <p className="font-bold">{app.clubs?.title}</p>
                  <p className="text-[10px] theme-text-secondary truncate max-w-[180px]">"{app.answers}"</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-mono capitalize border ${
                  app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area (Filters, Clubs Grid) shown to everyone */}
      {/* ... (The rest of the code is identical to previous, but only allows view changes for teachers) ... */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {['All', 'STEM & Tech', 'Arts & Media', 'Academics', 'Sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                  : 'theme-bg-card theme-border theme-text-secondary hover:border-emerald-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 theme-text-secondary" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          Loading club catalog from database...
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="p-16 text-center border theme-border rounded-3xl theme-bg-card text-xs font-mono theme-text-secondary space-y-2">
          <p>No clubs found matching your criteria.</p>
          {isTeacherOrAdmin && <p className="text-emerald-400">Click "Create New Club" above to add one!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const advisorName = club.profiles 
              ? `${club.profiles.name || ''} ${club.profiles.surname || ''}`.trim() 
              : 'Staff Advisor';

            const userApp = studentApplications.find((a) => a.club_id === club.id);

            return (
              <div
                key={club.id}
                className="p-6 theme-bg-card border theme-border rounded-3xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-5 group animate-in fade-in"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      {club.category}
                    </span>
                    <span className="text-[10px] font-mono theme-text-secondary">{club.room}</span>
                  </div>

                  <h3 className="text-lg font-serif font-bold group-hover:text-emerald-400 transition-colors">
                    {club.title}
                  </h3>

                  <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3">
                    {club.description}
                  </p>
                </div>

                <div className="pt-4 border-t theme-border space-y-3">
                  <div className="text-[11px] font-mono theme-text-secondary space-y-1">
                    <p>Advisor: <span className="text-white">{advisorName}</span></p>
                    <p>Schedule: <span className="text-white">{club.schedule}</span></p>
                  </div>

                  {/* Student Apply Button - Shown in Student View, hidden for current teachers */}
                  {activeRole === 'student' && userProfile?.id !== club.advisor_id && (
                    <button
                      onClick={() => setApplyingClub(club)}
                      disabled={!!userApp}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        userApp
                          ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border theme-border'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{userApp ? `Applied (${userApp.status})` : 'Apply to Join'}</span>
                    </button>
                  )}
                  {userProfile?.id === club.advisor_id && (
                    <div className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Advisor View
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CLUB MODAL (TEACHER-ONLY) */}
      {isTeacherOrAdmin && showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 theme-bg-card border theme-border rounded-3xl max-w-lg w-full space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b theme-border pb-4">
              <h2 className="text-lg font-serif font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Create New School Club
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono theme-text-secondary mb-1">Club Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics & Innovation Lab"
                  value={newClub.title}
                  onChange={(e) => setNewClub({ ...newClub, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono theme-text-secondary mb-1">Category</label>
                  <select
                    value={newClub.category}
                    onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                  >
                    <option value="STEM & Tech">STEM & Tech</option>
                    <option value="Arts & Media">Arts & Media</option>
                    <option value="Academics">Academics</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono theme-text-secondary mb-1">Room / Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STEM Workshop"
                    value={newClub.room}
                    onChange={(e) => setNewClub({ ...newClub, room: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono theme-text-secondary mb-1">Meeting Schedule</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fridays @ 15:00"
                  value={newClub.schedule}
                  onChange={(e) => setNewClub({ ...newClub, schedule: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-mono theme-text-secondary mb-1">Club Description & Goal</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the club's activities and targets..."
                  value={newClub.description}
                  onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl theme-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Publish Club</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY TO CLUB MODAL (GOOGLE FORMS STYLE FOR STUDENTS) */}
      {applyingClub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 theme-bg-card border theme-border rounded-3xl max-w-lg w-full space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b theme-border pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-emerald-400">
                  Join Request: {applyingClub.title}
                </h2>
                <p className="text-xs theme-text-secondary font-mono mt-0.5">Club Application Form</p>
              </div>
              <button
                onClick={() => setApplyingClub(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyToClub} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono theme-text-secondary mb-2">
                  Why do you want to join this club? (State your goals and prior experience)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. I am interested in web development and would like to build real software projects with the team..."
                  value={applicationText}
                  onChange={(e) => setApplicationText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t theme-border">
                <button
               type="button"
                  onClick={() => setApplyingClub(null)}
                  className="px-4 py-2.5 rounded-xl theme-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}