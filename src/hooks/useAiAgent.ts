import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

// ─── In-memory cache (5-min TTL) ─────────────────────────────────────────────
interface CacheEntry { data: any; ts: number; }
const cache: Record<string, CacheEntry> = {};
const TTL = 5 * 60 * 1000;
const fromCache = (k: string) => { const e = cache[k]; return e && Date.now() - e.ts < TTL ? e.data : null; };
const toCache = (k: string, data: any) => { cache[k] = { data, ts: Date.now() }; };

// ─── Intent detection — determines what context to pre-load ─────────────────
const detectIntent = (text: string) => {
  const t = text.toLowerCase();
  return {
    needsNutrition: /protein|calor|kcal|carb|fat|food|eat|meal|diet|macro|water/.test(t),
    needsWorkout: /workout|exercise|gym|lift|push|pull|leg|set|rep|volume|progress|stronger/.test(t),
    needsBodyComp: /inbody|weight|bmi|body fat|bf%|muscle|progress|physique|scan/.test(t),
    needsSchedule: /schedule|plan|week|today|tomorrow|when|session|split/.test(t),
  };
};

// ─── System prompt ────────────────────────────────────────────────────────────
const buildSystemPrompt = (userId: string | null, extraContext: string) => `
You are Haleem's personal AI coach — direct, evidence-based, no-bullshit.

ABOUT HALEEM:
Age: 18 · Height: 182 cm · Weight: 79.7 kg · BF: 17.2% · SMM: 37.6 kg
BMR: 1,796 kcal · InBody: 82 · Goal: Recompose to 11-13% BF + 40kg muscle by Aug 2026
Runner 4-5x/week + Gym 3x/week (Push/Pull/Legs)
Targets: 160g protein / 240g carbs / 70g fat / 2,400 kcal

PERSONALITY: Speak like a knowledgeable friend. Concise on mobile. Use bullets for multi-step.
Never show loading steps or internal monologue. Respond clean and immediately.

DB TABLES: profiles, exercises, food_inventory, schedules, workouts, workout_exercises, diet_logs, diet_meals
USER ID: ${userId}
TODAY: ${new Date().toISOString().split('T')[0]}

${extraContext}
`.trim();

// ─── Tools ────────────────────────────────────────────────────────────────────
const GROQ_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'db_query',
      description: 'Run select/insert/update/delete on Supabase. Use this to read or write any user data.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'select | insert | update | delete' },
          table: { type: 'string', description: 'Table name' },
          payload: { type: 'object', description: 'For select/delete: match criteria. For insert/update: record data (include id for update).' },
          select_columns: { type: 'string', description: 'Columns for select, default "*"' }
        },
        required: ['action', 'table', 'payload']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navigate app to a route',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string', description: '"/", "/workout", "/diet", "/diet/inventory", "/ai"' } },
        required: ['path']
      }
    }
  }
];

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const historyRef = useRef<GroqMessage[]>([]);
  const userIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  // ─── DB tool executor ───────────────────────────────────────────────────────
  const runDbTool = async (name: string, args: any): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return JSON.stringify({ error: 'Not authenticated' });

    if (name === 'navigate_to') {
      navigate(args.path);
      return JSON.stringify({ ok: true, path: args.path });
    }

    if (name === 'db_query') {
      const { action, table, payload, select_columns = '*' } = args;
      if (action === 'insert' && !payload.user_id && table !== 'exercises') {
        payload.user_id = session.user.id;
      }
      try {
        let result: any;
        if (action === 'select') {
          let q = supabase.from(table).select(select_columns);
          Object.entries(payload).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          result = await q;
        } else if (action === 'insert') {
          result = await supabase.from(table).insert(payload).select();
        } else if (action === 'update') {
          if (!payload.id) return JSON.stringify({ error: "Need id for update" });
          const { id, ...rest } = payload;
          result = await supabase.from(table).update(rest).eq('id', id).select();
        } else if (action === 'delete') {
          let q = supabase.from(table).delete();
          Object.entries(payload).forEach(([k, v]) => { q = (q as any).eq(k, v); });
          result = await q;
        }
        if (result?.error) throw result.error;
        return JSON.stringify({ ok: true, data: result?.data });
      } catch (e: any) {
        return JSON.stringify({ error: e.message });
      }
    }
    return JSON.stringify({ error: 'Unknown tool' });
  };

  // ─── Smart context pre-loader ───────────────────────────────────────────────
  const loadContext = async (text: string): Promise<string> => {
    const uid = userIdRef.current;
    if (!uid) return '';
    const intent = detectIntent(text);
    const ctx: string[] = [];

    // Always-loaded lightweight data (cached)
    let schedule = fromCache('schedule');
    if (!schedule) {
      const { data } = await supabase.from('schedules').select('days').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle();
      schedule = data?.days || null;
      if (schedule) toCache('schedule', schedule);
    }
    if (schedule) ctx.push(`CURRENT SCHEDULE: ${JSON.stringify(schedule)}`);

    // Load today's diet log only if nutrition question
    if (intent.needsNutrition) {
      const today = new Date().toISOString().split('T')[0];
      const ckey = `diet_${today}`;
      let dietLog = fromCache(ckey);
      if (!dietLog) {
        const { data: log } = await supabase.from('diet_logs').select('id,daily_totals').eq('user_id', uid).eq('date', today).maybeSingle();
        if (log) {
          const { data: meals } = await supabase.from('diet_meals').select('name,time,items').eq('diet_log_id', log.id);
          dietLog = { totals: log.daily_totals, meals };
          toCache(ckey, dietLog);
        }
      }
      if (dietLog) ctx.push(`TODAY'S NUTRITION: ${JSON.stringify(dietLog)}`);
    }

    // Load last 4 workouts only if performance question
    if (intent.needsWorkout) {
      const ckey = 'recent_workouts';
      let workouts = fromCache(ckey);
      if (!workouts) {
        const { data } = await supabase.from('workouts').select('date,day_type,total_volume,status').eq('user_id', uid).order('date', { ascending: false }).limit(4);
        workouts = data;
        if (workouts) toCache(ckey, workouts);
      }
      if (workouts) ctx.push(`RECENT WORKOUTS: ${JSON.stringify(workouts)}`);
    }

    // Load InBody only if body comp question
    if (intent.needsBodyComp) {
      const ckey = 'inbody';
      let scans = fromCache(ckey);
      if (!scans) {
        const { data } = await supabase.from('profiles').select('targets').eq('id', uid).maybeSingle();
        scans = data;
        if (scans) toCache(ckey, scans);
      }
      if (scans) ctx.push(`PROFILE/TARGETS: ${JSON.stringify(scans)}`);
    }

    return ctx.join('\n\n');
  };

  // ─── Groq API call ──────────────────────────────────────────────────────────
  const callGroq = async (msgs: GroqMessage[]): Promise<any> => {
    const key = getApiKey();
    if (!key) throw new Error('VITE_GROQ_API_KEY not set in environment');
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages: msgs, tools: GROQ_TOOLS, tool_choice: 'auto', temperature: 0.15, max_tokens: 1024 })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(JSON.stringify(e)); }
    return res.json();
  };

  // ─── Init ───────────────────────────────────────────────────────────────────
  const initChat = async () => {
    if (initialized.current) return;
    initialized.current = true;
    if (!getApiKey()) {
      setMessages([{ id: 'no-key', role: 'model', text: 'Add VITE_GROQ_API_KEY to Vercel environment variables to activate AI Coach.' }]);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    userIdRef.current = session?.user?.id || null;

    if (userIdRef.current) {
      const { data } = await supabase.from('ai_chat').select('messages').eq('user_id', userIdRef.current).maybeSingle();
      if (data?.messages && (data.messages as any[]).length > 0) {
        setMessages(data.messages as AiMessage[]);
        // Rebuild history for Groq from saved messages
        historyRef.current = (data.messages as AiMessage[]).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
      } else {
        setMessages([{ id: '1', role: 'model', text: "Coach connected. Ready to work — what's the plan?" }]);
      }
    }
  };

  // ─── Save ───────────────────────────────────────────────────────────────────
  const saveHistory = async (msgs: AiMessage[]) => {
    if (!userIdRef.current) return;
    const trimmed = msgs.slice(-30);
    const { data } = await supabase.from('ai_chat').select('id').eq('user_id', userIdRef.current).maybeSingle();
    if (data) {
      await supabase.from('ai_chat').update({ messages: trimmed, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await supabase.from('ai_chat').insert({ user_id: userIdRef.current, messages: trimmed });
    }
  };

  // ─── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 1. Load relevant context INVISIBLY before first API call
      const extraContext = await loadContext(text);
      const systemMsg: GroqMessage = {
        role: 'system',
        content: buildSystemPrompt(userIdRef.current, extraContext)
      };

      // Build full message list: system + history + new user message
      const userGroqMsg: GroqMessage = { role: 'user', content: text };
      let currentHistory: GroqMessage[] = [systemMsg, ...historyRef.current, userGroqMsg];

      // 2. Agentic loop — all tool calls happen silently
      let finalText = '';
      while (true) {
        const groqRes = await callGroq(currentHistory);
        const choice = groqRes.choices[0];
        const assistantMsg = choice.message;
        currentHistory = [...currentHistory, assistantMsg];

        if (choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls?.length > 0) {
          const toolResults: GroqMessage[] = [];
          for (const tc of assistantMsg.tool_calls) {
            const result = await runDbTool(tc.function.name, JSON.parse(tc.function.arguments || '{}'));
            toolResults.push({ role: 'tool', tool_call_id: tc.id, content: result });
          }
          currentHistory = [...currentHistory, ...toolResults];
        } else {
          finalText = assistantMsg.content || 'Done.';
          break;
        }
      }

      // 3. Update history ref (strip system message for next turns)
      historyRef.current = [...historyRef.current, userGroqMsg, { role: 'assistant', content: finalText }];
      // Keep last 20 turns to avoid context bloat
      if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

      const modelMsg: AiMessage = { id: crypto.randomUUID(), role: 'model', text: finalText };
      setMessages(prev => {
        const next = [...prev, modelMsg];
        saveHistory(next);
        return next;
      });
    } catch (e: any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: `Error: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    historyRef.current = [];
    cache['schedule'] = { data: null, ts: 0 };
  };

  return { messages, isTyping, sendMessage, initChat, currentModel: MODEL, clearHistory };
};
