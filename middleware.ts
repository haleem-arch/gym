import { ipAddress } from '@vercel/functions';
import { Ratelimit } from '@upstash/ratelimit';
import { createClient } from '@vercel/kv';

const redisUrl = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || process.env.KV_URL || process.env.STORAGE_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;

const isKvConfigured = !!(redisUrl && redisToken);

// Create custom Redis client using either KV or STORAGE credentials
const redisClient = isKvConfigured
  ? createClient({
      url: redisUrl,
      token: redisToken,
    })
  : null;

// Configure the rate limiters
// 1. Password Reset Request IP limiter (5 requests per 10 minutes)
const passwordResetIpLimit = isKvConfigured && redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'rl:pw_reset:ip:',
    })
  : null;

// 2. Password Reset Request Email limiter (2 requests per 5 minutes)
const passwordResetEmailLimit = isKvConfigured && redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(2, '5 m'),
      prefix: 'rl:pw_reset:email:',
    })
  : null;

// 3. Password Reset Verify/Complete IP limiter (10 requests per 10 minutes)
const passwordResetVerifyIpLimit = isKvConfigured && redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      prefix: 'rl:pw_verify:ip:',
    })
  : null;

// 4. Coach Registration IP limiter (3 registrations per hour)
const registerCoachIpLimit = isKvConfigured && redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'rl:register_coach:ip:',
    })
  : null;

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const action = url.searchParams.get('action');

  // If KV is not configured (e.g. local dev without KV environment variables),
  // skip edge rate-limiting to prevent runtime crashes.
  if (!isKvConfigured) {
    return;
  }

  // Helper to extract IP
  let ip = '127.0.0.1';
  try {
    ip = ipAddress(request) || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  } catch (e) {
    console.error('Error fetching IP Address in middleware:', e);
  }

  // --- 1. Password Reset Endpoints ---
  // Matches:
  // - /api/request-password-reset
  // - /api/verify-reset-token
  // - /api/complete-password-reset
  // - /api/password-reset
  const isPasswordReset = 
    pathname.startsWith('/api/password-reset') ||
    pathname === '/api/request-password-reset' ||
    pathname === '/api/verify-reset-token' ||
    pathname === '/api/complete-password-reset';

  if (isPasswordReset) {
    // Determine the action (request, verify, or complete)
    let currentAction = action;
    if (!currentAction) {
      if (pathname === '/api/request-password-reset') currentAction = 'request';
      else if (pathname === '/api/verify-reset-token') currentAction = 'verify';
      else if (pathname === '/api/complete-password-reset') currentAction = 'complete';
    }

    if (currentAction === 'request') {
      // Check IP Limit
      if (passwordResetIpLimit) {
        const ipCheck = await passwordResetIpLimit.limit(ip);
        if (!ipCheck.success) {
          return new Response(
            JSON.stringify({ error: 'Too many password reset requests from this IP. Please try again in 10 minutes.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check Email Limit (only on POST)
      if (request.method === 'POST' && passwordResetEmailLimit) {
        try {
          const clonedReq = request.clone();
          const body = await clonedReq.json() as any;
          const email = body?.email;
          if (email && typeof email === 'string') {
            const cleanEmail = email.trim().toLowerCase();
            const emailCheck = await passwordResetEmailLimit.limit(cleanEmail);
            if (!emailCheck.success) {
              return new Response(
                JSON.stringify({ error: 'Too many password reset requests for this email. Maximum 2 requests per 5 minutes.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (bodyErr) {
          console.error('Middleware body parse error:', bodyErr);
        }
      }
    } else if ((currentAction === 'verify' || currentAction === 'complete') && passwordResetVerifyIpLimit) {
      // Check verify/complete IP Limit
      const ipCheck = await passwordResetVerifyIpLimit.limit(ip);
      if (!ipCheck.success) {
        return new Response(
          JSON.stringify({ error: 'Too many reset verification attempts. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // --- 2. Coach Registration Endpoint ---
  // Matches: /api/register-coach
  if (pathname === '/api/register-coach' && request.method === 'POST' && registerCoachIpLimit) {
    const signupCheck = await registerCoachIpLimit.limit(ip);
    if (!signupCheck.success) {
      return new Response(
        JSON.stringify({ error: 'Too many signup attempts. Maximum 3 gym registration signups per hour.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
