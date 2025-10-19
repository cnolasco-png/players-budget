import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

const ALLOWED_LEVELS = ['ITF', 'Challenger', 'ATP/WTA'] as const;

type Level = (typeof ALLOWED_LEVELS)[number];

type TaxRateByLevelRow = {
  default_pct: number | null;
  year: number | null;
};

type TaxRateRow = {
  default_pct: number | null;
};

// Vercel-style handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const countryRaw = (req.query?.country ?? '').toString();
    const levelRaw = (req.query?.level ?? '').toString();
    const yearRaw = (req.query?.year ?? '').toString();

    const country = countryRaw.toUpperCase().slice(0, 2);
    const level = levelRaw as Level;
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

    const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // 1) exact match
    const { data: exact, error: exactErr } = await supabase
      .from('tax_rates_by_level')
      .select('default_pct,year')
      .eq('country', country)
      .eq('level', level)
      .eq('year', year)
      .limit(1)
      .maybeSingle<TaxRateByLevelRow>();

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
    const prevRow = (prev as TaxRateByLevelRow[] | null)?.[0];
    if (prevRow && prevRow.default_pct != null) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res
        .status(200)
        .json({ pct: Number(prevRow.default_pct), source: 'tax_rates_by_level:nearest', country, level, year: prevRow.year });
    }

    // 3) fallback to tax_rates table (country-level default)
    const { data: countryDefault, error: cdErr } = await supabase
      .from('tax_rates')
      .select('default_pct')
      .eq('country', country)
      .limit(1)
      .maybeSingle<TaxRateRow>();

    if (cdErr) console.error('tax-rate countryDefault error', cdErr);
    if (countryDefault && countryDefault.default_pct != null) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ pct: Number(countryDefault.default_pct), source: 'tax_rates', country, level, year });
    }

    // not found
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ pct: null, source: 'missing', country, level, year });
  } catch (err) {
    console.error('tax-rate handler error', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return res.status(500).json({ error: message });
  }
}
