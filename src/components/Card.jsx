export default function Card({ title, children }) {
  return (
    <div className="bg-[#0c1222] border border-white/5 rounded-2xl p-5 min-h-[140px]">
      <div className="text-xs text-gray-400 mb-2 uppercase">{title}</div>
      {children}
    </div>
  );
}
