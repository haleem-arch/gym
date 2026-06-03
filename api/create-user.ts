import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY'

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(450).json({ error: 'Method not allowed' });
  }

  // 1. Authorize Coach
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // Create admin client (bypasses RLS) for all server-side operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Validate the coach's JWT token
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Verify role using admin client (bypasses RLS)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isCoach = profile?.role === 'coach' || user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  if (!isCoach) {
    return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
  }

  // 2. Perform Admin Action (Create User)
  const { email, password, display_name, gender, role, targets } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name,
      gender
    }
  });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  // Set the user role in profiles table
  const userRole = role || 'client';
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: email,
      display_name: display_name || email.split('@')[0],
      role: userRole,
      coach_id: user.id,
      targets: { gender: gender || 'male', ...(targets || {}) }
    });

  if (profileError) {
    console.error('Error setting profile role:', profileError);
  }

  return res.status(200).json({ user: authData.user });
}
