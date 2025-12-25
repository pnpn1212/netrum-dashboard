import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import { 
  CheckSquare, 
  Zap, 
  MemoryStick, 
  Database, 
  ClipboardList, 
  FileText, 
  Inbox 
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

function formatTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
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

export default function TaskStats({ nodeId, reloadKey }) {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nodeId) return;

    let active = true;
    setTaskData(null);
    setLoading(true);

    const fetchTaskStats = async () => {
      try {
        const r = await api.taskStats?.(nodeId).catch(() => null);
        if (!active) return;
        setTaskData(r && !r.error ? r : null);
      } catch (e) {
        console.warn("TaskStats fetch warning:", e);
        if (active) setTaskData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTaskStats();

    return () => { active = false; };
  }, [nodeId, reloadKey]);

  const {
    lastPolledAt = null,
    lastTaskCompleted = null,
    lastTaskAssigned = null,
    ttsPowerStatus = null,
    availableRam = null,
    taskCount = null,
  } = taskData || {};

  const displayValue = (val, width = "w-16") =>
    loading || val === null || val === undefined
      ? <Skeleton className={`${width} h-5`} />
      : val;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
          <ClipboardList className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Task Stats</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Task processing and system status</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric 
          icon={<Database className="h-3 w-3 text-purple-400" />} 
          label="Total Tasks" 
          value={displayValue(taskCount?.toLocaleString("en-US"))} 
        />
        <Metric 
          icon={<MemoryStick className="h-3 w-3 text-blue-400" />} 
          label="Available RAM" 
          value={displayValue(availableRam ? availableRam.toLocaleString() + " GB" : null)} 
        />
        <Metric 
          icon={<Zap className="h-3 w-3 text-green-400" />} 
          label="TTS Power Status" 
          value={displayValue(ttsPowerStatus)} 
        />
        <Metric 
          icon={<CheckSquare className="h-3 w-3 text-cyan-400" />} 
          label="Last Task Completed" 
          value={displayValue(formatTime(lastTaskCompleted), "w-24")} 
        />
        <Metric 
          icon={<FileText className="h-3 w-3 text-green-400" />} 
          label="Last Polled" 
          value={displayValue(formatTime(lastPolledAt), "w-24")} 
        />
        <Metric 
          icon={<Inbox className="h-3 w-3 text-yellow-400" />} 
          label="Last Task Assigned" 
          value={displayValue(formatTime(lastTaskAssigned), "w-24")} 
        />
      </div>
    </div>
  );
}
