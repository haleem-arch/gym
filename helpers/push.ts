import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const OWNER_ID = process.env.OWNER_ID || 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

export async function sendOwnerPushNotification(
  title: string,
  body: string,
  data: any = {},
  eventType: 'waitlist' | 'registration' | 'payment' | 'other' | 'whatsapp'
) {
  if (!supabaseServiceKey) return;
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: owner } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', OWNER_ID)
      .maybeSingle();

    const targets = owner?.targets || {};
    const pushToken = targets.expo_push_token;
    
    // Check toggle switch settings in owner targets
    let enabled = true;
    if (eventType === 'waitlist') {
      enabled = targets.notify_waitlist !== false;
    } else if (eventType === 'registration') {
      enabled = targets.notify_registrations !== false;
    } else if (eventType === 'payment') {
      enabled = targets.notify_payments !== false;
    } else if (eventType === 'whatsapp') {
      enabled = targets.notify_whatsapp !== false;
    } else {
      enabled = targets.notify_other !== false;
    }

    if (pushToken && enabled) {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
          to: pushToken,
          title: title,
          body: body,
          sound: 'default',
          data: { ...data, eventType }
        })
      });
      if (!res.ok) {
        console.error('Expo Push Server error:', await res.text());
      }
    }
  } catch (err) {
    console.error('sendOwnerPushNotification failed:', err);
  }
}
