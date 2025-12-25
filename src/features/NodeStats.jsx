import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  ArrowDownUp,
  Server,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  LoaderCircle
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

function Metric({ icon, label, value }) {
  const displayValue = value === null ? <Skeleton className="w-12 h-3" /> : value;
  return (
    <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-slate-300">{label}</span>
      </div>
      <p className="font-mono text-xs text-white font-medium">{displayValue}</p>
    </div>
  );
}

export default function NodeStats({ nodeId, reloadKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setStats(null); // reset để Skeleton hiển thị
      try {
        const res = await api.checkCooldown(nodeId).catch(() => null);
        if (!active) return;
        setStats(res || null); // null vẫn giữ Skeleton
      } catch (e) {
        console.warn("NodeStats fetch warning:", e);
        if (active) setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [nodeId, reloadKey]);

  const lastSync = stats?.lastSuccessfulSync?.details || {};
  const metrics = lastSync.metrics || {};
  const isActive = lastSync.syncStatus === "Active";
  const meetsRequirements = lastSync?.meetsRequirements ?? null;
  const lastSyncTimestamp = stats?.lastSuccessfulSync?.timestamp ?? null;

  const fmtNumber = (n, d = 2) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  function formatDisk(gb) {
    if (gb === null || gb === undefined) return null;
    if (gb >= 1000) return `${(gb / 1000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TB`;
    return `${gb.toLocaleString("en-US")} GB`;
  }

  function formatTimestamp(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  const handleCopy = async () => {
    if (!nodeId) return;
    try {
      await navigator.clipboard.writeText(nodeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const displayValue = (val, width = "w-16") => (val === null ? <Skeleton className={`${width} h-5`} /> : val);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
          <Server className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Node Status</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Current node information and status</span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
            isActive ? "bg-emerald-500/40 text-emerald-400" : "bg-gray-500/40 text-gray-400"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 mr-1.5 rounded-full animate-pulse-medium",
              isActive ? "bg-emerald-400" : "bg-gray-400"
            )}
          />
          {isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Cpu className="h-3 w-3" />} label="CPU Cores" value={displayValue(metrics.cpu ? `${metrics.cpu} cores` : null)} />
        <Metric icon={<MemoryStick className="h-3 w-3" />} label="RAM Memory" value={displayValue(metrics.ramGB ? `${metrics.ramGB} GB` : null)} />
        <Metric icon={<HardDrive className="h-3 w-3" />} label="Disk Storage" value={displayValue(formatDisk(metrics.diskGB))} />
        <Metric
          icon={<ArrowDownUp className="h-3 w-3" />}
          label="Network Speed"
          value={displayValue(
            metrics.speedMbps
              ? `↓ ${fmtNumber(metrics.speedMbps)} / ↑ ${metrics.uploadSpeedMbps ? fmtNumber(metrics.uploadSpeedMbps) : null} Mbps`
              : null
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <span className="text-xs text-slate-300">Requirements</span>
          {meetsRequirements === null ? (
            <Skeleton className="w-4 h-4" />
          ) : meetsRequirements ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
        </div>

        <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1 mb-1">
            <LoaderCircle className="h-3 w-3 text-sky-400" />
            <span className="text-xs text-slate-300">Last Sync</span>
          </div>
          <p className="font-mono text-xs text-slate-200">{displayValue(formatTimestamp(lastSyncTimestamp), "w-24")}</p>
        </div>
      </div>
    </div>
  );
}
