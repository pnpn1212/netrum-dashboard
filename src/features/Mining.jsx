import { useEffect, useState } from "react";
import { Pickaxe, Gift, Zap, History, TrendingUp, Layers, Timer, CalendarClock } from "lucide-react";
import { api } from "../api/netrumApi";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

export default function Mining({ nodeId: propNodeId, walletAddress, reloadKey }) {
  const [nodeId, setNodeId] = useState(propNodeId || null);
  const [canStartMining, setCanStartMining] = useState(null);
  const [lastMiningStart, setLastMiningStart] = useState(null);
  const [minedTokens, setMinedTokens] = useState(null);
  const [canClaim, setCanClaim] = useState(null);
  const [miningSpeed, setMiningSpeed] = useState(null);
  const [percentComplete, setPercentComplete] = useState(null);
  const [formattedRemainingTime, setFormattedRemainingTime] = useState(null);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNodeId(propNodeId || null);
    setCanStartMining(null);
    setLastMiningStart(null);
    setMinedTokens(null);
    setCanClaim(null);
    setMiningSpeed(null);
    setPercentComplete(null);
    setFormattedRemainingTime(null);
    setLastClaimTime(null);
    setLoading(true);
  }, [walletAddress, propNodeId, reloadKey]);

  useEffect(() => {
    if (!walletAddress) return;

    let active = true;

    const fetchAllData = async () => {
      setLoading(true);

      try {
        let currentNodeId = propNodeId;

        if (!currentNodeId) {
          const history = await api.claimHistory(walletAddress).catch(() => null);
          if (!active || !history?.lastClaim?.nodeId) {
            setNodeId(null);
            setLoading(false);
            return;
          }
          currentNodeId = history.lastClaim.nodeId;
        }

        setNodeId(currentNodeId);

        const [miningData, claimData, debugData] = await Promise.all([
          api.miningCooldown(currentNodeId).catch(() => null),
          api.claim(walletAddress).catch(() => null),
          api.miningDebugContract(walletAddress).catch(() => null),
        ]);

        if (!active) return;

        setCanStartMining(miningData?.canStartMining ?? null);
        setLastMiningStart(miningData?.lastMiningStart ?? null);

        const mined = parseFloat(claimData?.minedTokensFormatted ?? miningData?.minedTokens ?? 0);
        setMinedTokens(isNaN(mined) ? null : mined);

        setCanClaim(claimData?.canClaim ?? null);
        setFormattedRemainingTime(claimData?.miningSession?.formattedRemainingTime ?? null);
        setLastClaimTime(claimData?.lastClaimTime ?? null);

        if (debugData?.contract?.miningInfo) {
          setMiningSpeed(parseFloat(debugData.contract.miningInfo.speedPerSec ?? 0));
          setPercentComplete(parseFloat(debugData.contract.miningInfo.percentCompleteNumber ?? 0) / 100);
        } else {
          setMiningSpeed(null);
          setPercentComplete(null);
        }
      } catch (e) {
        console.warn("Mining fetch warning:", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      active = false;
    };
  }, [walletAddress, propNodeId, reloadKey]);

  const formatDateTimeInline = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const status = canStartMining ? "mining" : "idle";
  const statusColors = {
    mining: "bg-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]",
    idle: "bg-gray-500/40 text-gray-400 shadow-[0_0_12px_rgba(107,114,128,0.45)]",
  };

  const displayValue = (val, width = "w-16") => val === null || loading ? <Skeleton className={`${width} h-5`} /> : val;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
          <Pickaxe className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Mining</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mining status and statistics</span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
            statusColors[status]
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 mr-1.5 rounded-full animate-pulse-medium",
              status === "mining" ? "bg-emerald-400" : "bg-gray-400"
            )}
          />
          {status === "mining" ? "MINING" : "IDLE"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Gift className="h-3 w-3 text-cyan-400" />} label="Mined Tokens" value={displayValue(minedTokens !== null ? `${minedTokens.toFixed(2)} NPT` : null)} />
        <Metric icon={<Zap className="h-3 w-3 text-yellow-400" />} label="Mining Speed" value={displayValue(miningSpeed !== null ? `${(miningSpeed / 1e18).toFixed(8)}/s` : null)} />
        <Metric
          icon={<Layers className="h-3 w-3 text-green-400" />}
          label="Claim Status"
          value={
            canClaim === null ? (
              <Skeleton className="w-12 h-3" />
            ) : (
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs",
                  canClaim ? "bg-emerald-500/50 text-emerald-50" : "bg-gray-400/50 text-gray-50"
                )}
              >
                {canClaim ? "Available" : "Unavailable"}
              </span>
            )
          }
        />
        <Metric icon={<Timer className="h-3 w-3 text-green-400" />} label="Remaining Time" value={displayValue(formattedRemainingTime)} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Metric icon={<History className="h-3 w-3 text-green-400" />} label="Last Mining" value={displayValue(lastMiningStart ? formatDateTimeInline(lastMiningStart) : null)} />
        <Metric icon={<CalendarClock className="h-3 w-3 text-cyan-400" />} label="Last Claim" value={displayValue(lastClaimTime ? formatDateTimeInline(lastClaimTime) : null)} />
      </div>

      <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50 mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-300" />
            24h Progress
          </span>
          <span className="font-mono font-bold text-white">
            {percentComplete === null ? <Skeleton className="w-8 h-3" /> : `${percentComplete.toFixed(2)}%`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
            style={{ width: percentComplete === null ? "0%" : `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-slate-300">{label}</span>
      </div>
      <p className="font-mono text-xs text-white font-medium">{value}</p>
    </div>
  );
}
