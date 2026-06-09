import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendBulkEmails } from './helpers/email.js';

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
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Create Admin Client to query profiles and insert token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Rate Limiting Check (Maximum 2 requests per 5 minutes per email)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('email', cleanEmail)
      .gte('created_at', fiveMinutesAgo);

    if (countError) {
      console.error('Error checking rate limit count:', countError);
    } else if (count !== null && count >= 2) {
      return res.status(429).json({ 
        error: 'Too many password reset requests. Maximum 2 requests per 5 minutes. Please wait before trying again.' 
      });
    }

    // 2. Check if user exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, display_name, targets')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (profileError) {
      console.error('Database error fetching profile:', profileError);
      return res.status(500).json({ error: 'Internal database error' });
    }

    if (!profile) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    // 3. Athlete Device Guard
    const userAgent = req.headers['user-agent'] || '';
    const isDesktop = /windows nt|macintosh|x11|linux|electron/i.test(userAgent) && !/mobile|android|iphone|ipad/i.test(userAgent);
    
    if (profile.role === 'client' && isDesktop) {
      return res.status(403).json({ error: 'Athletes must reset password from their mobile device.' });
    }

    // 4. Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 5. Save to public.password_reset_tokens
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        email: cleanEmail,
        user_id: profile.id,
        token,
        expires_at: expiresAt,
        used: false
      });

    if (insertError) {
      console.error('Database error inserting reset token:', insertError);
      return res.status(500).json({ error: 'Failed to generate reset link' });
    }

    // 6. Send recovery email
    const host = req.headers.host || 'localhost:5173';
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const origin = `${proto}://${host}`;

    const resetLink = `${origin}/reset-password?token=${token}`;

    const sendResults = await sendBulkEmails({
      to: cleanEmail,
      subject: 'Reset Your Stride Fit Password',
      html: `
        <div style="background-color: #060713; color: #f3f4f6; font-family: sans-serif; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
          <h1 style="color: #ffffff; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 24px;">Stride Fit Password Reset</h1>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">Hello ${profile.display_name || 'there'},</p>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your Stride Fit account.</p>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; font-weight: bold; color: #facc15;">Note: This link is only valid for 10 minutes.</p>
          <div style="margin: 36px 0;">
            <a href="${resetLink}" style="background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 11px; line-height: 1.6; margin-top: 40px; border-top: 1px solid #1f2937; padding-top: 20px;">
            If you did not request this reset, please ignore this email.
          </p>
        </div>
      `,
      fromName: 'Stride Fit Support'
    });

    const failed = sendResults.some(r => !r.success);
    if (failed) {
      console.error('Nodemailer failed to dispatch reset email:', sendResults);
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Request Password Reset Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
