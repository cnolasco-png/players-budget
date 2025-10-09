-- Migration: create tax_rates_by_level table and seed placeholder planning percents

create table if not exists public.tax_rates_by_level (
  id uuid primary key default gen_random_uuid(),
  country char(2) not null,
  level text not null check (level in ('ITF','Challenger','ATP/WTA')),
  year int not null default extract(year from now()),
  bracket jsonb,
  default_pct numeric(5,2) not null,
  updated_at timestamptz not null default now(),
  unique(country, level, year)
);

-- Seed: placeholder planning percents (estimates). Users can override these in the UI.
insert into public.tax_rates_by_level (country, level, default_pct) values
  ('US','ITF', 12.00),
  ('US','Challenger', 15.00),
  ('US','ATP/WTA', 22.00),

  ('GB','ITF', 10.00),
  ('GB','Challenger', 14.00),
  ('GB','ATP/WTA', 20.00),

  ('ES','ITF', 15.00),
  ('ES','Challenger', 18.00),
  ('ES','ATP/WTA', 24.00),

  ('FR','ITF', 15.00),
  ('FR','Challenger', 18.00),
  ('FR','ATP/WTA', 24.00),

  ('DE','ITF', 12.00),
  ('DE','Challenger', 16.00),
  ('DE','ATP/WTA', 22.00),

  ('IT','ITF', 12.00),
  ('IT','Challenger', 16.00),
  ('IT','ATP/WTA', 22.00),

  ('MX','ITF', 10.00),
  ('MX','Challenger', 12.00),
  ('MX','ATP/WTA', 18.00),

  ('BR','ITF', 8.00),
  ('BR','Challenger', 12.00),
  ('BR','ATP/WTA', 18.00),

  ('AR','ITF', 8.00),
  ('AR','Challenger', 10.00),
  ('AR','ATP/WTA', 18.00),

  ('JP','ITF', 10.00),
  ('JP','Challenger', 12.00),
  ('JP','ATP/WTA', 20.00),

  ('AU','ITF', 10.00),
  ('AU','Challenger', 12.00),
  ('AU','ATP/WTA', 20.00)
;
