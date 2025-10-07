import type { IncomeRecord, LineItemRecord, ScenarioRecord } from "@/hooks/use-budget-data";

export interface ScenarioTotal {
  scenario: ScenarioRecord;
  total: number;
}

export interface FundingGapResult {
  monthlyExpenses: number;
  monthlyIncome: number;
  netAfterTax: number;
  fundingGap: number;
  taxRate: number;
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toNumber(value?: number | null) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return 0;
}

export function groupLineItemsByScenario(lineItems: LineItemRecord[]) {
  return lineItems.reduce<Record<string, LineItemRecord[]>>((acc, item) => {
    if (!acc[item.scenario_id]) {
      acc[item.scenario_id] = [];
    }
    acc[item.scenario_id].push(item);
    return acc;
  }, {});
}

export function calculateScenarioTotals(
  scenarios: ScenarioRecord[],
  lineItems: LineItemRecord[],
): ScenarioTotal[] {
  const grouped = groupLineItemsByScenario(lineItems);

  return scenarios.map((scenario) => {
    const items = grouped[scenario.id] ?? [];
    const total = items.reduce((sum, item) => {
      const qty = toNumber(item.qty ?? 1);
      const unitCost = toNumber(item.unit_cost);
      return sum + qty * unitCost;
    }, 0);

    return {
      scenario,
      total,
    };
  });
}

export function calculateFundingGap(
  scenarioTotal: number,
  incomes: IncomeRecord[],
  taxPct?: number | null,
): FundingGapResult {
  const monthlyIncome = incomes.reduce((sum, income) => sum + toNumber(income.amount_monthly), 0);
  const taxRate = toNumber(taxPct) / 100;
  const netAfterTax = monthlyIncome - monthlyIncome * taxRate;
  const fundingGap = scenarioTotal - netAfterTax;

  return {
    monthlyExpenses: scenarioTotal,
    monthlyIncome,
    netAfterTax,
    fundingGap,
    taxRate: taxRate * 100,
  };
}

export function buildCashFlowData(
  scenarioTotal: number,
  incomes: IncomeRecord[],
  taxPct?: number | null,
) {
  const monthlyExpenses = scenarioTotal;
  const { netAfterTax, monthlyIncome } = calculateFundingGap(scenarioTotal, incomes, taxPct);
  const netMonthly = monthlyIncome ? netAfterTax - monthlyExpenses : -monthlyExpenses;

  return MONTH_LABELS.map((month) => ({
    month,
    income: netAfterTax,
    expenses: monthlyExpenses,
    net: netMonthly,
  }));
}

export function compareScenarios(
  scenarioTotals: ScenarioTotal[],
  baselineId?: string,
) {
  if (!scenarioTotals.length) return [];
  const baseline =
    scenarioTotals.find((entry) => entry.scenario.id === baselineId) ?? scenarioTotals[0];

  return scenarioTotals.map((entry) => ({
    id: entry.scenario.id,
    name: entry.scenario.name,
    total: entry.total,
    variance: entry.total - baseline.total,
    variancePct: baseline.total ? ((entry.total - baseline.total) / baseline.total) * 100 : 0,
  }));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
