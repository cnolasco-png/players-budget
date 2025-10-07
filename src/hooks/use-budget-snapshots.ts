import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type {
  BudgetRecord,
  ScenarioRecord,
  LineItemRecord,
  IncomeRecord,
} from "@/hooks/use-budget-data";
import { calculateScenarioTotals } from "@/lib/budgetCalculations";

export type BudgetSnapshotRecord = Tables<"budget_snapshots">;

export interface BudgetSnapshotPayload {
  budget: BudgetRecord;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
}

export type SnapshotTotalsEntry = {
  scenarioId: string;
  name: string;
  total: number;
};

interface CreateSnapshotInput {
  budget: BudgetRecord;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
  note?: string;
}

interface DeleteSnapshotInput {
  snapshotId: string;
}

interface RestoreSnapshotInput {
  snapshot: BudgetSnapshotRecord;
  currentBudget: BudgetRecord;
  currentScenarios: ScenarioRecord[];
}

const parseSnapshotPayload = (raw: unknown): BudgetSnapshotPayload => {
  if (!raw || typeof raw !== "object") {
    throw new Error("Snapshot is missing data");
  }
  const value = raw as Record<string, unknown>;
  if (!value.budget || !value.scenarios || !value.lineItems || !value.incomes) {
    throw new Error("Snapshot payload is incomplete");
  }
  return {
    budget: value.budget as BudgetRecord,
    scenarios: value.scenarios as ScenarioRecord[],
    lineItems: value.lineItems as LineItemRecord[],
    incomes: value.incomes as IncomeRecord[],
  };
};

async function fetchBudgetSnapshots(budgetId?: string) {
  if (!budgetId) return [];
  const { data, error } = await supabase
    .from("budget_snapshots")
    .select("*")
    .eq("budget_id", budgetId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function createBudgetSnapshot(input: CreateSnapshotInput) {
  const { budget, scenarios, lineItems, incomes, note } = input;
  const totals = calculateScenarioTotals(scenarios, lineItems);
  const scenarioTotals: SnapshotTotalsEntry[] = totals.map((entry) => ({
    scenarioId: entry.scenario.id,
    name: entry.scenario.name,
    total: entry.total,
  }));
  const spendTotal = scenarioTotals.reduce((sum, entry) => sum + entry.total, 0);
  const incomeTotal = incomes.reduce((sum, entry) => sum + (entry.amount_monthly ?? 0), 0);

  const payload: BudgetSnapshotPayload = {
    budget,
    scenarios,
    lineItems,
    incomes,
  };

  const { error } = await supabase.from("budget_snapshots").insert({
    budget_id: budget.id,
    user_id: budget.user_id,
    note: note?.trim() || null,
    snapshot_data: payload,
    scenario_totals: scenarioTotals,
    spend_total: spendTotal,
    income_total: incomeTotal,
  });

  if (error) throw error;
}

async function deleteBudgetSnapshot({ snapshotId }: DeleteSnapshotInput) {
  const { error } = await supabase.from("budget_snapshots").delete().eq("id", snapshotId);
  if (error) throw error;
}

async function restoreBudgetSnapshot({
  snapshot,
  currentBudget,
  currentScenarios,
}: RestoreSnapshotInput) {
  const parsed = parseSnapshotPayload(snapshot.snapshot_data);

  const snapshotBudget = parsed.budget;
  const snapshotScenarios = parsed.scenarios;
  const snapshotLineItems = parsed.lineItems;
  const snapshotIncomes = parsed.incomes;

  // Update budget level fields first
  const { error: budgetError } = await supabase
    .from("budgets")
    .update({
      title: snapshotBudget.title,
      season_year: snapshotBudget.season_year,
      base_currency: snapshotBudget.base_currency,
      tax_country: snapshotBudget.tax_country,
      tax_pct: snapshotBudget.tax_pct,
      contingency_pct: snapshotBudget.contingency_pct,
      target_monthly_funding: snapshotBudget.target_monthly_funding,
      is_active: currentBudget.is_active,
    })
    .eq("id", currentBudget.id);

  if (budgetError) throw budgetError;

  const snapshotScenarioIds = snapshotScenarios.map((scenario) => scenario.id);
  const currentScenarioIds = currentScenarios.map((scenario) => scenario.id);
  const allScenarioIds = Array.from(new Set([...snapshotScenarioIds, ...currentScenarioIds]));

  if (allScenarioIds.length) {
    const { error: deleteLineItemsError } = await supabase
      .from("line_items")
      .delete()
      .in("scenario_id", allScenarioIds);

    if (deleteLineItemsError) throw deleteLineItemsError;
  }

  // Replace scenarios
  const { error: deleteScenariosError } = await supabase
    .from("scenarios")
    .delete()
    .eq("budget_id", currentBudget.id);

  if (deleteScenariosError) throw deleteScenariosError;

  if (snapshotScenarios.length) {
    const { error: insertScenariosError } = await supabase.from("scenarios").insert(
      snapshotScenarios.map((scenario) => ({
        ...scenario,
        budget_id: currentBudget.id,
      })),
    );

    if (insertScenariosError) throw insertScenariosError;
  }

  if (snapshotLineItems.length) {
    const { error: insertLineItemsError } = await supabase.from("line_items").insert(
      snapshotLineItems.map((item) => ({
        ...item,
        scenario_id: item.scenario_id,
      })),
    );

    if (insertLineItemsError) throw insertLineItemsError;
  }

  const { error: deleteIncomesError } = await supabase
    .from("income_sources")
    .delete()
    .eq("budget_id", currentBudget.id);

  if (deleteIncomesError) throw deleteIncomesError;

  if (snapshotIncomes.length) {
    const { error: insertIncomesError } = await supabase.from("income_sources").insert(
      snapshotIncomes.map((income) => ({
        ...income,
        budget_id: currentBudget.id,
      })),
    );

    if (insertIncomesError) throw insertIncomesError;
  }

  const { error: updateSnapshotError } = await supabase
    .from("budget_snapshots")
    .update({ restored_at: new Date().toISOString() })
    .eq("id", snapshot.id);

  if (updateSnapshotError) throw updateSnapshotError;
}

export function useBudgetSnapshots(budgetId?: string) {
  const queryClient = useQueryClient();

  const snapshotsQuery = useQuery({
    queryKey: ["budget-snapshots", budgetId],
    queryFn: () => fetchBudgetSnapshots(budgetId),
    enabled: Boolean(budgetId),
  });

  const createSnapshotMutation = useMutation({
    mutationFn: createBudgetSnapshot,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["budget-snapshots", variables.budget.id] });
      await queryClient.invalidateQueries({ queryKey: ["budget-data", variables.budget.id] });
    },
  });

  const deleteSnapshotMutation = useMutation({
    mutationFn: deleteBudgetSnapshot,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["budget-snapshots", budgetId] });
      if (variables.snapshotId) {
        await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
      }
    },
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: restoreBudgetSnapshot,
    onSuccess: async (_data, variables) => {
      const budgetKey = variables.currentBudget.id;
      await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetKey] });
      await queryClient.invalidateQueries({ queryKey: ["budget-snapshots", budgetKey] });
    },
  });

  const getSnapshotById = useCallback(
    (snapshotId: string) => snapshotsQuery.data?.find((entry) => entry.id === snapshotId),
    [snapshotsQuery.data],
  );

  return {
    snapshots: snapshotsQuery.data ?? [],
    isLoading: snapshotsQuery.isLoading,
    error: snapshotsQuery.error,
    refetch: snapshotsQuery.refetch,
    createSnapshot: createSnapshotMutation.mutateAsync,
    isCreatingSnapshot: createSnapshotMutation.status === "pending",
    deleteSnapshot: deleteSnapshotMutation.mutateAsync,
    isDeletingSnapshot: deleteSnapshotMutation.status === "pending",
    restoreSnapshot: restoreSnapshotMutation.mutateAsync,
    isRestoringSnapshot: restoreSnapshotMutation.status === "pending",
    getSnapshotById,
  };
}
