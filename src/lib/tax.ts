import { supabase } from "@/integrations/supabase/client";

/**
 * Get effective tax percent for a country + competition level for a year.
 * Falls back to Budget.tax_pct if missing.
 */
export async function getEffectiveTaxPct(country: string, level: 'ITF' | 'Challenger' | 'ATP/WTA', year: number, fallbackPct?: number): Promise<number> {
  const c = (country || 'US').toUpperCase().substring(0, 2);
  const key = `tax:${c}:${level}:${year}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const payload = JSON.parse(cached);
      if (Date.now() - payload.ts < 24 * 60 * 60 * 1000) {
        return payload.pct ?? (fallbackPct ?? 0);
      }
    }
  } catch (e) {
    // ignore cache errors
  }

  try {
    const res = await fetch(`/api/tax-rate?country=${encodeURIComponent(c)}&level=${encodeURIComponent(level)}&year=${encodeURIComponent(String(year))}`);
    if (!res.ok) throw new Error('tax endpoint failed');
    const json = await res.json();
    const pct = json?.pct ?? null;
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), pct }));
    } catch (e) {}
    if (pct == null) return fallbackPct ?? 0;
    return Number(pct);
  } catch (e) {
    console.debug('tax fetch failed', e);
    return fallbackPct ?? 0;
  }
}

export default { getEffectiveTaxPct };
