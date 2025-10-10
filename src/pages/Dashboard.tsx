import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBudgetData } from "@/hooks/use-budget-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, LogOut, Plus, Settings, Plane, Bed, Utensils, Car, 
  Trophy, Users, Zap, Lock, Camera, FileText, Target, DollarSign, 
  Clock, AlertTriangle, Calendar, MapPin, LayoutDashboard, 
  TableProperties, ChartPie, Loader2, Wallet
} from "lucide-react";
import { formatCurrency } from "@/lib/budgetCalculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { LineChart, Line, Legend } from "recharts";
import ScenarioQuickView from "@/components/dashboard/ScenarioQuickView";
import ActivityLog from "@/components/dashboard/ActivityLog";
import { getEffectiveTaxPct, planMonthlyCost, sumIncomeMTD, forecastToYearEnd, applyContingency } from "@/utils/finance";

// Type definitions
interface ActivityEntry {
  id: string;
  type: "line_item" | "income";
  createdAt: string;
  budgetTitle: string;
  scenarioName?: string | null;
  label: string;
  amount?: number | null;
  currency?: string | null;
}

interface ForecastRow {
  month: string;
  plannedIncome: number;
  plannedCost: number;
  net: number;
}

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
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [plannedMonthlyCost, setPlannedMonthlyCost] = useState<number | null>(null);
  const [plannedLoading, setPlannedLoading] = useState(false);
  const [forecastRows, setForecastRows] = useState<ForecastRow[]>([]);
  // Sandbox knobs (not persisted until Apply)
  const [sandboxNightsPerTournament, setSandboxNightsPerTournament] = useState<number | null>(null);
  const [sandboxAirfarePerLeg, setSandboxAirfarePerLeg] = useState<number | null>(null);
  const [sandboxMealsPerDay, setSandboxMealsPerDay] = useState<number | null>(null);
  const [sandboxRestringsPerWeek, setSandboxRestringsPerWeek] = useState<number | null>(null);
  const [tempPlannedCost, setTempPlannedCost] = useState<number | null>(null);
  const sandboxRef = useRef<HTMLDivElement | null>(null);
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
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

  // persist selected scenario per budget in localStorage
  const SCENARIO_KEY = (budgetId?: string) => `players-budget:selectedScenario:${budgetId ?? 'global'}`;

  const updateSelectedScenario = (id: string | null) => {
    setSelectedScenarioId(id);
    try {
      if (!activeBudgetId) return;
      const key = SCENARIO_KEY(activeBudgetId);
      if (id) {
        localStorage.setItem(key, id);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // ignore localStorage errors (e.g., private mode)
      console.debug("localStorage error persisting scenario", e);
    }
  };

  // when an active budget loads, restore last selected scenario for that budget if present
  useEffect(() => {
    if (!activeBudgetId || !activeBudgetData?.scenarios?.length) return;
    try {
      const key = SCENARIO_KEY(activeBudgetId);
      const stored = localStorage.getItem(key);
      if (stored && activeBudgetData.scenarios.some((s: any) => s.id === stored)) {
        setSelectedScenarioId(stored);
        return;
      }
    } catch (e) {
      console.debug("localStorage error reading scenario", e);
    }

    // fallback: use existing selection or default to first scenario
    if (!selectedScenarioId) {
      updateSelectedScenario(activeBudgetData.scenarios[0].id);
    }
  }, [activeBudgetId, activeBudgetData]);

  // load planned monthly cost and forecast whenever active budget or scenario changes
  useEffect(() => {
    let mounted = true;
    const loadPlan = async () => {
      if (!activeBudgetId || !selectedScenarioId) {
        setPlannedMonthlyCost(null);
        setForecastRows([]);
        return;
      }
      try {
        setPlannedLoading(true);
        // derive tax pct: prefer effective tax lookup, fallback to budget.tax_pct
        const budgetCountry = activeBudgetData?.budget?.tax_country ?? profile?.country ?? 'US';
        // try to map profile.player_level to one of expected levels
        const pl = (profile?.player_level || '').toString();
        let level: 'ITF' | 'Challenger' | 'ATP/WTA' = 'ATP/WTA';
        if (/ITF/i.test(pl)) level = 'ITF';
        else if (/Challenger/i.test(pl)) level = 'Challenger';
        try {
          const taxPct = getEffectiveTaxPct(budgetCountry);
          // TODO: Replace with actual data - these are stub implementations
          const plan = planMonthlyCost(1000); // placeholder monthly cost
          const incomeToDate = sumIncomeMTD([], new Date()); // empty entries for now
          const yearEndForecast = forecastToYearEnd([], [], new Date().getMonth()); // empty arrays for now
          
          if (!mounted) return;
          setPlannedMonthlyCost(plan);
          // Note: forecast now returns number, but component expects ForecastRow[]
          // This will need to be updated when actual forecast data structure is implemented
          setForecastRows([]);
        } catch (e) {
          // fallback behavior: use budget tax_pct
          const taxPct = activeBudgetData?.budget?.tax_pct ?? 0;
          const plan = planMonthlyCost(1000); // placeholder
          
          if (!mounted) return;
          setPlannedMonthlyCost(plan);
          setForecastRows([]);
        }
       } catch (err) {
         console.error("Failed to load plan/forecast", err);
         toast({ title: "Error loading projections", description: "Could not load plan or forecast data.", variant: "destructive" });
         setPlannedMonthlyCost(null);
         setForecastRows([]);
       } finally {
         if (mounted) setPlannedLoading(false);
       }
     };
     loadPlan();
     return () => {
       mounted = false;
     };
  }, [activeBudgetId, selectedScenarioId, activeBudgetData?.budget?.tax_pct]);

  // Compute a local plan cost from activeBudgetData.lineItems applying sandbox overrides
  const computeLocalPlan = () => {
    if (!activeBudgetData || !selectedScenarioId) return null;
    const items = (activeBudgetData.lineItems ?? []).filter((li: any) => li.scenario_id === selectedScenarioId);
    const base = items.reduce((sum: number, it: any) => {
      let qty = Number(it.qty ?? 1);
      let unit = Number(it.unit_cost ?? 0);

      const label = String(it.label ?? '').toLowerCase();

      if (sandboxNightsPerTournament !== null && label.includes('night')) {
        qty = sandboxNightsPerTournament;
      }
      if (sandboxAirfarePerLeg !== null && (label.includes('air') || label.includes('flight') || label.includes('airfare'))) {
        unit = sandboxAirfarePerLeg;
      }
      if (sandboxMealsPerDay !== null && label.includes('meal')) {
        // assume unit_cost represents cost per meal
        unit = sandboxMealsPerDay;
      }
      if (sandboxRestringsPerWeek !== null && label.includes('restring')) {
        unit = sandboxRestringsPerWeek;
      }

      return sum + qty * unit;
    }, 0);

    const contingency = activeBudgetData?.budget?.contingency_pct ?? 0;
    return applyContingency(base, contingency);
  };

  // update temp plan when knobs or active data change
  useEffect(() => {
    const temp = computeLocalPlan();
    setTempPlannedCost(temp);
  }, [sandboxNightsPerTournament, sandboxAirfarePerLeg, sandboxMealsPerDay, sandboxRestringsPerWeek, activeBudgetData, selectedScenarioId]);

  // Apply sandbox overrides to matching line_items for the selected scenario
  const applySandboxToScenario = async () => {
    if (!selectedScenarioId || !activeBudgetData || !activeBudgetId) return;
    try {
      toast({ title: 'Applying sandbox values', description: 'Saving changes to scenario...' });
      const items = (activeBudgetData.lineItems ?? []).filter((li: any) => li.scenario_id === selectedScenarioId);
      let anyUpdated = false;
      for (const it of items) {
        const label = String(it.label ?? '').toLowerCase();
        const update: any = {};
        let shouldUpdate = false;
        if (sandboxNightsPerTournament !== null && /night/i.test(label)) {
          update.qty = sandboxNightsPerTournament;
          shouldUpdate = true;
        }
        if (sandboxAirfarePerLeg !== null && /air|flight|airfare/i.test(label)) {
          update.unit_cost = sandboxAirfarePerLeg;
          shouldUpdate = true;
        }
        if (sandboxMealsPerDay !== null && /meal/i.test(label)) {
          update.unit_cost = sandboxMealsPerDay;
          shouldUpdate = true;
        }
        if (sandboxRestringsPerWeek !== null && /restring/i.test(label)) {
          update.unit_cost = sandboxRestringsPerWeek;
          shouldUpdate = true;
        }
        if (!shouldUpdate) continue;
        const { error } = await supabase.from('line_items').update(update).eq('id', it.id);
        if (error) {
          console.error('Failed updating line_item', it.id, error);
        } else {
          anyUpdated = true;
        }
      }
      if (!anyUpdated) {
        toast({ title: 'Nothing to apply', description: 'No matching line items found for these knobs.' });
        return;
      }
      toast({ title: 'Scenario updated', description: 'Sandbox values saved to scenario line items.' });
      // refresh by reloading fetched plan/forecast
      const plan = planMonthlyCost(1000); // placeholder
      setPlannedMonthlyCost(plan);
      const fc = forecastToYearEnd([], [], new Date().getMonth()); // placeholder
      setForecastRows([]); // placeholder empty array
    } catch (e) {
      console.error('Failed to apply sandbox', e);
      toast({ title: 'Save failed', description: 'Could not save sandbox to scenario.', variant: 'destructive' });
    }
  };

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

      const baseCurrency = activeBudgetData?.budget?.base_currency ?? 'USD';
      const rates = fxRates; // may be null

      const total = (data ?? []).reduce((sum, entry) => {
        const amt = Number(entry.amount ?? 0);
        const from = (entry.currency ?? baseCurrency) as string;
        if (!rates || !rates[from]) {
          // no FX available for this currency - count raw amount (best-effort)
          if (from !== baseCurrency) {
            console.debug(`Missing FX rate for ${from} -> ${baseCurrency}, using raw amount`);
          }
          return sum + amt;
        }
        // exchangerate.host returned rates where rates[target] = target per 1 base
        // to convert from 'from' currency to base: baseAmount = amt / rates[from]
        const converted = rates[from] ? amt / rates[from] : amt;
        return sum + converted;
      }, 0);
      setMonthlyExpenseTotal(total);
    } catch (error) {
      console.error("Failed to fetch monthly expenses", error);
      setMonthlyExpenseTotal(0);
    } finally {
      setMonthlyExpenseLoading(false);
    }
  }, [user, activeBudgetId]);
  
  // fetch FX rates for active budget base currency (optional)
  useEffect(() => {
    let mounted = true;
    const loadFx = async () => {
      const base = activeBudgetData?.budget?.base_currency;
      if (!base) return setFxRates(null);
      try {
        setFxLoading(true);
        const res = await fetch(`/api/fx-rates?base=${encodeURIComponent(base)}`);
        if (!mounted) return;
        if (!res.ok) throw new Error('Failed to fetch FX rates');
        const json = await res.json();
        setFxRates(json.rates ?? null);
      } catch (e) {
        console.debug('FX rates fetch failed', e);
        setFxRates(null);
      } finally {
        if (mounted) setFxLoading(false);
      }
    };
    loadFx();
    return () => {
      mounted = false;
    };
  }, [activeBudgetData?.budget?.base_currency]);

  // Recharts tooltip content — formats values using budget currency
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const currency = activeBudgetData?.budget?.base_currency ?? quickStats?.currency ?? 'USD';
    return (
      <div className="bg-card p-2 rounded shadow">
        <div className="text-sm font-medium mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="text-sm">
            <span className="font-semibold">{p.name}:</span> {formatCurrency(p.value ?? 0, currency)}
          </div>
        ))}
      </div>
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg ring-2 ring-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Court Dashboard</h1>
                <p className="text-base text-muted-foreground">
                  Welcome back, {profile?.name || "Champion"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open sheets"
                onClick={() => activeBudgetId && navigate("/sheets") }
                className="shadow-sm hover:bg-emerald-50"
              >
                <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open editor"
                onClick={() => activeBudgetId && navigate("/editor") }
                className="shadow-sm hover:bg-emerald-50"
              >
                <TableProperties className="w-5 h-5 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Add expense"
                onClick={() => activeBudgetId && navigate("/editor") }
                className="shadow-sm hover:bg-emerald-50"
              >
                <Plus className="w-5 h-5 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open settings"
                onClick={() => navigate("/settings")}
                className="shadow-sm hover:bg-emerald-50"
              >
                <Settings className="w-5 h-5 text-emerald-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={handleSignOut}
                className="shadow-sm hover:bg-emerald-50"
              >
                <LogOut className="w-5 h-5 text-emerald-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-10">
        {!isProUser && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border-2 border-emerald-300/50 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-6 text-emerald-800 shadow-lg md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Pro Court Membership</p>
              <p className="text-emerald-700/90 font-medium">
                Unlock tournament analytics, sponsor presentations, and premium coaching integrations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" onClick={() => navigate("/onboarding?upgrade=true")} className="shadow-md font-medium">Upgrade to Pro Court</Button>
              <Button variant="outline" onClick={() => navigate("/settings")} className="border-emerald-200 hover:bg-emerald-50 shadow-sm">See Benefits</Button>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {activeBudgetLoading ? (
            [...Array(4)].map((_, index) => (
              <Card key={index} className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-6 w-32" />
                <Skeleton className="mt-6 h-3 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </Card>
            ))
          ) : (
            <>
              <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Season</p>
                    <p className="text-xl font-bold tracking-tight">
                      {activeBudgetData?.budget.title ?? "Select a budget"}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">Season {activeBudgetData?.budget.season_year ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 p-4 text-emerald-700 shadow-md">
                    <ChartPie className="h-7 w-7" />
                  </div>
                </div>
              </Card>
              <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Monthly Expenses</p>
                    <p className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                      {monthlyExpenseLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : quickStats?.monthlyExpensesFormatted ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Live expense tracking
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => activeBudgetId && navigate("/editor")} className="shadow-sm border-emerald-200 hover:bg-emerald-50" size="sm">
                    <Plus className="mr-2 h-4 w-4 text-emerald-600" />
                    Add Expense
                  </Button>
                </div>
              </Card>
              <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Tournament Earnings</p>
                    <h3 className="text-xl font-bold tracking-tight">{quickStats?.monthlyIncomeFormatted ?? "—"}</h3>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        quickStats?.netMonthly !== undefined && quickStats.netMonthly < 0
                          ? "text-destructive"
                          : "text-emerald-600"
                      }`}
                    >
                      Net performance: {quickStats?.netMonthlyFormatted ?? "—"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {quickStats && quickStats.incomeBreakdown.length > 0 ? (
                      quickStats.incomeBreakdown.map((row) => (
                        <div key={row.key} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium">{row.label}</span>
                          <span className="font-bold text-emerald-700">{row.formatted}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Set up income sources for detailed tracking
                      </p>
                    )}
                  </div>
                  <Button variant="outline" asChild className="shadow-sm border-emerald-200 hover:bg-emerald-50">
                    <Link to="/editor">
                      Manage Earnings
                      <Wallet className="ml-2 h-4 w-4 text-emerald-600" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Season Management</h2>
          <p className="text-emerald-100/90 text-lg">
            Control your tournament budgets, analyze scenarios, and export performance sheets
          </p>
        </div>

        {budgetsLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
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
          <Card className="p-16 text-center shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <div className="max-w-md mx-auto space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg ring-4 ring-emerald-500/20 flex items-center justify-center mx-auto">
                <Plus className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">Launch Your Court Season</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Professional tournament budget setup in under 60 seconds. Let's build your championship strategy.
                </p>
              </div>
              <Button size="lg" onClick={handleCreateBudget} className="h-12 px-8 shadow-lg font-medium">
                Start Championship Setup
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end mb-6">
              <Button onClick={handleCreateBudget} className="shadow-lg font-medium border-emerald-200 hover:bg-emerald-50">
                <Plus className="w-4 h-4 text-emerald-600" />
                New Season Budget
              </Button>
            </div>

            <div className="grid gap-6">
              {budgets.map((budget) => (
                <Card
                  key={budget.id}
                  className={`p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm ring-2 ${
                    budget.id === activeBudgetId ? "ring-emerald-400" : "ring-transparent"
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

        {/* KPI tiles + charts */}
        {activeBudgetData && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">MTD Expenses</p>
                <p className="text-2xl font-semibold">{monthlyExpenseLoading ? '…' : formatCurrency(monthlyExpenseTotal ?? 0, quickStats?.currency)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">MTD Income (net)</p>
                <p className="text-2xl font-semibold">{quickStats?.monthlyIncomeFormatted ?? '—'}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Variance vs Plan</p>
                <p className="text-2xl font-semibold">
                  {plannedLoading ? (
                    '…'
                  ) : (
                    formatCurrency(((quickStats?.netMonthly ?? 0) - (plannedMonthlyCost ?? 0)), quickStats?.currency)
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {plannedMonthlyCost !== null && !plannedLoading
                    ? `${Math.round(((quickStats?.netMonthly ?? 0) - (plannedMonthlyCost ?? 0)) / (plannedMonthlyCost || 1) * 100)}% vs plan`
                    : 'Plan not available'}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Watch</p>
                {(() => {
                  const variance = (quickStats?.netMonthly ?? 0) - (plannedMonthlyCost ?? 0);
                  // normalize against absolute planned value to give symmetric percent
                  const pct = plannedMonthlyCost ? variance / Math.abs(plannedMonthlyCost) : 0;

                  // semantic thresholds (tunable):
                  // <= -25% -> Critical, <= -10% -> At risk, within +/-10% -> On track,
                  // >10% -> Ahead, >25% -> Excellent
                  let label = 'On track';
                  let cls = 'text-muted-foreground';
                  let emoji = '🟡';

                  if (pct <= -0.25) {
                    label = 'Critical';
                    cls = 'text-destructive';
                    emoji = '🔴';
                  } else if (pct <= -0.10) {
                    label = 'At risk';
                    cls = 'text-amber-600';
                    emoji = '🟠';
                  } else if (pct <= 0.10) {
                    label = 'On track';
                    cls = 'text-muted-foreground';
                    emoji = '🟡';
                  } else if (pct <= 0.25) {
                    label = 'Ahead';
                    cls = 'text-emerald-600';
                    emoji = '🟢';
                  } else {
                    label = 'Excellent';
                    cls = 'text-teal-600';
                    emoji = '💚';
                  }

                  const pctLabel = `${pct >= 0 ? '+' : ''}${Math.round(pct * 100)}%`;

                  return (
                    <div>
                      <p className={`text-lg font-medium ${cls}`} title={`Variance ${pctLabel} vs plan`}>
                        {label} <span className="ml-2 text-sm">{emoji}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Variance {pctLabel} vs plan</p>
                    </div>
                  );
                })()}
              </Card>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Projections & Actuals</h3>
              <div className="flex items-center gap-2">
                {activeBudgetData.scenarios.map((s: any) => (
                  <button
                    key={s.id}
                    className={`rounded-md border px-3 py-1 text-sm ${plannedLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted'}`}
                    onClick={() => !plannedLoading && updateSelectedScenario(s.id)}
                    disabled={plannedLoading}
                    aria-pressed={selectedScenarioId === s.id}
                    title={selectedScenarioId === s.id ? 'Selected' : `Select ${s.name}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-4">
                <h4 className="text-sm text-muted-foreground">Monthly Actual vs Plan</h4>
                <div style={{ width: '100%', height: 220 }}>
                  {plannedLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-36 w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      {/* Single-month comparison: Actual expenses (from expense_entries) vs Plan (scenario) */}
                      <BarChart
                        data={[{ name: 'This month', actual: Number(monthlyExpenseTotal ?? 0), plan: Number((tempPlannedCost ?? plannedMonthlyCost) ?? 0) }]}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => formatCurrency(Number(val ?? 0), activeBudgetData?.budget?.base_currency ?? 'USD')} />
                        <Tooltip content={<ChartTooltip />} />
                        {/* Colors chosen for accessibility in light/dark */}
                        <Bar dataKey="actual" fill="#ef4444" name="Actual" />
                        <Bar dataKey="plan" fill="#3b82f6" name="Plan" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
 
              <Card className="p-4">
                <h4 className="text-sm text-muted-foreground">Forecast to Year End</h4>
                <div style={{ width: '100%', height: 220 }}>
                  {plannedLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-36 w-full" />
                    </div>
                  ) : forecastRows.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-sm text-muted-foreground">
                      <p>No forecast available.</p>
                      <p className="text-xs mt-1">Add scenarios or line items to generate a forecast.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      {/* Forecast lines: planned income, planned cost, and net (income - cost) */}
                      <LineChart
                        data={forecastRows.map((r) => ({
                          month: r.month,
                          plannedIncome: r.plannedIncome ?? 0,
                          plannedCost: Number((tempPlannedCost ?? r.plannedCost) ?? 0),
                          net: (r.plannedIncome ?? 0) - Number((tempPlannedCost ?? r.plannedCost) ?? 0),
                        }))}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(val) => formatCurrency(Number(val ?? 0), activeBudgetData?.budget?.base_currency ?? 'USD')} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="plannedIncome" stroke="#10b981" name="Planned Income" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="plannedCost" stroke="#ef4444" name="Planned Cost" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net (Income - Cost)" strokeDasharray="4 2" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>

            {/* Sandbox knobs */}
            {selectedScenarioId && (
              <div ref={sandboxRef}>
                <Card className="p-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold">Sandbox</h4>
                    <p className="text-xs text-muted-foreground">Try assumptions without saving</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Nights per tournament</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={14}
                          value={sandboxNightsPerTournament ?? (activeBudgetData?.lineItems?.find((li:any)=>li.scenario_id===selectedScenarioId && /night/i.test(li.label))?.qty ?? 3)}
                          onChange={(e) => setSandboxNightsPerTournament(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="w-16 text-right">{sandboxNightsPerTournament ?? '—'}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Airfare per leg</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={3000}
                          step={10}
                          value={sandboxAirfarePerLeg ?? (activeBudgetData?.lineItems?.find((li:any)=>li.scenario_id===selectedScenarioId && /air|flight|airfare/i.test(li.label))?.unit_cost ?? 400)}
                          onChange={(e) => setSandboxAirfarePerLeg(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="w-24 text-right">{formatCurrency(sandboxAirfarePerLeg ?? 0, quickStats?.currency)}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Meals / day (unit cost)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={200}
                          step={1}
                          value={sandboxMealsPerDay ?? (activeBudgetData?.lineItems?.find((li:any)=>li.scenario_id===selectedScenarioId && /meal/i.test(li.label))?.unit_cost ?? 20)}
                          onChange={(e) => setSandboxMealsPerDay(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="w-24 text-right">{formatCurrency(sandboxMealsPerDay ?? 0, quickStats?.currency)}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Restrings / week (unit cost)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={200}
                          step={1}
                          value={sandboxRestringsPerWeek ?? (activeBudgetData?.lineItems?.find((li:any)=>li.scenario_id===selectedScenarioId && /restring/i.test(li.label))?.unit_cost ?? 15)}
                          onChange={(e) => setSandboxRestringsPerWeek(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="w-24 text-right">{formatCurrency(sandboxRestringsPerWeek ?? 0, quickStats?.currency)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="gold" onClick={applySandboxToScenario}>Apply to Scenario</Button>
                    <Button variant="ghost" onClick={() => {
                      // reset sandbox to null (revert live overrides)
                      setSandboxNightsPerTournament(null);
                      setSandboxAirfarePerLeg(null);
                      setSandboxMealsPerDay(null);
                      setSandboxRestringsPerWeek(null);
                      setTempPlannedCost(null);
                    }}>Reset</Button>
                    <div className="text-sm text-muted-foreground ml-auto">Preview plan: <span className="font-medium">{formatCurrency(tempPlannedCost ?? plannedMonthlyCost ?? 0, quickStats?.currency)}</span></div>
                  </div>
                </Card>
              </div>
            )}
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
