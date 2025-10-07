import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LineItemRecord, ScenarioRecord } from "@/hooks/use-budget-data";
import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ScenarioQuickViewProps {
  budgetId: string;
  currency?: string | null;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
}

const ScenarioQuickView = ({ budgetId, currency = "USD", scenarios, lineItems }: ScenarioQuickViewProps) => {
  const totals = calculateScenarioTotals(scenarios, lineItems);

  if (!totals.length) {
    return (
      <Card className="p-5 border-dashed">
        <p className="text-sm text-muted-foreground">Add scenarios to see a quick comparison.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {totals.map((entry) => {
        const total = formatCurrency(entry.total, currency);
        const description = entry.scenario.is_default ? "Default plan" : "Custom scenario";

        return (
          <Card key={entry.scenario.id} className="p-5 shadow-card border border-border/60">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{description}</p>
                <h4 className="text-lg font-semibold">{entry.scenario.name}</h4>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly total</p>
                <p className="text-xl font-bold">{total}</p>
              </div>

              <Button variant="outline" asChild>
                <Link to={`/budget/${budgetId}?scenario=${entry.scenario.id}`}>
                  View details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ScenarioQuickView;
