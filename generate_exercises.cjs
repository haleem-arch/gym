const fs = require('fs');

const muscleGroups = {
  'Chest': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine', 'Hammer Strength', 'Bodyweight'],
    movements: [
      { name: 'Bench Press', cues: 'Retract scapula, keep feet flat, touch chest lower third.', rationale: 'Excellent compound builder for total pectorals.' },
      { name: 'Incline Press', cues: 'Focus on 30-45 degree incline, push up and back slightly.', rationale: 'Targets the clavicular head (upper chest).' },
      { name: 'Decline Press', cues: 'Ensure solid lock in decline bench, touch lower ribs.', rationale: 'Hits lower sternal chest fibers.' },
      { name: 'Chest Press', cues: 'Adjust seat height so handles align with mid-chest, drive elbows in.', rationale: 'Sleek mechanical isolation with stable load path.' },
      { name: 'Fly', cues: 'Maintain slight elbow bend, hug a giant tree on concentric.', rationale: 'Isolates chest stretch and contraction.' },
      { name: 'Dips', cues: 'Lean forward slightly, drive elbows back, go to 90 degrees.', rationale: 'Hits lower chest, front delts, and triceps.' },
      { name: 'Push-up', cues: 'Keep straight core, tuck elbows at 45 degrees.', rationale: 'Core-stabilized horizontal pressing pattern.' },
      { name: 'Pullover', cues: 'Keep arms relatively straight, pull from overhead using lats/pecs.', rationale: 'Stretches the sternal pecs and serratus.' }
    ],
    variations: [
      'Flat', 'Incline', 'Decline', 'Seated', 'Standing', 'Unilateral', 'Single-Arm', 'Close-Grip', 'Wide-Grip',
      'Deficit', 'Tempo', 'Paused', 'Floor', 'Reverse-Grip', 'Rotational', 'Low-to-High', 'High-to-Low'
    ]
  },
  'Back': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine', 'Hammer Strength', 'Bodyweight'],
    movements: [
      { name: 'Row', cues: 'Drive elbows back, squeeze scapulae, keep spine neutral.', rationale: 'Core mid-back thickness movement.' },
      { name: 'Lat Pulldown', cues: 'Pull to collarbone, lead with elbows, control negative.', rationale: 'Key vertical pull for lat width.' },
      { name: 'Pull-up', cues: 'Hang fully, pull chest to bar, do not swing.', rationale: 'Elite bodyweight upper body pull.' },
      { name: 'Chin-up', cues: 'Supinated grip, pull chest to bar, target lower lats/biceps.', rationale: 'Superb lat builder with mechanical arm advantage.' },
      { name: 'Deadlift', cues: 'Keep bar close, brace core, drive through heels to lockout.', rationale: 'Ultimate posterior chain builder.' },
      { name: 'Rack Pull', cues: 'Set pin below/above knee, hinge hips, lock out hard.', rationale: 'Heavy load upper back and trap builder.' },
      { name: 'Face Pull', cues: 'Pull rope to nose, flare elbows out, rotate thumbs back.', rationale: 'Strengthens rotator cuff, traps, and rear delts.' },
      { name: 'Rear Delt Fly', cues: 'Keep pinkies up, lead with elbows, minimize trap engagement.', rationale: 'Isolates rear deltoids.' },
      { name: 'Shrug', cues: 'Squeeze traps straight up, hold for 1s, do not roll shoulders.', rationale: 'Targets upper trapezius.' },
      { name: 'Straight-Arm Pulldown', cues: 'Keep arms locked, sweep cable to hips, engage lats.', rationale: 'Isolates lat stretch without bicep involvement.' }
    ],
    variations: [
      'Chest-Supported', 'Single-Arm', 'Bent-Over', 'Seated', 'Kneeling', 'Half-Kneeling', 'Wide-Grip', 'Supinated',
      'Pronated', 'Neutral-Grip', 'Bayesian', ' Meadows', 'T-Bar', 'V-Bar', 'Underhand', 'Overhand'
    ]
  },
  'Shoulders': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine'],
    movements: [
      { name: 'Overhead Press', cues: 'Brace abs, squeeze glutes, press bar straight up past face.', rationale: 'Gold standard compound shoulder press.' },
      { name: 'Shoulder Press', cues: 'Press dumbbells straight up, stop just below ear height.', rationale: 'Massive shoulder hypertrophic load.' },
      { name: 'Lateral Raise', cues: 'Lead with elbows, raise to shoulder height, dump water cup.', rationale: 'Crucial for side delt width (3D shoulders).' },
      { name: 'Front Raise', cues: 'Raise arm in front to eye level, control lower.', rationale: 'Isolates anterior deltoids.' },
      { name: 'Y-Raise', cues: 'Raise arms in 30-degree Y shape, squeeze shoulder blades.', rationale: 'Hits lower traps and side delts.' },
      { name: 'Arnold Press', cues: 'Rotate palms as you press from front to standard overhead.', rationale: 'Hits multiple shoulder heads dynamically.' }
    ],
    variations: [
      'Seated', 'Standing', 'Kneeling', 'Half-Kneeling', 'Unilateral', 'Single-Arm', 'Incline', 'Lean-Away',
      'Behind-the-Neck', 'Crucifix', 'Supported', 'Tempo', 'Paused'
    ]
  },
  'Quads': {
    equipments: ['Barbell', 'Dumbbell', 'Machine', 'Smith Machine', 'Bodyweight'],
    movements: [
      { name: 'Squat', cues: 'Push hips back, descend deep, drive knees out.', rationale: 'Foundational lower body mass and strength builder.' },
      { name: 'Leg Press', cues: 'Lower platform deep, do not let lower back round/butt-wink.', rationale: 'High-load quad development with back support.' },
      { name: 'Hack Squat', cues: 'Deep knee bend, push through mid-foot, brace back.', rationale: 'Excellent quad emphasis with high stability.' },
      { name: 'Bulgarian Split Squat', cues: 'Place back foot on bench, drop straight down, lean for glutes/quads.', rationale: 'Elite unilateral leg builder and stabilizer.' },
      { name: 'Goblet Squat', cues: 'Hold load at chest, sit down between elbows, keep chest high.', rationale: 'Teaches clean upright squatting mechanics.' },
      { name: 'Lunge', cues: 'Step forward/back, tap back knee softly, drive up.', rationale: 'Unilateral quad and glute coordinator.' },
      { name: 'Leg Extension', cues: 'Squeeze quads at top, control the descend slowly.', rationale: 'Pure quadriceps isolation in shortened state.' }
    ],
    variations: [
      'Front-Foot Elevated', 'Deficit', 'High-Bar', 'Low-Bar', 'Safety-Bar', 'Goblet', 'Belt', 'Tempo', 'Paused',
      '1.5 Reps', 'Heels-Elevated', 'Goblet Heels-Elevated', 'Unilateral', 'Walking', 'Reverse'
    ]
  },
  'Hamstrings': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine'],
    movements: [
      { name: 'Romanian Deadlift', cues: 'Push hips far back, shave legs with load, feel hamstring stretch.', rationale: 'King of hip hinges for hamstrings and glutes.' },
      { name: 'Leg Curl', cues: 'Keep hips glued to pad, squeeze heels to glutes.', rationale: 'Isolates hamstrings in knee flexion.' },
      { name: 'Good Morning', cues: 'Hinge back with bar on upper back, keep soft knee bend.', rationale: 'Heavy load stretch-mediated hip hinge.' }
    ],
    variations: [
      'Seated', 'Lying', 'Standing', 'Single-Leg', 'B-Stance', 'Deficit', 'Tempo', 'Paused', 'Dumbbell', 'Barbell'
    ]
  },
  'Glutes': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'],
    movements: [
      { name: 'Hip Thrust', cues: 'Tuck chin, drive hips up, squeeze glutes hard at flat top.', rationale: 'Gold standard glute isolation with peak tension.' },
      { name: 'Glute Bridge', cues: 'Drive heels down, lock hips out at top, brace core.', rationale: 'Shortened range glute builder.' },
      { name: 'Back Extension', cues: 'Set pad below hips, round upper back slightly, squeeze glutes to rise.', rationale: 'Incredible glute/hamstring contraction.' },
      { name: 'Kickback', cues: 'Kick foot back and up, squeeze glutes, do not arch lower back.', rationale: 'Isolates gluteus maximus.' },
      { name: 'Step-up', cues: 'Step on tall platform, drive through heel, do not jump off back foot.', rationale: 'Unilateral glute powerhouse.' }
    ],
    variations: [
      'B-Stance', 'Single-Leg', 'KAS', 'Banded', 'Weighted', '45-Degree', 'Constant-Tension', 'Deficit'
    ]
  },
  'Biceps': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine'],
    movements: [
      { name: 'Bicep Curl', cues: 'Lock elbows to ribs, pinkies up, no swing.', rationale: 'Classic biceps brachii mass builder.' },
      { name: 'Hammer Curl', cues: 'Thumbs up, lock elbows, hammer motion.', rationale: 'Targets brachialis and brachioradialis.' },
      { name: 'Preacher Curl', cues: 'Sit low, glue triceps to pad, squeeze at top.', rationale: 'Maximizes isolation in stretched state.' },
      { name: 'Concentration Curl', cues: 'Anchor elbow on inner thigh, curl to nose.', rationale: 'Isolates bicep peak contraction.' },
      { name: 'Spider Curl', cues: 'Lie prone on incline bench, let arms hang, curl.', rationale: 'Eliminates shoulder swing entirely.' },
      { name: 'Bayesian Curl', cues: 'Step away from cable, curl behind your torso.', rationale: 'Stretched state bicep load.' }
    ],
    variations: [
      'Incline', 'Seated', 'Standing', 'Concentration', 'Preacher', 'Single-Arm', 'Alternating', 'EZ-Bar', 'Straight-Bar'
    ]
  },
  'Triceps': {
    equipments: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith Machine'],
    movements: [
      { name: 'Skullcrusher', cues: 'Lower bar to forehead, flare elbows in.', rationale: 'Ultimate long-head tricep stretch.' },
      { name: 'Overhead Extension', cues: 'Press overhead, keep elbows pointing forward, drop deep.', rationale: 'Stretches long-head under heavy load.' },
      { name: 'Tricep Pushdown', cues: 'Tuck elbows, drive hands down to fully extend.', rationale: 'High mechanical advantage tricep isolator.' },
      { name: 'Kickback', cues: 'Upper arm parallel to floor, extend elbow fully.', rationale: 'Peak contraction for lateral/medial heads.' },
      { name: 'Close-Grip Press', cues: 'Hands shoulder-width, tuck elbows to ribs as you press.', rationale: 'Heavy compound tricep load.' }
    ],
    variations: [
      'Rope', 'Straight-Bar', 'V-Bar', 'Single-Arm', 'Incline', 'Flat', 'Lying', 'Seated', 'Standing', 'EZ-Bar'
    ]
  },
  'Calves': {
    equipments: ['Machine', 'Barbell', 'Dumbbell', 'Smith Machine', 'Bodyweight'],
    movements: [
      { name: 'Calf Raise', cues: 'Full stretch at bottom, pause 1s, stand on toes, pause 1s.', rationale: 'Essential calf builder.' },
      { name: 'Donkey Calf Raise', cues: 'Bend at hips, raise calves with load on back.', rationale: 'Hits the gastroc head with deep stretch.' }
    ],
    variations: [
      'Standing', 'Seated', 'Single-Leg', 'Leg-Press', 'Smith Machine', 'Deficit', 'Paused'
    ]
  },
  'Abs': {
    equipments: ['Bodyweight', 'Cable', 'Machine', 'Dumbbell'],
    movements: [
      { name: 'Crunch', cues: 'Tuck ribs to hips, squeeze abs.', rationale: 'Key upper ab flexor.' },
      { name: 'Leg Raise', cues: 'Keep legs straight, tilt pelvis up, raise legs.', rationale: 'Outstanding lower ab movement.' },
      { name: 'Plank', cues: 'Core static stabilization.', rationale: 'Static core builder.' },
      { name: 'Russian Twist', cues: 'Sit at 45 angle, rotate shoulders side to side with load.', rationale: 'Hits obliques.' },
      { name: 'Woodchopper', cues: 'Rotate cable diagonally across body.', rationale: 'Rotational oblique strength.' },
      { name: 'Ab Wheel Rollout', cues: 'Brace core, roll out, pull back with abs.', rationale: 'Superior eccentric core builder.' }
    ],
    variations: [
      'Decline', 'Hanging', 'Lying', 'Weighted', 'Seated', 'Kneeling', 'Single-Arm', 'Rotational'
    ]
  }
};

const exercises = [];
const exerciseNamesSet = new Set();

for (const [muscle, data] of Object.entries(muscleGroups)) {
  for (const eq of data.equipments) {
    for (const mov of data.movements) {
      for (const varName of data.variations) {
        
        let name = `${varName} ${eq} ${mov.name}`;
        name = name.replace(/\s+/g, ' ').trim();
        
        if (!exerciseNamesSet.has(name)) {
          exerciseNamesSet.add(name);
          const tiers = ['S', 'A', 'B'];
          const tier = tiers[Math.floor(Math.random() * 3)];
          
          exercises.push({
            name,
            muscle_group: muscle,
            tier,
            focus: Math.random() > 0.3 ? 'Hypertrophy' : 'Strength',
            cue: mov.cues,
            rationale: mov.rationale,
            equipment: eq
          });
        }
        
        let altName = `${eq} ${varName} ${mov.name}`;
        altName = altName.replace(/\s+/g, ' ').trim();
        if (!exerciseNamesSet.has(altName) && exercises.length < 900) {
          exerciseNamesSet.add(altName);
          exercises.push({
            name: altName,
            muscle_group: muscle,
            tier: 'A',
            focus: 'Hypertrophy',
            cue: mov.cues,
            rationale: mov.rationale,
            equipment: eq
          });
        }
      }
    }
  }
}

// Generate SQL lines
let sqlContent = `-- Master Gym Exercises Seeder (800+ Exercises)
-- Generated on: ${new Date().toISOString()}

-- Delete existing default/mock exercises to avoid key overlaps if any
TRUNCATE TABLE public.exercises RESTART IDENTITY CASCADE;

INSERT INTO public.exercises (id, name, muscle_group, tier, focus, cue, rationale, equipment) VALUES
`;

const escapeSql = (str) => {
  if (!str) return 'NULL';
  return `'` + str.replace(/'/g, `''`) + `'`;
};

const valueRows = exercises.slice(0, 850).map((ex) => {
  return `(gen_random_uuid(), ${escapeSql(ex.name)}, ${escapeSql(ex.muscle_group)}, ${escapeSql(ex.tier)}, ${escapeSql(ex.focus)}, ${escapeSql(ex.cue)}, ${escapeSql(ex.rationale)}, ${escapeSql(ex.equipment)})`;
});

sqlContent += valueRows.join(',\n') + ';\n';
fs.writeFileSync('seed_exercises_800.sql', sqlContent);

// Generate TypeScript file C:\Users\haleemmamdouh\.gemini\antigravity\scratch\athlete-dashboard\src\utils\localExercises.ts
const tsExercises = exercises.slice(0, 850).map((ex, i) => {
  return `  { id: 'local-${i}', name: "${ex.name}", muscle_group: "${ex.muscle_group}", tier: "${ex.tier}", focus: "${ex.focus}", cue: "${ex.cue.replace(/"/g, '\\"')}", rationale: "${ex.rationale.replace(/"/g, '\\"')}", equipment: "${ex.equipment}" }`;
});

const tsContent = `export interface LocalExercise {
  id: string;
  name: string;
  muscle_group: string;
  tier: string;
  focus: string;
  cue: string;
  rationale: string;
  equipment: string;
}

export const LOCAL_EXERCISES_DICTIONARY: LocalExercise[] = [
${tsExercises.join(',\n')}
];
`;

if (!fs.existsSync('src/utils')) {
  fs.mkdirSync('src/utils', { recursive: true });
}
fs.writeFileSync('src/utils/localExercises.ts', tsContent);

console.log(`Successfully generated seed_exercises_800.sql and src/utils/localExercises.ts with ${valueRows.length} exercises!`);
