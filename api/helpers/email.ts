import nodemailer from 'nodemailer';
import dns from 'dns';
import { createClient } from '@supabase/supabase-js';

const GMAIL_USER = process.env.GMAIL_USER || 'life.gym.team@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'grhmtoukbmkpoofo';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyMDAyNiwiZXhwIjoyMDk0MTk2MDI2fQ.od8whZoEL0AgKr7NEI0EMxfo7BgHC9RBsyCKPBwltKY';

export interface SmtpConfig {
  user: string;
  pass: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

export async function getOwnerSMTP(): Promise<SmtpConfig> {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await supabaseAdmin
      .from('owner_settings')
      .select('smtp_email, smtp_password, smtp_host, smtp_port, smtp_secure')
      .eq('id', 'smtp_config')
      .maybeSingle();

    if (data && data.smtp_email && data.smtp_password) {
      return {
        user: data.smtp_email,
        pass: data.smtp_password,
        host: data.smtp_host || undefined,
        port: data.smtp_port ? Number(data.smtp_port) : undefined,
        secure: data.smtp_secure !== null ? !!data.smtp_secure : undefined
      };
    }
  } catch (err) {
    console.error('Failed to load owner SMTP settings from DB:', err);
  }
  return { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD };
}

export async function validateEmailAddress(email: string): Promise<{ valid: boolean; reason?: string }> {
  const cleanEmail = email.trim();
  
  // 1. Syntax Regex Check (Level 1)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, reason: 'Invalid email syntax (e.g. must be name@domain.com).' };
  }

  const domain = cleanEmail.split('@')[1].toLowerCase();

  // 2. Disposable Email Domains Blocklist (Level 2)
  const disposableDomains = new Set([
    'mailinator.com', 'yopmail.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 
    'sharklasers.com', 'dispostable.com', 'getairmail.com', 'burnermail.io', '10minutemail.com', 
    'trashmail.com', 'maildrop.cc', 'tempmailo.com', 'temp-mail.io', 'mailto.plus', 'chacuo.net',
    'crazymailing.com', 'generator.email', 'dropmail.me', 'fakeinbox.com', 'tempmail.net'
  ]);
  
  if (disposableDomains.has(domain)) {
    return { valid: false, reason: 'Temporary or disposable email domains are not allowed.' };
  }

  // 3. MX Record Lookup Check (Level 3) with 2.5s Timeout
  try {
    const mxPromise = dns.promises.resolveMx(domain);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
    );
    const mxRecords = await Promise.race([mxPromise, timeoutPromise]);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'The domain does not have active mail servers configured (no MX records).' };
    }
  } catch (err: any) {
    if (err.message === 'DNS_TIMEOUT') {
      console.warn(`DNS MX lookup timed out for domain: ${domain}. Bypassing Level 3 check.`);
      return { valid: true }; // Graceful bypass
    }
    // If the DNS query failed because the domain does not exist (ENOTFOUND) or has no MX records (ENODATA), block it.
    // Otherwise, if it's a network/resolver error (like ECONNREFUSED or ETIMEOUT), allow it to pass so we don't block
    // users during temporary network or local development sandbox DNS issues.
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return { valid: false, reason: 'The email domain does not exist or has no active mail servers.' };
    }
    console.warn(`DNS lookup failed with code ${err.code || err.message}. Bypassing Level 3 check.`, err);
  }

  return { valid: true };
}

interface Attachment {
  filename: string;
  content: string; // base64 string
  contentType: string;
}

interface SendBulkEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
  attachments?: Attachment[];
  smtpUser?: string;
  smtpPass?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  templateId?: 'coach_signup' | 'client_welcome' | 'maillist' | 'athlete_signup';
  templateVariables?: Record<string, string>;
}

export async function sendBulkEmails({
  to,
  subject,
  text,
  html,
  fromName,
  attachments,
  smtpUser,
  smtpPass,
  smtpHost,
  smtpPort,
  smtpSecure,
  templateId,
  templateVariables
}: SendBulkEmailParams) {
  const dbSMTP = await getOwnerSMTP();
  const user = smtpUser || dbSMTP.user;
  const pass = smtpPass || dbSMTP.pass;
  const host = smtpHost || dbSMTP.host;
  const port = smtpPort !== undefined ? smtpPort : dbSMTP.port;
  const secure = smtpSecure !== undefined ? smtpSecure : dbSMTP.secure;

  let template: any = null;
  if (templateId) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();
      if (!error && data) {
        template = data;
      }
    } catch (err) {
      console.error('Failed to load email template from DB:', err);
    }
  }

  let transportConfig: any;

  if (host) {
    // Custom SMTP configuration
    transportConfig = {
      host: host,
      port: port || 587,
      secure: secure !== undefined ? secure : false,
      auth: {
        user: user,
        pass: pass
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
      greetingTimeout: 5000
    };
  } else {
    // Gmail fallback
    transportConfig = {
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
      greetingTimeout: 5000
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const recipientList = Array.isArray(to)
    ? to
    : to.split(',').map(e => e.trim()).filter(Boolean);

  const formattedAttachments = attachments?.map(att => ({
    filename: att.filename,
    content: Buffer.from(att.content, 'base64'),
    contentType: att.contentType
  })) || [];

  const results = [];

  for (const recipient of recipientList) {
    try {
      let finalRecipient = recipient.trim().toLowerCase();
      
      // Resolve virtual emails ending in @stride.fit
      if (finalRecipient.endsWith('@stride.fit')) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false, autoRefreshToken: false }
          });
          const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('targets')
            .eq('email', finalRecipient)
            .maybeSingle();
          
          if (!error && data && data.targets && data.targets.contact_email) {
            const contactEmail = data.targets.contact_email.trim().toLowerCase();
            if (contactEmail && !contactEmail.endsWith('@stride.fit')) {
              finalRecipient = contactEmail;
            }
          }
        } catch (dbErr) {
          console.error(`Failed to resolve real email for virtual address ${recipient}:`, dbErr);
        }
      }

      // If it still ends in @stride.fit (or we couldn't resolve a real email), skip it
      if (finalRecipient.endsWith('@stride.fit')) {
        results.push({ email: recipient, success: false, error: 'Cannot send to virtual @stride.fit email. No contact email provided.' });
        continue;
      }

      // Validate recipient address first
      const validation = await validateEmailAddress(finalRecipient);
      if (!validation.valid) {
        results.push({ email: finalRecipient, success: false, error: validation.reason });
        continue;
      }

      let finalSubject = subject;
      let finalHtml = html;
      let finalText = text;
      let finalFromName = fromName;
      let finalSenderEmail = user;

      if (template) {
        finalSubject = template.subject;
        finalHtml = template.html_body;
        finalText = template.text_body || '';
        finalFromName = template.sender_name || fromName;
        finalSenderEmail = template.sender_email || user;
      }

      // Compile placeholders
      const vars = {
        ...templateVariables,
        email: finalRecipient,
        username: finalRecipient.split('@')[0]
      };

      Object.entries(vars).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        if (finalSubject) finalSubject = finalSubject.replace(regex, val || '');
        if (finalHtml) finalHtml = finalHtml.replace(regex, val || '');
        if (finalText) finalText = finalText.replace(regex, val || '');
      });

      const mailOptions = {
        from: finalFromName ? `"${finalFromName}" <${finalSenderEmail}>` : finalSenderEmail,
        to: finalRecipient,
        subject: finalSubject,
        text: finalText,
        html: finalHtml,
        attachments: formattedAttachments
      };

      const info = await transporter.sendMail(mailOptions);
      results.push({ email: finalRecipient, success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error(`Failed to send email to ${recipient}:`, err);
      results.push({ email: recipient, success: false, error: err.message || err });
    }
  }

  return results;
}

