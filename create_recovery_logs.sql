-- ============================================================
-- RECOVERY LOGS SCHEMA
-- Creates the table for logging sauna, cold plunge, stretching, and active walks.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.recovery_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL, -- 'sauna', 'cold_plunge', 'stretching', 'walk'
  duration integer NOT NULL, -- duration in minutes
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"temp": 85, "distance_km": 3.2}
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to allow re-run
DROP POLICY IF EXISTS "All recovery logs operations." ON public.recovery_logs;

-- Add RLS Policies
CREATE POLICY "All recovery logs operations." ON public.recovery_logs FOR ALL USING (auth.uid() = user_id);
