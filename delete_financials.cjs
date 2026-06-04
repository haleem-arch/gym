const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log("Deleting all financial history from profiles targets...");
  
  const { data: coaches, error: fetchError } = await supabase
    .from('profiles')
    .select('id, targets, role')
    .or(`role.eq.coach,id.eq.ef685819-cdb3-4cd7-811d-4e6f7fff423c`);
    
  if (fetchError) {
    console.error("Error fetching profiles:", fetchError);
    return;
  }
  
  console.log(`Found ${coaches.length} profiles to clean.`);
  
  for (const coach of coaches) {
    const targets = { ...(coach.targets || {}) };
    delete targets.subscription_history;
    delete targets.pending_payment;
    delete targets.last_payment_result;
    delete targets.subscription_start_date;
    delete targets.subscription_end_date;
    delete targets.subscription_duration;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ targets })
      .eq('id', coach.id);
      
    if (updateError) {
      console.error(`Error updating profile ${coach.id}:`, updateError);
    } else {
      console.log(`Cleaned profile: ${coach.id}`);
    }
  }
  console.log("All financial history deleted successfully!");
}

run();
