-- ============================================================
-- ULTIMATE ATHLETE DASHBOARD RECOVERY PATCH (v2)
-- 1. Fixes water_logs column schema mismatch (timestamp -> time)
-- 2. Fixes workouts column schema mismatch (adds status column)
-- 3. Seeds exact matching exercises for WorkoutHome & AI Coach
-- ============================================================

-- 1. FIX WATER LOGS SCHEMA
ALTER TABLE public.water_logs RENAME COLUMN timestamp TO time;

-- 2. FIX WORKOUTS SCHEMA
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS status text not null default 'completed';

-- 3. SEED MATCHING GYM EXERCISES
TRUNCATE TABLE public.exercises RESTART IDENTITY CASCADE;

INSERT INTO public.exercises (name, muscle_group, tier, focus, cue, rationale, equipment) VALUES
-- PUSH (Exact Matches for WorkoutHome)
('Incline DB Bench Press (45°)', 'Chest', 'S', 'Upper Chest', 'Set bench to 45 degrees, tuck elbows slightly, press up and inward.', 'Great stretch-mediated hypertrophy for clavicular head.', 'Dumbbell'),
('DB Shoulder Press (seated neutral)', 'Shoulders', 'A', 'Anterior Delts', 'Keep palms facing each other (neutral grip), press overhead.', 'Highly stable, joint-friendly vertical pressing movement.', 'Dumbbell'),
('Incline DB Y-Raise (20-30°)', 'Shoulders', 'S', 'Lateral Delts', 'Lie chest-down on a 20-30 degree incline bench, raise arms in a Y shape.', 'Exceptional resistance profile for the lateral delts in the scapular plane.', 'Dumbbell'),
('Cable Chest Fly (low pulley)', 'Chest', 'A', 'Lower/Upper Chest', 'Set pulleys low, bring cables up and together across the chest.', 'Provides continuous tension through the entire horizontal adduction range.', 'Cable'),
('Overhead Cable Extension (rope)', 'Arms', 'S', 'Long Head Triceps', 'Keep elbows pointing up, extend fully at the top.', 'Places the long head of the triceps in a highly stretched position.', 'Cable'),
('DB Lateral Raise (elbow-lead)', 'Shoulders', 'A', 'Lateral Delts', 'Lead the motion with your elbows, slight forward lean.', 'Classic lateral delt mass builder.', 'Dumbbell'),

-- PULL (Exact Matches for WorkoutHome)
('Lat Pulldown (wide grip)', 'Back', 'S', 'Lat Width', 'Grip wider than shoulder width, pull bar to upper chest.', 'Superior vertical pulling movement for isolating the latissimus dorsi.', 'Cable'),
('Chest-Supported DB Row', 'Back', 'A', 'Mid Back / Rhomboids', 'Lie chest-down on an incline bench, pull dumbbells to hips.', 'Removes lower back fatigue to fully isolate upper/mid back musculature.', 'Dumbbell'),
('Sideways One-Arm Rear Delt Fly', 'Shoulders', 'S', 'Rear Delts', 'Stand sideways to cable/machine, pull arm across body.', 'Allows for incredible stretch and isolation of the posterior deltoid.', 'Cable'),
('Face Pull (rope eye height)', 'Back', 'A', 'Rear Delts / External Rotators', 'Pull rope towards eyes, externally rotate wrists at the end.', 'Essential for shoulder health, posture, and rear delt development.', 'Cable'),
('Incline DB Curl - Bayesian', 'Arms', 'S', 'Long Head Biceps', 'Sit on a 45 degree incline bench, let arms hang fully behind torso, curl up.', 'Unmatched stretch-mediated hypertrophy for the biceps brachii.', 'Dumbbell'),
('Zottman Curl', 'Arms', 'A', 'Biceps & Brachioradialis', 'Curl up with palms up, rotate at the top, lower with palms down.', 'Effectively overloads the eccentric phase for forearm and bicep growth.', 'Dumbbell'),

-- LEGS (Exact Matches for WorkoutHome)
('Leg Press (feet high for glutes)', 'Legs', 'S', 'Glutes & Quads', 'Place feet high and wide on the sled, drive through heels.', 'Shifts tension towards hip extension to heavily bias the gluteus maximus.', 'Machine'),
('DB Romanian Deadlift', 'Legs', 'S', 'Hamstrings & Glutes', 'Hinge at the hips, keep dumbbells close to shins, feel hamstring stretch.', 'The ultimate hamstring and glute lengthening movement.', 'Dumbbell'),
('DB Bulgarian Split Squat', 'Legs', 'S', 'Quads & Glutes', 'Elevate rear foot, keep upright torso for quads or lean forward for glutes.', 'Incredible unilateral compound builder that resolves strength asymmetries.', 'Dumbbell'),
('Seated Leg Curl', 'Legs', 'S', 'Hamstrings', 'Keep hips firmly against pad, curl weight fully under seat.', 'Stretched position produces superior hamstring hypertrophy compared to lying curls.', 'Machine'),
('45° Back Extension (BW/DB)', 'Legs', 'A', 'Glutes & Erector Spinae', 'Round upper back slightly to disengage lower back, squeeze glutes at top.', 'Excellent open-chain hip extension exercise for glute development.', 'Bodyweight/Dumbbell'),
('Standing Calf Raise', 'Calves', 'A', 'Gastrocnemius', 'Deep stretch at the bottom, pause 1 second, explode up.', 'Essential straight-leg calf builder for overall lower leg mass.', 'Machine'),

-- CLASSIC ESSENTIAL EXERCISES (For Custom Searching / AI Replacement)
('Barbell Back Squat', 'Legs', 'S', 'Quads & Glutes', 'Break at hips and knees simultaneously, maintain neutral spine.', 'The foundational lower body compound lift.', 'Barbell'),
('Barbell Bench Press', 'Chest', 'A', 'Overall Chest', 'Retract scapulae, slight arch, touch mid-chest.', 'Standard horizontal pressing compound for mechanical tension.', 'Barbell'),
('Barbell Deadlift', 'Legs', 'A', 'Posterior Chain', 'Keep bar over mid-foot, hinge hips, pull with flat back.', 'Ultimate heavy posterior chain builder.', 'Barbell'),
('Overhead Barbell Press', 'Shoulders', 'A', 'Anterior Delts', 'Brace core, press bar in a straight vertical line.', 'Essential upper body vertical pressing standard.', 'Barbell'),
('Pull-Ups', 'Back', 'S', 'Lat Width', 'Full dead hang, pull chest to bar.', 'The ultimate bodyweight lat builder.', 'Bodyweight'),
('Barbell Row', 'Back', 'A', 'Back Thickness', 'Keep torso parallel to floor, pull bar to belly button.', 'Excellent for total back thickness and erector strength.', 'Barbell'),
('Dumbbell Bicep Curl', 'Arms', 'B', 'Biceps', 'Keep elbows pinned to sides, supinate wrists at top.', 'Classic bicep isolation.', 'Dumbbell'),
('Tricep Rope Pushdown', 'Arms', 'B', 'Triceps', 'Spread rope apart at bottom, keep elbows fixed.', 'Standard tricep isolation.', 'Cable'),
('Hanging Leg Raise', 'Abs', 'A', 'Core', 'Roll pelvis upward, avoid swinging legs.', 'Advanced core and lower ab builder.', 'Bodyweight');
