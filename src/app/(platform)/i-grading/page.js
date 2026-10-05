'use client';

import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Save, CheckCircle2, 
  Search, Award, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '@/app/supabase';

export default function TeacherGradingHubPage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({}); // { student_id: { q1, q2, exam, notes } }
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load students and existing grades when class or subject changes
  useEffect(() => {
    fetchGradingData();
  }, [selectedClass, selectedSubject]);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real student profiles
      const { data: studentList, error: studentError } = await supabase
        .from('profiles')
        .select('id, name, surname, email')
        .eq('role', 'student');

      if (studentError) throw studentError;
      setStudents(studentList || []);

      // 2. Fetch existing grade records for this class & subject
      const { data: gradeRecords, error: gradeError } = await supabase
        .from('grades')
        .select('student_id, q1, q2, exam, notes')
        .eq('class_name', selectedClass)
        .eq('subject', selectedSubject);

      if (gradeError) throw gradeError;

      // Map grade records into state by student_id
      const initialGrades = {};
      gradeRecords?.forEach((record) => {
        initialGrades[record.student_id] = {
          q1: record.q1 || '5',
          q2: record.q2 || '5',
          exam: record.exam || '5',
          notes: record.notes || '',
        };
      });

      // Set default values for students without existing grade records
      (studentList || []).forEach((student) => {
        if (!initialGrades[student.id]) {
          initialGrades[student.id] = {
            q1: '5',
            q2: '5',
            exam: '5',
            notes: '',
          };
        }
      });

      setGrades(initialGrades);
} catch (error) {
      console.error('Error loading grade data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage(null);

    const payload = students.map((student) => ({
      student_id: student.id,
      class_name: selectedClass,
      subject: selectedSubject,
      q1: grades[student.id]?.q1 || '5',
      q2: grades[student.id]?.q2 || '5',
      exam: grades[student.id]?.exam || '5',
      notes: grades[student.id]?.notes || '',
      updated_at: new Date().toISOString(),
    }));

    try {
      // Upsert updates existing grade records if (student_id, subject, class_name) matches
      const { error } = await supabase
        .from('grades')
        .upsert(payload, { onConflict: 'student_id, subject, class_name' });

      if (error) throw error;

      setToastMessage({
        type: 'success',
        text: `Grades for ${selectedClass} (${selectedSubject}) published successfully!`,
      });
    } catch (error) {
      console.error('Failed to save grades:', error.message);
      setToastMessage({
        type: 'error',
        text: 'Failed to publish grade records.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" /> Assessment Portal
          </div>
          <h1 className="text-3xl font-serif font-bold">Grading Hub</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Submit term evaluations, quiz results, and official grades for your classes.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="10-A">Class 10-A</option>
            <option value="11-B">Class 11-B</option>
            <option value="9-V">Class 9-V</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Geometry">Geometry</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      {/* Toast Feedback Message */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Grade Entry Table */}
      <form onSubmit={handleSaveGrades} className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold">
            Grade Sheet: {selectedClass} - {selectedSubject}
          </h2>
          <span className="text-xs theme-text-secondary font-mono">Scale: 1 to 5</span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-xs font-mono theme-text-secondary gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            Fetching student profiles & grades...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono theme-text-secondary">
            No students found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Q1 Grade</th>
                  <th className="py-3 px-4">Q2 Grade</th>
                  <th className="py-3 px-4">Exam Score</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {students.map((st) => {
                  const studentGrade = grades[st.id] || { q1: '5', q2: '5', exam: '5', notes: '' };
                  const studentName = `${st.name || ''} ${st.surname || ''}`.trim() || st.email;

                  return (
                    <tr key={st.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div>{studentName}</div>
                        <div className="text-[10px] font-mono theme-text-secondary">{st.email}</div>
                      </td>
                      
                      {['q1', 'q2', 'exam'].map((field) => (
                        <td key={field} className="py-3 px-4">
                          <select
                            value={studentGrade[field] || '5'}
                            onChange={(e) => handleGradeChange(st.id, field, e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                          >
                            <option value="5">5 (A)</option>
                            <option value="4">4 (B)</option>
                            <option value="3">3 (C)</option>
                            <option value="2">2 (D)</option>
                            <option value="1">1 (F)</option>
                          </select>
                        </td>
                      ))}

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={studentGrade.notes || ''}
                          onChange={(e) => handleGradeChange(st.id, 'notes', e.target.value)}
                          placeholder="Add brief note..."
                          className="w-full px-3 py-1.5 rounded-lg text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading || students.length === 0}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Publishing...' : 'Publish Grade Records'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}