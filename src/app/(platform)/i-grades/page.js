'use client';

import { useState } from 'react';
import { 
  TrendingUp, Award, CheckCircle2, 
  Calendar, FileText, AlertCircle 
} from 'lucide-react';

const SUBJECT_GRADES = [
  { subject: 'Mathematics', average: '4.8', grade: '5', assessments: 12, status: 'Excellent' },
  { subject: 'Physics', average: '4.5', grade: '5', assessments: 8, status: 'Excellent' },
  { subject: 'English Language', average: '4.9', grade: '5', assessments: 15, status: 'Top Student' },
  { subject: 'Information Technology', average: '5.0', grade: '5', assessments: 10, status: 'Top Student' },
  { subject: 'History of Uzbekistan', average: '4.2', grade: '4', assessments: 6, status: 'Good' },
  { subject: 'Chemistry', average: '4.1', grade: '4', assessments: 7, status: 'Good' },
];

const RECENT_GRADES = [
  { date: 'Sep 12, 2026', subject: 'Mathematics', title: 'Algebraic Equations Quiz', score: '5', max: '5', type: 'Quiz' },
  { date: 'Sep 10, 2026', subject: 'Physics', title: 'Lab Report #2 (Kinematics)', score: '4', max: '5', type: 'Lab' },
  { date: 'Sep 08, 2026', subject: 'English', title: 'IELTS Essay Writing Task', score: '5', max: '5', type: 'Homework' },
  { date: 'Sep 05, 2026', subject: 'Chemistry', title: 'Periodic Table Test', score: '4', max: '5', type: 'Exam' },
  { date: 'Sep 02, 2026', subject: 'IT', title: 'Tailwind CSS Layout Challenge', score: '5', max: '5', type: 'Project' },
];

export default function StudentGradesPage() {
  const [selectedTerm, setSelectedTerm] = useState('q1');

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Academic Performance & Grades</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Track your academic evaluation, GPA, and test scores for the active academic year.
          </p>
        </div>

        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="q1">Quarter 1 (Fall 2026)</option>
          <option value="q2">Quarter 2 (Winter 2026)</option>
          <option value="annual">Full Academic Year</option>
        </select>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-text-secondary">
            <span>Overall GPA</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-400">4.75 / 5.0</div>
          <p className="text-[11px] theme-text-secondary">Top 5% in your grade level</p>
        </div>

        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-text-secondary">
            <span>Completed Assignments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-serif font-bold">58 / 60</div>
          <p className="text-[11px] theme-text-secondary">96.6% completion rate</p>
        </div>

        <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-text-secondary">
            <span>Class Rank</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-serif font-bold">#2</div>
          <p className="text-[11px] theme-text-secondary">Out of 28 students in Class 10-A</p>
        </div>
      </div>

      {/* Subject Averages Table */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <h2 className="text-lg font-serif font-bold">Subject Grade Breakdown</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b theme-border theme-text-secondary text-[11px] font-mono uppercase">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assessments</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Final Grade</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {SUBJECT_GRADES.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold">{item.subject}</td>
                  <td className="py-3.5 px-4 theme-text-secondary">{item.assessments} tests</td>
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

      {/* Recent Grade Activity */}
      <div className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold">Recent Evaluations</h2>
          <span className="text-xs theme-text-secondary">Last updated today</span>
        </div>

        <div className="space-y-3">
          {RECENT_GRADES.map((grade, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl theme-bg-page border theme-border hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs">{grade.title}</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {grade.type}
                    </span>
                  </div>
                  <p className="text-[11px] theme-text-secondary mt-0.5 flex items-center gap-2">
                    <span>{grade.subject}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-500" /> {grade.date}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {grade.score} / {grade.max}
                </span>
                <span className="block text-[10px] theme-text-secondary">Passed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}