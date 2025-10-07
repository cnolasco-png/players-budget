import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Receipt, Wallet } from "lucide-react";

export type ActivityEntry = {
  id: string;
  type: "line_item" | "income";
  createdAt: string;
  budgetTitle: string;
  scenarioName?: string | null;
  label: string;
  amount?: number | null;
  currency?: string | null;
};

interface ActivityLogProps {
  entries: ActivityEntry[];
  loading: boolean;
}

const ActivityLog = ({ entries, loading }: ActivityLogProps) => {
  return (
    <Card className="p-6 shadow-card border-border/60">
      <h3 className="text-lg font-semibold mb-4">Recent activity</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent changes yet. Make edits in the editor to see them here.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {entry.type === "line_item" ? <Receipt className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {entry.type === "line_item" ? "Line item" : "Income source"}: {entry.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.budgetTitle}
                  {entry.scenarioName ? ` • ${entry.scenarioName}` : ""}
                  {entry.amount ?
                    ` • ${Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: entry.currency || "USD",
                    }).format(entry.amount)}`
                    : ""}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ActivityLog;
