import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY'

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

  const userEmail = user.email || '';
  const isStrideFitEmail = userEmail.toLowerCase().endsWith('@stride.fit');
  const isCoach = profile?.role === 'coach' || 
                  profile?.role === 'owner' || 
                  profile?.role === 'admin' || 
                  profile?.role === 'superadmin' || 
                  user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' ||
                  isStrideFitEmail;
  if (!isCoach) {
    return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
  }

  // 2. Perform Admin Action (Update User Password)
  const { uid, password } = req.body;
  if (!uid || !password) {
    return res.status(400).json({ error: 'Missing uid or password parameter' });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    uid,
    { password }
  );

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.status(200).json({ success: true });
}
