import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Check, Clock3, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import UpgradeLink from "@/components/UpgradeLink";
import SocialProofStrip from "@/components/social/SocialProofStrip";
import TestimonialsCarousel from "@/components/social/TestimonialsCarousel";
import ProofMasonry from "@/components/social/ProofMasonry";
import { useHomepageSocialProof } from "@/hooks/useHomepageSocialProof";
import { useFeatureFlag } from "@/components/providers/FeatureFlagProvider";

const pricingCopy = {
  monthly: { amount: 2.99, label: "$2.99", suffix: "/month", tagline: "Cancel anytime" },
  yearly: { amount: 29.99, label: "$29.99", suffix: "/year", tagline: "Best value • Save 16%" },
} as const;

const YEARLY_SAVINGS_PERCENT = Math.round(
  ((pricingCopy.monthly.amount * 12 - pricingCopy.yearly.amount) / (pricingCopy.monthly.amount * 12)) * 100,
);

const freeFeatures = [
  "Budget builder & season overview",
  "Standard travel + coaching scenario",
  "Community support & templates",
];

const proPerks = [
  "Unlimited budgets, scenarios, and sandboxes",
  "Sponsor decks, outreach kits, and QR analytics",
  "Receipt scanning with instant expense sync",
  "PDF exports, share links, and priority support",
];

const featureMatrix = [
  {
    label: "Budgets & seasons",
    description: "Plan multiple seasons or teams side-by-side with version history.",
    free: "1 active budget",
    pro: "Unlimited budgets & multi-season history",
  },
  {
    label: "Scenario planning",
    description: "Compare travel, coaching, stringing, and contingency assumptions instantly.",
    free: "Standard template",
    pro: "Lean / Standard / Premium toggles + sandbox",
  },
  {
    label: "Expense capture",
    description: "Keep the numbers honest while you travel from tournament to tournament.",
    free: "Manual entry",
    pro: "Mobile quick-add + OCR receipt scanner",
  },
  {
    label: "Sponsor tooling",
    description: "Give partners the activation playbook they need to say yes.",
    free: "Preview sponsor deck",
    pro: "Full deck + outreach templates & activation tracker",
  },
  {
    label: "Exports & sharing",
    description: "Send budgets to parents, investors, or coaches in a click.",
    free: "CSV download",
    pro: "PDF exports & shareable sponsor link",
  },
  {
    label: "Support & community",
    description: "Get unstuck fast with tennis operators who speak your language.",
    free: "Community forum",
    pro: "Priority support + office hours & playbook drops",
  },
];

const previewPoints: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Show funding gap instantly",
    description: "Flip between Lean, Standard, and Premium scenarios to highlight the gap every sponsor cares about.",
    icon: BarChart3,
  },
  {
    title: "Track costs on the road",
    description: "Snap a photo of the receipt, log mileage, and keep every expense aligned to your active budget.",
    icon: Clock3,
  },
  {
    title: "Export polished sponsor decks",
    description: "Generate outreach kits with offer tiers, activation ideas, QR codes, and audience metrics in minutes.",
    icon: ScrollText,
  },
];

const faqItems = [
  {
    question: "Can I stay on the free plan?",
    answer:
      "Yes. The free plan includes the core budget builder, one active season, CSV exports, and community support. Upgrade whenever you need sponsor tooling or advanced automations.",
  },
  {
    question: "What happens after I upgrade?",
    answer:
      "You'll hop into Stripe checkout. As soon as the payment completes, your workspace unlocks sponsor decks, outreach kits, OCR receipt capture, PDF exports, and upcoming fan monetization modules.",
  },
  {
    question: "Can I cancel or switch plans anytime?",
    answer:
      "Absolutely. Billing is handled through Stripe's customer portal. You can pause, cancel, or switch between monthly and annual plans in a couple of clicks.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If Player’s Budget Pro doesn’t fit, email support within 7 days of upgrading for a full refund. Annual plans are pro-rated if you downgrade mid-year.",
  },
  {
    question: "Is the sponsor deck really included?",
    answer:
      "Yes—the Pro plan includes the full sponsor deck generator, outreach templates, activation planner, and analytics dashboards. No upsells, no add-ons.",
  },
];

const Pricing = () => {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const { feedback, stats } = useHomepageSocialProof();
  const blurVariant = useFeatureFlag("homepage_blur_unlock", "A") === "B";

  const price = pricingCopy[interval];
  const annualEquivalent = pricingCopy.yearly.amount / 12;

  const proofItems = useMemo(
    () =>
      feedback.slice(0, 6).map((item, index) => ({
        id: item.id,
        quote: item.quote,
        org: item.org,
        attendees: 48 - index * 4,
        qrScans: 30 - index * 3,
        redemptions: 18 - index * 2,
        signups: 12 - index,
        media_url: item.media_url,
      })),
    [feedback],
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden gradient-hero px-4 py-20">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
            <Sparkles className="h-4 w-4 text-emerald-100" />
            Built for touring players and high-performance juniors
          </div>
          <div className="space-y-4 text-white">
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Land sponsors faster. Run your season like a business.
            </h1>
            <p className="mx-auto max-w-3xl text-base sm:text-lg text-emerald-50/90">
              Player’s Budget Pro combines financial planning, sponsor tooling, and on-the-road tracking so you can
              stay funded, stay organized, and stay focused on winning matches.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <div className="inline-flex rounded-full bg-white/10 p-1">
              {(["monthly", "yearly"] as const).map((option) => {
                const active = interval === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInterval(option)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                      active ? "bg-white text-emerald-800 shadow-lg" : "text-emerald-100 hover:bg-white/10"
                    }`}
                  >
                    {option === "monthly" ? "Monthly" : "Annual"}
                  </button>
                );
              })}
            </div>
            <span className="text-sm text-emerald-100/90">
              {interval === "yearly" ? `Save ${YEARLY_SAVINGS_PERCENT}% vs paying monthly` : "No risk – cancel anytime"}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-5xl font-bold text-white">
              {price.label}
              <span className="ml-2 text-2xl font-semibold text-emerald-100">{price.suffix}</span>
            </p>
            <p className="text-sm text-emerald-100/90">
              {interval === "yearly"
                ? `Works out to ~$${annualEquivalent.toFixed(2)}/month • Billed annually`
                : "Billed monthly • Pause or cancel anytime"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white/10 text-white shadow-lg backdrop-blur hover:bg-white/20"
            >
              <Link to="/auth">Start Free</Link>
            </Button>
            <UpgradeLink asChild interval={interval} source={`pricing_hero_${interval}`}>
              <Button size="lg" variant="gold" className="shadow-lg">
                Upgrade to Pro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </UpgradeLink>
          </div>
          <p className="text-xs text-emerald-100/80">Secure checkout with Stripe • No onboarding fees • Switch plans anytime</p>
        </div>
      </section>

      <section className="px-4 -mt-10 pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-emerald-200/40 bg-background/95 shadow-sm backdrop-blur">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-emerald-200 text-emerald-700">
                  Free plan
                </Badge>
                <CardTitle className="text-2xl font-semibold">Player&apos;s Budget</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Start planning your season today with the core budgeting toolkit.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-emerald-700">
                  $0
                  <span className="ml-1 text-base font-medium text-muted-foreground">forever</span>
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-700" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Start Free</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-emerald-400 bg-card/95 shadow-xl backdrop-blur">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-400 text-emerald-700">
                    Pro
                  </Badge>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Most popular
                  </span>
                </div>
                <CardTitle className="text-2xl font-semibold">Player&apos;s Budget Pro</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Unlock sponsor tooling, advanced automations, and rapid reporting.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-4xl font-bold text-emerald-700">
                    {price.label}
                    <span className="ml-1 text-lg font-semibold text-muted-foreground">{price.suffix}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interval === "yearly"
                      ? `Billed annually • Save ${YEARLY_SAVINGS_PERCENT}% vs monthly`
                      : "Billed monthly • Cancel anytime"}
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {proPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/10">
                        <Check className="h-3 w-3 text-emerald-700" />
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  7-day refund if it&apos;s not a fit.
                </div>
              </CardContent>
              <CardFooter>
                <UpgradeLink asChild interval={interval} source={`pricing_card_pro_${interval}`}>
                  <Button size="lg" className="w-full" variant="gold">
                    Unlock Pro features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </UpgradeLink>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 px-4 py-16">
        <div className="container mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.1fr,1fr] lg:items-center">
          <div className="relative flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-white/80 p-6 shadow-lg backdrop-blur lg:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-700">Pro workspace preview</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Live data
              </Badge>
            </div>
            <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500 p-6 text-white shadow-inner">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Sponsor snapshot</p>
              <p className="mt-2 text-3xl font-semibold">$42,780 funding gap</p>
              <p className="text-sm text-emerald-100/85">Lean plan vs confirmed commitments</p>
              <Separator className="my-4 border-emerald-300/40" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-emerald-100/80">Next steps</p>
                  <p className="font-semibold text-white">Pilot sponsor deck</p>
                </div>
                <div>
                  <p className="text-emerald-100/80">Campaign goal</p>
                  <p className="font-semibold text-white">$12k Q1 activation</p>
                </div>
                <div>
                  <p className="text-emerald-100/80">QR scans</p>
                  <p className="font-semibold text-white">318 unique scans</p>
                </div>
                <div>
                  <p className="text-emerald-100/80">Fan conversions</p>
                  <p className="font-semibold text-white">74 email signups</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Share private sponsor links, refresh activation metrics live, and embed proof from recent events—without
              touching a spreadsheet.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-foreground">Everything sponsors want to see in one click.</h2>
            <p className="text-base text-muted-foreground">
              Pro members get the activation toolkit that closes deals: sponsor decks, outreach kits, follow-up scripts,
              QR analytics, and structured offers tailored to your market.
            </p>
            <div className="space-y-5">
              {previewPoints.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-foreground">Feature breakdown</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Compare plan levels at a glance. Upgrade when you need the sponsor toolkit and automation perks.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-card shadow">
            <div className="grid grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr)] gap-4 bg-emerald-50/60 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center">Pro</span>
            </div>
            {featureMatrix.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr)] gap-4 px-6 py-5 text-sm ${
                  index !== 0 ? "border-t border-emerald-100" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{row.label}</p>
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                </div>
                <div className="self-center text-center text-muted-foreground">{row.free}</div>
                <div className="self-center text-center font-semibold text-emerald-700">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats && (
        <section className="px-4 pb-16">
          <SocialProofStrip
            stats={{
              total_attendees: stats.total_activations ?? 2200,
              total_qr_scans: stats.total_qr_scans ?? 1350,
              avg_time_to_first_sponsor: stats.avg_time_to_first_sponsor ?? 17,
            }}
          />
        </section>
      )}

      {feedback.length > 0 && (
        <section className="px-4 pb-16">
          <div className="container mx-auto max-w-6xl space-y-10">
            <TestimonialsCarousel testimonials={feedback} />
            <ProofMasonry items={proofItems} blurVariant={blurVariant} />
          </div>
        </section>
      )}

      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-4xl space-y-6 text-center">
          <h2 className="text-3xl font-semibold text-foreground">Frequently asked questions</h2>
          <p className="text-base text-muted-foreground">
            Still deciding? Here are the most common questions from players and coaches upgrading to Pro.
          </p>
          <Accordion type="single" collapsible className="w-full space-y-4 text-left">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="overflow-hidden rounded-xl border border-border/60 bg-card/95 backdrop-blur"
              >
                <AccordionTrigger className="px-6 py-4 text-left text-base font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-semibold text-foreground">Ready to unlock Player&apos;s Budget Pro?</h2>
          <p className="text-base text-muted-foreground">
            Join hundreds of players who plan smarter seasons, close more sponsors, and stay profitable on tour.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/auth">Start Free</Link>
            </Button>
            <UpgradeLink asChild interval={interval} source={`pricing_footer_${interval}`}>
              <Button size="lg" variant="gold" className="shadow-lg">
                Upgrade to Pro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </UpgradeLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
