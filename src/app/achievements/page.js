'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Trophy, Star } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
            <Trophy className="w-3.5 h-3.5" /> Excellence & Milestones
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">School Achievements</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-1">Celebrating academic milestones, olympiad wins, and community impact.</p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        <div className="theme-bg-card border theme-border rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3 shadow-sm">
          <Star className="w-10 h-10 text-emerald-500 mx-auto opacity-75" />
          <h2 className="text-lg font-serif font-bold theme-text-primary">Milestones Unfolding</h2>
          <p className="text-xs theme-text-secondary">Student and district achievements will be regularly showcased here.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}