import { createClient } from '@supabase/supabase-js'

const globalProcess = (globalThis as any).process || { env: {} };

const supabaseUrl = globalProcess.env.SUPABASE_URL || globalProcess.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY || globalProcess.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = globalProcess.env.TELEGRAM_BOT_TOKEN || globalProcess.env.VITE_TELEGRAM_BOT_TOKEN;
const OWNER_ID = globalProcess.env.OWNER_ID || 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vercel Cron Security Check
  // In production, Vercel sets CRON_SECRET. If present, we verify the Authorization header.
  const cronSecret = globalProcess.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized cron invocation attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!supabaseServiceKey) {
    console.error('Missing configuration: SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Internal Configuration Error: Missing environment variables' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Fetch all coaches
    const { data: coaches, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, email, targets')
      .eq('role', 'coach');

    if (fetchErr) {
      console.error('Error fetching coaches:', fetchErr);
      return res.status(500).json({ error: 'Failed to fetch coach profiles' });
    }

    if (!coaches || coaches.length === 0) {
      return res.status(200).json({ message: 'No coaches found to process' });
    }

    const now = new Date();
    const deactivatedCoaches: string[] = [];

    // Fetch Owner Telegram ID for notifications if needed
    let telegramChatId: string | null = null;
    if (TELEGRAM_BOT_TOKEN) {
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', OWNER_ID)
        .maybeSingle();
      
      telegramChatId = ownerProfile?.targets?.telegram_chat_id || null;
    }

    // 2. Filter and deactivate expired coaches
    for (const coach of coaches) {
      const targets = coach.targets || {};
      const isDeactivated = targets.is_deactivated === true;
      const endStr = targets.subscription_end_date;

      if (!isDeactivated && endStr) {
        const endDate = new Date(endStr);
        
        if (endDate < now) {
          // Coach has expired! Update target deactivation state
          const updatedTargets = {
            ...targets,
            is_deactivated: true
          };

          const { error: updateErr } = await supabaseAdmin
            .from('profiles')
            .update({ targets: updatedTargets })
            .eq('id', coach.id);

          if (updateErr) {
            console.error(`Failed to deactivate coach ${coach.display_name} (${coach.id}):`, updateErr);
            continue;
          }

          deactivatedCoaches.push(`${coach.display_name} (${coach.email})`);

          // 3. Notify Owner via Telegram
          if (TELEGRAM_BOT_TOKEN && telegramChatId) {
            const formattedDate = endDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const messageText = `⚠️ <b>Coach Access Deactivated (Expired)</b>\n\n` +
              `👤 <b>Coach:</b> ${coach.display_name || 'N/A'}\n` +
              `📧 <b>Email:</b> ${coach.email || 'N/A'}\n` +
              `📅 <b>Expiration Date:</b> ${formattedDate}\n\n` +
              `🔒 Access has been suspended automatically.`;

            try {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: telegramChatId,
                  text: messageText,
                  parse_mode: 'HTML'
                })
              });
            } catch (tgErr) {
              console.error('Failed to send Telegram notification for deactivation:', tgErr);
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      processed: coaches.length,
      deactivated: deactivatedCoaches
    });
  } catch (err: any) {
    console.error('Cron job exception:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
