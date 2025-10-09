// Simple server-side FX proxy with in-memory cache
// Returns JSON: { base, rates, fetched_at }

const CACHE: Record<string, { ts: number; data: any }> = {};
const TTL = 12 * 60 * 60 * 1000; // 12 hours

const _fetch = (globalThis as any).fetch;

export default async (req: any, res: any) => {
  try {
    const base = (req.query?.base || req.query?.base?.toString?.() || (req.url && new URL(req.url, process.env.SITE_URL || 'http://localhost').searchParams.get('base')) || 'USD').toString().toUpperCase();
    const now = Date.now();

    const cached = CACHE[base];
    if (cached && now - cached.ts < TTL) {
      res.setHeader('Cache-Control', 'public, max-age=43200');
      return res.json({ base, rates: cached.data, cached: true, fetched_at: new Date(cached.ts).toISOString() });
    }

    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&places=6`;
    const r = await _fetch(url);
    if (!r.ok) {
      const text = await r.text();
      console.error('FX fetch failed', text);
      return res.status(500).json({ error: 'Failed to fetch FX rates' });
    }

    const json = await r.json();
    const rates = json.rates ?? null;
    CACHE[base] = { ts: now, data: rates };

    res.setHeader('Cache-Control', 'public, max-age=43200');
    return res.json({ base, rates, cached: false, fetched_at: new Date(now).toISOString() });
  } catch (err: any) {
    console.error('fx-rates error', err);
    res.status(500).json({ error: err?.message ?? 'unknown' });
  }
};
