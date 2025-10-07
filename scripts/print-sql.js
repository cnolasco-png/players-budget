console.log(`-- Case 1: profiles
alter table if exists public.profiles enable row level security;

create policy if not exists "Users can view their profile" on public.profiles
  for select
  using (auth.uid() = id);

create policy if not exists "Users can update their profile" on public.profiles
  for update
  using (auth.uid() = id);

create policy if not exists "Users can insert their profile" on public.profiles
  for insert
  with check (auth.uid() = id);

-- Case 2: budgets
alter table if exists public.budgets enable row level security;

create policy if not exists "Users can view own budgets" on public.budgets
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert own budgets" on public.budgets
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own budgets" on public.budgets
  for update
  using (auth.uid() = user_id);

-- Case 3: scenarios
alter table if exists public.scenarios enable row level security;

create policy if not exists "Users can view scenarios for their budgets" on public.scenarios
  for select
  using (exists (
    select 1 from public.budgets
    where budgets.id = scenarios.budget_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can insert scenarios for their budgets" on public.scenarios
  for insert
  with check (exists (
    select 1 from public.budgets
    where budgets.id = scenarios.budget_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can update scenarios for their budgets" on public.scenarios
  for update
  using (exists (
    select 1 from public.budgets
    where budgets.id = scenarios.budget_id
      and budgets.user_id = auth.uid()
  ));

-- Case 4: line_items
alter table if exists public.line_items enable row level security;

create policy if not exists "Users can view line items for their budgets" on public.line_items
  for select
  using (exists (
    select 1 from public.scenarios
    join public.budgets on budgets.id = scenarios.budget_id
    where scenarios.id = line_items.scenario_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can insert line items for their budgets" on public.line_items
  for insert
  with check (exists (
    select 1 from public.scenarios
    join public.budgets on budgets.id = scenarios.budget_id
    where scenarios.id = line_items.scenario_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can update line items for their budgets" on public.line_items
  for update
  using (exists (
    select 1 from public.scenarios
    join public.budgets on budgets.id = scenarios.budget_id
    where scenarios.id = line_items.scenario_id
      and budgets.user_id = auth.uid()
  ));

-- Case 5: income_sources
alter table if exists public.income_sources enable row level security;

create policy if not exists "Users can view incomes for their budgets" on public.income_sources
  for select
  using (exists (
    select 1 from public.budgets
    where budgets.id = income_sources.budget_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can insert incomes for their budgets" on public.income_sources
  for insert
  with check (exists (
    select 1 from public.budgets
    where budgets.id = income_sources.budget_id
      and budgets.user_id = auth.uid()
  ));

create policy if not exists "Users can update incomes for their budgets" on public.income_sources
  for update
  using (exists (
    select 1 from public.budgets
    where budgets.id = income_sources.budget_id
      and budgets.user_id = auth.uid()
  ));

-- Case 6: tax_rates (read-only for everyone)
alter table if exists public.tax_rates enable row level security;

create policy if not exists "Allow read access to tax rates" on public.tax_rates
  for select
  using (true);
`);
