import { createClient } from '@supabase/supabase-js';
import { sendBulkEmails } from './helpers/email.js';
import { waitUntil } from '@vercel/functions';

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
    const { email, password, displayName, phone, age, gender, selectedPlan } = req.body;
    if (!email || !password || !displayName || !phone || !age || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Create Supabase Auth User with auto-confirm enabled
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName.trim(),
        gender
      }
    });

    if (createError) {
      return res.status(400).json({ error: createError.message });
    }

    const userId = authData.user.id;

    // Normalize username
    const baseUser = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
    const uniqueUsername = `${baseUser}${Math.floor(1000 + Math.random() * 9000)}`;
    const finalGymName = displayName.trim() + " Gym";

    // 2. Insert profile record with role = 'coach' using service role (bypasses RLS constraints)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        username: uniqueUsername,
        email: cleanEmail,
        display_name: displayName.trim(),
        role: 'coach',
        targets: {
          onboarding_completed: true,
          is_new_signup: false,
          show_welcome_animation: true,
          phone_number: phone.trim(),
          gym_name: finalGymName,
          subscription_plan: selectedPlan || '1_month',
          subscription_status: 'trial',
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          age: parseInt(age) || null,
          gender: gender
        }
      });

    if (profileError) {
      console.error('Error inserting coach profile:', profileError);
      // Clean up created user to prevent orphans
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: profileError.message || 'Failed to create coach profile' });
    }

    // 3. Send welcome email to coach asynchronously
    const origin = req.headers.origin || (req.headers.host ? 'https://' + req.headers.host : 'https://lifegym.app');
    waitUntil(
      sendBulkEmails({
        to: cleanEmail,
        subject: 'Welcome to Life Gym! 👑 Your Coach Account is Ready',
        html: `
          <div style="font-family: sans-serif; background-color: #060713; color: #f3f4f6; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); max-width: 520px; margin: 20px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
              <p style="font-size: 9px; color: #3b82f6; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Coach Portal Activated</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to the Team, Coach ${displayName.trim()}! 👑</h2>
            
            <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin-bottom: 20px;">
              Thank you for choosing Life Gym. Your professional coach account has been successfully created. You can now access your portal to configure your gym settings, add clients, prescribe workout routines, and track diet logs in real-time.
            </p>
            
            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; font-size: 13px; color: #f3f4f6; margin-bottom: 24px; text-align: left; line-height: 1.6;">
              <span style="color: #10b981; font-weight: bold; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Coach Details</span>
              <strong>Login Email:</strong> <code style="color: #3b82f6; font-family: monospace; font-size: 13px;">${cleanEmail}</code><br />
              <strong>Subscription Status:</strong> <span style="color: #10b981; font-weight: bold;">14-Day Free Trial</span>
            </div>
            
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${origin}/login" target="_blank" style="background-color: #10b981; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Log In to Coach Portal
              </a>
            </div>
            
            <p style="font-size: 10px; color: #4b5563; margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; text-align: center; margin-bottom: 0;">
              © 2026 Life Gym. All rights reserved.
            </p>
          </div>
        `,
        fromName: 'Life Gym Team'
      }).catch(emailErr => {
        console.error('Failed to send coach welcome email:', emailErr);
      })
    );

    return res.status(200).json({ success: true, user: authData.user });
  } catch (err: any) {
    console.error('Register Coach API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
