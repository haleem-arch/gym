const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Checking columns of profiles...");
  const { data: pData, error: pErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(1);

  if (pErr) {
    console.error("profiles err:", pErr);
  } else if (pData && pData.length > 0) {
    console.log("profiles columns:", Object.keys(pData[0]));
    console.log("profiles targets fields:", Object.keys(pData[0].targets || {}));
  } else {
    console.log("No profiles profiles data found to inspect columns");
  }

  console.log("Checking columns of client_profiles...");
  const { data: cData, error: cErr } = await supabaseAdmin
    .from('client_profiles')
    .select('*')
    .limit(1);

  if (cErr) {
    console.error("client_profiles err:", cErr);
  } else if (cData && cData.length > 0) {
    console.log("client_profiles columns:", Object.keys(cData[0]));
  } else {
    console.log("No client_profiles data found to inspect columns");
  }
}

run();
