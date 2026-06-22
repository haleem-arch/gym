import { validateEmailAddress, sendBulkEmails } from '../helpers/email.js';

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

  const action = req.query.action || 'send';

  try {
    if (action === 'validate') {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (email.length > 100) {
        return res.status(400).json({ error: 'Email must be under 100 characters' });
      }

      const validation = await validateEmailAddress(email);
      return res.status(200).json(validation);
    } else {
      // Action: send bulk emails
      const { to, subject, text, html, fromName, attachments, smtpUser, smtpPass, smtpHost, smtpPort, smtpSecure } = req.body;

      if (!to || !subject) {
        return res.status(400).json({ error: 'Missing required fields: to, subject' });
      }

      // If it's a single email dispatch, validate immediately
      const recipientList = Array.isArray(to) ? to : to.split(',').map((e: string) => e.trim()).filter(Boolean);
      if (recipientList.length === 1) {
        const singleRecipient = recipientList[0];
        const validation = await validateEmailAddress(singleRecipient, true);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.reason });
        }
      }

      const sendResults = await sendBulkEmails({
        to,
        subject,
        text,
        html,
        fromName,
        attachments,
        smtpUser,
        smtpPass,
        smtpHost,
        smtpPort: smtpPort ? Number(smtpPort) : undefined,
        smtpSecure: smtpSecure !== undefined ? !!smtpSecure : undefined
      });

      const failedCount = sendResults.filter(r => !r.success).length;

      if (failedCount === sendResults.length) {
        return res.status(500).json({
          error: 'All email dispatches failed',
          results: sendResults
        });
      }

      return res.status(200).json({
        success: true,
        message: `Successfully processed bulk email dispatches.`,
        results: sendResults
      });
    }
  } catch (err: any) {
    console.error('Email Operations API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
