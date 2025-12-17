import { useEffect, useState } from "react";
import { api } from "../api/netrumApi";
import Section from "../components/Section";
import StatCard from "../components/Card";
import Skeleton from "../components/Skeleton";
import ErrorNotice from "../components/ErrorBoundary";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.liteStats().then((res) => {
      console.log("[Dashboard stats]", res);
      if (res?.error) setError(res.error);
      else if (!res?.cooldown) setStats(res);
    });
  }, []);

  return (
    <Section title="Network Overview">
  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
    {!stats && !error && (
      <>
        <StatCard title="Time"><Skeleton /></StatCard>
        <StatCard title="Total Nodes"><Skeleton /></StatCard>
        <StatCard title="Active"><Skeleton /></StatCard>
        <StatCard title="Inactive"><Skeleton /></StatCard>
        <StatCard title="Total Task"><Skeleton /></StatCard>
      </>
    )}

    {error && <ErrorNotice text={error} />}

    {stats && (
      <>
        <StatCard title="Time">
          {formatTime(stats.time)}
        </StatCard>

        <StatCard title="Total Nodes">
          {stats.total.toLocaleString()}
        </StatCard>

        <StatCard title="Active">
          {stats.active.toLocaleString()}
        </StatCard>

        <StatCard title="Inactive">
          {stats.inactive.toLocaleString()}
        </StatCard>

        <StatCard title="Total Task">
          {stats.totalTasks.toLocaleString()}
        </StatCard>
      </>
    )}
  </div>
</Section>

  );
}
