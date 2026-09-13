'use client';

import PlatformSidebar from '@/app/components/PlatformSidebar';

export default function PlatformLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden theme-bg-page theme-text-primary">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}