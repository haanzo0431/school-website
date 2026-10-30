'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/app/context/UserContext';
import PlatformSidebar from '@/app/components/PlatformSidebar';

function PlatformGuard({ children }) {
  const { user, role, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      router.replace('/platform');
    }
  }, [user, role, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center theme-bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || (pathname.startsWith('/admin') && role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden theme-bg-page theme-text-primary">
      <PlatformSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}

export default function PlatformLayout({ children }) {
  return (
    <UserProvider>
      <PlatformGuard>{children}</PlatformGuard>
    </UserProvider>
  );
}
