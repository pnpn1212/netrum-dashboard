import React, { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../api/netrumApi";
import { Power, Cpu, MemoryStick, HardDrive, Network, AlertCircle } from "lucide-react";

function GradientSpinner({ className = "" }) {
  return (
    <div className={`inline-block w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin ${className}`} />
  );
}

interface RequirementsData {
  CORES?: number;
  RAM?: number;
  STORAGE?: number;
  DOWNLOAD_SPEED?: number;
  UPLOAD_SPEED?: number;
}

interface ApiResponse {
  requirements?: RequirementsData;
  error?: string;
  cooldown?: boolean;
}

interface RequirementItem {
  title: string;
  value: string | null;
  icon: any;
  status: 'loading' | 'empty' | 'error' | 'success';
}

const SkeletonLoader: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-lg ${className}`} />
);

const RequirementCard: React.FC<{
  title: string;
  value: string | null;
  icon: any;
  status: 'loading' | 'empty' | 'error' | 'success';
  delay?: number;
}> = React.memo(({ title, value, icon: Icon, status, delay = 0 }) => {
  const getVariantStyle = () => {
    switch (status) {
      case 'success': 
        return {
          bg: "bg-slate-800/40 hover:bg-slate-800/60",
          border: "border-slate-700/50",
          icon: "bg-slate-700/50 text-slate-300",
          glow: "shadow-lg shadow-slate-500/5"
        };
      case 'error': 
        return {
          bg: "bg-slate-800/40 hover:bg-slate-800/60",
          border: "border-slate-700/50", 
          icon: "bg-slate-700/50 text-slate-300",
          glow: "shadow-lg shadow-slate-500/5"
        };
      case 'empty': 
        return {
          bg: "bg-slate-800/40 hover:bg-slate-800/60",
          border: "border-slate-700/50",
          icon: "bg-slate-700/50 text-slate-300", 
          glow: "shadow-lg shadow-slate-500/5"
        };
      default: 
        return {
          bg: "bg-slate-800/40 hover:bg-slate-800/60",
          border: "border-slate-700/50",
          icon: "bg-slate-700/50 text-slate-300",
          glow: "shadow-lg shadow-slate-500/5"
        };
    }
  };

  const style = getVariantStyle();

  const getStatusIcon = () => {
    if (status === 'error') return <AlertCircle className="h-3 w-3 text-red-400" />;
    if (status === 'empty') return <AlertCircle className="h-3 w-3 text-orange-400" />;
    return null;
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl transition-colors ${style.bg} ${style.border} ${style.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      
      <div className="relative p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-300">{title}</p>
            {status !== 'loading' && (
              <div className="flex items-center gap-1 mt-0.5">
                {getStatusIcon()}
              </div>
            )}
          </div>
          
          <div className={`p-1 rounded ${style.icon}`}>
            <Icon className="h-3 w-3" />
          </div>
        </div>

        <div className="mt-1.5">
          {status === 'loading' ? (
            <div className="space-y-0.5">
              <SkeletonLoader className="w-10 h-3" />
              <SkeletonLoader className="w-5 h-2" />
            </div>
          ) : status === 'error' ? (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-2 w-2 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Error</span>
            </div>
          ) : status === 'empty' ? (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-2 w-2 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Not available</span>
            </div>
          ) : (
            <p className="text-xs font-bold font-mono text-white">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

const EmptyState: React.FC = () => (
  <div className="bg-slate-800/40 border border-slate-600/50 rounded-xl p-4">
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <Power className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">No System Requirements</h3>
      <p className="text-xs text-slate-400 max-w-sm">
        Unable to load system requirements. This could be due to network issues or the API being temporarily unavailable.
      </p>
    </div>
  </div>
);

const SystemRequirements: React.FC = () => {
  const [data, setData] = useState<RequirementsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRequirements = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
      } else {
        setLoading(true);
        setIsRefreshing(true);
        setError(null);
      }

      const result: ApiResponse = await api.requirements();
      
      if (result.error) {
        setError(result.error);
        if (isRetry) {
          const nextDelay = Math.min(Math.pow(2, retryCount) * 1000, 60000);
          setRetryCount(prev => prev + 1);

          setTimeout(() => {
            fetchRequirements(true);
          }, nextDelay);
        }
      } else if (result.requirements) {
        setData(result.requirements);
        setError(null);
        setRetryCount(0);
      } else {
        setError('No data received');
        if (isRetry) {
          const nextDelay = Math.min(Math.pow(2, retryCount) * 1000, 60000);
          setRetryCount(prev => prev + 1);
          
          setTimeout(() => {
            fetchRequirements(true);
          }, nextDelay);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      if (isRetry) {
        const nextDelay = Math.min(Math.pow(2, retryCount) * 1000, 60000);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          fetchRequirements(true);
        }, nextDelay);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const displayData = useMemo<RequirementItem[]>(() => {
    const items: RequirementItem[] = [
      {
        title: "Processor",
        value: data.CORES ? `${data.CORES} Cores` : null,
        icon: Cpu,
        status: data.CORES ? 'success' : (loading ? 'loading' : 'empty')
      },
      {
        title: "Memory", 
        value: data.RAM ? `${data.RAM} GB RAM` : null,
        icon: MemoryStick,
        status: data.RAM ? 'success' : (loading ? 'loading' : 'empty')
      },
      {
        title: "Storage",
        value: data.STORAGE ? `${data.STORAGE} GB SSD` : null,
        icon: HardDrive,
        status: data.STORAGE ? 'success' : (loading ? 'loading' : 'empty')
      },
      {
        title: "Network Speed",
        value: data.DOWNLOAD_SPEED && data.UPLOAD_SPEED 
          ? `↓ ${data.DOWNLOAD_SPEED} / ↑ ${data.UPLOAD_SPEED} Mbps`
          : null,
        icon: Network,
        status: (data.DOWNLOAD_SPEED && data.UPLOAD_SPEED) ? 'success' : (loading ? 'loading' : 'empty')
      },
    ];

    return items;
  }, [data, loading]);

  const hasData = useMemo(() => {
    return Object.values(data).some(value => value !== undefined && value !== null);
  }, [data]);

  if (loading && !hasData) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
            <Power className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white">
                System Requirements
              </h2>
              {isRefreshing && (
                <GradientSpinner className="border-t-emerald-400 border-r-teal-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <SkeletonLoader className="w-12 h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {displayData.map((_, index) => (
            <RequirementCard
              key={index}
              title=""
              value={null}
              icon={Cpu}
              status="loading"
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !hasData && retryCount === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
            <Power className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white">
                System Requirements
              </h2>
              {isRefreshing && (
                <GradientSpinner className="border-t-emerald-400 border-r-teal-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          </div>
        </div>

        <EmptyState />
      </div>
    );
  }

  if (error && !hasData && retryCount > 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
            <Power className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white">
                System Requirements
              </h2>
              <GradientSpinner className="border-t-emerald-400 border-r-teal-400" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonLoader className="w-12 h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {displayData.map((_, index) => (
            <RequirementCard
              key={index}
              title=""
              value={null}
              icon={Cpu}
              status="loading"
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
          <Power className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-bold text-white">
              System Requirements
            </h2>
            {isRefreshing && (
              <GradientSpinner className="border-t-emerald-400 border-r-teal-400" />
            )}
          </div>
          {!loading && !error && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Minimum hardware specifications</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {displayData.map((item, index) => (
          <RequirementCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            status={item.status}
            delay={index * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default SystemRequirements;
