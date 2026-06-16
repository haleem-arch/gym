import { createClient } from '@supabase/supabase-js'
import { sendBulkEmails } from './helpers/email.js'

const globalProcess = (globalThis as any).process || { env: {} };

const supabaseUrl = globalProcess.env.SUPABASE_URL || globalProcess.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY || globalProcess.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const OWNER_ID = globalProcess.env.OWNER_ID || 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required parameters: name, email, phone' });
    }

    if (!supabaseServiceKey) {
      return res.status(500).json({ error: 'Database credentials not configured' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Insert into database waitlist
    const { error: dbError } = await supabaseAdmin
      .from('launch_waitlist')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      }]);

    if (dbError) {
      throw dbError;
    }

    // 2. Fetch owner's WhatsApp configurations
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', OWNER_ID)
      .maybeSingle();

    const ownerTargets = ownerProfile?.targets || {};

    // 3. Send WhatsApp confirmation in the background (non-blocking)
    if (ownerTargets.whatsapp_enabled && ownerTargets.whatsapp_gateway_url) {
      const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
      const waEndpoint = `${gatewayUrl}/send-text`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ownerTargets.whatsapp_gateway_token) {
        headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
      }

      const defaultTemplate = `*LIFE GYM* 🚀\n\nHello *{name}*!\n\nThank you for requesting access to Life Gym. We've successfully added you to our launch waitlist! 🏋️🔥\n\nWe are currently putting the final touches on the platform. As soon as the website goes live, you will be the first to receive your official credentials and early access link right here on WhatsApp!\n\nStay tuned, and let's get ready to crush those goals! 💪\n\nLife Gym Team 👑`;
      const template = ownerTargets.whatsapp_tpl_waitlist || defaultTemplate;
      const formattedMessage = template.replace(/{name}/g, name.trim());

      const cleanedPhone = formatWhatsAppPhone(phone);

      fetch(waEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: cleanedPhone,
          text: formattedMessage.trim()
        })
      }).then(async (waRes) => {
        if (waRes.ok) {
          // Increment sent count
          const nextCount = (ownerTargets.whatsapp_sent_count || 0) + 1;
          await supabaseAdmin
            .from('profiles')
            .update({
              targets: {
                ...ownerTargets,
                whatsapp_sent_count: nextCount
              }
            })
            .eq('id', OWNER_ID);
        } else {
          const errTxt = await waRes.text();
          console.error('Failed to send waitlist WhatsApp message:', errTxt);
        }
      }).catch((fetchErr) => {
        console.error('WhatsApp gateway fetch error:', fetchErr);
      });
    }

    // 4. Send Email confirmation in the background (non-blocking)
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
    <h1>You're on the list! 🚀</h1>
    <p>Hello ${name.trim()},<br><br>Thank you for requesting early access to Life Gym. We have successfully registered your spot on our launch waitlist.<br><br>We are working hard to put the final polish on the ecosystem. As soon as the platform goes live, we will send your official credentials and early access link straight to your inbox and WhatsApp!<br><br>Stay tuned, and let's get ready to crush those goals.</p>
    <div class="footer">
      © 2026 Life Gym. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    sendBulkEmails({
      to: email.trim(),
      subject: "You're on the list! 🚀 | Life Gym",
      text: `Hello ${name.trim()}!\n\nThank you for requesting access to Life Gym. We've successfully added you to our launch waitlist!\n\nWe are putting the final touches on the platform. As soon as the website goes live, we will send your official credentials and early access link to your inbox and WhatsApp!\n\nBest,\nLife Gym Team`,
      html: emailHtml
    }).then((results) => {
      console.log('Waitlist email send results:', results);
    }).catch((err) => {
      console.error('Waitlist email send failed:', err);
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Join Waitlist API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
