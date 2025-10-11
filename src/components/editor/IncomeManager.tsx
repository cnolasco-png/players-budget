import { useMemo, useState } from "react";
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
import type { IncomeRecord } from "@/hooks/use-budget-data";
import { formatCurrency } from "@/lib/budgetCalculations";
import { Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "prize", label: "Prize money" },
  { value: "sponsors", label: "Sponsors" },
  { value: "gifts", label: "Gifts" },
  { value: "other", label: "Other" },
] as const;

type IncomeCategory = (typeof CATEGORY_OPTIONS)[number]["value"];

type IncomeFormState = {
  id?: string;
  label: string;
  amount: string;
  currency: string;
  type: IncomeCategory;
};

type IncomeManagerProps = {
  incomes: IncomeRecord[];
  currency?: string | null;
  onCreate: (payload: { label: string; amount: number; currency: string; type: IncomeCategory }) => Promise<void>;
  onUpdate: (id: string, payload: { label: string; amount: number; currency: string; type: IncomeCategory }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
};

const EMPTY_FORM: IncomeFormState = {
  label: "",
  amount: "",
  currency: "USD",
  type: "prize",
};

const IncomeManager = ({
  incomes,
  currency = "USD",
  onCreate,
  onUpdate,
  onDelete,
  isSubmitting,
}: IncomeManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<IncomeFormState>({ ...EMPTY_FORM, currency });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const accumulator: Record<IncomeCategory, { entries: IncomeRecord[]; total: number }> = {
      prize: { entries: [], total: 0 },
      sponsors: { entries: [], total: 0 },
      gifts: { entries: [], total: 0 },
      other: { entries: [], total: 0 },
    };

    for (const income of incomes) {
      const rawType = (income.type as IncomeCategory) ?? "other";
      const key = CATEGORY_OPTIONS.some((option) => option.value === rawType) ? rawType : "other";
      accumulator[key].entries.push(income);
      accumulator[key].total += income.amount_monthly ?? 0;
    }

    return accumulator;
  }, [incomes]);

  const totalMonthly = useMemo(
    () => incomes.reduce((sum, entry) => sum + (entry.amount_monthly ?? 0), 0),
    [incomes],
  );

  const isEditing = Boolean(formState.id);
  
  const isFormValid = useMemo(() => {
    const amount = Number.parseFloat(formState.amount.replace(/,/g, ""));
    return formState.label.trim() && formState.amount.trim() && !Number.isNaN(amount) && amount > 0;
  }, [formState.label, formState.amount]);

  const resetForm = () => setFormState({ ...EMPTY_FORM, currency: currency ?? "USD" });

  const openDialog = (income?: IncomeRecord) => {
    if (income) {
      setFormState({
        id: income.id,
        label: income.label ?? "",
        amount: income.amount_monthly?.toString() ?? "",
        currency: income.currency ?? currency ?? "USD",
        type: ((income.type as IncomeCategory) ?? "other") as IncomeCategory,
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

  const handleChange = (field: keyof IncomeFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formState.label.trim() || !formState.amount.trim()) {
      return;
    }

    const amount = Number.parseFloat(formState.amount.replace(/,/g, ""));
    if (Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const payload = {
      label: formState.label.trim(),
      amount,
      currency: formState.currency.trim() || currency || "USD",
      type: formState.type,
    };

    try {
      if (isEditing && formState.id) {
        await onUpdate(formState.id, payload);
      } else {
        await onCreate(payload);
      }
      closeDialog();
    } catch (error) {
      console.error("Income manager submit failed", error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete income", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="space-y-6 p-6 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">Income tracker</h4>
          <p className="text-sm text-muted-foreground">
            Allocate monthly income by category so funding goals stay accurate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="font-semibold">{formatCurrency(totalMonthly, currency ?? "USD")}</span> / month
          </div>
          <Button onClick={() => openDialog()} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />Add income
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_OPTIONS.map((category) => {
          const bucket = grouped[category.value];
          return (
            <Card key={category.value} className="border border-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{bucket.entries.length} source{bucket.entries.length === 1 ? "" : "s"}</p>
                </div>
                <div className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">
                  {formatCurrency(bucket.total, currency ?? "USD")}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {bucket.entries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No entries yet.</p>
                ) : (
                  bucket.entries.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-start justify-between rounded-md border border-muted-foreground/10 bg-card px-3 py-2 text-sm"
                    >
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 font-medium">
                          <Wallet className="h-3.5 w-3.5 text-primary" />
                          {income.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(income.amount_monthly ?? 0, income.currency ?? currency ?? "USD")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openDialog(income)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDelete(income.id)}
                          disabled={deletingId === income.id}
                        >
                          {deletingId === income.id ? (
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
            <DialogTitle>{isEditing ? "Edit income source" : "Add income source"}</DialogTitle>
            <DialogDescription>Monthly totals refresh instantly across dashboards and reports.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="income-label">Label</Label>
              <Input
                id="income-label"
                value={formState.label}
                onChange={(event) => handleChange("label", event.target.value)}
                placeholder="e.g. Australian Open prize money"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="income-amount">Monthly amount</Label>
                <Input
                  id="income-amount"
                  inputMode="decimal"
                  value={formState.amount}
                  onChange={(event) => handleChange("amount", event.target.value)}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-currency">Currency</Label>
                <Input
                  id="income-currency"
                  value={formState.currency}
                  onChange={(event) => handleChange("currency", event.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formState.type} onValueChange={(value: IncomeCategory) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Add income"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default IncomeManager;
