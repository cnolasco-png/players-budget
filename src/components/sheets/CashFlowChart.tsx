import { useId, useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { IncomeRecord } from "@/hooks/use-budget-data";
import { buildCashFlowData, formatCurrency } from "@/lib/budgetCalculations";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface CashFlowChartProps {
  scenarioName: string;
  monthlyTotal: number;
  incomes: IncomeRecord[];
  taxPct?: number | null;
  currency?: string | null;
}

const CashFlowChart = ({
  scenarioName,
  monthlyTotal,
  incomes,
  taxPct,
  currency = "USD",
}: CashFlowChartProps) => {
  const data = buildCashFlowData(monthlyTotal, incomes, taxPct);
  const allNegativeNet = data.every((entry) => entry.net < 0);
  const summaryId = useId();

  const summaryText = useMemo(() => {
    if (!data.length) {
      return `No cash-flow data available for ${scenarioName}.`;
    }

    const firstMonth = data[0];
    const lastMonth = data[data.length - 1];
    const trend = lastMonth.net > firstMonth.net ? "improves" : lastMonth.net < firstMonth.net ? "declines" : "stays level";
    const netDescriptor = lastMonth.net >= 0 ? "a surplus" : "a deficit";

    return `Cash flow projection for ${scenarioName} starts with ${formatCurrency(firstMonth.income, currency)} income versus ${formatCurrency(firstMonth.expenses, currency)} expenses. Net position ${trend} across the season, ending with ${netDescriptor} of ${formatCurrency(lastMonth.net, currency)}.`;
  }, [currency, data, scenarioName]);

  let monthsUntilZero: number | null = null;
  if (allNegativeNet) {
    const monthlyDeficit = Math.abs(data[0]?.net ?? 0);
    if (monthlyDeficit > 0) {
      const startingBalance = monthlyTotal; // assume one month of expenses held as reserves
      const months = Math.ceil(startingBalance / monthlyDeficit);
      if (Number.isFinite(months)) {
        monthsUntilZero = Math.max(months, 1);
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h4 className="text-lg font-semibold">Cash Flow Projection</h4>
        <p className="text-sm text-muted-foreground">
          Monthly view of {scenarioName} expenses versus post-tax income.
        </p>
        <p id={summaryId} className="sr-only">
          {summaryText}
        </p>
      </div>
      {monthsUntilZero !== null && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <span className="font-semibold">Balance warning:</span> Balance hits zero in {monthsUntilZero} {monthsUntilZero === 1 ? "month" : "months"} at the current burn rate.
        </div>
      )}
      <div className="h-80" role="img" aria-describedby={summaryId}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.1)" />
            <XAxis dataKey="month" stroke="currentColor" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value, currency)}
              stroke="currentColor"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              name="Income (after tax)"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary)/0.25)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive)/0.15)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="net"
              name="Net"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent)/0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CashFlowChart;
