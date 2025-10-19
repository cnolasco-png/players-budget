-- Upgrade event logging tables

create table if not exists public.upgrade_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null,
  interval text not null check (interval in ('monthly','yearly'))
);

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  interval text not null,
  status text not null default 'created'
);

create table if not exists public.user_flags (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pro_annual_trial_eligible boolean default true
);

alter table public.upgrade_events enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.user_flags enable row level security;

create policy "upgrade_events_insert_self" on public.upgrade_events
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "upgrade_events_select_admin" on public.upgrade_events
  for select using (auth.role() = 'service_role');

create policy "checkout_sessions_service" on public.checkout_sessions
  for insert to authenticated
  with check (auth.role() = 'service_role');

create policy "checkout_sessions_read_admin" on public.checkout_sessions
  for select using (auth.role() = 'service_role');

create policy "user_flags_manage" on public.user_flags
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
