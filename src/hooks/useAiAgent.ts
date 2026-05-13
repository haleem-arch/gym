import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// Model fallback chain — if one hits rate limit, auto-switch to next
const MODELS = [
  'gemma2-9b-it',          // primary: JSON mode support, good limits
  'llama-3.1-8b-instant',  // fallback 1: 131k TPM
  'mixtral-8x7b-32768',    // fallback 2: different pool of rate limits
];

export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface DbAction {
  type: 'select' | 'insert' | 'update' | 'delete' | 'navigate';
  table?: string;
  match?: Record<string, any>;
  data?: Record<string, any>;
  path?: string;
}

interface AiResponse {
  reply: string;
  actions?: DbAction[];
}

// ─── In-memory cache (5-min TTL) ─────────────────────────────────────────────
const cache: Record<string, { data: any; ts: number }> = {};
const TTL = 5 * 60 * 1000;
const fromCache = (k: string) => { const e = cache[k]; return e && Date.now() - e.ts < TTL ? e.data : null; };
const toCache = (k: string, d: any) => { cache[k] = { data: d, ts: Date.now() }; };

// ─── Local date helpers (match useDiet timezone logic) ───────────────────────
const getLocalDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};
const getLocalTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:00`;
};

// ─── System prompt — explicit examples with correct schema ───────────────────
const SYSTEM_PROMPT = (uid: string | null, ctx: string) => {
  const today = getLocalDate();
  const time = getLocalTime();
  return `You are Haleem's fitness AI. Output ONLY valid JSON. Never plain text.
Haleem: 18yo, 182cm, 79.7kg, 17% BF. Targets: 160g P/240g C/70g F/2400kcal.
User ID: ${uid} | Today: ${today}

${ctx}

ALWAYS return ONLY this JSON format:
{"reply":"short text","actions":[]}

TABLE PURPOSES:
- diet_meals: ALWAYS use this for logging what was eaten TODAY.
- food_inventory: ONLY for user's custom foods library. NEVER use this for daily logs.

MEAL LOG EXAMPLE (Logging for TODAY):
{"reply":"Logged 100g rice \u2014 130kcal, 28g C, 2.7g P","actions":[{"type":"insert","table":"diet_meals","data":{"diet_log_id":"THE_ID_FROM_TODAY_DIET_LOG_ID","name":"Meal","time":"${time}","items":[{"id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","food_id":"","name":"White rice","grams":100,"macros":{"kcal":130,"protein":2.7,"carbs":28,"fat":0.3}}]}}]}

SCHEDULE EXAMPLE:
{"reply":"Done \u2014 REST day set","actions":[{"type":"update","table":"schedules","match":{"id":"SCHEDULE_ID"},"data":{"days":{"${today}":"REST"}}}]}

RULES: Use exact TODAY_DIET_LOG_ID. Generate UUID for item id. NEVER insert into food_inventory for daily meals. Use diet_meals ONLY.`;
};

// ─── Intent detection ─────────────────────────────────────────────────────────
const detectIntent = (text: string) => {
  const t = text.toLowerCase();
  return {
    needsNutrition: /protein|calor|kcal|carb|fat|food|eat|meal|diet|macro|water|log/.test(t),
    needsSchedule: /schedule|plan|week|today|tomorrow|when|session|rest|push|pull|leg|day/.test(t),
    needsWorkout: /workout|exercise|gym|lift|set|rep|volume|progress/.test(t),
  };
};

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const userIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  // ─── Execute DB actions returned by AI ────────────────────────────────────
  const executeActions = async (actions: DbAction[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !actions?.length) return;

    for (const action of actions) {
      try {
        if (action.type === 'navigate' && action.path) {
          navigate(action.path);
          continue;
        }
        if (!action.table) continue;

        if (action.type === 'insert') {
          const payload = { ...action.data };
          // Only inject user_id for top-level tables that require it
          const tablesRequiringUserId = ['diet_logs', 'workouts', 'schedules', 'food_inventory', 'profiles'];
          if (tablesRequiringUserId.includes(action.table) && !payload.user_id) {
            payload.user_id = session.user.id;
          }
          const { error } = await supabase.from(action.table).insert(payload);
          if (error) throw error;
        } else if (action.type === 'update' && action.match) {
          let q = supabase.from(action.table).update(action.data || {});
          Object.entries(action.match).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          await q;
        } else if (action.type === 'delete' && action.match) {
          let q = supabase.from(action.table).delete();
          Object.entries(action.match).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          await q;
        }
        // Bust cache for affected table
        Object.keys(cache).forEach(k => { if (k.includes(action.table!)) delete cache[k]; });
      } catch (e) {
        console.error('Action failed:', e);
      }
    }
  };

  // ─── Load only relevant context ────────────────────────────────────────────
  const loadContext = async (text: string): Promise<string> => {
    const uid = userIdRef.current;
    if (!uid) return '';
    const intent = detectIntent(text);
    const parts: string[] = [];

    if (intent.needsSchedule) {
      let sched = fromCache('sched');
      if (!sched) {
        const { data } = await supabase.from('schedules').select('id,week_start,days').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle();
        sched = data;
        if (sched) toCache('sched', sched);
      }
      if (sched) parts.push(`SCHEDULE: ${JSON.stringify(sched)}`);
    }

    if (intent.needsNutrition) {
    const ckey = `diet_${getLocalDate()}`; // local date to match useDiet
    let log = fromCache(ckey);

    if (!log) {
      const localToday = getLocalDate();
      const { data: existing } = await supabase
        .from('diet_logs')
        .select('id,daily_totals')
        .eq('user_id', uid)
        .eq('date', localToday)
        .maybeSingle();

      if (existing) {
        log = existing;
      } else {
        const { data: created } = await supabase
          .from('diet_logs')
          .insert({
            user_id: uid,
            date: localToday,
            daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
          })
          .select('id,daily_totals')
          .single();
        log = created;
      }
      if (log) toCache(ckey, log);
    }

    if (log) {
      parts.push(`TODAY_DIET_LOG_ID: ${log.id}`);
      parts.push(`TODAY_TOTALS: ${JSON.stringify(log.daily_totals)}`);
      parts.push(`IMPORTANT: Use diet_log_id="${log.id}" for any diet_meals insert`);
    }
    }

    return parts.join('\n');
  };

  // ─── Groq call with model fallback chain ──────────────────────────────────
  const callGroq = async (userText: string, context: string): Promise<AiResponse> => {
    const key = getApiKey();
    if (!key) throw new Error('VITE_GROQ_API_KEY not set');

    const msgs = [
      { role: 'system', content: SYSTEM_PROMPT(userIdRef.current, context) },
      { role: 'user', content: userText }
    ];

    // Try each model in order — switch automatically on rate limit
    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      // mixtral doesn't support json_object mode
      const supportsJson = model !== 'mixtral-8x7b-32768';

      try {
        const res = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({
            model,
            messages: msgs,
            temperature: 0.1,
            max_tokens: 512,
            ...(supportsJson ? { response_format: { type: 'json_object' } } : {})
          })
        });

        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          const msg = JSON.stringify(e);
          const isRateLimit = msg.includes('429') || msg.includes('rate_limit') || msg.includes('TPM') || msg.includes('RMP');
          if (isRateLimit && i < MODELS.length - 1) {
            // Rate limited — silently try next model
            continue;
          }
          throw new Error(isRateLimit ? 'RATE_LIMIT_ALL' : msg.slice(0, 100));
        }

        const data = await res.json();
        const raw = data.choices[0].message.content;
        try {
          return JSON.parse(raw) as AiResponse;
        } catch {
          // Non-JSON response (mixtral) — wrap it
          return { reply: raw.replace(/```json|```/g, '').trim(), actions: [] };
        }
      } catch (err: any) {
        if (i < MODELS.length - 1 && !err.message?.startsWith('VITE_')) continue;
        throw err;
      }
    }

    throw new Error('RATE_LIMIT_ALL');
  };

  // ─── Init ──────────────────────────────────────────────────────────────────
  const initChat = async () => {
    if (initialized.current) return;
    initialized.current = true;
    const { data: { session } } = await supabase.auth.getSession();
    userIdRef.current = session?.user?.id || null;

    if (!getApiKey()) {
      setMessages([{ id: 'no-key', role: 'model', text: 'Add VITE_GROQ_API_KEY to Vercel environment variables.' }]);
      return;
    }

    if (userIdRef.current) {
      const { data } = await supabase.from('ai_chat').select('messages').eq('user_id', userIdRef.current).maybeSingle();
      if (data?.messages && (data.messages as any[]).length > 0) {
        setMessages(data.messages as AiMessage[]);
      } else {
        setMessages([{ id: '1', role: 'model', text: "Coach connected. What do you need?" }]);
      }
    }
  };

  const saveHistory = async (msgs: AiMessage[]) => {
    if (!userIdRef.current) return;
    const trimmed = msgs.slice(-20);
    const { data } = await supabase.from('ai_chat').select('id').eq('user_id', userIdRef.current).maybeSingle();
    if (data) {
      supabase.from('ai_chat').update({ messages: trimmed, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      supabase.from('ai_chat').insert({ user_id: userIdRef.current, messages: trimmed });
    }
  };

  // ─── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
    setIsTyping(true);

    try {
      const context = await loadContext(text);
      const aiRes = await callGroq(text, context);

      // Await so insert is complete before confirming
      if (aiRes.actions?.length) {
        await executeActions(aiRes.actions);
      }

      const modelMsg: AiMessage = { id: crypto.randomUUID(), role: 'model', text: aiRes.reply };
      setMessages(prev => {
        const next = [...prev, modelMsg];
        saveHistory(next);
        return next;
      });
    } catch (e: any) {
      const isRate = e.message === 'RATE_LIMIT_ALL' || e.message === 'RATE_LIMIT';
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: isRate ? '⏱️ All 3 models rate-limited. Wait 60 seconds.' : `Error: ${e.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    Object.keys(cache).forEach(k => delete cache[k]);
  };

  return { messages, isTyping, sendMessage, initChat, clearHistory };
};
