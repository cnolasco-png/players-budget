import { useState } from "react";
import { useModuleGate } from "@/hooks/useModuleGate";

function Lesson({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl mb-3">
      <button className="w-full text-left p-4 font-medium" onClick={()=>setOpen(!open)}>{title}</button>
      {open && <div className="p-4 pt-0 text-sm">{children}</div>}
    </div>
  );
}

export default function AcademyFMSA() {
  const gate = useModuleGate("fan-monetization");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Financial Mindset & Strategy Accelerator</h1>
        <p className="text-sm text-muted-foreground">One week to plan your season, control spend, and show sponsor-ready proof.</p>
        <div className="mt-3 flex gap-2">
          <a
            className="btn btn-primary"
            href="/financial-mindset-accelerator.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download workbook
          </a>
          <a className="btn" href="/sponsors/tool">Open Sponsor Tool</a>
        </div>
      </header>

      <Lesson title="Day 0 — Baseline & Setup">Clarity beats optimism. Create Season, add trips, set caps.</Lesson>
      <Lesson title="Day 1 — Season Math (Funding Gap)">Funding Gap & runway; export Season PDF.</Lesson>
      <Lesson title="Day 2 — Envelopes & Daily Allowance">Turn caps to daily allowance; log 3 expenses.</Lesson>
      <Lesson title="Day 3 — Income (Prize, Sponsors, Clinics)">Make income a routine, not a miracle.</Lesson>
      <Lesson title="Day 4 — Sponsor Engine">Download deck; send 10 DMs + 5 emails; log replies.</Lesson>
      <Lesson title="Day 5 — Review & Monthly Recap">Generate Month Recap; 3 adjustments.</Lesson>

      <div className="mt-6 border rounded-xl p-4">
        <h3 className="font-medium">Fan Monetization (Mentorship, Hitting, Match Analysis)</h3>
        {gate.loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : gate.locked ? (
          <div className="text-sm">
            <div className="inline-block px-2 py-1 bg-yellow-100 rounded mb-2">{gate.reason === "pro_required" ? "Pro required" : "Coming soon"}</div>
            <p className="mb-2">Turn 100–200 true fans into predictable income with Player X (powered by WolfPro).</p>
            <form method="post" action="/api/waitlist" onSubmit={(e)=>{e.preventDefault(); fetch("/api/waitlist",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({ moduleSlug:"fan-monetization", email:(e.currentTarget as any).email.value })}).then(()=>alert("We’ll notify you at launch."));}}>
              <input className="input mr-2" name="email" type="email" required placeholder="you@email.com" />
              <button className="btn" type="submit">Notify me</button>
            </form>
            <a className="btn mt-2" href="https://discord.gg/" target="_blank">Join Discord</a>
            <p className="mt-2 text-xs text-muted-foreground">Powered by WolfPro · Player X</p>
          </div>
        ) : (
          <div>/* Unlocked content TBD */</div>
        )}
      </div>
    </div>
  );
}
