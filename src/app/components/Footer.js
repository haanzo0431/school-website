import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t theme-border theme-bg-page py-6 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs theme-text-secondary font-mono">
      <p>© 2026 The Khanka IM.</p>
      
      <div className="flex items-center gap-6">
        <a
          href="https://t.me/SSinKhanka"
          target="_blank"
          rel="noreferrer"
          className="hover:text-emerald-500 transition-colors"
        >
          Telegram
        </a>
        <a
          href="https://www.instagram.com/xonqa"
          target="_blank"
          rel="noreferrer"
          className="hover:text-emerald-500 transition-colors"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
}