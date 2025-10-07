create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete set null,
  category text not null,
  amount numeric(18,2) not null,
  currency text not null default 'USD',
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists expense_entries_user_created_idx
  on public.expense_entries (user_id, created_at desc);

create index if not exists expense_entries_budget_idx
  on public.expense_entries (budget_id);

alter table public.expense_entries enable row level security;

drop policy if exists "Enable read for owners" on public.expense_entries;
create policy "Enable read for owners"
  on public.expense_entries
  for select
  using (auth.uid() = user_id);

drop policy if exists "Enable insert for owners" on public.expense_entries;
create policy "Enable insert for owners"
  on public.expense_entries
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Enable mutations for owners" on public.expense_entries;
create policy "Enable mutations for owners"
  on public.expense_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Enable delete for owners" on public.expense_entries;
create policy "Enable delete for owners"
  on public.expense_entries
  for delete
  using (auth.uid() = user_id);
