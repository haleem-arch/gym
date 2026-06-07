import { validateEmailAddress, sendBulkEmails } from './helpers/email.js';
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

    const origin = req.headers.origin || (req.headers.host ? 'https://' + req.headers.host : 'https://lifegym.app');
    
    // Asynchronously send the email using waitUntil
    waitUntil(
      sendBulkEmails({
        to: cleanEmail,
        subject: '🎁 Your Free Guide: The Ultimate 12-Week Coach Onboarding & Client Retention Blueprint',
        html: `
          <div style="font-family: sans-serif; background-color: #060713; color: #f3f4f6; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); max-width: 520px; margin: 20px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin: 0;">LIFE GYM</h1>
              <p style="font-size: 9px; color: #8b5cf6; font-weight: 900; letter-spacing: 0.15em; margin: 5px 0 0 0; text-transform: uppercase;">Free Growth Resource</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px; text-align: center;">Your Coaching Blueprint is Ready! 🚀</h2>
            
            <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin-bottom: 20px;">
              Thank you for requesting our guide, <strong>"The Ultimate 12-Week Coach Onboarding & Client Retention Blueprint"</strong>.
            </p>
            <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin-bottom: 20px;">
              This blueprint covers the exact step-by-step systems and workflows used by elite coaches to onboard athletes seamlessly and keep client retention rates above 95%.
            </p>
            
            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; font-size: 12px; color: #f3f4f6; margin-bottom: 24px; text-align: left; line-height: 1.6;">
              <span style="color: #8b5cf6; font-weight: bold; display: block; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">What you will learn:</span>
              • Phase 1: The First 24 Hours - Building instant trust and setting expectations.<br />
              • Phase 2: Hyper-Personalization - Custom split delivery and initial compliance tracking.<br />
              • Phase 3: The 4-Week Review - Gathering biometrics feedback & adjusting programs.<br />
              • Phase 4: Long-Term Retention - Fostering community & tracking performance milestones.
            </div>
            
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${origin}/ultimate-coach-blueprint.pdf" target="_blank" style="background-color: #8b5cf6; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                Download The PDF Blueprint
              </a>
            </div>
            
            <p style="font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 20px;">
              <strong>Note:</strong> Your download link is active for the next 24 hours.
            </p>
            
            <p style="font-size: 10px; color: #4b5563; margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; text-align: center; margin-bottom: 0;">
              © 2026 Life Gym. All rights reserved.
            </p>
          </div>
        `,
        fromName: 'Life Gym Team'
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
