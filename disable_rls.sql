-- Disable Row Level Security to restore Single-User mode functionality
alter table public.profiles disable row level security;
alter table public.client_profiles disable row level security;
alter table public.client_workout_days disable row level security;
alter table public.exercises disable row level security;
alter table public.food_inventory disable row level security;
alter table public.schedules disable row level security;
alter table public.workouts disable row level security;
alter table public.workout_exercises disable row level security;
alter table public.diet_logs disable row level security;
alter table public.diet_meals disable row level security;
alter table public.inbody_scans disable row level security;
alter table public.ai_chat disable row level security;
alter table public.progress_notes disable row level security;
