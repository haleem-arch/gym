import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanPassword = newPassword.trim();

    // Create Admin Client to query token and update user (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Fetch token record
    const { data: tokenRecord, error: fetchError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (fetchError) {
      console.error('Database error checking token:', fetchError);
      return res.status(500).json({ error: 'Internal database error' });
    }

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid reset link.' });
    }

    if (tokenRecord.used) {
      return res.status(400).json({ error: 'This reset link has already been used.' });
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ error: 'This reset link has expired (10-minute limit).' });
    }

    const userId = tokenRecord.user_id;

    // 2. Perform Auth Admin Action: Update password in auth.users
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: cleanPassword }
    );

    if (authUpdateError) {
      console.error('Auth update error:', authUpdateError);
      return res.status(400).json({ error: authUpdateError.message });
    }

    // 3. Sync plaintext passcode in public tables
    // Fetch profile role and targets
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('targets, role')
      .eq('id', userId)
      .maybeSingle();

    if (!profileError && profile) {
      const isCoach = profile.role === 'coach' || 
                      profile.role === 'owner' || 
                      profile.role === 'admin' || 
                      profile.role === 'superadmin' || 
                      userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

      if (isCoach) {
        // Coach: Save in targets JSON column of profiles table
        const currentTargets = profile.targets || {};
        const updatedTargets = { ...currentTargets, generated_passcode: cleanPassword };
        await supabaseAdmin
          .from('profiles')
          .update({ targets: updatedTargets })
          .eq('id', userId);
      } else {
        // Athlete/Client: Save in generated_passcode column of client_profiles table
        await supabaseAdmin
          .from('client_profiles')
          .update({ generated_passcode: cleanPassword })
          .eq('user_id', userId);
      }
    }

    // 4. Mark token as used
    const { error: tokenUpdateError } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenRecord.id);

    if (tokenUpdateError) {
      console.error('Error updating token status:', tokenUpdateError);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Complete Password Reset Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
