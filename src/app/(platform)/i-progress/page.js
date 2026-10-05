'use client';

import { useState } from 'react';
import { 
  TrendingUp, Award, Clock, AlertCircle, 
  CheckCircle2, User, BookOpen, ChevronRight 
} from 'lucide-react';

const CHILD_OVERVIEW = {
  name: 'Jasur Rahimov',
  grade: '10-A',
  homeroomTeacher: 'A. Karimov',
  gpa: '4.8',
  attendance: '98%',
  rank: '2nd out of 28',
};

const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics & Algebra', teacher: 'A. Karimov', grade: '5', average: '4.8', status: 'Excellent' },
  { subject: 'Physics', teacher: 'M. Sobirova', grade: '5', average: '4.5', status: 'Excellent' },
  { subject: 'English Language', teacher: 'D. Aliyeva', grade: '5', average: '4.9', status: 'Top Student' },
  { subject: 'Information Technology', teacher: 'S. Rahimov', grade: '5', average: '5.0', status: 'Top Student' },
  { subject: 'History of Uzbekistan', teacher: 'O. Toshpulatov', grade: '4', average: '4.2', status: 'Good' },
  { subject: 'Chemistry', teacher: 'N. Abdullayeva', grade: '4', average: '4.1', status: 'Good' },
];

const TEACHER_REMARKS = [
  {
    date: 'Sep 11, 2026',
    teacher: 'A. Karimov (Math)',
    text: 'Jasur scored top marks on the recent algebra quiz. Keep up the great work!',
    type: 'Praise',
  },
  {
    date: 'Sep 04, 2026',
    teacher: 'M. Sobirova (Physics)',
    text: 'Excellent teamwork during the physics laboratory assignment.',
    type: 'Praise',
  },
];

export default function ChildProgressPage() {
  const [term, setTerm] = useState('q1');

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
            Parent Portal
          </span>
          <h1 className="text-3xl font-serif font-bold mt-2">Child Progress Overview</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Track academic grades, attendance records, and faculty feedback for {CHILD_OVERVIEW.name}.
          </p>
        </div>

        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="q1">Quarter 1 (Fall 2026)</option>
          <option value="q2">Quarter 2 (Winter 2026)</option>
          <option value="annual">Full Academic Year</option>
        </select>
      </div>

      {/* Student Profile Summary Card */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex items-center gap-4 md:col-span-1 border-b md:border-b-0 md:border-r theme-border pb-4 md:pb-0 md:pr-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-serif font-bold text-xl border border-emerald-500/20">
            {CHILD_OVERVIEW.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-serif font-bold text-base">{CHILD_OVERVIEW.name}</h2>
            <p className="text-xs theme-text-secondary">Class {CHILD_OVERVIEW.grade}</p>
            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Homeroom: {CHILD_OVERVIEW.homeroomTeacher}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 md:col-span-3 gap-4 text-center">
          <div className="p-3 rounded-2xl theme-bg-page border theme-border">
            <span className="text-[10px] font-mono theme-text-secondary uppercase block">Overall GPA</span>
            <span className="text-2xl font-serif font-bold text-emerald-400">{CHILD_OVERVIEW.gpa}</span>
          </div>

          <div className="p-3 rounded-2xl theme-bg-page border theme-border">
            <span className="text-[10px] font-mono theme-text-secondary uppercase block">Attendance Rate</span>
            <span className="text-2xl font-serif font-bold">{CHILD_OVERVIEW.attendance}</span>
          </div>

          <div className="p-3 rounded-2xl theme-bg-page border theme-border">
            <span className="text-[10px] font-mono theme-text-secondary uppercase block">Class Standing</span>
            <span className="text-2xl font-serif font-bold text-amber-400">{CHILD_OVERVIEW.rank}</span>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-lg font-serif font-bold">Subject Report Card</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {SUBJECT_PERFORMANCE.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold">{item.subject}</td>
                  <td className="py-3.5 px-4 theme-text-secondary">{item.teacher}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.average}</td>
                  <td className="py-3.5 px-4">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono inline-flex items-center justify-center">
                      {item.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Notes */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-lg font-serif font-bold">Teacher Feedback & Observations</h2>

        <div className="space-y-3">
          {TEACHER_REMARKS.map((note, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl theme-bg-page border theme-border space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">{note.teacher}</span>
                <span className="text-[10px] font-mono theme-text-secondary">{note.date}</span>
              </div>
              <p className="text-xs theme-text-primary">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}