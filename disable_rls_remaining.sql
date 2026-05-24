-- Disable Row Level Security on remaining tables to allow Coach Hub management
alter table public.water_logs disable row level security;
alter table public.user_workout_plans disable row level security;
alter table public.workout_exercises disable row level security;
