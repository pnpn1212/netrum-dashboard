import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import {
  Users,
  Wifi,
  PauseCircle,
  ListChecks,
  Network
} from "lucide-react";

function formatTime(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} • ${p(
    d.getDate()
  )}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

function StatsCard({ title, value, subtitle, icon: Icon, variant, loading }) {
  const variantStyle =
    variant === "primary"
      ? "bg-primary/10 text-primary"
      : variant === "success"
      ? "bg-emerald-500/10 text-emerald-500"
      : "bg-muted text-foreground";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold font-mono">
            {loading ? <Skeleton className="w-20 h-6" /> : value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle ?? "-"}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${variantStyle}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function LiteStats() {
  const [data, setData] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const r = await api.liteStats();
      if (r?.error) {
        setErr(r.error);
      } else if (!r?.cooldown) {
        setErr("");
        setData(r);
      }
    } catch (e) {
      setErr("Unexpected error fetching stats");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (err) return <div className="text-red-400">{err}</div>;

  const displayData = {
    total: data.total ?? 0,
    active: data.active ?? 0,
    inactive: data.inactive ?? 0,
    totalTasks: data.totalTasks ?? 0,
    time: data.time,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-primary/10 text-primary">
          <Network className="h-5 w-5" />
        </div>

        <div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            Network Overview
          </div>
          {!loading && displayData.time && (
            <div className="text-xs text-muted-foreground">
              Updated {formatTime(displayData.time)}
            </div>
          )}
          {loading && <Skeleton className="w-24 h-3 mt-1" />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Network Nodes"
          value={displayData.total.toLocaleString("en-US")}
          subtitle="Total nodes"
          icon={Users}
          variant="primary"
          loading={loading}
        />

        <StatsCard
          title="Active Nodes"
          value={displayData.active.toLocaleString("en-US")}
          subtitle="Currently running"
          icon={Wifi}
          variant="success"
          loading={loading}
        />

        <StatsCard
          title="Inactive Nodes"
          value={displayData.inactive.toLocaleString("en-US")}
          subtitle="Offline / stopped"
          icon={PauseCircle}
          variant="primary"
          loading={loading}
        />

        <StatsCard
          title="Total Tasks"
          value={displayData.totalTasks.toLocaleString("en-US")}
          subtitle="Processed tasks"
          icon={ListChecks}
          variant="success"
          loading={loading}
        />
      </div>
    </div>
  );
}
