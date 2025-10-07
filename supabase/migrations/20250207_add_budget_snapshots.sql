create extension if not exists "uuid-ossp";

create table if not exists public.budget_snapshots (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  snapshot_data jsonb not null,
  scenario_totals jsonb not null default '[]'::jsonb,
  income_total numeric(18,2) not null default 0,
  spend_total numeric(18,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  restored_at timestamptz
);

alter table public.budget_snapshots
  alter column id set default gen_random_uuid();

create index if not exists budget_snapshots_budget_created_idx
  on public.budget_snapshots (budget_id, created_at desc);

alter table public.budget_snapshots enable row level security;

drop policy if exists "Enable read for owners" on public.budget_snapshots;
create policy "Enable read for owners"
  on public.budget_snapshots
  for select
  using (auth.uid() = user_id);

drop policy if exists "Enable insert for owners" on public.budget_snapshots;
create policy "Enable insert for owners"
  on public.budget_snapshots
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Enable update for owners" on public.budget_snapshots;
create policy "Enable update for owners"
  on public.budget_snapshots
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Enable delete for owners" on public.budget_snapshots;
create policy "Enable delete for owners"
  on public.budget_snapshots
  for delete
  using (auth.uid() = user_id);
