'use client';

import { useState } from 'react';
import { 
  Users, GraduationCap, Clock, 
  Search, BookOpen, ChevronRight, UserCheck 
} from 'lucide-react';

const TEACHER_CLASSES = [
  {
    id: '10-a-math',
    name: 'Class 10-A',
    subject: 'Mathematics & Algebra',
    studentsCount: 28,
    schedule: 'Mon, Wed, Fri (09:00 - 09:45)',
    room: 'Room 204',
    avgGpa: '4.6',
    attendance: '96%',
  },
  {
    id: '11-b-math',
    name: 'Class 11-B',
    subject: 'Advanced Geometry',
    studentsCount: 24,
    schedule: 'Tue, Thu (10:00 - 10:45)',
    room: 'Room 204',
    avgGpa: '4.4',
    attendance: '92%',
  },
  {
    id: '9-v-math',
    name: 'Class 9-V',
    subject: 'General Mathematics',
    studentsCount: 30,
    schedule: 'Mon, Wed (11:00 - 11:45)',
    room: 'Room 105',
    avgGpa: '4.2',
    attendance: '94%',
  },
];

const STUDENT_ROSTER = [
  { id: 1, name: 'Jasur Rahimov', grade: '5', attendance: '100%', status: 'Present' },
  { id: 2, name: 'Malika Saidova', grade: '5', attendance: '95%', status: 'Present' },
  { id: 3, name: 'Bobur Azimov', grade: '4', attendance: '90%', status: 'Present' },
  { id: 4, name: 'Nigora Toshpulatova', grade: '5', attendance: '98%', status: 'Present' },
  { id: 5, name: 'Sardor Karimov', grade: '3', attendance: '85%', status: 'Absent' },
];

export default function TeacherClassesPage() {
  const [selectedClass, setSelectedClass] = useState(TEACHER_CLASSES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = STUDENT_ROSTER.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b theme-border pb-6">
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
          Faculty Console
        </span>
        <h1 className="text-3xl font-serif font-bold mt-2">My Assigned Classes</h1>
        <p className="text-xs theme-text-secondary mt-1">
          Manage your course rosters, student attendance, and class performance.
        </p>
      </div>

      {/* Class Selector Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {TEACHER_CLASSES.map((cls) => {
          const active = selectedClass.id === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-6 text-left rounded-3xl border transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-lg'
                  : 'theme-bg-card theme-border hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500 text-black">
                  {cls.name}
                </span>
                <span className="text-[10px] font-mono theme-text-secondary">
                  {cls.studentsCount} Students
                </span>
              </div>

              <h3 className="font-serif font-bold text-base">{cls.subject}</h3>

              <div className="mt-4 pt-3 border-t theme-border space-y-1.5 text-xs theme-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{cls.room}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Roster & Detail View */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>{selectedClass.name} Student Roster</span>
            </h2>
            <p className="text-xs theme-text-secondary mt-0.5">
              Subject: {selectedClass.subject} | Class Avg: {selectedClass.avgGpa}
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-secondary" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Current Grade</th>
                <th className="py-3 px-4 text-right">Today's Status</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[11px] border border-emerald-500/20">
                      {st.name.charAt(0)}
                    </div>
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono theme-text-secondary">{st.attendance}</td>
                  <td className="py-3.5 px-4">
                    <span className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono inline-flex items-center justify-center text-xs">
                      {st.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                        st.status === 'Present'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}