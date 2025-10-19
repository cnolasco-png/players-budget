import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback, FeedbackPayload } from "@/lib/feedbackService";
import { getErrorMessage } from "@/lib/errors";
import LandingHero from "./Landing";

export default function PublicFeedbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { toast } = useToast();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(9);
  const [quote, setQuote] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [consentPublish, setConsentPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (!token) {
      toast({ title: "Feedback link invalid", description: "Request a new one from the player.", variant: "destructive" });
      navigate("/");
    }
  }, [token, toast, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (honeypot) {
      toast({ title: "Submission blocked", description: "Please try again.", variant: "destructive" });
      return;
    }
    if (!quote.trim()) {
      toast({ title: "Add a quick quote", description: "Tell us how the activation helped.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        role: "sponsor",
        rating,
        mainWin: "Landed a sponsor",
        quote: quote.trim(),
        consentPublish,
        consentName: true,
        consentOrg: true,
        name,
        org: company,
        title,
        mediaUrl: mediaUrl || null,
        avatarUrl: null,
      };
      await submitFeedback(payload);
      toast({ title: "Thank you!", description: "We appreciate your support." });
      navigate("/thanks");
    } catch (error: unknown) {
      const description = getErrorMessage(error, "Please try again.");
      toast({ title: "Submission failed", description, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Card className="rounded-2xl border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Share your sponsor win</CardTitle>
              <CardDescription>
                Record a quick 60-second testimonial or short quote. It helps us bring more tennis activations to the
                community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Rivera" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Company / Club</Label>
                  <Input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Rally Café"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Owner" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Slider value={[rating]} min={0} max={10} step={1} onValueChange={([value]) => setRating(value)} />
                <span className="text-sm text-muted-foreground">Rating: {rating}</span>
              </div>
              <div className="space-y-2">
                <Label>Quote (max 240 characters)</Label>
                <Textarea
                  value={quote}
                  onChange={(event) => setQuote(event.target.value.slice(0, 240))}
                  rows={4}
                  placeholder="What happened? What result did the activation deliver?"
                />
                <span className="text-xs text-muted-foreground">{quote.length}/240</span>
              </div>
              <div className="space-y-2">
                <Label>Optional video/photo link</Label>
                <Input
                  type="url"
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Consent</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox checked={consentPublish} onCheckedChange={(checked) => setConsentPublish(!!checked)} />
                  I grant permission to publish this quote/media on Player’s Budget channels.
                </div>
              </div>
            </CardContent>
            <CardContent className="bg-muted/50 text-sm text-muted-foreground">
              <p>
                Need a reminder? Here’s the quick pitch you can use again: “We help local athletes activate your brand
                with clinics, QR tracking and real community impact.”
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="link" type="button" onClick={() => navigate("/")}>
                Back to homepage
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit testimonial"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
