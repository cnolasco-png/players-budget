import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type BudgetRecord = Tables<"budgets">;
export type ScenarioRecord = Tables<"scenarios">;
export type LineItemRecord = Tables<"line_items">;
export type IncomeRecord = Tables<"income_sources">;
export type CategoryRecord = Tables<"line_item_categories">;
export type LineItemInsert = TablesInsert<"line_items">;
export type IncomeInsert = TablesInsert<"income_sources">;

export interface BudgetData {
  budget: BudgetRecord;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
  categories: CategoryRecord[];
}

async function fetchBudgetList(userId?: string) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function fetchBudgetData(budgetId?: string): Promise<BudgetData | null> {
  if (!budgetId) return null;

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", budgetId)
    .single();

  if (budgetError) throw budgetError;
  if (!budget) return null;

  const { data: scenarios, error: scenarioError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("budget_id", budgetId)
    .order("created_at", { ascending: true });

  if (scenarioError) throw scenarioError;

  const scenarioIds = (scenarios ?? []).map((scenario) => scenario.id);
  let lineItems: LineItemRecord[] = [];

  if (scenarioIds.length) {
    const { data, error } = await supabase
      .from("line_items")
      .select("*")
      .in("scenario_id", scenarioIds)
      .order("created_at", { ascending: true });

    if (error) throw error;
    lineItems = data ?? [];
  }

  const { data: incomes, error: incomesError } = await supabase
    .from("income_sources")
    .select("*")
    .eq("budget_id", budgetId)
    .order("created_at", { ascending: true });

  if (incomesError) throw incomesError;

  const { data: categories, error: categoriesError } = await supabase
    .from("line_item_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (categoriesError) throw categoriesError;

  return {
    budget,
    scenarios: scenarios ?? [],
    lineItems,
    incomes: incomes ?? [],
    categories: categories ?? [],
  };
}

async function updateLineItem(input: Partial<LineItemRecord> & { id: string }) {
  const { id, ...values } = input;
  const { data, error } = await supabase
    .from("line_items")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createLineItem(input: LineItemInsert) {
  const payload = { ...input };
  const { data, error } = await supabase.from("line_items").insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function createIncome(input: IncomeInsert) {
  const payload = { ...input };
  const { data, error } = await supabase.from("income_sources").insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function updateIncome(input: Partial<IncomeRecord> & { id: string }) {
  const { id, ...values } = input;
  const { data, error } = await supabase
    .from("income_sources")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteIncome(id: string) {
  const { error } = await supabase.from("income_sources").delete().eq("id", id);
  if (error) throw error;
}

export function useBudgetList(userId?: string) {
  return useQuery({
    queryKey: ["budgets", userId],
    queryFn: () => fetchBudgetList(userId),
    enabled: Boolean(userId),
  });
}

export function useBudgetData(budgetId?: string) {
  return useQuery({
    queryKey: ["budget-data", budgetId],
    queryFn: () => fetchBudgetData(budgetId),
    enabled: Boolean(budgetId),
  });
}

export function useLineItemUpdater(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLineItem,
    onMutate: async (newValues) => {
      await queryClient.cancelQueries({ queryKey: ["budget-data", budgetId] });
      const previousData = queryClient.getQueryData(["budget-data", budgetId]);

      queryClient.setQueryData(["budget-data", budgetId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          lineItems: old.lineItems.map((item: LineItemRecord) =>
            item.id === newValues.id ? { ...item, ...newValues } : item,
          ),
        };
      });

      return { previousData };
    },
    onError: (_error, _values, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["budget-data", budgetId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
    },
  });
}

export function useLineItemCreator(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLineItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
    },
  });
}

export function useIncomeCreator(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncome,
    onSuccess: async (_data, variables) => {
      const budgetKey = variables.budget_id;
      await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetKey] });
    },
  });
}

export function useIncomeUpdater(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncome,
    onMutate: async (newValues) => {
      await queryClient.cancelQueries({ queryKey: ["budget-data", budgetId] });
      const previousData = queryClient.getQueryData(["budget-data", budgetId]);

      queryClient.setQueryData(["budget-data", budgetId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          incomes: old.incomes.map((income: IncomeRecord) =>
            income.id === newValues.id ? { ...income, ...newValues } : income,
          ),
        };
      });

      return { previousData };
    },
    onError: (_error, _values, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["budget-data", budgetId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
    },
  });
}

export function useIncomeRemover(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncome,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
    },
  });
}
