-- ============================================================================
-- STRIDE RITE: Strava Activities Cache Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strava_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id BIGINT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    distance NUMERIC DEFAULT 0,
    moving_time BIGINT DEFAULT 0,
    elapsed_time BIGINT DEFAULT 0,
    elevation_gain NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'Run',
    start_date TIMESTAMPTZ NOT NULL,
    average_speed NUMERIC DEFAULT 0,
    average_cadence NUMERIC DEFAULT 0,
    average_heartrate NUMERIC DEFAULT 0,
    max_heartrate NUMERIC DEFAULT 0,
    polyline TEXT,
    cached_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS to maintain Single-User mode compatibility
ALTER TABLE public.strava_activities DISABLE ROW LEVEL SECURITY;
