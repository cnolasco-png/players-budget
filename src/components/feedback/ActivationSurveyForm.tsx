import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitActivationSurvey } from "@/lib/feedbackService";
import { useToast } from "@/hooks/use-toast";
import type { Prospect } from "@/hooks/useSponsorsData";

const todayISO = () => new Date().toISOString().slice(0, 10);

export type ActivationSurveyFormProps = {
  prospects: Prospect[];
  defaultProspectId?: string;
  onRecordActivation: (activation: {
    prospectId: string;
    date: string;
    type: string;
    attendees: number;
    qrScans: number;
    redemptions: number;
    signups: number;
    clipsDelivered: number;
  }) => string;
  onComplete?: () => void;
};

export default function ActivationSurveyForm({ prospects, defaultProspectId, onRecordActivation, onComplete }: ActivationSurveyFormProps) {
  const { toast } = useToast();
  const firstProspectId = prospects[0]?.id ?? "";
  const [form, setForm] = useState({
    prospectId: defaultProspectId ?? firstProspectId,
    date: todayISO(),
    type: "Clinic",
    attendees: 0,
    qrScans: 0,
    redemptions: 0,
    signups: 0,
    clipsDelivered: 0,
    outcome: "",
    mediaUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const activeProspect = useMemo(() => prospects.find((prospect) => prospect.id === form.prospectId), [prospects, form.prospectId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.prospectId) {
      toast({ title: "Choose a partner", description: "Select the sponsor this activation belongs to.", variant: "destructive" });
      return;
    }
    if (!form.outcome.trim()) {
      toast({ title: "Add outcome", description: "Summarize the results in one line." });
      return;
    }
    setLoading(true);
    try {
      const newActivationId = onRecordActivation({
        prospectId: form.prospectId,
        date: form.date,
        type: form.type,
        attendees: form.attendees,
        qrScans: form.qrScans,
        redemptions: form.redemptions,
        signups: form.signups,
        clipsDelivered: form.clipsDelivered,
      });

      await submitActivationSurvey({
        prospectId: form.prospectId,
        activationId: newActivationId,
        attendees: form.attendees,
        qrScans: form.qrScans,
        redemptions: form.redemptions,
        signups: form.signups,
        outcome: form.outcome.trim(),
        mediaUrl: form.mediaUrl || null,
      });

      toast({ title: "Activation saved", description: "Metrics stored and shared with the sponsor dashboard." });
      setForm((prev) => ({
        ...prev,
        date: todayISO(),
        attendees: 0,
        qrScans: 0,
        redemptions: 0,
        signups: 0,
        clipsDelivered: 0,
        outcome: "",
        mediaUrl: "",
      }));
      onComplete?.();
    } catch (error: unknown) {
      const description = error instanceof Error && error.message ? error.message : "Please try again.";
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardHeader className="space-y-3">
          <CardTitle>Activation survey</CardTitle>
          <CardDescription>
            Capture metrics right after the event. They feed social proof, sponsor reporting, and your activation log.
          </CardDescription>
          {activeProspect ? (
            <p className="text-xs text-muted-foreground">
              Logging for <strong>{activeProspect.business}</strong> — stage {activeProspect.stage} · next action: {activeProspect.nextAction || "--"}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Partner</Label>
            <Select value={form.prospectId} onValueChange={(value) => setForm((prev) => ({ ...prev, prospectId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {prospects.map((prospect) => (
                  <SelectItem key={prospect.id} value={prospect.id}>
                    {prospect.business}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Activation type</Label>
            <Input value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} placeholder="Clinic, recovery pop-up, school visit" />
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            <Input type="number" min={0} value={form.attendees} onChange={(event) => setForm((prev) => ({ ...prev, attendees: Number(event.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label>QR scans</Label>
            <Input type="number" min={0} value={form.qrScans} onChange={(event) => setForm((prev) => ({ ...prev, qrScans: Number(event.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label>Code redemptions</Label>
            <Input type="number" min={0} value={form.redemptions} onChange={(event) => setForm((prev) => ({ ...prev, redemptions: Number(event.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label>Email signups</Label>
            <Input type="number" min={0} value={form.signups} onChange={(event) => setForm((prev) => ({ ...prev, signups: Number(event.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label>Clips delivered</Label>
            <Input type="number" min={0} value={form.clipsDelivered} onChange={(event) => setForm((prev) => ({ ...prev, clipsDelivered: Number(event.target.value) }))} />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Outcome (one line)</Label>
            <Textarea
              rows={2}
              value={form.outcome}
              onChange={(event) => setForm((prev) => ({ ...prev, outcome: event.target.value.slice(0, 120) }))}
              placeholder="Example: 41 coupon redemptions + 24 new email signups"
            />
            <p className="text-xs text-muted-foreground">{form.outcome.length}/120</p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Optional photo or recap video URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.mediaUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, mediaUrl: event.target.value }))}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit activation proof"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
