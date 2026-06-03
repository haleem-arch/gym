import { createClient } from '@supabase/supabase-js'

const globalProcess = (globalThis as any).process || { env: {} };

const supabaseUrl = globalProcess.env.SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = globalProcess.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = globalProcess.env.TELEGRAM_BOT_TOKEN;

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
  // Config Guard
  if (!supabaseServiceKey || !TELEGRAM_BOT_TOKEN) {
    console.error('Missing configuration: SUPABASE_SERVICE_ROLE_KEY or TELEGRAM_BOT_TOKEN');
    return res.status(500).json({ error: 'Internal Configuration Error: Missing environment variables' });
  }

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

      if (!action) return res.status(200).json({ ok: true });

      // Helper: decode period code back to full string
      const decodePeriod = (code: string) => {
        if (code === '2w') return '2 weeks';
        if (code === '1m') return '1 month';
        if (code === '3m') return '3 months';
        if (code === '6m') return '6 months';
        return '1 month';
      };

      // ── ACTION A: Approve ──────────────────────────────────────────
      if (action === 'A') {
        const coachId = tokens[1];
        const period = decodePeriod(tokens[2]);

        const { data: coach, error: fetchErr } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email, targets')
          .eq('id', coachId)
          .maybeSingle();

        if (fetchErr || !coach) {
          await answerCallback(callbackQueryId, 'Coach profile not found.');
          return res.status(200).json({ ok: true });
        }

        const targets = coach.targets || {};
        const pendingPayment = targets.pending_payment;

        if (!pendingPayment) {
          await answerCallback(callbackQueryId, 'This transaction was already processed.');
          await editMessageText(chatId, messageId, originalMessage, '⚠️ <i>This payment has already been processed or cancelled.</i>');
          return res.status(200).json({ ok: true });
        }

        const nowObj = new Date();
        let baseDate = nowObj;
        const currentEnd = targets.subscription_end_date ? new Date(targets.subscription_end_date) : null;
        if (currentEnd && currentEnd > nowObj && targets.is_deactivated !== true) {
          baseDate = currentEnd;
        }

        const durationDays = getDurationDays(period);
        const newEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const updatedTargets = {
          ...targets,
          subscription_start_date: targets.subscription_start_date || nowObj.toISOString(),
          subscription_end_date: newEndDate.toISOString(),
          is_deactivated: false,
          is_free_trial: false,
          last_payment_result: {
            status: 'approved',
            payment_id: pendingPayment.id,
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
        delete updatedTargets.pending_payment;

        const { error: updateErr } = await supabaseAdmin
          .from('profiles').update({ targets: updatedTargets }).eq('id', coach.id);

        if (updateErr) {
          await answerCallback(callbackQueryId, 'Failed to update subscription.');
          return res.status(200).json({ ok: true });
        }

        await answerCallback(callbackQueryId, 'Subscription approved!');
        await editMessageText(chatId, messageId, originalMessage,
          `✅ <b>Payment Approved & Access Extended!</b>\n\n👤 <b>Coach:</b> ${coach.display_name || 'N/A'}\n📧 <b>Email:</b> ${coach.email || 'N/A'}\n\n📅 <b>New Expiry:</b> ${newEndDate.toLocaleDateString()} — extended by <b>${period}</b>`
        );

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🧾 <b>RECEIPT</b>\n\n👤 ${coach.display_name} (${coach.email})\n💳 ${period} — ${pendingPayment.amount}\n📅 Expires: ${newEndDate.toLocaleDateString()}\n✅ Status: APPROVED`,
            parse_mode: 'HTML'
          })
        });
      }

      // ── ACTION R: Show Rejection Reason Options ────────────────────
      else if (action === 'R') {
        const coachId = tokens[1];
        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '❌ Invalid Screenshot', callback_data: `RR:${coachId}:inv` },
              { text: '❌ Wrong Amount', callback_data: `RR:${coachId}:amt` }
            ],
            [
              { text: '❌ Not Received', callback_data: `RR:${coachId}:nr` },
              { text: '🔙 Cancel', callback_data: `RR:${coachId}:bk` }
            ]
          ]
        };
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, reply_markup: inlineKeyboard })
        });
        await answerCallback(callbackQueryId, 'Select rejection reason.');
      }

      // ── ACTION RR: Final Rejection Reason Selected ─────────────────
      else if (action === 'RR') {
        const coachId = tokens[1];
        const reasonCode = tokens[2];

        const { data: coach, error: fetchErr } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email, targets')
          .eq('id', coachId)
          .maybeSingle();

        if (fetchErr || !coach) {
          await answerCallback(callbackQueryId, 'Coach profile not found.');
          return res.status(200).json({ ok: true });
        }

        const targets = coach.targets || {};
        const pendingPayment = targets.pending_payment;

        if (reasonCode === 'bk') {
          // Go back to approve/reject buttons
          const pp = pendingPayment;
          const periodCode = (pp?.period === '2 weeks') ? '2w' : (pp?.period === '1 month') ? '1m' : (pp?.period === '3 months') ? '3m' : '6m';
          const inlineKeyboard = {
            inline_keyboard: [[
              { text: '✅ Approve & Add Plan', callback_data: `A:${coachId}:${periodCode}` },
              { text: '❌ Reject Payment', callback_data: `R:${coachId}` }
            ]]
          };
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, reply_markup: inlineKeyboard })
          });
          await answerCallback(callbackQueryId, 'Returned.');
          return res.status(200).json({ ok: true });
        }

        if (!pendingPayment) {
          await answerCallback(callbackQueryId, 'Transaction already processed.');
          await editMessageText(chatId, messageId, originalMessage, '⚠️ <i>This payment has already been processed.</i>');
          return res.status(200).json({ ok: true });
        }

        const reasonMap: Record<string, string> = {
          'inv': 'Invalid Screenshot / Proof of Transaction',
          'amt': 'Wrong Amount Transferred',
          'nr': 'Payment Not Received in Wallet / Bank'
        };
        const reasonText = reasonMap[reasonCode] || 'Payment verification failed.';

        const updatedTargets = {
          ...targets,
          last_payment_result: {
            status: 'rejected',
            payment_id: pendingPayment.id,
            reason: reasonText,
            rejected_at: new Date().toISOString()
          }
        };
        delete updatedTargets.pending_payment;

        const { error: updateErr } = await supabaseAdmin
          .from('profiles').update({ targets: updatedTargets }).eq('id', coach.id);

        if (updateErr) {
          await answerCallback(callbackQueryId, 'Database update failed.');
          return res.status(200).json({ ok: true });
        }

        await answerCallback(callbackQueryId, 'Rejection recorded.');
        await editMessageText(chatId, messageId, originalMessage,
          `❌ <b>Payment Rejected!</b>\n\n👤 <b>Coach:</b> ${coach.display_name || 'N/A'}\n\n⚠️ <b>Reason:</b> ${reasonText}`
        );
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
