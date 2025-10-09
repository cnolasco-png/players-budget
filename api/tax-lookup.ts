// Server endpoint to lookup effective tax pct with fallback to budgets
// Accepts query params: country, level, year

const _fetch = (globalThis as any).fetch;

export default async (req: any, res: any) => {
  try {
    const url = new URL(req.url, process.env.SITE_URL || 'http://localhost');
    const country = (url.searchParams.get('country') || 'US').toUpperCase().substring(0,2);
    const level = (url.searchParams.get('level') || 'ATP/WTA');
    const year = Number(url.searchParams.get('year') || new Date().getFullYear());

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL' });
    }

    // try table first
    const get = await _fetch(`${supabaseUrl}/rest/v1/tax_rates_by_level?country=eq.${country}&level=eq.${encodeURIComponent(level)}&year=eq.${year}&select=default_pct`, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });
    if (get.ok) {
      const d = await get.json();
      if (Array.isArray(d) && d[0] && d[0].default_pct != null) {
        return res.json({ pct: Number(d[0].default_pct), source: 'table' });
      }
    }

    // fallback: budgets
    const get2 = await _fetch(`${supabaseUrl}/rest/v1/budgets?tax_country=eq.${country}&select=tax_pct&order=created_at.desc&limit=1`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (get2.ok) {
      const d2 = await get2.json();
      if (Array.isArray(d2) && d2[0] && d2[0].tax_pct != null) {
        return res.json({ pct: Number(d2[0].tax_pct), source: 'budget' });
      }
    }

    return res.json({ pct: 0, source: 'default' });
  } catch (err: any) {
    console.error('tax-lookup error', err);
    res.status(500).json({ error: err?.message ?? 'unknown' });
  }
};
