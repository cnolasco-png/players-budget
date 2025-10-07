import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, LogOut, Plus, Settings, LayoutDashboard, TableProperties, ChartPie, Wallet, Loader2 } from "lucide-react";
import { useBudgetData } from "@/hooks/use-budget-data";
import { formatCurrency } from "@/lib/budgetCalculations";
import ScenarioQuickView from "@/components/dashboard/ScenarioQuickView";
import ActivityLog, { ActivityEntry } from "@/components/dashboard/ActivityLog";
import { Skeleton } from "@/components/ui/skeleton";

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  prize: "Prize money",
  sponsors: "Sponsors",
  gifts: "Gifts",
  other: "Other",
};

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryDashboard, setRetryDashboard] = useState(false);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [activeBudgetId, setActiveBudgetId] = useState<string | undefined>();
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState<number | null>(null);
  const [monthlyExpenseLoading, setMonthlyExpenseLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      setProfile(profileData);

      // Check if profile is complete
      if (!profileData?.country || !profileData?.player_level) {
        navigate("/onboarding");
        return;
      }

      // Fetch budgets
      const { data: budgetsData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const nextBudgets = budgetsData || [];
      setBudgets(nextBudgets);
      setActiveBudgetId((prev) => {
        if (prev && nextBudgets.some((budget) => budget.id === prev)) {
          return prev;
        }
        const active = nextBudgets.find((budget) => budget.is_active);
        return active?.id ?? nextBudgets[0]?.id;
      });
      setRetryDashboard(false);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error loading dashboard",
        description: `${error.message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setRetryDashboard(true);
    } finally {
      setBudgetsLoading(false);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateBudget = () => {
    navigate("/onboarding");
  };

  const handleManageBilling = () => {
    const portalUrl = import.meta.env.VITE_STRIPE_PORTAL_URL;
    if (!portalUrl) {
      toast({
        title: "Billing portal unavailable",
        description: "Add VITE_STRIPE_PORTAL_URL to enable subscription management.",
        variant: "destructive",
      });
      return;
    }
    window.open(portalUrl, "_blank", "noopener,noreferrer");
  };

  const { data: activeBudgetData, isLoading: activeBudgetLoading } = useBudgetData(activeBudgetId);

  const refreshMonthlyExpenses = useCallback(async () => {
    if (!user || !activeBudgetId) {
      setMonthlyExpenseTotal(null);
      return;
    }

    try {
      setMonthlyExpenseLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const { data, error } = await supabase
        .from("expense_entries")
        .select("amount, currency")
        .eq("user_id", user.id)
        .eq("budget_id", activeBudgetId)
        .gte("created_at", startOfMonth.toISOString())
        .lt("created_at", nextMonth.toISOString());

      if (error) {
        throw error;
      }

      const total = (data ?? []).reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
      setMonthlyExpenseTotal(total);
    } catch (error) {
      console.error("Failed to fetch monthly expenses", error);
      setMonthlyExpenseTotal(0);
    } finally {
      setMonthlyExpenseLoading(false);
    }
  }, [user, activeBudgetId]);

  useEffect(() => {
    refreshMonthlyExpenses();
  }, [refreshMonthlyExpenses, activeBudgetData?.budget?.base_currency]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("expense-entries-stream")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expense_entries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!activeBudgetId) return;
          const payloadBudgetId = (payload.new as { budget_id?: string | null } | null)?.budget_id ?? null;
          const previousBudgetId = (payload.old as { budget_id?: string | null } | null)?.budget_id ?? null;

          if (payloadBudgetId === activeBudgetId || previousBudgetId === activeBudgetId) {
            refreshMonthlyExpenses();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeBudgetId, refreshMonthlyExpenses]);

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const [lineItemsRes, incomesRes] = await Promise.all([
          supabase
            .from("line_items")
            .select(
              "id,label,created_at,qty,unit_cost,currency,scenarios!inner(name,budgets!inner(id,title,user_id,base_currency))"
            )
            .eq("scenarios.budgets.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("income_sources")
            .select("id,label,created_at,amount_monthly,currency,budgets!inner(id,title,user_id)")
            .eq("budgets.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const lineEntries: ActivityEntry[] =
          lineItemsRes.data?.map((item: any) => {
            const scenario = item.scenarios;
            const budget = Array.isArray(scenario?.budgets) ? scenario?.budgets?.[0] : scenario?.budgets;
            const budgetTitle = budget?.title ?? "Budget";
            const scenarioName = scenario?.name ?? "";

            const currency = item.currency ?? budget?.base_currency ?? "USD";
            const qty = item.qty ?? 1;
            const unitCost = item.unit_cost ?? 0;

            return {
              id: item.id,
              type: "line_item" as const,
              createdAt: item.created_at,
              budgetTitle,
              scenarioName,
              label: item.label,
              amount: qty * unitCost,
              currency,
            };
          }) ?? [];

        const incomeEntries: ActivityEntry[] =
          incomesRes.data?.map((item: any) => {
            const budget = Array.isArray(item.budgets) ? item.budgets?.[0] : item.budgets;
            const currency = item.currency ?? budget?.base_currency ?? "USD";
            return {
              id: item.id,
              type: "income" as const,
              createdAt: item.created_at,
              budgetTitle: budget?.title ?? "Budget",
              label: item.label,
              amount: item.amount_monthly ?? null,
              currency,
            };
          }) ?? [];

        const combined = [...lineEntries, ...incomeEntries]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setActivityEntries(combined);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, [user]);

  const handleRetryDashboard = () => {
    setRetryDashboard(false);
    setBudgetsLoading(true);
    setLoading(true);
    checkUser();
  };

  const quickStats = useMemo(() => {
    if (!activeBudgetData) return null;
    const currency = activeBudgetData.budget.base_currency ?? "USD";
    const monthlyExpenses = monthlyExpenseTotal ?? 0;
    const monthlyIncomeRaw = activeBudgetData.incomes.reduce((sum, income) => sum + (income.amount_monthly ?? 0), 0);
    const incomeBuckets: Record<string, number> = activeBudgetData.incomes.reduce((acc, income) => {
      const key = (income.type as string) ?? "other";
      acc[key] = (acc[key] ?? 0) + (income.amount_monthly ?? 0);
      return acc;
    }, {} as Record<string, number>);
    const breakdownOrder = ["prize", "sponsors", "gifts", "other"];
    const incomeBreakdown = breakdownOrder
      .map((key) => ({
        key,
        label: INCOME_CATEGORY_LABELS[key] ?? key,
        amount: incomeBuckets[key] ?? 0,
        formatted: formatCurrency(incomeBuckets[key] ?? 0, currency),
      }))
      .filter((entry) => entry.amount > 0);
    const netMonthly = monthlyIncomeRaw - monthlyExpenses;

    return {
      currency,
      monthlyExpenses,
      monthlyExpensesFormatted: formatCurrency(monthlyExpenses, currency),
      monthlyIncome: monthlyIncomeRaw,
      monthlyIncomeFormatted: formatCurrency(monthlyIncomeRaw, currency),
      netMonthly,
      netMonthlyFormatted: formatCurrency(netMonthly, currency),
      incomeBreakdown,
    };
  }, [activeBudgetData, monthlyExpenseTotal]);

  const isProUser = Boolean(profile?.role === "pro" || activeBudgetData?.budget.is_active);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Player's Budget</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open sheets"
                onClick={() => activeBudgetId && navigate("/sheets") }
              >
                <LayoutDashboard className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open editor"
                onClick={() => activeBudgetId && navigate("/editor") }
              >
                <TableProperties className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open settings"
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-12">
        {!isProUser && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-primary shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">Player's Budget Pro</p>
              <p className="text-sm text-primary/80">
                Unlock instant PDF exports, sponsor-ready decks, and integrations for your coaching staff.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" onClick={() => navigate("/onboarding?upgrade=true")}>Upgrade to Pro</Button>
              <Button variant="outline" onClick={() => navigate("/settings")}>See benefits</Button>
            </div>
          </div>
        )}
        {retryDashboard && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>We couldn't refresh your dashboard data. Check your connection and try again.</span>
            <Button variant="outline" size="sm" onClick={handleRetryDashboard}>
              Retry now
            </Button>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {activeBudgetLoading ? (
            [...Array(4)].map((_, index) => (
              <Card key={index} className="p-6 shadow-card">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-6 w-32" />
                <Skeleton className="mt-6 h-3 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </Card>
            ))
          ) : (
            <>
              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Budget</p>
                    <p className="text-xl font-semibold">
                      {activeBudgetData?.budget.title ?? "Select a budget"}
                    </p>
                    <p className="text-xs text-muted-foreground">Season {activeBudgetData?.budget.season_year ?? "—"}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <ChartPie className="h-6 w-6" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-card">
                <p className="text-sm text-muted-foreground">Real-time spend (this month)</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {monthlyExpenseLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : quickStats?.monthlyExpensesFormatted ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Totals from your quick expense capture log.
                </p>
              </Card>
              <Card className="p-6 shadow-card">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Income snapshot</p>
                    <h3 className="text-xl font-semibold">{quickStats?.monthlyIncomeFormatted ?? "—"}</h3>
                    <p
                      className={`text-xs mt-1 ${
                        quickStats?.netMonthly !== undefined && quickStats.netMonthly < 0
                          ? "text-destructive"
                          : "text-emerald-600"
                      }`}
                    >
                      Net after expenses: {quickStats?.netMonthlyFormatted ?? "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {quickStats && quickStats.incomeBreakdown.length > 0 ? (
                      quickStats.incomeBreakdown.map((row) => (
                        <div key={row.key} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{row.label}</span>
                          <span className="font-medium text-foreground">{row.formatted}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Add income sources to see category totals here.
                      </p>
                    )}
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/editor">
                      Manage income
                      <Wallet className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Budgets</h2>
          <p className="text-muted-foreground">
            Manage your season budgets, edit scenarios, and export sheets.
          </p>
        </div>

        {budgetsLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-6 shadow-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-2xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
                <Plus className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Create Your First Budget</h3>
                <p className="text-muted-foreground mb-6">
                  Get started in 60 seconds. We'll guide you through setting up your first season budget.
                </p>
              </div>
              <Button size="lg" onClick={handleCreateBudget}>
                Start 60-Second Setup
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreateBudget}>
                <Plus className="w-4 h-4" />
                New Budget
              </Button>
            </div>

            <div className="grid gap-4">
              {budgets.map((budget) => (
                <Card
                  key={budget.id}
                  className={`p-6 shadow-card border-2 ${
                    budget.id === activeBudgetId ? "border-primary" : "border-transparent"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{budget.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Season {budget.season_year} • {budget.base_currency}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setActiveBudgetId(budget.id)}>
                        Set Active
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/budget/${budget.id}`}>Details</Link>
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/sheets")}>Sheets</Button>
                      <Button variant="outline" onClick={() => navigate("/editor")}>Editor</Button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Tax Country</div>
                      <div className="font-semibold">{budget.tax_country || "Not set"}</div>
                    </div>
                  </div>
                  {activeBudgetId === budget.id && activeBudgetData ? (
                    <div className="mt-6">
                      <ScenarioQuickView
                        budgetId={budget.id}
                        currency={activeBudgetData.budget.base_currency}
                        scenarios={activeBudgetData.scenarios}
                        lineItems={activeBudgetData.lineItems}
                      />
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <ActivityLog entries={activityEntries} loading={activityLoading} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
