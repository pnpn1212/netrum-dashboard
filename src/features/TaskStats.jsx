import { useEffect, useState, useRef } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} - ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function TaskStats({ nodeId }) {
  const [taskData, setTaskData] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setTaskData(null);
    if (!nodeId) return;

    let active = true;

    const fetchTaskStats = async () => {
      try {
        // SỬA TÊN API
        const r = await api.taskStats?.(nodeId);
        console.log("TaskStats response:", r);

        if (!active) return;
        setTaskData(r && !r.error ? r : { error: true });
      } catch (e) {
        console.error("TaskStats fetch error:", e);
        if (!active) return;
        setTaskData({ error: true });
      }
    };

    fetchTaskStats();

    return () => {
      active = false;
      isMounted.current = false;
    };
  }, [nodeId]);

  if (!taskData) return <Skeleton />;
  if (taskData.error)
    return <div className="text-red-500 text-sm">Failed to load TaskStats</div>;

  const {
    lastPolledAt,
    lastTaskCompleted,
    lastTaskAssigned,
    ttsPowerStatus,
    availableRam,
    taskCount,
  } = taskData;

  return (
    <ul className="space-y-1">
      <li>
        <span className="text-gray-400 font-semibold">Last Polled:</span> {formatTime(lastPolledAt)}
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Last Task Completed:</span> {formatTime(lastTaskCompleted)}
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Last Task Assigned:</span> {formatTime(lastTaskAssigned)}
      </li>
      <li>
        <span className="text-gray-400 font-semibold">TTS Power Status:</span> {ttsPowerStatus || "-"}
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Available RAM:</span> {(availableRam ?? 0).toLocaleString()} GB
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Total Tasks:</span> {(taskCount ?? 0).toLocaleString("en-US")}
      </li>
    </ul>
  );
}
