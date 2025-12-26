import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";
import { 
  Users, 
  Wifi, 
  PauseCircle, 
  ListChecks, 
  Network, 
  Activity, 
  TrendingUp,
  Zap,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

function GradientSpinner({ className = "" }) {
  return (
    <div className={`inline-block w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin ${className}`} />
  );
}

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} • ${p(
    d.getDate()
  )}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatNumber(num) {
  if (num === null || num === undefined) return "-";
  return Number(num).toLocaleString("en-US");
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatsCard({ title, value, subtitle, icon: Icon, variant, loading, trend, percentage, trendIcon: TrendIcon, showPercentage = true, showTrend = true }) {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "bg-gradient-to-br from-blue-500/20 to-purple-600/20",
          border: "border-blue-500/30",
          icon: "bg-blue-500/20 text-blue-400",
          glow: "shadow-lg shadow-blue-500/10"
        };
      case "success":
        return {
          bg: "bg-gradient-to-br from-emerald-500/20 to-teal-600/20", 
          border: "border-emerald-500/30",
          icon: "bg-emerald-500/20 text-emerald-400",
          glow: "shadow-lg shadow-emerald-500/10"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-br from-orange-500/20 to-red-600/20",
          border: "border-orange-500/30", 
          icon: "bg-orange-500/20 text-orange-400",
          glow: "shadow-lg shadow-orange-500/10"
        };
      case "tasks":
        return {
          bg: "bg-gradient-to-br from-purple-500/20 to-pink-600/20",
          border: "border-purple-500/30",
          icon: "bg-purple-500/20 text-purple-400", 
          glow: "shadow-lg shadow-purple-500/10"
        };
      default:
        return {
          bg: "bg-gradient-to-br from-slate-600/20 to-slate-700/20",
          border: "border-slate-500/30",
          icon: "bg-slate-500/20 text-slate-400",
          glow: "shadow-lg shadow-slate-500/10"
        };
    }
  };

  const style = getVariantStyle();

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl",
      style.bg,
      style.border,
      style.glow
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">{title}</p>
            {trend && showTrend && (
              <div className="flex items-center gap-1 mt-0.5">
                {TrendIcon ? (
                  <TrendIcon className={cn(
                    "w-2.5 h-2.5",
                    trend.includes('↗') ? "text-emerald-400" : 
                    trend.includes('↘') ? "text-red-400" : "text-emerald-400"
                  )} />
                ) : (
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend.includes('↗') ? "text-emerald-400" : 
                  trend.includes('↘') ? "text-red-400" : "text-emerald-400"
                )}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          
          <div className={cn("p-2 rounded-lg backdrop-blur-sm", style.icon)}>
            <Icon className="h-3 w-3" />
          </div>
        </div>

        <div className="mb-2">
          {loading ? (
            <Skeleton className="w-16 h-5 mb-1" />
          ) : (
            <p className="text-lg font-bold font-mono text-white">
              {value ?? "-"}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{subtitle ?? "-"}</p>
            {percentage !== undefined && showPercentage && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full animate-pulse bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  {percentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        {percentage !== undefined && !loading && showPercentage && (
          <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12 animate-pulse" />
        )}
      </div>
    </div>
  );
}

export default function LiteStats() {
  const [data, setData] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousData, setPreviousData] = useState({});
  const [animatedPercentages, setAnimatedPercentages] = useState({});
  const [showPercentages, setShowPercentages] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [dataFullyLoaded, setDataFullyLoaded] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return null;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down',
      isPositive: change > 0
    };
  };

  const animatePercentage = (key, targetValue) => {
    const startValue = animatedPercentages[key] || 0;
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic);
      
      setAnimatedPercentages(prev => ({
        ...prev,
        [key]: currentValue
      }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const fetchStats = async () => {
    setCountdown(300);
    setIsRefreshing(true);
    
    try {
      const r = await api.liteStats();
      if (r?.error) {
        setErr(r.error);
        setIsCountdownActive(true);
      } else {
        if (Object.keys(data).length > 0) {
          setPreviousData({ ...data });
        }
        
        setErr("");
        const newData = r || {};

        if (!newData || (typeof newData === 'object' && Object.keys(newData).length === 0)) {
          setErr("Waiting for valid data...");
          setIsCountdownActive(true);
        } else {
          setData(newData);
          setLastUpdate(new Date().toISOString());
          
          setShowPercentages(false);
          setDataFullyLoaded(false);
          
          setTimeout(() => {
            setShowPercentages(true);
            
            const newActivePercentage = newData.total ? Math.round((newData.active / newData.total) * 100) : 0;
            const newInactivePercentage = newData.total ? Math.round((newData.inactive / newData.total) * 100) : 0;
            const newTaskEfficiency = newData.active && newData.totalTasks ? 
              Math.round((newData.totalTasks / newData.active) * 100) : 0;
              
            animatePercentage('active', newActivePercentage);
            animatePercentage('inactive', newInactivePercentage);
            animatePercentage('taskEfficiency', Math.min(newTaskEfficiency, 100));
            
            setTimeout(() => {
              setDataFullyLoaded(true);
              setIsCountdownActive(true);
            }, 2300);
          }, 800); 
        }
      }
    } catch (e) {
      setErr("Unable to fetch network stats");
      setIsCountdownActive(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    let currentCountdown = 300;
    const timer = setInterval(() => {
      currentCountdown--;
      
      if (currentCountdown <= 0) {
        fetchStats();
        currentCountdown = 300;
      }
      
      setCountdown(currentCountdown);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const displayData = {
    total: data.total ?? null,
    active: data.active ?? null,
    inactive: data.inactive ?? null,
    totalTasks: data.totalTasks ?? null,
    time: data.time ?? null,
  };

  const getStatusIndicator = () => {
    if (loading || isRefreshing) return { color: 'bg-yellow-500', spinner: true };
    if (err) return { color: 'bg-red-500', text: 'Error' };
    return { color: 'bg-emerald-500', text: 'Live' };
  };

  const status = getStatusIndicator();

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm shadow-lg shadow-blue-500/20">
              <Network className="h-4 w-4 text-blue-400" />
            </div>
            <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${status.color} animate-pulse border border-slate-900`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-white">
                Network Overview
              </h2>
              {status.spinner && (
                <GradientSpinner className="text-yellow-400" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {!loading && displayData.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatTime(displayData.time)}</span>
                </div>
              )}
              
              {(!loading || err) && (
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Next refresh in {formatCountdown(countdown)}</span>
                </div>
              )}
              
              {loading && (
                <div className="flex items-center gap-1">
                  <Skeleton className="w-16 h-3" />
                </div>
              )}
            </div>

            {err && (
              <div className="mt-1 flex items-center gap-1 text-red-400 text-xs">
                <XCircle className="w-3 h-3" />
                <span>{err}</span>
              </div>
            )}
          </div>
        </div>

        {!loading && displayData.total && (
          <div className="hidden lg:flex items-center gap-4 text-center">
            <div className="flex flex-col">
              <div className="text-sm font-bold text-emerald-400">
                {Math.round((displayData.active / displayData.total) * 100)}%
              </div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="flex flex-col">
              <div className="text-sm font-bold text-purple-400">
                {formatNumber(displayData.totalTasks || 0)}
              </div>
              <div className="text-xs text-slate-400">Tasks</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatsCard
          title="Network Nodes"
          value={loading ? null : formatNumber(displayData.total)}
          subtitle="Total registered nodes"
          icon={Users}
          variant="primary"
          loading={loading}
          percentage={100}
          showPercentage={showPercentages}
          showTrend={showPercentages}
          trend={calculateTrend(displayData.total, previousData.total)?.direction === 'up' ? "↗ +" + calculateTrend(displayData.total, previousData.total)?.value + "%" : calculateTrend(displayData.total, previousData.total)?.direction === 'down' ? "↘ -" + calculateTrend(displayData.total, previousData.total)?.value + "%" : null}
        />

        <StatsCard
          title="Active Nodes"
          value={loading ? null : formatNumber(displayData.active)}
          subtitle="Currently online"
          icon={Wifi}
          variant="success"
          loading={loading}
          percentage={animatedPercentages.active || 0}
          showPercentage={showPercentages}
          showTrend={showPercentages}
          trend={calculateTrend(displayData.active, previousData.active)?.direction === 'up' ? "↗ +" + calculateTrend(displayData.active, previousData.active)?.value + "%" : calculateTrend(displayData.active, previousData.active)?.direction === 'down' ? "↘ -" + calculateTrend(displayData.active, previousData.active)?.value + "%" : (animatedPercentages.active || 0) > 80 ? "Excellent" : (animatedPercentages.active || 0) > 60 ? "Good" : "Fair"}
        />

        <StatsCard
          title="Inactive Nodes"
          value={loading ? null : formatNumber(displayData.inactive)}
          subtitle="Offline / maintenance"
          icon={PauseCircle}
          variant="warning"
          loading={loading}
          percentage={animatedPercentages.inactive || 0}
          showPercentage={showPercentages}
          showTrend={showPercentages}
          trend="Downtime"   
        />

        <StatsCard
          title="Total Tasks"
          value={loading ? null : formatNumber(displayData.totalTasks)}
          subtitle="Processed successfully"
          icon={ListChecks}
          variant="tasks"
          loading={loading}
          percentage={animatedPercentages.taskEfficiency || 0}
          showPercentage={showPercentages}
          showTrend={showPercentages}
          trend={calculateTrend(displayData.totalTasks, previousData.totalTasks)?.direction === 'up' ? "↗ +" + calculateTrend(displayData.totalTasks, previousData.totalTasks)?.value + "%" : calculateTrend(displayData.totalTasks, previousData.totalTasks)?.direction === 'down' ? "↘ -" + calculateTrend(displayData.totalTasks, previousData.totalTasks)?.value + "%" : (animatedPercentages.taskEfficiency || 0) > 150 ? "High efficiency" : (animatedPercentages.taskEfficiency || 0) > 100 ? "Good performance" : "Standard"}
        />
      </div>

      {!loading && displayData.total && (
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Network Health</h3>
              <p className="text-xs text-slate-400">Real-time performance metrics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">System Load</span>
                <Zap className="w-3 h-3 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {showPercentages ? `${animatedPercentages.active || 0}%` : '-'}
              </div>
              {showPercentages && (
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedPercentages.active || 0}%` }}
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">Task Efficiency</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {showPercentages ? `${animatedPercentages.taskEfficiency || 0}%` : '-'}
              </div>
              <div className="text-xs text-slate-400">Performance efficiency</div>
            </div>

            <div className="bg-slate-800/40 rounded-lg p-2 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">Network Status</span>
                <Activity className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 mb-1">Online</div>
              <div className="text-xs text-slate-400">All systems operational</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}