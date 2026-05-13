import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DATA_DIR = 'C:\\Users\\haleemmamdouh\\Downloads\\data for change';

async function seed() {
  console.log("Starting data seeding...");

  // 1. Create User
  console.log("Creating user Haleem...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'haleem@example.com',
    password: 'athletepassword123',
    email_confirm: true,
  });

  if (authError && authError.message !== 'User already registered') {
    console.error("Error creating user:", authError);
    return;
  }

  let userId;
  if (authError && authError.message === 'User already registered') {
    const { data: users } = await supabase.auth.admin.listUsers();
    userId = users.users.find(u => u.email === 'haleem@example.com')?.id;
  } else {
    userId = authData.user.id;
  }

  console.log(`User ID: ${userId}`);

  // Upsert Profile
  await supabase.from('profiles').upsert({
    id: userId,
    name: 'Haleem',
    age: 18,
    height: 182,
    weight: 79.7,
    bf_percent: 17.2,
    muscle_mass: 37.6,
    bmr: 1796,
    inbody_score: 82,
    targets: { kcal: 2400, protein: 160, carbs: 240, fat: 70 }
  });

  // 2. Seed Exercises from CSV
  console.log("Seeding exercises...");
  const exercises = [];
  const exerciseCsvPath = path.join(DATA_DIR, 'Jeff Nippard Exercise Science Ranking and Techniques - Table 1.csv');
  
  if (fs.existsSync(exerciseCsvPath)) {
    await new Promise((resolve) => {
      fs.createReadStream(exerciseCsvPath)
        .pipe(csv())
        .on('data', (row) => {
          exercises.push({
            name: row['Exercise'],
            muscle_group: row['Muscle Group'],
            tier: row['Tier Ranking'],
            focus: row['Anatomical Focus'],
            cue: row['Key Technique Cues'],
            rationale: row['Scientific Rationale'],
          });
        })
        .on('end', resolve);
    });

    if (exercises.length > 0) {
      // Clear existing to avoid duplicates if running multiple times
      await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      const { error: exError } = await supabase.from('exercises').insert(exercises);
      if (exError) console.error("Error inserting exercises:", exError);
      else console.log(`Inserted ${exercises.length} exercises.`);
    }
  } else {
    console.warn("Exercise CSV not found at:", exerciseCsvPath);
  }

  // 3. Seed Food Inventory
  console.log("Seeding food inventory...");
  const foods = [
    { name: 'Chicken Breast (grilled)', kcal_per_100g: 165, protein: 31, carbs: 0, fat: 3.6, source: 'preset' },
    { name: 'Eggs (whole)', kcal_per_100g: 155, protein: 13, carbs: 1.1, fat: 11, source: 'preset' },
    { name: 'Whey Protein Powder', kcal_per_100g: 400, protein: 80, carbs: 8, fat: 4, source: 'preset' },
    { name: 'White Rice (cooked)', kcal_per_100g: 130, protein: 2.7, carbs: 28, fat: 0.3, source: 'preset' },
    { name: 'Olive Oil', kcal_per_100g: 884, protein: 0, carbs: 0, fat: 100, source: 'preset' },
    { name: 'Cucumber', kcal_per_100g: 16, protein: 0.7, carbs: 4, fat: 0.1, source: 'preset' },
    { name: 'Ful Medames (cooked)', kcal_per_100g: 110, protein: 8, carbs: 15, fat: 0.5, source: 'preset' }
  ];
  
  await supabase.from('food_inventory').delete().is('user_id', null);
  const { error: foodError } = await supabase.from('food_inventory').insert(foods);
  if (foodError) console.error("Error inserting food:", foodError);
  else console.log(`Inserted ${foods.length} base food items.`);

  // 4. Seed Default Schedule
  console.log("Seeding weekly schedule...");
  const defaultSchedule = {
    "mon": { type: "PUSH", title: "Push (Chest/Shoulders/Triceps)" },
    "tue": { type: "RUN", title: "Run or Rest" },
    "wed": { type: "PULL", title: "Pull (Back/Biceps)" },
    "thu": { type: "RUN", title: "Run or Rest" },
    "fri": { type: "RUN", title: "Run (Mandatory)" },
    "sat": { type: "LEGS", title: "Legs (Quads/Hams/Glutes/Calves)" },
    "sun": { type: "REST", title: "Full Rest + Sauna" }
  };

  const mondayDate = new Date();
  mondayDate.setDate(mondayDate.getDate() - (mondayDate.getDay() || 7) + 1); // Get current week's Monday

  await supabase.from('schedules').upsert({
    user_id: userId,
    week_start: mondayDate.toISOString().split('T')[0],
    days: defaultSchedule
  }, { onConflict: 'user_id, week_start' });

  // 5. Seed InBody Data
  console.log("Seeding InBody data...");
  const inbodyCsvPath = path.join(DATA_DIR, 'InBody-20260513.csv');
  if (fs.existsSync(inbodyCsvPath)) {
    const inbodyData = [];
    await new Promise((resolve) => {
      fs.createReadStream(inbodyCsvPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row['Weight(kg)']) {
            inbodyData.push(row);
          }
        })
        .on('end', resolve);
    });

    if (inbodyData.length > 0) {
      const latest = inbodyData[0];
      
      // Parse date '20260506155832' to '2026-05-06'
      let dateStr = latest['Date'] || '';
      let formattedDate = new Date().toISOString().split('T')[0];
      if (dateStr.length >= 8) {
         formattedDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
      }

      await supabase.from('inbody_scans').upsert({
        user_id: userId,
        date: formattedDate,
        weight: parseFloat(latest['Weight(kg)']) || 79.7,
        smm: parseFloat(latest['Skeletal Muscle Mass(kg)']) || 37.6,
        bfm: parseFloat(latest['Body Fat Mass(kg)']) || 13.7,
        bf_percent: parseFloat(latest['Percent Body Fat(%)']) || 17.2,
        bmr: parseInt(latest['Basal Metabolic Rate(kcal)']) || 1796,
        score: parseInt(latest['InBody Score']) || 82,
        segmental: {
           rightArmLean: parseFloat(latest['Right Arm Lean Mass(kg)']),
           leftArmLean: parseFloat(latest['Left Arm Lean Mass(kg)']),
           trunkLean: parseFloat(latest['Trunk Lean Mass(kg)']),
           rightLegLean: parseFloat(latest['Right Leg Lean Mass(kg)']),
           leftLegLean: parseFloat(latest['Left leg Lean Mass(kg)'])
        }
      }, { onConflict: 'user_id, date' }); // Assuming unique constraint is added
      console.log("Inserted InBody scan.");
    }
  }

  console.log("Seeding completed successfully!");
}

seed().catch(console.error);
