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

export interface DbAction {
  type: 'insert' | 'update' | 'delete' | 'navigate' | 'update_schedule';
  table?: string;
  data?: any;
  match?: Record<string, any>;
  path?: string;
  date?: string;
  dayType?: string;
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
  const dietLogMatch = ctx.match(/TODAY_DIET_LOG_ID:\s*([a-f0-9-]+)/i);
  const dietLogId = dietLogMatch ? dietLogMatch[1] : "INSERT_DIET_LOG_ID_HERE";

  return `You are Haleem's fitness AI. Output ONLY valid JSON. Never plain text.
Haleem: 18yo, 182cm, 79.7kg, 17% BF. Targets: 160g P/240g C/70g F/2400kcal.
User ID: ${uid} | Today: ${today}

${ctx}

ALWAYS return ONLY this JSON format:
{"reply":"short text","actions":[]}

MEAL LOG EXAMPLE:
{"reply":"Logged 100g rice \u2014 130kcal, 28g C, 2.7g P","actions":[{"type":"insert","table":"diet_meals","data":{"diet_log_id":"${dietLogId}","name":"Meal","time":"${time}","items":[{"id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","food_id":"","name":"White rice","grams":100,"macros":{"kcal":130,"protein":2.7,"carbs":28,"fat":0.3}}]}}]}

WATER LOG EXAMPLE:
{"reply":"Logged 500ml water","actions":[{"type":"insert","table":"water_logs","data":{"date":"${today}","time":"${today}T${time}Z","amount_ml":500}}]}

SCHEDULE CHANGE EXAMPLE:
{"reply":"Changed today to REST","actions":[{"type":"update_schedule","date":"${today}","dayType":"REST"}]}

RULES:
- Use EXACT TODAY_DIET_LOG_ID from context for meals.
- Generate a unique UUID for item id.
- Use your food knowledge. NEVER return 0 for macros unless it's genuinely 0.
- Use diet_meals for caloric foods/drinks.
- For diet_meals, the "time" MUST be exactly formatted as "HH:MM:00" (e.g. "14:30:00"). Do NOT use ISO format.
- For water/hydration, convert to ml and use water_logs (NOT diet_meals).
- To change schedule, use type="update_schedule" and dayType="REST" | "PUSH" | "PULL" | "LEGS" | "RUN".
- actions:[] if no change.`;
};

// ─── Intent detection removed to guarantee context injection ─────────────────

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('ai_session_id');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem('ai_session_id', newId);
    return newId;
  });
  const navigate = useNavigate();
  const userIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  // ─── Execute DB actions returned by AI ────────────────────────────────────
  const executeActions = async (actions: DbAction[]): Promise<{success: boolean, errorMsg?: string}> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !actions?.length) return { success: false, errorMsg: "No session or actions" };

    let allSuccess = true;
    let lastError = "";

    for (const action of actions) {
      try {
        if (action.type === 'navigate' && action.path) {
          navigate(action.path);
          continue;
        }
        if (!action.table) continue;

        if (action.type === 'insert') {
          const payload = { ...action.data };
          const tablesRequiringUserId = ['diet_logs', 'workouts', 'schedules', 'food_inventory', 'profiles', 'water_logs'];
          if (tablesRequiringUserId.includes(action.table) && !payload.user_id) {
            payload.user_id = session.user.id;
          }
          const { error } = await supabase.from(action.table).insert(payload);
          if (error) {
             console.error("Supabase insert error:", error);
             allSuccess = false;
             lastError = error.message || error.details || "Insert failed";
          }
        } else if (action.type === 'update_schedule') {
          const dateStr = action.date || getLocalDate();
          const newType = action.dayType;
          
          const { data: schedData } = await supabase.from('schedules').select('*').eq('user_id', session.user.id).order('week_start', { ascending: false }).limit(1).maybeSingle();
          if (schedData) {
            const updatedDays = { ...schedData.days, [dateStr]: newType };
            const { error } = await supabase.from('schedules').update({ days: updatedDays }).eq('id', schedData.id);
            if (error) {
               allSuccess = false;
               lastError = "Failed to update schedule";
            } else {
               // Broadcast event to instantly update UI
               window.dispatchEvent(new CustomEvent('schedule_updated', { detail: newType }));
            }
          }
        } else if (action.type === 'update' && action.match) {
          let q = supabase.from(action.table).update(action.data || {});
          Object.entries(action.match).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          const { error } = await q;
          if (error) {
             console.error("Supabase update error:", error);
             allSuccess = false;
             lastError = error.message || error.details || "Update failed";
          }
        } else if (action.type === 'delete' && action.match) {
          let q = supabase.from(action.table).delete();
          Object.entries(action.match).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          const { error } = await q;
          if (error) {
             console.error("Supabase delete error:", error);
             allSuccess = false;
             lastError = error.message || error.details || "Delete failed";
          }
        }
        // Bust cache for affected table
        Object.keys(cache).forEach(k => { if (k.includes(action.table!)) delete cache[k]; });
      } catch (e: any) {
        console.error('Action failed:', e);
        allSuccess = false;
        lastError = e.message || "Unknown error";
      }
    }
    return { success: allSuccess, errorMsg: lastError };
  };

  // ─── Load only relevant context ────────────────────────────────────────────
  const loadContext = async (): Promise<string> => {
    const uid = userIdRef.current;
    if (!uid) return '';
    const parts: string[] = [];

    // Always load schedule (cached)
    let sched = fromCache('sched');
    if (!sched) {
      const { data } = await supabase.from('schedules').select('id,week_start,days').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle();
      sched = data;
      if (sched) toCache('sched', sched);
    }
    if (sched) parts.push(`SCHEDULE: ${JSON.stringify(sched)}`);

    // Always load diet (cached)
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
        let cleanedRaw = raw.trim();
        if (cleanedRaw.startsWith('```')) {
          cleanedRaw = cleanedRaw.replace(/```json|```/g, '').trim();
        }
        try {
          return JSON.parse(cleanedRaw) as AiResponse;
        } catch {
          // fallback regex extraction
          const jsonMatch = raw.match(/\{[\s\S]*"reply"[\s\S]*\}/);
          if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]) as AiResponse; } catch {}
          }
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
      const { data } = await supabase.from('ai_chat')
        .select('*')
        .eq('user_id', userIdRef.current)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data.map((row: any) => ({
          id: row.id,
          role: row.role === 'assistant' ? 'model' : 'user',
          text: row.content
        })));
      } else {
        setMessages([{ id: '1', role: 'model', text: "Coach connected. What do you need?" }]);
      }
    }
  };

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem('ai_session_id', newId);
    setSessionId(newId);
    setMessages([{ id: '1', role: 'model', text: "New session started. How can I help?" }]);
  };

  // ─── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    setIsTyping(true);

    if (userIdRef.current) {
      supabase.from('ai_chat').insert({
        id: userMsgId,
        user_id: userIdRef.current,
        session_id: sessionId,
        role: 'user',
        content: text
      });
    }

    try {
      const context = await loadContext();
      const aiRes = await callGroq(text, context);
      let aiText = aiRes.reply;

      // Handle DB Actions
      if (aiRes.actions && aiRes.actions.length > 0) {
        const { success, errorMsg } = await executeActions(aiRes.actions);
        if (success) {
          aiText += "\n\n*(✓ Successfully saved to database)*";
        } else {
          aiText += `\n\n*(⚠ Failed to save to database. Error: ${errorMsg || 'Please try again'})*`;
        }
      }

      const modelMsgId = crypto.randomUUID();
      const modelMsg: AiMessage = { id: modelMsgId, role: 'model', text: aiText };
      setMessages(prev => [...prev, modelMsg]);

      if (userIdRef.current) {
        supabase.from('ai_chat').insert({
          id: modelMsgId,
          user_id: userIdRef.current,
          session_id: sessionId,
          role: 'assistant',
          content: aiRes.reply
        });
      }
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

  return {
    messages,
    isTyping,
    sendMessage,
    startNewChat,
    initChat,
    sessionId
  };
};
