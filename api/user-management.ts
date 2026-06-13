import { createClient } from '@supabase/supabase-js'
import { validateEmailAddress, sendBulkEmails } from './helpers/email.js'
import { waitUntil } from '@vercel/functions'

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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

async function sendWhatsAppMessageHelper({
  to,
  text,
  ownerTargets,
  supabaseAdmin
}: {
  to: string;
  text: string;
  ownerTargets: any;
  supabaseAdmin: any;
}) {
  if (!ownerTargets.whatsapp_enabled || !ownerTargets.whatsapp_gateway_url) {
    return { success: false, error: 'WhatsApp integration is not enabled or configured' };
  }

  const cleanedPhone = formatWhatsAppPhone(to);
  const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
  const waEndpoint = `${gatewayUrl}/send-text`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ownerTargets.whatsapp_gateway_token) {
    headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
  }

  // Anti-ban delay throttle
  const delayMin = ownerTargets.whatsapp_delay_min !== undefined ? Number(ownerTargets.whatsapp_delay_min) : 5;
  const delayMax = ownerTargets.whatsapp_delay_max !== undefined ? Number(ownerTargets.whatsapp_delay_max) : 15;
  const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin);
  await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));

  try {
    const res = await fetch(waEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: cleanedPhone,
        text: text.trim()
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gateway returned status ${res.status}: ${errText}` };
    }

    // State-based Warm-up message check
    const nextCount = (ownerTargets.whatsapp_sent_count || 0) + 1;
    const warmupInterval = ownerTargets.whatsapp_warmup_interval !== undefined ? Number(ownerTargets.whatsapp_warmup_interval) : 10;
    const warmupPhone = ownerTargets.whatsapp_warmup_phone;

    // Fetch latest profile targets first
    const { data: latestOwnerProfile } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
      .maybeSingle();

    const latestTargets = {
      ...(latestOwnerProfile?.targets || ownerTargets),
      whatsapp_sent_count: nextCount
    };

    await supabaseAdmin
      .from('profiles')
      .update({ targets: latestTargets })
      .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');

    // Mutate the parameter so the calling context is aware of the new count
    ownerTargets.whatsapp_sent_count = nextCount;

    if (warmupPhone && nextCount % warmupInterval === 0) {
      const WARMUP_MESSAGES = [
        "Hey! Just checking in, hope you're having an awesome day! 💪",
        "Keep up the great work, consistency is key! 🔥",
        "Quick question, did you get a chance to look at the new templates? 👑",
        "Hope your training is going strong this week! Let's crush it! 🏋️",
        "All set for the next workout session! Let me know if you need anything. 👍"
      ];
      const randomText = WARMUP_MESSAGES[Math.floor(Math.random() * WARMUP_MESSAGES.length)];
      await fetch(waEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ to: formatWhatsAppPhone(warmupPhone), text: randomText })
      }).catch(() => {});
    }

    return { success: true };
  } catch (err: any) {
    console.error('sendWhatsAppMessageHelper error:', err);
    return { success: false, error: err.message };
  }
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

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  let user: any = null;
  let profile: any = null;
  let isCoach = false;

  // Only authenticate JWT token if action is not 'whatsapp-incoming'
  if (action !== 'whatsapp-incoming') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    if (supabaseServiceKey && token === supabaseServiceKey) {
      user = { id: 'ef685819-cdb3-4cd7-811d-4e6f7fff423c', email: 'owner@stride.fit' };
      isCoach = true;
    } else {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      user = authUser;

      // Fetch coach/caller profile
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .maybeSingle();
      profile = prof;

      const userEmail = user.email || '';
      const isStrideFitEmail = userEmail.toLowerCase().endsWith('@stride.fit');
      isCoach = profile?.role === 'coach' || 
                profile?.role === 'owner' || 
                profile?.role === 'admin' || 
                profile?.role === 'superadmin' || 
                user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' ||
                isStrideFitEmail;
    }
  }

  try {
    if (action === 'create') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      if (!isCoach) {
        return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
      }

      const { email, password, display_name, gender, role, targets } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const userRole = role || 'client';

      // Level 1-3 Validation for real emails (skip virtual ones ending in @stride.fit)
      if (userRole === 'coach' || !cleanEmail.endsWith('@stride.fit')) {
        const validation = await validateEmailAddress(cleanEmail);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.reason });
        }
      }

      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: display_name?.trim(),
          gender
        }
      });

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      // Set the user role in profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: cleanEmail,
          display_name: display_name?.trim() || cleanEmail.split('@')[0],
          role: userRole,
          coach_id: user.id,
          targets: { gender: gender || 'male', ...(targets || {}) }
        });

      if (profileError) {
        console.error('Error setting profile role:', profileError);
      }

      // Send dynamic onboarding emails asynchronously
      const origin = req.headers.origin || (req.headers.host ? 'https://' + req.headers.host : 'https://lifegym.app');
      const coachName = profile?.display_name || 'Your Coach';

      const sendEmailPromise = (async () => {
        if (userRole === 'coach') {
          const textCoachWelcome = `
LIFE GYM - Coach Portal Activated
Welcome to the Team, Coach ${display_name?.trim()}! 👑

A professional coach account has been successfully provisioned for you.

Your Login Details:
• Email: ${cleanEmail}
• Password: ${password}

Log In to Coach Portal:
${origin}/login

© 2026 Life Gym. All rights reserved.
          `.trim();

          const htmlCoachWelcome = `
            <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
              <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; max-width: 520px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #10b981; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
                  <p style="font-size: 9px; color: #3b82f6; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Coach Portal Activated</p>
                </div>
                
                <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to the Team, Coach ${display_name?.trim()}! 👑</h2>
                
                <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
                  A professional coach account has been successfully provisioned for you. You can now log in to manage your athletes.
                </p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 13px; color: #334155; margin-bottom: 24px; text-align: left; line-height: 1.6;">
                  <span style="color: #10b981; font-weight: bold; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Details</span>
                  <strong>Email:</strong> <code style="color: #3b82f6; font-family: monospace; font-size: 13px;">${cleanEmail}</code><br />
                  <strong>Password:</strong> <code style="color: #f59e0b; font-family: monospace; font-size: 13px;">${password}</code>
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

          await sendBulkEmails({
            to: cleanEmail,
            subject: 'Welcome to Life Gym! 👑 Your Coach Account is Ready',
            text: textCoachWelcome,
            html: htmlCoachWelcome,
            fromName: 'Life Gym Admin',
            templateId: 'coach_signup',
            templateVariables: {
              display_name: display_name?.trim() || cleanEmail.split('@')[0],
              email: cleanEmail,
              password: password,
              origin: origin
            }
          });
        } else if (userRole === 'client') {
          const contactEmail = targets?.contact_email?.trim()?.toLowerCase() || cleanEmail;
          if (contactEmail && !contactEmail.endsWith('@stride.fit')) {
            const textAthleteWelcome = `
LIFE GYM - Athlete Portal Activated
Welcome, ${display_name?.trim() || 'Athlete'}! 🏋️

Coach ${coachName} has created your training and diet logs profile on Life Gym. You can now log in to view your workouts, report compliance, check diet targets, and track progress.

Your Login Credentials:
• Portal Link: ${origin}/client-login
• Username: ${cleanEmail.split('@')[0]}
• Password: ${password}

Access Athlete Portal:
${origin}/client-login

© 2026 Life Gym. All rights reserved.
            `.trim();

            const htmlAthleteWelcome = `
              <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
                <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; max-width: 520px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3b82f6; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
                    <p style="font-size: 9px; color: #10b981; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Athlete Portal Activated</p>
                  </div>
                  
                  <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome, ${display_name?.trim() || 'Athlete'}! 🏋️</h2>
                  
                  <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
                    Coach <strong>${coachName}</strong> has created your training and diet logs profile on Life Gym. You can now log in to view your workouts, report compliance, check diet targets, and track your metrics in real-time.
                  </p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 13px; color: #334155; margin-bottom: 24px; text-align: left; line-height: 1.6;">
                    <span style="color: #3b82f6; font-weight: bold; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</span>
                    <strong>Portal Link:</strong> <code style="color: #10b981; font-family: monospace; font-size: 13px;">${origin}/client-login</code><br />
                    <strong>Username:</strong> <code style="color: #3b82f6; font-family: monospace; font-size: 13px;">${cleanEmail.split('@')[0]}</code><br />
                    <strong>Password:</strong> <code style="color: #f59e0b; font-family: monospace; font-size: 13px;">${password}</code>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 28px;">
                    <a href="${origin}/client-login" target="_blank" style="background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      Access Athlete Portal
                    </a>
                  </div>
                  
                  <p style="font-size: 10px; color: #9ca3af; margin-top: 36px; border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; margin-bottom: 0;">
                    © 2026 Life Gym. All rights reserved.
                  </p>
                </div>
              </div>
            `;

            await sendBulkEmails({
              to: contactEmail,
              subject: `Welcome to Life Gym! 🏋️ Your Athlete Account is Ready`,
              text: textAthleteWelcome,
              html: htmlAthleteWelcome,
              fromName: `${coachName} via Life Gym`,
              templateId: 'client_welcome',
              templateVariables: {
                display_name: display_name?.trim() || 'Athlete',
                coach_name: coachName,
                username: cleanEmail.split('@')[0],
                password: password,
                origin: origin
              }
            });
          }
        }
      })();

      const sendWhatsAppPromise = (async () => {
        // Find if we have a phone number
        const phoneNumber = targets?.phone_number;
        if (!phoneNumber) return;

        // Fetch owner targets to check settings
        const { data: ownerProfile } = await supabaseAdmin
          .from('profiles')
          .select('targets')
          .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
          .maybeSingle();

        const ownerTargets = ownerProfile?.targets || {};
        if (!ownerTargets.whatsapp_enabled) {
          return;
        }

        const cleanedPhone = formatWhatsAppPhone(phoneNumber);
        const DEFAULT_TPL_ATHLETE = `*LIFE GYM - Athlete Portal Activated* 🏋️\n\nWelcome, *{display_name}*!\n\nCoach *{coach_name}* has created your training and diet logs profile on Life Gym. You can now log in to view your workouts, report compliance, check diet targets, and track progress.\n\n*Your Login Credentials:*\n• *Portal Link:* {link}\n• *Username:* {username}\n• *Password:* {password}\n\n*Access Athlete Portal:*\n{link}\n\n© 2026 Life Gym.`;
        const DEFAULT_TPL_COACH = `*LIFE GYM - Coach Portal Activated* 👑\n\nWelcome, *{display_name}*!\n\nYour administrative account has been provisioned. You can now log in to manage your clients, build workout templates, track diet logs, and approve memberships.\n\n*Your Login Credentials:*\n• *Portal Link:* {link}\n• *Username:* {username}\n• *Password:* {password}\n\n© 2026 Life Gym.`;

        if (userRole === 'client') {
          // Check if triggered
          const isTriggered = ownerTargets.whatsapp_trigger_athlete_onboarding !== false;
          if (!isTriggered) return;

          const rawTemplate = ownerTargets.whatsapp_tpl_athlete_onboarding || DEFAULT_TPL_ATHLETE;
          const formattedMessage = rawTemplate
            .replace(/{display_name}/g, display_name?.trim() || 'Athlete')
            .replace(/{coach_name}/g, coachName)
            .replace(/{username}/g, cleanEmail.split('@')[0])
            .replace(/{password}/g, password)
            .replace(/{link}/g, `${origin}/client-login`);

          await sendWhatsAppMessageHelper({
            to: cleanedPhone,
            text: formattedMessage,
            ownerTargets,
            supabaseAdmin
          });
        } else if (userRole === 'coach') {
          // Check if triggered
          const isTriggered = ownerTargets.whatsapp_trigger_coach_onboarding !== false;
          if (!isTriggered) return;

          const rawTemplate = ownerTargets.whatsapp_tpl_coach_onboarding || DEFAULT_TPL_COACH;
          const formattedMessage = rawTemplate
            .replace(/{display_name}/g, display_name?.trim() || 'Coach')
            .replace(/{username}/g, cleanEmail)
            .replace(/{password}/g, password)
            .replace(/{link}/g, `${origin}/login`);

          await sendWhatsAppMessageHelper({
            to: cleanedPhone,
            text: formattedMessage,
            ownerTargets,
            supabaseAdmin
          });
        }
      })();

      waitUntil(
        Promise.all([
          sendEmailPromise.catch(emailErr => {
            console.error('Failed to send onboarding email notification:', emailErr);
          }),
          sendWhatsAppPromise.catch(waErr => {
            console.error('Failed to send onboarding WhatsApp notification:', waErr);
          })
        ])
      );

      return res.status(200).json({ user: authData.user });

    } else if (action === 'delete') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      if (!isCoach) {
        return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ error: 'Missing uid parameter' });
      }

      // Get user role before deletion to check if they are a coach
      const { data: targetProfile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching target profile:', profileErr);
      }

      const archiveAndCleanupUserDb = async (userId: string, deletedBy: string) => {
        console.log(`Archiving database records for user ${userId}...`);
        try {
          // 1. Fetch records from all user-related tables
          const simpleTables = [
            { name: 'profiles', key: 'id' },
            { name: 'client_profiles', key: 'user_id' },
            { name: 'inbody_scans', key: 'user_id' },
            { name: 'client_workout_days', key: 'user_id' },
            { name: 'schedules', key: 'user_id' },
            { name: 'ai_chat', key: 'user_id' },
            { name: 'water_logs', key: 'user_id' },
            { name: 'user_workout_plans', key: 'user_id' }
          ];

          for (const table of simpleTables) {
            const { data, error } = await supabaseAdmin
              .from(table.name)
              .select('*')
              .eq(table.key, userId);

            if (!error && data && data.length > 0) {
              const archiveRows = data.map((row: any) => ({
                original_id: userId,
                table_name: table.name,
                record_data: row,
                deleted_by: deletedBy
              }));

              await supabaseAdmin.from('deleted_records_archive').insert(archiveRows);
            }
          }

          // Progress notes
          const { data: notes, error: notesErr } = await supabaseAdmin
            .from('progress_notes')
            .select('*')
            .or(`user_id.eq.${userId},coach_id.eq.${userId}`);

          if (!notesErr && notes && notes.length > 0) {
            const archiveRows = notes.map((row: any) => ({
              original_id: row.id,
              table_name: 'progress_notes',
              record_data: row,
              deleted_by: deletedBy
            }));
            await supabaseAdmin.from('deleted_records_archive').insert(archiveRows);
          }

          // Workouts & workout_exercises
          const { data: workouts, error: workoutsErr } = await supabaseAdmin
            .from('workouts')
            .select('*')
            .eq('user_id', userId);

          if (!workoutsErr && workouts && workouts.length > 0) {
            const workoutRows = workouts.map((w: any) => ({
              original_id: w.id,
              table_name: 'workouts',
              record_data: w,
              deleted_by: deletedBy
            }));
            await supabaseAdmin.from('deleted_records_archive').insert(workoutRows);

            const workoutIds = workouts.map((w: any) => w.id);
            const { data: exercises, error: exercisesErr } = await supabaseAdmin
              .from('workout_exercises')
              .select('*')
              .in('workout_id', workoutIds);

            if (!exercisesErr && exercises && exercises.length > 0) {
              const exerciseRows = exercises.map((e: any) => ({
                original_id: e.id,
                table_name: 'workout_exercises',
                record_data: e,
                deleted_by: deletedBy
              }));
              await supabaseAdmin.from('deleted_records_archive').insert(exerciseRows);
            }
          }

          // Diet logs & diet_meals
          const { data: dietLogs, error: dietErr } = await supabaseAdmin
            .from('diet_logs')
            .select('*')
            .eq('user_id', userId);

          if (!dietErr && dietLogs && dietLogs.length > 0) {
            const dietRows = dietLogs.map((d: any) => ({
              original_id: d.id,
              table_name: 'diet_logs',
              record_data: d,
              deleted_by: deletedBy
            }));
            await supabaseAdmin.from('deleted_records_archive').insert(dietRows);

            const logIds = dietLogs.map((d: any) => d.id);
            const { data: meals, error: mealsErr } = await supabaseAdmin
              .from('diet_meals')
              .select('*')
              .in('diet_log_id', logIds);

            if (!mealsErr && meals && meals.length > 0) {
              const mealRows = meals.map((m: any) => ({
                original_id: m.id,
                table_name: 'diet_meals',
                record_data: m,
                deleted_by: deletedBy
              }));
              await supabaseAdmin.from('deleted_records_archive').insert(mealRows);
            }
          }

          // 2. Perform deletions from active tables
          await supabaseAdmin.from('inbody_scans').delete().eq('user_id', userId);
          await supabaseAdmin.from('client_workout_days').delete().eq('user_id', userId);
          await supabaseAdmin.from('user_workout_plans').delete().eq('user_id', userId);
          await supabaseAdmin.from('progress_notes').delete().or(`user_id.eq.${userId},coach_id.eq.${userId}`);
          await supabaseAdmin.from('water_logs').delete().eq('user_id', userId);
          await supabaseAdmin.from('client_profiles').delete().eq('user_id', userId);
          await supabaseAdmin.from('profiles').delete().eq('id', userId);
        } catch (e) {
          console.error(`Archiving and cleanup error for user ${userId}:`, e);
        }
      };

      if (targetProfile?.role === 'coach') {
        console.log(`User ${uid} is a coach. Starting cascade deletion of clients...`);
        
        // Find all client IDs assigned to this coach
        const { data: clientsFromProfiles } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('coach_id', uid);

        const { data: clientsFromClientProfiles } = await supabaseAdmin
          .from('client_profiles')
          .select('user_id')
          .eq('coach_id', uid);

        const clientIds = new Set<string>();
        if (clientsFromProfiles) {
          clientsFromProfiles.forEach((c: any) => clientIds.add(c.id));
        }
        if (clientsFromClientProfiles) {
          clientsFromClientProfiles.forEach((c: any) => clientIds.add(c.user_id));
        }

        if (clientIds.size > 0) {
          for (const clientId of clientIds) {
            await archiveAndCleanupUserDb(clientId, user.id);
            const { error: clientDelErr } = await supabaseAdmin.auth.admin.deleteUser(clientId);
            if (clientDelErr) {
              console.error(`Failed to delete client auth user ${clientId}:`, clientDelErr);
            }
          }
        }

        // Delete any progress notes referencing this coach directly
        const { error: notesDelErr } = await supabaseAdmin
          .from('progress_notes')
          .delete()
          .eq('coach_id', uid);
        
        if (notesDelErr) {
          console.error('Error deleting coach progress notes:', notesDelErr);
        }
      }

      await archiveAndCleanupUserDb(uid, user.id);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (deleteError) {
        console.log(`Auth deletion warning for user ${uid}:`, deleteError.message);
      }

      return res.status(200).json({ success: true });

    } else if (action === 'update') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }

      // Verify they are the system owner
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      const { uid, role, is_deactivated, password } = req.body;
      if (!uid) {
        return res.status(450).json({ error: 'Missing target uid' });
      }

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

    } else if (action === 'update-password') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      if (!isCoach) {
        return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
      }

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

    } else if (action === 'get-archived') {
      if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      const { data, error } = await supabaseAdmin
        .from('deleted_records_archive')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ archive: data });

    } else if (action === 'delete-archived') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      const { targetUid } = req.body;
      if (!targetUid) {
        return res.status(400).json({ error: 'Missing targetUid parameter' });
      }

      const { error } = await supabaseAdmin
        .from('deleted_records_archive')
        .delete()
        .eq('original_id', targetUid);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });

    } else if (action === 'restore-archived') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      const { targetUid } = req.body;
      if (!targetUid) {
        return res.status(400).json({ error: 'Missing targetUid parameter' });
      }

      // Fetch all archived rows related to this user ID
      const { data: archivedRows, error: fetchErr } = await supabaseAdmin
        .from('deleted_records_archive')
        .select('*');

      if (fetchErr || !archivedRows) {
        return res.status(500).json({ error: fetchErr?.message || 'Failed to query archive' });
      }

      const userRows = archivedRows.filter(row => 
        row.original_id === targetUid || 
        row.record_data?.user_id === targetUid || 
        row.record_data?.coach_id === targetUid
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: 'No archived records found for this user.' });
      }

      // 1. Recreate auth users for all restored profiles (coach + clients)
      const profileRows = userRows.filter(r => r.table_name === 'profiles');
      
      for (const pRow of profileRows) {
        if (pRow.record_data) {
          const pData = pRow.record_data;
          const currentUserId = pData.id;
          const email = pData.email;
          const displayName = pData.display_name;
          
          // Find matching client profile to get passcode if exists
          const clientProfileRow = userRows.find(r => r.table_name === 'client_profiles' && r.record_data?.user_id === currentUserId);
          const cpData = clientProfileRow?.record_data || {};
          const passcode = cpData.generated_passcode || pData.targets?.generated_passcode || '123456';
          
          // Delete auth user if it somehow exists (just to avoid conflict)
          await supabaseAdmin.auth.admin.deleteUser(currentUserId).catch(() => {});

          const { error: authErr } = await supabaseAdmin.auth.admin.createUser({
            id: currentUserId,
            email,
            password: passcode,
            email_confirm: true,
            user_metadata: { display_name: displayName }
          });

          if (authErr) {
            console.error(`Restoring auth account failed for user ${currentUserId}:`, authErr.message);
          }
        }
      }

      // 2. Restore SQL tables in dependency order
      const restoreOrder = [
        'profiles',
        'client_profiles',
        'inbody_scans',
        'client_workout_days',
        'schedules',
        'ai_chat',
        'water_logs',
        'user_workout_plans',
        'workouts',
        'diet_logs',
        'progress_notes',
        'workout_exercises',
        'diet_meals'
      ];

      for (const tableName of restoreOrder) {
        const rowsToRestore = userRows.filter(r => r.table_name === tableName);
        if (rowsToRestore.length > 0) {
          const records = rowsToRestore.map(r => r.record_data);
          const { error: upsertErr } = await supabaseAdmin.from(tableName).upsert(records);
          if (upsertErr) {
            console.error(`Failed to restore table ${tableName}:`, upsertErr);
          }
        }
      }

      // 3. Purge from archive
      const rowIds = userRows.map(r => r.id);
      await supabaseAdmin.from('deleted_records_archive').delete().in('id', rowIds);

      return res.status(200).json({ success: true });

    } else if (action === 'send-whatsapp') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      if (!isCoach) {
        return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
      }

      const { to, text } = req.body;
      if (!to || !text) {
        return res.status(400).json({ error: 'Missing to or text parameter' });
      }

      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const ownerTargets = ownerProfile?.targets || {};
      const sendRes = await sendWhatsAppMessageHelper({
        to,
        text,
        ownerTargets,
        supabaseAdmin
      });

      if (!sendRes.success) {
        return res.status(500).json({ error: sendRes.error });
      }

      return res.status(200).json({ success: true });

    } else if (action === 'test-whatsapp') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      const { gatewayUrl, token, phone, text } = req.body;
      if (!gatewayUrl || !phone) {
        return res.status(400).json({ error: 'Missing gatewayUrl or phone parameter' });
      }

      const cleanedPhone = formatWhatsAppPhone(phone);
      const cleanGatewayUrl = gatewayUrl.trim().replace(/\/$/, '');
      const waEndpoint = `${cleanGatewayUrl}/send-text`;
       // Wait, let's keep it clean
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      try {
        const waRes = await fetch(waEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: cleanedPhone,
            text: text || 'Connection Test'
          })
        });

        const responseText = await waRes.text();
        if (!waRes.ok) {
          return res.status(waRes.status).json({ error: `Gateway error: ${responseText}` });
        }

        return res.status(200).json({ success: true });
      } catch (err: any) {
        console.error('Test WhatsApp error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
      }
    } else if (action === 'get-whatsapp-status') {
      const isOwner = user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: Requires System Owner role' });
      }

      // Fetch owner targets to get settings
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const ownerTargets = ownerProfile?.targets || {};
      const gatewayUrl = ownerTargets.whatsapp_gateway_url;
      if (!gatewayUrl) {
        return res.status(400).json({ error: 'WhatsApp gateway URL is not configured' });
      }

      const cleanGatewayUrl = gatewayUrl.trim().replace(/\/$/, '');
      const waEndpoint = `${cleanGatewayUrl}/status`;

      const headers: Record<string, string> = {};
      if (ownerTargets.whatsapp_gateway_token) {
        headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
      }

      try {
        const waRes = await fetch(waEndpoint, {
          method: 'GET',
          headers
        });

        if (!waRes.ok) {
          const responseText = await waRes.text();
          return res.status(waRes.status).json({ error: `Gateway error: ${responseText}` });
        }

        const data = await waRes.json();
        return res.status(200).json(data);
      } catch (err: any) {
        console.error('Get WhatsApp status error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
      }
    } else if (action === 'whatsapp-event') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }
      
      if (!isCoach) {
        return res.status(403).json({ error: 'Forbidden: Requires Coach or Owner role' });
      }

      const { event, phone, variables } = req.body;
      if (!event || !phone) {
        return res.status(400).json({ error: 'Missing event or phone parameter' });
      }

      // Fetch owner targets to check settings
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const ownerTargets = ownerProfile?.targets || {};
      if (!ownerTargets.whatsapp_enabled || !ownerTargets.whatsapp_gateway_url) {
        return res.status(400).json({ error: 'WhatsApp integration is not enabled or configured' });
      }

      // Check toggles and choose templates
      let isTriggered = false;
      let rawTemplate = '';

      const DEFAULT_TPL_SUB_APPROVED = `*LIFE GYM - Subscription Approved* ✅\n\nHello, Coach *{display_name}*!\n\nWe have verified your payment of *{amount}* for the *{plan}* plan. Your subscription has been approved and extended until *{end_date}*.\n\nThank you for choosing Life Gym!`;
      const DEFAULT_TPL_SUB_REJECTED = `*LIFE GYM - Subscription Payment Refused* ❌\n\nHello, Coach *{display_name}*!\n\nYour subscription renewal request of *{amount}* for the *{plan}* plan has been rejected.\n\n*Reason for rejection:*\n{reason}\n\nPlease check your receipt and resubmit your payment verification request in your profile settings.`;
      const DEFAULT_TPL_SUB_EXPIRING = `*LIFE GYM - Subscription Expiration Alert* ⚠️\n\nHello, Coach *{display_name}*!\n\nThis is a reminder that your active coaching license on Life Gym will expire in *{days_remaining}* days. \n\nTo prevent interruption of service for you and your athletes, please renew your subscription in your profile settings.`;

      const DEFAULT_TPL_COACH_SUSPENDED = `*LIFE GYM* 👑\n\nHello, Coach *{display_name}*!\n\nYour coaching account has been suspended due to your subscription ending.\n\nTo renew your subscription and reactivate access for you and your athletes, please log in to the desktop portal.\n\n*Need help? Contact support at:*\n📧 life.gym.team@gmail.com`;
      const DEFAULT_TPL_CLIENT_SUSPENDED = `*LIFE GYM* 🏋️\n\nHello, *{display_name}*!\n\nYour athlete account has been temporarily suspended because your active training plan has ended.\n\nPlease contact your coach *{coach_name}* at *{coach_phone}* to renew your plan and reactivate your account.\n\nLet's get back to crushing weights soon! 💪🔥`;
      const DEFAULT_TPL_CLIENT_REACTIVATED = `*LIFE GYM* 🏋️\n\nHello, *{display_name}*!\n\nYour account has been reactivated! Go crush weights! 💪🔥`;
      const DEFAULT_TPL_COACH_REACTIVATED = `*LIFE GYM - Subscription Reactivated* 👑\n\nHello, Coach *{display_name}*!\n\nYour coaching account has been reactivated. \n\n*Receipt Details:*\n• *Plan Period:* {plan}\n• *Start Date:* {start_date}\n• *End Date:* {end_date}\n\nTime to get back to work! 🚀`;

      if (event === 'sub_approved') {
        isTriggered = ownerTargets.whatsapp_trigger_sub_approved !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_sub_approved || DEFAULT_TPL_SUB_APPROVED;
      } else if (event === 'sub_rejected') {
        isTriggered = ownerTargets.whatsapp_trigger_sub_rejected !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_sub_rejected || DEFAULT_TPL_SUB_REJECTED;
      } else if (event === 'sub_expiring') {
        isTriggered = ownerTargets.whatsapp_trigger_sub_expiring !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_sub_expiring || DEFAULT_TPL_SUB_EXPIRING;
      } else if (event === 'coach_suspended') {
        isTriggered = ownerTargets.whatsapp_trigger_coach_suspended !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_coach_suspended || DEFAULT_TPL_COACH_SUSPENDED;
      } else if (event === 'client_suspended') {
        isTriggered = ownerTargets.whatsapp_trigger_client_suspended !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_client_suspended || DEFAULT_TPL_CLIENT_SUSPENDED;
      } else if (event === 'client_reactivated') {
        isTriggered = ownerTargets.whatsapp_trigger_client_reactivated !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_client_reactivated || DEFAULT_TPL_CLIENT_REACTIVATED;
      } else if (event === 'coach_reactivated') {
        isTriggered = ownerTargets.whatsapp_trigger_coach_reactivated !== false;
        rawTemplate = ownerTargets.whatsapp_tpl_coach_reactivated || DEFAULT_TPL_COACH_REACTIVATED;
      } else {
        return res.status(400).json({ error: 'Invalid event type' });
      }

      if (!isTriggered) {
        return res.status(200).json({ success: true, message: 'Event is disabled in settings' });
      }

      // Substitution variables
      let formattedMessage = rawTemplate;
      if (variables && typeof variables === 'object') {
        Object.entries(variables).forEach(([k, v]) => {
          const regex = new RegExp(`{${k}}`, 'g');
          formattedMessage = formattedMessage.replace(regex, String(v));
        });
      }

      const cleanedPhone = formatWhatsAppPhone(phone);
      const sendRes = await sendWhatsAppMessageHelper({
        to: cleanedPhone,
        text: formattedMessage,
        ownerTargets,
        supabaseAdmin
      });

      if (!sendRes.success) {
        return res.status(500).json({ error: sendRes.error });
      }

      return res.status(200).json({ success: true });

    } else if (action === 'whatsapp-incoming') {
      if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
      }

      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const ownerTargets = ownerProfile?.targets || {};
      if (!ownerTargets.whatsapp_enabled) {
        return res.status(200).json({ success: true, message: 'WhatsApp integration is disabled' });
      }

      // Secure webhook: verify Authorization token if configured
      if (ownerTargets.whatsapp_gateway_token) {
        const incomingAuth = req.headers.authorization;
        const expectedAuth = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
        if (!incomingAuth || incomingAuth.trim() !== expectedAuth) {
          const rawToken = incomingAuth?.replace(/^Bearer\s+/i, '')?.trim();
          if (rawToken !== ownerTargets.whatsapp_gateway_token.trim()) {
            return res.status(401).json({ error: 'Unauthorized: Invalid gateway token' });
          }
        }
      }

      const { from, phone, sender, text, message, body } = req.body;
      const rawSender = phone || from || sender;
      const rawText = text || message || body || '';

      if (!rawSender) {
        return res.status(400).json({ error: 'Missing phone/from/sender parameter' });
      }

      const senderPhone = formatWhatsAppPhone(String(rawSender));
      const messageText = String(rawText).trim();

      // Check if the sender is our own trusted warmup phone, or owner's number, to prevent loops
      const warmupPhone = ownerTargets.whatsapp_warmup_phone ? formatWhatsAppPhone(ownerTargets.whatsapp_warmup_phone) : '';
      if (senderPhone === warmupPhone) {
        return res.status(200).json({ success: true, message: 'Ignored message from warm-up phone to prevent loops' });
      }

      // Check greeting message logic first
      let sentGreeting = false;
      if (ownerTargets.whatsapp_greeting_enabled && ownerTargets.whatsapp_greeting_message) {
        const greetedList = ownerTargets.whatsapp_greeted_numbers || [];
        if (!greetedList.includes(senderPhone)) {
          const greetingText = ownerTargets.whatsapp_greeting_message;
          const sendRes = await sendWhatsAppMessageHelper({
            to: senderPhone,
            text: greetingText,
            ownerTargets,
            supabaseAdmin
          });

          if (sendRes.success) {
            sentGreeting = true;
            const updatedGreetedList = [...greetedList, senderPhone];
            if (updatedGreetedList.length > 500) {
              updatedGreetedList.shift();
            }

            const { data: latestProfile } = await supabaseAdmin
              .from('profiles')
              .select('targets')
              .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
              .maybeSingle();

            const updatedTargets = {
              ...(latestProfile?.targets || ownerTargets),
              whatsapp_greeted_numbers: updatedGreetedList
            };

            await supabaseAdmin
              .from('profiles')
              .update({ targets: updatedTargets })
              .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');

            ownerTargets.whatsapp_greeted_numbers = updatedGreetedList;
          }
        }
      }

      // Check auto-reply rules
      let sentAutoReply = false;
      const rules = ownerTargets.whatsapp_autoreply_rules || [];
      const lowerText = messageText.toLowerCase();

      for (const rule of rules) {
        let isMatch = false;
        const kw = String(rule.keyword).toLowerCase().trim();
        if (!kw) continue;

        if (rule.matchType === 'exact') {
          isMatch = lowerText === kw;
        } else {
          isMatch = lowerText.includes(kw);
        }

        if (isMatch) {
          const sendRes = await sendWhatsAppMessageHelper({
            to: senderPhone,
            text: rule.response,
            ownerTargets,
            supabaseAdmin
          });
          if (sendRes.success) {
            sentAutoReply = true;
          }
          break; // Stop at first match
        }
      }

      return res.status(200).json({
        success: true,
        greeted: sentGreeting,
        autoReplied: sentAutoReply
      });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('User Management API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
