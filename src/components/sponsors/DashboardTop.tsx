import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Prospect, ProspectStage, SponsorTask } from "@/hooks/useSponsorsData";

const SEGMENTS = [
  "Café/Restaurant",
  "Physio/Chiro/Gym",
  "Food & Drink",
  "Retail/Sport",
  "Local Service",
  "Health/Recovery",
  "Education/Club",
];

type PipelineCounts = Record<ProspectStage, number>;

type DashboardTopProps = {
  packCompletion: { done: number; total: number; percent: number };
  checklist: { label: string; done: boolean }[];
  meetings: { total: number; next7: number };
  upcomingActivations: number;
  leadMetrics: { qr: number; redemptions: number; signups: number };
  pipelineCounts: PipelineCounts;
  tasks: SponsorTask[];
  onCompleteTask: (id: string) => void;
  onSelectSegment: (segment: string) => void;
  activeSegment: string | null;
  prospects: Prospect[];
};

function formatDate(input: string) {
  const date = new Date(input + "T00:00:00");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getTodayTasks(tasks: SponsorTask[]) {
  const today = new Date().toISOString().slice(0, 10);
  return tasks
    .filter((task) => !task.done && task.dueDate === today)
    .slice(0, 3);
}

const PIPELINE_ORDER: ProspectStage[] = ["Lead", "Contacted", "Meeting", "Proposal", "Won", "Lost"];

export function DashboardTop({
  packCompletion,
  checklist,
  meetings,
  upcomingActivations,
  leadMetrics,
  pipelineCounts,
  tasks,
  onCompleteTask,
  onSelectSegment,
  activeSegment,
  prospects,
}: DashboardTopProps) {
  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks]);
  const topProspects = useMemo(
    () =>
      prospects
        .filter((p) => p.stage !== "Lost")
        .sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())
        .slice(0, 3),
    [prospects],
  );

  const redemptionTotal = leadMetrics.qr + leadMetrics.redemptions + leadMetrics.signups;

  return (
    <section className="space-y-5">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Sponsor pack progress
              </p>
              <h2 className="text-2xl font-semibold">
                {packCompletion.percent}% ready &mdash; {packCompletion.done}/{packCompletion.total} assets locked in
              </h2>
            </div>
            <div className="w-full lg:w-64">
              <Progress value={packCompletion.percent} className="h-3" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/5 border-none shadow-none">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm uppercase text-muted-foreground tracking-wide">Meetings booked</p>
                <div className="text-2xl font-semibold">{meetings.next7}</div>
                <p className="text-xs text-muted-foreground">{meetings.total} total scheduled</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-none shadow-none">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm uppercase text-emerald-600 tracking-wide">Upcoming activations</p>
                <div className="text-2xl font-semibold text-emerald-700">{upcomingActivations}</div>
                <p className="text-xs text-emerald-700/70">Events on the calendar</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-none shadow-none">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm uppercase text-amber-600 tracking-wide">Redemptions / leads</p>
                <div className="text-2xl font-semibold text-amber-700">{redemptionTotal}</div>
                <p className="text-xs text-amber-700/70">
                  QR scans {leadMetrics.qr} · Codes {leadMetrics.redemptions} · Signups {leadMetrics.signups}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted border-none shadow-none">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm uppercase text-muted-foreground tracking-wide">Top prospects</p>
                <div className="flex flex-wrap gap-2">
                  {topProspects.map((prospect) => (
                    <Badge key={prospect.id} variant="outline" className="text-xs">
                      {prospect.business} · {prospect.stage}
                    </Badge>
                  ))}
                  {topProspects.length === 0 && <span className="text-xs text-muted-foreground">No active deals</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <Card className="shadow-none border-dashed">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Pipeline snapshot
                </p>
                <div className="flex flex-wrap gap-3">
                  {PIPELINE_ORDER.map((stage) => (
                    <span
                      key={stage}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-sm",
                        pipelineCounts[stage] ? "border-primary/40 text-primary" : "border-muted-foreground/30",
                      )}
                    >
                      {stage}
                      <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {pipelineCounts[stage] ?? 0}
                      </span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-dashed">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Today&apos;s actions
                </p>
                {todayTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks due today. Line up your next outreach touch.</p>
                ) : (
                  todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onCompleteTask(task.id)}>
                        Mark done
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sponsor pack checklist
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {checklist.map((item) => (
                  <label
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                      item.done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-muted-foreground/20",
                    )}
                  >
                    <input type="checkbox" checked={item.done} readOnly className="h-4 w-4 rounded border-primary" />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Segment shortcuts
              </p>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((segment) => (
                  <Button
                    key={segment}
                    variant={activeSegment === segment ? "default" : "outline"}
                    onClick={() => onSelectSegment(segment)}
                    className="text-sm"
                  >
                    {segment}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default DashboardTop;
