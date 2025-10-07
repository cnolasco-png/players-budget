import { useMemo, useId } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ScenarioRecord } from "@/hooks/use-budget-data";
import { compareScenarios, formatCurrency, ScenarioTotal } from "@/lib/budgetCalculations";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";

interface ScenarioCompareViewProps {
  scenarioTotals: ScenarioTotal[];
  baselineScenarioId?: string;
  currency?: string | null;
  onBaselineChange?: (scenarioId: string) => void;
  isProUser?: boolean;
  onUpgrade?: () => void;
}

const ScenarioCompareView = ({
  scenarioTotals,
  baselineScenarioId,
  currency = "USD",
  onBaselineChange,
  isProUser = true,
  onUpgrade,
}: ScenarioCompareViewProps) => {
  const comparison = useMemo(
    () => compareScenarios(scenarioTotals, baselineScenarioId),
    [scenarioTotals, baselineScenarioId],
  );

  if (!comparison.length) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Add scenarios and line items to compare budgets.</p>
      </Card>
    );
  }

  const lowest = comparison.reduce((current, entry) => (entry.total < current.total ? entry : current), comparison[0]);
  const lowestId = lowest.id;

  const chartData = comparison.map((entry) => ({
    id: entry.id,
    name: entry.name,
    total: Math.round(entry.total),
    variance: Math.round(entry.variance),
    variancePct: entry.variancePct,
    isBaseline: entry.id === baselineScenarioId,
    isLowest: entry.id === lowestId,
  }));

  const baseline = comparison.find((entry) => entry.variance === 0) ?? comparison[0];
  const summaryId = useId();
  const tableSummaryId = useId();

  if (!isProUser) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-3">Scenario Totals</h4>
          <p className="text-sm text-muted-foreground">
            Upgrade to Player's Budget Pro to view variance, color-coded comparisons, and sponsor-ready charts.
          </p>
          <div className="mt-4 space-y-2">
            {comparison.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{entry.name}</span>
                <span className="font-semibold">{formatCurrency(entry.total, currency)}</span>
              </div>
            ))}
          </div>
          <Button variant="gold" className="mt-4" onClick={onUpgrade}>
            Unlock advanced comparisons
          </Button>
        </Card>
      </div>
    );
  }

  const summaryText = useMemo(() => {
    const scenarioCount = comparison.length;
    const lowestDelta = lowest.variance;
    const lowestDescriptor =
      lowestDelta === 0
        ? "matches the baseline"
        : `${formatCurrency(Math.abs(lowestDelta), currency)} ${lowestDelta < 0 ? "below" : "above"} the baseline`;
    return `Comparing ${scenarioCount} scenarios in ${currency}. Baseline ${baseline.name} totals ${formatCurrency(baseline.total, currency)}. Lowest cost scenario ${lowest.name} ${lowestDescriptor}.`;
  }, [baseline.name, baseline.total, comparison.length, currency, lowest.name, lowest.variance]);

  const tableSummaryText = useMemo(
    () =>
      comparison
        .map((entry) => {
          if (entry.variance === 0) {
            return `${entry.name} is the baseline at ${formatCurrency(entry.total, currency)}.`;
          }
          const direction = entry.variance > 0 ? "above" : "below";
          return `${entry.name} totals ${formatCurrency(entry.total, currency)}, which is ${formatCurrency(Math.abs(entry.variance), currency)} ${direction} baseline.`;
        })
        .join(" "),
    [comparison, currency],
  );

  const handleBaselineChange = (scenarioId: string) => {
    if (!onBaselineChange || scenarioId === baselineScenarioId) return;
    onBaselineChange(scenarioId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6 shadow-card">
        <h4 className="text-lg font-semibold mb-4">Scenario Totals</h4>
        <p id={summaryId} className="sr-only">
          {summaryText}
        </p>
        <div className="h-72" role="img" aria-describedby={summaryId}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis dataKey="name" stroke="currentColor" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, currency)}
                stroke="currentColor"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, _name, item) => {
                  const payload = item?.payload as (typeof chartData)[number] | undefined;
                  const variance = payload?.variance ?? 0;
                  const pct = payload?.variancePct ?? 0;
                  const varianceLabel =
                    variance === 0
                      ? "Baseline"
                      : `${variance > 0 ? "+" : "-"}${formatCurrency(Math.abs(variance), currency)} (${pct > 0 ? "+" : ""}${pct.toFixed(1)}%)`;
                  return [formatCurrency(value, currency), `Variance: ${varianceLabel}`];
                }}
                contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))" }}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.isBaseline ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.6)"}
                    fillOpacity={entry.isLowest ? 1 : 0.6}
                    stroke={entry.isLowest ? "hsl(var(--primary))" : undefined}
                    strokeWidth={entry.isLowest ? 1.5 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Variance vs. {baseline.name}</h4>
        <p id={tableSummaryId} className="sr-only">
          {tableSummaryText}
        </p>
        <div className="overflow-x-auto" aria-describedby={tableSummaryId}>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Monthly Total</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.map((entry) => {
                  const isBaseline = entry.id === baselineScenarioId;
                  const isLowest = entry.id === lowestId;
                  const varianceLabel =
                    entry.variance === 0
                      ? "0%"
                      : `${entry.variancePct > 0 ? "+" : ""}${entry.variancePct.toFixed(1)}%`;

                  return (
                    <TableRow
                      key={entry.id}
                      role={onBaselineChange ? "button" : undefined}
                      tabIndex={onBaselineChange ? 0 : undefined}
                      className={cn(
                        onBaselineChange && "cursor-pointer hover:bg-muted/70",
                        "transition-colors",
                        isBaseline && "bg-primary/5",
                        isLowest && "border-l-4 border-primary",
                      )}
                      onClick={() => handleBaselineChange(entry.id)}
                      onKeyDown={(event) => {
                        if (!onBaselineChange) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleBaselineChange(entry.id);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span>{entry.name}</span>
                            {isBaseline && <Badge variant="secondary">Baseline</Badge>}
                            {isLowest && !isBaseline && (
                              <Badge variant="outline" className="border-primary text-primary">
                                Lowest cost
                              </Badge>
                            )}
                          </div>
                          {onBaselineChange && !isBaseline && (
                            <span className="text-xs font-medium text-primary">Set baseline</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.total, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                entry.variance === 0
                                  ? "text-muted-foreground"
                                  : entry.variance > 0
                                  ? "text-destructive"
                                  : "text-emerald-600",
                              )}
                            >
                              {entry.variance === 0
                                ? "Baseline"
                                : `${entry.variance > 0 ? "+" : "-"}${formatCurrency(Math.abs(entry.variance), currency)}`}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{varianceLabel}</p>
                          </TooltipContent>
                        </UiTooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
};

export default ScenarioCompareView;
