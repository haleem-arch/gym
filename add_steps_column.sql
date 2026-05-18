-- Update Athlete Biometrics Table to include Steps
alter table public.athlete_biometrics add column if not exists steps integer default 0;
