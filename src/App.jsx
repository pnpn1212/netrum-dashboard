import { useState, useEffect } from "react";
import favicon from "./assets/favicon.ico";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import LiteStats from "./features/LiteStats";
import NodeStats from "./features/NodeStats";
import TaskStats from "./features/TaskStats";
import ActiveNodes from "./features/ActiveNodes";
import Balance from "./features/Balance";
import Mining from "./features/Mining";
import SystemRequirements from "./features/SystemRequirements";
import gradientVideo from "./assets/Gradient.mp4";
import { api } from "./api/netrumApi";

export default function App() {
  const [rawAddress, setRawAddress] = useState("");
  const [address, setAddress] = useState("");
  const [nodeId, setNodeId] = useState(null);
  const [error, setError] = useState("");
  const [cooldownActive, setCooldownActive] = useState(false);

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
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
      setAddress("");
      setError("Invalid wallet address. Must start with 0x and be 42 chars long.");
      setNodeId(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCooldownActive(true);
      setAddress(rawAddress);
      setError("");

      try {
        const nodeIdFromHistory = await api.claimHistoryNodeId(rawAddress);
        setNodeId(nodeIdFromHistory);
      } catch {
        setNodeId(null);
      } finally {
        setCooldownActive(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [rawAddress]);

  const showCards = address && !error;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={gradientVideo} type="video/mp4" />
      </video>

      <div className="relative z-10 min-h-screen bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          <Header />

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-transparent border-none md:col-span-2">
              <LiteStats />
            </Card>

            <Card className="bg-transparent border-none md:col-span-2">
              <SystemRequirements />
            </Card>
          </div>

          <Card
            title={
              <span className="text-lg md:text-xl font-bold flex items-center gap-2">
                🔍 Search Node Address
              </span>
            }
            className="bg-transparent border-none mt-6"
          >
            <input
              className="w-full bg-transparent border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-400"
              placeholder="0x..."
              value={rawAddress}
              onChange={(e) => setRawAddress(e.target.value.trim())}
            />
            {error && (
              <div className="text-red-600 font-semibold opacity-70 text-xs mt-1">
                {error}
              </div>
            )}
          </Card>

          {showCards && (
            <div className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-transparent border-none">
                  <NodeStats nodeId={nodeId} />
                </Card>

                <Card className="bg-transparent border-none">
                  <Mining nodeId={nodeId} walletAddress={address} />
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-transparent border-none">
                  <Balance wallet={address} />
                </Card>

                <Card className="bg-transparent border-none">
                  <TaskStats nodeId={nodeId} />
                </Card>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 mt-6">
            <Card className="bg-transparent border-none p-0">
              <ActiveNodes
                onNodeClick={handleNodeClick}
                cooldownActive={cooldownActive}
              />
            </Card>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
