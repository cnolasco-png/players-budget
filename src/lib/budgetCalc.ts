import { supabase } from "@/integrations/supabase/client";

export type ForecastRow = {
  month: string; // YYYY-MM
  plannedCost: number;
  plannedIncome: number;
  net: number;
};

function toNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function applyContingency(amount: number, contingencyPct?: number | null) {
  const pct = toNumber(contingencyPct) / 100;
  return amount * (1 + pct);
}

export async function sumExpensesMTD(budgetId: string, now = new Date()): Promise<number> {
  if (!budgetId) return 0;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const next = new Date(year, now.getMonth() + 1, 1).toISOString().substring(0, 10);

  const { data, error } = await supabase
    .from("expense_entries")
    .select("amount")
    .eq("budget_id", budgetId)
    .gte("date", start)
    .lt("date", next);

  if (error) throw error;
  return (data ?? []).reduce((s: number, row: any) => s + toNumber(row.amount), 0);
}

export async function sumIncomeMTD(budgetId: string, taxPct = 0): Promise<number> {
  if (!budgetId) return 0;
  const { data, error } = await supabase
    .from("income_sources")
    .select("amount_monthly")
    .eq("budget_id", budgetId);

  if (error) throw error;
  const total = (data ?? []).reduce((s: number, r: any) => s + toNumber(r.amount_monthly), 0);
  const rate = toNumber(taxPct) / 100;
  return total * (1 - rate);
}

export async function planMonthlyCost(budgetId: string, scenarioId: string): Promise<number> {
  if (!budgetId || !scenarioId) return 0;

  const { data: items, error } = await supabase
    .from("line_items")
    .select("qty, unit_cost")
    .eq("scenario_id", scenarioId);

  if (error) throw error;

  const base = (items ?? []).reduce((s: number, it: any) => s + toNumber(it.qty ?? 1) * toNumber(it.unit_cost), 0);

  // fetch budget to read contingency
  const { data: budgetRows, error: bErr } = await supabase
    .from("budgets")
    .select("contingency_pct")
    .eq("id", budgetId)
    .maybeSingle();

  if (bErr) throw bErr;
  const contingency = budgetRows?.contingency_pct ?? 0;
  return applyContingency(base, contingency);
}

export function projectMonthsRemaining(year: number, from = new Date()): string[] {
  const months: string[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(year, 11, 31);
  let cursor = new Date(start);
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
}

export async function forecastToYearEnd(budgetId: string, scenarioId: string, now = new Date()): Promise<ForecastRow[]> {
  const year = now.getFullYear();
  const months = projectMonthsRemaining(year, now);

  // fetch tax_pct from budget
  const { data: budgetRows } = await supabase.from("budgets").select("tax_pct").eq("id", budgetId).maybeSingle();
  const taxPct = budgetRows?.tax_pct ?? 0;

  const plannedCost = await planMonthlyCost(budgetId, scenarioId);
  const plannedIncome = await sumIncomeMTD(budgetId, taxPct);

  return months.map((m) => ({ month: m, plannedCost, plannedIncome, net: plannedIncome - plannedCost }));
}

export default {
  sumExpensesMTD,
  sumIncomeMTD,
  planMonthlyCost,
  projectMonthsRemaining,
  forecastToYearEnd,
  applyContingency,
};
