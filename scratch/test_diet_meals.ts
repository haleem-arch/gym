import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const { data: logData, error: logError } = await supabase.from('diet_logs').select('id, user_id').order('date', { ascending: false }).limit(1);
  if (logError || !logData?.length) {
    console.log("No diet log found", logError);
    return;
  }
  const logId = logData[0].id;
  const userId = logData[0].user_id;

  console.log("Found logId:", logId);
  
  // Try inserting into diet_meals without user_id
  const payload = {
    diet_log_id: logId,
    name: "Test Meal",
    time: "12:00:00",
    items: []
  };

  const { error: insertError } = await supabase.from('diet_meals').insert(payload);
  console.log("Insert error without user_id:", insertError);
}

check();
