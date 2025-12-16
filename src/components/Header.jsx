import favicon from '../assets/favicon.png';

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0b0f14]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Favicon */}
        <div className="flex items-center gap-2 font-bold tracking-wide text-lg">
          <img src={favicon} alt="Netrum" className="w-6 h-6" />
          <span>Netrum</span>
        </div>

        <div className="text-xs text-gray-400">
          Node Dashboard
        </div>
      </div>
    </header>
  );
}

