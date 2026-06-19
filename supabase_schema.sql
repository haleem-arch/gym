-- Haleem's Athlete Dashboard - Complete Unified Supabase Schema
-- Combined original tables with the new Athlete Analytics schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- query performance monitoring

-- ============================================================
--  1. GYMS (multi-tenant root)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gyms (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,          -- used in URLs / white-label
  owner_id      UUID,                          -- FK added after profiles table
  logo_url      TEXT,
  timezone      TEXT DEFAULT 'Africa/Cairo',
  subscription_status TEXT DEFAULT 'active',   -- 'active' | 'paused' | 'cancelled'
  subscription_ends_at TIMESTAMPTZ,
  settings      JSONB DEFAULT '{}'::jsonb,     -- white-label colours, feature flags
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
--  2. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  username text unique,
  email text,
  display_name text,
  avatar_url TEXT,
  role text default 'client', -- 'owner' | 'coach' | 'client' | 'athlete'
  gender TEXT DEFAULT 'male', -- 'male' | 'female' (critical for Mifflin-St Jeor and FFMI)
  birthdate DATE,             -- Used to dynamically compute age: age = EXTRACT(YEAR FROM age(birthdate))
  height numeric,             -- cm
  weight numeric,             -- kg (current, denormalized for quick reads)
  bf_percent numeric,
  muscle_mass numeric,        -- kg
  bmr integer,                -- kcal
  inbody_score integer,
  coach_id uuid references public.profiles(id) ON DELETE SET NULL,
  targets jsonb default '{"kcal": 2500, "protein": 150, "carbs": 250, "fat": 70}'::jsonb,
  onboarded_at TIMESTAMPTZ,   -- NULL = hasn't completed onboarding
  deleted_at TIMESTAMPTZ,     -- soft delete
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Back-fill gym owner FK now that profiles exists
ALTER TABLE public.gyms
  ADD CONSTRAINT gyms_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================================
--  2.1 CLIENT PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  coach_id uuid references public.profiles(id) on delete set null,
  age integer,
  height numeric,
  experience_level text default 'beginner',
  workouts_per_week integer default 3,
  goals text,
  injuries_notes text,
  generated_passcode text,
  has_active_plan boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  2.2 CLIENT WORKOUT DAYS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.client_workout_days (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_number integer not null,
  day_name text,
  exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  3. EXERCISES (Global Library)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid default uuid_generate_v4() primary key,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL, -- NULL = global library
  name text UNIQUE not null,
  muscle_group text,           -- 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'core' | 'calves' | 'cardio'
  movement_type TEXT,          -- 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'cardio'
  tier text,                   -- S+, S, A, B, C, F
  focus text,
  cue text,
  rationale text,
  equipment text,              -- 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
  is_bilateral BOOLEAN DEFAULT TRUE, -- false = single-arm/leg (asymmetry tracking)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  4. FOOD INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Nullable for global presets
  name text not null,
  kcal_per_100g numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  micros jsonb default '{}'::jsonb,
  source text check (source in ('preset', 'barcode', 'manual')),
  barcode text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  5. SCHEDULES (Weekly Planner)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  week_start date not null,
  days jsonb not null, -- Stores Mon-Sun structure with day type and exercise lists
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start)
);

-- ============================================================
--  6. WORKOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  day_type text not null,      -- 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL_BODY' | 'CARDIO' | 'REST' | 'DELOAD' | 'RUN'
  name TEXT,                   -- Custom session name
  duration integer,            -- seconds
  total_volume numeric,        -- total tonnage kg (denormalised for speed)
  perceived_exertion INTEGER,   -- session RPE 1–10
  notes text,                  -- Stringified JSON for runs or extra notes
  status text default 'completed', -- 'completed' | 'in_progress' | 'skipped'
  deleted_at TIMESTAMPTZ,      -- soft delete
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  7. WORKOUT EXERCISES (Sets per exercise in a session)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  exercise_order SMALLINT NOT NULL DEFAULT 1, -- display ordering within session
  sets jsonb not null default '[]'::jsonb, -- e.g. [{"setNum": 1, "weight": 24, "reps": 10, "rpe": 8, "done": true, "rest_sec": 90}]
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  8. DIET LOGS (Daily overview)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diet_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  daily_totals jsonb not null default '{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "water_ml": 0}'::jsonb,
  adherence_pct NUMERIC,       -- % of target macros hit (0–100)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- ============================================================
--  9. DIET MEALS (Entries within a day)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diet_meals (
  id uuid default uuid_generate_v4() primary key,
  diet_log_id uuid references public.diet_logs(id) on delete cascade not null,
  name text not null, -- e.g. "Breakfast"
  time time,
  items jsonb not null default '[]'::jsonb, -- Array of selected food_inventory items + grams
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  10. INBODY SCANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inbody_scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight numeric not null,      -- kg
  smm numeric not null,         -- Skeletal Muscle Mass (kg)
  bfm numeric not null,         -- Body Fat Mass (kg)
  bf_percent numeric not null,  -- Body Fat %
  bmr integer not null,         -- kcal (from device)
  score integer,                -- InBody Score (0–100+)
  ecw_tbw_ratio NUMERIC,        -- Oedema indicator (normal < 0.380)
  segmental jsonb default '{"tbw": 0, "protein": 0, "minerals": 0, "visceralFat": 0, "raLean": 0, "laLean": 0, "trunkLean": 0, "rlLean": 0, "llLean": 0}'::jsonb,
  notes TEXT,
  deleted_at TIMESTAMPTZ,       -- soft delete
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

COMMENT ON COLUMN public.inbody_scans.ecw_tbw_ratio IS
  'Extracellular Water / Total Body Water. Values >= 0.380 may indicate inflammation or oedema.';

-- ============================================================
--  11. GOALS
--  Tracks what each athlete is working toward.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type          TEXT NOT NULL,                 -- 'fat_loss' | 'muscle_gain' | 'recomp' | 'strength' | 'run_distance' | 'run_pace' | 'custom'
  title         TEXT NOT NULL,                 -- e.g. "Drop to 18% body fat"
  metric_key    TEXT,                          -- e.g. 'bf_percent' | 'smm' | 'est_1rm_squat'
  target_value  NUMERIC,                       -- e.g. 18.0
  baseline_value NUMERIC,                      -- value at goal creation
  deadline      DATE,
  status        TEXT DEFAULT 'active',         -- 'active' | 'achieved' | 'at_risk' | 'paused'
  achieved_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
--  12. STRAVA ACTIVITIES CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.strava_activities (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  athlete_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id      BIGINT UNIQUE NOT NULL,      -- Strava's own ID
  name             TEXT NOT NULL,
  type             TEXT DEFAULT 'Run',          -- 'Run' | 'Walk' | 'Ride' | etc.
  start_date       TIMESTAMPTZ NOT NULL,
  distance         NUMERIC DEFAULT 0,           -- meters
  moving_time      BIGINT DEFAULT 0,            -- seconds
  elapsed_time     BIGINT DEFAULT 0,            -- seconds
  elevation_gain   NUMERIC DEFAULT 0,           -- meters
  average_speed    NUMERIC DEFAULT 0,           -- m/s
  average_cadence  NUMERIC DEFAULT 0,           -- steps/min
  average_heartrate NUMERIC DEFAULT 0,
  max_heartrate    NUMERIC DEFAULT 0,
  suffer_score     INTEGER,                     -- Strava's load score
  polyline         TEXT,
  cached_data      JSONB,                       -- full Strava payload
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  13. ATHLETE ALERTS (Persisted flags generated by backend)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.athlete_alerts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id        UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,                 -- 'overtraining_risk' | 'run_ramp_exceeded' | 'volume_spike' | 'segmental_imbalance' | 'scan_overdue' | 'goal_at_risk' | 'inbody_declined'
  severity      TEXT DEFAULT 'warning',        -- 'info' | 'warning' | 'critical'
  title         TEXT NOT NULL,
  body          TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,     -- raw numbers triggering flag
  goal_id       UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
--  14. ANALYTICS SNAPSHOTS (weekly pre-computed cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start            DATE NOT NULL,         -- Monday of the week
  bmi                   NUMERIC,
  ffmi                  NUMERIC,
  ffmi_normalized       NUMERIC,
  bf_percent            NUMERIC,
  smm_kg                NUMERIC,
  bfm_kg                NUMERIC,
  bmr_kcal              INTEGER,
  tdee_estimate         INTEGER,
  inbody_score          INTEGER,
  visceral_fat          NUMERIC,
  arm_asymmetry_pct     NUMERIC,
  leg_asymmetry_pct     NUMERIC,
  gym_sessions          SMALLINT DEFAULT 0,
  gym_tonnage_kg        NUMERIC DEFAULT 0,
  tonnage_change_pct    NUMERIC,
  push_sets             SMALLINT DEFAULT 0,
  pull_sets             SMALLINT DEFAULT 0,
  push_pull_ratio       NUMERIC,
  run_distance_m        NUMERIC DEFAULT 0,
  run_distance_change_pct NUMERIC,
  run_elevation_m       NUMERIC DEFAULT 0,
  avg_pace_sec_per_km   NUMERIC,
  is_recomping          BOOLEAN DEFAULT FALSE,
  overtraining_risk     BOOLEAN DEFAULT FALSE,
  composite_score       NUMERIC,
  avg_kcal_adherence    NUMERIC,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start)
);

-- ============================================================
--  15. PERSONAL BESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personal_bests (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL,                 -- 'est_1rm' | '5k_pace' | '10k_pace' | 'half_marathon_pace' | 'longest_run' | 'lowest_bf_percent' | 'highest_smm' | 'highest_ffmi'
  exercise_id   UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  value         NUMERIC NOT NULL,
  unit          TEXT NOT NULL,                 -- 'kg' | 'sec/km' | '%' | 'km'
  achieved_at   DATE NOT NULL,
  workout_id    UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  strava_activity_id UUID REFERENCES public.strava_activities(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
--  16. AI CHAT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_chat (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  17. PROGRESS NOTES (Coach to Client)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.progress_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  coach_id uuid references public.profiles(id) not null,
  date date default current_date not null,
  note text not null,
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
--  18. COMPUTED VIEW — ATHLETE ANALYTICS SUMMARY
--  Dynamically calculates BMI, FFMI, BMR and asymmetry.
-- ============================================================
CREATE OR REPLACE VIEW public.v_athlete_summary AS
SELECT
  p.id                                          AS user_id,
  p.gym_id,
  p.display_name,
  p.gender,
  p.height,
  p.weight                                      AS current_weight,
  EXTRACT(YEAR FROM age(p.birthdate))::INTEGER  AS age,

  -- BMI (uses profile height + latest inbody weight)
  ROUND(
    s.weight / POWER(p.height / 100.0, 2), 1
  )                                             AS bmi,

  -- Fat-Free Mass
  ROUND(s.weight * (1 - s.bf_percent / 100.0), 2) AS ffm_kg,

  -- FFMI
  ROUND(
    (s.weight * (1 - s.bf_percent / 100.0))
    / POWER(p.height / 100.0, 2), 2
  )                                             AS ffmi,

  -- Normalized FFMI
  ROUND(
    (s.weight * (1 - s.bf_percent / 100.0))
    / POWER(p.height / 100.0, 2)
    + 6.1 * (1.8 - p.height / 100.0), 2
  )                                             AS ffmi_normalized,

  -- BMR (Mifflin-St Jeor)
  ROUND(
    CASE p.gender
      WHEN 'male'   THEN 10 * s.weight + 6.25 * p.height - 5 * EXTRACT(YEAR FROM age(p.birthdate)) + 5
      WHEN 'female' THEN 10 * s.weight + 6.25 * p.height - 5 * EXTRACT(YEAR FROM age(p.birthdate)) - 161
      ELSE               10 * s.weight + 6.25 * p.height - 5 * EXTRACT(YEAR FROM age(p.birthdate)) + 5
    END
  )                                             AS bmr_calc,

  -- Max HR (Gellish)
  ROUND(207 - 0.7 * EXTRACT(YEAR FROM age(p.birthdate)))
                                                AS max_hr,

  -- Latest InBody fields
  s.bf_percent,
  s.smm,
  s.bfm,
  s.bmr                                         AS bmr_device,
  s.score                                       AS inbody_score,
  s.date                                        AS last_scan_date,
  s.segmental,

  -- Arm asymmetry %
  ROUND(
    ABS(
      (s.segmental->>'raLean')::NUMERIC
      - (s.segmental->>'laLean')::NUMERIC
    )
    / NULLIF(
        GREATEST(
          (s.segmental->>'raLean')::NUMERIC,
          (s.segmental->>'laLean')::NUMERIC
        ), 0
      ) * 100, 1
  )                                             AS arm_asymmetry_pct,

  -- Latest weekly snapshot
  sn.gym_tonnage_kg,
  sn.run_distance_m / 1000.0                   AS run_distance_km,
  sn.composite_score,
  sn.overtraining_risk,
  sn.is_recomping,
  sn.push_pull_ratio,
  sn.week_start                                 AS snapshot_week

FROM public.profiles p

LEFT JOIN LATERAL (
  SELECT * FROM public.inbody_scans
  WHERE user_id = p.id AND deleted_at IS NULL
  ORDER BY date DESC
  LIMIT 1
) s ON TRUE

LEFT JOIN LATERAL (
  SELECT * FROM public.analytics_snapshots
  WHERE user_id = p.id
  ORDER BY week_start DESC
  LIMIT 1
) sn ON TRUE

WHERE p.deleted_at IS NULL;

-- ============================================================
--  19. ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_workout_days enable row level security;
alter table public.exercises enable row level security;
alter table public.food_inventory enable row level security;
alter table public.schedules enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.diet_logs enable row level security;
alter table public.diet_meals enable row level security;
alter table public.inbody_scans enable row level security;
alter table public.ai_chat enable row level security;
alter table public.progress_notes enable row level security;
alter table public.gyms enable row level security;
alter table public.goals enable row level security;
alter table public.strava_activities enable row level security;
alter table public.athlete_alerts enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.personal_bests enable row level security;

-- Policies
create policy "Users can view own profile." on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Coaches can view their clients profiles." on public.profiles for select using (coach_id = auth.uid());

create policy "Users can view own client profile." on public.client_profiles for select using (auth.uid() = user_id);
create policy "Coaches can manage their clients profiles." on public.client_profiles for all using (coach_id = auth.uid());

create policy "Users can view own workout days." on public.client_workout_days for select using (auth.uid() = user_id);
create policy "Coaches can manage their clients workout days." on public.client_workout_days for all using (exists (select 1 from public.profiles p where p.id = client_workout_days.user_id and p.coach_id = auth.uid()));

create policy "Anyone can read exercises." on public.exercises for select using (auth.role() = 'authenticated');
create policy "Users can insert exercises." on public.exercises for insert with check (auth.role() = 'authenticated');
create policy "Users can update exercises." on public.exercises for update using (auth.role() = 'authenticated');
create policy "Users can delete exercises." on public.exercises for delete using (auth.role() = 'authenticated');

create policy "Read global or own food." on public.food_inventory for select using (auth.role() = 'authenticated' and (user_id is null or user_id = auth.uid()));
create policy "Insert own food." on public.food_inventory for insert with check (auth.uid() = user_id);
create policy "Update own food." on public.food_inventory for update using (auth.uid() = user_id);
create policy "Delete own food." on public.food_inventory for delete using (auth.uid() = user_id);

create policy "All schedules operations." on public.schedules for all using (auth.uid() = user_id);
create policy "All workouts operations." on public.workouts for all using (auth.uid() = user_id);
create policy "All diet logs operations." on public.diet_logs for all using (auth.uid() = user_id);
create policy "All inbody operations." on public.inbody_scans for all using (auth.uid() = user_id);
create policy "All chat operations." on public.ai_chat for all using (auth.uid() = user_id);
create policy "All progress notes operations." on public.progress_notes for all using (auth.uid() = user_id or coach_id = auth.uid());

create policy "All workout exercises." on public.workout_exercises for all using (
  exists (select 1 from public.workouts where id = workout_exercises.workout_id and user_id = auth.uid())
);

create policy "All diet meals." on public.diet_meals for all using (
  exists (select 1 from public.diet_logs where id = diet_meals.diet_log_id and user_id = auth.uid())
);

-- RLS for new tables
create policy "All goals operations." on public.goals for all using (auth.uid() = user_id);
create policy "All strava operations." on public.strava_activities for all using (auth.uid() = athlete_id);
create policy "All alerts operations." on public.athlete_alerts for all using (auth.uid() = user_id);
create policy "All snapshots operations." on public.analytics_snapshots for all using (auth.uid() = user_id);
create policy "All pbs operations." on public.personal_bests for all using (auth.uid() = user_id);

-- ============================================================
--  20. PERFORMANCE INDEXES
-- ============================================================
create index if not exists idx_profiles_coach_id on public.profiles(coach_id);
create index if not exists idx_client_profiles_coach_id on public.client_profiles(coach_id);
create index if not exists idx_client_workout_days_user_id on public.client_workout_days(user_id);
create index if not exists idx_schedules_user_id on public.schedules(user_id);
create index if not exists idx_workouts_user_id on public.workouts(user_id);
create index if not exists idx_diet_logs_user_id on public.diet_logs(user_id);
create index if not exists idx_inbody_scans_user_id on public.inbody_scans(user_id);
create index if not exists idx_progress_notes_user_id on public.progress_notes(user_id);

CREATE INDEX IF NOT EXISTS idx_inbody_user_date ON public.inbody_scans(user_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC) WHERE deleted_at IS NULL AND status = 'completed';
CREATE INDEX IF NOT EXISTS idx_workouts_user_daytype ON public.workouts(user_id, day_type);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON public.workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_strava_athlete_date ON public.strava_activities(athlete_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_week ON public.analytics_snapshots(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pbs_user_type ON public.personal_bests(user_id, type, achieved_at DESC);

-- ============================================================
--  21. UPDATED_AT TRIGGER (auto-update timestamp)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
