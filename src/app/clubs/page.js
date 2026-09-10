import Footer from '../components/Footer';
import { Users, ArrowUpRight } from 'lucide-react';

export default function ClubsPage() {
  return (
    <>
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-16">
        <header className="mb-12 flex justify-between items-end border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Student Clubs</h1>
            <p className="text-neutral-400 text-lg">Discover organizations, join communities, and get involved.</p>
          </div>
          <button className="bg-white text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-neutral-200 transition">
            Start a Club
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Club Card */}
          {['Robotics Team', 'Debate Society', 'Art & Design', 'Chess Club', 'Drama Guild', 'Coding Wizards'].map((club) => (
            <div key={club} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition flex flex-col justify-between h-48">
              <div>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">{club}</h3>
                <p className="text-sm text-neutral-400 mt-1">Meets every Tuesday at 4 PM in Room 204.</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-800">
                <span className="text-xs font-mono text-neutral-500">24 Members</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 hover:text-white cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}