'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <section className="py-16 border-b theme-border bg-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono mb-3 uppercase font-semibold">
            <Mail className="w-3.5 h-3.5" /> Get in Touch
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Contact Us</h1>
          <p className="text-xs md:text-sm theme-text-secondary mt-1">Reach out to administration or faculty for inquiries.</p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="theme-bg-card border theme-border rounded-2xl p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-serif font-bold theme-text-primary">Contact Information</h2>
          <div className="space-y-4 text-xs theme-text-secondary">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Xonqa District, Xorazm Region, Uzbekistan</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>+998 (62) 000-00-00</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>info@xonqatuman.uz</span>
            </div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-2xl p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-serif font-bold theme-text-primary">Send Message</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Sent!'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-mono theme-text-secondary mb-1">Your Name</label>
              <input type="text" placeholder="John Doe" className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs font-mono theme-text-secondary mb-1">Email</label>
              <input type="email" placeholder="john@example.com" className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-xs font-mono theme-text-secondary mb-1">Message</label>
              <textarea placeholder="..." rows={4} className="w-full theme-bg-input border theme-border rounded-xl p-3 text-xs theme-text-primary outline-none focus:border-emerald-500" required />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}