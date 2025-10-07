import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import type { LineItemRecord, ScenarioRecord } from "@/hooks/use-budget-data";
import type { ScenarioTotal } from "@/lib/budgetCalculations";

interface ScenarioSandboxProps {
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  scenarioTotals: ScenarioTotal[];
  currency?: string | null;
  isProUser: boolean;
  onUpgrade?: () => void;
}

const ScenarioSandbox = ({
  scenarios,
  lineItems,
  scenarioTotals,
  currency = "USD",
  isProUser,
  onUpgrade,
}: ScenarioSandboxProps) => {
  const [extraTournaments, setExtraTournaments] = useState(0);
  const [expenseShift, setExpenseShift] = useState(0);

  const totalsByScenario = useMemo(() => calculateScenarioTotals(scenarios, lineItems), [scenarios, lineItems]);

  const forecast = useMemo(() => {
    return totalsByScenario.map((entry) => {
      const tournamentSpend = lineItems
        .filter((item) => item.scenario_id === entry.scenario.id && item.unit === "per_tournament")
        .reduce((sum, item) => sum + (item.qty ?? 1) * (item.unit_cost ?? 0), 0);

      const expenseAdjustment = entry.total * (expenseShift / 100);
      const tournamentAdjustment = tournamentSpend * extraTournaments;
      const forecastTotal = entry.total + expenseAdjustment + tournamentAdjustment;

      return {
        name: entry.scenario.name,
        baseline: entry.total,
        forecast: forecastTotal,
        tournamentAdjustment,
        expenseAdjustment,
      };
    });
  }, [extraTournaments, expenseShift, lineItems, totalsByScenario]);

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">Scenario sandbox</h4>
          <p className="text-sm text-muted-foreground">
            Experiment with extra tournaments or budget adjustments before you change live numbers.
          </p>
        </div>
        {!isProUser && (
          <Button variant="gold" onClick={onUpgrade}>
            Unlock forecasting
          </Button>
        )}
      </div>

      {!isProUser ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Forecasting insights are part of Player's Budget Pro. Upgrade to simulate travel schedules and budget changes with a
          single click.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Additional tournaments</span>
              <span className="text-sm font-semibold">{extraTournaments}</span>
            </div>
            <Slider
              value={[extraTournaments]}
              onValueChange={([value]) => setExtraTournaments(Math.round(value))}
              min={0}
              max={6}
              step={1}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Expense change</span>
              <span className="text-sm font-semibold">{expenseShift > 0 ? "+" : ""}{expenseShift}%</span>
            </div>
            <Slider
              value={[expenseShift]}
              onValueChange={([value]) => setExpenseShift(Math.round(value))}
              min={-20}
              max={30}
              step={1}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {forecast.map((entry) => (
              <Card key={entry.name} className="border border-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Baseline: {formatCurrency(entry.baseline, currency)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(entry.forecast, currency)}
                  </p>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>
                    Tournament impact: {formatCurrency(entry.tournamentAdjustment, currency)} ({extraTournaments} extra)
                  </p>
                  <p>
                    Expense shift: {formatCurrency(entry.expenseAdjustment, currency)} ({expenseShift}% overall)
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScenarioSandbox;
