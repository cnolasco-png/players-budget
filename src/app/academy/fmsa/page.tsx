import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Page() {
  const lessons = [
    { day: "Day 0", title: "Principles", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Season-first planning: budget, schedule, cash runway.</li>
        <li>Unit economics: cost per match, per point, per fan.</li>
        <li>Compounding habits: tracking, reviews, iteration.</li>
      </ul>
    )},
    { day: "Day 1", title: "Do", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Set your 12-month budget and 90-day sprint.</li>
        <li>Install daily tracking (income, expenses, training).</li>
        <li>Ship one fan-facing artifact this week.</li>
      </ul>
    )},
    { day: "Day 2", title: "Proof", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Define proof of work and proof of support.</li>
        <li>Publish your scoreboard and weekly recap.</li>
        <li>Collect testimonials and match clips.</li>
      </ul>
    )},
    { day: "Day 3", title: "Mindset", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Antifragile calendar: protect sleep, training, recovery.</li>
        <li>Nervous system hygiene: breath, walk, sunlight.</li>
        <li>Identity: you are a pro; act like one on and off court.</li>
      </ul>
    )},
    { day: "Day 4", title: "Systems", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Templates: pitches, recap, budget, travel checklist.</li>
        <li>Automations: calendar, finances, publishing.</li>
        <li>Review cadence: daily, weekly, monthly.</li>
      </ul>
    )},
    { day: "Day 5", title: "Scale", content: (
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Monetization ladders: free → paid → premium.</li>
        <li>Distribution: Discord, newsletter, sponsor CRM.</li>
        <li>Moats: community, proof, storytelling.</li>
      </ul>
    )},
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl px-4 py-10 text-center space-y-4">
          <h1>Financial Mindset Accelerator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Six-day sprint to master season-first tennis finance and fan monetization.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/financial-mindset-accelerator.pdf" className="inline-flex">
              <Button>Download PDF</Button>
            </a>
            <a href="/sponsors/tool" className="inline-flex">
              <Button variant="outline">Open Sponsors Tool</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {lessons.map((l, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{l.day}</span>
                    <span className="text-base font-semibold">{l.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{l.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Lesson Gate */}
        <LessonGate slug="fan-monetization" />
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">
        Powered by WolfPro · Player X
      </footer>
    </div>
  );
}

function LessonGate({ slug }: { slug: string }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fan Monetization</h2>
          <p className="text-sm text-muted-foreground">Unlock the premium lesson with your email.</p>
        </div>
        <a href="https://discord.com/invite/cCd5bByXrg" target="_blank" rel="noreferrer noopener" className="inline-flex">
          <Button variant="outline">Join Discord</Button>
        </a>
      </div>

      <form action="/api/waitlist" method="POST" className="flex flex-col gap-3 md:flex-row">
        <input type="hidden" name="slug" value={slug} />
        <Input name="email" type="email" placeholder="you@example.com" required className="md:max-w-sm" />
        <Button type="submit">Get Access</Button>
      </form>

      <p className="mt-3 text-xs text-muted-foreground">Powered by WolfPro · Player X</p>
    </Card>
  );
}
