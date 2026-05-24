import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

const TABLES = [
  'profiles',
  'client_profiles',
  'client_workout_days',
  'exercises',
  'food_inventory',
  'schedules',
  'workouts',
  'workout_exercises',
  'diet_logs',
  'diet_meals',
  'inbody_scans',
  'ai_chat',
  'progress_notes',
  'water_logs',
  'user_workout_plans',
  'recovery_logs',
  'athlete_biometrics',
  'strava_activities'
];

async function runBackup() {
  console.log("Starting database backup...");
  const backupData = {};

  for (const table of TABLES) {
    console.log(`Backing up table: ${table}...`);
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error backing up table ${table}:`, error.message);
        backupData[table] = { error: error.message };
      } else {
        backupData[table] = data || [];
        console.log(`Successfully backed up ${backupData[table].length} rows from ${table}`);
      }
    } catch (err) {
      console.error(`Failed to fetch table ${table}:`, err);
      backupData[table] = { error: err.message || err.toString() };
    }
  }

  const backupDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, 'database_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`Database backup saved to: ${backupPath}`);
}

runBackup().catch(console.error);
