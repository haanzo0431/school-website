'use client';

// Correct default import (NO curly braces)
import PublicHeader from '@/app/components/PublicHeader';
import Footer from '@/app/components/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}