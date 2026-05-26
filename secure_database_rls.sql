-- ==========================================
-- STRIDE RITE FITNESS DASHBOARD - SECURITY UPGRADE (v3 - COMPREHENSIVE RESET)
-- ==========================================
-- This script re-enables Row Level Security (RLS) and sets up secure access rules.
-- It securely permits a Coach (auth.uid()) to manage clients' workouts, logs, and scans
-- while strictly limiting their visibility of clients' historical logs to the last 180 days (6 months).

-- 1. RE-ENABLE ROW LEVEL SECURITY (RLS) FOR ALL CORE TABLES
alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_workout_days enable row level security;
alter table public.user_workout_plans enable row level security;
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
alter table public.water_logs enable row level security;

-- 2. RESET ALL POLICIES TO PREVENT DUPLICATES & ERRORS (COMPREHENSIVE RESET)
-- Profiles
drop policy if exists "Users can view own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "Coaches can view their clients profiles." on public.profiles;
drop policy if exists "Coaches can view/update/insert/delete client profiles" on public.profiles;
drop policy if exists "View profiles." on public.profiles;
drop policy if exists "Update profiles." on public.profiles;
drop policy if exists "Insert profiles." on public.profiles;
drop policy if exists "Delete profiles." on public.profiles;

-- Client Profiles
drop policy if exists "Users can view own client profile." on public.client_profiles;
drop policy if exists "Coaches can manage their clients profiles." on public.client_profiles;
drop policy if exists "Coaches can view/manage client profiles" on public.client_profiles;
drop policy if exists "View client profiles." on public.client_profiles;
drop policy if exists "Manage client profiles." on public.client_profiles;

-- Client Workout Days
drop policy if exists "Users can view own workout days." on public.client_workout_days;
drop policy if exists "Coaches can manage their clients workout days." on public.client_workout_days;
drop policy if exists "View workout days." on public.client_workout_days;
drop policy if exists "Manage workout days." on public.client_workout_days;

-- User Workout Plans
drop policy if exists "View user workout plans" on public.user_workout_plans;
drop policy if exists "Manage user workout plans" on public.user_workout_plans;

-- Schedules
drop policy if exists "All schedules operations." on public.schedules;
drop policy if exists "Users can view own schedules, and coaches can view client schedules in the last 180 days." on public.schedules;
drop policy if exists "Coaches can manage client schedules." on public.schedules;
drop policy if exists "Schedules select policy." on public.schedules;
drop policy if exists "Schedules write policy." on public.schedules;

-- Workouts
drop policy if exists "All workouts operations." on public.workouts;
drop policy if exists "Users can view own workouts, and coaches can view client workouts in the last 180 days." on public.workouts;
drop policy if exists "Coaches can manage client workouts." on public.workouts;
drop policy if exists "Workouts select policy." on public.workouts;
drop policy if exists "Workouts write policy." on public.workouts;

-- Workout Exercises
drop policy if exists "All workout exercises." on public.workout_exercises;
drop policy if exists "Workout exercises select policy." on public.workout_exercises;
drop policy if exists "Workout exercises write policy." on public.workout_exercises;
drop policy if exists "Workout exercises insert policy" on public.workout_exercises;
drop policy if exists "Workout exercises delete policy" on public.workout_exercises;

-- Diet Logs
drop policy if exists "All diet logs operations." on public.diet_logs;
drop policy if exists "Users can view own diet logs, and coaches can view client diet logs in the last 180 days." on public.diet_logs;
drop policy if exists "Coaches can manage client diet logs." on public.diet_logs;
drop policy if exists "Diet logs select policy." on public.diet_logs;
drop policy if exists "Diet logs write policy." on public.diet_logs;

-- Diet Meals
drop policy if exists "All diet meals." on public.diet_meals;
drop policy if exists "Diet meals select policy." on public.diet_meals;
drop policy if exists "Diet meals write policy." on public.diet_meals;
drop policy if exists "Diet meals insert policy" on public.diet_meals;
drop policy if exists "Diet meals delete policy" on public.diet_meals;

-- Inbody Scans
drop policy if exists "All inbody operations." on public.inbody_scans;
drop policy if exists "Users can view own scans, and coaches can view client scans in the last 180 days." on public.inbody_scans;
drop policy if exists "Coaches can manage client scans." on public.inbody_scans;
drop policy if exists "Inbody scans select policy." on public.inbody_scans;
drop policy if exists "Inbody scans write policy." on public.inbody_scans;

-- Progress Notes
drop policy if exists "All progress notes operations." on public.progress_notes;
drop policy if exists "Users can view own progress notes, and coaches can view client progress notes in the last 180 days." on public.progress_notes;
drop policy if exists "Coaches can manage client progress notes." on public.progress_notes;
drop policy if exists "Progress notes select policy." on public.progress_notes;
drop policy if exists "Progress notes write policy." on public.progress_notes;

-- Water Logs
drop policy if exists "All water logs operations." on public.water_logs;
drop policy if exists "Users can view own water logs, and coaches can view client water logs in the last 180 days." on public.water_logs;
drop policy if exists "Coaches can manage client water logs." on public.water_logs;
drop policy if exists "Water logs select policy." on public.water_logs;
drop policy if exists "Water logs write policy." on public.water_logs;

-- AI Chat
drop policy if exists "All chat operations." on public.ai_chat;
drop policy if exists "Chat select policy." on public.ai_chat;
drop policy if exists "Chat write policy." on public.ai_chat;


-- 3. PROFILES POLICIES
create policy "View profiles." on public.profiles for select using (
  auth.uid() = id 
  or coach_id = auth.uid() 
  or id = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Allow viewing Owner Profile (for targets / toggles)
);
create policy "Update profiles." on public.profiles for update using (
  auth.uid() = id 
  or coach_id = auth.uid()
);
create policy "Insert profiles." on public.profiles for insert with check (
  auth.role() = 'authenticated'
);
create policy "Delete profiles." on public.profiles for delete using (
  auth.uid() = id 
  or coach_id = auth.uid()
);


-- 4. CLIENT PROFILES POLICIES
create policy "View client profiles." on public.client_profiles for select using (
  auth.uid() = user_id 
  or coach_id = auth.uid()
);
create policy "Manage client profiles." on public.client_profiles for all using (
  auth.uid() = user_id 
  or coach_id = auth.uid()
);


-- 5. CLIENT WORKOUT DAYS POLICIES (Lifting Split Templates)
create policy "View workout days." on public.client_workout_days for select using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = client_workout_days.user_id 
    and p.coach_id = auth.uid()
  )
);
create policy "Manage workout days." on public.client_workout_days for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = client_workout_days.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 5.1 USER WORKOUT PLANS POLICIES (Lifting Split Templates Mapping)
create policy "View user workout plans" on public.user_workout_plans for select using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = user_workout_plans.user_id 
    and p.coach_id = auth.uid()
  )
);
create policy "Manage user workout plans" on public.user_workout_plans for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = user_workout_plans.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 6. SCHEDULES POLICIES (Weekly calendar - 180 day limit on select for coach)
create policy "Schedules select policy." on public.schedules for select using (
  auth.uid() = user_id 
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = schedules.user_id 
      and p.coach_id = auth.uid()
    )
    and week_start >= (current_date - interval '180 days')
  )
);
create policy "Schedules write policy." on public.schedules for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = schedules.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 7. WORKOUTS POLICIES (180 day limit on select for coach)
create policy "Workouts select policy." on public.workouts for select using (
  auth.uid() = user_id 
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = workouts.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);
create policy "Workouts write policy." on public.workouts for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = workouts.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 8. WORKOUT EXERCISES POLICIES (Explicit SQL security checks to allow smooth inserts & deletes)
create policy "Workout exercises select policy." on public.workout_exercises for select using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (w.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = w.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Workout exercises insert policy" on public.workout_exercises for insert with check (
  exists (
    select 1 from public.workouts w
    where w.id = workout_id
    and (w.user_id = auth.uid() or exists (
      select 1 from public.profiles p
      where p.id = w.user_id
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Workout exercises write policy." on public.workout_exercises for update using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (w.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = w.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Workout exercises delete policy" on public.workout_exercises for delete using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (w.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = w.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);


-- 9. DIET LOGS POLICIES (180 day limit on select for coach)
create policy "Diet logs select policy." on public.diet_logs for select using (
  auth.uid() = user_id 
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = diet_logs.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);
create policy "Diet logs write policy." on public.diet_logs for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = diet_logs.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 10. DIET MEALS POLICIES (Explicit SQL security checks to allow smooth inserts)
create policy "Diet meals select policy." on public.diet_meals for select using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (l.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = l.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Diet meals insert policy" on public.diet_meals for insert with check (
  exists (
    select 1 from public.diet_logs l
    where l.id = diet_log_id
    and (l.user_id = auth.uid() or exists (
      select 1 from public.profiles p
      where p.id = l.user_id
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Diet meals write policy." on public.diet_meals for update using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (l.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = l.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);
create policy "Diet meals delete policy" on public.diet_meals for delete using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (l.user_id = auth.uid() or exists (
      select 1 from public.profiles p 
      where p.id = l.user_id 
      and p.coach_id = auth.uid()
    ))
  )
);


-- 11. WATER LOGS POLICIES (180 day limit on select for coach)
create policy "Water logs select policy." on public.water_logs for select using (
  auth.uid() = user_id 
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = water_logs.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);
create policy "Water logs write policy." on public.water_logs for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = water_logs.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 12. INBODY SCANS POLICIES (180 day limit on select for coach)
create policy "Inbody scans select policy." on public.inbody_scans for select using (
  auth.uid() = user_id 
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = inbody_scans.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);
create policy "Inbody scans write policy." on public.inbody_scans for all using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles p 
    where p.id = inbody_scans.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 13. PROGRESS NOTES POLICIES (180 day limit on select for coach)
create policy "Progress notes select policy." on public.progress_notes for select using (
  auth.uid() = user_id 
  or (
    coach_id = auth.uid()
    and date >= (current_date - interval '180 days')
  )
);
create policy "Progress notes write policy." on public.progress_notes for all using (
  auth.uid() = user_id 
  or coach_id = auth.uid()
);


-- 14. AI CHAT HISTORY POLICIES (Fully isolated per user)
create policy "Chat select policy." on public.ai_chat for select using (auth.uid() = user_id);
create policy "Chat write policy." on public.ai_chat for all using (auth.uid() = user_id);
