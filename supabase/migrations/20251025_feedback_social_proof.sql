-- Feedback & Social Proof schema

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  role text check (role in ('player','sponsor','coach')) not null,
  user_id uuid references auth.users(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  activation_id uuid references public.activations(id) on delete set null,
  name text,
  org text,
  title text,
  rating int,
  quote text not null,
  media_url text,
  avatar_url text,
  consent_publish boolean default false,
  tags text[] default '{}',
  sentiment text,
  status text check (status in ('pending','approved','rejected')) default 'pending'
);

create table if not exists public.feedback_tokens (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid references public.feedback(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  used boolean default false
);

create table if not exists public.homepage_stats (
  id int primary key default 1,
  updated_at timestamptz default now(),
  total_activations int default 0,
  total_qr_scans int default 0,
  total_redemptions int default 0,
  avg_time_to_first_sponsor numeric default 17,
  rolling_30d_testimonials int default 0
);

insert into public.homepage_stats(id) values (1)
on conflict (id) do nothing;

create table if not exists public.ab_flags (
  key text primary key,
  variant text not null
);

-- RLS policies
alter table public.feedback enable row level security;
alter table public.feedback_tokens enable row level security;
alter table public.homepage_stats enable row level security;
alter table public.ab_flags enable row level security;

create policy "feedback_insert_self" on public.feedback for insert
  to authenticated using (true) with check (true);

create policy "feedback_select_public" on public.feedback for select
  using (
    status = 'approved'
    or auth.uid() is not null and auth.uid() = user_id
  );

create policy "feedback_update_admin" on public.feedback for update
  to authenticated using (auth.role() = 'service_role');

create policy "token_insert_server" on public.feedback_tokens for insert
  to authenticated using (auth.role() = 'service_role');

create policy "token_delete_server" on public.feedback_tokens for delete
  to authenticated using (auth.role() = 'service_role');

create policy "token_select_none" on public.feedback_tokens for select using (false);

create policy "homepage_stats_read" on public.homepage_stats for select using (true);
create policy "homepage_stats_update" on public.homepage_stats for update using (auth.role() = 'service_role');

create policy "ab_flags_read" on public.ab_flags for select using (true);
create policy "ab_flags_update" on public.ab_flags for update using (auth.role() = 'service_role');
create policy "ab_flags_insert" on public.ab_flags for insert using (auth.role() = 'service_role');

-- helper function to classify sentiment (simple heuristic)
create or replace function public.classify_sentiment(in_quote text)
returns text language plpgsql as $$
begin
  if in_quote is null then
    return 'neu';
  elsif in_quote ~* '(great|love|amazing|win|helped|boost)' then
    return 'pos';
  elsif in_quote ~* '(bad|poor|issue|problem|concern)' then
    return 'neg';
  else
    return 'neu';
  end if;
end;
$$;

create or replace function public.rollup_homepage_stats()
returns void language plpgsql security definer as $$
declare
  agg record;
begin
  select
    coalesce(count(*) filter (where created_at >= now() - interval '90 days'), 0) as total_activations,
    coalesce(sum(qr_scans) filter (where created_at >= now() - interval '90 days'), 0) as qr_total,
    coalesce(sum(code_redemptions) filter (where created_at >= now() - interval '90 days'), 0) as redemptions_total,
    coalesce(avg(date_part('day', created_at - (select min(created_at) from public.prospects where id = public.activations.prospect_id))), 17) as avg_time,
    coalesce(count(*) filter (where created_at >= now() - interval '30 days'), 0) as rolling_testimonials
  into agg
  from public.activations;

  update public.homepage_stats
  set
    updated_at = now(),
    total_activations = agg.total_activations,
    total_qr_scans = agg.qr_total,
    total_redemptions = agg.redemptions_total,
    avg_time_to_first_sponsor = agg.avg_time,
    rolling_30d_testimonials = agg.rolling_testimonials
  where id = 1;
end;
$$;
