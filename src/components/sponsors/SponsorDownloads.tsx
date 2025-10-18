import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clipboard, Download, FileText, LineChart, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import usePro from "@/hooks/usePro";

type AssessmentAnswers = {
  audience: "local" | "regional" | "national";
  proof: "early" | "growing" | "established";
  bandwidth: "solo" | "small-team" | "full-team";
};

type OutreachTemplate = {
  id: string;
  label: string;
  tier: "free" | "pro";
  headline: string;
  bestFor: string;
  subject: string;
  email: string;
  dm: string;
  followUp: string;
};

const OUTREACH_LIBRARY: OutreachTemplate[] = [
  {
    id: "fitness-apparel",
    label: "Performance Apparel / Footwear",
    tier: "free",
    headline: "Perfect for brands that want measurable performance content tied to tournaments.",
    bestFor: "Free demo template that players can copy immediately.",
    subject: "Next event collaboration with {Brand}",
    email: `Hi {Name},

I'm heading into the {Event} swing with broadcast coverage on {Channel}/streaming. Your {product} is already in my training rotation and gets great engagement on my clinics content (~{metric} average views).

I'd love to co-produce a tournament week kit drop:
• Daily practice story tags featuring your {product}
• Match-day reel (15–20s) with swipe-up discount code
• Post-event recap email to my list (4,200 subscribers)

Happy to share performance dashboards from previous collaborations plus outline packages from $1.5k (pilot) through $5k (premium week).

If this could fit your Q{Quarter} promo calendar, can we grab 15 minutes this week?

Best,
{Signature}`,
    dm: `Hey {Name}! Heading to {Event} next month and already getting questions about the gear I'm using on court. Your {product} is perfect for a "what's in my bag" drop + daily practice clips. Want me to send a quick deck with ideas & numbers?`,
    followUp: `Hi {Name},

Checking back on my note from earlier this week—slots for the {Event} travel window are almost full. If {Brand} wants in on the match-week content pack, here’s an easy pilot:
• Gear Bag reel with product tags
• Daily story set w/ swipe-up code
• Results recap email + metrics report

Let me know if I should lock the dates or connect with someone on your team.

Thanks again!`,
  },
  {
    id: "sports-nutrition",
    label: "Sports Nutrition / Supplements",
    tier: "pro",
    headline: "Position recovery, performance data and education-based partnerships.",
    bestFor: "Brands selling hydration powders, recovery shakes and wellness stacks.",
    subject: "Fueling the {Event} grind with {Brand}",
    email: `Hello {Name},

As I prep for a 6-week stretch through {Region}, athlete fueling is front and center on my content calendar. I already use {Brand} during training blocks and would love to build a structured series together:

• Weekly "training table" video featuring {Product} + macro breakdowns
• On-site recovery check-ins filmed post-match (30s vertical video)
• Discount code + QR signage on my autograph cards at kids' clinics
• Monthly live Q&A (IG or Discord) hosted by me + your sports RD

My audience skews {demographic} with 62% repeat viewers on nutrition content. We could launch a 4-week pilot at $3.5k inclusive of production, or explore season-long tiers starting at $9k.

Would a 20-minute strategy call next week fit your schedule?

Gratefully,
{Signature}`,
    dm: `Hi {Name}! I’m mapping a nutrition content series for my next tour leg and your {Product} is already in my routine. Want to co-build “Inside the Fuel Plan” with recipes, recovery checks, and exclusive codes for my clinics audience?`,
    followUp: `Hi {Name},

Quick reminder before I lock next month’s shoot schedule. The {Brand} collab idea is still open and I’d love to feature your products during {Event} coverage. I can hold the “Inside the Fuel Plan” slot for 48 hours—just reply here or shoot me a DM and I’ll send over the pilot outline + ROI dashboard.

Appreciate the consideration!`,
  },
  {
    id: "accessories-tech",
    label: "Wearables & Accessories",
    tier: "pro",
    headline: "Highlight data capture, broadcast visibility and on-site demos.",
    bestFor: "Smart wearables, performance trackers, eyewear, grip tech.",
    subject: "Broadcast visibility + live demos with {Brand}",
    email: `Hi {Name},

My upcoming {Tournament Series} features televised matches in primetime slots. I’m building an “on-court tech” partner slot and {Brand} is a natural fit.

Here’s the activation concept:
• Match-day warm-up segment showing {Product} data overlay (15s reel + stills)
• In-venue fan experience: demo station or giveaway tied to QR code lead capture
• Broadcast callouts (player mic’d during practice) mentioning {Brand} integration
• Quarterly performance recap deck with impressions, scans, conversions

Average match reach last season: {metric}. I can share the Sponsor Deck plus a detailed activation timeline—pilot packages begin at $12k covering two televised events with on-site deliverables.

Would you or someone on partnerships be free early next week?

Best regards,
{Signature}`,
    dm: `Hi {Name}! Heading into televised matches at {Event} and adding a “court tech” partner slot. Imagine showcasing {Product} metrics in warm-up reels + letting fans try it on site. Want me to send the activation sheet?`,
    followUp: `Hi {Name},

Last nudge from me—my production team is locking camera shots and signage placements for {Event}. If {Brand} wants in on the “on-court tech” experience, I can still secure the broadcast mentions and in-venue station this week.

Let me know if I should hold the slot or connect with someone else on your team.

Thanks!`,
  },
];

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

const DEFAULT_ASSESSMENT: AssessmentAnswers = {
  audience: "local",
  proof: "early",
  bandwidth: "solo",
};

const STAGE_DETAILS = {
  foundation: {
    label: "Foundation",
    summary:
      "Dial in your story, first proof points and a lean outreach cadence focused on community partners.",
    targetIdeas: [
      "Local gyms, clinics & physios in your home market",
      "Neighborhood restaurants / hospitality groups",
      "Small businesses owned by alumni or local supporters",
    ],
    proPlaybook: [
      "Shared social calendar templates for recurring content deliverables",
      "Community activation blueprint (fan clinics, fundraising tie-ins)",
      "Pricing matrix with entry packages ($1–3k) and pilot offers",
    ],
  },
  traction: {
    label: "Traction",
    summary:
      "Leverage growing audience metrics to pitch regional & national consumer brands with performance goals.",
    targetIdeas: [
      "DTC supplements, apparel & wellness brands",
      "Regional hospitality, hotels & travel partners",
      "Marketing agencies managing influencer & athlete rosters",
    ],
    proPlaybook: [
      "Multi-touch email + LinkedIn playbook with objection handling",
      "Attribution tracker for codes, affiliate links & QR signage",
      "Activation library: livestreams, product drops, hospitality events",
    ],
  },
  scale: {
    label: "Scale",
    summary:
      "Package media reach, broadcast exposure and hospitality assets to land multi-year corporate partnerships.",
    targetIdeas: [
      "Financial services, insurance & enterprise tech partners",
      "Airlines, hotels & premium hospitality brands",
      "Agencies managing multi-asset sponsorship portfolios",
    ],
    proPlaybook: [
      "Executive-ready proposal deck templates with ROI modeling",
      "Sponsorship renewal framework + enterprise negotiation checklist",
      "Hospitality & VIP experience activation tracker",
    ],
  },
} as const;

function scoreAssessment(answers: AssessmentAnswers) {
  const score =
    (answers.audience === "local" ? 0 : answers.audience === "regional" ? 1 : 2) +
    (answers.proof === "early" ? 0 : answers.proof === "growing" ? 1 : 2) +
    (answers.bandwidth === "solo" ? 0 : answers.bandwidth === "small-team" ? 1 : 2);

  if (score <= 2) return "foundation";
  if (score <= 4) return "traction";
  return "scale";
}

async function logEvent(asset: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase as any)
      .from("sponsor_asset_events")
      .insert({
        asset,
        user_id: user?.id ?? null,
      });
  } catch (error) {
    console.warn("logEvent failed", error);
  }
}

export default function SponsorDownloads() {
  const { toast } = useToast();
  const { isPro, loading } = usePro();
  const [answers, setAnswers] = useState<AssessmentAnswers>(DEFAULT_ASSESSMENT);

  const stageKey = useMemo(() => scoreAssessment(answers), [answers]);
  const stage = STAGE_DETAILS[stageKey];

  const proLocked = !loading && !isPro;

  const copyPlan = async () => {
    if (proLocked) {
      toast({ title: "Pro required", description: "Upgrade to copy the 7-day plan." });
      return;
    }

    const text = ACTION_PLAN_TEXT.trim();
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "7-Day Action Plan copied to clipboard." });
      logEvent("action-plan-copy");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
      toast({ title: "Copied", description: "Plan copied using fallback." });
      logEvent("action-plan-copy");
    }
  };

  const onPlanPdfClick = async () => {
    if (proLocked) {
      toast({ title: "Pro required", description: "Upgrade to download the action plan." });
      return;
    }
    try {
      const pdfPath = "/sponsor/action-plan-pro.pdf";
      const head = await fetch(pdfPath, { method: "HEAD", cache: "no-store" });
      const raw = head.headers.get("content-length");
      const len = raw ? Number(raw) : null;
      if (!head.ok || !len) {
        const resp = await fetch("/api/sponsor/action-plan", { cache: "no-store" });
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "action-plan-pro.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement("a");
        link.href = pdfPath;
        link.download = "action-plan-pro.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      logEvent("action-plan-pdf");
    } catch (error) {
      console.error("Action plan download failed", error);
      toast({ title: "Download failed", description: "Please try again later." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <section className="text-center space-y-3">
        <Badge className="rounded-full px-3 py-1">Sponsor Pipeline</Badge>
        <h1 className="text-3xl md:text-4xl font-semibold">Sponsor Outreach Toolkit</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Launch a sponsor-ready story, download pitch decks tailored by industry, and follow a
          battle-tested outreach system. The first template is free so you can demo the process —
          the full library requires Pro.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
          <div>
            <h2 className="text-xl font-semibold">Outreach Template Library</h2>
            <p className="text-muted-foreground max-w-2xl">
              Copy/paste scripts tuned for the most common tennis sponsor verticals. Customize the
              variables in brackets, hit send, and log the conversation.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <span className="font-medium">Demo included · Pro unlocks 2 more</span>
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {OUTREACH_LIBRARY.map((template) => {
            const locked = template.tier === "pro" && proLocked;
            return (
              <Card key={template.id} className="rounded-2xl relative overflow-hidden">
                {locked && (
                  <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm grid place-items-center border border-dashed border-primary/40">
                    <div className="text-center space-y-1">
                      <div className="font-medium">Pro template</div>
                      <div className="text-sm text-muted-foreground">Upgrade to download</div>
                    </div>
                  </div>
                )}
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{template.label}</CardTitle>
                    <Badge variant={template.tier === "free" ? "default" : "secondary"}>
                      {template.tier === "free" ? "Demo" : "Pro"}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="font-medium text-foreground">{template.headline}</div>
                    <div>{template.bestFor}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-1">
                      Email subject
                    </div>
                    <div className="rounded-md bg-muted/60 border px-2 py-1 text-sm">
                      {template.subject}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      Email / pitch body
                    </div>
                    <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                      {template.email}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      Social DM / text
                    </div>
                    <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                      {template.dm}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    onClick={async () => {
                      if (locked) {
                        toast({
                          title: "Pro required",
                          description: "Upgrade to copy this outreach template.",
                        });
                        return;
                      }
                      try {
                        await navigator.clipboard.writeText(
                          `${template.subject}\n\n${template.email}\n\n---\nDM idea:\n${template.dm}\n\nFollow up:\n${template.followUp}`,
                        );
                        toast({ title: "Copied", description: "Template copied to clipboard." });
                        logEvent(`template-copy-${template.id}`);
                      } catch {
                        toast({ title: "Copy failed", description: "Try again in a moment." });
                      }
                    }}
                    disabled={loading}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy bundle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (locked) {
                        toast({
                          title: "Pro required",
                          description: "Upgrade to unlock the follow-up script.",
                        });
                        return;
                      }
                      try {
                        await navigator.clipboard.writeText(template.followUp);
                        toast({ title: "Copied", description: "Follow-up script copied." });
                        logEvent(`template-followup-${template.id}`);
                      } catch {
                        toast({ title: "Copy failed", description: "Try again in a moment." });
                      }
                    }}
                    disabled={loading}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy follow-up
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Professional 7-Day Action Plan
            </CardTitle>
            <CardDescription>
              Run this playbook alongside your deck to launch and maintain a sponsor pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Use the quick copy to paste into Notes/Notion; the PDF is formatted for print/share.
            </div>
            <Separator />
            {loading ? (
              <div className="h-32 rounded-md bg-muted animate-pulse" />
            ) : proLocked ? (
              <div className="rounded-md border border-dashed bg-muted/50 p-6 text-center space-y-1">
                <div className="font-medium">Pro unlock</div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to access the full 7-day execution plan.
                </p>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 border rounded-md p-4">
                {ACTION_PLAN_TEXT.trim()}
              </pre>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button onClick={copyPlan} disabled={loading}>
              <Clipboard className="mr-2 h-4 w-4" />
              Quick Copy
            </Button>
            <Button variant="outline" onClick={onPlanPdfClick} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sponsorship Readiness Assessment
            </CardTitle>
            <CardDescription>
              Answer three quick questions to see which sponsorship tier you should target next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Audience reach</span>
                <div className="grid gap-2">
                  {["local", "regional", "national"].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={answers.audience === size ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setAnswers((prev) => ({ ...prev, audience: size as AssessmentAnswers["audience"] }))}
                    >
                      {size === "local" && "Local — <50k followers, strong community ties"}
                      {size === "regional" && "Regional — 50k–150k reach with multi-market audience"}
                      {size === "national" && "National — 150k+ reach or broadcast coverage"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Proof points</span>
                <div className="grid gap-2">
                  {["early", "growing", "established"].map((proof) => (
                    <Button
                      key={proof}
                      type="button"
                      variant={answers.proof === proof ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setAnswers((prev) => ({ ...prev, proof: proof as AssessmentAnswers["proof"] }))}
                    >
                      {proof === "early" && "Early — references & testimonials in progress"}
                      {proof === "growing" && "Growing — audience metrics & case studies available"}
                      {proof === "established" && "Established — national press or televised coverage"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Outreach bandwidth</span>
                <div className="grid gap-2">
                  {["solo", "small-team", "full-team"].map((capacity) => (
                    <Button
                      key={capacity}
                      type="button"
                      variant={answers.bandwidth === capacity ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setAnswers((prev) => ({ ...prev, bandwidth: capacity as AssessmentAnswers["bandwidth"] }))}
                    >
                      {capacity === "solo" && "Solo — you handle outreach between travel & matches"}
                      {capacity === "small-team" && "Small team — you + helper to manage follow-ups"}
                      {capacity === "full-team" && "Dedicated help — manager or agency support"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border bg-muted/50 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Recommended stage — {stage.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{stage.summary}</p>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Target next</div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                  {stage.targetIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border bg-secondary/10 p-5 space-y-2">
                <div className="text-sm font-semibold text-secondary-foreground">Pro playbook</div>
                <ul className="list-disc pl-5 text-sm text-secondary-foreground/90 space-y-1.5">
                  {stage.proPlaybook.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {proLocked && (
                <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-background/70 border border-dashed border-secondary/40 grid place-items-center">
                  <div className="text-center space-y-1">
                    <div className="font-medium">Pro recommendation</div>
                    <div className="text-sm text-muted-foreground">Upgrade to unlock advanced playbooks</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Sponsor Deck Download</CardTitle>
            <CardDescription>
              Use the core PDF / PPT deck to support your outreach. Replace placeholders with your
              stats, packages and schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The deck includes audience profile, package tiers, tournament calendar and digital
              deliverables. Keep this up to date quarterly so it matches the promises in your email
              templates above.
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/sponsor/sponsor-deck.pdf";
                link.download = "sponsor-deck.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Deck (PDF)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/sponsor/sponsor-deck.pptx";
                link.download = "sponsor-deck.pptx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Deck (PPTX)
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
