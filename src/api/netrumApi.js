const BASE = "https://node.netrumlabs.dev";
const cooldownMap = {};

export async function fetchSafe(path, cooldown = 30_000) {
  const key = path;
  const now = Date.now();

  if (cooldownMap[key] && now - cooldownMap[key] < cooldown) {
    return {
      cooldown: true,
      nextAllowed: cooldown - (now - cooldownMap[key]),
    };
  }

  try {
    const res = await fetch(BASE + path, {
      headers: { Accept: "application/json" },
    });

    const text = await res.text();
    console.log("[API RAW]", path, text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { error: "Invalid JSON response" };
    }

    if (!res.ok || data?.error || data?.success === false) {
      return {
        error: data?.error || `API ${res.status}`,
      };
    }

    cooldownMap[key] = now;
    return data;
  } catch {
    return {
      error: "Network error / API unreachable",
    };
  }
}

export const api = {
  async liteStats() {
    const r = await fetchSafe("/lite/nodes/stats");
    if (r?.error || r?.cooldown) return r;

    return {
      total: r.stats.totalNodes,
      active: r.stats.activeNodes,
      inactive: r.stats.inactiveNodes,
      totalTasks: r.stats.totalTasks,
      time: r.timestamp,
    };
  },

  activeNodes: () => fetchSafe("/lite/nodes/active"),
  nodeDetail: (id) => fetchSafe(`/lite/nodes/id/${id}`),

  mining: (id) => fetchSafe(`/mining/status/${id}`),
  miningCooldown: (id) => fetchSafe(`/mining/cooldown/${id}`),

  liveLog: (addr) => fetchSafe(`/live-log/status/${addr}`),
  claim: (addr) => fetchSafe(`/claim/status/${addr}`),

  claimHistoryNodeId: async (addr) => {
    const r = await fetchSafe(`/claim/history/${addr}`);
    if (r?.error || r?.cooldown) return r;
    return r.lastClaim?.nodeId || null;
  },

  checkCooldown: (nodeId) =>
    fetchSafe(`/metrics/check-cooldown/${nodeId}`),

  taskStats: (nodeId) =>
    fetchSafe(`/polling/node-stats/${nodeId}`),

  requirements: () =>
    fetchSafe("/metrics/requirements", 300_000),

  miningDebugContract: (wallet) =>
    fetchSafe(`/mining/debug/contract/${wallet}`),
};




