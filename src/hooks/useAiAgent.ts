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

// ─── Ultra-compact system prompt — one call, JSON output ─────────────────────
const SYSTEM_PROMPT = (uid: string | null, ctx: string) =>
  `You are Haleem's fitness AI. Haleem: 18yo male, 182cm, 79.7kg, 17% BF, goal recomp. Targets: 160g P/240g C/70g F/2400kcal. PPL gym 3x/wk + running.
User ID: ${uid} | Today: ${new Date().toISOString().split('T')[0]}
DB tables: schedules(id,user_id,week_start,days JSON), diet_logs(id,user_id,date,daily_totals JSON), diet_meals(id,diet_log_id,name,time,items JSON), food_inventory(id,user_id,name,kcal_per_100g,protein,carbs,fat), workouts, exercises.

${ctx}

ALWAYS respond ONLY with valid JSON in this exact format:
{"reply":"your response here","actions":[{"type":"update","table":"schedules","match":{"id":"abc"},"data":{"days":{"2026-05-13":"REST"}}}]}
If no DB action needed, return: {"reply":"your response","actions":[]}
Use your intrinsic knowledge for food macros. Be direct and brief.`;

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
          const payload = { ...action.data, user_id: session.user.id };
          await supabase.from(action.table).insert(payload);
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
      const today = new Date().toISOString().split('T')[0];
      let log = fromCache(`diet_${today}`);
      if (!log) {
        const { data } = await supabase.from('diet_logs').select('id,daily_totals').eq('user_id', uid).eq('date', today).maybeSingle();
        log = data;
        if (log) toCache(`diet_${today}`, log);
      }
      if (log) parts.push(`TODAY_DIET: ${JSON.stringify(log)}`);
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

      // Execute DB actions silently in background
      if (aiRes.actions?.length) {
        executeActions(aiRes.actions);
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
