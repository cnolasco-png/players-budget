import { test, expect, beforeEach } from "vitest";
import { getEffectiveTaxPct } from "./tax";

const mockFetch: typeof fetch = async () =>
  new Response(JSON.stringify({ pct: null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  globalThis.fetch = mockFetch;
});

test("fallback when endpoint returns null", async () => {
  const pct = await getEffectiveTaxPct("US", "Challenger", new Date().getFullYear(), 12.5);
  if (pct !== 12.5) throw new Error(`Expected fallback 12.5 got ${pct}`);
});

console.log("tax.test ran");
