import { createClient } from '@supabase/supabase-js'

const globalProcess = (globalThis as any).process || { env: {} };

const supabaseUrl = globalProcess.env.SUPABASE_URL || globalProcess.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY || globalProcess.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = globalProcess.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = globalProcess.env.OWNER_ID || 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

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
    const { displayName, email, phone, gymName, plan, age, gender } = req.body;

    if (!displayName || !email) {
      return res.status(400).json({ error: 'Missing required parameters: displayName, email' });
    }

    if (!supabaseServiceKey || !TELEGRAM_BOT_TOKEN) {
      return res.status(200).json({ success: true, warning: 'System parameters not fully configured' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Fetch Owner Telegram ID
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', OWNER_ID)
      .maybeSingle();

    const telegramChatId = ownerProfile?.targets?.telegram_chat_id;
    if (!telegramChatId) {
      return res.status(200).json({ success: true, warning: 'Owner Telegram chat ID not configured' });
    }

    // Send telegram message
    const messageText = `✨ <b>New Coach Registered</b>\n\n` +
      `👤 <b>Name:</b> ${displayName}\n` +
      `📧 <b>Email:</b> ${email}\n` +
      `📞 <b>Phone (WhatsApp):</b> ${phone || 'N/A'}\n` +
      `🎂 <b>Age:</b> ${age || 'N/A'}\n` +
      `👤 <b>Gender:</b> ${gender || 'N/A'}\n` +
      `💳 <b>Selected Plan:</b> ${plan?.toUpperCase() || 'N/A'}\n\n` +
      `🚀 Started a 14-day free trial!`;

    const telegramResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    if (!telegramResp.ok) {
      const errTxt = await telegramResp.text();
      console.error('Telegram notification failed:', errTxt);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Notify New Coach API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
