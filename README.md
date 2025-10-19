# PlayersBudget

Local development notes and deployment instructions.

## Environment variables

Create a local `.env.local` (do NOT commit) and set the following values. Public client keys must be prefixed with `VITE_` so Vite exposes them to the browser.

Required (client and server):

- VITE_APP_NAME — app display name
- VITE_SUPABASE_URL — your Supabase project URL
- VITE_SUPABASE_ANON_KEY — public anon key for client
- SUPABASE_URL — same Supabase project URL for serverless functions
- SUPABASE_SERVICE_ROLE_KEY — service role key for server-side updates (never expose to the client)
- DATABASE_URL — (internal DB if used)

Stripe (server and client):

- VITE_STRIPE_PUBLISHABLE_KEY — Stripe publishable key (client)
- STRIPE_SECRET_KEY — Stripe secret key (server only, keep secret)
- STRIPE_PRICE_ID_PRO_MONTHLY — Stripe Price ID for the monthly Pro subscription (price_xxx)
- STRIPE_PRICE_ID_PRO_YEARLY — Stripe Price ID for the annual Pro subscription (price_xxx)
- STRIPE_SUCCESS_URL — redirect URL after a successful checkout (e.g. https://your-site.com/thanks)
- STRIPE_CANCEL_URL — redirect URL when checkout is cancelled (e.g. https://your-site.com/pricing)
- STRIPE_WEBHOOK_SECRET — signing secret for the `/api/stripe/webhook` endpoint (whsec_xxx)
- SITE_URL — public URL for redirects (e.g. https://your-site.com or http://localhost:3000)

Supabase server-only:

- SUPABASE_ANON_KEY — optional helper for server utilities (falls back to VITE_SUPABASE_ANON_KEY)

## Database Migration

A migration file is included at `supabase/migrations/0000_create_feedback.sql` which creates a `feedback` table and RLS policies used by the app. To run it:

1. Open your Supabase project dashboard.
2. Go to "SQL" → "Query editor".
3. Paste the contents of `supabase/migrations/0000_create_feedback.sql` into the editor and run it.

This will create the `public.feedback` table and policies required by the UI.

### Expense entries migration

An additional migration is provided at `supabase/migrations/20251007_add_expense_entry.sql` which creates the `public.expense_entries` table that the app uses to store expense rows per budget/scenario.

To run it:

1. Open your Supabase project dashboard.
2. Go to "SQL" → "Query editor".
3. Paste the contents of `supabase/migrations/20251007_add_expense_entry.sql` into the editor and run it.

This will create the `public.expense_entries` table, index, and row-level security policy required by the app.

## Stripe flow (dev)

- The frontend upgrade buttons use `<UpgradeLink>` which POSTs to `/api/stripe/checkout`. That endpoint validates the Supabase session, creates or reuses a Stripe customer, logs a row in `checkout_sessions`, and returns the hosted checkout URL.
- Stripe redirects back to `STRIPE_SUCCESS_URL` (or `/thanks` on the site) when payment succeeds. A webhook at `/api/stripe/webhook` listens to `checkout.session.completed` and subscription lifecycle events to update `checkout_sessions.status`, upsert `user_subscriptions`, and flag `profiles.pro` plus `plan_interval`.
- Customers can manage their subscription through `/api/stripe/portal`, which creates a session for the Stripe billing portal using the stored `stripe_customer_id`.

## Important

- Never commit `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to source control.
- Ensure your deployment platform supports serverless functions (Vercel, Netlify) or run a small server to host the `/api` endpoints.

## Tax rate defaults

This project includes a migration `supabase/migrations/20251020_tax_by_level.sql` which creates `public.tax_rates_by_level` and seeds placeholder planning percentages for several countries and competition levels. Numbers are estimates — user can override them in the UI.

## Server Endpoints

This project includes a couple of serverless endpoints useful for production:

- GET /api/fx-rates?base=USD
  - Proxy to exchangerate.host with in-memory caching (12h). Returns JSON: { base, rates, fetched_at, cached }

- GET /api/tax-rate?country=US&level=Challenger&year=2025
  - Returns an effective tax percentage used for planning. Contract:
    - Success (exact match):
      { "pct": 24.0, "source": "tax_rates_by_level", "country": "US", "level": "Challenger", "year": 2025 }
    - If no exact year match, returns nearest previous year <= requested, or falls back to a country-level default in `tax_rates` table.
    - If nothing found: { "pct": null, "source": "missing", ... } (HTTP 200)
  - Cache-Control: public, max-age=3600 (1 hour)

Environment variables (required for server functions):

- SUPABASE_URL — Supabase project URL (server)
- SUPABASE_SERVICE_ROLE_KEY — service role key (server-only, never expose to client)
- STRIPE_SECRET_KEY — Stripe secret key for API calls (server-only)
- STRIPE_WEBHOOK_SECRET — signing secret for validating webhook requests

Client environment variables (already in the project):

- VITE_SUPABASE_URL — Supabase URL for client
- VITE_SUPABASE_ANON_KEY — Supabase anon key for client

Note: Do NOT place SUPABASE_SERVICE_ROLE_KEY in client-side envs. Use the server endpoints to keep secrets server-side.

Testing locally with Vercel:

- Start local dev server: vercel dev (or npm run dev depending on your setup).
- Call: http://localhost:3000/api/tax-rate?country=US&level=Challenger&year=2025

## QA / Acceptance Checklist

Before marking work as done, run the checks below. These are manual acceptance tests that exercise the core flows and charts.

1. Expense entries → MTD totals
   - Create one or more expense entries (Editor → Add expense) for the active budget and scenario.
   - Verify the Dashboard MTD Expenses tile updates to include the new entries.
   - Verify the Monthly Actual vs Plan bar chart updates to reflect the expense change.

2. Scenario selector → plan & projections
   - Use the scenario selector in the Projections panel to switch scenarios.
   - Confirm the Plan (monthly) value and Forecast to Year End lines update to reflect the selected scenario's line items.

3. Sandbox sliders → live recalculation + Apply
   - Open Sandbox for a selected scenario and move sliders (nights, airfare, meals, restringing).
   - Confirm the Preview plan value updates instantly as you move sliders.
   - Click "Apply to Scenario" and verify the matching LineItems are updated (Editor / Scenario) and Plan/Forecast refresh.

4. Income & Taxes
   - In Settings or Profile, set a Tax Country and Player Level (Coach/Player level).
   - Confirm net income on the Dashboard uses the server tax lookup (auto-filled) and the displayed country+level matches.

5. Coach/Parent flow (trip + costs)
   - As a coach/parent profile, add a trip entry with associated costs or add line items representing travel.
   - Verify totals show correctly in the Budget and that "Apply to Scenario" creates/updates LineItems as expected.

6. Charts & Alerts
   - Confirm the Bar (Actual vs Plan) and Line (Forecast) charts render and are responsive across viewport sizes.
   - Trigger alert thresholds by creating expenses that exceed Plan by >10% and >20%, and confirm amber and red banners appear respectively with an "Open Sandbox" action.

Screenshots (placeholders)

- Dashboard KPIs and Charts
  - [screenshot: dashboard-kpis.png]

- Monthly Actual vs Plan (Bar chart)
  - [screenshot: dashboard-actual-vs-plan.png]

- Forecast to Year End (Line chart)
  - [screenshot: dashboard-forecast.png]

- Sandbox sliders and Apply confirmation
  - [screenshot: sandbox-sliders.png]

- Over-budget alert banner (amber & red)
  - [screenshot: alert-amber.png]
  - [screenshot: alert-red.png]

Notes

- If you run into missing tax or FX data during QA, ensure the server env vars are configured (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`) and that the `tax_rates_by_level` migration has been applied.
- For faster testing, the tax endpoint can be mocked locally (see `src/lib/tax.ts` test helpers).

## Feedback & Social Proof

Player's Budget now captures testimonials and activation proof to boost homepage conversion.

- Floating `FeedbackButton` keeps a 60-second form available across the app. `QuickFeedbackSheet` collects role, NPS, key win, quote, optional media, and consent toggles, sending to the `feedback` table (status defaults to `pending`).
- `ActivationSurveyForm` appears after an activation is logged, capturing attendees, QR scans, redemptions, signups, and a one-line outcome. Submissions create feedback records tagged with metrics so you never forget to gather proof.
- `/feedback/new?token=...` provides a lightweight public page for sponsors to send quotes or video without logging in. Tokens are stored in `feedback_tokens` and validated server-side.
- Admins moderate in `<FeedbackQueue/>`; approving updates `feedback.status='approved'` and refreshes homepage stats. Rejections keep the quote private.
- Public homepage pulls approved feedback plus rollup metrics (`homepage_stats`). Components `SocialProofStrip`, `TestimonialsCarousel`, `ProofMasonry`, and `SchemaInjector` auto-render social proof and emit Review schema for SEO. A/B flag `homepage_blur_unlock` controls whether the last cards are blurred with an upgrade CTA.
- SQL migration `supabase/migrations/20251025_feedback_social_proof.sql` creates the feedback tables, policies, AB flags, and a `rollup_homepage_stats()` helper.
