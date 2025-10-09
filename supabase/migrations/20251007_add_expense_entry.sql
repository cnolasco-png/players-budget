-- Create expense_entries table
CREATE TABLE IF NOT EXISTS public.expense_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE CASCADE,
  scenario_id uuid REFERENCES public.scenarios(id) ON DELETE SET NULL,
  date date NOT NULL,
  category text NOT NULL CHECK (category IN (
    'Travel','Lodging','Meals','Ground Transport','Entry Fees','Coaching',
    'Stringing','Physio/Gym','Insurance/Visas','Equipment','Laundry','Misc'
  )),
  label text,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  notes text
);

CREATE INDEX IF NOT EXISTS idx_expense_entries_user_date ON public.expense_entries(user_id, date);

ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense owner can CRUD" ON public.expense_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
