import { useEffect, useState, useRef } from "react";
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
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}
${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function TaskStats({ nodeId }) {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setTaskData(null);
    setLoading(true);
    if (!nodeId) return;

    let active = true;

    const fetchTaskStats = async () => {
      try {
        const r = await api.taskStats?.(nodeId);
        if (!active) return;
        setTaskData(r && !r.error ? r : { error: true });
      } catch (e) {
        console.error("TaskStats fetch error:", e);
        if (!active) return;
        setTaskData({ error: true });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTaskStats();

    return () => {
      active = false;
      isMounted.current = false;
    };
  }, [nodeId]);

  const showFallback = !taskData || taskData.error;

  const {
    lastPolledAt,
    lastTaskCompleted,
    lastTaskAssigned,
    ttsPowerStatus,
    availableRam,
    taskCount,
  } = taskData && !taskData.error ? taskData : {};

  const displayValue = (val, width = "w-16") =>
    loading || val === null || val === undefined
      ? <Skeleton className={`${width} h-5`} />
      : val;

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6">
      <div className="relative space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold flex items-center gap-2">Task Stats</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Metric
            icon={<Database className="h-4 w-4 text-purple-400" />}
            label="Total Tasks"
            value={displayValue(taskCount?.toLocaleString("en-US"))}
          />
          <Metric
            icon={<MemoryStick className="h-4 w-4 text-blue-400" />}
            label="Available RAM"
            value={displayValue(
              availableRam ? availableRam.toLocaleString() + " GB" : null
            )}
          />
          <Metric
            icon={<Zap className="h-4 w-4 text-green-400" />}
            label="TTS Power Status"
            value={displayValue(ttsPowerStatus)}
          />
          <Metric
            icon={<CheckSquare className="h-4 w-4 text-cyan-400" />}
            label="Last Task Completed"
            value={displayValue(formatTime(lastTaskCompleted), "w-32")}
          />
          <Metric
            icon={<FileText className="h-4 w-4 text-green-400" />}
            label="Last Polled"
            value={displayValue(formatTime(lastPolledAt), "w-32")}
          />
          <Metric
            icon={<Inbox className="h-4 w-4 text-yellow-400" />}
            label="Last Task Assigned"
            value={displayValue(formatTime(lastTaskAssigned), "w-32")}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border flex flex-col items-start">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="font-mono text-sm font-medium">{value}</p>
    </div>
  );
}
