const hits = new Map<string, { count: number; ts: number }>();

export function rateLimit(id: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(id);
  if (!entry || now - entry.ts > windowMs) {
    hits.set(id, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
