'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, User, Clock, Building, 
  Search, Sparkles, GraduationCap 
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const DEFAULT_SUBJECTS = [
  {
    id: 1,
    name: 'Mathematics & Algebra',
    teacher: 'A. Karimov',
    room: 'Room 204',
    schedule: 'Mon, Wed, Fri (09:00 - 09:45)',
    topics: 'Quadratic Equations, Functions & Graphs',
    iconColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 2,
    name: 'Physics',
    teacher: 'M. Sobirova',
    room: 'Lab 102',
    schedule: 'Tue, Thu (10:00 - 10:45)',
    topics: 'Kinematics, Newton’s Laws of Motion',
    iconColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: 3,
    name: 'English Language',
    teacher: 'D. Aliyeva',
    room: 'Room 305',
    schedule: 'Mon, Wed (11:00 - 11:45)',
    topics: 'Academic Writing & IELTS Preparation',
    iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 4,
    name: 'Information Technology',
    teacher: 'S. Rahimov',
    room: 'Comp Lab 1',
    schedule: 'Tue, Fri (12:00 - 12:45)',
    topics: 'Web Development Basics, Python Scripting',
    iconColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 5,
    name: 'History of Uzbekistan',
    teacher: 'O. Toshpulatov',
    room: 'Room 108',
    schedule: 'Thu (09:00 - 09:45)',
    topics: 'Silk Road Civilizations & Khanates',
    iconColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    id: 6,
    name: 'Chemistry',
    teacher: 'N. Abdullayeva',
    room: 'Lab 201',
    schedule: 'Wed, Fri (14:00 - 14:45)',
    topics: 'Periodic Table & Chemical Bonding',
    iconColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
];

export default function StudentSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentClass, setStudentClass] = useState('10-A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserClass() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single();
        if (data?.class) setStudentClass(data.class);
      }
      setLoading(false);
    }
    loadUserClass();
  }, []);

  const filteredSubjects = DEFAULT_SUBJECTS.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-xs font-mono theme-text-secondary">
        Loading curriculum data...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Class {studentClass} Curriculum
          </div>
          <h1 className="text-3xl font-serif font-bold">My Subjects</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Overview of your active school subjects, schedule, and teachers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-secondary" />
          <input
            type="text"
            placeholder="Search subject or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`p-2.5 rounded-2xl border ${subject.iconColor}`}>
                  <BookOpen className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg theme-bg-page border theme-border theme-text-secondary">
                  Active
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg">{subject.name}</h3>
                <p className="text-xs theme-text-secondary flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instructor: {subject.teacher}</span>
                </p>
              </div>

              <div className="pt-2 border-t theme-border space-y-2 text-xs">
                <div className="flex items-center gap-2 theme-text-secondary">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{subject.schedule}</span>
                </div>
                <div className="flex items-center gap-2 theme-text-secondary">
                  <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{subject.room}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t theme-border">
              <span className="text-[10px] font-mono theme-text-secondary block mb-1 uppercase tracking-wider">
                Current Unit
              </span>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{subject.topics}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}