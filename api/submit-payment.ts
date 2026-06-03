import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY'

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
    return res.status(405).json({ error: 'Method not allowed' });
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
    const detailsText = method === 'telda' 
      ? `Telda Username: ${sender_details.telda_username || 'N/A'}\nPhone: ${sender_details.phone || 'N/A'}`
      : `Wallet Phone: ${sender_details.phone || 'N/A'}`;

    const captionText = `🔔 New Coach Subscription Request\n\n👤 Coach Details:\n• Name: ${profile.display_name || 'N/A'}\n• Email: ${profile.email || 'N/A'}\n• ID: ${user.id}\n\n💳 Payment Details:\n• Plan: ${period}\n• Price: ${planPrice}\n• Method: ${method === 'telda' ? 'Telda' : 'Mobile Wallet'}\n${detailsText}\n\n⚡️ Tap approve to extend the coach plan.`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Approve & Add Plan', callback_data: `approve:${user.id}:${paymentId}:${period}` },
          { text: '❌ Reject Payment', callback_data: `reject:${user.id}:${paymentId}` }
        ]
      ]
    };

    if (method === 'wallet' && screenshot) {
      // If we have a base64 screenshot, decode and send as photo via multipart
      try {
        const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
        // Decode base64 to binary using atob (available in Node 18+)
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const te = new TextEncoder();
        const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
        const crlf = '\r\n';

        const headerPart = (name: string, value: string) =>
          te.encode(`--${boundary}${crlf}Content-Disposition: form-data; name="${name}"${crlf}${crlf}${value}${crlf}`);

        const parts: Uint8Array[] = [
          headerPart('chat_id', String(telegramChatId)),
          headerPart('caption', captionText),
          headerPart('parse_mode', 'HTML'),
          headerPart('reply_markup', JSON.stringify(inlineKeyboard)),
          te.encode(`--${boundary}${crlf}Content-Disposition: form-data; name="photo"; filename="screenshot.jpg"${crlf}Content-Type: image/jpeg${crlf}${crlf}`),
          bytes,
          te.encode(`${crlf}--${boundary}--${crlf}`)
        ];

        // Concatenate all parts
        const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
        const body = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of parts) {
          body.set(part, offset);
          offset += part.length;
        }

        const photoResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
          body: body
        });

        if (!photoResp.ok) {
          const errText = await photoResp.text();
          console.error('Telegram sendPhoto error:', errText);
          // Fall back to text message
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: captionText + '\n\n(Screenshot upload failed)',
              reply_markup: inlineKeyboard
            })
          });
        }
      } catch (photoErr) {
        console.error('Photo processing error:', photoErr);
        // Fall back to text message
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: captionText + '\n\n(Photo could not be sent)',
            reply_markup: inlineKeyboard
          })
        });
      }
    } else {
      // Telda or no screenshot — send a plain text message
      const msgResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: captionText,
          reply_markup: inlineKeyboard
        })
      });

      if (!msgResp.ok) {
        const errText = await msgResp.text();
        console.error('Telegram sendMessage error:', errText);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Submit Payment API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + (err?.message || String(err)) });
  }
}
