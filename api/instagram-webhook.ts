import { createClient } from '@supabase/supabase-js';

const globalProcess = (globalThis as any).process || { env: {} };
const supabaseUrl = globalProcess.env.SUPABASE_URL || globalProcess.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY || globalProcess.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

  // 1. GET: Webhook Verification or Analytics Proxy
  if (req.method === 'GET') {
    const action = req.query.action;
    if (action === 'analytics') {
      const token = req.query.token;
      const accountId = req.query.accountId;
      if (!token || !accountId) {
        return res.status(400).json({ error: 'Missing token or accountId' });
      }
      try {
        // 1. Fetch user data
        const userRes = await fetch(
          `https://graph.facebook.com/v20.0/${accountId}?fields=id,username,name,media_count,profile_picture_url&access_token=${token}`
        );
        let userData = {};
        if (userRes.ok) {
          userData = await userRes.json();
        } else {
          console.error('Error fetching user data in proxy:', await userRes.text());
        }

        // 2. Fetch insights
        const insightsRes = await fetch(
          `https://graph.facebook.com/v20.0/${accountId}/insights?metric=reach&period=day&access_token=${token}`
        );
        let insightsData = {};
        if (insightsRes.ok) {
          insightsData = await insightsRes.json();
        } else {
          console.error('Error fetching insights in proxy:', await insightsRes.text());
        }

        // 3. Fetch media
        const mediaRes = await fetch(
          `https://graph.facebook.com/v20.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${token}`
        );
        let mediaData = {};
        if (mediaRes.ok) {
          mediaData = await mediaRes.json();
        } else {
          console.error('Error fetching media in proxy:', await mediaRes.text());
        }

        return res.status(200).json({
          user: userData,
          insights: insightsData,
          media: mediaData
        });
      } catch (err: any) {
        console.error('Instagram Analytics proxy error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
      }
    }

    const mode = req.query['hub.mode'];
    const verifyTokenQuery = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Expected verify token
    const verifyToken = globalProcess.env.INSTAGRAM_VERIFY_TOKEN || 'lifegym_verify_token';

    if (mode === 'subscribe' && verifyTokenQuery === verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  // 2. POST: Handle Events
  if (req.method === 'POST') {
    const body = req.body || {};

    if (body.object !== 'instagram') {
      return res.status(400).json({ error: 'Unsupported object type' });
    }

    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // Fetch Instagram Access Token from Haleem's profile to query sender name
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const igToken = ownerProfile?.targets?.instagram_token || 'IGAASpF0xjkZBBBZAFpLb0ZAnT0puSGoyRF9NRVl5SjJjYjZAlRGRneF9hWTk1TG9Tcy1kcmoxQUN1SlhydU9USXoyUkZAzM0I4V2tSdENSXzFOYm00dlFTLXlzcVdHdFRlNTZAHdnVrUzRWaV9WZAGxpVWM3VzBKNVJGSEgyVjBRRTBRNAZDZD';

      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          const igId = entry.id; // Instagram Business Account ID
          
          if (entry.messaging && Array.isArray(entry.messaging)) {
            for (const event of entry.messaging) {
              if (event.message) {
                const senderId = event.sender.id;
                const recipientId = event.recipient.id;
                const text = event.message.text || '';
                const mid = event.message.mid;
                const timestamp = event.timestamp; // ms epoch
                const fromMe = !!event.message.is_echo;

                // Resolve sender name (only if the message is from someone else)
                let senderName = null;
                if (!fromMe && igToken) {
                  try {
                    const profileRes = await fetch(
                      `https://graph.facebook.com/v20.0/${senderId}?fields=username,name&access_token=${igToken}`
                    );
                    if (profileRes.ok) {
                      const profileData: any = await profileRes.json();
                      senderName = profileData.username || profileData.name || null;
                    }
                  } catch (err) {
                    console.error('Error fetching sender profile:', err);
                  }
                }

                // Insert/Upsert message record into database
                const { error: insertErr } = await supabaseAdmin
                  .from('instagram_messages')
                  .upsert({
                    id: mid,
                    sender_id: senderId,
                    sender_name: senderName,
                    recipient_id: recipientId,
                    text: text,
                    created_at: new Date(timestamp).toISOString(),
                    from_me: fromMe,
                    instagram_business_account_id: igId,
                    raw_event: event,
                    mid: mid
                  });

                if (insertErr) {
                  console.error('Error inserting message into Supabase:', insertErr);
                }
              }
            }
          }
        }
      }

      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
