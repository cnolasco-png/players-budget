"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, Lock } from "lucide-react";

function usePro() {
  // TODO: wire to real plan; for now, Free
  return { isPro: false as const, plan: "free" as const };
}

export default function SponsorsToolPage() {
  const { toast } = useToast();
  const { isPro } = usePro();

  const [checklist, setChecklist] = useState({
    outreachMessage: false,
    sponsorDeck: false,
    highlightsReel: false,
    testimonials: false,
    budgetReady: false,
  });

  const [proof, setProof] = useState({
    proofOfWork: false,
    proofOfSupport: false,
    socialProof: false,
  });

  const dmText = `Hey {Brand}, I'm a pro tennis player running a season-first program. I track every match, expense, and fan touchpoint. Would love to share a 1-pager and explore a light partnership this month. — {Your Name}`;

  const emailText = `Subject: 90-day partnership — {Your Name} x {Brand}\n\nHi {Brand Team},\n\nI’m building a season-first tennis program (budgeted, tracked, and reviewed). I can deliver weekly recap posts, sponsor mentions, and fan engagement in Discord.\n\nAttaching a 1-pager and a short highlights reel. Can we explore a low-lift 90-day pilot?\n\nThanks,\n{Your Name}`;

  const plan7Day = `7-day sponsor plan\nDay 1 — Shortlist 20 brands; draft one DM/email.\nDay 2 — Publish a 1-pager (PDF) and highlights clip.\nDay 3 — Send 10 DMs + 5 emails.\nDay 4 — Post weekly recap; tag brands you admire.\nDay 5 — Follow up to 5 warm replies; book 2 calls.\nDay 6 — Draft 2 pilot ideas (deliverables, price).\nDay 7 — Close 1 pilot; announce on socials.`;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
    } catch (e) {
      toast({ title: "Copy failed", description: "Clipboard is unavailable.", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl px-4 py-10 text-center space-y-4">
          <h1>Sponsors Tool</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Practical outreach kit with copy, checklist, and proof signals.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/sponsor-tool.pdf" className="inline-flex"><Button>Download PDF</Button></a>
            <Button variant="outline" onClick={() => copy(dmText, "DM template")}><Copy className="mr-1" /> Copy DM</Button>
            <Button variant="outline" onClick={() => copy(emailText, "Email template")}><Copy className="mr-1" /> Copy Email</Button>
            <Button variant="gold" onClick={() => copy(plan7Day, "7-day plan")}><Copy className="mr-1" /> Copy 7-day plan</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Get discovered</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="https://www.levanta.io/" target="_blank" rel="noreferrer noopener" className="inline-flex"><Button variant="outline">Levanta</Button></a>
            <a href="https://joinbrands.com/" target="_blank" rel="noreferrer noopener" className="inline-flex"><Button variant="outline">JoinBrands</Button></a>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Player X marketplace — coming soon.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact checklist</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow
              id="outreachMessage"
              label="Outreach message ready"
              checked={checklist.outreachMessage}
              onChange={(v) => setChecklist((s) => ({ ...s, outreachMessage: v }))}
            />
            <ToggleRow
              id="sponsorDeck"
              label="Sponsor 1-pager / deck"
              checked={checklist.sponsorDeck}
              onChange={(v) => setChecklist((s) => ({ ...s, sponsorDeck: v }))}
            />
            <ToggleRow
              id="highlightsReel"
              label="Highlights clip (30–60s)"
              checked={checklist.highlightsReel}
              onChange={(v) => setChecklist((s) => ({ ...s, highlightsReel: v }))}
            />
            <ToggleRow
              id="testimonials"
              label="Testimonials / quotes"
              checked={checklist.testimonials}
              onChange={(v) => setChecklist((s) => ({ ...s, testimonials: v }))}
            />
            <ToggleRow
              id="budgetReady"
              label="Budget & deliverables"
              checked={checklist.budgetReady}
              onChange={(v) => setChecklist((s) => ({ ...s, budgetReady: v }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Proof signals</h2>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow id="pow" label="Proof of work" checked={proof.proofOfWork} onChange={(v) => setProof((s) => ({ ...s, proofOfWork: v }))} />
            <ToggleRow id="pos" label="Proof of support" checked={proof.proofOfSupport} onChange={(v) => setProof((s) => ({ ...s, proofOfSupport: v }))} />
            <ToggleRow id="sp" label="Social proof" checked={proof.socialProof} onChange={(v) => setProof((s) => ({ ...s, socialProof: v }))} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Toggles are local-only for now.</p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Personalize PDF</h2>
              <p className="text-sm text-muted-foreground">Upload logo/colors to auto-brand your sponsor deck.</p>
            </div>
            {!isPro && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-4 w-4" /> Pro</span>
            )}
          </div>
          <Button disabled={!isPro}>Start personalization</Button>
          {!isPro && <p className="mt-2 text-xs text-muted-foreground">Upgrade to Pro to enable.</p>}
        </Card>
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">Powered by WolfPro · Player X</footer>
    </div>
  );
}

function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
