import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY' // will fall back to process env in Vercel

const TELEGRAM_BOT_TOKEN = '8802232137:AAEdXRO2LXC0GtR_coXMh6bM_0ATpJd4G0Q';
const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

const PLAN_PRICES: Record<string, string> = {
  '2 weeks': '2,000 EGP',
  '1 month': '3,500 EGP',
  '3 months': '8,500 EGP',
  '6 months': '14,000 EGP'
};

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
    return res.status(450).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authorize user is a coach
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

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role, display_name, email, targets')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.role !== 'coach' && user.id !== OWNER_ID) {
      return res.status(403).json({ error: 'Forbidden: Requires Coach role' });
    }

    // 2. Read request body
    const { period, method, sender_details, screenshot } = req.body;
    if (!period || !method || !sender_details) {
      return res.status(400).json({ error: 'Missing required parameters: period, method, sender_details' });
    }

    const planPrice = PLAN_PRICES[period];
    if (!planPrice) {
      return res.status(400).json({ error: `Invalid subscription period: ${period}` });
    }

    // Check if coach already has a pending payment
    const currentTargets = profile.targets || {};
    if (currentTargets.pending_payment) {
      return res.status(400).json({ error: 'You already have a pending transaction awaiting verification.' });
    }

    const paymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;

    // 3. Write pending payment info to Coach targets
    const updatedTargets = {
      ...currentTargets,
      pending_payment: {
        id: paymentId,
        period,
        method,
        sender_details,
        amount: planPrice,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }
    };
    // Clear any previous rejection or approval notice
    delete updatedTargets.last_payment_result;

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ targets: updatedTargets })
      .eq('id', user.id);

    if (updateErr) {
      return res.status(500).json({ error: 'Failed to record transaction status: ' + updateErr.message });
    }

    // 4. Retrieve owner Telegram Chat ID
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', OWNER_ID)
      .maybeSingle();

    const telegramChatId = ownerProfile?.targets?.telegram_chat_id;
    if (!telegramChatId) {
      return res.status(200).json({ 
        success: true, 
        warning: 'Transaction submitted but owner Telegram notifications are not configured yet.' 
      });
    }

    // 5. Send message to Telegram
    const detailsHtml = method === 'telda' 
      ? `<b>Telda Username:</b> ${sender_details.telda_username || 'N/A'}\n<b>Phone:</b> ${sender_details.phone || 'N/A'}`
      : `<b>Wallet Phone:</b> ${sender_details.phone || 'N/A'}`;

    const captionText = `
🔔 <b>New Coach Subscription Request</b>

👤 <b>Coach Details:</b>
• <b>Name:</b> ${profile.display_name || 'N/A'}
• <b>Email:</b> ${profile.email || 'N/A'}
• <b>ID:</b> <code>${user.id}</code>

💳 <b>Payment Details:</b>
• <b>Chosen Plan:</b> ${period}
• <b>Price:</b> ${planPrice}
• <b>Method:</b> ${method === 'telda' ? 'Telda' : 'Mobile Wallet'}
${detailsHtml}

⚡️ <i>Click approve below to extend the coach's plan immediately.</i>
`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Approve & Add Plan', callback_data: `approve:${paymentId}:${period}` },
          { text: '❌ Reject Payment', callback_data: `reject:${paymentId}` }
        ]
      ]
    };

    if (method === 'wallet' && screenshot) {
      // If we have a base64 screenshot, parse and send as file
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const parts = [
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${telegramChatId}\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${captionText}\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="reply_markup"\r\n\r\n${JSON.stringify(inlineKeyboard)}\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="screenshot.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
        buffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
      ];
      
      const multipartBody = Buffer.concat(parts);

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Telegram bot photo sending error:', errorText);
      }
    } else {
      // If Telda or no screenshot, send simple message
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: captionText,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Telegram bot text message sending error:', errorText);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Submit Payment API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
