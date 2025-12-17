import favicon from '../assets/logo.png';

export default function Header() {
  return (
    <header className="bg-white border border-gray-200 rounded-xl shadow-md mx-4 my-4">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={favicon} 
            alt="Netrum" 
            className="h-12 w-auto object-contain bg-transparent" 
          />
        </div>

        <div className="text-base text-gray-400 font-semibold">
          Node Dashboard
        </div>
      </div>
    </header>
  );
}
