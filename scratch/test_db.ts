import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Checking water_logs...");
  const { error } = await supabase.from('water_logs').select('*').limit(1);
  console.log("Water logs error:", error);
  
  console.log("Checking diet_logs...");
  const { data: dietLog } = await supabase.from('diet_logs').select('*').order('date', { ascending: false }).limit(1);
  console.log("Latest diet log:", dietLog);
}

check();
