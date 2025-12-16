const BASE = "https://node.netrumlabs.dev";
const cache = new Map();
const TTL = 30_000;

export async function fetchAPI(path) {
  const now = Date.now();
  const cached = cache.get(path);

  if (cached && now - cached.time < TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(BASE + path);
    if (!res.ok) return { __error: true };

    const text = await res.text();
    const data = text ? JSON.parse(text) : { success: true };

    cache.set(path, { time: now, data });
    return data;
  } catch {
    return { __error: true };
  }
}
