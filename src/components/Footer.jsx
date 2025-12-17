import favicon from '../assets/logo.png'; 

export default function Footer() {
  return (
    <footer className="w-full bg-white border border-gray-200 rounded-xl shadow-inner mt-6">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo + Copyright */}
        <div className="flex items-center gap-2">
          <img 
            src={favicon} 
            alt="Netrum" 
            className="h-12 w-auto object-contain" 
          />
          <span className="text-sm text-gray-500">© 2025 Netrum AI Labs</span>
        </div>

        {/* Info */}
        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end text-gray-400 text-sm font-semibold mt-2 sm:mt-0">
          <span>UI inspired by Netrum</span>
          <span>•</span>
          <span>BuildOnBase</span>
          <span>•</span>
          <span>Built by Mow</span>
        </div>
      </div>
    </footer>
  );
}
