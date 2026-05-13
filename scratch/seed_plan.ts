import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const WORKOUT_PLANS = {
  PUSH: [
    { name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', tier: 'A', cue: '75° elbow angle; full stretch at bottom.', rationale: 'Stretch-biased loading hits upper pec optimally.' },
    { name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', tier: 'A', cue: 'Full range; neutral grip protects wrists.', rationale: 'Full ROM overhead activates all three delt heads.' },
    { name: 'Incline DB Y-Raise (20-30°)', muscle_group: 'Shoulders', tier: 'S', cue: 'Lift in Y shape.', rationale: 'S-tier Nippard pick; even tension profile.' },
    { name: 'Cable Chest Fly (low pulley)', muscle_group: 'Chest', tier: 'A', cue: 'Elbows meet; full stretch at bottom.', rationale: 'Constant cable tension through full ROM.' },
    { name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', tier: 'S', cue: 'Full overhead stretch.', rationale: '40% more growth vs pushdowns.' },
    { name: 'DB Lateral Raise (elbow-lead)', muscle_group: 'Shoulders', tier: 'A', cue: 'Elbow above wrist; control the negative.', rationale: 'Slight forward lean aligns cable/delt pull.' },
  ],
  PULL: [
    { name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', tier: 'A', cue: 'Full stretch at top; drive elbows down.', rationale: 'Same activation as pull-ups.' },
    { name: 'Chest-Supported DB Row', muscle_group: 'Back', tier: 'A', cue: 'Chest on bench removes lower back.', rationale: 'Eliminates spinal erector fatigue.' },
    { name: 'Sideways One-Arm Rear Delt Fly', muscle_group: 'Shoulders', tier: 'S', cue: 'Sweep arm across body.', rationale: 'Full ROM and stretch.' },
    { name: 'Face Pull (rope eye height)', muscle_group: 'Shoulders', tier: 'A', cue: 'External rotation; finish beside ears.', rationale: 'Protects shoulder for pressing and running longevity.' },
    { name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', tier: 'S+', cue: 'Arm behind torso; maximum stretch.', rationale: 'ONLY S+ bicep in Nippard rankings.' },
    { name: 'Zottman Curl', muscle_group: 'Biceps', tier: 'S', cue: 'Hammer up / supinate on negative.', rationale: 'Overloads eccentric; brachialis development.' },
  ],
  LEGS: [
    { name: 'Leg Press (feet high for glutes)', muscle_group: 'Legs', tier: 'S', cue: 'Full depth; feet high shifts load to glutes.', rationale: "Nippard Leg S-tier. Don't lock knees." },
    { name: 'DB Romanian Deadlift', muscle_group: 'Legs', tier: 'A', cue: 'Feel hamstring load at stretched position.', rationale: 'Hypertrophy peaks when loaded at length.' },
    { name: 'DB Bulgarian Split Squat', muscle_group: 'Legs', tier: 'A', cue: 'Front foot forward for glute emphasis.', rationale: 'Corrects L-R imbalances.' },
    { name: 'Seated Leg Curl', muscle_group: 'Legs', tier: 'S', cue: 'Loaded stretch at extension.', rationale: 'Critical for runner glute-ham tie-in.' },
    { name: '45° Back Extension (BW/DB)', muscle_group: 'Legs', tier: 'S', cue: 'Round upper back slightly to isolate glutes.', rationale: 'Glute strength = running economy.' },
    { name: 'Standing Calf Raise', muscle_group: 'Legs', tier: 'S', cue: 'Full stretch; no bouncing.', rationale: 'Runner calves need strength not just endurance.' },
  ]
};

async function seed() {
  const allExercises = [...WORKOUT_PLANS.PUSH, ...WORKOUT_PLANS.PULL, ...WORKOUT_PLANS.LEGS];
  
  for (const ex of allExercises) {
    const { error } = await supabase.from('exercises').upsert(ex, { onConflict: 'name' });
    if (error) {
       // if onConflict name fails because no unique constraint, we'll try to find it first
       const { data: existing } = await supabase.from('exercises').select('id').eq('name', ex.name).maybeSingle();
       if (!existing) {
         await supabase.from('exercises').insert(ex);
         console.log('Inserted', ex.name);
       } else {
         await supabase.from('exercises').update(ex).eq('id', existing.id);
         console.log('Updated', ex.name);
       }
    } else {
      console.log('Upserted', ex.name);
    }
  }
  console.log('Done!');
}

seed();
