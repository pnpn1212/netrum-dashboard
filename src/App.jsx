import { useState, useEffect } from "react";
import favicon from "./assets/logo.png";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import LiteStats from "./features/LiteStats";
import ActiveNodes from "./features/ActiveNodes";
import NodeStats from "./features/NodeStats";
import TaskStats from "./features/TaskStats";
import Claim from "./features/Claim";
import Balance from "./features/Balance";
import { ErrorBoundary } from "./components/ErrorBoundary";
import gradientVideo from "./assets/Gradient.mp4";

const cardIcons = {
  network: "🌐",
  activeNodes: "📊",
  nodeAddress: "📥",
  nodestats: "🖥",
  task: "📝",
  claim: "💰",
  balance: "💵",
};

export default function App() {
  const [rawAddress, setRawAddress] = useState("");
  const [address, setAddress] = useState("");
  const [nodeId, setNodeId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawAddress === "") {
        setAddress("");
        setError("");
        setNodeId(null);
      } else if (/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
        setAddress(rawAddress);
        setError("");
        setNodeId(null);
      } else {
        setAddress("");
        setError("Invalid wallet address. Must start with 0x and be 42 chars long.");
        setNodeId(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rawAddress]);

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
            <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.network} Network Overview</span>} className="bg-transparent border-none">
              <LiteStats />
              <div className="text-xs text-gray-200 font-semibold opacity-70 mt-2">
                The data will refresh every 30 seconds
              </div>
            </Card>
            <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.activeNodes} Active Nodes List</span>} className="bg-transparent border-none">
              <ActiveNodes />
            </Card>
          </div>

          <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.nodeAddress} Node Address</span>} className="bg-transparent border-none mt-6">
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

          {address && !error && (
            <ErrorBoundary>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Hàng 1: Node Status | Task Status */}
                <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.nodestats} Node Status</span>} className="bg-transparent border-none">
                  <NodeStats nodeId={nodeId} />
                </Card>
                <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.task} Task Status</span>} className="bg-transparent border-none">
                  <TaskStats nodeId={nodeId} />
                </Card>

                {/* Hàng 2: Balance | Claim Status */}
                <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.balance} Balance</span>} className="bg-transparent border-none">
                  <Balance wallet={address} />
                </Card>
                <Card title={<span className="text-lg md:text-xl font-bold flex items-center gap-2">{cardIcons.claim} Claim Status</span>} className="bg-transparent border-none">
                  <Claim address={address} setNodeId={setNodeId} />
                </Card>
              </div>
            </ErrorBoundary>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}
