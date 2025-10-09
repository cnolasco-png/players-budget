import { test, expect, vi, beforeEach } from 'vitest';
import { getEffectiveTaxPct } from './tax';

// simple mock: override fetch to return pct:null
(globalThis as any).fetch = async (url: string) => {
  return {
    ok: true,
    json: async () => ({ pct: null }),
  } as any;
};

test('fallback when endpoint returns null', async () => {
  const pct = await getEffectiveTaxPct('US', 'Challenger', new Date().getFullYear(), 12.5);
  if (pct !== 12.5) throw new Error(`Expected fallback 12.5 got ${pct}`);
});

console.log('tax.test ran');
