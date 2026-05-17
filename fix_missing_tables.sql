-- Fix missing tables required by Athlete Dashboard AI and Hydration Tracking

-- 1. Create water_logs table
create table public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  amount_ml numeric not null default 0,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create policy "All water_logs operations." on public.water_logs for all using (auth.uid() = user_id);
alter table public.water_logs enable row level security;

-- 2. Create user_workout_plans table
create table public.user_workout_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  plan_type text not null,
  exercises jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, plan_type)
);

create policy "All user_workout_plans operations." on public.user_workout_plans for all using (auth.uid() = user_id);
alter table public.user_workout_plans enable row level security;
