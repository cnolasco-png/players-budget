-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  topic text,
  message text NOT NULL
);

-- Enable row level security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own feedback
CREATE POLICY "Insert feedback" ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) OR (user_id IS NULL)
  );

-- Allow owners to select their feedback, and allow anyone to select for reporting if needed (adjust as needed)
CREATE POLICY "Select feedback" ON public.feedback
  FOR SELECT
  USING (true);

-- Allow owners to delete their feedback (admins should use service role)
CREATE POLICY "Delete own feedback" ON public.feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow updates only by owners
CREATE POLICY "Update own feedback" ON public.feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
