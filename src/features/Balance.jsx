import { useEffect, useState } from "react";
import {
  CreditCard,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  DollarSign,
  Wallet
} from "lucide-react";

const RPC = "https://base-rpc.publicnode.com";
const NPT_CONTRACT = "0xB8c2CE84F831175136cebBFD48CE4BAb9c7a6424";
const BASESCAN = "https://basescan.org/token/0xb8c2ce84f831175136cebbfd48ce4bab9c7a6424?a=";

const formatAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

export default function Balance({ wallet, reloadKey }) {
  const [balances, setBalances] = useState({ eth: null, npt: null, usd: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBalances = async () => {
    if (!wallet) return;

    setLoading(true);
    setBalances({ eth: null, npt: null, usd: null });

    try {
      const walletHex = wallet.replace("0x", "");

      const ethRes = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [wallet, "latest"],
        }),
      }).then((r) => r.json()).catch(() => null);

      const eth = parseInt(ethRes?.result || "0x0", 16) / 1e18;

      const nptRes = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_call",
          params: [
            {
              to: NPT_CONTRACT,
              data: `0x70a08231000000000000000000000000${walletHex}`,
            },
            "latest",
          ],
        }),
      }).then((r) => r.json()).catch(() => null);

      const npt = parseInt(nptRes?.result || "0x0", 16) / 1e18;

      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      ).then((r) => r.json()).catch(() => null);

      const ethUsd = Number(priceRes?.ethereum?.usd || 0);

      setBalances({
        eth: isNaN(eth) ? 0 : eth,
        npt: isNaN(npt) ? 0 : npt,
        usd: isNaN(eth) ? 0 : eth * ethUsd,
      });
      setError("");
    } catch {
      setBalances({ eth: 0, npt: 0, usd: 0 });
      setError("Failed to load balances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet) {
      setBalances({ eth: null, npt: null, usd: null });
      setError("");
      setLoading(false);
      return;
    }
    fetchBalances();
  }, [wallet, reloadKey]);

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
          <CreditCard className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Wallet</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Base Network wallet balances</span>
          </div>
        </div>
      </div>

      <div className="mb-4 p-2 rounded bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 mb-1">Address</p>
            <p className="font-mono text-xs text-white">
              {loading || !wallet ? <Skeleton className="w-20 h-3" /> : formatAddress(wallet)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-700/50 transition"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-slate-400" />
              )}
            </button>

            <a
              href={`${BASESCAN}${wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-slate-700/50 transition"
            >
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1 mb-1">
            <Wallet className="h-3 w-3 text-indigo-400" />
            <span className="text-xs text-slate-300">ETH Balance</span>
          </div>
          <p className="font-mono text-sm font-bold text-white">
            {loading || balances.eth === null ? <Skeleton className="w-16 h-4" /> : balances.eth.toFixed(4)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {loading || balances.usd === null ? <Skeleton className="w-12 h-3" /> : `≈ $${balances.usd.toFixed(2)}`}
          </p>
        </div>

        <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-slate-300">NPT Balance</span>
          </div>
          <p className="font-mono text-sm font-bold text-white">
            {loading || balances.npt === null ? <Skeleton className="w-16 h-4" /> : Number(balances.npt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <button
        onClick={fetchBalances}
        disabled={loading || !wallet}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded border border-slate-600/50 bg-slate-800/40 hover:bg-slate-800/60 transition py-2 text-xs"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      {error && (
        <div className="text-red-400 text-xs mt-2 text-center">{error}</div>
      )}
    </div>
  );
}
