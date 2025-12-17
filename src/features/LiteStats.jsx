import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";

function formatTime(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} - ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function LiteStats() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
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
    }
  };

  useEffect(() => {
    fetchStats(); 

    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (err) return <div className="text-red-400">{err}</div>;
  if (!data) return <Skeleton />;

  return (
<ul className="space-y-1">
  <li>
    <span className="text-gray-300 font-semibold">Time:</span> {formatTime(data.time)}
  </li>
  <li>
    <span className="text-gray-300 font-semibold">Total Nodes:</span> {data.total.toLocaleString()}
  </li>
  <li>
    <span className="text-gray-300 font-semibold">Active:</span> {data.active.toLocaleString()}
  </li>
  <li>
    <span className="text-gray-300 font-semibold">Inactive:</span> {data.inactive.toLocaleString()}
  </li>
  <li>
    <span className="text-gray-300 font-semibold">Total Tasks:</span> {data.totalTasks.toLocaleString("en-US")}
  </li>
</ul>
  );
}
