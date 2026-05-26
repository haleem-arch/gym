-- ============================================================================
-- STRIDE RITE: CASCADE DELETE FIX
-- Run this script in the Supabase SQL Editor to allow deleting users from the dashboard.
-- ============================================================================

-- OPTION A: Dynamic script (Recommended)
-- This script automatically scans all tables in the public schema for foreign keys 
-- referencing auth.users or public.profiles and recreates them with ON DELETE CASCADE 
-- (and ON DELETE SET NULL for coach_id references).
DO $$
DECLARE
    r RECORD;
    sql_drop TEXT;
    sql_create TEXT;
BEGIN
    FOR r IN (
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            tc.constraint_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema, 
            ccu.table_name AS foreign_table_name, 
            ccu.column_name AS foreign_column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public'
            AND (
                (ccu.table_schema = 'auth' AND ccu.table_name = 'users')
                OR (ccu.table_schema = 'public' AND ccu.table_name = 'profiles')
            )
    ) LOOP
        -- Skip constraints that already have ON DELETE CASCADE or are handled specifically
        -- For coach_id: we want SET NULL so clients aren't deleted if their coach is deleted.
        -- For coach_id in client_profiles: we also want SET NULL or CASCADE. Let's make it CASCADE or SET NULL.
        
        sql_drop := format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE sql_drop;
        
        IF r.column_name = 'coach_id' THEN
            sql_create := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE SET NULL', 
                r.table_schema, r.table_name, r.constraint_name, r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
        ELSE
            sql_create := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE CASCADE', 
                r.table_schema, r.table_name, r.constraint_name, r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
        END IF;
        
        EXECUTE sql_create;
        
        RAISE NOTICE 'Updated constraint % on %.% to cascade/set null.', 
            r.constraint_name, r.table_schema, r.table_name;
    END LOOP;
END $$;


-- OPTION B: Explicit commands
-- If you prefer running explicit commands, use the ones below:
/*
-- 1. Profiles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Profiles Coach ID self-reference (Set Null on Coach deletion)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_coach_id_fkey,
  ADD CONSTRAINT profiles_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Food Inventory
ALTER TABLE public.food_inventory 
  DROP CONSTRAINT IF EXISTS food_inventory_user_id_fkey,
  ADD CONSTRAINT food_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Schedules
ALTER TABLE public.schedules 
  DROP CONSTRAINT IF EXISTS schedules_user_id_fkey,
  ADD CONSTRAINT schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Workouts
ALTER TABLE public.workouts 
  DROP CONSTRAINT IF EXISTS workouts_user_id_fkey,
  ADD CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Diet Logs
ALTER TABLE public.diet_logs 
  DROP CONSTRAINT IF EXISTS diet_logs_user_id_fkey,
  ADD CONSTRAINT diet_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Inbody Scans
ALTER TABLE public.inbody_scans 
  DROP CONSTRAINT IF EXISTS inbody_scans_user_id_fkey,
  ADD CONSTRAINT inbody_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. AI Chat
ALTER TABLE public.ai_chat 
  DROP CONSTRAINT IF EXISTS ai_chat_user_id_fkey,
  ADD CONSTRAINT ai_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. Water Logs
ALTER TABLE public.water_logs 
  DROP CONSTRAINT IF EXISTS water_logs_user_id_fkey,
  ADD CONSTRAINT water_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 10. User Workout Plans
ALTER TABLE public.user_workout_plans 
  DROP CONSTRAINT IF EXISTS user_workout_plans_user_id_fkey,
  ADD CONSTRAINT user_workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11. Athlete Biometrics
ALTER TABLE public.athlete_biometrics 
  DROP CONSTRAINT IF EXISTS athlete_biometrics_user_id_fkey,
  ADD CONSTRAINT athlete_biometrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
*/
