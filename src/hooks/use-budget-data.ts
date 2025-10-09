import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BudgetRecord = Database["public"]["Tables"]["budgets"]["Row"];
export type ScenarioRecord = Database["public"]["Tables"]["scenarios"]["Row"];
export type LineItemRecord = Database["public"]["Tables"]["line_items"]["Row"];
export type IncomeRecord = Database["public"]["Tables"]["income_sources"]["Row"];
export type CategoryRecord = Database["public"]["Tables"]["line_item_categories"]["Row"];
export type LineItemInsert = Database["public"]["Tables"]["line_items"]["Insert"];
export type IncomeInsert = Database["public"]["Tables"]["income_sources"]["Insert"];
export type ExpenseRecord = Database["public"]["Tables"]["expense_entries"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expense_entries"]["Insert"];

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

async function createExpense(input: ExpenseInsert) {
  const payload = { ...input };
  const { data, error } = await supabase.from("expense_entries").insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function updateExpense(input: Partial<ExpenseRecord> & { id: string }) {
  const { id, ...values } = input;
  const { data, error } = await supabase
    .from("expense_entries")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteExpense(id: string) {
  const { error } = await supabase.from("expense_entries").delete().eq("id", id);
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

export function useExpenseCreator(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: async (_data, variables) => {
      const b = (variables as any).budget_id ?? budgetId;
      await queryClient.invalidateQueries({ queryKey: ["budget-data", b] });
    },
  });
}

export function useExpenseUpdater(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onMutate: async (newValues) => {
      await queryClient.cancelQueries({ queryKey: ["budget-data", budgetId] });
      const previousData = queryClient.getQueryData(["budget-data", budgetId]);

      queryClient.setQueryData(["budget-data", budgetId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          // reflect change in expense list if present
          // expenses are not part of budget-data by default; we still invalidate after
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

export function useExpenseRemover(budgetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["budget-data", budgetId] });
    },
  });
}

// Fetch expenses for a budget, optional month filter in YYYY-MM format
export async function fetchExpenses(budgetId?: string, month?: string | null) {
  if (!budgetId) return [];

  let query = supabase.from('expense_entries').select('*').eq('budget_id', budgetId).order('date', { ascending: false });

  if (month) {
    // month expected as YYYY-MM
    const start = `${month}-01`;
    const [y, m] = month.split('-').map((s) => Number(s));
    const next = new Date(y, m, 1);
    const nextMonth = next.toISOString().substring(0, 10);
    query = query.gte('date', start).lt('date', nextMonth);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function useExpenses(budgetId?: string, month?: string | null) {
  return useQuery({
    queryKey: ['expenses', budgetId, month],
    queryFn: () => fetchExpenses(budgetId, month),
    enabled: Boolean(budgetId),
  });
}
