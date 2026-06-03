import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InlrdmVpX3JvbGUiLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0' // Service Role Key

const TELEGRAM_BOT_TOKEN = '8802232137:AAEdXRO2LXC0GtR_coXMh6bM_0ATpJd4G0Q';

const REJECTION_REASONS: Record<string, string> = {
  'invalid_screenshot': 'Invalid Screenshot / Proof of Transaction',
  'wrong_amount': 'Wrong Amount Transferred',
  'not_received': 'Payment Not Received in Wallet / Bank'
};

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
    const { message, callback_query } = req.body;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // ─── 1. HANDLE TEXT COMMANDS (/start or /getid) ───────────────────
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.trim();

      if (text.startsWith('/start') || text.startsWith('/getid')) {
        const replyText = `
👑 <b>LIFE GYM Telegram Bot Config</b>

Your unique Telegram Chat ID is:
<code>${chatId}</code>

<b>Instructions:</b>
1. Copy this Chat ID: <code>${chatId}</code>
2. Log in as the Owner on the website dashboard.
3. Open the <b>System Settings</b> tab.
4. Paste this ID into the <b>Telegram Chat ID for Approvals</b> field and click save.
5. You will now receive subscription approval cards directly in this chat!
`;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: 'HTML'
          })
        });

        return res.status(200).json({ ok: true });
      }
    }

    // ─── 2. HANDLE INLINE BUTTON CALLBACK QUERIES ─────────────────────
    if (callback_query) {
      const callbackQueryId = callback_query.id;
      const callbackData = callback_query.data;
      const originalMessage = callback_query.message;
      const chatId = originalMessage.chat.id;
      const messageId = originalMessage.message_id;

      const tokens = callbackData.split(':');
      const action = tokens[0];

      // Format check
      if (!action) {
        return res.status(200).json({ ok: true });
      }

      // Action 1: Approve
      if (action === 'approve') {
        const coachId = tokens[1];
        const paymentId = tokens[2];
        const period = tokens[3];

        const { data: coach, error: fetchErr } = await supabaseAdmin
          .from('profiles')
          .select('display_name, email, targets')
          .eq('id', coachId)
          .maybeSingle();

        if (fetchErr || !coach) {
          await answerCallback(callbackQueryId, 'Coach profile not found.');
          return res.status(200).json({ ok: true });
        }

        const targets = coach.targets || {};
        const pendingPayment = targets.pending_payment;

        if (!pendingPayment || pendingPayment.id !== paymentId) {
          await answerCallback(callbackQueryId, 'This transaction was already processed or does not exist.');
          // Remove buttons from message since it is stale
          await editMessageText(chatId, messageId, originalMessage, '⚠️ <i>This payment has already been processed or cancelled.</i>');
          return res.status(200).json({ ok: true });
        }

        // Calculate subscription extension dates
        const nowObj = new Date();
        let baseDate = nowObj;

        // If current subscription is active, extend from it. Otherwise extend from now.
        const currentEnd = targets.subscription_end_date ? new Date(targets.subscription_end_date) : null;
        if (currentEnd && currentEnd > nowObj && targets.is_deactivated !== true) {
          baseDate = currentEnd;
        }

        const durationDays = getDurationDays(period);
        const newEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Update target parameters
        const updatedTargets = {
          ...targets,
          subscription_start_date: targets.subscription_start_date || nowObj.toISOString(),
          subscription_end_date: newEndDate.toISOString(),
          is_deactivated: false,
          is_free_trial: false, // upgrades trial to premium
          last_payment_result: {
            status: 'approved',
            payment_id: paymentId,
            period,
            amount: pendingPayment.amount,
            approved_at: nowObj.toISOString()
          },
          subscription_history: [
            ...(targets.subscription_history || []),
            {
              action: 'coach_subscription_payment',
              period,
              start_date: baseDate.toISOString(),
              end_date: newEndDate.toISOString(),
              timestamp: nowObj.toISOString(),
              amount: pendingPayment.amount
            }
          ]
        };

        // Remove the pending payment block
        delete updatedTargets.pending_payment;

        const { error: updateErr } = await supabaseAdmin
          .from('profiles')
          .update({ targets: updatedTargets })
          .eq('id', coachId);

        if (updateErr) {
          await answerCallback(callbackQueryId, 'Failed to update coach subscription dates.');
          return res.status(200).json({ ok: true });
        }

        await answerCallback(callbackQueryId, 'Subscription approved successfully!');
        
        // Update message representation in Telegram
        const successText = `
✅ <b>Payment Approved & Access Extended!</b>

👤 <b>Coach Details:</b>
• <b>Name:</b> ${coach.display_name || 'N/A'}
• <b>Email:</b> ${coach.email || 'N/A'}

📅 <b>New Expiration Date:</b>
• ${newEndDate.toLocaleDateString()} at ${newEndDate.toLocaleTimeString()}
• Extended by <b>${period}</b> from ${baseDate.toLocaleDateString()}
`;
        await editMessageText(chatId, messageId, originalMessage, successText);

        // Send a structured receipt as a new message to the owner
        const receiptText = `
🧾 <b>LIFE GYM SUBSCRIPTION RECEIPT</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<b>Receipt ID:</b> <code>rec_${paymentId}</code>
<b>Date:</b> ${nowObj.toLocaleString()}

👤 <b>Coach Details:</b>
• <b>Name:</b> ${coach.display_name || 'N/A'}
• <b>Email:</b> ${coach.email || 'N/A'}

💳 <b>Payment Details:</b>
• <b>Plan Duration:</b> ${period}
• <b>Amount Paid:</b> ${pendingPayment.amount}
• <b>Payment Method:</b> ${pendingPayment.method === 'telda' ? 'Telda' : 'Mobile Wallet'}

📅 <b>Coverage Period:</b>
• <b>Start Date:</b> ${baseDate.toLocaleDateString()}
• <b>End Date:</b> ${newEndDate.toLocaleDateString()}

✅ <b>Status:</b> PAID (Verified & Approved)
━━━━━━━━━━━━━━━━━━━━━━━━
`;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: receiptText,
            parse_mode: 'HTML'
          })
        });
      }

      // Action 2: Show Rejection Reasons Options
      else if (action === 'reject') {
        const coachId = tokens[1];
        const paymentId = tokens[2];

        // Edit Telegram message inline keyboard markup to present options
        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '❌ Invalid Screenshot', callback_data: `reject_reason:${coachId}:${paymentId}:invalid_screenshot` },
              { text: '❌ Wrong Amount', callback_data: `reject_reason:${coachId}:${paymentId}:wrong_amount` }
            ],
            [
              { text: '❌ Not Received', callback_data: `reject_reason:${coachId}:${paymentId}:not_received` },
              { text: '🔙 Cancel', callback_data: `reject_reason:${coachId}:${paymentId}:back_to_menu` }
            ]
          ]
        };

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: inlineKeyboard
          })
        });

        await answerCallback(callbackQueryId, 'Select rejection reason.');
      }

      // Action 3: Handle Final Selection of Rejection Reason
      else if (action === 'reject_reason') {
        const coachId = tokens[1];
        const paymentId = tokens[2];
        const reasonCode = tokens[3];

        const { data: coach, error: fetchErr } = await supabaseAdmin
          .from('profiles')
          .select('display_name, email, targets')
          .eq('id', coachId)
          .maybeSingle();

        if (fetchErr || !coach) {
          await answerCallback(callbackQueryId, 'Coach profile not found.');
          return res.status(200).json({ ok: true });
        }

        const targets = coach.targets || {};

        if (reasonCode === 'back_to_menu') {
          // Restore Approve & Reject button choices
          const inlineKeyboard = {
            inline_keyboard: [
              [
                { text: '✅ Approve & Add Plan', callback_data: `approve:${coachId}:${paymentId}:${targets.pending_payment?.period || '1 month'}` },
                { text: '❌ Reject Payment', callback_data: `reject:${coachId}:${paymentId}` }
              ]
            ]
          };
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              reply_markup: inlineKeyboard
            })
          });
          await answerCallback(callbackQueryId, 'Returned.');
          return res.status(200).json({ ok: true });
        }

        const pendingPayment = targets.pending_payment;
        if (!pendingPayment || pendingPayment.id !== paymentId) {
          await answerCallback(callbackQueryId, 'Transaction already processed.');
          await editMessageText(chatId, messageId, originalMessage, '⚠️ <i>This payment has already been processed or cancelled.</i>');
          return res.status(200).json({ ok: true });
        }

        const reasonText = REJECTION_REASONS[reasonCode] || 'Payment verification failed.';

        const updatedTargets = {
          ...targets,
          last_payment_result: {
            status: 'rejected',
            payment_id: paymentId,
            reason: reasonText,
            rejected_at: new Date().toISOString()
          }
        };
        // Remove pending payment block
        delete updatedTargets.pending_payment;

        const { error: updateErr } = await supabaseAdmin
          .from('profiles')
          .update({ targets: updatedTargets })
          .eq('id', coachId);

        if (updateErr) {
          await answerCallback(callbackQueryId, 'Database update failed.');
          return res.status(200).json({ ok: true });
        }

        await answerCallback(callbackQueryId, 'Rejection recorded.');

        const rejectionText = `
❌ <b>Payment Rejected!</b>

👤 <b>Coach Details:</b>
• <b>Name:</b> ${coach.display_name || 'N/A'}
• <b>Email:</b> ${coach.email || 'N/A'}

⚠️ <b>Rejection Reason:</b>
• ${reasonText}
`;
        await editMessageText(chatId, messageId, originalMessage, rejectionText);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Telegram Webhook Exception:', err);
    return res.status(500).json({ error: 'Internal Webhook error: ' + err.message });
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────

async function answerCallback(callbackQueryId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text
    })
  });
}

async function editMessageText(chatId: number, messageId: number, originalMessage: any, newText: string) {
  // If originalMessage had a caption (was photo), edit caption, else edit text
  const endpoint = originalMessage.photo ? 'editMessageCaption' : 'editMessageText';
  const payload: any = {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML'
  };

  if (originalMessage.photo) {
    payload.caption = newText;
  } else {
    payload.text = newText;
  }

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function getDurationDays(period: string): number {
  switch (period) {
    case '2 weeks': return 14;
    case '1 month': return 30;
    case '3 months': return 90;
    case '6 months': return 180;
    default: return 30;
  }
}
