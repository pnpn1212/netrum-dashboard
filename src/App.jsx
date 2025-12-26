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
  const [reloadKey, setReloadKey] = useState(0);
  const [cardLoadingStates, setCardLoadingStates] = useState({
    nodeStats: false,
    mining: false,
    balance: false,
    taskStats: false
  });

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

  const updateCardLoading = (cardName, isLoading) => {
    setCardLoadingStates(prev => ({
      ...prev,
      [cardName]: isLoading
    }));
  };

  useEffect(() => {
    const hasStartedLoading = Object.values(cardLoadingStates).some(loading => loading === true);
    const allCardsLoaded = Object.values(cardLoadingStates).every(loading => loading === false);
    
    if (hasStartedLoading && allCardsLoaded) {
      setIsLoading(false);
    }
  }, [cardLoadingStates]);

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
      setShowTooltip(true);
      setReloadKey(prev => prev + 1);
      
      setCardLoadingStates({
        nodeStats: true,
        mining: true,
        balance: true,
        taskStats: true
      });

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

  const showCards = address && !showTooltip && !isLoading;

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    setRawAddress("");
    setAddress("");
    setNodeId(null);
    setError("");
    setIsLoading(false);
    setCooldownActive(false);
    setCardLoadingStates({
      nodeStats: false,
      mining: false,
      balance: false,
      taskStats: false
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
           style={{
             background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
           }}>
      </div>

      <Header />

      <div className="relative z-10 bg-black/20 pb-24"> 
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
                onChange={(e) => setRawAddress(e.target.value.trim())}
                readOnly={isLoading}
                onCopy={(e) => isLoading && e.preventDefault()}
                onCut={(e) => isLoading && e.preventDefault()}
                onPaste={(e) => isLoading && e.preventDefault()}
                onMouseDown={(e) => isLoading && e.preventDefault()}
                onSelect={(e) => isLoading && e.preventDefault()}
                style={{
                  userSelect: isLoading ? "none" : "text",
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
                    setIsLoading(false);
                    setCooldownActive(false);
                    setShowTooltip(false);
                    setCardLoadingStates({
                      nodeStats: false,
                      mining: false,
                      balance: false,
                      taskStats: false
                    });
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
                <NodeStats nodeId={nodeId} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('nodeStats', false)} />
                <Mining nodeId={nodeId} walletAddress={address} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('mining', false)} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Balance wallet={address} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('balance', false)} />
                <TaskStats nodeId={nodeId} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('taskStats', false)} />
              </div>
            </div>
          )}

          <NodeTooltip 
            isOpen={showTooltip} 
            onClose={handleCloseTooltip}
            loading={isLoading}
          >
            <NodeStats nodeId={nodeId} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('nodeStats', false)} />
            <Mining nodeId={nodeId} walletAddress={address} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('mining', false)} />
            <Balance wallet={address} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('balance', false)} />
            <TaskStats nodeId={nodeId} reloadKey={reloadKey} onLoadComplete={() => updateCardLoading('taskStats', false)} />
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
