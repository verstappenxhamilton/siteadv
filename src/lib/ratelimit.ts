const hits: Record<string, { count: number; time: number }> = {};

export function rateLimit(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits[ip] || { count: 0, time: now };
  if (now - entry.time > windowMs) {
    entry.count = 0;
    entry.time = now;
  }
  entry.count += 1;
  hits[ip] = entry;
  return entry.count <= limit;
}
