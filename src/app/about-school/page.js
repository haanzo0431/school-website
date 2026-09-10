'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> About Our Institution
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">A Tradition of Excellence & Innovation</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-1 max-w-2xl">
            Located in the heart of Xonqa, our school has long stood as a beacon of academic rigor and character development.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="theme-bg-card border theme-border rounded-2xl p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-serif font-bold theme-text-primary">Our Mission</h2>
            <p className="text-xs theme-text-secondary leading-relaxed">
              We provide comprehensive educational paths from primary classes through high school specialization. Our goal is to cultivate critical thinking, creativity, and moral integrity so our graduates can thrive anywhere in the world.
            </p>
          </div>
          <div className="theme-bg-card border theme-border rounded-2xl p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-serif font-bold theme-text-primary">Our Vision</h2>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Empowering minds and shaping the future of Xonqa through advanced digital learning environments, community engagement, and holistic student achievement.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}