import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Clipboard, FileText } from "lucide-react";

const ACTION_PLAN_TEXT = `
Professional 7-Day Action Plan (Sponsor Outcomes)

Day 1 – Positioning & Proof
• Write 2–3 sentence value statement (who you are, audience, why it matters).
• Gather 3 proof points (results, reach, testimonials, rankings).
• Pick 1 hero photo + 10s clip. Save to a “Press” folder.

Day 2 – Assets
• Finalize sponsor deck (PDF + PPTX) and a 1-pager.
• Create a media sheet: audience, impressions, content cadence, deliverables.

Day 3 – Target List
• Build a list of 40 brands (category fit, price tier, contact).
• Find decision makers (marketing/sponsorships) with emails/LinkedIn.

Day 4 – Outreach System
• Write 2 email templates (short intro + value; case study angle).
• 1 follow-up template & cadence: Day 3, Day 7, Day 14.

Day 5 – Offers
• Define Bronze / Silver / Gold packages with clear deliverables & pricing.
• Add 1 limited “pilot” option (lower risk) with quick win KPI.

Day 6 – Pipeline
• Track each lead’s stage (Contacted / Replied / Call / Proposal / Won / Lost).
• Send 10 intros + 5 follow-ups. Book 2 calls.

Day 7 – Review & Iterate
• Review replies, objections, time-to-reply.
• Update pricing/packages; plan next 7 days with targets.
`;

async function logEvent(asset: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // Bypass generated types for optional analytics insert
    await (supabase as any).from("sponsor_asset_events").insert({
      asset,
      user_id: user?.id ?? null,
    });
  } catch (e) {
    // non-blocking
    console.warn("logEvent failed", e);
  }
}

export default function SponsorDownloads() {
  const { toast } = useToast();

  const copyPlan = async () => {
    await navigator.clipboard.writeText(ACTION_PLAN_TEXT.trim());
    toast({ title: "Copied", description: "7-Day Action Plan copied to clipboard." });
    logEvent("action-plan-copy");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center space-y-2">
        <Badge className="rounded-full px-3 py-1">Sponsors</Badge>
        <h1 className="text-3xl md:text-4xl font-semibold">Sponsor Toolkit</h1>
        <p className="text-muted-foreground">Download your deck, then execute with a proven 7-day plan.</p>
      </div>

      {/* Deck card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Sponsor Deck Template</CardTitle>
          <CardDescription>Professional 8-page template — PDF & PowerPoint.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl p-4 bg-emerald-50">
            <ul className="list-disc pl-5 space-y-1 text-emerald-900">
              <li>Cover Page — intro with key stats</li>
              <li>Player Profile — athletic background & achievements</li>
              <li>Partnership Packages — Bronze / Silver / Gold tiers</li>
              <li>Tournament Schedule — season calendar</li>
              <li>Digital Presence — content strategy & cadence</li>
              <li>Financial Overview — budget & ROI analysis</li>
              <li>Marketing Benefits — brand exposure opportunities</li>
              <li>Contact & Next Steps — close + CTA</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="gap-3 flex-wrap">
          <Button asChild onClick={()=>logEvent("deck-pdf")}>
            <a href="/sponsor/sponsor-deck.pdf" download><Download className="mr-2 h-4 w-4"/>Download PDF</a>
          </Button>
          <Button variant="outline" asChild onClick={()=>logEvent("deck-pptx")}>
            <a href="/sponsor/sponsor-deck.pptx" download><Download className="mr-2 h-4 w-4"/>Download PPTX</a>
          </Button>
        </CardFooter>
      </Card>

      {/* Action plan */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Professional 7-Day Action Plan</CardTitle>
          <CardDescription>Battle-tested pipeline you can run this week.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Use the quick copy to paste into Notes/Notion; the PDF is formatted for print/share.
          </div>
          <Separator className="my-4" />
          <pre className="whitespace-pre-wrap text-sm">{ACTION_PLAN_TEXT.trim()}</pre>
        </CardContent>
        <CardFooter className="gap-3">
          <Button onClick={copyPlan}><Clipboard className="mr-2 h-4 w-4"/>Quick Copy</Button>
          <Button variant="outline" asChild onClick={()=>logEvent("action-plan-pdf")}>
            <a href="/sponsor/action-plan-pro.pdf" download><Download className="mr-2 h-4 w-4"/>Download PDF</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
