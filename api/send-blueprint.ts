import { validateEmailAddress, sendBulkEmails } from '../helpers/email.js';
import { waitUntil } from '@vercel/functions';

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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email address
    const validation = await validateEmailAddress(cleanEmail);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    const uniqueId = Math.floor(100000 + Math.random() * 900000);
    
    // Text Fallback (highly recommended for compatibility)
    const textFallback = `
LIFE GYM - Official Mailing List
Welcome to the Community! ⚡

Thank you for subscribing to our mailing list. You are now officially in the loop for the latest in digital coaching, platform updates, and exclusive fitness studio strategies.

What makes Life Gym unique:
• Dynamic Splits & Workouts - Day-type targets and customized exercise builders.
• Reward Loop Receipts - Gamified workout logs and run tracking metrics.
• Automated InBody Parsing - Split-second CSV composition scan updates.
• Roster Accountability - Live compliance tracking indicators and direct WhatsApp templates.

Stay tuned for exciting announcements, feature drops, and updates.

© 2026 Life Gym. All rights reserved.
    `.trim();

    // Highly-compatible light HTML theme
    const htmlBody = `
      <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
        <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; max-width: 520px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
            <p style="font-size: 9px; color: #10b981; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Official Mailing List</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to the Community! ⚡</h2>
          
          <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
            Thank you for subscribing to our official mailing list. You are now first in line for our latest platform feature releases, elite coaching insights, and strategies to scale your fitness studio.
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
            Life Gym helps coaching academies eliminate administrative overhead, keep clients accountable, and scale retention through state-of-the-art tools.
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 12px; color: #334155; margin-bottom: 24px; text-align: left; line-height: 1.6;">
            <span style="color: #8b5cf6; font-weight: bold; display: block; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">What we bring to your inbox:</span>
            • <strong>Platform Features</strong> - Sneak peeks at new features like InBody CSV parsers and workout log creators.<br />
            • <strong>Growth Strategies</strong> - Actionable guides on scaling client retention past 95%.<br />
            • <strong>Community News</strong> - Announcements, feature rollouts, and updates.
          </div>
          
          <p style="font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 20px; line-height: 1.5;">
            No spam. You can manage your preferences or unsubscribe at any time.
          </p>
          
          <p style="font-size: 10px; color: #9ca3af; margin-top: 36px; border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; margin-bottom: 0;">
            © 2026 Life Gym. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Asynchronously send the email using waitUntil
    waitUntil(
      sendBulkEmails({
        to: cleanEmail,
        subject: `⚡ Welcome to Life Gym: You're on the list! [Ref: #${uniqueId}]`,
        text: textFallback + `\n\nRef: #${uniqueId}`,
        html: htmlBody + `<span style="display: none; color: transparent; font-size: 0px;">Ref: #${uniqueId}</span>`,
        fromName: 'Life Gym Team',
        templateId: 'maillist',
        templateVariables: {
          email: cleanEmail,
          unique_id: String(uniqueId)
        }
      }).catch(emailErr => {
        console.error('Failed to send blueprint email:', emailErr);
      })
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Send Blueprint API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
