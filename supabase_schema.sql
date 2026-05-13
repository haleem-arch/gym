-- Haleem's Athlete Dashboard - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
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

-- 10. AI CHAT HISTORY
create table public.ai_chat (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.food_inventory enable row level security;
alter table public.schedules enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.diet_logs enable row level security;
alter table public.diet_meals enable row level security;
alter table public.inbody_scans enable row level security;
alter table public.ai_chat enable row level security;

-- CREATE RLS POLICIES (Assuming single user "Haleem" for now)
-- Allow read/write only if the authenticated user matches the row's user_id.

create policy "Users can view own profile." on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Exercises: anyone authenticated can read (global).
create policy "Anyone can read exercises." on public.exercises for select using (auth.role() = 'authenticated');
create policy "Users can insert exercises." on public.exercises for insert with check (auth.role() = 'authenticated');

-- Food Inventory: read global presets (user_id is null) OR own items.
create policy "Read global or own food." on public.food_inventory for select using (auth.role() = 'authenticated' and (user_id is null or user_id = auth.uid()));
create policy "Insert own food." on public.food_inventory for insert with check (auth.uid() = user_id);

-- Standard User Policies
create policy "All schedules operations." on public.schedules for all using (auth.uid() = user_id);
create policy "All workouts operations." on public.workouts for all using (auth.uid() = user_id);
create policy "All diet logs operations." on public.diet_logs for all using (auth.uid() = user_id);
create policy "All inbody operations." on public.inbody_scans for all using (auth.uid() = user_id);
create policy "All chat operations." on public.ai_chat for all using (auth.uid() = user_id);

-- Nested Tables (workout_exercises, diet_meals)
create policy "All workout exercises." on public.workout_exercises for all using (
  exists (select 1 from public.workouts where id = workout_exercises.workout_id and user_id = auth.uid())
);

create policy "All diet meals." on public.diet_meals for all using (
  exists (select 1 from public.diet_logs where id = diet_meals.diet_log_id and user_id = auth.uid())
);
