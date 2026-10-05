'use client';

import { useState } from 'react';
import { 
  ClipboardCheck, Save, CheckCircle2, 
  Search, Award, AlertCircle 
} from 'lucide-react';

const INITIAL_STUDENTS = [
  { id: 1, name: 'Jasur Rahimov', q1: '5', q2: '5', exam: '5', notes: 'Top performer' },
  { id: 2, name: 'Malika Saidova', q1: '5', q2: '4', exam: '5', notes: 'Active in class' },
  { id: 3, name: 'Bobur Azimov', q1: '4', q2: '4', exam: '4', notes: 'Good progress' },
  { id: 4, name: 'Nigora Toshpulatova', q1: '5', q2: '5', exam: '5', notes: 'Excellent logic' },
  { id: 5, name: 'Sardor Karimov', q1: '3', q2: '3', exam: '4', notes: 'Needs improvement in algebra' },
];

export default function TeacherGradingHubPage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleGradeChange = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveGrades = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 4000);
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
          </select>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Grades for {selectedClass} ({selectedSubject}) published successfully!
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
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold">{st.name}</td>
                  
                  {['q1', 'q2', 'exam'].map((field) => (
                    <td key={field} className="py-3 px-4">
                      <select
                        value={st[field]}
                        onChange={(e) => handleGradeChange(st.id, field, e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                      >
                        <option value="5">5 (A)</option>
                        <option value="4">4 (B)</option>
                        <option value="3">3 (C)</option>
                        <option value="2">2 (D)</option>
                      </select>
                    </td>
                  ))}

                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.notes}
                      onChange={(e) => handleGradeChange(st.id, 'notes', e.target.value)}
                      placeholder="Add brief note..."
                      className="w-full px-3 py-1.5 rounded-lg text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Publish Grade Records</span>
          </button>
        </div>
      </form>
    </div>
  );
}