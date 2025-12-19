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
const BASESCAN = "https://basescan.org/token/0xb8c2ce84f831175136cebbfd48ce4bab9c7a6424?a";

const formatAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

export default function Balance({ wallet }) {
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
    fetchBalances();
  }, [wallet]);

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Wallet</h3>
              <p className="text-xs text-muted-foreground">Base Network</p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-mono text-sm text-foreground">
                {loading || !wallet ? <Skeleton className="w-24 h-4" /> : formatAddress(wallet)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <a
                href={`${BASESCAN}=${wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-muted-foreground">ETH Balance</span>
            </div>
            <p className="font-mono text-xl font-bold">
              {loading || balances.eth === null ? <Skeleton className="w-20 h-6" /> : balances.eth.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loading || balances.usd === null ? <Skeleton className="w-16 h-3" /> : `≈ $${balances.usd.toFixed(2)}`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">NPT Balance</span>
            </div>
            <p className="font-mono text-xl font-bold">
              {loading || balances.npt === null ? <Skeleton className="w-20 h-6" /> : Number(balances.npt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <button
          onClick={fetchBalances}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-muted transition py-2 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        {error && (
          <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
        )}
      </div>
    </div>
  );
}
