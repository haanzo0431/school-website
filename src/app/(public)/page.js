'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Trophy
} from 'lucide-react';

export default function Home() {
  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold tracking-wider uppercase mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Welcome to Xonqa Tuman
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight theme-text-primary max-w-3xl leading-[1.1] mb-6">
          Shaping Future Leaders of Xorazm
        </h1>
        
        <p className="theme-text-secondary text-sm md:text-base max-w-xl mb-10 leading-relaxed">
          Discover our modern educational programs, active student clubs, and vibrant school community platform.
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-full text-xs font-bold transition-all shadow-md"
          >
            Explore Clubs <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/about-school"
            className="inline-flex items-center gap-2 theme-bg-card hover:bg-white/5 theme-text-primary px-6 py-3.5 rounded-full text-xs font-bold transition-all border theme-border"
          >
            About School
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="theme-bg-card border theme-border p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold theme-text-primary mb-3">Academic Curriculum</h3>
            <p className="theme-text-secondary text-xs leading-relaxed">
              Rigorous programs from primary grades through specialized high school classes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="theme-bg-card border theme-border p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold theme-text-primary mb-3">Active Clubs</h3>
            <p className="theme-text-secondary text-xs leading-relaxed">
              Join student-led initiatives covering sports, coding, arts, and debate.
            </p>
          </div>

          {/* Card 3 */}
          <div className="theme-bg-card border theme-border p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold theme-text-primary mb-3">District Honors</h3>
            <p className="theme-text-secondary text-xs leading-relaxed">
              Celebrating consistent olympiad victories and academic distinctions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}