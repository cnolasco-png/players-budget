import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryView from "@/components/sheets/SummaryView";
import ScenarioCompareView from "@/components/sheets/ScenarioCompareView";
import CashFlowChart from "@/components/sheets/CashFlowChart";
import { useBudgetData } from "@/hooks/use-budget-data";
import { calculateScenarioTotals, calculateFundingGap, formatCurrency } from "@/lib/budgetCalculations";
import { useToast } from "@/hooks/use-toast";
import { exportBudgetToPdf } from "@/lib/exportUtils";
import { ChartColumn, ArrowLeft, TableProperties, LayoutDashboard, ArrowRightLeft, TrendingUp, FileText, Loader2 } from "lucide-react";

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>();

  useEffect(() => {
    if (!id) {
      navigate("/dashboard");
    }
  }, [id, navigate]);

  const { data, isLoading } = useBudgetData(id);
  const { toast } = useToast();
  
  const scenarioParam = searchParams.get("scenario");

  useEffect(() => {
    if (data?.scenarios?.length) {
      const matchedScenario = scenarioParam
        ? data.scenarios.find((scenario) => scenario.id === scenarioParam)
        : undefined;

      const defaultScenario =
        matchedScenario ?? data.scenarios.find((scenario) => scenario.is_default) ?? data.scenarios[0];

      setSelectedScenarioId(defaultScenario?.id);
    }
  }, [data?.scenarios, scenarioParam]);

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const params = new URLSearchParams(searchParams);
    params.set("scenario", scenarioId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const scenarioTotals = useMemo(() => {
    if (!data) return [];
    return calculateScenarioTotals(data.scenarios, data.lineItems);
  }, [data]);

  const activeScenario = useMemo(() => {
    if (!selectedScenarioId) return undefined;
    return scenarioTotals.find((entry) => entry.scenario.id === selectedScenarioId);
  }, [scenarioTotals, selectedScenarioId]);

  const funding = useMemo(() => {
    if (!data || !activeScenario) return null;
    return calculateFundingGap(activeScenario.total, data.incomes, data.budget.tax_pct);
  }, [data, activeScenario]);

  const [isExporting, setIsExporting] = useState(false);
  const isProUser = Boolean(data?.budget.is_active);

  const handleQuickExport = async () => {
    if (!data) return;
    if (!isProUser) {
      toast({
        title: "Pro feature",
        description: "Upgrade to the Pro plan to unlock PDF exports.",
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportBudgetToPdf({
        budget: data.budget,
        scenarios: data.scenarios,
        lineItems: data.lineItems,
        incomes: data.incomes,
      });
      toast({
        title: "PDF generated",
        description: "Check your downloads for the latest budget export.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `${(error as Error).message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-6 space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Budget Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {data?.budget.title ?? "Budget"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Season {data?.budget.season_year} • {data?.budget.base_currency}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/sheets">
                  <ChartColumn className="mr-2 h-4 w-4" />Sheets
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/editor">
                  <TableProperties className="mr-2 h-4 w-4" />Editor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {isLoading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6 shadow-card">
                <p className="text-sm text-muted-foreground">Active Scenario</p>
                <p className="text-xl font-semibold">
                  {activeScenario?.scenario.name ?? "Select a scenario"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tax country: {data.budget.tax_country ?? "Not set"}
                </p>
              </Card>
              <Card className="p-6 shadow-card">
                <p className="text-sm text-muted-foreground">Monthly expenses ({activeScenario?.scenario.name ?? "–"})</p>
                <p className="text-xl font-semibold">
                  {activeScenario ? formatCurrency(activeScenario.total, data.budget.base_currency ?? "USD") : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your selected scenario
                </p>
              </Card>
              <Card className="p-6 shadow-card">
                <p className="text-sm text-muted-foreground">Funding gap after tax</p>
                <p className="text-xl font-semibold">
                  {funding ? formatCurrency(funding.fundingGap, data.budget.base_currency ?? "USD") : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Net income: {funding ? formatCurrency(funding.netAfterTax, data.budget.base_currency ?? "USD") : "—"}
                </p>
              </Card>
            </div>

            <SummaryView
              scenarios={data.scenarios}
              lineItems={data.lineItems}
              incomes={data.incomes}
              currency={data.budget.base_currency}
              taxRatePct={data.budget.tax_pct}
              selectedScenarioId={selectedScenarioId}
              onScenarioChange={handleScenarioChange}
            />

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRightLeft className="h-4 w-4" />
                <h2 className="text-xl font-semibold">Scenario comparison</h2>
              </div>
              <ScenarioCompareView
                scenarioTotals={scenarioTotals}
                baselineScenarioId={selectedScenarioId}
                currency={data.budget.base_currency}
                onBaselineChange={handleScenarioChange}
              />
            </section>

            {selectedScenarioId && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ChartColumn className="h-4 w-4" />
                  <h2 className="text-xl font-semibold">Cash flow outlook</h2>
                </div>
                <CashFlowChart
                  scenarioName={
                    data.scenarios.find((scenario) => scenario.id === selectedScenarioId)?.name ?? "Scenario"
                  }
                  monthlyTotal={
                    scenarioTotals.find((entry) => entry.scenario.id === selectedScenarioId)?.total ?? 0
                  }
                  incomes={data.incomes}
                  taxPct={data.budget.tax_pct}
                  currency={data.budget.base_currency}
                />
              </section>
            )}
          </div>
        )}
      </main>
      {!isLoading && data && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <span className="rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
            Pro • Quick export
          </span>
          <Button
            variant="gold"
            size="lg"
            onClick={handleQuickExport}
            disabled={isExporting}
            className="shadow-xl"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isExporting ? "Generating..." : "Export now"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BudgetDetail;
