const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

export function createRateLimiter(maxPerWindow: number) {
  const store = new Map<string, { count: number; resetAt: number }>();
  return (ip: string): boolean => {
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    if (entry.count >= maxPerWindow) return false;
    entry.count += 1;
    return true;
  };
}

export function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
  if (fromEnv?.length) return fromEnv;
  return ['https://elite-mob.github.io', 'http://localhost:8080', 'http://localhost:5173'];
}

export function setCorsHeaders(
  req: { headers: { origin?: string } },
  res: { set: (key: string, value: string) => void },
  methods = 'GET, POST, OPTIONS',
): string | null {
  const origin = req.headers.origin ?? '';
  const allowed = getAllowedOrigins();
  const match = allowed.includes(origin) ? origin : allowed[0];
  if (match) {
    res.set('Access-Control-Allow-Origin', match);
    res.set('Access-Control-Allow-Methods', methods);
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Vary', 'Origin');
  }
  return match;
}
