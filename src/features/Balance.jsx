import { useEffect, useState } from "react";
import Skeleton from "../components/Skeleton";

const RPC = "https://base-rpc.publicnode.com";
const NPT_CONTRACT = "0xB8c2CE84F831175136cebBFD48CE4BAb9c7a6424";

export default function Balance({ wallet }) {
  const [balances, setBalances] = useState({ eth: null, npt: null, usd: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) return;

    const fetchBalances = async () => {
      try {
        const walletHex = wallet.replace("0x", "");

        // ETH balance
        const ethRes = await fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [wallet, "latest"],
          }),
        }).then(r => r.json());

        const ethHex = ethRes.result || "0x0";
        const eth = parseInt(ethHex, 16) / 1e18;

        // NPT balance
        const nptRes = await fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "eth_call",
            params: [
              { to: NPT_CONTRACT, data: `0x70a08231000000000000000000000000${walletHex}` },
              "latest"
            ],
          }),
        }).then(r => r.json());

        const nptHex = nptRes.result || "0x0";
        const npt = parseInt(nptHex, 16) / 1e18;

        // ETH price USD
        const priceRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        ).then(r => r.json());

        const ethUsd = parseFloat(priceRes?.ethereum?.usd || 0);

        setBalances({ eth, npt, usd: eth * ethUsd });
        setError("");
      } catch (e) {
        console.error("Balance fetch error:", e);
        setBalances({ eth: 0, npt: 0, usd: 0 });
        setError("Failed to load balances.");
      }
    };

    fetchBalances();
  }, [wallet]);

  if (!wallet) return <div className="text-gray-400 text-sm">Enter wallet to see balance</div>;
  if (balances.eth === null) return <Skeleton />;

  return (
    <div>
      {error && <div className="text-red-500 text-xs mb-1">{error}</div>}
      <ul className="space-y-1">
        <li>
          <span className="text-gray-400 font-semibold">ETH:</span> {balances.eth.toFixed(6)}
        </li>
        <li>
          <span className="text-gray-400 font-semibold">NPT:</span> {balances.npt.toFixed(2)}
        </li>
        <li>
          <span className="text-gray-400 font-semibold">ETH ≈ USD:</span> ${balances.usd.toFixed(2)}
        </li>
      </ul>
    </div>
  );
}
