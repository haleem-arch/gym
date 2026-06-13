-- Haleem's Athlete Dashboard - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  email text,
  display_name text,
  role text default 'client', -- 'coach' or 'client'
  coach_id uuid references public.profiles(id),
  age integer,
  height integer, -- cm
  weight numeric, -- kg
  bf_percent numeric,
  muscle_mass numeric, -- kg
  bmr integer, -- kcal
  inbody_score integer,
  targets jsonb default '{}'::jsonb, -- e.g. {"kcal": 2400, "protein": 160, "carbs": 240, "fat": 70}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.1 CLIENT PROFILES
create table public.client_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  coach_id uuid references public.profiles(id) not null,
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

-- 1.2 CLIENT WORKOUT DAYS
create table public.client_workout_days (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_number integer not null,
  day_name text,
  exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_client_workout_days_user_id on public.client_workout_days(user_id);

-- 2. EXERCISES (Global Library)
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  muscle_group text,
  tier text, -- S+, S, A, B/C, F
  focus text,
  cue text,
  rationale text,
  equipment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FOOD INVENTORY
create table public.food_inventory (
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

-- 4. SCHEDULES (Weekly Planner)
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  week_start date not null,
  days jsonb not null, -- Stores Mon-Sun structure with day type and exercise lists
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start)
);

-- 5. WORKOUTS
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  day_type text not null, -- e.g. "PUSH", "PULL"
  duration integer, -- seconds
  total_volume numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. WORKOUT EXERCISES (Sets per exercise in a session)
create table public.workout_exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  sets jsonb not null default '[]'::jsonb, -- e.g. [{"setNum": 1, "weight": 24, "reps": 10, "rpe": 8, "done": true}]
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DIET LOGS (Daily overview)
create table public.diet_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  daily_totals jsonb not null default '{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- 8. DIET MEALS (Entries within a day)
create table public.diet_meals (
  id uuid default uuid_generate_v4() primary key,
  diet_log_id uuid references public.diet_logs(id) on delete cascade not null,
  name text not null, -- e.g. "Breakfast"
  time time,
  items jsonb not null default '[]'::jsonb, -- Array of selected food_inventory items + grams
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. INBODY SCANS
create table public.inbody_scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight numeric,
  smm numeric, -- Skeletal Muscle Mass
  bfm numeric, -- Body Fat Mass
  bf_percent numeric,
  bmr integer,
  score integer,
  segmental jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. AI CHAT HISTORY
create table public.ai_chat (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. PROGRESS NOTES (Coach to Client)
create table public.progress_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  coach_id uuid references public.profiles(id) not null,
  date date default current_date not null,
  note text not null,
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY (RLS)
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

-- CREATE RLS POLICIES
-- Profiles
create policy "Users can view own profile." on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Coaches can view their clients profiles." on public.profiles for select using (coach_id = auth.uid());

-- Client Profiles
create policy "Users can view own client profile." on public.client_profiles for select using (auth.uid() = user_id);
create policy "Coaches can manage their clients profiles." on public.client_profiles for all using (coach_id = auth.uid());

-- Client Workout Days
create policy "Users can view own workout days." on public.client_workout_days for select using (auth.uid() = user_id);
create policy "Coaches can manage their clients workout days." on public.client_workout_days for all using (exists (select 1 from public.profiles p where p.id = client_workout_days.user_id and p.coach_id = auth.uid()));

-- Exercises: anyone authenticated can read/write (global library).
create policy "Anyone can read exercises." on public.exercises for select using (auth.role() = 'authenticated');
create policy "Users can insert exercises." on public.exercises for insert with check (auth.role() = 'authenticated');
create policy "Users can update exercises." on public.exercises for update using (auth.role() = 'authenticated');
create policy "Users can delete exercises." on public.exercises for delete using (auth.role() = 'authenticated');

-- Food Inventory: read global presets (user_id is null) OR own items.
create policy "Read global or own food." on public.food_inventory for select using (auth.role() = 'authenticated' and (user_id is null or user_id = auth.uid()));
create policy "Insert own food." on public.food_inventory for insert with check (auth.uid() = user_id);
create policy "Update own food." on public.food_inventory for update using (auth.uid() = user_id);
create policy "Delete own food." on public.food_inventory for delete using (auth.uid() = user_id);

-- Standard User Policies
create policy "All schedules operations." on public.schedules for all using (auth.uid() = user_id);
create policy "All workouts operations." on public.workouts for all using (auth.uid() = user_id);
create policy "All diet logs operations." on public.diet_logs for all using (auth.uid() = user_id);
create policy "All inbody operations." on public.inbody_scans for all using (auth.uid() = user_id);
create policy "All chat operations." on public.ai_chat for all using (auth.uid() = user_id);
create policy "All progress notes operations." on public.progress_notes for all using (auth.uid() = user_id or coach_id = auth.uid());

-- Nested Tables (workout_exercises, diet_meals)
create policy "All workout exercises." on public.workout_exercises for all using (
  exists (select 1 from public.workouts where id = workout_exercises.workout_id and user_id = auth.uid())
);

create policy "All diet meals." on public.diet_meals for all using (
  exists (select 1 from public.diet_logs where id = diet_meals.diet_log_id and user_id = auth.uid())
);

-- Recommended Foreign Key Indexes for Scaled Performance
create index if not exists idx_profiles_coach_id on public.profiles(coach_id);
create index if not exists idx_client_profiles_coach_id on public.client_profiles(coach_id);
create index if not exists idx_schedules_user_id on public.schedules(user_id);
create index if not exists idx_workouts_user_id on public.workouts(user_id);
create index if not exists idx_diet_logs_user_id on public.diet_logs(user_id);
create index if not exists idx_inbody_scans_user_id on public.inbody_scans(user_id);
create index if not exists idx_water_logs_user_id on public.water_logs(user_id);
create index if not exists idx_progress_notes_user_id on public.progress_notes(user_id);

