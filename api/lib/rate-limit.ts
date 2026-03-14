interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();

  // Clean expired entries
  for (const [k, v] of store) {
    if (now >= v.resetTime) store.delete(k);
  }

  const entry = store.get(key);

  if (!entry || now >= entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const resetIn = entry.resetTime - now;
    return { success: false, remaining: 0, resetIn };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}
