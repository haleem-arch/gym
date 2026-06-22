import { createClient } from '@supabase/supabase-js';
import { sendBulkEmails } from '../helpers/email.js';
import { waitUntil } from '@vercel/functions';
import { sendOwnerPushNotification } from '../helpers/push.js';

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

  const type = req.query.type || req.body.role || req.body.type || 'coach';

  try {
    if (type === 'athlete') {
      // ── ATHLETE SIGNUP FLOW ──
      const { 
        email, 
        password, 
        displayName, 
        phone,
        age, 
        height, 
        gender, 
        weight, 
        bfPercent, 
        muscleMass, 
        bmr, 
        inbodyScore 
      } = req.body;

      if (!email || !password || !displayName || !age || !height || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (email.length > 100 || password.length > 100 || displayName.length > 100 || (phone && phone.length > 30)) {
        return res.status(400).json({ error: 'Input fields exceed allowed character limits' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const weightVal = parseFloat(weight) || 75;
      const heightVal = parseFloat(height) || 175;
      const ageVal = parseInt(age) || 25;
      const bmrVal = parseInt(bmr) || Math.round(10 * weightVal + 6.25 * heightVal - 5 * ageVal + (gender === 'male' ? 5 : -161));
      const scoreVal = parseInt(inbodyScore) || 70;
      const bfVal = parseFloat(bfPercent) || 15;
      const smmVal = parseFloat(muscleMass) || 35;
      const bfmVal = Math.round((weightVal * (bfVal / 100)) * 10) / 10;

      // Calculate premium macros based on body stats
      const kcal = Math.round(bmrVal * 1.375); // Moderately active multiplier
      const protein = Math.round(weightVal * 2.0); // 2g/kg
      const fat = Math.round(weightVal * 0.8); // 0.8g/kg
      const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));

      // Rest Day Macros
      const restKcal = Math.max(1200, kcal - 300);
      const restProtein = Math.max(80, protein - 10);
      const restFat = fat;
      const restCarbs = Math.max(50, Math.round((restKcal - restProtein * 4 - restFat * 9) / 4));

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

      // 2. Insert profile record with role = 'athlete' using service role (bypasses RLS constraints)
      const dayNutritionMap: Record<string, any> = {
        'REST': { kcal: restKcal, protein: restProtein, carbs: restCarbs, fat: restFat },
        'RUN': { kcal: kcal + 200, protein: protein, carbs: carbs + 50, fat: fat },
        'RUN + GYM': { kcal: kcal + 400, protein: protein + 10, carbs: carbs + 70, fat: fat + 5 },
        'PUSH': { kcal, protein, carbs, fat },
        'PULL': { kcal, protein, carbs, fat },
        'LEGS': { kcal, protein, carbs, fat }
      };

      const updatedTargets = {
        onboarding_completed: true,
        show_first_time_message: true,
        show_welcome_animation: true,
        water_goal_ml: 3000,
        phone_number: phone ? phone.trim() : null,
        day_nutrition: dayNutritionMap,
        kcal, protein, carbs, fat
      };

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          username: uniqueUsername,
          email: cleanEmail,
          display_name: displayName.trim(),
          role: 'athlete',
          coach_id: null,
          age: ageVal,
          height: heightVal,
          weight: weightVal,
          bf_percent: bfVal,
          muscle_mass: smmVal,
          bmr: bmrVal,
          inbody_score: scoreVal,
          targets: updatedTargets
        });

      if (profileError) {
        console.error('Error inserting athlete profile:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(400).json({ error: profileError.message || 'Failed to create athlete profile' });
      }

      // 3. Insert client profile record
      const { error: clientProfileError } = await supabaseAdmin
        .from('client_profiles')
        .insert({
          user_id: userId,
          coach_id: null,
          age: ageVal,
          height: heightVal,
          experience_level: 'beginner',
          workouts_per_week: 3,
          goals: 'Self-guided fitness tracking',
          injuries_notes: '',
          generated_passcode: password,
          has_active_plan: true
        });

      if (clientProfileError) {
        console.error('Error inserting client profile:', clientProfileError);
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(400).json({ error: clientProfileError.message || 'Failed to create athlete client profile' });
      }

      // 4. Seed default workout templates into user_workout_plans
      const defaultSplits = [
        {
          key: 'PUSH',
          exercises: [
            { id: 'onb-push-0', name: 'Incline DB Bench Press (45 Degree)', muscle_group: 'Chest', sets: 3, rest: 120 },
            { id: 'onb-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
            { id: 'onb-push-2', name: 'Incline DB Y-Raise (20-30 Degree)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
            { id: 'onb-push-3', name: 'Cable Chest Fly (low pulley)', muscle_group: 'Chest', sets: 3, rest: 120 },
            { id: 'onb-push-4', name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', sets: 3, rest: 120 },
            { id: 'onb-push-5', name: 'DB Lateral Raise (elbow-lead)', muscle_group: 'Shoulders', sets: 3, rest: 120 }
          ]
        },
        {
          key: 'PULL',
          exercises: [
            { id: 'onb-pull-0', name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', sets: 3, rest: 120 },
            { id: 'onb-pull-1', name: 'Chest-Supported DB Row', muscle_group: 'Back', sets: 3, rest: 120 },
            { id: 'onb-pull-2', name: 'Sideways One-Arm Rear Delt Fly', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
            { id: 'onb-pull-3', name: 'Face Pull (rope eye height)', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
            { id: 'onb-pull-4', name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', sets: 3, rest: 120 },
            { id: 'onb-pull-5', name: 'Zottman Curl', muscle_group: 'Biceps', sets: 3, rest: 120 }
          ]
        },
        {
          key: 'LEGS',
          exercises: [
            { id: 'onb-legs-0', name: 'Leg Press (feet high for glutes)', muscle_group: 'Glutes', sets: 3, rest: 120 },
            { id: 'onb-legs-1', name: 'DB Romanian Deadlift', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
            { id: 'onb-legs-2', name: 'DB Bulgarian Split Squat', muscle_group: 'Quads', sets: 3, rest: 120 },
            { id: 'onb-legs-3', name: 'Seated Leg Curl', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
            { id: 'onb-legs-4', name: '45 Degree Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
            { id: 'onb-legs-5', name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
          ]
        }
      ];

      const planPromises = defaultSplits.map(split => {
        return supabaseAdmin
          .from('user_workout_plans')
          .upsert({
            user_id: userId,
            plan_type: split.key,
            exercises: split.exercises
          }, { onConflict: 'user_id,plan_type' });
      });
      await Promise.all(planPromises);

      // 5. Skip initial InBody composition scan (athlete starts fresh)

      // 6. Send welcome email to athlete asynchronously
      const origin = req.headers.origin || (req.headers.host ? 'https://' + req.headers.host : 'https://lifegym.app');
      
      const textWelcome = `
Welcome to Life Gym, Athlete ${displayName.trim()}! 🦾

Your self-guided athlete account has been successfully created. You can now log in using your phone browser to log meals, record workouts, track hydration, and analyze InBody body composition trends.

How to Get Started:
• Workouts: Navigate to the "Workouts" tab to customize and edit your training split and workout plans.
• Diet: Go to the "Diet" tab to log meals, customize food choices, and manage your nutrition targets.

Need Support?
• WhatsApp: Send a message to +201031449441 or click here: https://wa.me/201031449441
• Email: Contact us at life.gym.team@gmail.com

Your Account Details:
• Portal Link: ${origin}/
• Login Email: ${cleanEmail}

Let's crush some goals! 💪🔥
      `.trim();

      const htmlWelcome = `
        <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
          <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; max-width: 520px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
              <p style="font-size: 9px; color: #10b981; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Athlete Workspace Activated</p>
            </div>
            
            <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to Life Gym, Athlete ${displayName.trim()}! 🦾</h2>
            
            <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Your self-guided athlete account has been successfully created. You can now log in using your phone browser to log meals, record workouts, track hydration, and analyze InBody body composition trends.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 13px; color: #334155; margin-bottom: 24px; text-align: left; line-height: 1.6;">
              <span style="color: #3b82f6; font-weight: bold; display: block; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">How to Get Started</span>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; margin-bottom: 16px;">
                <li style="margin-bottom: 8px;"><strong>Workouts:</strong> Navigate to the <strong>Workouts</strong> tab to create and edit your training split and workout plans.</li>
                <li style="margin-bottom: 8px;"><strong>Diet:</strong> Go to the <strong>Diet</strong> tab to log your meals, customize food choices, and manage your nutrition targets.</li>
              </ul>
              
              <span style="color: #3b82f6; font-weight: bold; display: block; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Need Support?</span>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;"><strong>WhatsApp:</strong> Message us at <a href="https://wa.me/201031449441" style="color: #3b82f6; font-weight: bold; text-decoration: underline;">+201031449441</a></li>
                <li style="margin-bottom: 8px;"><strong>Email:</strong> Email us at <a href="mailto:life.gym.team@gmail.com" style="color: #3b82f6; font-weight: bold; text-decoration: underline;">life.gym.team@gmail.com</a></li>
              </ul>
              
              <span style="color: #3b82f6; font-weight: bold; display: block; margin-top: 16px; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Account Details</span>
              <strong>Login Email:</strong> <code style="color: #3b82f6; font-family: monospace; font-size: 13px;">${cleanEmail}</code><br />
            </div>
            
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${origin}/" target="_blank" style="background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Log In to Athlete Portal
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

        // Check if WhatsApp triggers are enabled
        const isTriggered = ownerTargets.whatsapp_trigger_athlete_self_signup !== false;
        if (!isTriggered) return;

        const cleanedPhone = formatWhatsAppPhone(phone);
        const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
        const waEndpoint = `${gatewayUrl}/send-text`;

        const DEFAULT_TPL_ATHLETE = `*Welcome to Life Gym, Athlete {display_name}!* 🦾\n\nYour self-guided athlete account has been successfully created.\n\nYou can now log in using your phone browser to log meals, record workouts, track hydration, and view InBody composition trends.\n\n*How to get started:*\n• *Workouts:* Navigate to the Workouts tab to customize and edit your workout plans.\n• *Diet:* Go to the Diet tab to log meals, customize food choices, and manage your nutrition targets.\n\n*Need Support?*\n• *Email Support:* Reply to this message, or email us at life.gym.team@gmail.com\n\n*Your Account Details:*\n• *Portal Link:* {link}\n• *Login Email:* {username}\n\nLet's crush some goals! 💪🔥`;

        const rawTemplate = ownerTargets.whatsapp_tpl_athlete_self_signup || DEFAULT_TPL_ATHLETE;
        const formattedMessage = rawTemplate
          .replace(/{display_name}/g, displayName.trim())
          .replace(/{username}/g, cleanEmail)
          .replace(/{kcal}/g, String(kcal))
          .replace(/{link}/g, `${origin}/`);

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
          console.error(`WhatsApp Gateway Public Athlete Welcome error: ${waRes.status}`, errText);
        }
      })();

      waitUntil(
        Promise.all([
          sendBulkEmails({
            to: cleanEmail,
            subject: 'Welcome to Life Gym! 🦾 Your Athlete Portal is Ready',
            text: textWelcome,
            html: htmlWelcome,
            fromName: 'Life Gym Team',
            templateId: 'athlete_signup',
            templateVariables: {
              display_name: displayName.trim(),
              email: cleanEmail,
              kcal: String(kcal),
              origin: origin
            }
          }).catch(emailErr => {
            console.error('Failed to send athlete welcome email:', emailErr);
          }),
          sendWhatsAppPromise.catch(waErr => {
            console.error('Failed to send athlete onboarding WhatsApp:', waErr);
          }),
          sendOwnerPushNotification(
            'New Athlete Signup! 🏋️',
            `${displayName.trim()} has registered as an athlete.`,
            { id: userId, name: displayName, email: cleanEmail },
            'registration'
          ).catch(pushErr => console.error('Athlete register push failed:', pushErr))
        ])
      );

      return res.status(200).json({ success: true, user: authData.user });
    } else {
      // ── COACH SIGNUP FLOW ──
      const { email, password, displayName, phone, age, gender, selectedPlan } = req.body;
      if (!email || !password || !displayName || !phone || !age || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (email.length > 100 || password.length > 100 || displayName.length > 100 || phone.length > 30) {
        return res.status(400).json({ error: 'Input fields exceed allowed character limits' });
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

        // Check if WhatsApp triggers are enabled
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
          }),
          sendOwnerPushNotification(
            'New Coach Signup! 👑',
            `${displayName.trim()} has registered as a coach.`,
            { id: userId, name: displayName, email: cleanEmail },
            'registration'
          ).catch(pushErr => console.error('Coach register push failed:', pushErr))
        ])
      );

      return res.status(200).json({ success: true, user: authData.user });
    }
  } catch (err: any) {
    console.error('Register API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
