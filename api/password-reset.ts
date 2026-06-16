import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendBulkEmails } from './helpers/email.js';
import { waitUntil } from '@vercel/functions';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return cleaned;
}

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

  const action = req.query.action || req.body.action;

  if (!action) {
    return res.status(400).json({ error: 'Action parameter is required' });
  }

  try {
    if (action === 'request') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
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
        subject: 'Reset Your Password | Life Gym 🔐',
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background-color: #07080f;
      color: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 40px 20px;
      margin: 0;
      text-align: center;
    }
    .card {
      background: rgba(12, 16, 32, 0.82);
      border: 1px solid rgba(59, 130, 246, 0.18);
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      margin: 0 auto;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      text-align: left;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: #3b82f6;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-align: center;
    }
    p {
      color: #8a99ad;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
    }
    .footer {
      font-size: 12px;
      color: #4b5563;
      margin-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">LIFE GYM</div>
    <h1>Password Reset Request 🔐</h1>
    <p>Hello ${profile.display_name || 'there'},<br><br>We received a request to reset the password for your Life Gym account.<br><br><strong style="color: #f59e0b;">Note: This reset link is only valid for 10 minutes.</strong></p>
    <div class="btn-container">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <div class="footer">
      © 2026 Life Gym. All rights reserved.
    </div>
  </div>
</body>
</html>`,
        fromName: 'Life Gym'
      });

      const failed = sendResults.some(r => !r.success);
      if (failed) {
        console.error('Nodemailer failed to dispatch reset email:', sendResults);
        return res.status(500).json({ error: 'Failed to send password reset email' });
      }

      return res.status(200).json({ success: true });

    } else if (action === 'verify') {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

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

    } else if (action === 'complete') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.trim().length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanPassword = newPassword.trim();

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
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('targets, role, email, display_name')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profile) {
        const isCoach = profile.role === 'coach' || 
                        profile.role === 'owner' || 
                        profile.role === 'admin' || 
                        profile.role === 'superadmin' || 
                        userId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

        if (isCoach) {
          const currentTargets = profile.targets || {};
          const updatedTargets = { ...currentTargets, generated_passcode: cleanPassword };
          await supabaseAdmin
            .from('profiles')
            .update({ targets: updatedTargets })
            .eq('id', userId);
        } else {
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

      // 5. Send Password Changed Notifications (Email & WhatsApp)
      if (!profileError && profile) {
        const userEmail = profile.email || tokenRecord.email;
        const displayName = profile.display_name || userEmail.split('@')[0];
        const currentTargets = profile.targets || {};
        const phoneNumber = currentTargets.phone_number;

        const sendNotificationsPromise = (async () => {
          // A. Send Email Notification
          try {
            const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background-color: #07080f;
      color: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 40px 20px;
      margin: 0;
      text-align: center;
    }
    .card {
      background: rgba(12, 16, 32, 0.82);
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      margin: 0 auto;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      text-align: left;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: #3b82f6;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-align: center;
    }
    p {
      color: #8a99ad;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .footer {
      font-size: 12px;
      color: #4b5563;
      margin-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">LIFE GYM</div>
    <h1 style="color: #10b981;">Password Changed! 🔐</h1>
    <p>Hello ${displayName},<br><br>This is a security confirmation that your Life Gym account password has been successfully updated.<br><br>If you did not initiate this change, please contact support immediately at <strong>life.gym.team@gmail.com</strong> to secure your account.<br><br>Stay strong,<br>Life Gym Team 👑</p>
    <div class="footer">
      © 2026 Life Gym. All rights reserved.
    </div>
  </div>
</body>
</html>`;

            await sendBulkEmails({
              to: userEmail,
              subject: "Your password has been changed 🔐 | Life Gym",
              text: `Hello ${displayName},\n\nThis is a confirmation that your account password has been changed successfully.\n\nIf you did not request this change, please contact support immediately at life.gym.team@gmail.com.\n\nBest,\nLife Gym Team`,
              html: emailHtml,
              fromName: 'Life Gym'
            });
          } catch (emailErr) {
            console.error('Password reset success email failed:', emailErr);
          }

          // B. Send WhatsApp Notification
          if (phoneNumber) {
            try {
              // Fetch owner targets to check settings
              const { data: ownerProfile } = await supabaseAdmin
                .from('profiles')
                .select('targets')
                .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
                .maybeSingle();

              const ownerTargets = ownerProfile?.targets || {};
              if (ownerTargets.whatsapp_enabled && ownerTargets.whatsapp_gateway_url) {
                const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
                const waEndpoint = `${gatewayUrl}/send-text`;

                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (ownerTargets.whatsapp_gateway_token) {
                  headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
                }

                const defaultTemplate = `*LIFE GYM - Password Changed* 🔐\n\nHello, *{display_name}*!\n\nThis is a confirmation that your account password has been changed successfully. \n\nIf you did not request this change, please contact support immediately at:\n📧 life.gym.team@gmail.com\n\nLife Gym Team 👑`;
                const template = ownerTargets.whatsapp_tpl_password_changed || defaultTemplate;
                const formattedMessage = template.replace(/{display_name}/g, displayName);

                const cleanedPhone = formatWhatsAppPhone(phoneNumber);
                await fetch(waEndpoint, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    to: cleanedPhone,
                    text: formattedMessage.trim()
                  })
                });
              }
            } catch (waErr) {
              console.error('Password reset success WhatsApp failed:', waErr);
            }
          }
        })();

        waitUntil(sendNotificationsPromise);
      }

      return res.status(200).json({ success: true });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('Password Reset API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
