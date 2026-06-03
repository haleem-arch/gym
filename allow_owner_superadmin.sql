-- ==========================================
-- STRIDE RITE FITNESS - OWNER RLS BYPASS UPGRADE
-- ==========================================
-- This script updates the database Row Level Security (RLS) policies to allow
-- the Owner (Haleem - user_id: 'ef685819-cdb3-4cd7-811d-4e6f7fff423c') to see
-- and manage every athlete, workout, diet log, scan, and progress note in the database,
-- bypassing standard coach segregation.

-- Owner ID configuration
-- 'ef685819-cdb3-4cd7-811d-4e6f7fff423c'

-- 1. PROFILES POLICIES
drop policy if exists "View profiles." on public.profiles;
create policy "View profiles." on public.profiles for select using (
  auth.uid() = id 
  or coach_id = auth.uid() 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner can view all
  or id = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Allow viewing Owner Profile (for targets / toggles)
);

drop policy if exists "Update profiles." on public.profiles;
create policy "Update profiles." on public.profiles for update using (
  auth.uid() = id 
  or coach_id = auth.uid()
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner can update all
);

drop policy if exists "Delete profiles." on public.profiles;
create policy "Delete profiles." on public.profiles for delete using (
  auth.uid() = id 
  or coach_id = auth.uid()
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner can delete all
);


-- 2. CLIENT PROFILES POLICIES
drop policy if exists "View client profiles." on public.client_profiles;
create policy "View client profiles." on public.client_profiles for select using (
  auth.uid() = user_id 
  or coach_id = auth.uid()
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner can view all
);

drop policy if exists "Manage client profiles." on public.client_profiles;
create policy "Manage client profiles." on public.client_profiles for all using (
  auth.uid() = user_id 
  or coach_id = auth.uid()
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner can manage all
);


-- 3. CLIENT WORKOUT DAYS POLICIES (Lifting Split Templates)
drop policy if exists "View workout days." on public.client_workout_days;
create policy "View workout days." on public.client_workout_days for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = client_workout_days.user_id 
    and p.coach_id = auth.uid()
  )
);

drop policy if exists "Manage workout days." on public.client_workout_days;
create policy "Manage workout days." on public.client_workout_days for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = client_workout_days.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 4. USER WORKOUT PLANS POLICIES (Lifting Split Templates Mapping)
drop policy if exists "View user workout plans" on public.user_workout_plans;
create policy "View user workout plans" on public.user_workout_plans for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = user_workout_plans.user_id 
    and p.coach_id = auth.uid()
  )
);

drop policy if exists "Manage user workout plans" on public.user_workout_plans;
create policy "Manage user workout plans" on public.user_workout_plans for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = user_workout_plans.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 5. SCHEDULES POLICIES (Weekly calendar - 180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Schedules select policy." on public.schedules;
create policy "Schedules select policy." on public.schedules for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = schedules.user_id 
      and p.coach_id = auth.uid()
    )
    and week_start >= (current_date - interval '180 days')
  )
);

drop policy if exists "Schedules write policy." on public.schedules;
create policy "Schedules write policy." on public.schedules for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = schedules.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 6. WORKOUTS POLICIES (180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Workouts select policy." on public.workouts;
create policy "Workouts select policy." on public.workouts for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = workouts.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);

drop policy if exists "Workouts write policy." on public.workouts;
create policy "Workouts write policy." on public.workouts for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = workouts.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 7. WORKOUT EXERCISES POLICIES
drop policy if exists "Workout exercises select policy." on public.workout_exercises;
create policy "Workout exercises select policy." on public.workout_exercises for select using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (
      w.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = w.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Workout exercises insert policy" on public.workout_exercises;
create policy "Workout exercises insert policy" on public.workout_exercises for insert with check (
  exists (
    select 1 from public.workouts w
    where w.id = workout_id
    and (
      w.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p
        where p.id = w.user_id
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Workout exercises write policy." on public.workout_exercises;
create policy "Workout exercises write policy." on public.workout_exercises for update using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (
      w.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = w.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Workout exercises delete policy" on public.workout_exercises;
create policy "Workout exercises delete policy" on public.workout_exercises for delete using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_exercises.workout_id 
    and (
      w.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = w.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);


-- 8. DIET LOGS POLICIES (180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Diet logs select policy." on public.diet_logs;
create policy "Diet logs select policy." on public.diet_logs for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = diet_logs.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);

drop policy if exists "Diet logs write policy." on public.diet_logs;
create policy "Diet logs write policy." on public.diet_logs for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = diet_logs.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 9. DIET MEALS POLICIES
drop policy if exists "Diet meals select policy." on public.diet_meals;
create policy "Diet meals select policy." on public.diet_meals for select using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (
      l.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = l.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Diet meals insert policy" on public.diet_meals;
create policy "Diet meals insert policy" on public.diet_meals for insert with check (
  exists (
    select 1 from public.diet_logs l
    where l.id = diet_log_id
    and (
      l.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p
        where p.id = l.user_id
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Diet meals write policy." on public.diet_meals;
create policy "Diet meals write policy." on public.diet_meals for update using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (
      l.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = l.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Diet meals delete policy" on public.diet_meals;
create policy "Diet meals delete policy" on public.diet_meals for delete using (
  exists (
    select 1 from public.diet_logs l 
    where l.id = diet_meals.diet_log_id 
    and (
      l.user_id = auth.uid() 
      or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
      or exists (
        select 1 from public.profiles p 
        where p.id = l.user_id 
        and p.coach_id = auth.uid()
      )
    )
  )
);


-- 10. WATER LOGS POLICIES (180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Water logs select policy." on public.water_logs;
create policy "Water logs select policy." on public.water_logs for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = water_logs.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);

drop policy if exists "Water logs write policy." on public.water_logs;
create policy "Water logs write policy." on public.water_logs for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = water_logs.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 11. INBODY SCANS POLICIES (180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Inbody scans select policy." on public.inbody_scans;
create policy "Inbody scans select policy." on public.inbody_scans for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    exists (
      select 1 from public.profiles p 
      where p.id = inbody_scans.user_id 
      and p.coach_id = auth.uid()
    )
    and date >= (current_date - interval '180 days')
  )
);

drop policy if exists "Inbody scans write policy." on public.inbody_scans;
create policy "Inbody scans write policy." on public.inbody_scans for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or exists (
    select 1 from public.profiles p 
    where p.id = inbody_scans.user_id 
    and p.coach_id = auth.uid()
  )
);


-- 12. PROGRESS NOTES POLICIES (180 day limit on select for coaches, bypass for Owner)
drop policy if exists "Progress notes select policy." on public.progress_notes;
create policy "Progress notes select policy." on public.progress_notes for select using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or (
    coach_id = auth.uid()
    and date >= (current_date - interval '180 days')
  )
);

drop policy if exists "Progress notes write policy." on public.progress_notes;
create policy "Progress notes write policy." on public.progress_notes for all using (
  auth.uid() = user_id 
  or auth.uid() = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' -- Owner bypass
  or coach_id = auth.uid()
);
