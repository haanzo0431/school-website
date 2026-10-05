'use client';

import { useState } from 'react';
import { YEAR_METRICS, CATEGORIES, ACHIEVEMENTS } from '@/data/achievements';
import {
  Trophy,
  GraduationCap,
  Award,
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';

export default function AchievementHub() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const years = [2023, 2024, 2025, 2026];

  // Filter achievements by both Year and Category
  const filteredAchievements = ACHIEVEMENTS.filter((item) => {
    const matchesYear = item.year === selectedYear;
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesYear && matchesCategory;
  });

  const metrics = YEAR_METRICS[selectedYear] || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 space-y-8">
      
      {/* Header & Combined Controls */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h2 className="text-3xl font-serif font-bold theme-text-primary">
              The Honor Wall
            </h2>
            <p className="text-xs theme-text-secondary mt-1">
              Select an academic year and filter by category to explore verified student victories.
            </p>
          </div>

          {/* Year Selector Bar (Auto-Play removed) */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl theme-bg-card border theme-border">
            {years.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'theme-text-secondary hover:theme-text-primary hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {year}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'theme-bg-card theme-border theme-text-secondary hover:theme-text-primary'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Stats Banner for Selected Year */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl theme-bg-card border theme-border space-y-1"
          >
            <div className="flex items-center justify-between text-xs theme-text-secondary font-mono">
              <span>{m.label}</span>
              <span className="text-[10px] opacity-60">{selectedYear}</span>
            </div>
            <div className="text-2xl font-serif font-bold text-amber-400">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAchievements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl theme-bg-card border theme-border space-y-4 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    item.badgeColor === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  }`}
                >
                  {item.badge}
                </span>
                <span className="text-xs font-mono theme-text-secondary">
                  {item.date}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold theme-text-primary group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs theme-text-secondary mt-1">
                  {item.subtitle}
                </p>
              </div>

              {item.detail && (
                <p className="text-xs font-mono text-emerald-400/90 pt-2 border-t theme-border">
                  {item.detail}
                </p>
              )}

              {item.teamName && (
                <div className="pt-2 border-t theme-border flex items-center justify-between text-xs font-mono">
                  <span className="theme-text-secondary">Team</span>
                  <span className="text-sky-400 font-bold">{item.teamName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl theme-bg-card border theme-border space-y-2">
          <p className="text-sm font-mono theme-text-secondary">
            No achievements recorded under "{CATEGORIES.find((c) => c.id === selectedCategory)?.label}" for {selectedYear}.
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-emerald-400 hover:underline font-mono"
          >
            Reset to All Heroes
          </button>
        </div>
      )}

    </div>
  );
}