import { useState, useEffect } from "react";
import favicon from "./assets/favicon.ico";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NodeTooltip from "./components/NodeTooltip";
import LiteStats from "./features/LiteStats";
import NodeStats from "./features/NodeStats";
import TaskStats from "./features/TaskStats";
import ActiveNodes from "./features/ActiveNodes";
import Balance from "./features/Balance";
import Mining from "./features/Mining";
import SystemRequirements from "./features/SystemRequirements";
import { api } from "./api/netrumApi";

export default function App() {
  const [rawAddress, setRawAddress] = useState("");
  const [address, setAddress] = useState("");
  const [nodeId, setNodeId] = useState(null);
  const [error, setError] = useState("");
  const [cooldownActive, setCooldownActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "icon";
    link.href = favicon;
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  const handleNodeClick = (addr) => {
    setRawAddress(addr);
  };

  useEffect(() => {
    if (!rawAddress) {
      setAddress("");
      setError("");
      setNodeId(null);
      setShowTooltip(false);
      setIsLoading(false);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
      setAddress("");
      setError("Invalid wallet address. Must start with 0x and be 42 chars long.");
      setNodeId(null);
      setShowTooltip(false);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCooldownActive(true);
      setIsLoading(true);
      setAddress(rawAddress);
      setError("");
      // Always show tooltip when address is valid
      setShowTooltip(true);

      try {
        const nodeIdFromHistory = await api.claimHistoryNodeId(rawAddress);
        setNodeId(nodeIdFromHistory);
      } catch {
        setNodeId(null);
      } finally {
        setCooldownActive(false);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [rawAddress]);

  // Only show cards below when no valid address is entered and not loading
  const showCards = address && !showTooltip && !isLoading;

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setRawAddress("");
    setAddress("");
    setNodeId(null);
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
           style={{
             background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
           }}>
      </div>

      <Header />

      <div className="relative z-10 bg-black/20 pb-24"> {/* pb-24 for footer spacing */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <LiteStats />
            </div>
            
            <div className="md:col-span-2">
              <SystemRequirements />
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
                <span className="text-lg">🔍</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Search Node Address
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Enter wallet address to search for node information</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input
                className="w-full bg-slate-800/40 border border-slate-600/50 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:border-slate-500/50 focus:ring-1 focus:ring-slate-500/50 transition-colors"
                placeholder="0x..."
                value={rawAddress}
                onChange={(e) => !address && setRawAddress(e.target.value.trim())}
                readOnly={!!address}
                onCopy={(e) => address && e.preventDefault()}
                onCut={(e) => address && e.preventDefault()}
                onPaste={(e) => address && e.preventDefault()}
                onMouseDown={(e) => address && e.preventDefault()}
                onSelect={(e) => address && e.preventDefault()}
                style={{
                  userSelect: address ? "none" : "text",
                  pointerEvents: "auto",
                }}
              />
              {rawAddress && (
                <button
                  onClick={() => {
                    setRawAddress("");
                    setAddress("");
                    setNodeId(null);
                    setError("");
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-red-500 hover:text-red-400 transition-colors"
                  type="button"
                >
                  ❌
                </button>
              )}
            </div>
            {error && (
              <div className="text-red-400 font-semibold opacity-70 text-xs mt-2">
                {error}
              </div>
            )}
          </div>

          {showCards && (
            <div className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <NodeStats nodeId={nodeId} />
                <Mining nodeId={nodeId} walletAddress={address} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Balance wallet={address} />
                <TaskStats nodeId={nodeId} />
              </div>
            </div>
          )}

          {/* Tooltip with 4 cards */}
          <NodeTooltip 
            isOpen={showTooltip} 
            onClose={handleCloseTooltip}
            loading={isLoading}
          >
            <NodeStats nodeId={nodeId} />
            <Mining nodeId={nodeId} walletAddress={address} />
            <Balance wallet={address} />
            <TaskStats nodeId={nodeId} />
          </NodeTooltip>

          <div className="grid grid-cols-1 mt-6">
            <ActiveNodes
              onNodeClick={handleNodeClick}
              cooldownActive={cooldownActive}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
