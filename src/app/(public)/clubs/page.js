'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  MapPin, 
  Sparkles, 
  Lock, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award
} from 'lucide-react';

const PUBLIC_CLUBS = [
  {
    id: 'robotics',
    name: 'Robotics & Innovation Lab',
    category: 'STEM & Tech',
    description: 'Building autonomous robots, programming microcontrollers, and preparing for national technology competitions. Students gain hands-on experience in electronics, C++, and hardware design.',
    schedule: 'Fridays @ 15:00',
    location: 'STEM Workshop Lab',
    members: '15 Active Members',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      '1st Place Regional Robotics Cup Champion',
      'Hands-on Arduino & Microcontroller Workshop Series',
      '3D Printing & Circuit Prototyping Projects'
    ],
  },
  {
    id: 'journalism',
    name: 'School Press & Journalism',
    category: 'Arts & Media',
    description: 'Reporting on school events, publishing student interviews, and creating quarterly press issues. Members build real journalism skills in interview conducting, investigative writing, and media layout.',
    schedule: 'Mondays @ 15:00',
    location: 'Media Center',
    members: '18 Active Members',
    coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      'Published 12 Official School News Articles',
      'Annual Campus Photojournalism Exhibition',
      'Exclusive Interviews with Guest Speakers & Alumni'
    ],
  },
  {
    id: 'debate',
    name: 'English Speaking & Debate',
    category: 'Academics',
    description: 'Developing rhetoric, critical thinking, and preparing students for inter-school speech tournaments. Our weekly debates focus on global politics, ethics, economic policy, and competitive formats.',
    schedule: 'Thursdays @ 16:00',
    location: 'Room 304',
    members: '32 Active Members',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      'Hosted Regional Model UN Simulation Conference',
      'Weekly IELTS Speaking & Rhetoric Coaching',
      'Top 3 Finalists in Regional High School Debate League'
    ],
  },
  {
    id: 'coding',
    name: 'IT & Web Development Club',
    category: 'STEM & Tech',
    description: 'Learning modern software development, web design, and coding tools for practical school applications. Students master HTML, CSS, JavaScript, and modern web frameworks.',
    schedule: 'Wednesdays @ 15:30',
    location: 'Computer Lab 2',
    members: '24 Active Members',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      'Designed & Built Interactive School Platform Features',
      'Intro to Full-Stack Web Development Bootcamp',
      'Annual Student Hackathon Host'
    ],
  },
  {
    id: 'arts',
    name: 'Art & Cultural Society',
    category: 'Arts & Media',
    description: 'Exploring traditional Uzbek crafts, graphic design, painting, and organizing campus cultural exhibitions. A space for creative expression across fine arts, digital media, and photography.',
    schedule: 'Tuesdays @ 15:30',
    location: 'Art Studio',
    members: '20 Active Members',
    coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    ],
    highlights: [
      'Annual Spring Campus Fine Art Gallery',
      'Traditional Uzbek Ceramic & Craft Workshops',
      'Digital Graphic Design & Poster Masterclasses'
    ],
  },
];

function ClubShowcaseRow({ club, index }) {
  const images = [club.coverImage, ...(club.gallery || [])];
  const [currentIdx, setCurrentIdx] = useState(0);
  const isEven = index % 2 === 0;

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`theme-bg-card border theme-border rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all grid grid-cols-1 lg:grid-cols-12 items-stretch`}>
      
      {/* Large Media Column */}
      <div className={`relative h-72 sm:h-96 lg:h-auto lg:col-span-6 overflow-hidden bg-zinc-900 group ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
        <img
          src={images[currentIdx]}
          alt={club.name}
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Story Progress Bars */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10 pointer-events-none">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i === currentIdx ? 'bg-emerald-400 shadow-md' : 'bg-white/30 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-8 left-4 z-10">
          <span className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 uppercase font-bold tracking-wider">
            {club.category}
          </span>
        </div>

        {/* Carousel Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-emerald-500 hover:text-black text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-emerald-500 hover:text-black text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 backdrop-blur-sm border border-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Members pill on photo */}
        <div className="absolute bottom-4 left-4 text-xs font-mono text-zinc-200 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>{club.members}</span>
        </div>
      </div>

      {/* Expanded Content Column */}
      <div className={`p-8 lg:p-10 lg:col-span-6 flex flex-col justify-between space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold theme-text-primary leading-tight">
            {club.name}
          </h2>
          <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
            {club.description}
          </p>

          {/* Activity Highlights */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Activity & Achievements:
            </span>
            <ul className="space-y-2">
              {club.highlights.map((item, idx) => (
                <li key={idx} className="text-xs theme-text-secondary flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Location & Time Footer Bar */}
        <div className="pt-6 border-t theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono theme-text-secondary">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{club.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{club.location}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function PublicClubsPage() {
  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black min-h-screen">
      
      {/* Student Portal Restricted Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-mono">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Enrollment & active membership are strictly managed through the Student Portal.</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:underline shrink-0"
          >
            <span>Student Portal Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="py-16 md:py-20 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-4 uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Extracurricular Showcase
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold">Student Clubs & Communities</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-3 max-w-2xl leading-relaxed">
            Explore the active student-led organizations, workshops, and extracurricular achievements taking place across our school.
          </p>
        </div>
      </section>

      {/* Expansive Horizontal Clubs Showcase */}
      <div className="max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        {PUBLIC_CLUBS.map((club, idx) => (
          <ClubShowcaseRow key={club.id} club={club} index={idx} />
        ))}
      </div>
    </div>
  );
}