import favicon from '../assets/logo.png';

export default function Header() {
  return (
    <header className="w-full bg-slate-800/60 backdrop-blur-xl border-b border-slate-600/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={favicon} 
            alt="Netrum" 
            className="h-12 w-auto object-contain bg-slate-800/60 rounded-lg p-1" 
          />
        </div>

        <div className="text-base text-slate-200 font-semibold">
          Node Dashboard
        </div>
      </div>
    </header>
  );
}
