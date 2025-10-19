import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import UpgradeLink from "@/components/UpgradeLink";
import useProGate from "@/hooks/useProGate";

type AnswerState = {
  resultsProof: boolean;
  testimonialCount: number;
  clubTouchpoints: number;
  activationHours: number;
  alignedSegments: string[];
  complianceAck: boolean;
};

type ReadinessAssessmentProps = {
  onCreateTasks: (tasks: { title: string; dueDate: string }[]) => void;
};

const SEGMENTS = ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport", "Education/Club", "Health/Recovery", "Financial"];

const WEIGHTS = {
  credibility: 20,
  proKit: 20,
  localMarketability: 20,
  activationCapacity: 15,
  sponsorFit: 15,
  compliance: 10,
} as const;

function getBand(score: number) {
  if (score >= 80) return { label: "Game ready", color: "text-emerald-600 bg-emerald-100" };
  if (score >= 60) return { label: "Close to launch", color: "text-amber-600 bg-amber-100" };
  return { label: "Needs prep", color: "text-red-600 bg-red-100" };
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ReadinessAssessment({ onCreateTasks }: ReadinessAssessmentProps) {
  const [answers, setAnswers] = useState<AnswerState>({
    resultsProof: true,
    testimonialCount: 2,
    clubTouchpoints: 3,
    activationHours: 3,
    alignedSegments: ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport"],
    complianceAck: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const { isPro } = useProGate();
  const proLocked = !isPro;

  const results = useMemo(() => {
    const credibility =
      (answers.resultsProof ? 1 : 0) * (WEIGHTS.credibility * 0.6) +
      Math.min(answers.testimonialCount, 2) / 2 * (WEIGHTS.credibility * 0.4);

    const proKit =
      Math.min(answers.testimonialCount, 2) / 2 * (WEIGHTS.proKit * 0.4) +
      (answers.activationHours >= 3 ? WEIGHTS.proKit * 0.6 : WEIGHTS.proKit * 0.3);

    const localMarketability =
      Math.min(answers.clubTouchpoints, 3) / 3 * WEIGHTS.localMarketability;

    const activationCapacity =
      Math.min(answers.activationHours, 4) / 4 * WEIGHTS.activationCapacity;

    const sponsorFit =
      Math.min(answers.alignedSegments.length, 3) / 3 * WEIGHTS.sponsorFit;

    const compliance = answers.complianceAck ? WEIGHTS.compliance : 0;

    const totalScore = Math.round(credibility + proKit + localMarketability + activationCapacity + sponsorFit + compliance);

    const gaps: string[] = [];
    const nextSteps: string[] = [];

    if (!answers.resultsProof) {
      gaps.push("Upload a results or ranking proof piece.");
      nextSteps.push("Add your latest results PDF or screenshot to the Sponsor Pack.");
    }
    if (answers.testimonialCount < 2) {
      gaps.push("Secure two testimonials.");
      nextSteps.push("Request testimonials from coach and clinic parent to add credibility.");
    }
    if (answers.clubTouchpoints < 2) {
      gaps.push("Increase club/school touchpoints.");
      nextSteps.push("Schedule outreach with two local clubs or schools this week.");
    }
    if (answers.activationHours < 2) {
      gaps.push("Set aside activation hours.");
      nextSteps.push("Block out two 90-minute slots for sponsor activations next week.");
    }
    if (answers.alignedSegments.length < 3) {
      gaps.push("Clarify top sponsor segments.");
      nextSteps.push("Map three sponsor segments that align with your weekly routine.");
    }
    if (!answers.complianceAck) {
      gaps.push("Confirm brand guidelines and safe topics.");
      nextSteps.push("Draft brand guideline acknowledgement before meeting sponsors.");
    }

    // ensure at least 3 next steps
    while (nextSteps.length < 3) {
      nextSteps.push("Review your Sponsor Pack and update the activation menu with real examples.");
    }

    return {
      score: totalScore,
      gaps,
      nextSteps: nextSteps.slice(0, 5),
    };
  }, [answers]);

  const band = getBand(results.score);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleCreateTasks = () => {
    const dueDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const taskPayload = results.nextSteps.slice(0, 3).map((step, index) => ({
      title: step,
      dueDate: index === 0 ? todayISO() : dueDate,
    }));
    onCreateTasks(taskPayload);
  };

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Readiness Assessment</CardTitle>
          <CardDescription>
            Score your offline sponsorship readiness. We’ll highlight the next 72-hour actions that move the needle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Results / ranking proof uploaded?</label>
              <div className="flex items-center gap-3">
                <Button
                  variant={answers.resultsProof ? "default" : "outline"}
                  onClick={() => setAnswers((prev) => ({ ...prev, resultsProof: true }))}
                >
                  Yes
                </Button>
                <Button
                  variant={!answers.resultsProof ? "default" : "outline"}
                  onClick={() => setAnswers((prev) => ({ ...prev, resultsProof: false }))}
                >
                  Not yet
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Number of testimonials added</label>
              <Slider
                min={0}
                max={4}
                step={1}
                value={[answers.testimonialCount]}
                onValueChange={([value]) => setAnswers((prev) => ({ ...prev, testimonialCount: value }))}
              />
              <p className="text-xs text-muted-foreground">{answers.testimonialCount} testimonial(s)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Weekly touchpoints with clubs/schools</label>
              <Slider
                min={0}
                max={4}
                step={1}
                value={[answers.clubTouchpoints]}
                onValueChange={([value]) => setAnswers((prev) => ({ ...prev, clubTouchpoints: value }))}
              />
              <p className="text-xs text-muted-foreground">{answers.clubTouchpoints} per week</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hours per week available for activations</label>
              <Slider
                min={0}
                max={4}
                step={1}
                value={[answers.activationHours]}
                onValueChange={([value]) => setAnswers((prev) => ({ ...prev, activationHours: value }))}
              />
              <p className="text-xs text-muted-foreground">{answers.activationHours} hour(s)</p>
            </div>

            <div className="space-y-2">
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
                <Button
                  variant={answers.complianceAck ? "default" : "outline"}
                  onClick={() => setAnswers((prev) => ({ ...prev, complianceAck: true }))}
                >
                  Yes
                </Button>
                <Button
                  variant={!answers.complianceAck ? "default" : "outline"}
                  onClick={() => setAnswers((prev) => ({ ...prev, complianceAck: false }))}
                >
                  Not yet
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button onClick={handleSubmit}>Calculate score</Button>
          <Button variant="outline" type="button" onClick={() => setAnswers({
            resultsProof: true,
            testimonialCount: 2,
            clubTouchpoints: 3,
            activationHours: 3,
            alignedSegments: ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport"],
            complianceAck: true,
          })}>
            Reset
          </Button>
        </CardFooter>
      </Card>

      {submitted && (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Your score</p>
                <h3 className="text-3xl font-semibold">
                  {results.score}/100
                </h3>
              </div>
              <Badge className={cn("px-3 py-1 text-sm", band.color)}>{band.label}</Badge>
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Gaps</h4>
                {results.gaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No gaps identified. Keep executing your plan.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                    {results.gaps.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Next 72 hours</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                  {results.nextSteps.slice(0, 3).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {proLocked ? (
              <Button asChild>
                <UpgradeLink interval="monthly" source="gated_feature_playbook" className="px-4">
                  Unlock Pro Playbook tasks
                </UpgradeLink>
              </Button>
            ) : (
              <Button onClick={handleCreateTasks}>Create 3 tasks</Button>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default ReadinessAssessment;
