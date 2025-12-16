import { useEffect, useState, useRef } from "react";
import { api } from "../api/netrumApi";
import Skeleton from "../components/Skeleton";

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} - ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function Claim({ address, setNodeId }) {
  const [data, setData] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    setData(null);

    if (!address) return;

    let active = true;

    const fetchData = async () => {
      try {
        const [claimResult, historyResult] = await Promise.allSettled([
          api.claim(address),
          api.claimHistoryNodeId?.(address)
        ]);

        if (!active) return;

        const claimData = claimResult.status === "fulfilled" ? claimResult.value : null;
        const historyData = historyResult.status === "fulfilled" ? historyResult.value : "-";

        const merged = claimData && !claimData.cooldown
          ? { ...claimData, nodeIdHistory: historyData || "-" }
          : {
              nodeAddress: address,
              nodeIdHistory: historyData || "-",
              lastClaimTime: null,
              requirements: {},
              miningSession: {},
              minedTokensFormatted: "0"
            };

        setData(merged);

        if (setNodeId && merged.nodeIdHistory && merged.nodeIdHistory !== "-") {
          setNodeId(merged.nodeIdHistory);
        }
      } catch (e) {
        console.error("Claim fetch error:", e);
        if (!active) return;
        setData({
          nodeAddress: address,
          nodeIdHistory: "-",
          lastClaimTime: null,
          requirements: {},
          miningSession: {},
          minedTokensFormatted: "0"
        });
      }
    };

    fetchData();

    return () => {
      active = false;
      isMounted.current = false;
    };
  }, [address, setNodeId]);

  if (!data) return <Skeleton />;

  return (
    <ul className="space-y-1 text-sm">
      <li><span className="text-gray-400">Wallet:</span> {data.nodeAddress}</li>
      <li><span className="text-gray-400">Node ID:</span> {data.nodeIdHistory}</li>
      <li><span className="text-gray-400">Last Claim:</span> {formatTime(data.lastClaimTime)}</li>
      <li><span className="text-gray-400">Mining Duration:</span> {data.requirements?.miningDuration || "-"}</li>
      <li><span className="text-gray-400">Remaining Time:</span> {data.miningSession?.formattedRemainingTime || "-"}</li>
      <li><span className="text-gray-400">Mined:</span> {data.minedTokensFormatted || "0"} NPT</li>
    </ul>
  );
}
