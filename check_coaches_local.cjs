const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  const { data: p, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, role');

  if (error) {
    console.error(error);
    return;
  }
  console.log("All profiles:", p);
}

run();
