'use client';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary">
      {children}
    </div>
  );
}