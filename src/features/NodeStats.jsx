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

export default function NodeStats({ nodeId }) {
  const [stats, setStats] = useState({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({});
    setLoading(true);
  }, [nodeId]);

  useEffect(() => {
    if (!nodeId) return;
    let active = true;

    const fetchData = async () => {
      try {
        const res = await api.checkCooldown(nodeId).catch(() => null);
        if (!active) return;
        setStats(res || {});
      } catch (e) {
        console.error("NodeStats fetch error:", e);
        setStats({});
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [nodeId]);

  const lastSync = stats.lastSuccessfulSync?.details || {};
  const metrics = lastSync.metrics || {};
  const isActive = lastSync.syncStatus === "Active";
  const meetsRequirements = lastSync.meetsRequirements;
  const lastSyncTimestamp = stats.lastSuccessfulSync?.timestamp;

  const fmtNumber = (n, d = 2) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  function formatDisk(gb) {
    if (gb === null || gb === undefined) return null;
    if (gb >= 1000) {
      const tb = gb / 1000;
      return `${tb.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} TB`;
    }
    return `${gb.toLocaleString("en-US")} GB`;
  }

  function formatTimestamp(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(
      d.getSeconds()
    )} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  const handleCopy = async () => {
    if (!nodeId) return;
    try {
      await navigator.clipboard.writeText(nodeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const displayValue = (val, width = "w-16") =>
    loading || val === null ? <Skeleton className={`${width} h-5`} /> : val;

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6">
      <div
        className={cn(
          "absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl",
          isActive ? "bg-emerald-500/10" : "bg-red-500/10"
        )}
      />

      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Node Status</h3>
          </div>

          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
              isActive
                ? "bg-emerald-500/40 text-emerald-400"
                : "bg-gray-500/40 text-gray-400"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 mr-2 rounded-full animate-pulse-medium",
                isActive ? "bg-emerald-400" : "bg-gray-400"
              )}
            />
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Node ID</p>
              <p className="font-mono text-sm break-all">
                {displayValue(nodeId, "w-32")}
              </p>
            </div>

            <button
              onClick={handleCopy}
              disabled={!nodeId}
              className="p-2 rounded-lg hover:bg-muted transition disabled:opacity-50"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Metric
            icon={<Cpu className="h-4 w-4" />}
            label="CPU"
            value={displayValue(metrics.cpu ? `${metrics.cpu} cores` : null)}
          />
          <Metric
            icon={<MemoryStick className="h-4 w-4" />}
            label="RAM"
            value={displayValue(metrics.ramGB ? `${metrics.ramGB} GB` : null)}
          />
          <Metric
            icon={<HardDrive className="h-4 w-4" />}
            label="Disk"
            value={displayValue(formatDisk(metrics.diskGB))}
          />
          <Metric
            icon={<ArrowDownUp className="h-4 w-4" />}
            label="Network"
            value={displayValue(
              metrics.speedMbps
                ? `↓ ${fmtNumber(metrics.speedMbps)} / ↑ ${
                    metrics.uploadSpeedMbps ? fmtNumber(metrics.uploadSpeedMbps) : null
                  } Mbps`
                : null
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Meets Requirements
            </span>

            {loading ? (
              <Skeleton className="w-5 h-5" />
            ) : meetsRequirements === true ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : meetsRequirements === false ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : null}
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 mb-1">
              <LoaderCircle className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-muted-foreground">Last Sync</span>
            </div>

            <p className="font-mono text-sm">
              {displayValue(formatTimestamp(lastSyncTimestamp), "w-32")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  const displayValue = value || <Skeleton className="w-16 h-5" />;
  return (
    <div className="p-4 rounded-lg bg-muted/30 border">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="font-mono text-sm">{displayValue}</p>
    </div>
  );
}
