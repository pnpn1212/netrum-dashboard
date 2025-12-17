export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl p-5 min-h-[140px] shadow-lg ${className}`}
    >
      <div className="text-xs text-gray-200 mb-2 uppercase">{title}</div>
      {children}
    </div>
  );
}
