import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback, FeedbackPayload, FeedbackRole } from "@/lib/feedbackService";

type QuickFeedbackSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAIN_WINS = [
  "Landed a sponsor",
  "Booked a meeting",
  "Ran an activation",
  "Grew local reach",
  "Other",
];

const ROLE_OPTIONS: { value: FeedbackRole; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "sponsor", label: "Sponsor" },
  { value: "coach", label: "Coach / Club" },
];

export default function QuickFeedbackSheet({ open, onOpenChange }: QuickFeedbackSheetProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<FeedbackRole>("player");
  const [rating, setRating] = useState<number>(8);
  const [mainWin, setMainWin] = useState<string>(MAIN_WINS[0]);
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [title, setTitle] = useState("");
  const [consentPublish, setConsentPublish] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [consentOrg, setConsentOrg] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const clearForm = () => {
    setRole("player");
    setRating(8);
    setMainWin(MAIN_WINS[0]);
    setQuote("");
    setName("");
    setOrg("");
    setTitle("");
    setConsentName(false);
    setConsentOrg(false);
    setConsentPublish(false);
    setMediaUrl("");
    setAvatarUrl("");
  };

  const handleSubmit = async () => {
    if (!quote.trim()) {
      toast({ title: "Add a short quote", description: "Tell us the win in one sentence." });
      return;
    }
    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        role,
        rating,
        mainWin,
        quote: quote.trim(),
        consentPublish,
        consentName,
        consentOrg,
        name: name || null,
        org: org || null,
        title: title || null,
        mediaUrl: mediaUrl || null,
        avatarUrl: avatarUrl || null,
      };
      await submitFeedback(payload);
      toast({ title: "Thanks!", description: "We’ll feature this soon." });
      clearForm();
      onOpenChange(false);
    } catch (error: unknown) {
      const description = error instanceof Error && error.message ? error.message : "Please try again.";
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Share a quick win</SheetTitle>
          <SheetDescription>60-second feedback that helps us highlight real local impact.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as FeedbackRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>NPS (0-10)</Label>
            <Slider value={[rating]} min={0} max={10} step={1} onValueChange={([value]) => setRating(value)} />
            <p className="text-sm text-muted-foreground">Rating: {rating}</p>
          </div>

          <div className="space-y-2">
            <Label>Main win we helped you achieve</Label>
            <Select value={mainWin} onValueChange={setMainWin}>
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                {MAIN_WINS.map((win) => (
                  <SelectItem key={win} value={win}>
                    {win}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quote (max 240 chars)</Label>
            <Textarea
              value={quote}
              onChange={(event) => setQuote(event.target.value.slice(0, 240))}
              maxLength={240}
              rows={4}
              placeholder="Keep it short: what happened? what was the result?"
            />
            <p className="text-xs text-muted-foreground">{quote.length}/240</p>
          </div>

          <div className="space-y-2">
            <Label>Optional media (URL)</Label>
            <Input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label>Optional avatar/logo URL</Label>
            <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex R." />
            </div>
            <div className="space-y-2">
              <Label>Org / Club</Label>
              <Input value={org} onChange={(event) => setOrg(event.target.value)} placeholder="Rally Café" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Owner / Director" />
          </div>

          <div className="space-y-2">
            <Label>Consent</Label>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox checked={consentName} onCheckedChange={(checked) => setConsentName(!!checked)} />
                Show my first name + last initial
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={consentOrg}
                  onCheckedChange={(checked) => setConsentOrg(!!checked)}
                  disabled={role === "player"}
                />
                Show my brand/club name & logo
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={consentPublish} onCheckedChange={(checked) => setConsentPublish(!!checked)} />
                I grant permission to publish this quote/media
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
