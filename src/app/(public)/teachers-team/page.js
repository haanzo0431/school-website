'use client';

import { BookOpen, Award, Mail } from 'lucide-react';

// Mock data - later you can fetch this from Supabase
const teachersList = [
  { id: 1, name: 'Azizov Alisher', subjectKey: 'math', experience: 12, email: 'a.azizov@xonqa.school' },
  { id: 2, name: 'Karimova Nargiza', subjectKey: 'english', experience: 8, email: 'n.karimova@xonqa.school' },
  { id: 3, name: 'Rustamov Bekzod', subjectKey: 'physics', experience: 15, email: 'b.rustamov@xonqa.school' },
  { id: 4, name: 'Usmonova Dilnoza', subjectKey: 'cs', experience: 5, email: 'd.usmonova@xonqa.school' },
];

const SUBJECT_NAMES = {
  math: 'Math',
  english: 'English',
  physics: 'Physics',
  cs: 'Computer Science',
};

export default function TeachersPage() {

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <span className="text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          Faculty
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mt-4 theme-text-primary">
          Meet Our Dedicated Teachers
        </h1>
        <p className="text-sm theme-text-secondary mt-2 max-w-xl mx-auto">
          Our team of experienced educators is committed to providing the best learning experience for our students. Each teacher brings a wealth of knowledge and passion to their subject, ensuring that every student has the opportunity to succeed.
        </p>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teachersList.map((teacher) => (
          <div 
            key={teacher.id} 
            className="theme-bg-card border theme-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors group"
          >
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 rounded-full bg-black/20 border-2 theme-border mb-4 flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-serif theme-text-secondary group-hover:text-emerald-500 transition-colors">
                {teacher.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <h3 className="text-base font-bold theme-text-primary mb-1">
              {teacher.name}
            </h3>
            
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mb-4 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">
                {SUBJECT_NAMES[teacher.subjectKey] || teacher.subjectKey}
              </span>
            </div>

            {/* Footer Details */}
            <div className="w-full space-y-2 mt-auto pt-4 border-t theme-border">
              <div className="flex items-center justify-between text-[11px] theme-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> {teacher.experience} years experience
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] theme-text-secondary truncate">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {teacher.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}