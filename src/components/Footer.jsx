import favicon from '../assets/favicon.png';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card mt-16">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <img src={favicon} alt="Netrum" className="w-5 h-5" />
          <span>© 2025 Netrum</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          <span>UI inspired by Netrum</span>
          <span>•</span>
          <span>Built by Mow</span>
        </div>
      </div>
    </footer>
  );
}
