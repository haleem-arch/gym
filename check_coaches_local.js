const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, targets, username');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log(`\nFound ${profiles.length} total profiles:`);
  for (const p of profiles) {
    console.log(`ID: ${p.id} | Display: ${p.display_name} | User: ${p.username} | Email: ${p.email} | Role: ${p.role} | Targets: ${JSON.stringify(p.targets)}`);
  }
}

run();
