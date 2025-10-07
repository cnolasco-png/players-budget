import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryView from "@/components/sheets/SummaryView";
import ScenarioCompareView from "@/components/sheets/ScenarioCompareView";
import CashFlowChart from "@/components/sheets/CashFlowChart";
import ScenarioSandbox from "@/components/sheets/ScenarioSandbox";
import ExportButtons from "@/components/export/ExportButtons";
import { useBudgetData, useBudgetList } from "@/hooks/use-budget-data";
import { calculateScenarioTotals } from "@/lib/budgetCalculations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, LayoutGrid, ChartColumn, PieChart } from "lucide-react";

const Sheets = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data: budgets, isLoading: budgetsLoading } = useBudgetList(userId ?? undefined);

  useEffect(() => {
    if (!selectedBudgetId && budgets && budgets.length) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  const { data: budgetData, isLoading } = useBudgetData(selectedBudgetId);

  useEffect(() => {
    if (!selectedScenarioId && budgetData?.scenarios?.length) {
      const defaultScenario = budgetData.scenarios.find((scenario) => scenario.is_default) ??
        budgetData.scenarios[0];
      setSelectedScenarioId(defaultScenario.id);
    }
  }, [budgetData, selectedScenarioId]);

  const scenarioTotals = useMemo(() => {
    if (!budgetData) return [];
    return calculateScenarioTotals(budgetData.scenarios, budgetData.lineItems);
  }, [budgetData]);

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sheets</h1>
                <p className="text-sm text-muted-foreground">
                  Summary, scenario comparison, and cash flow for your active budget.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate("/editor")}>Open Editor</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
        <Card className="p-4">
          {budgetsLoading ? (
            <Skeleton className="h-10 w-64" />
          ) : budgets && budgets.length ? (
            <Tabs value={selectedBudgetId} onValueChange={setSelectedBudgetId} className="w-full">
              <TabsList className="flex w-full flex-wrap">
                {budgets.map((budget) => (
                  <TabsTrigger key={budget.id} value={budget.id} className="flex-1 md:flex-none">
                    {budget.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <p className="text-sm text-muted-foreground">
              No budgets found. Create one from the dashboard to view sheets.
            </p>
          )}
        </Card>

        {isLoading || !budgetData ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            {!budgetData.budget.is_active && (
              <Card className="border border-primary/30 bg-primary/10 text-primary">
                <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide">Player's Budget Pro</p>
                    <p className="text-sm text-primary/80">
                      Renew to keep PDF exports, sponsor-ready decks, and integrations active.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="gold" onClick={() => navigate("/onboarding?upgrade=true")}>Renew Pro</Button>
                    <Button variant="outline" onClick={() => navigate("/settings")}>Compare plans</Button>
                  </div>
                </div>
              </Card>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span>Budget currency: {budgetData.budget.base_currency ?? "USD"}</span>
              </div>
              <ExportButtons
                budget={budgetData.budget}
                scenarios={budgetData.scenarios}
                lineItems={budgetData.lineItems}
                incomes={budgetData.incomes}
                isProUser={Boolean(budgetData.budget.is_active)}
              />
            </div>

            <SummaryView
              scenarios={budgetData.scenarios}
              lineItems={budgetData.lineItems}
              incomes={budgetData.incomes}
              currency={budgetData.budget.base_currency}
              taxRatePct={budgetData.budget.tax_pct}
              selectedScenarioId={selectedScenarioId}
              onScenarioChange={setSelectedScenarioId}
            />

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ChartColumn className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Scenario Comparison</h3>
              </div>
              <ScenarioCompareView
                scenarioTotals={scenarioTotals}
                baselineScenarioId={selectedScenarioId}
                currency={budgetData.budget.base_currency}
                onBaselineChange={setSelectedScenarioId}
                isProUser={Boolean(budgetData.budget.is_active)}
                onUpgrade={() => navigate("/onboarding?upgrade=true")}
              />
            </div>

            {selectedScenarioId && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PieChart className="h-5 w-5" />
                  <h3 className="text-xl font-semibold">Cash Flow</h3>
                </div>
                <CashFlowChart
                  scenarioName={
                    budgetData.scenarios.find((scenario) => scenario.id === selectedScenarioId)?.name ?? "Scenario"
                  }
                  monthlyTotal={
                    scenarioTotals.find((entry) => entry.scenario.id === selectedScenarioId)?.total ?? 0
                  }
                  incomes={budgetData.incomes}
                  taxPct={budgetData.budget.tax_pct}
                  currency={budgetData.budget.base_currency}
                />
              </div>
            )}

            <ScenarioSandbox
              scenarios={budgetData.scenarios}
              lineItems={budgetData.lineItems}
              scenarioTotals={scenarioTotals}
              currency={budgetData.budget.base_currency}
              isProUser={Boolean(budgetData.budget.is_active)}
              onUpgrade={() => navigate("/onboarding?upgrade=true")}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Sheets;
