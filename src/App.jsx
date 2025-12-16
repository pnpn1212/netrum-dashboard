import { useState, useEffect } from "react";
import favicon from "./assets/favicon.ico";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import LiteStats from "./features/LiteStats";
import ActiveNodes from "./features/ActiveNodes";
import NodeStats from "./features/NodeStats";
import TaskStats from "./features/TaskStats";
import Claim from "./features/Claim";
import { ErrorBoundary } from "./components/ErrorBoundary";

const cardIcons = {
  network: "🌐",
  activeNodes: "📊",
  nodeAddress: "📥",
  nodestats: "🖥",
  task: "📝",   
  claim: "💰",
};

export default function App() {
  const [rawAddress, setRawAddress] = useState("");
  const [address, setAddress] = useState("");
  const [nodeId, setNodeId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = favicon;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // debounce address input
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
    <div className="min-h-screen bg-[#060914] text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        <Header />

        <div className="grid md:grid-cols-2 gap-6">
          <Card title={<span>{cardIcons.network} Network Overview</span>}>
            <LiteStats />
            <div className="text-xs text-gray-500 mt-2">
              The data will refresh every 30 seconds
            </div>
          </Card>
          <Card title={<span>{cardIcons.activeNodes} Active Nodes List</span>}>
            <ActiveNodes />
          </Card>
        </div>

        <Card title={<span>{cardIcons.nodeAddress} Node Address</span>}>
          <input
            className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-sm"
            placeholder="0x..."
            value={rawAddress}
            onChange={(e) => setRawAddress(e.target.value.trim())}
          />
          <div className="text-xs text-gray-500 mt-2">
            Address is validated & debounced to prevent rate limit
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </Card>

        {address && !error && (
          <ErrorBoundary>
            <div className="grid md:grid-cols-3 gap-6">
              <Card title={<span>{cardIcons.nodestats} Node Status</span>}>
                <NodeStats nodeId={nodeId} />
              </Card>
              <Card title={<span>{cardIcons.task} Task Status</span>}>
                <TaskStats nodeId={nodeId} />
              </Card>
              <Card title={<span>{cardIcons.claim} Claim Status</span>}>
                <Claim address={address} setNodeId={setNodeId} />
              </Card>
            </div>
          </ErrorBoundary>
        )}

        <Footer />
      </div>
    </div>
  );
}
