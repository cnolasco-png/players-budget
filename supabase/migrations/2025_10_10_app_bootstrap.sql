-- ========= ENUMS =========
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_tier') THEN
    CREATE TYPE module_tier AS ENUM ('free','pro');
  END IF;
END$$;

-- ========= TABLES =========

-- Feature flags (public readable)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key        text PRIMARY KEY,
  enabled    boolean DEFAULT false,
  release_at timestamptz NULL,
  updated_at timestamptz DEFAULT now()
);

-- Course modules metadata (public readable)
CREATE TABLE IF NOT EXISTS public.course_modules (
  slug        text PRIMARY KEY,
  title       text NOT NULL,
  description text,
  min_tier    module_tier DEFAULT 'pro',
  release_at  timestamptz NULL,
  created_at  timestamptz DEFAULT now()
);

-- Waitlist signups (insert by anyone, read own)
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  module_slug text REFERENCES public.course_modules(slug) ON DELETE CASCADE,
  email       text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
-- Prevent duplicate signups per module
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_waitlist_unique') THEN
    CREATE UNIQUE INDEX idx_waitlist_unique ON public.waitlist_signups (module_slug, email);
  END IF;
END $$;

-- Subscriptions (read own on client; service role updates via webhooks)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status                 text CHECK (status IN ('trialing','active','past_due','canceled','unpaid')) NOT NULL DEFAULT 'canceled',
  plan                   text CHECK (plan IN ('pro_monthly','pro_yearly')) NULL,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean DEFAULT false,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subs_customer') THEN
    CREATE INDEX idx_subs_customer ON public.user_subscriptions (stripe_customer_id);
  END IF;
END $$;

-- ========= RLS =========
ALTER TABLE public.feature_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions   ENABLE ROW LEVEL SECURITY;

-- Public read for flags/modules
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feature_flags_select_all') THEN
    CREATE POLICY feature_flags_select_all ON public.feature_flags
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_modules_select_all') THEN
    CREATE POLICY course_modules_select_all ON public.course_modules
      FOR SELECT USING (true);
  END IF;
END $$;

-- Waitlist: anyone can insert; users can read own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'waitlist_insert_any') THEN
    CREATE POLICY waitlist_insert_any ON public.waitlist_signups
      FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'waitlist_select_own') THEN
    CREATE POLICY waitlist_select_own ON public.waitlist_signups
      FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
      );
  END IF;
END $$;

-- Subscriptions: users can read their own; writes happen via service role (webhook)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'subs_select_own') THEN
    CREATE POLICY subs_select_own ON public.user_subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ========= SEEDS (safe if already present) =========
INSERT INTO public.course_modules (slug, title, description, min_tier, release_at)
SELECT 'fan-monetization',
       'Fan Monetization (Mentorship, Hitting, Match Analysis)',
       'Recurring income from a small engaged base: mentorship, on-the-road sessions, and paid video analysis inside Player X.',
       'pro',
       NULL
WHERE NOT EXISTS (SELECT 1 FROM public.course_modules WHERE slug='fan-monetization');

INSERT INTO public.feature_flags (key, enabled, release_at)
SELECT 'fan_monetization', false, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE key='fan_monetization');
