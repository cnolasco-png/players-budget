-- Create table to log sponsor asset downloads/copies
create table if not exists public.sponsor_asset_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  asset text not null,
  created_at timestamptz not null default now()
);

alter table public.sponsor_asset_events enable row level security;

-- Allow anyone (anon or authenticated) to insert simple analytics rows
create policy "insert_sponsor_asset_events"
  on public.sponsor_asset_events
  for insert
  to anon, authenticated
  with check (true);

-- Helpful indexes
create index if not exists sponsor_asset_events_created_at_idx on public.sponsor_asset_events (created_at desc);
create index if not exists sponsor_asset_events_asset_idx on public.sponsor_asset_events (asset);

-- Optional RPC helper
create or replace function public.log_sponsor_asset_event(p_asset text, p_user_id uuid)
returns void
language sql
as $$
  insert into public.sponsor_asset_events(asset, user_id)
  values (p_asset, p_user_id);
$$;

grant execute on function public.log_sponsor_asset_event(text, uuid) to anon, authenticated;
