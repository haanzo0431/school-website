import Footer from './components/Footer';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-neutral-800 pb-16">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-4 block">
                Featured Lead
              </span>
              <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight leading-tight mb-6">
                Empowering Student Voices & Campus Journalism.
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-8">
                Welcome to the central pulse of our school platform—where students write stories, teachers post announcements, and clubs connect the community.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link 
                href="/news" 
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition"
              >
                Read Stories
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Latest Bulletins</h2>
              <div className="space-y-4">
                <div className="border-b border-neutral-800 pb-3">
                  <span className="text-xs text-neutral-500 font-mono">TODAY</span>
                  <p className="text-sm font-medium hover:text-emerald-400 cursor-pointer mt-1">
                    Annual Science Fair registrations open next week.
                  </p>
                </div>
                <div className="border-b border-neutral-800 pb-3">
                  <span className="text-xs text-neutral-500 font-mono">YESTERDAY</span>
                  <p className="text-sm font-medium hover:text-emerald-400 cursor-pointer mt-1">
                    Debate Club wins regional finals in dramatic finish.
                  </p>
                </div>
              </div>
            </div>
            <Link href="/news" className="text-xs font-mono uppercase text-neutral-400 hover:text-white flex items-center gap-1 mt-6">
              View All Bulletins →
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}