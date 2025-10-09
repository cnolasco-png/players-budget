import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseRecord } from "@/hooks/use-budget-data";
import { formatCurrency } from "@/lib/budgetCalculations";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "Travel", label: "Travel" },
  { value: "Lodging", label: "Lodging" },
  { value: "Meals", label: "Meals" },
  { value: "Ground Transport", label: "Ground Transport" },
  { value: "Entry Fees", label: "Entry Fees" },
  { value: "Coaching", label: "Coaching" },
  { value: "Stringing", label: "Stringing" },
  { value: "Physio/Gym", label: "Physio/Gym" },
  { value: "Insurance/Visas", label: "Insurance/Visas" },
  { value: "Equipment", label: "Equipment" },
  { value: "Laundry", label: "Laundry" },
  { value: "Misc", label: "Misc" },
] as const;

type ExpenseCategory = (typeof CATEGORY_OPTIONS)[number]["value"];

type ExpenseFormState = {
  id?: string;
  date: string;
  category: ExpenseCategory;
  label: string;
  amount: string;
  currency: string;
  notes: string;
};

type ExpenseManagerProps = {
  expenses: ExpenseRecord[];
  currency?: string | null;
  openNow?: boolean;
  onCreate: (payload: {
    date: string;
    category: ExpenseCategory;
    label?: string | null;
    amount: number;
    currency: string;
    notes?: string | null;
  }) => Promise<void>;
  onUpdate: (id: string, payload: {
    date?: string;
    category?: ExpenseCategory;
    label?: string | null;
    amount?: number;
    currency?: string;
    notes?: string | null;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
};

const EMPTY_FORM: ExpenseFormState = {
  date: new Date().toISOString().substring(0, 10),
  category: "Misc",
  label: "",
  amount: "",
  currency: "USD",
  notes: "",
};

const ExpenseManager = ({
  expenses,
  currency = "USD",
  onCreate,
  onUpdate,
  onDelete,
  isSubmitting,
  openNow = false,
}: ExpenseManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<ExpenseFormState>({ ...EMPTY_FORM, currency });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const accumulator: Record<ExpenseCategory, { entries: ExpenseRecord[]; total: number }> = {
      Travel: { entries: [], total: 0 },
      Lodging: { entries: [], total: 0 },
      Meals: { entries: [], total: 0 },
      "Ground Transport": { entries: [], total: 0 },
      "Entry Fees": { entries: [], total: 0 },
      Coaching: { entries: [], total: 0 },
      Stringing: { entries: [], total: 0 },
      "Physio/Gym": { entries: [], total: 0 },
      "Insurance/Visas": { entries: [], total: 0 },
      Equipment: { entries: [], total: 0 },
      Laundry: { entries: [], total: 0 },
      Misc: { entries: [], total: 0 },
    };

    for (const e of expenses) {
      const key = (e.category as ExpenseCategory) ?? "Misc";
      if (!accumulator[key]) continue;
      accumulator[key].entries.push(e);
      accumulator[key].total += Number(e.amount ?? 0);
    }

    return accumulator;
  }, [expenses]);

  const totalMonth = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0), [expenses]);

  const isEditing = Boolean(formState.id);

  const resetForm = () => setFormState({ ...EMPTY_FORM, currency: currency ?? "USD" });

  const openDialog = (expense?: ExpenseRecord) => {
    if (expense) {
      setFormState({
        id: expense.id,
        date: expense.date ?? new Date().toISOString().substring(0, 10),
        category: ((expense.category as ExpenseCategory) ?? "Misc") as ExpenseCategory,
        label: expense.label ?? "",
        amount: expense.amount?.toString() ?? "",
        currency: expense.currency ?? currency ?? "USD",
        notes: expense.notes ?? "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleChange = (field: keyof ExpenseFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formState.date || !formState.amount) return;
    const amount = Number.parseFloat(formState.amount.replace(/,/g, ""));
    if (Number.isNaN(amount)) return;

    const payload = {
      date: formState.date,
      category: formState.category,
      label: formState.label.trim() || null,
      amount,
      currency: formState.currency || currency || "USD",
      notes: formState.notes?.trim() || null,
    };

    try {
      if (isEditing && formState.id) {
        await onUpdate(formState.id, payload);
      } else {
        await onCreate(payload);
      }
      closeDialog();
    } catch (err) {
      console.error("Failed to submit expense", err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Failed to delete expense", err);
    } finally {
      setDeletingId(null);
    }
  };

  const months = Array.from(new Set(expenses.map((e) => e.date?.substring(0, 7) ?? new Date().toISOString().substring(0, 7))));

  // allow parent to open the dialog programmatically
  useEffect(() => {
    if (openNow) {
      setIsDialogOpen(true);
    }
  }, [openNow]);

  return (
    <Card className="space-y-6 p-6 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">Expense tracker</h4>
          <p className="text-sm text-muted-foreground">Track real expenses against budgets and scenarios.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="font-semibold">{formatCurrency(totalMonth, currency ?? "USD")}</span>
          </div>
          <div className="flex items-center gap-2">
            <select className="rounded-md border px-2 py-1 text-sm" value={filterMonth ?? ""} onChange={(e) => setFilterMonth(e.target.value || null)}>
              <option value="">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Button onClick={() => openDialog()} disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />Add expense
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_OPTIONS.map((category) => {
          const bucket = grouped[category.value];
          return (
            <Card key={category.value} className="border border-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{bucket.entries.length} item{bucket.entries.length === 1 ? "" : "s"}</p>
                </div>
                <div className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">{formatCurrency(bucket.total, currency ?? "USD")}</div>
              </div>

              <div className="mt-3 space-y-2">
                {bucket.entries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No expenses.</p>
                ) : (
                  bucket.entries.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-start justify-between rounded-md border border-muted-foreground/10 bg-card px-3 py-2 text-sm"
                    >
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 font-medium">{expense.label || expense.category}</p>
                        <p className="text-xs text-muted-foreground">{expense.date} • {formatCurrency(Number(expense.amount ?? 0), expense.currency ?? currency ?? "USD")}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openDialog(expense)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                        >
                          {deletingId === expense.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit expense" : "Add expense"}</DialogTitle>
            <DialogDescription>Expenses are attached to the current budget and scenario (if selected).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input id="expense-date" type="date" value={formState.date} onChange={(e) => handleChange("date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formState.category} onValueChange={(v: ExpenseCategory) => handleChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-label">Label</Label>
              <Input id="expense-label" value={formState.label} onChange={(e) => handleChange("label", e.target.value)} placeholder="e.g. Flight to Melbourne" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input id="expense-amount" inputMode="decimal" value={formState.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="120.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-currency">Currency</Label>
                <Input id="expense-currency" value={formState.currency} onChange={(e) => handleChange("currency", e.target.value.toUpperCase())} maxLength={3} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-notes">Notes</Label>
              <Input id="expense-notes" value={formState.notes} onChange={(e) => handleChange("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isEditing ? "Save changes" : "Add expense"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpenseManager;
