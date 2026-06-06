import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY'

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

  // 1. Authorize (Only Owner can update roles and activation statuses)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Verify they are the system owner
  const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
  }

  // 2. Perform Admin Action (Update User)
  const { uid, role, is_deactivated, password } = req.body;
  if (!uid) {
    return res.status(450).json({ error: 'Missing target uid' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Fetch the current targets for this profile to merge them
  const { data: currentProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('role, targets')
    .eq('id', uid)
    .maybeSingle();

  if (fetchError || !currentProfile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const updatedTargets = {
    ...(currentProfile.targets || {})
  };

  if (is_deactivated !== undefined) {
    updatedTargets.is_deactivated = is_deactivated;
  }

  // Update profile
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  updateData.targets = updatedTargets;

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', uid);

  if (profileError) {
    return res.status(500).json({ error: 'Failed to update profile: ' + profileError.message });
  }

  // If password update was requested
  if (password) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      uid,
      { password }
    );
    if (passwordError) {
      return res.status(500).json({ error: 'Profile updated, but password update failed: ' + passwordError.message });
    }
  }

  return res.status(200).json({ success: true });
}
