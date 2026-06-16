import { createClient } from '@supabase/supabase-js';
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
  
  // If it is an Egyptian number starting with 01 (e.g. 010..., 011..., 012..., 015...)
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
    
    const textWelcome = `
LIFE GYM - Coach Portal Activated
Welcome to the Team, Coach ${displayName.trim()}! 👑

Thank you for choosing Life Gym. Your professional coach account has been successfully created. You can now access your portal to configure your gym settings, add clients, prescribe workout routines, and track diet logs in real-time.

Your Coach Details:
• Login Email: ${cleanEmail}
• Subscription Status: 14-Day Free Trial

Log In to Coach Portal:
${origin}/login

© 2026 Life Gym. All rights reserved.
    `.trim();

    const htmlWelcome = `
      <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
        <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; max-width: 520px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
            <p style="font-size: 9px; color: #3b82f6; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Coach Portal Activated</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to the Team, Coach ${displayName.trim()}! 👑</h2>
          
          <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
            Thank you for choosing Life Gym. Your professional coach account has been successfully created. You can now access your portal to configure your gym settings, add clients, prescribe workout routines, and track diet logs in real-time.
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 13px; color: #334155; margin-bottom: 24px; text-align: left; line-height: 1.6;">
            <span style="color: #10b981; font-weight: bold; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Coach Details</span>
            <strong>Login Email:</strong> <code style="color: #3b82f6; font-family: monospace; font-size: 13px;">${cleanEmail}</code><br />
            <strong>Subscription Status:</strong> <span style="color: #10b981; font-weight: bold;">14-Day Free Trial</span>
          </div>
          
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${origin}/login" target="_blank" style="background-color: #10b981; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              Log In to Coach Portal
            </a>
          </div>
          
          <p style="font-size: 10px; color: #9ca3af; margin-top: 36px; border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; margin-bottom: 0;">
            © 2026 Life Gym. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const sendWhatsAppPromise = (async () => {
      if (!phone) return;

      // Fetch owner targets to check settings
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const ownerTargets = ownerProfile?.targets || {};
      if (!ownerTargets.whatsapp_enabled || !ownerTargets.whatsapp_gateway_url) {
        return;
      }

      // Check if triggered
      const isTriggered = ownerTargets.whatsapp_trigger_coach_onboarding !== false;
      if (!isTriggered) return;

      const cleanedPhone = formatWhatsAppPhone(phone);
      const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
      const waEndpoint = `${gatewayUrl}/send-text`;

      const DEFAULT_TPL_COACH = `*LIFE GYM - Coach Portal Activated* 👑\n\nWelcome, *{display_name}*!\n\nYour administrative account has been provisioned. You can now log in to manage your clients, build workout templates, track diet logs, and approve memberships.\n\n*Your Login Credentials:*\n• *Portal Link:* {link}\n• *Username:* {username}\n• *Password:* {password}\n\n© 2026 Life Gym.`;

      const rawTemplate = ownerTargets.whatsapp_tpl_coach_onboarding || DEFAULT_TPL_COACH;
      const formattedMessage = rawTemplate
        .replace(/{display_name}/g, displayName.trim())
        .replace(/{username}/g, cleanEmail)
        .replace(/{password}/g, password)
        .replace(/{link}/g, `${origin}/login`);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ownerTargets.whatsapp_gateway_token) {
        headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
      }

      // Anti-ban delay throttle
      const delayMin = ownerTargets.whatsapp_delay_min !== undefined ? Number(ownerTargets.whatsapp_delay_min) : 5;
      const delayMax = ownerTargets.whatsapp_delay_max !== undefined ? Number(ownerTargets.whatsapp_delay_max) : 15;
      const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin);
      await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));

      const waRes = await fetch(waEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: cleanedPhone,
          text: formattedMessage.trim()
        })
      });

      if (!waRes.ok) {
        const errText = await waRes.text();
        console.error(`WhatsApp Gateway Public Coach Welcome error: ${waRes.status}`, errText);
      }
    })();

    waitUntil(
      Promise.all([
        sendBulkEmails({
          to: cleanEmail,
          subject: 'Welcome to Life Gym! 👑 Your Coach Account is Ready',
          text: textWelcome,
          html: htmlWelcome,
          fromName: 'Life Gym Team',
          templateId: 'coach_signup',
          templateVariables: {
            display_name: displayName.trim(),
            email: cleanEmail,
            password: password,
            origin: origin
          }
        }).catch(emailErr => {
          console.error('Failed to send coach welcome email:', emailErr);
        }),
        sendWhatsAppPromise.catch(waErr => {
          console.error('Failed to send coach onboarding WhatsApp:', waErr);
        })
      ])
    );

    return res.status(200).json({ success: true, user: authData.user });
  } catch (err: any) {
    console.error('Register Coach API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
