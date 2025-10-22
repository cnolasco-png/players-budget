import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UpgradeLink from "@/components/UpgradeLink";
import useProGate from "@/hooks/useProGate";
import type { ReadinessAnswers, ReadinessReport } from "@/hooks/useSponsorsData";
import { cn } from "@/lib/utils";

const SEGMENTS = ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport", "Education/Club", "Health/Recovery", "Financial"];

const WEIGHTS = {
  credibility: 20,
  proKit: 20,
  localMarketability: 20,
  activationCapacity: 15,
  sponsorFit: 15,
  compliance: 10,
} as const;

const DEFAULT_ANSWERS: ReadinessAnswers = {
  resultsProof: true,
  testimonialCount: 2,
  clubTouchpoints: 3,
  activationHours: 3,
  alignedSegments: ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport"],
  complianceAck: true,
};

const getBand = (score: number) => {
  if (score >= 80) return { label: "Game ready", color: "text-emerald-600 bg-emerald-100" };
  if (score >= 60) return { label: "Close to launch", color: "text-amber-600 bg-amber-100" };
  return { label: "Needs prep", color: "text-red-600 bg-red-100" };
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const computeReadiness = (answers: ReadinessAnswers) => {
  const credibility =
    (answers.resultsProof ? 1 : 0) * (WEIGHTS.credibility * 0.6) +
    Math.min(answers.testimonialCount, 2) / 2 * (WEIGHTS.credibility * 0.4);

  const proKit =
    Math.min(answers.testimonialCount, 2) / 2 * (WEIGHTS.proKit * 0.4) +
    (answers.activationHours >= 3 ? WEIGHTS.proKit * 0.6 : WEIGHTS.proKit * 0.3);

  const localMarketability = Math.min(answers.clubTouchpoints, 3) / 3 * WEIGHTS.localMarketability;
  const activationCapacity = Math.min(answers.activationHours, 4) / 4 * WEIGHTS.activationCapacity;
  const sponsorFit = Math.min(answers.alignedSegments.length, 3) / 3 * WEIGHTS.sponsorFit;
  const compliance = answers.complianceAck ? WEIGHTS.compliance : 0;

  const score = Math.round(credibility + proKit + localMarketability + activationCapacity + sponsorFit + compliance);

  const gaps: string[] = [];
  const nextSteps: string[] = [];

  if (!answers.resultsProof) {
    gaps.push("Upload results or ranking proof.");
    nextSteps.push("Add your latest results PDF to the Sponsor Pack.");
  }
  if (answers.testimonialCount < 2) {
    gaps.push("Secure at least two testimonials.");
    nextSteps.push("Request testimonials from a coach and a clinic parent.");
  }
  if (answers.clubTouchpoints < 2) {
    gaps.push("Increase club/school touchpoints.");
    nextSteps.push("Schedule outreach with two local clubs this week.");
  }
  if (answers.activationHours < 2) {
    gaps.push("Set aside activation hours.");
    nextSteps.push("Block two 90-minute activation windows next week.");
  }
  if (answers.alignedSegments.length < 3) {
    gaps.push("Clarify top sponsor segments.");
    nextSteps.push("Map three sponsor segments aligned to your routine.");
  }
  if (!answers.complianceAck) {
    gaps.push("Confirm brand guidelines / safe topics.");
    nextSteps.push("Draft compliance notes before sponsor meetings.");
  }

  while (nextSteps.length < 3) {
    nextSteps.push("Review Sponsor Pack and update activation menu with real examples.");
  }

  return {
    score,
    gaps,
    nextSteps: nextSteps.slice(0, 5),
  };
};

export type ReadinessReportInput = {
  name: string;
  answers: ReadinessAnswers;
  score: number;
  gaps: string[];
  nextSteps: string[];
};

export type ReadinessAssessmentProps = {
  onCreateTasks: (tasks: { title: string; dueDate: string }[]) => void;
  reports: ReadinessReport[];
  onCreateReport: (input: ReadinessReportInput) => string;
  onUpdateReport: (id: string, input: ReadinessReportInput) => void;
  onDeleteReport: (id: string) => void;
  onDuplicateReport: (id: string) => string | null;
};

const bandDescriptions = {
  "Game ready": "You have the assets and time to pitch with confidence. Focus on personalized offers.",
  "Close to launch": "Tighten up proof points and outreach cadence to unlock sponsor conversations.",
  "Needs prep": "Ship assets and outreach cadence before booking sponsor meetings.",
};

export default function ReadinessAssessment({
  onCreateTasks,
  reports,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onDuplicateReport,
}: ReadinessAssessmentProps) {
  const { toast } = useToast();
  const { isPro } = useProGate();
  const proLocked = !isPro;

  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id ?? "");
  const [answers, setAnswers] = useState<ReadinessAnswers>(reports[0]?.answers ?? DEFAULT_ANSWERS);
  const [reportName, setReportName] = useState<string>(reports[0]?.name ?? "New Readiness Report");

  useEffect(() => {
    if (!selectedReportId && reports[0]) {
      setSelectedReportId(reports[0].id);
      setAnswers(reports[0].answers);
      setReportName(reports[0].name);
      return;
    }

    const report = reports.find((item) => item.id === selectedReportId);
    if (report) {
      setAnswers(report.answers);
      setReportName(report.name);
    } else if (!selectedReportId) {
      setAnswers(DEFAULT_ANSWERS);
      setReportName("New Readiness Report");
    }
  }, [reports, selectedReportId]);

  const results = useMemo(() => computeReadiness(answers), [answers]);
  const band = getBand(results.score);

  const handleReset = () => {
    if (selectedReportId) {
      const report = reports.find((item) => item.id === selectedReportId);
      if (report) {
        setAnswers(report.answers);
        return;
      }
    }
    setAnswers(DEFAULT_ANSWERS);
  };

  const handleSaveReport = () => {
    const payload: ReadinessReportInput = {
      name: reportName.trim() || "Untitled Readiness Report",
      answers,
      score: results.score,
      gaps: results.gaps,
      nextSteps: results.nextSteps,
    };

    if (selectedReportId) {
      onUpdateReport(selectedReportId, payload);
      toast({ title: "Readiness report updated", description: "Changes saved." });
    } else {
      const id = onCreateReport(payload);
      setSelectedReportId(id);
      toast({ title: "Readiness report created", description: "Ready to reuse for future swings." });
    }
  };

  const handleDeleteReport = () => {
    if (!selectedReportId) return;
    onDeleteReport(selectedReportId);
    setSelectedReportId("");
    setAnswers(DEFAULT_ANSWERS);
    setReportName("New Readiness Report");
    toast({ title: "Readiness report deleted" });
  };

  const handleDuplicateReport = () => {
    if (!selectedReportId) return;
    const newId = onDuplicateReport(selectedReportId);
    if (newId) {
      setSelectedReportId(newId);
      toast({ title: "Readiness report duplicated", description: "Customize the copy." });
    }
  };

  const handleDownloadSummary = () => {
    const lines = [
      `Readiness report: ${reportName}`,
      `Score: ${results.score}/100 (${band.label})`,
      "",
      "Gaps:",
      ...results.gaps.map((gap) => `• ${gap}`),
      "",
      "Next steps:",
      ...results.nextSteps.map((step) => `• ${step}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, "-")}-readiness.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      name: reportName,
      score: results.score,
      band: band.label,
      answers,
      gaps: results.gaps,
      nextSteps: results.nextSteps,
      updatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, "-")}-readiness.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateTasks = () => {
    const dueDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const tasks = results.nextSteps.slice(0, 3).map((step, index) => ({
      title: step,
      dueDate: index === 0 ? todayISO() : dueDate,
    }));
    onCreateTasks(tasks);
    toast({ title: "Tasks created", description: "Next 72-hour actions added to your board." });
  };

  const handleNewReport = () => {
    setSelectedReportId("");
    setAnswers(DEFAULT_ANSWERS);
    setReportName("New Readiness Report");
  };

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Readiness Assessment</CardTitle>
            <CardDescription>Score your offline sponsorship readiness and ship tailored follow-up actions.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleNewReport}>
              New report
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicateReport} disabled={!selectedReportId}>
              Duplicate
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteReport} disabled={!selectedReportId}>
              Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report name</label>
                <Input value={reportName} onChange={(event) => setReportName(event.target.value)} placeholder="Fall swing readiness" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Results / ranking proof uploaded?</label>
                  <div className="flex items-center gap-3">
                    <Button variant={answers.resultsProof ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, resultsProof: true }))}>
                      Yes
                    </Button>
                    <Button variant={!answers.resultsProof ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, resultsProof: false }))}>
                      Not yet
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of testimonials added</label>
                  <Slider min={0} max={4} step={1} value={[answers.testimonialCount]} onValueChange={([value]) => setAnswers((prev) => ({ ...prev, testimonialCount: value }))} />
                  <p className="text-xs text-muted-foreground">{answers.testimonialCount} testimonial(s)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Weekly touchpoints with clubs/schools</label>
                  <Slider min={0} max={4} step={1} value={[answers.clubTouchpoints]} onValueChange={([value]) => setAnswers((prev) => ({ ...prev, clubTouchpoints: value }))} />
                  <p className="text-xs text-muted-foreground">{answers.clubTouchpoints} per week</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Hours per week available for activations</label>
                  <Slider min={0} max={4} step={1} value={[answers.activationHours]} onValueChange={([value]) => setAnswers((prev) => ({ ...prev, activationHours: value }))} />
                  <p className="text-xs text-muted-foreground">{answers.activationHours} hour(s)</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Sponsor segments aligned to your routine</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEGMENTS.map((segment) => (
                      <label key={segment} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                        <Checkbox
                          checked={answers.alignedSegments.includes(segment)}
                          onCheckedChange={(checked) =>
                            setAnswers((prev) => ({
                              ...prev,
                              alignedSegments: checked
                                ? [...prev.alignedSegments, segment]
                                : prev.alignedSegments.filter((s) => s !== segment),
                            }))
                          }
                        />
                        {segment}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Safe topics / brand guidelines acknowledged?</label>
                  <div className="flex items-center gap-3">
                    <Button variant={answers.complianceAck ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, complianceAck: true }))}>
                      Yes
                    </Button>
                    <Button variant={!answers.complianceAck ? "default" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, complianceAck: false }))}>
                      Not yet
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Readiness score</p>
                    <h3 className="text-3xl font-semibold">{results.score}/100</h3>
                  </div>
                  <Badge className={cn("px-3 py-1 text-sm", band.color)}>{band.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {bandDescriptions[band.label as keyof typeof bandDescriptions] ?? "Finish core assets to open sponsor conversations."}
                </p>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Gaps</p>
                    {results.gaps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No major gaps detected. Keep your cadence steady.</p>
                    ) : (
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                        {results.gaps.map((gap) => (
                          <li key={gap}>{gap}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Next 72 hours</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                      {results.nextSteps.slice(0, 3).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {proLocked ? (
                  <UpgradeLink interval="monthly" source="gated_feature_readiness_tasks">
                    <Button className="w-full">Unlock Pro task automation</Button>
                  </UpgradeLink>
                ) : (
                  <Button className="w-full" onClick={handleCreateTasks}>
                    Create 3 tasks
                  </Button>
                )}
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Saved reports</p>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {reports.length} total
                  </Badge>
                </div>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition hover:border-emerald-400 hover:bg-emerald-50 ${
                        selectedReportId === report.id ? "border-emerald-500 bg-emerald-50" : "border-muted"
                      }`}
                    >
                      <p className="font-medium text-emerald-900">{report.name}</p>
                      <p className="text-xs text-muted-foreground">Score: {report.score} · Updated {new Date(report.updatedAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                  {reports.length === 0 && <p className="text-xs text-muted-foreground">No readiness reports yet. Create one above.</p>}
                </div>
              </div>
            </aside>
          </div>
        </CardContent>

        <Separator className="mx-6" />

        <CardFooter className="flex flex-wrap items-center gap-3 px-6 py-4">
          <Button onClick={handleSaveReport}>
            Save report
          </Button>
          <Button variant="outline" onClick={handleDownloadSummary}>
            <Download className="mr-2 h-4 w-4" /> Summary TXT
          </Button>
          <Button variant="outline" onClick={handleDownloadJson}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
