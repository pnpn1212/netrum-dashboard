import { useEffect, useState, useRef } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";

export default function NodeStats({ nodeId }) {
  const [stats, setStats] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    setStats(null);

    if (!nodeId) return;

    let active = true;

    const fetchStats = async () => {
      try {
        const r = await api.checkCooldown(nodeId);
        if (!active) return;

        setStats(r && r.success ? r : { error: true });
      } catch (e) {
        console.error("NodeStats fetch error:", e);
        if (!active) return;
        setStats({ error: true });
      }
    };

    fetchStats();

    return () => {
      active = false;
      isMounted.current = false;
    };
  }, [nodeId]);

  if (!stats) return <Skeleton />;
  if (stats.error) return <Skeleton />;

  const lastSync = stats.lastSuccessfulSync?.details || {};
  const metrics = lastSync.metrics || {};

  const isActive = lastSync.syncStatus === "Active";
  const statusText = isActive ? "Active" : "Inactive";
  const statusIcon = isActive ? "✅" : "❌";

  return (
    <ul className="space-y-1">
      <li>
        <span className="text-gray-400 font-semibold">Status:</span>{" "}
        <span className="font-semibold">
          {statusText} <span>{statusIcon}</span>
        </span>
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Meets Requirements:</span>{" "}
        {lastSync.meetsRequirements ? "✅" : "❌"}
      </li>
      <li>
        <span className="text-gray-400 font-semibold">CPU:</span> {metrics.cpu || "-"} cores
      </li>
      <li>
        <span className="text-gray-400 font-semibold">RAM:</span> {metrics.ramGB || "-"} GB
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Disk:</span> {metrics.diskGB || "-"} GB
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Download:</span> {metrics.speedMbps || "-"} Mbps
      </li>
      <li>
        <span className="text-gray-400 font-semibold">Upload:</span> {metrics.uploadSpeedMbps || "-"} Mbps
      </li>
    </ul>
  );
}
