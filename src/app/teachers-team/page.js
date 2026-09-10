'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Users, Mail, Phone, Award } from 'lucide-react';

export default function TeachersTeam() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true);
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: true });

      setTeachers(data || []);
      setLoading(false);
    }

    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-4 uppercase font-semibold">
            <Users className="w-3.5 h-3.5" /> Faculty Directory
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">
            Our Teachers Team
          </h1>
          <p className="text-sm theme-text-secondary max-w-xl leading-relaxed">
            Meet the dedicated educators and mentors shaping the future of students at Xonqa district.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl w-full mx-auto px-6 flex-grow">
        {loading ? (
          <div className="text-center py-12 font-mono text-xs theme-text-secondary">Loading faculty members...</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12 border theme-border rounded-2xl theme-bg-card">
            <p className="text-xs theme-text-secondary">No teachers added to the directory yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="theme-bg-card border theme-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-serif font-bold text-lg mb-4">
                    {teacher.name ? teacher.name.charAt(0) : 'T'}
                  </div>
                  <h3 className="text-lg font-serif font-bold theme-text-primary">{teacher.name}</h3>
                  <p className="text-xs font-mono text-emerald-500 uppercase">{teacher.subject || 'Instructor'}</p>
                  <p className="text-xs theme-text-secondary leading-relaxed pt-2">{teacher.bio || 'Dedicated educator at Xonqa district school.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}