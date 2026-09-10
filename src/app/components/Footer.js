export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 py-8 px-8 mt-auto flex justify-between items-center text-sm text-neutral-500">
      <p>© 2026 The Khanka IM</p>
      <div className="flex gap-6 font-medium">
        <a href="#" className="hover:text-emerald-400 transition">Telegram</a>
        <a href="#" className="hover:text-emerald-400 transition">Instagram</a>
      </div>
    </footer>
  );
}