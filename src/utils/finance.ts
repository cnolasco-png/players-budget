// src/utils/finance.ts
// Small, well-typed helpers used across dashboard & reports.

export function applyContingency(amount: number, contingencyPct = 0): number {
  // adds a buffer; 10 means +10%
  return Math.max(0, amount) * (1 + (contingencyPct ?? 0) / 100);
}

/**
 * Plan cost for a month. Accepts either a raw number or an object with base and contingency.
 */
export function planMonthlyCost(
  plan: number | { base: number; contingencyPct?: number }
): number {
  if (typeof plan === "number") return plan;
  return applyContingency(plan.base, plan.contingencyPct ?? 0);
}

/**
 * Sum income month-to-date from activity entries.
 */
export function sumIncomeMTD(entries: { kind: "income" | "expense"; amount: number; occurredAt: string | Date }[], month: Date): number {
  const m = month.getMonth();
  const y = month.getFullYear();
  return entries.reduce((sum, e) => {
    if (e.kind !== "income") return sum;
    const d = new Date(e.occurredAt);
    return (d.getMonth() === m && d.getFullYear() === y) ? sum + Number(e.amount || 0) : sum;
  }, 0);
}

/**
 * Simple forecast to year-end given arrays of monthly actuals and plan.
 * currentIndex is 0-based month index (Jan=0).
 */
export function forecastToYearEnd(monthlyActuals: number[], monthlyPlan: number[], currentIndex: number): number {
  const actualYTD = monthlyActuals.slice(0, currentIndex + 1).reduce((a, b) => a + b, 0);
  const remainingPlan = monthlyPlan.slice(currentIndex + 1).reduce((a, b) => a + b, 0);
  return actualYTD + remainingPlan;
}

/**
 * Effective prize tax percentage by country, with a sensible default.
 * If you already have a tax_rates table, map from it before calling this.
 */
export function getEffectiveTaxPct(countryCode?: string, fallback = 25): number {
  const code = (countryCode || "").toUpperCase();
  // light defaults; override with real data if available
  const map: Record<string, number> = {
    US: 24, GB: 20, DE: 26, ES: 24, FR: 25, IT: 26, PT: 25, BR: 27, CA: 25, AU: 24,
  };
  return map[code] ?? fallback;
}
