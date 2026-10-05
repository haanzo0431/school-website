'use client';

import { useState, useRef } from 'react';
import {
  BookOpen,
  Award,
  Mail,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileCheck,
  TrendingUp,
  CheckCircle2,
  Building2,
  Star,
  UserCheck,
} from 'lucide-react';

// Rich mock data for teachers, certificates, student scores, and achievements
const teachersList = [
  {
    id: 1,
    name: 'Azizov Alisher',
    subjectKey: 'math',
    subjectName: 'Mathematics & SAT Prep',
    experience: 12,
    email: 'a.azizov@xonqa.school',
    avatarText: 'AA',
    education: 'Tashkent State Pedagogical University (M.S. Applied Math)',
    bio: 'Dedicated mathematics educator specializing in advanced calculus, Olympiad preparation, and SAT Math coaching.',
    certificates: [
      { name: 'National Teacher Certification (Higher Category)', score: 'Grade A+' },
      { name: 'SAT Math Subject Certification', score: '800 / 800' },
      { name: 'Pedagogical Excellence Award', score: 'Level 1' },
    ],
    studentScores: [
      { metric: 'SAT Math Average', value: '760/800', note: 'Top 5% nationally' },
      { metric: 'National Exam Pass Rate', value: '98%', note: '2024–2025 cohort' },
      { metric: 'Olympiad Winners Mentored', value: '14 Students', note: 'Regional & State' },
    ],
    achievements: [
      'Coached 3 Gold Medalists at the National Mathematics Olympiad (2024).',
      'Author of "Calculus for Advanced High Schoolers" workbook.',
      'Awarded "Best STEM Educator of Xorazm Region" in 2023.',
    ],
  },
  {
    id: 2,
    name: 'Karimova Nargiza',
    subjectKey: 'english',
    subjectName: 'English & IELTS Specialist',
    experience: 8,
    email: 'n.karimova@xonqa.school',
    avatarText: 'NK',
    education: 'Uzbekistan State University of World Languages (B.A. English Philology)',
    bio: 'Certified IELTS instructor focusing on communicative language teaching, academic writing, and TOEFL preparation.',
    certificates: [
      { name: 'IELTS Academic Certificate', score: 'Band 8.5' },
      { name: 'CELTA (Cambridge Assessment)', score: 'Pass A' },
      { name: 'CEFR C1 Master Trainer', score: 'Certified' },
    ],
    studentScores: [
      { metric: 'Students Scored IELTS 7.5+', value: '38 Students', note: 'Over last 3 years' },
      { metric: 'Average Student CEFR Level', value: 'B2 / C1', note: 'Grade 11 graduates' },
      { metric: 'Top Uni Abroad Admissions', value: '22 Students', note: 'US, UK, China, Korea' },
    ],
    achievements: [
      'Achieved 100% student qualification rate for CEFR C1 in 2024.',
      'Head Trainer for the Regional English Debate League.',
      'Organized annual Model UN conferences for Xorazm students.',
    ],
  },
  {
    id: 3,
    name: 'Rustamov Bekzod',
    subjectKey: 'physics',
    subjectName: 'Physics & Engineering Mechanics',
    experience: 15,
    email: 'b.rustamov@xonqa.school',
    avatarText: 'BR',
    education: 'National University of Uzbekistan (Ph.D. Candidate Physics)',
    bio: 'Passionate physics teacher integrating hands-on laboratory experiments, robotics, and theoretical physics.',
    certificates: [
      { name: 'Ph.D. Research Scholar in Physics', score: 'Candidate' },
      { name: 'National Physics Mentor License', score: 'Master Level' },
      { name: 'STEM Robotics Instructor Certification', score: 'Level 2' },
    ],
    studentScores: [
      { metric: 'Physics National Exam Average', value: '92 / 100', note: 'Ranked #1 in District' },
      { metric: 'Robotics Competition Finalists', value: '6 Teams', note: 'National Level' },
      { metric: 'Engineering Uni Admissions', value: '45+ Students', note: 'TUIT, Turin, Inha' },
    ],
    achievements: [
      'Mentored the 1st place winning team in Xorazm Regional Robotics Expo.',
      'Published 5 research papers in national physics journals.',
      'Established the school laboratory modern physics workshop.',
    ],
  },
  {
    id: 4,
    name: 'Usmonova Dilnoza',
    subjectKey: 'cs',
    subjectName: 'Computer Science & Software Eng.',
    experience: 5,
    email: 'd.usmonova@xonqa.school',
    avatarText: 'DU',
    education: 'Tashkent University of Information Technologies (B.S. Software Engineering)',
    bio: 'Full-stack software developer turned computer science educator teaching Python, Web Development, and Algorithms.',
    certificates: [
      { name: 'Full-Stack Web Development', score: 'Certified' },
      { name: 'Python Institute Certified Associate', score: '96%' },
      { name: 'Competitive Programming Coach', score: 'Level 1' },
    ],
    studentScores: [
      { metric: 'ICPC Youth Contestants', value: '12 Students', note: 'Final round qualifiers' },
      { metric: 'Web Dev Projects Built', value: '50+ Apps', note: 'Student portfolio' },
      { metric: 'Tech Internship Placements', value: '8 Students', note: 'Local IT Companies' },
    ],
    achievements: [
      'Lead mentor for the school Hackathon team (2nd place overall).',
      'Created open-source programming curriculum used across local schools.',
      'Certified Google for Education Trainer.',
    ],
  },
  {
    id: 5,
    name: 'O\'ktamboyev Aziz',
    subjectKey: 'physics',
    subjectName: 'Physics & Engineering Mechanics',
    experience: 15,
    email: 'a.oktamboyev@xonqa.school',
    avatarText: 'AO',
    education: 'National University of Uzbekistan (Ph.D. Candidate Physics)',
    bio: 'Passionate physics teacher integrating hands-on laboratory experiments, robotics, and theoretical physics.',
    certificates: [
      { name: 'Ph.D. Research Scholar in Physics', score: 'Candidate' },
      { name: 'National Physics Mentor License', score: 'Master Level' },
      { name: 'STEM Robotics Instructor Certification', score: 'Level 2' },
    ],
    studentScores: [
      { metric: 'Physics National Exam Average', value: '92 / 100', note: 'Ranked #1 in District' },
      { metric: 'Robotics Competition Finalists', value: '6 Teams', note: 'National Level' },
      { metric: 'Engineering Uni Admissions', value: '45+ Students', note: 'TUIT, Turin, Inha' },
    ],
    achievements: [
      'Mentored the 1st place winning team in Xorazm Regional Robotics Expo.',
      'Published 5 research papers in national physics journals.',
      'Established the school laboratory modern physics workshop.',
    ],
  },
];

const SUBJECT_NAMES = {
  math: 'Math',
  english: 'English',
  physics: 'Physics',
  cs: 'Computer Science',
};

export default function TeachersPage() {
  const [selectedId, setSelectedId] = useState(teachersList[0].id);
  const scrollContainerRef = useRef(null);

  const selectedTeacher =
    teachersList.find((t) => t.id === selectedId) || teachersList[0];

  // Horizontal scroll buttons helper
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          <UserCheck className="w-3 h-3" /> Faculty & Educators
        </span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold theme-text-primary">
          Meet Our Dedicated Teachers
        </h1>
        <p className="text-xs md:text-sm theme-text-secondary leading-relaxed">
          Swipe or scroll through our faculty members. Click on any teacher to explore their certs, student scores, and achievements.
        </p>
      </div>

      {/* Horizontal Carousel Controls & Track */}
      <div className="relative group">
        {/* Navigation Buttons for Desktop */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 backdrop-blur-md border theme-border text-white hover:border-emerald-500 hover:text-emerald-400 transition-all shadow-xl hidden md:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 backdrop-blur-md border theme-border text-white hover:border-emerald-500 hover:text-emerald-400 transition-all shadow-xl hidden md:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Track (Touch, Touchpad & Drag gesture supported) */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-5 overflow-x-auto snap-x snap-mandatory py-4 px-2 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teachersList.map((teacher) => {
            const isSelected = teacher.id === selectedId;
            return (
              <div
                key={teacher.id}
                onClick={() => setSelectedId(teacher.id)}
                className={`snap-center shrink-0 w-[260px] md:w-[280px] p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center select-none relative ${
                  isSelected
                    ? 'theme-bg-card border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'theme-bg-card border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Viewing
                  </span>
                )}

                {/* Avatar Placeholder */}
                <div
                  className={`w-20 h-20 rounded-full border-2 mb-4 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'theme-border bg-black/20 theme-text-secondary'
                  }`}
                >
                  <span className="text-xl font-serif font-bold">
                    {teacher.avatarText}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-base font-bold theme-text-primary mb-1">
                  {teacher.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-4 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{SUBJECT_NAMES[teacher.subjectKey] || teacher.subjectKey}</span>
                </div>

                {/* Experience & Contact */}
                <div className="w-full space-y-1.5 pt-3 border-t theme-border text-[11px] theme-text-secondary">
                  <div className="flex items-center justify-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{teacher.experience} years experience</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DOWNSIDE: Detailed Teacher Credentials Showcase */}
      {selectedTeacher && (
        <div className="theme-bg-card border theme-border rounded-3xl p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Top Banner Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b theme-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-serif font-bold shrink-0">
                {selectedTeacher.avatarText}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold theme-text-primary">
                    {selectedTeacher.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    {selectedTeacher.experience} Yrs Experience
                  </span>
                </div>
                <p className="text-xs md:text-sm text-emerald-400 font-mono font-medium mt-1">
                  {selectedTeacher.subjectName}
                </p>
                <p className="text-xs theme-text-secondary flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {selectedTeacher.education}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <a
                href={`mailto:${selectedTeacher.email}`}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Mail className="w-4 h-4" /> Contact Teacher
              </a>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-4 rounded-2xl theme-bg-page border theme-border">
            <p className="text-xs md:text-sm theme-text-secondary leading-relaxed">
              <span className="font-semibold theme-text-primary">Teaching Philosophy: </span>
              "{selectedTeacher.bio}"
            </p>
          </div>

          {/* 3 Grid Columns for Credentials & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Certificates & Scores */}
            <div className="p-5 rounded-2xl theme-bg-page border theme-border space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-base border-b theme-border pb-3">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3>Teacher Certificates</h3>
              </div>
              <div className="space-y-3">
                {selectedTeacher.certificates.map((cert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 text-xs p-2.5 rounded-xl bg-black/20 border theme-border"
                  >
                    <div>
                      <p className="font-semibold theme-text-primary">{cert.name}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px]">
                      {cert.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Student Scores & Metrics */}
            <div className="p-5 rounded-2xl theme-bg-page border theme-border space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-serif font-bold text-base border-b theme-border pb-3">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <h3>Student Outcomes</h3>
              </div>
              <div className="space-y-3">
                {selectedTeacher.studentScores.map((score, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-black/20 border theme-border space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs theme-text-secondary">{score.metric}</span>
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {score.value}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{score.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Achievements & Awards */}
            <div className="p-5 rounded-2xl theme-bg-page border theme-border space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base border-b theme-border pb-3">
                <Star className="w-5 h-5 text-amber-400" />
                <h3>Honors & Achievements</h3>
              </div>
              <ul className="space-y-3">
                {selectedTeacher.achievements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs theme-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}