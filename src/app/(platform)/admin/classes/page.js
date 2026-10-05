'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, CheckCircle2, 
  ShieldAlert, UserPlus, BookOpen, AlertCircle, RefreshCw, UserCheck, UserX
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function AdminClassManagementPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  
  const [allProfiles, setAllProfiles] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentToAssign, setSelectedStudentToAssign] = useState('');

  // Mode for adding students: 'create' or 'assign'
  const [addMode, setAddMode] = useState('create'); 

  // Form state for creating a new student inline
  const [newStudentFirstName, setNewStudentFirstName] = useState('');
  const [newStudentLastName, setNewStudentLastName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Helper to strictly identify student accounts only
  const isStudentProfile = (p) => {
    if (!p) return false;

    const role = (p.role || '').toLowerCase().trim();
    const email = (p.email || '').toLowerCase().trim();
    const name = (p.name || p.first_name || '').toLowerCase().trim();

    // Explicitly reject admins, teachers, and parents
    if (['admin', 'teacher', 'parent', 'staff'].includes(role)) return false;
    if (email.startsWith('admin') || email.startsWith('t-') || email.startsWith('p-')) return false;
    if (name.startsWith('admin') || name.startsWith('t-') || name.startsWith('p ')) return false;

    // Explicitly accept student roles or student email patterns
    if (role === 'student') return true;
    if (email.startsWith('s-') || email.startsWith('s.') || email.includes('student') || name.includes('student')) return true;

    return false;
  };

  // Clean class name helper ("Class 10-A" -> "10-A")
  const cleanName = (name) => {
    if (!name) return '';
    return name.toString().replace(/^class\s+/i, '').trim();
  };

  // Helper to format/auto-generate school email
  const formatStudentEmail = (firstName, lastName, customInput) => {
    let raw = (customInput || '').trim().toLowerCase();

    if (!raw) {
      const f = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const l = lastName ? lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      const handle = l ? `${f}.${l}` : f;
      return `s-${handle}@xonqa.school`;
    }

    if (!raw.includes('@')) {
      if (!raw.startsWith('s-')) raw = `s-${raw}`;
      return `${raw}@xonqa.school`;
    }

    return raw;
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && allProfiles.length >= 0) {
      filterRosterForClass(selectedClass, allProfiles);
    }
  }, [selectedClass, allProfiles]);

  async function fetchInitialData() {
    try {
      setLoading(true);

      const { data: classList } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });

      const { data: profilesData, error: profErr } = await supabase
        .from('profiles')
        .select('*');

      if (profErr) {
        console.error('Error loading profiles:', profErr);
      }

      const profiles = profilesData || [];
      setAllProfiles(profiles);

      // Strict filter for students only in dropdowns
      const studentProfiles = profiles.filter(isStudentProfile);
      setAvailableStudents(studentProfiles);

      if (classList && classList.length > 0) {
        setClasses(classList);
        setSelectedClass((prev) => prev || classList[0]);
      }
    } catch (err) {
      console.error('Error fetching admin class data:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterRosterForClass(cls, profiles) {
    if (!cls) return;

    const targetId = cls.id;
    const targetClean = cleanName(cls.name).toLowerCase();

    const enrolled = profiles.filter((p) => {
      // Must be a student profile
      if (!isStudentProfile(p)) return false;

      // Match by class_id
      if (p.class_id && p.class_id === targetId) return true;

      // Match by class string ("10-A", "Class 10-A", etc.)
      if (p.class) {
        return cleanName(p.class).toLowerCase() === targetClean;
      }

      return false;
    });

    setClassStudents(enrolled);
  }

  // Admin: Create a new class
  async function handleCreateClass(e) {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setSaving(true);
    const formattedName = cleanName(newClassName.trim().toUpperCase());

    const { data, error } = await supabase
      .from('classes')
      .insert([{ name: formattedName }])
      .select()
      .single();

    if (error) {
      setMessage({ type: 'error', text: 'Class already exists or database insertion failed.' });
    } else if (data) {
      setClasses([...classes, data]);
      setSelectedClass(data);
      setNewClassName('');
      setMessage({ type: 'success', text: `Class ${formattedName} created successfully!` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3500);
  }

  // Admin: Delete a class
  async function handleDeleteClass(classId, className) {
    const cleaned = cleanName(className);
    if (!confirm(`Are you sure you want to delete Class ${cleaned}? Students in this class will become unassigned.`)) {
      return;
    }

    setSaving(true);
    await supabase.from('classes').delete().eq('id', classId);

    const updatedList = classes.filter((c) => c.id !== classId);
    setClasses(updatedList);
    setSelectedClass(updatedList.length > 0 ? updatedList[0] : null);
    setMessage({ type: 'success', text: `Class ${cleaned} deleted.` });

    await fetchInitialData();
    setSaving(false);
    setTimeout(() => setMessage(null), 3500);
  }

  async function handleCreateNewStudent(e) {
    e.preventDefault();
    if (!newStudentFirstName.trim() || !selectedClass) return;

    setSaving(true);
    const formattedEmail = formatStudentEmail(newStudentFirstName, newStudentLastName, newStudentEmail);
    const finalPassword = newStudentPassword.trim() || 'student123';
    const cleanedClassName = cleanName(selectedClass.name);

    try {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newStudentFirstName.trim(),
          lastName: newStudentLastName.trim(),
          age: newStudentAge,
          email: formattedEmail,
          password: finalPassword,
          className: cleanedClassName,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setMessage({ 
        type: 'success', 
        text: `Account created! Email: ${formattedEmail} | Password: ${finalPassword}` 
      });
      setNewStudentFirstName('');
      setNewStudentLastName('');
      setNewStudentAge('');
      setNewStudentEmail('');
      setNewStudentPassword('');
      
      await fetchInitialData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed: ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  // Assign an existing student profile to the selected class
  async function handleAssignExistingStudent() {
    if (!selectedStudentToAssign || !selectedClass) return;

    setSaving(true);
    const cleanedClassName = cleanName(selectedClass.name);

    // Attempt updating both class and class_id
    let { error } = await supabase
      .from('profiles')
      .update({ 
        class: cleanedClassName,
        class_id: selectedClass.id,
        role: 'student'
      })
      .eq('id', selectedStudentToAssign);

    // Fallback if class_id column does not exist in schema
    if (error && error.message?.includes('class_id')) {
      const fallback = await supabase
        .from('profiles')
        .update({ 
          class: cleanedClassName,
          role: 'student'
        })
        .eq('id', selectedStudentToAssign);
      error = fallback.error;
    }

    if (!error) {
      setMessage({ type: 'success', text: `Student assigned to Class ${cleanedClassName}!` });
      setSelectedStudentToAssign('');
      await fetchInitialData();
    } else {
      console.error('Assign Error:', error);
      setMessage({ type: 'error', text: `Failed to assign student: ${error.message || 'Permission denied'}` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  }

  // Remove/Unassign student from class
  async function handleRemoveFromClass(studentId, studentName) {
    if (!confirm(`Are you sure you want to remove ${studentName || 'this student'} from Class ${cleanName(selectedClass?.name)}?`)) {
      return;
    }

    setSaving(true);

    // Attempt clearing both class and class_id
    let { error } = await supabase
      .from('profiles')
      .update({ 
        class: null, 
        class_id: null 
      })
      .eq('id', studentId);

    // Fallback if class_id column does not exist
    if (error && error.message?.includes('class_id')) {
      const fallback = await supabase
        .from('profiles')
        .update({ class: null })
        .eq('id', studentId);
      error = fallback.error;
    }

    if (!error) {
      setMessage({ type: 'success', text: 'Student removed from class.' });
      await fetchInitialData();
    } else {
      console.error('Remove Error:', error);
      setMessage({ type: 'error', text: `Failed to remove student: ${error.message || 'Permission denied'}` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-xs font-mono theme-text-secondary flex items-center justify-center gap-2 min-h-[50vh]">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
        Loading Admin Class Control Panel...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Administrative Hub
          </div>
          <h1 className="text-3xl font-serif font-bold">Class & Student Roster Manager</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Create classes and register or assign student accounts in bulk.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2 ${
          message.type === 'error' 
            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create & Select Class */}
        <div className="space-y-6">
          {/* New Class Form */}
          <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
            <h2 className="font-serif font-bold text-lg flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Create New Class
            </h2>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono theme-text-secondary uppercase tracking-wider block mb-1">
                  Class Name / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10-A, 9-B, 11-C"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newClassName.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all disabled:opacity-50"
              >
                {saving ? 'Creating...' : '+ Add Class'}
              </button>
            </form>
          </div>

          {/* Class List Selector */}
          <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-3">
            <h3 className="text-xs font-mono theme-text-secondary uppercase tracking-wider mb-2">
              Select Class Roster ({classes.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {classes.map((cls) => {
                const displayName = cleanName(cls.name);
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono transition-all ${
                      selectedClass?.id === cls.id
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold'
                        : 'theme-bg-page border theme-border theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      Class {displayName}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id, cls.name);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 text-xs theme-text-secondary transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Class View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedClass ? (
            <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b theme-border pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Class {cleanName(selectedClass.name)} Roster
                  </h2>
                  <p className="text-xs theme-text-secondary mt-0.5">
                    {classStudents.length} student(s) currently assigned.
                  </p>
                </div>
              </div>

              {/* Mode Toggle Bar: Create vs Assign */}
              <div className="p-4 rounded-2xl theme-bg-page border theme-border space-y-4">
                <div className="flex items-center gap-2 border-b theme-border pb-3">
                  <button
                    type="button"
                    onClick={() => setAddMode('create')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                      addMode === 'create'
                        ? 'bg-emerald-500 text-black font-semibold'
                        : 'theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Create New Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode('assign')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                      addMode === 'assign'
                        ? 'bg-emerald-500 text-black font-semibold'
                        : 'theme-text-secondary hover:theme-text-primary'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign Existing Student
                  </button>
                </div>

                {/* Option 1: Create New Student directly into this Class */}
                {addMode === 'create' && (
                  <form onSubmit={handleCreateNewStudent} className="space-y-3">
                    <span className="text-[10px] font-mono theme-text-secondary uppercase tracking-wider block">
                      Register Student Directly into Class {cleanName(selectedClass.name)}
                    </span>

                    {/* Name & Age Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="First Name *"
                        required
                        value={newStudentFirstName}
                        onChange={(e) => setNewStudentFirstName(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newStudentLastName}
                        onChange={(e) => setNewStudentLastName(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        placeholder="Age (e.g. 15)"
                        value={newStudentAge}
                        onChange={(e) => setNewStudentAge(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Email & Password Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Email / Code (e.g. student2 or leave empty)"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Password (Default: student123)"
                        value={newStudentPassword}
                        onChange={(e) => setNewStudentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving || !newStudentFirstName.trim()}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" /> Create Student Account
                    </button>

                    <p className="text-[10px] theme-text-secondary font-mono italic">
                      Tip: Leaving email blank auto-generates <strong>s-firstname.lastname@xonqa.school</strong>. Leaving password blank sets it to <strong>student123</strong>.
                    </p>
                  </form>
                )}

                {/* Option 2: Choose existing student from dropdown */}
                {addMode === 'assign' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono theme-text-secondary uppercase tracking-wider block">
                      Quick Add Existing Student to Class {cleanName(selectedClass.name)}
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={selectedStudentToAssign}
                        onChange={(e) => setSelectedStudentToAssign(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Choose student profile to add --</option>
                        {availableStudents.map((st) => {
                          const displayName = `${st.name || st.first_name || 'Student'} ${st.surname || st.last_name || ''}`.trim();
                          const currentTag = st.class ? `(Currently: Class ${cleanName(st.class)})` : '(Unassigned)';
                          return (
                            <option key={st.id} value={st.id}>
                              {displayName} ({st.email || 'No email'}) {currentTag}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={handleAssignExistingStudent}
                        disabled={!selectedStudentToAssign || saving}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold whitespace-nowrap transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" /> Add to Class
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Roster List */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono theme-text-secondary uppercase tracking-wider">
                  Enrolled Students
                </h3>

                {classStudents.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl theme-bg-page border theme-border text-xs theme-text-secondary">
                    No students assigned to Class {cleanName(selectedClass.name)} yet. Use the panel above to create or add students.
                  </div>
                ) : (
                  <div className="divide-y theme-border rounded-2xl border theme-border overflow-hidden">
                    {classStudents.map((student) => {
                      const fullName = `${student.name || student.first_name || 'Student'} ${student.surname || student.last_name || ''}`.trim();
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 theme-bg-page hover:theme-bg-card transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {fullName.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-xs font-semibold flex items-center gap-2">
                                {fullName}
                                {student.age && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Age: {student.age}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] theme-text-secondary font-mono">
                                {student.email || 'No email'} | Password: <span className="text-emerald-400">{student.password || 'student123'}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFromClass(student.id, fullName)}
                            className="p-2 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 text-xs theme-text-secondary transition-colors flex items-center gap-1.5 font-mono cursor-pointer border border-transparent hover:border-rose-500/30"
                            title="Remove from class roster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">Remove</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl theme-bg-card border theme-border text-xs theme-text-secondary">
              Select or create a class on the left to start managing its roster.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}