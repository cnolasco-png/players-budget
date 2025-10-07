import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import type {
  ScenarioRecord,
  LineItemRecord,
  IncomeRecord,
  BudgetRecord,
} from "@/hooks/use-budget-data";
import {
  SnapshotTotalsEntry,
  useBudgetSnapshots,
  type BudgetSnapshotRecord,
} from "@/hooks/use-budget-snapshots";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, History, Loader2, RefreshCcw } from "lucide-react";

type BudgetSnapshotsProps = {
  budget: BudgetRecord;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
  currency?: string | null;
  isProUser: boolean;
  onUpgrade?: () => void;
};

const parseScenarioTotals = (raw: unknown): SnapshotTotalsEntry[] => {
  if (!raw || typeof raw !== "object") return [];
  if (!Array.isArray(raw)) return [];
  return (raw as SnapshotTotalsEntry[]).map((entry) => ({
    scenarioId: entry.scenarioId,
    name: entry.name,
    total: entry.total ?? 0,
  }));
};

const formatTimestamp = (value: string | null) => {
  if (!value) return "Unknown";
  try {
    const date = new Date(value);
    return date.toLocaleString();
  } catch {
    return value;
  }
};

const BudgetSnapshots = ({
  budget,
  scenarios,
  lineItems,
  incomes,
  currency = "USD",
  isProUser,
  onUpgrade,
}: BudgetSnapshotsProps) => {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<string | null>(null);
  const [restoringSnapshotId, setRestoringSnapshotId] = useState<string | null>(null);

  const budgetIdForSnapshots = isProUser ? budget.id : undefined;
  const {
    snapshots,
    isLoading,
    error,
    createSnapshot,
    isCreatingSnapshot,
    deleteSnapshot,
    isDeletingSnapshot,
    restoreSnapshot,
    isRestoringSnapshot,
  } = useBudgetSnapshots(budgetIdForSnapshots);

  const currentScenarioTotals = useMemo(
    () => calculateScenarioTotals(scenarios, lineItems),
    [scenarios, lineItems],
  );

  const currentSpend = useMemo(
    () => currentScenarioTotals.reduce((sum, entry) => sum + entry.total, 0),
    [currentScenarioTotals],
  );

  const currentIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + (income.amount_monthly ?? 0), 0),
    [incomes],
  );

  const lastMonthSnapshot = useMemo(() => {
    if (!snapshots.length) return null;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const inLastMonth = snapshots.find((snapshot) => {
      if (!snapshot.created_at) return false;
      const created = new Date(snapshot.created_at);
      return created >= startOfLastMonth && created < startOfCurrentMonth;
    });

    if (inLastMonth) return inLastMonth;

    const older = snapshots.find((snapshot) => {
      if (!snapshot.created_at) return false;
      return new Date(snapshot.created_at) < startOfCurrentMonth;
    });

    return older ?? snapshots[snapshots.length - 1] ?? null;
  }, [snapshots]);

  const lastMonthSnapshotId = lastMonthSnapshot?.id;

  useEffect(() => {
    if (!snapshots.length) {
      if (selectedSnapshotId) {
        setSelectedSnapshotId(null);
      }
      return;
    }

    if (selectedSnapshotId && snapshots.some((snapshot) => snapshot.id === selectedSnapshotId)) {
      return;
    }

    if (lastMonthSnapshotId) {
      setSelectedSnapshotId(lastMonthSnapshotId);
      return;
    }

    setSelectedSnapshotId(snapshots[0]?.id ?? null);
  }, [snapshots, selectedSnapshotId, lastMonthSnapshotId]);

  const selectedSnapshot = useMemo(
    () => snapshots.find((entry) => entry.id === selectedSnapshotId) ?? null,
    [selectedSnapshotId, snapshots],
  );

  const comparisonRows = useMemo(() => {
    if (!selectedSnapshot) return [];
    const snapshotTotals = parseScenarioTotals(selectedSnapshot.scenario_totals);
    const currentTotalsMap = new Map(
      currentScenarioTotals.map((entry) => [entry.scenario.id, entry]),
    );

    const scenarioIds = new Set([
      ...snapshotTotals.map((entry) => entry.scenarioId),
      ...currentScenarioTotals.map((entry) => entry.scenario.id),
    ]);

    return Array.from(scenarioIds).map((scenarioId) => {
      const snapshotEntry = snapshotTotals.find((entry) => entry.scenarioId === scenarioId);
      const currentEntry = currentTotalsMap.get(scenarioId);
      const name = currentEntry?.scenario.name ?? snapshotEntry?.name ?? "Scenario";
      const currentTotal = currentEntry?.total ?? 0;
      const previousTotal = snapshotEntry?.total ?? 0;
      const delta = currentTotal - previousTotal;
      return { scenarioId, name, currentTotal, previousTotal, delta };
    });
  }, [selectedSnapshot, currentScenarioTotals]);

  const lastMonthComparison = useMemo(() => {
    if (!lastMonthSnapshot) return null;
    const totals = parseScenarioTotals(lastMonthSnapshot.scenario_totals);
    const map = new Map(currentScenarioTotals.map((entry) => [entry.scenario.id, entry]));
    const spendDelta = currentSpend - (lastMonthSnapshot.spend_total ?? 0);
    const incomeDelta = currentIncome - (lastMonthSnapshot.income_total ?? 0);

    const scenarioDiff = totals.map((entry) => {
      const currentEntry = map.get(entry.scenarioId);
      const currentTotal = currentEntry?.total ?? 0;
      return {
        name: currentEntry?.scenario.name ?? entry.name,
        delta: currentTotal - entry.total,
      };
    });

    return {
      spendDelta,
      incomeDelta,
      createdAt: lastMonthSnapshot.created_at,
      scenarioDiff,
    };
  }, [lastMonthSnapshot, currentScenarioTotals, currentIncome, currentSpend]);

  const handleCreateSnapshot = async () => {
    try {
      await createSnapshot({
        budget,
        scenarios,
        lineItems,
        incomes,
        note,
      });
      setNote("");
      toast({
        title: "Snapshot saved",
        description: "Your budget history has been updated.",
      });
    } catch (error) {
      console.error("Failed to create snapshot", error);
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({
        title: "Could not save snapshot",
        description: `${message}. Check your connection and try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSnapshot = async (snapshot: BudgetSnapshotRecord) => {
    setDeletingSnapshotId(snapshot.id);
    try {
      await deleteSnapshot({ snapshotId: snapshot.id });
      setSelectedSnapshotId((current) => (current === snapshot.id ? null : current));
      toast({
        title: "Snapshot removed",
        description: "This version is no longer stored in history.",
      });
    } catch (error) {
      console.error("Failed to delete snapshot", error);
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({
        title: "Could not delete snapshot",
        description: `${message}. Check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setDeletingSnapshotId(null);
    }
  };

  const handleRestoreSnapshot = async (snapshot: BudgetSnapshotRecord) => {
    setRestoringSnapshotId(snapshot.id);
    try {
      await restoreSnapshot({
        snapshot,
        currentBudget: budget,
        currentScenarios: scenarios,
      });
      setSelectedSnapshotId(snapshot.id);
      toast({
        title: "Budget restored",
        description: "We rolled your budget back to this snapshot.",
      });
    } catch (error) {
      console.error("Failed to restore snapshot", error);
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({
        title: "Restore failed",
        description: `${message}. Your budget stayed unchanged.`,
        variant: "destructive",
      });
    } finally {
      setRestoringSnapshotId(null);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">Historical versions & auditing</h4>
          <p className="text-sm text-muted-foreground">
            Snapshot budgets over time, compare against last month, and restore sponsor-ready numbers in one click.
          </p>
        </div>
        {!isProUser && (
          <Button variant="gold" onClick={onUpgrade}>
            Unlock history
          </Button>
        )}
      </div>

      {!isProUser ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Historical auditing is part of Player&apos;s Budget Pro. Upgrade to store monthly versions, prove your tracking history,
          and instantly recover from accidental edits.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-muted p-4">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Last month vs current</p>
                  <p className="text-xs text-muted-foreground">Automatic comparison against your stored history.</p>
                </div>
              </div>
              {lastMonthComparison ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Total spend change</span>
                    <span
                      className={
                        lastMonthComparison.spendDelta > 0
                          ? "text-destructive"
                          : lastMonthComparison.spendDelta < 0
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }
                    >
                      {lastMonthComparison.spendDelta > 0 ? "+" : ""}
                      {formatCurrency(lastMonthComparison.spendDelta, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Net income change</span>
                    <span
                      className={
                        lastMonthComparison.incomeDelta < 0
                          ? "text-destructive"
                          : lastMonthComparison.incomeDelta > 0
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }
                    >
                      {lastMonthComparison.incomeDelta > 0 ? "+" : ""}
                      {formatCurrency(lastMonthComparison.incomeDelta, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Snapshot captured {lastMonthComparison.createdAt ? formatDistanceToNow(new Date(lastMonthComparison.createdAt), {
                      addSuffix: true,
                    }) : "Recently"}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Save a snapshot to see how your plan is trending month over month.
                </p>
              )}
            </Card>

            <Card className="border border-muted p-4">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Create new snapshot</p>
                  <p className="text-xs text-muted-foreground">Capture your current plan for audit logs or sponsor reports.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="snapshot-note">
                    Snapshot note (optional)
                  </label>
                  <Input
                    id="snapshot-note"
                    placeholder="e.g. Post-Wimbledon adjustments"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
                <Button onClick={handleCreateSnapshot} disabled={isCreatingSnapshot}>
                  {isCreatingSnapshot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save snapshot
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-destructive">Unable to load existing snapshots right now.</p>
              )}
            </Card>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your snapshot history…</p>
          ) : snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No history yet. Save a snapshot after major edits or at month end to build an audit trail.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
              <div className="space-y-3">
                {snapshots.map((snapshot) => {
                  const isSelected = snapshot.id === selectedSnapshotId;
                  const spendTotal = snapshot.spend_total ?? parseScenarioTotals(snapshot.scenario_totals).reduce((sum, entry) => sum + entry.total, 0);
                  const createdLabel = snapshot.created_at
                    ? formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true })
                    : "Unknown";

                  return (
                    <Card
                      key={snapshot.id}
                      className={`border ${isSelected ? "border-primary bg-primary/5" : "border-muted"} p-4 transition`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <button
                            type="button"
                            className="text-left text-sm font-semibold hover:underline"
                            onClick={() => setSelectedSnapshotId(snapshot.id)}
                          >
                            {snapshot.note ?? "Untitled snapshot"}
                          </button>
                          <p className="text-xs text-muted-foreground">Saved {formatTimestamp(snapshot.created_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            Total spend: {formatCurrency(spendTotal, currency)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreSnapshot(snapshot)}
                            disabled={isRestoringSnapshot || restoringSnapshotId === snapshot.id}
                          >
                            {isRestoringSnapshot && restoringSnapshotId === snapshot.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="mr-2 h-4 w-4" />
                            )}
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSnapshot(snapshot)}
                            disabled={isDeletingSnapshot || deletingSnapshotId === snapshot.id}
                          >
                            {isDeletingSnapshot && deletingSnapshotId === snapshot.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {selectedSnapshot ? (
                <Card className="border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        Comparing to {selectedSnapshot.note ?? "snapshot"} ({formatTimestamp(selectedSnapshot.created_at)})
                      </p>
                      <p className="text-xs text-primary/80">
                        Current spend {formatCurrency(currentSpend, currency)} vs {formatCurrency(selectedSnapshot.spend_total ?? 0, currency)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedSnapshotId(null)}>
                      Clear
                    </Button>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    {comparisonRows.map((row) => (
                      <div key={row.scenarioId} className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <span>{row.name}</span>
                        <span className={row.delta > 0 ? "text-destructive" : row.delta < 0 ? "text-emerald-600" : "text-muted-foreground"}>
                          {row.delta > 0 ? "+" : ""}
                          {formatCurrency(row.delta, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="border border-muted p-5 text-sm text-muted-foreground">
                  Select a snapshot to see detailed scenario-level changes.
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default BudgetSnapshots;
