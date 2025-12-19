import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import { Power, Cpu, MemoryStick, HardDrive, Network } from "lucide-react";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/30 rounded ${className}`} />;
}

function RequirementCard({ title, value, icon: Icon, loading }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-lg font-bold font-mono leading-tight">
            {loading ? <Skeleton className="w-16 h-5" /> : value}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function SystemRequirements() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .requirements()
      .then((r) => {
        if (r?.requirements) {
          setData(r.requirements);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayData = [
    {
      title: "Processor",
      value: data.CORES ? `${data.CORES}+ Cores` : null,
      icon: Cpu,
    },
    {
      title: "Memory",
      value: data.RAM ? `${data.RAM} GB+ RAM` : null,
      icon: MemoryStick,
    },
    {
      title: "Storage",
      value: data.STORAGE ? `${data.STORAGE} GB SSD` : null,
      icon: HardDrive,
    },
    {
      title: "Network Speed",
      value:
        data.DOWNLOAD_SPEED && data.UPLOAD_SPEED
          ? `↓ ${data.DOWNLOAD_SPEED} / ↑ ${data.UPLOAD_SPEED} Mbps`
          : null,
      icon: Network,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white bg-primary/10 text-primary">
          <Power className="h-4 w-4" />
        </div>
        <div>
          <div className="text-base md:text-lg font-bold text-foreground">
            System Requirements
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {displayData.map((item, i) => (
          <RequirementCard
            key={i}
            title={item.title}
            value={item.value}
            icon={item.icon}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
