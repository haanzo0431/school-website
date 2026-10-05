'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, User, Clock, Building, 
  Search, Sparkles, GraduationCap, ArrowRight, Calendar
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentCurriculum() {
      try {
        setLoading(true);

        // 1. Get logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Fetch student's assigned class name from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single();

        const className = profileData?.class || '10-A';
        setStudentClass(className);

        // 3. Get matching class ID
        const { data: classData } = await supabase
          .from('classes')
          .select('id')
          .eq('name', className)
          .single();

        if (classData) {
          // 4. Fetch schedules joined with Subjects and Teacher Profiles
          const { data: scheduleData, error } = await supabase
            .from('schedules')
            .select(`
              id,
              day_of_week,
              start_time,
              end_time,
              room,
              current_topic,
              subjects ( id, name, icon_color ),
              profiles:teacher_id ( name, surname, first_name, last_name )
            `)
            .eq('class_id', classData.id);

          if (!error && scheduleData) {
            setSchedules(scheduleData);
          }
        }
      } catch (err) {
        console.error('Error loading curriculum:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentCurriculum();
  }, []);

  // Group schedules by subject to present consolidated subject cards
  const subjectsMap = {};
  schedules.forEach((item) => {
    const subId = item.subjects?.id || item.id;
    const teacherName = item.profiles 
      ? `${item.profiles.name || item.profiles.first_name || ''} ${item.profiles.surname || item.profiles.last_name || ''}`.trim()
      : 'Unassigned';

    if (!subjectsMap[subId]) {
      subjectsMap[subId] = {
        id: subId,
        name: item.subjects?.name || 'Subject',
        teacher: teacherName,
        room: item.room,
        topics: item.current_topic || 'Standard Curriculum',
        iconColor: item.subjects?.icon_color || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        slots: [],
      };
    }

    subjectsMap[subId].slots.push({
      day: item.day_of_week,
      time: `${item.start_time?.slice(0, 5)} - ${item.end_time?.slice(0, 5)}`,
    });
  });

  const subjectsList = Object.values(subjectsMap);

  // Filter subjects by search keyword and day tab
  const filteredSubjects = subjectsList.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = selectedDay === 'All' || sub.slots.some(s => s.day === selectedDay);
    return matchesSearch && matchesDay;
  });

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-xs font-mono theme-text-secondary min-h-[50vh]">
        Loading curriculum for Class {studentClass}...
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
          <h1 className="text-3xl font-serif font-bold">My Subjects & Schedule</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Dynamic timetable and instructor details synced to your class profile.
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

      {/* Weekday Schedule Filter Tabs */}
<div className="flex items-center gap-2 overflow-x-auto pb-2 border-b theme-border text-xs font-mono">
  <button
    onClick={() => setSelectedDay('All')}
    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 select-none ${
      selectedDay === 'All'
        ? 'bg-emerald-500 text-black shadow-sm'
        : 'theme-bg-card border theme-border theme-text-secondary hover:theme-text-primary'
    }`}
  >
    All Days
  </button>
  {DAYS_OF_WEEK.map((day) => (
    <button
      key={day}
      onClick={() => setSelectedDay(day)}
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 shrink-0 select-none ${
        selectedDay === day
          ? 'bg-emerald-500 text-black shadow-sm'
          : 'theme-bg-card border theme-border theme-text-secondary hover:theme-text-primary'
      }`}
    >
      {day}
    </button>
  ))}
</div>

      {/* Grid of Subjects */}
      {filteredSubjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl theme-bg-card border theme-border space-y-2">
          <Calendar className="w-8 h-8 text-emerald-500 mx-auto opacity-60" />
          <p className="text-sm font-semibold">No subjects scheduled for this selection.</p>
          <p className="text-xs theme-text-secondary">Try selecting "All Days" or updating your search query.</p>
        </div>
      ) : (
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
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg theme-bg-page border theme-border text-emerald-400">
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

                {/* Day-by-Day Schedule Slots */}
                <div className="pt-2 border-t theme-border space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 theme-text-secondary mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Schedule Slots:</span>
                  </div>
                  {subject.slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg theme-bg-page border theme-border text-[11px] font-mono">
                      <span className="text-emerald-400 font-semibold">{slot.day}</span>
                      <span className="theme-text-secondary">{slot.time}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 theme-text-secondary pt-1">
                    <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{subject.room}</span>
                  </div>
                </div>
              </div>

              {/* Unit & Classwork Action */}
              <div className="mt-4 pt-3 border-t theme-border flex items-end justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono theme-text-secondary block mb-1 uppercase tracking-wider">
                    Current Unit
                  </span>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{subject.topics}</span>
                  </p>
                </div>

                <Link
                  href="/i-assignments"
                  className="shrink-0 text-[11px] font-mono font-medium px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1"
                >
                  Classwork <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}