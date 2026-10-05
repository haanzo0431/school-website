'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Play,
  ExternalLink,
} from 'lucide-react';

// Custom Brand SVG Icons (since lucide-react deprecated brand logos)
function InstagramIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3v6Z" />
    </svg>
  );
}

function TelegramIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// 8 Editable Cards: Replace imageUrl, link, platform, title, and description
const SOCIAL_FEED = [
  {
    id: '1',
    platform: 'instagram',
    title: 'School Sports Olympiad Highlights',
    description: 'Our basketball team took 1st place in the regional championship!',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
    link: 'https://instagram.com',
    date: 'Sep 12, 2026',
  },
  {
    id: '2',
    platform: 'telegram',
    title: 'New Robotics Club Registration',
    description: 'Join the STEM laboratory every Tuesday & Thursday at 15:00.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
    link: 'https://t.me',
    date: 'Sep 10, 2026',
  },
  {
    id: '3',
    platform: 'youtube',
    title: 'Xorazm Student Science Fair Vlog',
    description: 'Watch full project presentations and experiments by 10th graders.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    link: 'https://youtube.com',
    date: 'Sep 08, 2026',
  },
  {
    id: '4',
    platform: 'facebook',
    title: 'Teacher Community Workshop',
    description: 'Interactive discussion on modern digital learning methods.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    link: 'https://facebook.com',
    date: 'Sep 05, 2026',
  },
  {
    id: '5',
    platform: 'instagram',
    title: 'Art & Design Gallery Exhibition',
    description: 'Student paintings displayed in the central hall this week.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    link: 'https://instagram.com',
    date: 'Sep 03, 2026',
  },
  {
    id: '6',
    platform: 'telegram',
    title: 'Weekly Examination Schedule',
    description: 'Check official time slots for midterm academic tests.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
    link: 'https://t.me',
    date: 'Sep 01, 2026',
  },
  {
    id: '7',
    platform: 'youtube',
    title: 'School Choir Performance',
    description: 'Live performance of national classical songs at autumn concert.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    link: 'https://youtube.com',
    date: 'Aug 28, 2026',
  },
  {
    id: '8',
    platform: 'instagram',
    title: 'Chess Tournament Finalists',
    description: 'Congratulations to our high school chess champions!',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800&auto=format&fit=crop',
    link: 'https://instagram.com',
    date: 'Aug 25, 2026',
  },
];

function SocialBadge({ platform }) {
  switch (platform) {
    case 'instagram':
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg border-2 border-[var(--bg-page)]">
          <InstagramIcon className="w-5 h-5" />
        </div>
      );
    case 'telegram':
      return (
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg border-2 border-[var(--bg-page)]">
          <TelegramIcon className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
        </div>
      );
    case 'youtube':
      return (
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg border-2 border-[var(--bg-page)]">
          <YoutubeIcon className="w-5 h-5" />
        </div>
      );
    case 'facebook':
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg border-2 border-[var(--bg-page)]">
          <FacebookIcon className="w-5 h-5" />
        </div>
      );
  }
}

export default function Home() {
  // Duplicating array for infinite smooth looping
  const marqueeItems = [...SOCIAL_FEED, ...SOCIAL_FEED];

  return (
    <div className="theme-bg-page theme-text-primary selection:bg-emerald-500 selection:text-black min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Hero Header */}
      <section className="px-6 pt-16 pb-8 md:pt-20 md:pb-12 max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold tracking-wider uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Welcome to Xonqa IM
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight theme-text-primary max-w-2xl leading-[1.1] mb-4">
              Shaping Future Leaders of Xorazm
            </h1>
            <p className="theme-text-secondary text-sm md:text-base max-w-lg leading-relaxed">
              Discover our modern educational programs, student achievements, and social media community feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-full text-xs font-bold transition-all shadow-md"
            >
              Explore Clubs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Animated Social Media Ticker Section */}
      <section className="relative w-full py-12 my-4">
        {/* Horizontal Line Across Screen */}
        <div className="absolute top-[32px] left-0 right-0 h-[2px] bg-[var(--border-color)] z-0" />

        {/* Gradient edge overlays for smooth side fading */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[var(--bg-page)] to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[var(--bg-page)] to-transparent z-20" />

        {/* Continuous Marquee Container */}
        <div className="overflow-hidden w-full">
          <div className="animate-marquee gap-6 pl-6">
            {marqueeItems.map((item, index) => (
              <a
                key={`${item.id}-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center shrink-0 w-[280px] md:w-[320px] cursor-pointer"
              >
                {/* 1. Social Logo riding on top of line */}
                <div className="z-10 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <SocialBadge platform={item.platform} />
                </div>

                {/* 2. Photo/Video Card with Blurry Bottom Overlay */}
                <div className="w-full h-[360px] md:h-[400px] rounded-3xl overflow-hidden relative border theme-border theme-bg-card shadow-xl transition-all duration-300 group-hover:border-emerald-500/50 group-hover:shadow-2xl">
                  {/* Media Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Play icon badge if video platform */}
                  {(item.platform === 'youtube' || item.platform === 'instagram') && (
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  )}

                  {/* Blurry / Glassmorphic Caption Box at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-black/65 backdrop-blur-md border-t border-white/10 text-white flex flex-col justify-end transition-all duration-300 group-hover:bg-black/75">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mb-1.5">
                      <span className="uppercase tracking-wider font-semibold text-emerald-400">
                        {item.platform}
                      </span>
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-white leading-snug mb-1.5 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Open Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}