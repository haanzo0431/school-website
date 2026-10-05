'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Award, CheckCircle2, 
  XCircle, Clock, AlertCircle, User, BookOpen, 
  Loader2, Sparkles, ShieldCheck
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function StudentProgressPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [gradeRecords, setGradeRecords] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades'); // 'grades' | 'attendance'

  // Fetch list of students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch progress data whenever student selection changes
  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentProgress(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, surname, email, class_name')
        .eq('role', 'student');

      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(data);
        setSelectedStudentId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading students:', err.message);
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId) => {
    setLoading(true);
    try {
      // 1. Fetch student attendance history
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (attErr) throw attErr;

      // 2. Fetch student grade records across all subjects
      const { data: gradeData, error: gradeErr } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId);

      if (gradeErr) throw gradeErr;

      setAttendanceRecords(attData || []);
      setGradeRecords(gradeData || []);
    } catch (err) {
      console.error('Error fetching progress records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Metric calculations
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'absent').length;
  const excusedCount = attendanceRecords.filter((r) => r.status === 'excused').length;

  const attendanceRate = totalAttendance > 0 
    ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) 
    : 100;

  const calculateSubjectAvg = (g) => {
    const scores = [g.q1, g.q2, g.exam].map(Number).filter((n) => !isNaN(n) && n > 0);
    if (scores.length === 0) return '5.0';
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / scores.length).toFixed(1);
  };

  const overallGpa = gradeRecords.length > 0
    ? (
        gradeRecords.reduce((acc, g) => acc + Number(calculateSubjectAvg(g)), 0) /
        gradeRecords.length
      ).toFixed(2)
    : '5.0';

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> Parent & Student Portal
          </div>
          <h1 className="text-3xl font-serif font-bold">Academic Progress Report</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Real-time track record of grades, term scores, and daily school attendance.
          </p>
        </div>

        {/* Student Selector */}
        {students.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono theme-text-secondary">Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.surname} ({st.class_name || '10-A'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          Loading progress metrics from Supabase...
        </div>
      ) : !selectedStudent ? (
        <div className="p-12 text-center text-xs font-mono theme-text-secondary border theme-border rounded-3xl">
          No student profiles found. Add student profiles in Supabase to view report cards.
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 theme-bg-card border theme-border rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-mono theme-text-secondary uppercase">Average GPA</p>
                <p className="text-2xl font-bold font-mono">{overallGpa} <span className="text-xs text-emerald-400 font-normal">/ 5.0</span></p>
              </div>
            </div>

            <div className="p-5 theme-bg-card border theme-border rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-mono theme-text-secondary uppercase">Attendance Rate</p>
                <p className="text-2xl font-bold font-mono">{attendanceRate}%</p>
              </div>
            </div>

            <div className="p-5 theme-bg-card border theme-border rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-mono theme-text-secondary uppercase">Late Arrivals</p>
                <p className="text-2xl font-bold font-mono">{lateCount} <span className="text-xs theme-text-secondary font-normal">days</span></p>
              </div>
            </div>

            <div className="p-5 theme-bg-card border theme-border rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-mono theme-text-secondary uppercase">Unexcused Absences</p>
                <p className="text-2xl font-bold font-mono">{absentCount} <span className="text-xs theme-text-secondary font-normal">days</span></p>
              </div>
            </div>
          </div>

          {/* Tab Controls */}
          <div className="flex border-b theme-border space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('grades')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'grades'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent theme-text-secondary hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject Performance & Grades ({gradeRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'attendance'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent theme-text-secondary hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance History ({attendanceRecords.length})</span>
            </button>
          </div>

          {/* TAB 1: ACADEMIC GRADES */}
          {activeTab === 'grades' && (
            <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-serif font-bold">
                  Official Grade Card: {selectedStudent.name} {selectedStudent.surname}
                </h2>
                <span className="text-xs theme-text-secondary font-mono">Scale: 1 to 5</span>
              </div>

              {gradeRecords.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono theme-text-secondary">
                  No published grades available for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Q1 Grade</th>
                        <th className="py-3 px-4">Q2 Grade</th>
                        <th className="py-3 px-4">Exam Score</th>
                        <th className="py-3 px-4">Average</th>
                        <th className="py-3 px-4">Teacher Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {gradeRecords.map((g) => {
                        const avg = calculateSubjectAvg(g);
                        return (
                          <tr key={g.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-emerald-400">{g.subject}</td>
                            <td className="py-3 px-4 font-mono font-bold">{g.q1 || '-'}</td>
                            <td className="py-3 px-4 font-mono font-bold">{g.q2 || '-'}</td>
                            <td className="py-3 px-4 font-mono font-bold">{g.exam || '-'}</td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">{avg}</td>
                            <td className="py-3 px-4 theme-text-secondary text-xs">{g.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-serif font-bold">Attendance Log</h2>
                <span className="text-xs theme-text-secondary font-mono">Total Recorded: {attendanceRecords.length} Days</span>
              </div>

              {attendanceRecords.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono theme-text-secondary">
                  No attendance entries recorded for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {attendanceRecords.map((att) => {
                        let statusBadge = null;
                        if (att.status === 'present') {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </span>
                          );
                        } else if (att.status === 'absent') {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </span>
                          );
                        } else if (att.status === 'late') {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[11px]">
                              <Clock className="w-3.5 h-3.5" /> Late
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Excused
                            </span>
                          );
                        }

                        return (
                          <tr key={att.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold">{att.date}</td>
                            <td className="py-3 px-4 font-mono theme-text-secondary">{att.class_name}</td>
                            <td className="py-3 px-4">{statusBadge}</td>
                          </tr>
                        );
                      })}
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