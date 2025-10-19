import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BudgetEditor from "@/components/editor/BudgetEditor";
import BudgetSnapshots from "@/components/editor/BudgetSnapshots";
import IncomeManager from "@/components/editor/IncomeManager";
import ExpenseManager from "@/components/editor/ExpenseManager";
import LineItemImporter, { type ImportRow } from "@/components/editor/LineItemImporter";
import UpgradeLink from "@/components/UpgradeLink";
import {
  useBudgetData,
  useBudgetList,
  useIncomeCreator,
  useIncomeRemover,
  useIncomeUpdater,
  useLineItemCreator,
  useLineItemUpdater,
  useExpenseCreator,
  useExpenseUpdater,
  useExpenseRemover,
  useExpenses,
} from "@/hooks/use-budget-data";
import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import { ClipboardEdit, ArrowLeft, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useProGate from "@/hooks/useProGate";
import { getErrorMessage } from "@/lib/errors";
import type { LineItemInsert, LineItemRecord, ExpenseInsert, ExpenseRecord } from "@/hooks/use-budget-data";

type LineItemUpdatePayload = Partial<LineItemRecord> & { id: string };
type ExpenseUpdatePayload = Partial<ExpenseRecord> & { id: string };
type ExpenseManagerFormPayload = {
  date: string;
  category: string;
  label?: string | null;
  amount: number;
  currency: string;
  notes?: string | null;
};

const Editor = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>();
  const [retryUpdatePayload, setRetryUpdatePayload] = useState<LineItemUpdatePayload | null>(null);
  const [retryCreatePayload, setRetryCreatePayload] = useState<LineItemInsert | null>(null);
  const [shouldRetryUpdate, setShouldRetryUpdate] = useState(false);
  const [shouldRetryCreate, setShouldRetryCreate] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data: budgets } = useBudgetList(userId ?? undefined);

  useEffect(() => {
    if (!selectedBudgetId && budgets && budgets.length) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  const { data: budgetData, isLoading } = useBudgetData(selectedBudgetId);
  const { isPro } = useProGate();
  const updater = useLineItemUpdater(selectedBudgetId);
  const creator = useLineItemCreator(selectedBudgetId);
  const incomeCreator = useIncomeCreator(selectedBudgetId);
  const incomeUpdater = useIncomeUpdater(selectedBudgetId);
  const incomeRemover = useIncomeRemover(selectedBudgetId);
  const expenseCreator = useExpenseCreator(selectedBudgetId);
  const expenseUpdater = useExpenseUpdater(selectedBudgetId);
  const expenseRemover = useExpenseRemover(selectedBudgetId);
  const { data: expensesData, refetch: refetchExpenses } = useExpenses(selectedBudgetId);
  const expenses: ExpenseRecord[] = expensesData ?? [];

  const isCreatingLineItems = creator.status === "pending";
  const incomeSubmitting =
    incomeCreator.status === "pending" || incomeUpdater.status === "pending" || incomeRemover.status === "pending";
  const expenseSubmitting =
    expenseCreator.status === "pending" || expenseUpdater.status === "pending" || expenseRemover.status === "pending";

  const scenarioTotals = useMemo(() => {
    if (!budgetData) return [];
    return calculateScenarioTotals(budgetData.scenarios, budgetData.lineItems);
  }, [budgetData]);

  const monthlySpend = scenarioTotals.reduce((sum, entry) => sum + entry.total, 0);
  const isProUser = isPro;

  const handleUpdate = (payload: LineItemUpdatePayload) => {
    setRetryUpdatePayload(payload);
    setShouldRetryUpdate(false);
    updater.mutate(payload, {
      onError: (error) => {
        console.error("Budget line update failed", error);
        setShouldRetryUpdate(true);
        const description = `${getErrorMessage(error, "Unable to save changes")}. Check your internet connection and try again.`;
        toast({
          title: "Update failed",
          description,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        setShouldRetryUpdate(false);
      },
    });
  };

  const handleCreate = (payload: LineItemInsert) => {
    setRetryCreatePayload(payload);
    setShouldRetryCreate(false);
    creator.mutate(payload, {
      onError: (error) => {
        console.error("Line item creation failed", error);
        setShouldRetryCreate(true);
        const description = `${getErrorMessage(error, "Unable to add line item")}. Check your internet connection and try again.`;
        toast({
          title: "Could not add line item",
          description,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        setShouldRetryCreate(false);
        toast({
          title: "Line item added",
          description: "Your budget totals have been refreshed.",
        });
      },
    });
  };

  const retryLastUpdate = () => {
    if (retryUpdatePayload) {
      handleUpdate(retryUpdatePayload);
    }
  };

  const retryLastCreate = () => {
    if (retryCreatePayload) {
      handleCreate(retryCreatePayload);
    }
  };

  const handleBulkImport = async (rows: ImportRow[]) => {
    const defaultCategoryId = budgetData?.categories[0]?.id;
    if (!defaultCategoryId) {
      toast({
        title: "Import unavailable",
        description: "Please create at least one category before importing line items.",
        variant: "destructive",
      });
      return;
    }
    for (const row of rows) {
      await handleCreate({
        scenario_id: row.scenarioId,
        category_id: defaultCategoryId,
        amount: row.qty * row.unitCost,
        label: row.label,
        qty: row.qty,
        unit_cost: row.unitCost,
        unit: row.unit ?? "flat_monthly",
        currency: budgetData?.budget.base_currency ?? "USD",
        created_at: new Date().toISOString(),
      });
    }
  };

  const handleIncomeCreate = async (payload: {
    label: string;
    amount: number;
    currency: string;
    type: string;
  }) => {
    if (!budgetData) return;
    
    // Ensure amount is numeric and valid
    const amountNum = Number(payload.amount ?? 0);
    if (amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      await incomeCreator.mutateAsync({
        budget_id: budgetData.budget.id,
        label: payload.label,
        amount: amountNum, // Required field in income_sources table
        amount_monthly: amountNum, // Optional field for backwards compatibility
        currency: payload.currency,
        type: payload.type,
        created_at: new Date().toISOString(),
      });
      toast({
        title: "Income added",
        description: "Monthly totals updated.",
      });
    } catch (error: unknown) {
      console.error("Failed to add income", error);
      toast({
        title: "Could not add income",
        description: getErrorMessage(error, "Check your connection and try again."),
        variant: "destructive",
      });
    }
  };

  const handleIncomeUpdate = async (
    id: string,
    payload: { label: string; amount: number; currency: string; type: string },
  ) => {
    // Ensure amount is numeric and valid
    const amountNum = Number(payload.amount ?? 0);
    if (amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      await incomeUpdater.mutateAsync({
        id,
        label: payload.label,
        amount: amountNum, // Required field in income_sources table
        amount_monthly: amountNum, // Optional field for backwards compatibility
        currency: payload.currency,
        type: payload.type,
      });
      toast({
        title: "Income updated",
        description: "Recurring totals refreshed.",
      });
    } catch (error: unknown) {
      console.error("Failed to update income", error);
      toast({
        title: "Could not update income",
        description: getErrorMessage(error, "We restored your previous values."),
        variant: "destructive",
      });
    }
  };

  const handleIncomeDelete = async (id: string) => {
    try {
      await incomeRemover.mutateAsync(id);
      toast({
        title: "Income removed",
        description: "The source no longer counts toward funding.",
      });
    } catch (error: unknown) {
      console.error("Failed to delete income", error);
      toast({
        title: "Could not delete income",
        description: getErrorMessage(error, "Try again in a moment."),
        variant: "destructive",
      });
    }
  };

  const ensureAuthenticated = () => {
    if (!userId) {
      toast({
        title: "Session expired",
        description: "Sign in again to manage expenses.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const resolveBudgetId = () => budgetData?.budget.id ?? selectedBudgetId ?? null;

  const handleExpenseCreate = async (payload: ExpenseManagerFormPayload) => {
    if (!ensureAuthenticated()) return;
    const budgetId = resolveBudgetId();
    if (!budgetId) {
      toast({
        title: "Select a budget",
        description: "Pick a budget before logging expenses.",
        variant: "destructive",
      });
      return;
    }

    const insert: ExpenseInsert = {
      user_id: userId!,
      budget_id: budgetId,
      category: payload.category,
      amount: payload.amount,
      currency: payload.currency,
      date: payload.date,
      label: payload.label ?? null,
      notes: payload.notes ?? null,
      created_at: new Date().toISOString(),
    };

    try {
      await expenseCreator.mutateAsync(insert);
      toast({ title: "Expense added", description: "Saved to your expense log." });
      await refetchExpenses();
    } catch (error: unknown) {
      console.error("Failed to add expense", error);
      toast({
        title: "Could not add expense",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleExpenseUpdate = async (id: string, payload: Partial<ExpenseManagerFormPayload>) => {
    const updatePayload: ExpenseUpdatePayload = {
      id,
      ...payload,
    };

    try {
      await expenseUpdater.mutateAsync(updatePayload);
      toast({ title: "Expense updated" });
      await refetchExpenses();
    } catch (error: unknown) {
      console.error("Failed to update expense", error);
      toast({
        title: "Could not update expense",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleExpenseDelete = async (id: string) => {
    try {
      await expenseRemover.mutateAsync(id);
      toast({ title: "Expense deleted" });
      await refetchExpenses();
    } catch (error: unknown) {
      console.error("Failed to delete expense", error);
      toast({
        title: "Could not delete expense",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const openParam = searchParams.get("open");
  const openExpenseDialog = openParam === "expenses";

  // clear the query param after reading so it doesn't re-open on navigation
  useEffect(() => {
    if (openExpenseDialog) {
      const next = new URLSearchParams(searchParams);
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
  }, [openExpenseDialog, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <ClipboardEdit className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Budget Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Spreadsheet-style editing with immediate totals.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button variant="outline" onClick={() => navigate("/sheets")}>View Sheets</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
        {!isProUser && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-primary shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">Upgrade for sponsor-ready exports</p>
              <p className="text-sm text-primary/80">
                Pro unlocks PDF exports, integrations, and priority assistance for your team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" asChild>
                <UpgradeLink asChild interval="monthly" source="editor_banner">
                  <span>Upgrade to Pro</span>
                </UpgradeLink>
              </Button>
              <Button variant="outline" onClick={() => navigate("/pricing")}>Compare plans</Button>
            </div>
          </div>
        )}
        {shouldRetryUpdate && (
          <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>We couldn't save your last edit. Check your connection and retry.</span>
            <Button variant="outline" size="sm" onClick={retryLastUpdate}>
              Retry save
            </Button>
          </div>
        )}
        {shouldRetryCreate && (
          <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>We couldn't add the line item. Check your connection and retry.</span>
            <Button variant="outline" size="sm" onClick={retryLastCreate}>
              Retry add
            </Button>
          </div>
        )}
        <Card className="p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <Button variant="link" className="p-0" onClick={() => navigate("/dashboard")}>Back to budgets</Button>
            </div>
            {budgetData && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4 text-primary" />
                <span>
                  Combined monthly spend: {formatCurrency(monthlySpend, budgetData.budget.base_currency ?? "USD")}
                </span>
              </div>
            )}
          </div>
        </Card>

        {isLoading || !budgetData ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <BudgetEditor
            scenarios={budgetData.scenarios}
            lineItems={budgetData.lineItems}
            categories={budgetData.categories}
            currency={budgetData.budget.base_currency}
            onUpdateLineItem={handleUpdate}
            onAddLineItem={handleCreate}
            isSaving={isCreatingLineItems}
          />
        )}
        {!isLoading && budgetData && (
          <LineItemImporter
            scenarios={budgetData.scenarios}
            isProUser={isProUser}
            onImport={handleBulkImport}
          />
        )}
        {!isLoading && budgetData && (
          <IncomeManager
            incomes={budgetData.incomes}
            currency={budgetData.budget.base_currency}
            onCreate={handleIncomeCreate}
            onUpdate={handleIncomeUpdate}
            onDelete={handleIncomeDelete}
            isSubmitting={incomeSubmitting}
          />
        )}
        {!isLoading && budgetData && (
          <ExpenseManager
            expenses={expenses}
            openNow={openExpenseDialog}
            currency={budgetData.budget.base_currency}
            onCreate={handleExpenseCreate}
            onUpdate={handleExpenseUpdate}
            onDelete={handleExpenseDelete}
            isSubmitting={expenseSubmitting}
          />
        )}
        {!isLoading && budgetData && (
          <BudgetSnapshots
            budget={budgetData.budget}
            scenarios={budgetData.scenarios}
            lineItems={budgetData.lineItems}
            incomes={budgetData.incomes}
            currency={budgetData.budget.base_currency}
            isProUser={isProUser}
          />
        )}
      </main>
    </div>
  );
};

export default Editor;
