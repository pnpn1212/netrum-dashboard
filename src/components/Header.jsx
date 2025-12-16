import favicon from '../assets/favicon.png';

export default function Header() {
  return (
    <header className="bg-[#f9fafb] border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-3 font-bold tracking-wide text-2xl text-gray-900">
          <img 
            src={favicon} 
            alt="Netrum" 
            className="w-8 h-8 object-contain bg-transparent" 
          />
          <span>Netrum</span>
        </div>

        {/* Subtitle */}
        <div className="text-sm text-gray-600 font-medium">
          Node Dashboard
        </div>
      </div>
    </header>
  );
}
