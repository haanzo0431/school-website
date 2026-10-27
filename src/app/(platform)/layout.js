'use client';

import PlatformSidebar from '@/app/components/PlatformSidebar';

export default function PlatformLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden theme-bg-page theme-text-primary">
      <PlatformSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}