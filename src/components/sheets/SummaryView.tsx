import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { IncomeRecord, LineItemRecord, ScenarioRecord } from "@/hooks/use-budget-data";
import {
  calculateScenarioTotals,
  calculateFundingGap,
  formatCurrency,
  ScenarioTotal,
} from "@/lib/budgetCalculations";
import { TrendingUp, Wallet, PiggyBank, Percent } from "lucide-react";
import { useMemo } from "react";

interface SummaryViewProps {
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
  currency?: string | null;
  taxRatePct?: number | null;
  selectedScenarioId?: string;
  onScenarioChange?: (scenarioId: string) => void;
}

const SummaryView = ({
  scenarios,
  lineItems,
  incomes,
  currency = "USD",
  taxRatePct = 0,
  selectedScenarioId,
  onScenarioChange,
}: SummaryViewProps) => {
  const scenarioTotals = useMemo<ScenarioTotal[]>(
    () => calculateScenarioTotals(scenarios, lineItems),
    [scenarios, lineItems],
  );

  const activeScenario = useMemo(() => {
    if (!scenarioTotals.length) return undefined;
    const match = scenarioTotals.find((entry) => entry.scenario.id === selectedScenarioId);
    return match ?? scenarioTotals[0];
  }, [scenarioTotals, selectedScenarioId]);

  const funding = useMemo(() => {
    if (!activeScenario) return null;
    return calculateFundingGap(activeScenario.total, incomes, taxRatePct);
  }, [activeScenario, incomes, taxRatePct]);

  if (!activeScenario || !funding) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Add scenarios and line items to see your budget summary.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Budget Summary</h3>
          <p className="text-sm text-muted-foreground">
            Snapshot of monthly activity including taxes and income coverage.
          </p>
        </div>
        <div className="w-full md:w-64">
          <Select
            value={activeScenario.scenario.id}
            onValueChange={(value) => onScenarioChange?.(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarioTotals.map((entry) => (
                <SelectItem key={entry.scenario.id} value={entry.scenario.id}>
                  {entry.scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(funding.monthlyExpenses, currency)}
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold">
                {formatCurrency(funding.monthlyIncome, currency)}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-secondary-foreground">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net After Tax</p>
              <p className="text-2xl font-bold">
                {formatCurrency(funding.netAfterTax, currency)}
              </p>
              <Badge variant={funding.netAfterTax >= funding.monthlyExpenses ? "default" : "secondary"}>
                {funding.netAfterTax >= funding.monthlyExpenses ? "Covered" : "Gap"}
              </Badge>
            </div>
            <div className="rounded-xl bg-accent/10 p-3 text-accent">
              <PiggyBank className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tax Rate</p>
              <p className="text-2xl font-bold">{funding.taxRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Applied to monthly income</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-muted-foreground">
              <Percent className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Income Sources</h4>
        {incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add monthly income sources to track funding.</p>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{income.label}</p>
                  <p className="text-xs text-muted-foreground">{income.type ?? "Recurring"}</p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(income.amount_monthly ?? 0, income.currency ?? currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SummaryView;
