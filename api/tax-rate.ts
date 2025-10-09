import { createClient } from '@supabase/supabase-js';

const ALLOWED_LEVELS = ['ITF', 'Challenger', 'ATP/WTA'];

// Vercel-style handler
export default async function handler(req: any, res: any) {
  try {
    const { query } = req;
    const countryRaw = (query.country || req.query?.country || '').toString();
    const levelRaw = (query.level || req.query?.level || '').toString();
    const yearRaw = (query.year || req.query?.year || '').toString();

    const country = (countryRaw || '').toUpperCase().slice(0, 2);
    const level = (levelRaw || '') as string;
    const year = Number(yearRaw || new Date().getFullYear());

    // validate
    if (!/^[A-Z]{2}$/.test(country)) {
      return res.status(400).json({ error: 'country must be ISO-2 code' });
    }
    if (!ALLOWED_LEVELS.includes(level)) {
      return res.status(400).json({ error: `level must be one of ${ALLOWED_LEVELS.join(',')}` });
    }
    if (!Number.isInteger(year) || year < 1900 || year > 3000) {
      return res.status(400).json({ error: 'year must be a valid 4-digit year' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: 'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // 1) exact match
    const { data: exact, error: exactErr } = await supabase
      .from('tax_rates_by_level')
      .select('default_pct,year')
      .eq('country', country)
      .eq('level', level)
      .eq('year', year)
      .limit(1)
      .maybeSingle();

    if (exactErr) {
      console.error('tax-rate exact lookup error', exactErr);
    }

    if (exact && exact.default_pct != null) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ pct: Number(exact.default_pct), source: 'tax_rates_by_level', country, level, year });
    }

    // 2) nearest previous year <= requested
    const { data: prev, error: prevErr } = await supabase
      .from('tax_rates_by_level')
      .select('default_pct,year')
      .eq('country', country)
      .eq('level', level)
      .lte('year', year)
      .order('year', { ascending: false })
      .limit(1);

    if (prevErr) console.error('tax-rate prev lookup error', prevErr);
    if (prev && prev.length && prev[0].default_pct != null) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ pct: Number(prev[0].default_pct), source: 'tax_rates_by_level:nearest', country, level, year: prev[0].year });
    }

    // 3) fallback to tax_rates table (country-level default)
    const { data: countryDefault, error: cdErr } = await supabase
      .from('tax_rates')
      .select('default_pct')
      .eq('country', country)
      .limit(1)
      .maybeSingle();

    if (cdErr) console.error('tax-rate countryDefault error', cdErr);
    if (countryDefault && countryDefault.default_pct != null) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ pct: Number(countryDefault.default_pct), source: 'tax_rates', country, level, year });
    }

    // not found
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ pct: null, source: 'missing', country, level, year });
  } catch (err: any) {
    console.error('tax-rate handler error', err);
    return res.status(500).json({ error: err?.message ?? 'unknown' });
  }
}
