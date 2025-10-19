import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitActivationSurvey } from "@/lib/feedbackService";
import { useToast } from "@/hooks/use-toast";

type ActivationSurveyFormProps = {
  prospectId: string;
  activationId?: string;
  onComplete?: () => void;
};

export default function ActivationSurveyForm({ prospectId, activationId, onComplete }: ActivationSurveyFormProps) {
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<number>(0);
  const [qrScans, setQrScans] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<number>(0);
  const [signups, setSignups] = useState<number>(0);
  const [outcome, setOutcome] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!outcome.trim()) {
      toast({ title: "Add a quick outcome", description: "Share the main result in one line." });
      return;
    }
    setLoading(true);
    try {
      await submitActivationSurvey({
        prospectId,
        activationId,
        attendees,
        qrScans,
        redemptions,
        signups,
        outcome: outcome.trim(),
        mediaUrl: mediaUrl || null,
      });
      toast({ title: "Activation logged", description: "Metrics captured and feedback sent to moderation." });
      setAttendees(0);
      setQrScans(0);
      setRedemptions(0);
      setSignups(0);
      setOutcome("");
      setMediaUrl("");
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
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Activation survey</CardTitle>
          <CardDescription>
            Capture the metrics right after the event. Results feed social proof and your sponsor reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <Input
              id="attendees"
              type="number"
              min={0}
              value={attendees}
              onChange={(event) => setAttendees(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qrScans">QR scans</Label>
            <Input
              id="qrScans"
              type="number"
              min={0}
              value={qrScans}
              onChange={(event) => setQrScans(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="redemptions">Code redemptions</Label>
            <Input
              id="redemptions"
              type="number"
              min={0}
              value={redemptions}
              onChange={(event) => setRedemptions(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signups">Email signups</Label>
            <Input
              id="signups"
              type="number"
              min={0}
              value={signups}
              onChange={(event) => setSignups(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Outcome (one line)</Label>
            <Textarea
              rows={2}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value.slice(0, 120))}
              placeholder="Example: 41 coupon redemptions + 24 new email signups"
            />
            <p className="text-xs text-muted-foreground">{outcome.length}/120</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Optional photo or recap video URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(event) => setMediaUrl(event.target.value)}
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
