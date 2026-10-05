'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Clock, MapPin, Search, Loader2, 
  CheckCircle2, XCircle, AlertCircle, UserX, FolderOpen
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Fetch real teacher classes from Supabase
  useEffect(() => {
    async function fetchTeacherClasses() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (!user) {
          setClasses([]);
          setLoading(false);
          return;
        }

        // Fetch classes assigned to this teacher, or all real classes in DB
        let { data: teacherClasses, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

        if (error || !teacherClasses || teacherClasses.length === 0) {
          // If no specific teacher_id match, fetch all real classes from DB
          const { data: allClasses } = await supabase
            .from('classes')
            .select('*');
          teacherClasses = allClasses || [];
        }

        setClasses(teacherClasses);
        if (teacherClasses.length > 0) {
          setSelectedClass(teacherClasses[0]);
        }
      } catch (err) {
        console.error('Error fetching classes from Supabase:', err.message);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacherClasses();
  }, []);

  // 2. Fetch real student roster for selected class from Supabase
  useEffect(() => {
    if (!selectedClass) {
      setRoster([]);
      return;
    }

    async function fetchClassRoster() {
      setRosterLoading(true);
      try {
        // Query real registered profiles with role 'student' matching class_name
        const { data: studentProfiles, error: studentErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .eq('class_name', selectedClass.name);

        if (studentErr) throw studentErr;

        // Query real grades for this subject
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*')
          .eq('subject_name', selectedClass.subject_name);

        if (studentProfiles && studentProfiles.length > 0) {
          const enrichedRoster = studentProfiles.map((student) => {
            const studentGrade = gradesData?.find((g) => g.student_id === student.id);
            
            let avgGrade = 'N/A';
            if (studentGrade) {
              const scores = [studentGrade.q1, studentGrade.q2, studentGrade.exam].filter(
                (val) => typeof val === 'number'
              );
              if (scores.length > 0) {
                avgGrade = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
              }
            }

            const fullName = `${student.name || ''} ${student.surname || ''}`.trim();

            return {
              id: student.id,
              name: fullName.length > 0 ? fullName : (student.email || 'Registered Student'),
              email: student.email,
              attendanceRate: student.attendance_rate || '100%',
              currentGrade: avgGrade,
              status: student.today_status || 'Present',
            };
          });

          setRoster(enrichedRoster);
        } else {
          setRoster([]);
        }
      } catch (err) {
        console.error('Error fetching roster from Supabase:', err.message);
        setRoster([]);
      } finally {
        setRosterLoading(false);
      }
    }

    fetchClassRoster();
  }, [selectedClass]);

  const filteredRoster = roster.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classAvg = roster.length > 0
    ? (roster.reduce((acc, s) => acc + (s.currentGrade !== 'N/A' ? parseFloat(s.currentGrade) : 0), 0) / roster.length).toFixed(1)
    : 'N/A';

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        Connecting to Supabase database...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-2 border border-emerald-500/20 font-mono">
          FACULTY CONSOLE
        </span>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">My Assigned Classes</h1>
        <p className="text-xs theme-text-secondary mt-1">
          Connected to Supabase live environment.
        </p>
      </div>

      {/* No Classes in Database Empty State */}
      {classes.length === 0 ? (
        <div className="p-12 theme-bg-card border theme-border rounded-3xl text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-emerald-400 mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white">No Real Classes Found in Supabase</h3>
          <p className="text-xs theme-text-secondary max-w-md mx-auto">
            There are no class records in the <code className="text-emerald-400 font-mono">classes</code> table assigned to your user account (<span className="text-white">{currentUser?.email || 'Logged User'}</span>).
          </p>
        </div>
      ) : (
        <>
          {/* Real Class Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'theme-bg-card border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      isSelected ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-emerald-400'
                    }`}>
                      {cls.name}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-4">{cls.subject_name}</h3>

                  <div className="space-y-1.5 text-xs theme-text-secondary font-mono">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cls.schedule || 'Schedule Not Set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cls.room || 'Room Not Set'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roster Section for Selected Class */}
          {selectedClass && (
            <div className="p-6 md:p-8 theme-bg-card border theme-border rounded-3xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    {selectedClass.name} Student Roster
                  </h2>
                  <p className="text-xs font-mono theme-text-secondary mt-1">
                    Subject: <span className="text-white">{selectedClass.subject_name}</span> | Class Avg: <span className="text-emerald-400 font-bold">{classAvg}</span>
                  </p>
                </div>

                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search real students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {rosterLoading ? (
                <div className="py-12 text-center text-xs font-mono theme-text-secondary flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  Fetching accounts from Supabase profiles...
                </div>
              ) : roster.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <UserX className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs font-mono text-gray-400">
                    No real student accounts found in Supabase for <span className="text-emerald-400">{selectedClass.name}</span>.
                  </p>
                  <p className="text-[11px] theme-text-secondary">
                    Ensure user rows in <code className="text-white font-mono">profiles</code> table have <code className="text-white font-mono">role = 'student'</code> and <code className="text-white font-mono">class_name = '{selectedClass.name}'</code>.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b theme-border theme-text-secondary font-mono uppercase text-[10px]">
                        <th className="py-3 px-4">Real Student Name</th>
                        <th className="py-3 px-4">Attendance Rate</th>
                        <th className="py-3 px-4">Current Grade</th>
                        <th className="py-3 px-4">Today's Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {filteredRoster.map((student) => (
                        <tr key={student.id} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="py-4 px-4 font-medium text-white flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                              {student.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div>{student.name}</div>
                              <div className="text-[10px] theme-text-secondary font-mono">{student.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono theme-text-secondary">
                            {student.attendanceRate}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold">
                            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {student.currentGrade}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono inline-flex items-center gap-1 ${
                              student.status === 'Present'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {student.status === 'Present' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}