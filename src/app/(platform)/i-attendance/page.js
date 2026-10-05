'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase'; // Adjust this path if your Supabase client is elsewhere
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'present', label: 'Present', color: 'emerald', icon: CheckCircle2 },
  { id: 'absent', label: 'Absent', color: 'rose', icon: XCircle },
  { id: 'late', label: 'Late', color: 'amber', icon: Clock },
  { id: 'excused', label: 'Excused', color: 'sky', icon: AlertCircle },
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { student_id: 'present' | 'absent' | ... }
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load students and existing attendance when class or date changes
  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all student profiles
      const { data: studentList, error: studentError } = await supabase
        .from('profiles')
        .select('id, name, surname, email')
        .eq('role', 'student');

      if (studentError) throw studentError;

      setStudents(studentList || []);

      // 2. Fetch attendance entries for selected date
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', selectedDate)
        .eq('class_name', selectedClass);

      if (attendanceError) throw attendanceError;

      // Map DB records into state object
      const initialAttendance = {};
      attendanceRecords?.forEach((record) => {
        initialAttendance[record.student_id] = record.status;
      });

      // Default unrecorded students to 'present'
      (studentList || []).forEach((student) => {
        if (!initialAttendance[student.id]) {
          initialAttendance[student.id] = 'present';
        }
      });

      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error loading attendance data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle status for a single student
  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk action: Mark all students as present/absent
  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  // Save or update attendance records in Supabase
  const handleSave = async () => {
    setSaving(true);
    setToastMessage(null);

    const payload = students.map((student) => ({
      student_id: student.id,
      class_name: selectedClass,
      date: selectedDate,
      status: attendance[student.id] || 'present',
      updated_at: new Date().toISOString(),
    }));

    try {
      // Upsert overwrites existing records based on unique constraint (student_id, date)
      const { error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'student_id, date' });

      if (error) throw error;

      setToastMessage({ type: 'success', text: 'Attendance saved successfully!' });
    } catch (error) {
      console.error('Failed to save attendance:', error.message);
      setToastMessage({ type: 'error', text: 'Failed to save attendance records.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b theme-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
            Daily Log
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold theme-text-primary mt-2">
            Class Attendance Tracker
          </h1>
          <p className="text-xs theme-text-secondary mt-1">
            Log student attendance, tardiness, and excused absences for backend records.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || loading || students.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 self-start md:self-auto"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <Check className="w-4 h-4" />
          {toastMessage.text}
        </div>
      )}

      {/* Filters Bar: Class & Date Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl theme-bg-card border theme-border">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono theme-text-secondary flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Target Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl theme-bg-page border theme-border theme-text-primary text-xs font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="10-A">Class 10-A (Math & CS)</option>
            <option value="10-B">Class 10-B (Physics)</option>
            <option value="11-A">Class 11-A (Advanced STEM)</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono theme-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl theme-bg-page border theme-border theme-text-primary text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Bulk Actions */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-mono theme-text-secondary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Actions
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-medium transition-all"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-mono font-medium transition-all"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster & Attendance Table */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            Loading class roster and records...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono theme-text-secondary">
            No students found in the database with the <code className="text-emerald-400">student</code> role.
          </div>
        ) : (
          <div className="divide-y theme-border">
            {students.map((student, idx) => {
              const currentStatus = attendance[student.id] || 'present';
              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/10 transition-colors"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold theme-text-primary">
                        {student.name || 'Unnamed'} {student.surname || 'Student'}
                      </h4>
                      <p className="text-[11px] font-mono theme-text-secondary">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = currentStatus === opt.id;
                      const Icon = opt.icon;
                      
                      let activeStyles = '';
                      if (isActive) {
                        if (opt.id === 'present') activeStyles = 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20';
                        if (opt.id === 'absent') activeStyles = 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20';
                        if (opt.id === 'late') activeStyles = 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20';
                        if (opt.id === 'excused') activeStyles = 'bg-sky-500 text-black border-sky-500 shadow-md shadow-sky-500/20';
                      } else {
                        activeStyles = 'theme-bg-page theme-border theme-text-secondary hover:border-slate-600';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleStatusChange(student.id, opt.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${activeStyles}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}