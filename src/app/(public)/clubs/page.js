'use client';

import { Users, Clock, MapPin, Sparkles } from 'lucide-react';

export default function PublicClubsPage() {
  const clubsList = [
    {
      id: 1,
      name: 'Robotics & AI Club',
      category: 'STEM',
      description: 'Building autonomous robots, learning basic coding, and preparing for national technology competitions.',
      schedule: 'Wednesdays & Fridays, 15:00',
      location: 'Lab 204',
      members: '24 Members',
    },
    {
      id: 2,
      name: 'Young Journalists & Press',
      category: 'Media',
      description: 'Writing news articles, managing the school blog, and producing quarterly school newsletters.',
      schedule: 'Tuesdays, 14:30',
      location: 'Library Media Room',
      members: '15 Members',
    },
    {
      id: 3,
      name: 'Debate & Public Speaking',
      category: 'Humanities',
      description: 'Developing critical thinking, rhetoric skills, and competing in inter-school debate tournaments.',
      schedule: 'Thursdays, 15:30',
      location: 'Auditorium',
      members: '30 Members',
    },
  ];

  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black min-h-screen">
      {/* Hero Banner */}
      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Extracurricular Activities
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Student Clubs & Communities</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-1 max-w-2xl">
            Explore the active student-led organizations operating across our school campus.
          </p>
        </div>
      </section>

      {/* Clubs Grid */}
      <div className="max-w-7xl w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubsList.map((club) => (
            <div key={club.id} className="theme-bg-card border theme-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-semibold">
                    {club.category}
                  </span>
                  <span className="text-xs theme-text-secondary flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5" /> {club.members}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold mb-2">{club.name}</h3>
                <p className="text-xs theme-text-secondary mb-6 leading-relaxed">{club.description}</p>
              </div>

              <div className="space-y-2 pt-4 border-t theme-border text-xs theme-text-secondary font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{club.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{club.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}