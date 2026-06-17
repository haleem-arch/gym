import { createClient } from '@supabase/supabase-js'

const globalProcess = (globalThis as any).process || { env: {} };

const supabaseUrl = globalProcess.env.SUPABASE_URL || globalProcess.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY || globalProcess.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

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

    // 1. Fetch failed logs
    const { data: failedLogs, error: logsErr } = await supabaseAdmin
      .from('whatsapp_delivery_logs')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10); // Batch process up to 10 at a time

    if (logsErr) {
      console.error('Failed to fetch failed logs:', logsErr);
      return res.status(500).json({ error: 'Database error fetching logs' });
    }

    if (!failedLogs || failedLogs.length === 0) {
      return res.status(200).json({ success: true, message: 'No failed messages found to retry' });
    }

    // 2. Fetch Owner configs for gateway
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('targets')
      .eq('id', OWNER_ID)
      .maybeSingle();

    const ownerTargets = ownerProfile?.targets || {};
    if (!ownerTargets.whatsapp_enabled || !ownerTargets.whatsapp_gateway_url) {
      return res.status(400).json({ error: 'WhatsApp integration is not enabled or configured' });
    }

    const gatewayUrl = ownerTargets.whatsapp_gateway_url.trim().replace(/\/$/, '');
    const waEndpoint = `${gatewayUrl}/send-text`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (ownerTargets.whatsapp_gateway_token) {
      headers['Authorization'] = `Bearer ${ownerTargets.whatsapp_gateway_token.trim()}`;
    }

    const retriedResults = [];

    // 3. Process the queue
    for (const log of failedLogs) {
      const nextRetryCount = log.retry_count + 1;
      
      try {
        console.log(`Retrying WhatsApp message to ${log.recipient_phone} (Attempt ${nextRetryCount})...`);
        const response = await fetch(waEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: log.recipient_phone,
            text: log.message_text
          })
        });

        if (response.ok) {
          // Success! Update status
          await supabaseAdmin
            .from('whatsapp_delivery_logs')
            .update({
              status: 'sent',
              error_message: null,
              retry_count: nextRetryCount,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', log.id);

          retriedResults.push({ id: log.id, recipient: log.recipient_phone, status: 'success' });
        } else {
          const errText = await response.text();
          // Log failed attempt
          await supabaseAdmin
            .from('whatsapp_delivery_logs')
            .update({
              status: 'failed',
              error_message: `Gateway returned status ${response.status}: ${errText}`,
              retry_count: nextRetryCount,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', log.id);

          retriedResults.push({ id: log.id, recipient: log.recipient_phone, status: 'failed', error: errText });
        }
      } catch (err: any) {
        console.error(`Retry exception for log ${log.id}:`, err);
        await supabaseAdmin
          .from('whatsapp_delivery_logs')
          .update({
            status: 'failed',
            error_message: err.message || String(err),
            retry_count: nextRetryCount,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', log.id);

        retriedResults.push({ id: log.id, recipient: log.recipient_phone, status: 'failed', error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      retriedCount: failedLogs.length,
      results: retriedResults
    });
  } catch (err: any) {
    console.error('WhatsApp retry cron exception:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
