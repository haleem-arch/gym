import { createClient } from '@supabase/supabase-js'
import { validateEmailAddress, sendBulkEmails } from './helpers/email.js'
import { waitUntil } from '@vercel/functions'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

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

  // 1. Authorize Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Fetch coach/caller profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, display_name')
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

      waitUntil(
        sendEmailPromise.catch(emailErr => {
          console.error('Failed to send onboarding email notification:', emailErr);
        })
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
            { name: 'ai_chat', key: 'user_id' }
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

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('User Management API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
