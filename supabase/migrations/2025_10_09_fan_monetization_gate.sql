-- You are Copilot. Create the schema to lock "Fan Monetization" lessons and collect a waitlist.
-- Tables: feature_flags, course_modules, waitlist_signups (as described).
-- Add RLS: read-only for flags/modules; allow insert to waitlist by anyone; allow user read own waitlist.
-- Seed a locked module 'fan-monetization' and seed feature flag 'fan_monetization' disabled.

-- IMPLEMENT:
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean default false,
  release_at timestamptz null,
  updated_at timestamptz default now()
);
alter table public.feature_flags enable row level security;
create policy "read flags" on public.feature_flags for select using (true);

create type module_tier as enum ('free','pro');

create table if not exists public.course_modules (
  slug text primary key,
  title text not null,
  description text,
  min_tier module_tier default 'pro',
  release_at timestamptz null,
  created_at timestamptz default now()
);
alter table public.course_modules enable row level security;
create policy "read modules" on public.course_modules for select using (true);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  module_slug text references public.course_modules(slug) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);
alter table public.waitlist_signups enable row level security;
create policy "user insert self" on public.waitlist_signups for insert with check (true);
create policy "user read own" on public.waitlist_signups for select using (auth.uid() = user_id or user_id is null);

insert into public.course_modules (slug,title,description,min_tier,release_at)
values ('fan-monetization','Fan Monetization (Mentorship, Hitting, Match Analysis)',
        'Recurring income from a small engaged base: mentorship, on-the-road sessions, and paid video analysis inside Player X.',
        'pro', null)
on conflict (slug) do nothing;

insert into public.feature_flags (key, enabled, release_at)
values ('fan_monetization', false, null)
on conflict (key) do nothing;
