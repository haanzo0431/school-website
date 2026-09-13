'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Code,
  BookOpen,
  Award,
  Sparkles,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Send,
} from 'lucide-react';

const CLUBS_DATA = [
  {
    id: 'it-coding',
    name: 'IT & Coding Club',
    category: 'STEM & Tech',
    lead: 'Jasur Karimov (Grade 10-A)',
    advisor: 'Mr. Alisher',
    members: 24,
    meeting: 'Wednesdays @ 15:30',
    room: 'Computer Lab 2',
    description:
      'Learn modern web development, Python programming, and build real-world software projects for the school community.',
    tags: ['Web Dev', 'Python', 'Algorithms'],
    icon: Code,
  },
  {
    id: 'press-journalism',
    name: 'School Press & Journalism',
    category: 'Arts & Media',
    lead: 'Madina Rashidova (Grade 11-B)',
    advisor: 'Mrs. Nodira',
    members: 18,
    meeting: 'Mondays @ 15:00',
    room: 'Media Center',
    description:
      'Report on school achievements, publish student interviews, and write featured articles for the Xonqa Maktab Platform.',
    tags: ['Writing', 'Interviews', 'News'],
    icon: BookOpen,
  },
  {
    id: 'english-debate',
    name: 'English Speaking & Debate',
    category: 'Academics',
    lead: 'Sardorbek Tokhirov (Grade 10-B)',
    advisor: 'Mr. John (ESL)',
    members: 32,
    meeting: 'Thursdays @ 16:00',
    room: 'Room 304',
    description:
      'Improve public speaking skills, practice international debate formats, and prepare for regional speech competitions.',
    tags: ['Debate', 'IELTS', 'Public Speaking'],
    icon: Sparkles,
  },
  {
    id: 'robotics-engineering',
    name: 'Robotics & Innovation Lab',
    category: 'STEM & Tech',
    lead: 'Azizbek Kuryazov (Grade 9-A)',
    advisor: 'Mr. Bekzod',
    members: 15,
    meeting: 'Fridays @ 15:00',
    room: 'STEM Workshop',
    description:
      'Build Arduino & Lego Mindstorms robots, program microcontrollers, and compete in national engineering challenges.',
    tags: ['Robotics', 'Arduino', 'Hardware'],
    icon: Award,
  },
  {
    id: 'arts-culture',
    name: 'Art & Cultural Society',
    category: 'Arts & Media',
    lead: 'Shahlo Olimova (Grade 10-A)',
    advisor: 'Mrs. Dilnoza',
    members: 20,
    meeting: 'Tuesdays @ 15:30',
    room: 'Art Studio',
    description:
      'Explore traditional Uzbek arts, modern graphic design, photography, and organize school exhibitions.',
    tags: ['Painting', 'Design', 'Photography'],
    icon: Compass,
  },
];

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [joinedClubs, setJoinedClubs] = useState({});

  const categories = ['All', 'STEM & Tech', 'Arts & Media', 'Academics'];

  const filteredClubs = CLUBS_DATA.filter((club) => {
    const matchesCategory =
      selectedCategory === 'All' || club.category === selectedCategory;
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const toggleJoin = (clubId) => {
    setJoinedClubs((prev) => ({
      ...prev,
      [clubId]: !prev[clubId],
    }));
  };

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b theme-border gap-4">
        <div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" /> Student Clubs & Societies
          </h1>
          <p className="text-xs theme-text-secondary mt-1 max-w-xl">
            Join extracurricular clubs, connect with student leaders, build new skills, and contribute to school life.
          </p>
        </div>

        <button
          onClick={() => alert('To start a new club, please consult your grade advisor or submit a proposal in the platform.')}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Register New Club
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-secondary" />
          <input
            type="text"
            placeholder="Search clubs, topics, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs theme-bg-card border theme-border focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black'
                  : 'theme-bg-card border theme-border theme-text-secondary hover:theme-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => {
          const IconComponent = club.icon;
          const isJoined = joinedClubs[club.id];

          return (
            <div
              key={club.id}
              className="p-6 theme-bg-card border theme-border rounded-3xl flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg theme-bg-page border theme-border theme-text-secondary">
                    {club.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold">{club.name}</h3>
                  <p className="text-xs theme-text-secondary mt-1.5 leading-relaxed line-clamp-3">
                    {club.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {club.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border theme-border theme-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t theme-border space-y-3">
                <div className="text-[11px] theme-text-secondary space-y-1 font-mono">
                  <p>👤 Lead: <span className="theme-text-primary">{club.lead}</span></p>
                  <p>🕒 {club.meeting} ({club.room})</p>
                  <p>👥 Active Members: <span className="theme-text-primary font-bold">{club.members + (isJoined ? 1 : 0)}</span></p>
                </div>

                <button
                  onClick={() => toggleJoin(club.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isJoined
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Member Joined
                    </>
                  ) : (
                    'Join Club'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}