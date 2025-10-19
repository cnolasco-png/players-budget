// Server endpoint to lookup effective tax pct with fallback to budgets
// Accepts query params: country, level, year

import type { VercelRequest, VercelResponse } from '@vercel/node';

type TaxRateRow = {
  default_pct: number | null;
};

type BudgetRow = {
  tax_pct: number | null;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const baseUrl = process.env.SITE_URL || 'http://localhost';
    const url = new URL(req.url ?? '', baseUrl);
    const country = (url.searchParams.get('country') || 'US').toUpperCase().substring(0, 2);
    const level = url.searchParams.get('level') || 'ATP/WTA';
    const year = Number(url.searchParams.get('year') || new Date().getFullYear());

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL' });
    }

    // try table first
    const get = await fetch(
      `${supabaseUrl}/rest/v1/tax_rates_by_level?country=eq.${country}&level=eq.${encodeURIComponent(
        level,
      )}&year=eq.${year}&select=default_pct`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      },
    );
    if (get.ok) {
      const data = (await get.json()) as TaxRateRow[];
      if (Array.isArray(data) && data[0]?.default_pct != null) {
        return res.json({ pct: Number(data[0].default_pct), source: 'table' });
      }
    }

    // fallback: budgets
    const get2 = await fetch(
      `${supabaseUrl}/rest/v1/budgets?tax_country=eq.${country}&select=tax_pct&order=created_at.desc&limit=1`,
      {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      },
    );
    if (get2.ok) {
      const data = (await get2.json()) as BudgetRow[];
      if (Array.isArray(data) && data[0]?.tax_pct != null) {
        return res.json({ pct: Number(data[0].tax_pct), source: 'budget' });
      }
    }

    return res.json({ pct: 0, source: 'default' });
  } catch (err) {
    console.error('tax-lookup error', err);
    const message = err instanceof Error ? err.message : 'unknown';
    res.status(500).json({ error: message });
  }
};
