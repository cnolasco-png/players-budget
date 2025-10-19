-- Checkout session + profile flags updates

alter table public.profiles
  add column if not exists pro boolean default false,
  add column if not exists plan text check (plan in ('free','pro')) default 'free',
  add column if not exists plan_interval text check (plan_interval in ('monthly','yearly')),
  add column if not exists stripe_customer_id text;

alter table public.checkout_sessions
  add column if not exists plan text default 'pro',
  add column if not exists plan_interval text check (plan_interval in ('monthly','yearly')),
  add column if not exists payment_status text,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists error text;

create or replace function public.set_checkout_sessions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_checkout_sessions_updated_at on public.checkout_sessions;
create trigger trg_checkout_sessions_updated_at
  before update on public.checkout_sessions
  for each row
  execute function public.set_checkout_sessions_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'checkout_sessions_update_service'
      and tablename = 'checkout_sessions'
  ) then
    create policy checkout_sessions_update_service
      on public.checkout_sessions
      for update to authenticated
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
