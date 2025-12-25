import favicon from '../assets/logo.png'; 

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-slate-800/60 backdrop-blur-xl border-t border-slate-600/50 shadow-xl z-20">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={favicon} 
            alt="Netrum" 
            className="h-12 w-auto object-contain bg-slate-800/60 rounded-lg p-1" 
          />
          <span className="text-sm text-slate-300">© 2025 Netrum AI Labs</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end text-slate-400 text-sm font-semibold mt-2 sm:mt-0">
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
