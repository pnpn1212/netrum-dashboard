import { X } from "lucide-react";

function GradientSpinner({ className = "" }) {
  return (
    <div className={`inline-block w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin ${className}`} />
  );
}

export default function NodeTooltip({ isOpen, onClose, children, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 transition-colors"
        >
          <X className="h-5 w-5 text-slate-300 hover:text-white" />
        </button>

        <div className="mb-6 pr-12">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">Node Information</h2>
            {loading && <GradientSpinner className="border-t-emerald-400 border-r-teal-400" />}
          </div>
          <p className="text-sm text-slate-300">Detailed node statistics and wallet information</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
