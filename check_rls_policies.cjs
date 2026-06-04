const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  const { data: policies, error } = await supabase
    .rpc('get_policies_summary'); // Let's try direct query or list them

  if (error) {
    // If RPC doesn't exist, run raw query using an existing RPC or inspect via schema
    console.log("RPC get_policies_summary failed, let's query pg_policies using an arbitrary schema check or inspect SQL files.");
    console.error(error);
  } else {
    console.log(policies);
  }
}

run();
