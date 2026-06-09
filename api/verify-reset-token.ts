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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Create Admin Client to query token (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

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

    return res.status(200).json({ valid: true, email: tokenRecord.email });
  } catch (err: any) {
    console.error('Verify Token Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
