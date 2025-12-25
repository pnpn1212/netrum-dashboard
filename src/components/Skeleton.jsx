export default function Skeleton({ className = "" }) {
  return (
    <div className={`
      animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg ${className}
      bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]
    `} />
  );
}
