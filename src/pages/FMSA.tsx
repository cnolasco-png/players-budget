import { Fragment } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppTopBar } from "@/components/layout/AppTopBar";

type RichSection = {
  title: string;
  body: React.ReactNode;
};

const summarySections: RichSection[] = [
  {
    title: "Purpose",
    body: (
      <p>
        Transform how tennis players think about money and build the systems to thrive on tour and afterwards—no matter
        where they live or compete.
      </p>
    ),
  },
  {
    title: "Format",
    body: (
      <p>
        6 days of deep-dive modules with lessons, drills, in-app actions (for the Player Budget App), templates, and
        deliverables. Expect roughly 60–90 minutes per day.
      </p>
    ),
  },
];

const requiredTools = [
  "Accounts & categories",
  "Receipt inbox",
  "Mileage / meal / per-diem trackers",
  "FX (currency) toggle",
  "Tournament planner",
  "Sponsor & clinic income trackers",
  "Invoice generator",
  "Goal & KPI dashboard",
];

const mindsetBeliefs = [
  {
    unhelpful: "If I don’t travel every week, I’m falling behind.",
    reframe: "I’m a professional operator; I play schedules that clear my ROI and runway rules.",
  },
  {
    unhelpful: "Clinics mean I’m not a real pro.",
    reframe: "Clinics fund performance blocks and extend runway — that’s pro behavior.",
  },
  {
    unhelpful: "I’ll save when I make more.",
    reframe: "Pay Future-Me first (automate 10–12%) regardless of income swings.",
  },
  {
    helpful: "A good No-Go is a win if it protects the season.",
  },
  {
    helpful: "I track by country and currency; what gets measured improves.",
  },
];

const stressTriggers = [
  {
    trigger: "Low cash before a trip",
    response: "Run Go/No-Go with EV + runway floors; add a clinic or delay a week.",
  },
  {
    trigger: "Unexpected expense (injury, lost bag)",
    response: "Use contingency line (7–10%); claim insurance; switch to host housing.",
  },
  {
    trigger: "FX shock",
    response: "Quote with 3–5% buffer; keep a multi-currency account; settle in stronger currency when possible.",
  },
  {
    trigger: "Visa/work permit uncertainty",
    response: "Create a document pack (invitation letter, waiver, policy copies) 2 weeks before travel.",
  },
];

const dayModules = [
  {
    id: "day1",
    label: "Day 1",
    title: "Identity, Vision & Money Rules",
    outcome: "Align identity with long-term wealth behaviors; define success beyond ranking.",
    lesson: (
      <div className="space-y-4">
        <p>
          <strong>Identity first.</strong> You’re a walking asset, not just a player. Assets run playbooks and manage
          risk. Your racquet arm is one asset; your systems (budget, runway, ROI rules, sponsor pipeline) are the
          compounding assets that keep you on tour when results swing.
        </p>
        <p>
          <strong>North Star → 3-year vision → KPIs.</strong> Write a short 3-year vision across sport, wealth,
          relationships, contribution and translate it into 12-month financial KPIs. A vision without numbers is a wish.
        </p>
        <div className="space-y-2">
          <p className="font-semibold">Money Rules (portable, global)</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>Pay Future-You first.</strong> Set auto-transfers from an Income Hub account into Emergency,
              Taxes, Investing, and Season Capital envelopes before money hits your spending card.
            </li>
            <li>
              <strong>Separate season capital from life expenses.</strong> Two buckets, two cards, zero mixing.
            </li>
            <li>
              <strong>Never travel without a pre-calculated runway and exit plan.</strong> Set floors: Green ≥ 6 mo,
              Yellow 3–6, Red &lt; 3. Write the actions you’ll take when you hit each band.
            </li>
            <li>
              <strong>Play events that clear your ROI rule.</strong> Protect your runway; a good No-Go is a win.
            </li>
            <li>
              <strong>Keep clean books weekly.</strong> The Friday Finance Ritual protects your season.
            </li>
          </ol>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="font-semibold">Friday Finance Ritual (Player Budget App)</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Confirm multi-currency balances</li>
            <li>Categorize new transactions and attach receipts</li>
            <li>Tag income and auto-route percentages</li>
            <li>Review budget vs. actuals by tournament/month</li>
            <li>Check runway widget (trigger actions if Yellow/Red)</li>
            <li>Review KPI dashboard: Saving %, Burn Rate, Runway, Avg Tournament ROI, % Sponsors/Clinics, Tax %</li>
            <li>Note 3 lessons; export PDF snapshot monthly</li>
          </ul>
        </div>
      </div>
    ),
    drills: (
      <ol className="list-decimal space-y-4 pl-6">
        <li>
          <strong>Vision → Numbers.</strong> Convert your vision into 12-month targets (Saving %, Emergency Fund months,
          Education budget, Season Capital, % income from non-tournament sources). Plan conservatively by assuming 50%
          income and 150% costs.
        </li>
        <li>
          <strong>Belief Reframe → Action Mantras.</strong> Rewrite three unhelpful beliefs into binary action rules.
        </li>
      </ol>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Create a KPI dashboard (Saving %, Burn Rate, Runway, Avg ROI, % Sponsors/Clinics, Tax Provision).</li>
        <li>Turn on daily “Check Accounts” and weekly “Friday Finance Ritual” notifications.</li>
      </ul>
    ),
    deliverables: (
      <div className="space-y-4">
        <div>
          <p className="font-semibold">A) 3-Year Vision (≈150 words)</p>
          <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
            [ Your 3-Year Vision — 150 words ]
          </div>
        </div>
        <div>
          <p className="font-semibold">B) 12-Month KPI Targets</p>
          <ul className="space-y-1 text-sm">
            <li>Saving %: ______</li>
            <li>Emergency Fund months: ______</li>
            <li>Education / Up-skill budget: ______</li>
            <li>Season Capital target: ______</li>
            <li>% income from Sponsors/Clinics: ______</li>
            <li>Tax Provision %: ______</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">C) Personal Money Rules (5–7 lines)</p>
          <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index}>{`${index + 1})`}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "day2",
    label: "Day 2",
    title: "Income Engine & Opportunity Map",
    outcome: "Design a diversified income stack so you’re not at the mercy of one tournament or one country.",
    lesson: (
      <div className="space-y-4">
        <p>
          <strong>Core streams:</strong> Prize money, team/league tennis, federation grants, sponsors/affiliates,
          clinics/camps, appearances/exhibitions, match analysis/content, and coaching during off-weeks.
        </p>
        <p>
          <strong>Earnings ladder:</strong> Calibrate offers by your competitive bracket (ITF 15/25, Challenger,
          ATP/WTA 100–250, Top 50). Higher tiers bring larger retainers, licensing, and equity deals.
        </p>
        <div className="space-y-2">
          <p className="font-semibold">Pricing strategy</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Define your floor (time cost + travel + scarcity) and ceiling (proof, outcomes, audience, windows).</li>
            <li>Quote in home and tour currencies; build a 3–5% FX buffer.</li>
            <li>Bundle deliverables (clinic + content) for premium pricing.</li>
            <li>Respect compliance: anti-corruption rules, visa/work permits, tax invoices, amateur status.</li>
          </ul>
        </div>
      </div>
    ),
    drills: (
      <div className="space-y-6">
        <div>
          <p className="font-semibold">1) Opportunity Matrix</p>
          <p className="text-sm text-muted-foreground">
            Score ideas by impact, effort, and timeline. Activate three quick wins that don’t compromise training.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {[
                    "Idea",
                    "Impact (1–5)",
                    "Effort (1–5)",
                    "Days to launch",
                    "Score",
                    "Cost",
                    "Gross",
                    "Net",
                    "Next action",
                    "Owner",
                    "Due date",
                  ].map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2">
                    Example: 2-hr off-day clinic with Club A
                  </td>
                  <td className="px-3 py-2">4</td>
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2">10</td>
                  <td className="px-3 py-2">2.4</td>
                  <td className="px-3 py-2">$80</td>
                  <td className="px-3 py-2">$630</td>
                  <td className="px-3 py-2">$540</td>
                  <td className="px-3 py-2">DM club manager w/ dates</td>
                  <td className="px-3 py-2">Me</td>
                  <td className="px-3 py-2">2025-11-03</td>
                </tr>
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-t">
                    {Array.from({ length: 11 }).map((_column, columnIndex) => (
                      <td key={columnIndex} className="px-3 py-2">
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="font-semibold">2) Rate Card (home + tour currencies with FX buffer)</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {[
                    "Offer",
                    "Scope / Deliverables",
                    "Home Currency",
                    "Tour Currency",
                    "FX Buffer %",
                    "Floor",
                    "Standard",
                    "Peak-window",
                    "Notes",
                  ].map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Clinic", "Sponsor Reel", "In-store Appearance", "Match Analysis", "Team/League Night"].map((offer) => (
                  <tr key={offer} className="border-t">
                    <td className="px-3 py-2 font-medium">{offer}</td>
                    {Array.from({ length: 8 }).map((_column, index) => (
                      <td key={index} className="px-3 py-2">
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="font-semibold">3) Sponsor Fit Map (20 local SMEs near next 3 events)</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {[
                    "Event / City",
                    "Business Name",
                    "Category",
                    "Audience Overlap",
                    "Offer Type",
                    "Value Proposition",
                    "Deliverables",
                    "Price",
                    "Contact",
                    "Next Action",
                    "Date",
                  ].map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2">W25 Prague</td>
                  <td className="px-3 py-2">Racket Shop X</td>
                  <td className="px-3 py-2">Retail</td>
                  <td className="px-3 py-2">High (players)</td>
                  <td className="px-3 py-2">Content + Appearance</td>
                  <td className="px-3 py-2">Drive demo day traffic</td>
                  <td className="px-3 py-2">1 reel + 10 stories + 2-hr in-store</td>
                  <td className="px-3 py-2">€___</td>
                  <td className="px-3 py-2">owner@…</td>
                  <td className="px-3 py-2">Email pitch v1</td>
                  <td className="px-3 py-2">2025-11-02</td>
                </tr>
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-t">
                    {Array.from({ length: 11 }).map((_col, columnIndex) => (
                      <td key={columnIndex} className="px-3 py-2">
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Enable income streams in-app for sponsors, clinics, team tennis, prize money, and digital products.
        </li>
        <li>Build the rate card table with multi-currency toggle and FX buffer presets.</li>
        <li>
          Upgrade to Pro to unlock the Sponsor Accelerator CRM for pipelines, follow-ups, and lead scoring (recommended).
        </li>
      </ul>
    ),
    deliverables: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Signed-off rate card PDF with branding, rates, usage rights, FX buffer note, and cancellation terms.</li>
        <li>30-lead opportunity list (Sponsor Accelerator auto-scores and exports).</li>
        <li>Proof of action: one sponsor outreach sent and one clinic date booked.</li>
      </ul>
    ),
  },
  {
    id: "day3",
    label: "Day 3",
    title: "Cost Architecture & Tour Budget",
    outcome: "Know exactly what it costs to compete well in each region and travel mode.",
    lesson: (
      <div className="space-y-4">
        <p>
          Separate fixed (housing, phone, insurance) from variable (flights, meals, stringing, physio). Build regional
          cost profiles and apply spend-to-save heuristics (book early, cook 2 meals/day, share housing, bundle string
          reels, add clinics to offset costs).
        </p>
      </div>
    ),
    drills: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Per-tournament budget builder (flights, housing, meals, ground, stringing, support team, entries, misc).</li>
        <li>Season budget across aggressive/optimal/conservative schedules.</li>
        <li>Negotiation scripts for partner hotels, practice courts, apartments, and bundled clinics.</li>
      </ul>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Install the Tournament Budget template with regional presets.</li>
        <li>Turn on the receipt inbox and category rules.</li>
        <li>Create a vendor directory (stringer, physio, drivers, apartments) per city.</li>
      </ul>
    ),
    deliverables: (
      <ul className="list-disc space-y-2 pl-5">
        <li>One approved season budget (by quarter).</li>
        <li>Three tournament budget templates saved for the next swing.</li>
        <li>Vendor directory entries for the next three stops.</li>
      </ul>
    ),
  },
  {
    id: "day4",
    label: "Day 4",
    title: "Cashflow, Runway & Tournament ROI Rules",
    outcome: "Install decision systems that protect your downside and compound your upside.",
    lesson: (
      <div className="space-y-4">
        <p>
          Bucket income into Season Capital, Living Costs, Taxes, Emergency, Growth/Coaching, and Long-term Investing.
          Calculate runway (Season Capital ÷ Burn Rate). Build tournament ROI models with realistic probabilities and
          opportunity costs. Only schedule events that meet your ROI threshold while keeping runway above your floor.
        </p>
      </div>
    ),
    drills: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Zero-based month: allocate every currency unit before the month starts.</li>
        <li>Runway floors with yellow/red alarms.</li>
        <li>ROI builder: simulate 10 schedules using historical win rates and choose the top two.</li>
      </ul>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Create envelopes and auto-rules (e.g., 10% to Emergency until 3 months, then 5%).</li>
        <li>Turn on runway alerts.</li>
        <li>Save the Tournament ROI model and pin it to your dashboard.</li>
      </ul>
    ),
    deliverables: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Signed runway policy with minimum months and trigger actions.</li>
        <li>Two approved schedules from simulations (with expected net).</li>
        <li>One-page operating manual for cash management (instructions when hitting yellow/red).</li>
      </ul>
    ),
  },
  {
    id: "day5",
    label: "Day 5",
    title: "Risk, Tax, Compliance & Protection (Global)",
    outcome: "Reduce avoidable surprises across borders.",
    lesson: (
      <div className="space-y-4">
        <p>
          Understand residency vs. source taxation, keep clean invoices, track days/income per country, and respect
          compliance (anti-corruption, doping, visas). Review insurance gaps (health, travel, liability, equipment,
          disability) and manage payments/FX with multi-currency accounts.
        </p>
      </div>
    ),
    drills: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Country Footprint Map (top 6 countries with tax/withholding/visa notes).</li>
        <li>Insurance gap check (what’s covered vs. missing).</li>
        <li>Document vault (passport, visas, letters, policies).</li>
      </ul>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Turn on the Country Log (days and income by jurisdiction).</li>
        <li>Add Tax Provision % to the KPI dashboard.</li>
        <li>Upload policy documents to your Vault and set renewal reminders.</li>
      </ul>
    ),
    deliverables: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Country Footprint Map one-pager.</li>
        <li>Insurance checklist completed.</li>
        <li>Tax Diary populated with the past 60 days.</li>
      </ul>
    ),
  },
  {
    id: "day6",
    label: "Day 6",
    title: "Investing, Wealth Plan & Post-Career Arc",
    outcome: "Set the compounding flywheel now, not later.",
    lesson: (
      <div className="space-y-4">
        <p>
          Pay yourself first, use broad-market instruments, and keep human capital compounding (certifications, media,
          entrepreneurship). Build post-career options while you play—your goal is to be exit-optional at any point.
        </p>
      </div>
    ),
    drills: (
      <ul className="list-disc space-y-2 pl-5">
        <li>12-month wealth plan (savings %, investing %, education budget, debt payoff).</li>
        <li>Brand asset map (content/products you can ship in 30–90 days).</li>
        <li>Exit-optional plan (income mix if competition paused for 6 months).</li>
      </ul>
    ),
    actions: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Set auto-transfers by income stream.</li>
        <li>Add an education budget envelope.</li>
        <li>Activate the net worth tracker by currency.</li>
      </ul>
    ),
    deliverables: (
      <ul className="list-disc space-y-2 pl-5">
        <li>12-month wealth plan PDF.</li>
        <li>90-day action roadmap (3 tasks per month).</li>
        <li>Personal brand mini one-pager.</li>
      </ul>
    ),
  },
];

const appendices: RichSection[] = [
  {
    title: "Capstone & Certification",
    body: (
      <div className="space-y-2">
        <p>
          Submit the capstone package: (1) Season Budget, (2) Tournament ROI model, (3) Runway Policy, (4) Insurance
          checklist, and (5) 12-Month Wealth Plan. Certification unlocks a badge inside your app profile once all assets
          are approved.
        </p>
      </div>
    ),
  },
  {
    title: "KPI Glossary (Plain Language)",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Burn Rate:</strong> Average monthly cash outflow (tour + life).
        </li>
        <li>
          <strong>Runway (months):</strong> Season Capital ÷ Burn Rate.
        </li>
        <li>
          <strong>Tournament ROI:</strong> (Expected Net Income − Total Costs) ÷ Total Costs.
        </li>
        <li>
          <strong>Tax Provision %:</strong> Share of income set aside for taxes.
        </li>
        <li>
          <strong>Net Worth:</strong> Assets − Liabilities by currency.
        </li>
      </ul>
    ),
  },
  {
    title: "Spreadsheets / Model Blueprints",
    body: (
      <ol className="list-decimal space-y-1 pl-6">
        <li>Tournament Budget template (event metadata, costs, ROI).</li>
        <li>Season Budget roll-up by quarter.</li>
        <li>Tournament ROI simulator using historical win rates and fatigue adjustments.</li>
        <li>Income tracker with withholdings and envelope allocations.</li>
      </ol>
    ),
  },
  {
    title: "Scripts Library",
    body: (
      <p>
        Sponsor outreach (short + long form), clinic pitches, team tennis inquiries, appearance proposals, rate
        negotiations, visa letters, tax withholding reclaim requests, and brand collaboration do/don’ts.
      </p>
    ),
  },
  {
    title: "Checklists",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Weekly Friday Finance Ritual checklist</li>
        <li>Pre-trip financial checklist (FX cash, cards, insurance, visas, contracts)</li>
        <li>Post-event debrief (actual vs. budget, lessons, follow-ups)</li>
        <li>Annual review (tax diary, insurance renewals, rate card refresh, skills plan)</li>
      </ul>
    ),
  },
  {
    title: "Global Notes (High Level)",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Track residency vs. source taxation, days, and income per country; expect withholding in some jurisdictions.</li>
        <li>Use multi-currency banking and build FX buffers into pricing.</li>
        <li>Plan for visas/work permits on clinics and appearances; gather supporting documents early.</li>
        <li>Respect anti-corruption and doping codes; keep waivers and insurance ready.</li>
      </ul>
    ),
  },
  {
    title: "Evaluation Rubric",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Clarity: Vision and KPIs are specific and measurable.</li>
        <li>Completeness: All deliverables uploaded and linked in-app.</li>
        <li>Rigor: ROI model uses realistic inputs; budgets reflect regional costs.</li>
        <li>Consistency: Friday Finance Ritual logged for three consecutive weeks.</li>
        <li>Sustainability: 12-month wealth plan balances training quality with runway.</li>
      </ul>
    ),
  },
  {
    title: "Quick Reference — Daily Deliverables",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Pre-Work: Starting Line PDF</li>
        <li>Day 1: Vision, KPIs, Money Rules</li>
        <li>Day 2: Rate Card, 30-lead list, outreach + clinic date</li>
        <li>Day 3: Season Budget, three event templates, vendor directory</li>
        <li>Day 4: Runway Policy, two schedules, Ops Manual</li>
        <li>Day 5: Country Map, Insurance checklist, Tax Diary entries</li>
        <li>Day 6: Wealth Plan, 90-day roadmap, Brand one-pager</li>
      </ul>
    ),
  },
  {
    title: "Upgrade Ideas for the Player Budget App",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Country/Tax heatmap widget</li>
        <li>FX smart pricing (auto buffer)</li>
        <li>ROI Coach for schedule suggestions</li>
        <li>Sponsor CRM light (pipeline + follow-ups)</li>
        <li>Friday Finance Ritual bot with exports for coach/agent</li>
      </ul>
    ),
  },
];

const expandedLessons: RichSection[] = [
  {
    title: "Day 1 — Identity, Vision & Money Rules (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          Identity beats tactics. Operators make fewer emotional money choices. Use the three-horizon model: keep the
          lights on (H1), grow competitive edge (H2), and build post-career options (H3).
        </p>
        <p>
          <strong>Example (ITF 15s):</strong> Ana protects her runway floor by postponing an expensive Europe swing and
          playing closer to home first.
        </p>
        <p>
          <strong>Example (Challenger qualies):</strong> Marco routes 10% of clinic income to Emergency, applies his rate
          card with FX buffer, and negotiates comped lodging instead of extra cash.
        </p>
      </div>
    ),
  },
  {
    title: "Day 2 — Income Engine & Opportunity Map (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          Diversified income stabilizes runway and improves visa/banking relationships. Price using floor/ceiling logic
          plus FX buffers.
        </p>
        <p>
          <strong>Example (Clinics in Europe):</strong> Three clinics during a swing cover housing costs.
        </p>
        <p>
          <strong>Example (SME sponsor):</strong> Bundle content + appearances with clear proof and affiliate upside.
        </p>
      </div>
    ),
  },
  {
    title: "Day 3 — Cost Architecture & Tour Budget (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          True cost includes fatigue and opportunity. Use regional benchmarks and always allocate contingency.
        </p>
        <p>
          <strong>Example:</strong> Prague W25 budget shows ROI ≈ 12%, so the trip is greenlit.
        </p>
      </div>
    ),
  },
  {
    title: "Day 4 — Cashflow, Runway & Tournament ROI (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          Runway floors: Green ≥ 6 mo, Yellow 3–6 mo, Red &lt; 3 mo. Only schedule events that meet ROI thresholds.
        </p>
        <p>
          <strong>Example:</strong> Schedule B looks glamorous but would drop runway to 2.8 months—policy says No-Go.
        </p>
      </div>
    ),
  },
  {
    title: "Day 5 — Risk, Tax, Compliance & Protection (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          Track days and income per country, keep tax documentation, and review insurance riders.
        </p>
        <p>
          <strong>Example:</strong> Withholding reclaim works smoothly because documentation is complete.</p>
        <p>
          <strong>Example:</strong> Disability add-on covers costs during injury downtime.</p>
      </div>
    ),
  },
  {
    title: "Day 6 — Investing, Wealth Plan & Post-Career Arc (Theory + Examples)",
    body: (
      <div className="space-y-3">
        <p>
          Sequence funding: Emergency → Debt payoff → Broad-market investing → Education/brand assets → opportunistic
          bets.</p>
        <p>
          <strong>Example:</strong> Nina automates savings and invests in a global ETF; Davor builds a coaching product
          while still competing.</p>
      </div>
    ),
  },
];

export default function FinancialMindsetStrategyAccelerator() {
  return (
    <div className="min-h-screen bg-primary">
      <AppTopBar title="Academy" subtitle="Financial Mindset & Strategy Accelerator — Tennis" />
      <div className="mx-auto max-w-5xl space-y-10 bg-background px-6 pb-12 pt-10">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-sm uppercase tracking-wide">
            6-Day Course
          </Badge>
          <Badge className="text-sm">Tennis</Badge>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Financial Mindset &amp; Strategy Accelerator — Tennis
          </h1>
          <p className="text-lg text-muted-foreground">
            Transform tennis pros into financial operators. Learn the systems that keep you on tour, protect your runway,
            and build wealth long after the last match point.
          </p>
        </div>
        <Alert>
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription>
            Educational only. Not legal, tax, or investment advice. Consult qualified professionals in your country of
            residence and competition.
          </AlertDescription>
        </Alert>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {summarySections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">How to Use This Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Start here:</strong> Complete the Pre-Work Snapshot before Day 1.
              </li>
              <li>
                <strong>Daily flow:</strong> Learn → Apply inside the Player Budget App → Submit Deliverables → Review.
              </li>
              <li>
                <strong>Must-hit metrics by Day 6:</strong> (1) 6-month runway plan, (2) Tournament ROI model installed,
                (3) Risk and insurance checklist done, (4) 12-month post-course roadmap.
              </li>
            </ul>
            <div>
              <p className="font-semibold">Required tools inside the Player Budget App</p>
              <ul className="mt-2 grid gap-2 pl-5 text-muted-foreground sm:grid-cols-2">
                {requiredTools.map((tool) => (
                  <li key={tool} className="list-disc">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pre-Work (Complete before Day 1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <p>
              <strong>Objective:</strong> Capture your starting line — “By completing your free assessment.” Do this once,
              in one sitting (20–30 minutes). Keep it simple; numbers can be rounded. You’ll refine later.
            </p>
            <div className="space-y-4">
              <h4 className="font-semibold">Step 1) Baseline Snapshot</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">A) Cash on hand (by currency)</p>
                  <p className="text-muted-foreground">
                    List every account or wallet with today’s balance. Format: Account / Currency / Balance / Notes
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Revolut / EUR / €1,240 / travel pot</li>
                    <li>Chase Checking / USD / $2,180 / living</li>
                    <li>Cash / MXN / $3,200 / last swing</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">B) Debts &amp; loans</p>
                  <p className="text-muted-foreground">
                    Record each with APR and monthly payment. Format: Type / Lender / Balance / APR / Monthly / End Date
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Credit card / Amex / $1,150 / 24.9% / $85 / —</li>
                    <li>Travel loan / Local bank / €2,700 / 8.5% / €98 / 2027-06</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">C) Monthly fixed costs</p>
                  <p className="text-muted-foreground">
                    Housing, phone, insurance, subscriptions, storage, gym, car/metro pass, coaching retainers.
                  </p>
                  <p className="text-muted-foreground">
                    Example: Housing $650 • Phone $40 • Insurance $110 • Subscriptions $28 • Gym $25 →{" "}
                    <strong>Fixed = $853/mo</strong>
                  </p>
                </div>
                <div>
                  <p className="font-semibold">D) Variable spend (tour)</p>
                  <p className="text-muted-foreground">
                    Food, transport, stringing, physio/massage, laundry, practice courts, visas, misc. Use heuristics (e.g.,
                    meals €18–28 in EU, stringing $12–25 ITF/Challenger, physio $30–90).
                  </p>
                </div>
                <div>
                  <p className="font-semibold">E) Current season schedule</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["Month", "Region", "Target Events", "Priority", "Travel Notes"].map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Feb", "Spain (EU)", "2× W15", "B", "share apt, cook"],
                          ["Mar", "USA (NA)", "1× W25 + 1 league wknd", "A", "clinic on off-day"],
                        ].map((row, index) => (
                          <tr key={index} className="border-t">
                            {row.map((value, columnIndex) => (
                              <td key={columnIndex} className="px-3 py-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">F) Income over the last 12 months</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["Stream", "Gross", "Withholding / Fees", "Net"].map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Prize Money", "$4,200", "$420", "$3,780"],
                          ["Clinics (12)", "$3,000", "$120", "$2,880"],
                          ["Sponsor (retainer)", "$1,200", "—", "$1,200"],
                        ].map((row, index) => (
                          <tr key={index} className="border-t">
                            {row.map((value, columnIndex) => (
                              <td key={columnIndex} className="px-3 py-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="border-t font-semibold">
                          <td className="px-3 py-2">Total</td>
                          <td className="px-3 py-2">$8,400</td>
                          <td className="px-3 py-2">$540</td>
                          <td className="px-3 py-2">$7,860</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Step 2) Mindset Inventory</h4>
              <div className="space-y-3">
                <p className="font-semibold">Top 5 money beliefs — helpful vs. unhelpful (with reframes)</p>
                <ul className="space-y-2">
                  {mindsetBeliefs.map(({ unhelpful, reframe, helpful }, index) => (
                    <li key={index} className="rounded-lg border bg-muted/30 p-3">
                      {helpful ? (
                        <span className="block font-medium text-emerald-700">Helpful: {helpful}</span>
                      ) : (
                        <>
                          <span className="block font-medium text-destructive">Unhelpful: {unhelpful}</span>
                          <span className="block text-sm text-muted-foreground">Reframe: {reframe}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-semibold">Money role models &amp; how the wealthy spot opportunities</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Optionality first: maintain runway to reject bad EV trips and accept asymmetric upsides.</li>
                  <li>Arbitrage mindset: geo arbitrage, FX buffers, convert when rates favor you.</li>
                  <li>Asset builder’s lens: turn knowledge into repeatable assets (rate cards, sponsor kits, services).</li>
                  <li>Distribution &gt; talent: build mailing lists and club relationships to monetize every swing.</li>
                  <li>Second-order thinking: weigh fatigue, visa, and networking effects—not just prize money.</li>
                  <li>Systems, not willpower: automations, checklists, default calendars.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-semibold">Stress triggers (identify yours + pre-plan response)</p>
                <div className="space-y-3">
                  {stressTriggers.map(({ trigger, response }) => (
                    <div key={trigger} className="rounded-lg border bg-muted/30 p-3 text-sm">
                      <p className="font-medium text-destructive">Trigger: {trigger}</p>
                      <p className="text-muted-foreground">Response: {response}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Step 3) Download your assessment</h4>
              <p>
                Generate a one-page <strong>Starting Line</strong> summary from your tool of choice and download your
                assessment (PDF/CSV/JSON). Store it in your athlete vault—it becomes the baseline for Day 1.
              </p>
              <p>
                <strong>Contents:</strong> balances by currency, debts, fixed/variable totals, 90-day schedule, last-12-month income, top 5 beliefs, role models, stress triggers.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-8">
        {dayModules.map((module) => (
          <Card key={module.id} id={module.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {module.label} — {module.title}
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{module.outcome}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed">
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wide text-muted-foreground">Lesson</p>
                <div className="space-y-4 text-muted-foreground">{module.lesson}</div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wide text-muted-foreground">Drills</p>
                <div className="space-y-4 text-muted-foreground">{module.drills}</div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wide text-muted-foreground">In-App Actions</p>
                <div className="space-y-4 text-muted-foreground">{module.actions}</div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wide text-muted-foreground">Deliverables</p>
                <div className="space-y-4 text-muted-foreground">{module.deliverables}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="space-y-6">
        {appendices.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">{section.body}</CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Expanded Lessons: Theory + Real-World Examples</h2>
        {expandedLessons.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">{section.body}</CardContent>
          </Card>
        ))}
      </section>
    </div>
    </div>
  );
}
