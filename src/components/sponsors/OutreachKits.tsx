import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Mail, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import UpgradeLink from "@/components/UpgradeLink";

type OutreachChannel = "email" | "dm" | "call" | "followups" | "proposal";

type OutreachTemplate = {
  id: string;
  segment: string;
  tier: "free" | "pro";
  headline: string;
  bestFor: string;
  content: Record<OutreachChannel, string>;
  activationIdeas: string[];
  offerMechanics: string[];
};

const SEGMENTS = [
  "Café/Restaurant",
  "Physio/Chiro/Gym",
  "Barbershop/Salon",
  "Car Wash",
  "Racket Shop",
  "College/Academy",
  "Real-Estate Agent",
  "Credit Union",
] as const;

const TEMPLATE_LIBRARY: OutreachTemplate[] = [
  {
    id: "cafe-restaurant",
    segment: "Café/Restaurant",
    tier: "free",
    headline: "Drive foot traffic from nearby clinics and match nights.",
    bestFor: "Quick wins with in-person activations and receipt promos.",
    content: {
      email: `Subject: Local tennis collab to drive foot traffic this month
Hi {{CONTACT_FIRST}} — I’m {{PLAYER_NAME}}, a {{RANKING}}-ranked player training at {{CLUB}} in {{CITY}}. I can bring nearby players & families into {{BUSINESS_NAME}} with two simple activations:
• 60-min meet-n-greet after our Saturday clinic (QR on flyers to a {{OFFER_CODE}} offer)
• “Matchday receipt” promo (show same-day court booking and get {{DISCOUNT}}% off)
I’ll handle flyers, QR, and 5 short vertical clips for YOUR channels.
If you like it, I’ll drop by Tue 11:00 or Thu 16:00 to show a 1-pager. Works?
— {{PLAYER_NAME}} | {{PHONE}} | {{EMAIL}}`,
      dm: `Hey {{CONTACT_FIRST}}! I’m a competitive tennis player at {{CLUB}}. I can bring players + families into {{BUSINESS_NAME}} with a Saturday clinic meet-up and a “matchday receipt” promo. Want me to swing by with the flyer & QR offer?`,
      call: `“Hi {{CONTACT_FIRST}}, this is {{PLAYER_NAME}} — a local tennis player who trains at {{CLUB}}. I run weekend clinics with 25–40 players and want to host a post-clinic meet-up at {{BUSINESS_NAME}}. I handle flyer design, QR tracking, and short videos for your channels. Can we lock a 15-minute visit on Tuesday or Thursday?”`,
      followups: `D+3: “Quick bump—happy to run a tiny test: one clinic + QR coupon. No long contract.”
D+7: “Here’s a 1-pager with the clinic plan and sample flyer—ok to drop by Wednesday?”
D+14: “If timing’s tough now, I can revisit next month—any preferred week?”`,
      proposal: `• 1 in-store meet-and-greet each month after Saturday clinic
• 5 edited vertical clips/month for your channels showcasing offers
• QR + code on flyers to track redemptions
• Co-branded flyer & table tent delivered every two weeks
• Appearance at one community event or school per quarter`,
    },
    activationIdeas: [
      "Clinic meet-up with autograph table and QR coupons",
      "Matchday receipt discount (same day booking → % off)",
      "Season kick-off brunch featuring local players",
    ],
    offerMechanics: [
      "QR code to unique {{OFFER_CODE}} landing page",
      "Flyer with same-day redemption instructions",
      "Table tent with “show court app” prompt for discount",
    ],
  },
  {
    id: "physio-chiro",
    segment: "Physio/Chiro/Gym",
    tier: "pro",
    headline: "Position injury-prevention clinics and recurring content.",
    bestFor: "Clinics, assessments, and evergreen mobility plans.",
    content: {
      email: `Subject: Build a tennis-specific injury prevention pipeline
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}}, a {{RANKING}}-ranked player training out of {{CLUB}} in {{CITY}}. I’d love to partner with {{BUSINESS_NAME}} to bring tennis athletes into your assessment flow:

• Host a 45-min “Serve Safe” clinic at your space (QR signup → free assessments)
• Weekly social clips with your rehab tips + my on-court implementation
• Monthly email to local clubs linking to your booking funnel

I capture QR scans, redemptions and lead signups, and I deliver 5 edited clips per month for your channels.

Could we book a 20-minute strategy call this week?

Thanks,
{{PLAYER_NAME}} | {{PHONE}} | {{EMAIL}}`,
      dm: `Hey {{CONTACT_FIRST}}! I’m a competitive tennis player at {{CLUB}}. I can host a 45-min injury-prevention clinic at your place (+ QR signup → free assessment slots). I’ll deliver 5 edited clips/month for your IG. Want a quick call this week?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}} — I train at {{CLUB}} and lead tennis clinics around {{CITY}}. I’d love to run a 45-minute injury prevention workshop at {{BUSINESS_NAME}}, capture leads via QR, and feed your calendar with monthly content. Can we set a call to outline clinic dates?”`,
      followups: `D+3: “Quick bump—happy to run a tiny test: one clinic + QR coupon. No long contract.”
D+7: “Here’s a 1-pager with the clinic plan and sample flyer—ok to drop by Wednesday?”
D+14: “If timing’s tough now, I can revisit next month—any preferred week?”`,
      proposal: `• 1 in-clinic injury prevention session per month
• 5 edited vertical clips/month from clinic + guided exercises
• QR signup to track assessments booked
• Co-branded flyer for local clubs & school visits
• Quarterly “return to play” panel with PT + coach insights`,
    },
    activationIdeas: [
      "Serve-safe warm-up clinic at their studio",
      "On-site assessments before tournaments",
      "Monthly recovery livestream featuring their therapists",
    ],
    offerMechanics: [
      "QR leading to free assessment scheduler",
      "Coupon code for first treatment",
      "Email automation tagging tennis referrals",
    ],
  },
  {
    id: "barbershop-salon",
    segment: "Barbershop/Salon",
    tier: "pro",
    headline: "Tie tournament weeks to grooming appointments.",
    bestFor: "Shops looking for recurring appointment spikes tied to events.",
    content: {
      email: `Subject: Tournament week grooming collab
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} from {{CLUB}} — competing on the regional tour. I can send players & fans into {{BUSINESS_NAME}} with a “match ready” bundle:
• Tournament week promo: show ticket/court receipt → {{DISCOUNT}}% off cut or style
• Friday evening “look sharp” meet-up with fielding Q&A
• 3 vertical clips/week featuring your stylists + match prep

I track QR/coupon redemptions and highlight your stylists on my clinic content.

Open to a quick chat Wednesday afternoon?

Best,
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! I’m a tennis pro at {{CLUB}} playing the {Tournament} swing. I want to run a “match ready” feature at {{BUSINESS_NAME}} — promo code + clips tagging you all. Want me to drop in with the plan?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}} — I run tennis clinics with 30–40 locals. I can funnel them into {{BUSINESS_NAME}} with a match-week promo + behind-the-scenes content. Got time this week to map it out?”`,
      followups: `D+3: “Quick bump—match-week bundle still open. We can test one Friday evening slot.”
D+7: “Sending the promo flyer mockup—ok to stop by tomorrow?”
D+14: “Happy to pencil this in for next month’s tournament if timing’s better.”`,
      proposal: `• 1 in-shop “match ready” event per month
• 5 vertical clips highlighting stylists & offers
• QR coupon tracking for redemptions
• Custom table tent + flyer for waiting area
• Appearance at community school career day`,
    },
    activationIdeas: [
      "Match-week grooming bundle with QR promo",
      "Friday evening Q&A in the shop",
      "Behind-the-scenes reels featuring stylists",
    ],
    offerMechanics: [
      "QR + coupon for players/fans",
      "Sign-up sheet for tournament-week appointments",
      "Geo-targeted IG boost with their account as collaborator",
    ],
  },
  {
    id: "car-wash",
    segment: "Car Wash",
    tier: "pro",
    headline: "Drive turn-ins during weekend tournaments.",
    bestFor: "Operators near clubs or highways with weekend footfall.",
    content: {
      email: `Subject: Weekend court-to-car promo
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} from {{CLUB}}. Each weekend we host 40+ players at tournaments and clinics nearby. I’d like to drive them to {{BUSINESS_NAME}} with:
• “Show your scoreboard” washing promo (same-day court booking → {{DISCOUNT}}% off)
• QR flyers at the club + my clinics
• 3 short clips featuring your detailing packages

I can prove redemptions via QR + code and deliver ready-to-post content.

Time for a 10-minute call tomorrow?

Thanks,
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! Tennis pro at {{CLUB}} here — we host weekend tournaments 5 minutes away. I can send drivers your way with a “scoreboard special” + QR flyers. Want me to swing by with the plan?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}} from {{CLUB}}. We’ve got tournament traffic this month and I want to funnel them to {{BUSINESS_NAME}} with a scoreboard discount + QR tracking. Can we book 15 minutes to walk through the flyer and metrics?”`,
      followups: `D+3: “Quick bump—scoreboard promo still open. One weekend test, fully tracked.”
D+7: “Sharing flyer + QR mockup. Ok if I drop by tomorrow?”
D+14: “No worries if timing’s off—we can target spring league starting next month.”`,
      proposal: `• 1 weekend promo per month with QR tracking
• 5 clips showing service before/after
• QR + code for redemptions and email capture
• Table tent for club lounge + signage at wash
• Presence at community clean-up / school event`,
    },
    activationIdeas: [
      "Scoreboard special with QR redemption",
      "On-site detailing demo at club lot",
      "Team travel wash bundle before road trips",
    ],
    offerMechanics: [
      "QR + unique coupon code shown at POS",
      "Flyers distributed at clinics and tournaments",
      "Email capture for monthly detailing reminders",
    ],
  },
  {
    id: "racket-shop",
    segment: "Racket Shop",
    tier: "pro",
    headline: "Create product demos and stringing activations in-store.",
    bestFor: "Shops looking to convert demo traffic into recurring clients.",
    content: {
      email: `Subject: On-court demos + QR sales for {{BUSINESS_NAME}}
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} at {{CLUB}}. Let’s host a monthly in-store demo + QR trial offer:
• “Stringing Saturday” with live racquet tune-ups (QR to {{OFFER_CODE}})
• 5 clips: on-court product testing + your shop walk-through
• Follow-up email to my 4,000 player list boosting your offers

Everything is tracked via QR and discount code redemption.

Can we lock a 15-min planning call this week?

Thanks!
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! Local player at {{CLUB}} here. I can run “Stringing Saturday” at {{BUSINESS_NAME}} with QR to trial offer + reels tagging you. Want details?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}}. I want to activate your shop with monthly demos + QR trials. Could we set a brief call to walk through the activation plan?”`,
      followups: `D+3: “Still keen to run a Stringing Saturday pilot—no contract, fully tracked.”
D+7: “Here’s the demo agenda + QR flyer mockup—ok to stop by tomorrow?”
D+14: “Happy to shift this to next month’s league kickoff if that timing is better.”`,
      proposal: `• 1 in-store demo or clinic per month
• 5 edited clips featuring gear + store experience
• QR + discount code for trial racquet/string packages
• Co-branded flyer for club bulletin boards
• Appearance at junior night or community event quarterly`,
    },
    activationIdeas: [
      "Stringing Saturday live demo",
      "Demo day with ball machine challenge",
      "Junior night racquet tech talk",
    ],
    offerMechanics: [
      "QR to trial package checkout",
      "Discount code for same-day stringing",
      "Email follow-up with equipment bundle",
    ],
  },
  {
    id: "college-academy",
    segment: "College/Academy",
    tier: "pro",
    headline: "Recruit and retain players via co-branded clinics.",
    bestFor: "Academies or colleges needing local visibility.",
    content: {
      email: `Subject: Co-branded tennis days for {{BUSINESS_NAME}}
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} competing on the ITF circuit while training at {{CLUB}}. I can help {{BUSINESS_NAME}} attract players through:
• Monthly co-branded “College tennis day” with clinics + Q&A
• QR signup funnel linking to your application visits
• Highlight reel + testimonial clips delivered each month

We track attendees, signups, and redeemed offers.

Could we book a 20-minute call next Tuesday?

All the best,
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! Local tour player here. I want to host a college tennis day with you—clinics + QR signup funnel to your programs. Free to chat?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}}. I can co-host recruitment clinics with QR lead capture + monthly content. Can we map it out on a quick call?”`,
      followups: `D+3: “Still excited to run a co-branded clinic pilot—one event, full tracking.”
D+7: “Attaching the clinic outline + QR funnel sketch—ok if I pop by?”
D+14: “Happy to align with your next open house—what week works best?”`,
      proposal: `• 1 co-branded clinic or info session per month
• 5 edited clips with coach and player testimonials
• QR signup to track campus visits / applications
• Co-branded flyer for high schools + clubs
• Appearance at one community college fair per quarter`,
    },
    activationIdeas: [
      "Co-branded clinic with Q&A",
      "Virtual recruiting webinar with QR signup",
      "Campus tour giveaway tied to clinic attendance",
    ],
    offerMechanics: [
      "QR to program interest form",
      "Coupon for free assessment session",
      "Email drip for attendees with deadlines",
    ],
  },
  {
    id: "real-estate",
    segment: "Real-Estate Agent",
    tier: "pro",
    headline: "Use tennis community events to fuel buyer/seller leads.",
    bestFor: "Agents looking for lifestyle-driven lead capture.",
    content: {
      email: `Subject: Showcase your listings with tennis community events
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} at {{CLUB}}. I can help {{BUSINESS_NAME}} reach tennis families with:
• Monthly “home court advantage” mixers at local clubs (QR → buyer/seller form)
• 5 lifestyle clips/month featuring your listings + tennis routines
• Quarterly community service event co-hosted with your team

All leads flow through QR & code so you can track conversions.

Free to chat later this week?

Thanks,
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! Local tennis player with access to 150+ families. I can host “home court advantage” mixers tied to your listings + capture leads via QR. Want the details?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}}. I can funnel tennis families into your pipeline with monthly mixers + QR lead capture. Have 15 minutes tomorrow?”`,
      followups: `D+3: “Quick bump—happy to run one mixer + QR landing page as a pilot.”
D+7: “Sending the activation outline—ok if I stop by with print samples?”
D+14: “No rush if timing’s off—should I target your next open house window?”`,
      proposal: `• 1 club mixer or open court activation per month
• 5 lifestyle clips highlighting listings + tennis routines
• QR + code on flyers to capture buyer/seller leads
• Co-branded flyer/table tent for clubhouses
• Appearance at community charity event quarterly`,
    },
    activationIdeas: [
      "Home court advantage mixer at local club",
      "Listing feature during clinic with QR to property page",
      "Community clean-up co-hosted with agent team",
    ],
    offerMechanics: [
      "QR leading to buyer/seller questionnaire",
      "Exclusive code for free home valuation",
      "Email follow-up sequence with property highlights",
    ],
  },
  {
    id: "credit-union",
    segment: "Credit Union",
    tier: "pro",
    headline: "Tie financial literacy to tennis clinics and schools.",
    bestFor: "Community-focused financial institutions.",
    content: {
      email: `Subject: Tennis clinics + financial literacy for {{BUSINESS_NAME}}
Hi {{CONTACT_FIRST}},

I’m {{PLAYER_NAME}} from {{CLUB}}. I can help {{BUSINESS_NAME}} engage families through:
• Quarterly “Serve & Save” clinics with your financial educators on-site
• QR signup to capture new account leads
• Monthly recap email + metric dashboard (redemptions, signups, clips delivered)

Can we grab 20 minutes next Wednesday to review the plan?

Best,
{{PLAYER_NAME}}`,
      dm: `Hey {{CONTACT_FIRST}}! Local tennis pro here. I run family clinics around {{CITY}}. I can plug in your credit union with “Serve & Save” clinics + QR lead capture. Free for a chat?`,
      call: `“Hi {{CONTACT_FIRST}}, it’s {{PLAYER_NAME}}. I’d love to run a Serve & Save clinic for your credit union—financial literacy + tennis drills. Everything tracked via QR. Could we schedule a quick call?”`,
      followups: `D+3: “Still open to a Serve & Save pilot—one clinic + QR account signup.”
D+7: “Attaching the clinic outline and sample dashboard—ok if I visit next week?”
D+14: “Happy to align with your next community push—any timing preferences?”`,
      proposal: `• 1 Serve & Save clinic per quarter with your educators
• 5 edited clips spotlighting financial tips + tennis drills
• QR + code tracking for new account signups
• Co-branded flyer for schools and clubs
• Appearance at one school assembly or community fair each quarter`,
    },
    activationIdeas: [
      "Serve & Save clinic at club or school",
      "Family financial literacy night with drills",
      "Scholarship giveaway tied to attendance",
    ],
    offerMechanics: [
      "QR to new account or consultation booking",
      "Promo code for waived fees",
      "Email nurture sequence for attendees",
    ],
  },
];

type OutreachKitsProps = {
  isPro: boolean;
  loading: boolean;
  activeSegment: string | null;
  onSegmentChange: (segment: string) => void;
  onCreateTask: (title: string, dueDate: string, prospectId?: string) => void;
  onCopy?: (text: string) => void;
};

function renderTextBlock(label: string, text: string) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{label}</div>
      <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        {text}
      </pre>
    </div>
  );
}

export function OutreachKits({ isPro, loading, activeSegment, onSegmentChange, onCreateTask, onCopy }: OutreachKitsProps) {
  const [activeChannel, setActiveChannel] = useState<OutreachChannel>("email");

  const selectedSegment = activeSegment ?? SEGMENTS[0];
  const template = useMemo(
    () => TEMPLATE_LIBRARY.find((item) => item.segment === selectedSegment) ?? TEMPLATE_LIBRARY[0],
    [selectedSegment],
  );

  const locked = template.tier === "pro" && !isPro && !loading;

  const handleCopy = (text: string) => {
    if (locked) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        onCopy?.(text);
      })
      .catch(() => undefined);
  };

  const createFollowUpTask = () => {
    if (locked) return;
    const dueDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    onCreateTask(`Follow up with ${template.segment}`, dueDate);
  };

  return (
    <section className="space-y-5">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Outreach kits
            </Badge>
            <CardTitle className="text-2xl">Activation-first messaging by segment</CardTitle>
            <CardDescription>
              Copy the language, send directly, and create quick follow-up tasks. All templates keep placeholders so you
              can personalize quickly.
            </CardDescription>
          </div>
          <Tabs value={selectedSegment} onValueChange={onSegmentChange} className="lg:w-[420px]">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              {SEGMENTS.map((segment) => (
                <TabsTrigger key={segment} value={segment} className="text-xs">
                  {segment}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={template.tier === "free" ? "default" : "secondary"}>{template.tier === "free" ? "Demo" : "Pro"}</Badge>
            <p className="font-medium">{template.headline}</p>
          </div>
          <p className="text-sm text-muted-foreground">{template.bestFor}</p>

          <Tabs value={activeChannel} onValueChange={(val) => setActiveChannel(val as OutreachChannel)}>
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="dm">DM</TabsTrigger>
              <TabsTrigger value="call">Call opener</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups</TabsTrigger>
              <TabsTrigger value="proposal">Proposal bullets</TabsTrigger>
            </TabsList>
            <TabsContent value="email">{renderTextBlock("Email (initial)", template.content.email)}</TabsContent>
            <TabsContent value="dm">{renderTextBlock("Direct message", template.content.dm)}</TabsContent>
            <TabsContent value="call">{renderTextBlock("Call opener", template.content.call)}</TabsContent>
            <TabsContent value="followups">
              {renderTextBlock("Follow-up cadence", template.content.followups)}
            </TabsContent>
            <TabsContent value="proposal">
              {renderTextBlock("Proposal bullets", template.content.proposal)}
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Activation ideas</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                {template.activationIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Offer mechanics</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                {template.offerMechanics.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          {locked ? (
            <Button asChild disabled={loading}>
              <UpgradeLink interval={"monthly"} source="gated_feature_outreach" className="inline-flex items-center gap-2">
                <Clipboard className="mr-2 h-4 w-4" /> Unlock & copy
              </UpgradeLink>
            </Button>
          ) : (
            <Button onClick={() => handleCopy(template.content[activeChannel])} disabled={loading}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy
            </Button>
          )}
          {locked ? (
            <Button asChild variant="outline" disabled={loading}>
              <UpgradeLink interval="monthly" source="gated_feature_outreach" className="inline-flex items-center gap-2">
                <Mail className="mr-2 h-4 w-4" /> Unlock email send
              </UpgradeLink>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                const mailto = `mailto:?subject=${encodeURIComponent(template.content.email.split("\n")[0].replace("Subject: ", ""))}&body=${encodeURIComponent(template.content.email.split("\n").slice(1).join("\n"))}`;
                window.location.href = mailto;
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send via email
            </Button>
          )}
          {locked ? (
            <Button asChild variant="outline" disabled={loading}>
              <UpgradeLink interval="monthly" source="gated_feature_outreach" className="inline-flex items-center gap-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Unlock follow-up tasks
              </UpgradeLink>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                createFollowUpTask();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create task: follow-up in 3 days
            </Button>
          )}
          {locked && (
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to unlock premium outreach kits and automation.
            </p>
          )}
        </CardFooter>
      </Card>
    </section>
  );
}

export default OutreachKits;
