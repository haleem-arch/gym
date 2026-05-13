import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GROQ_API_KEY;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// Llama 3.3 70B — supports tool calling, 14,400 free req/day
const MODEL = 'llama-3.3-70b-versatile';

export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAction?: boolean;
}

// Internal Groq message format
interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

const SYSTEM_PROMPT = `You are Haleem's Omnipotent AI Coach with full DB read/write access.

TABLES: profiles, exercises, food_inventory(user_id,name,kcal_per_100g,protein,carbs,fat), schedules, workouts, workout_exercises(sets JSON), diet_logs(date,daily_totals), diet_meals(diet_log_id,name,time,items JSON).

RULES:
- Minimize tool calls. Use your own knowledge for food macros — never search externally.
- To log food: SELECT diet_logs for today → INSERT into diet_meals with macros from your own knowledge.
- For DB writes, user_id is injected automatically.
- Be brief and direct in responses.`;

const GROQ_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'execute_database_query',
      description: 'Run select/insert/update/delete on any Supabase table.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'select | insert | update | delete' },
          table: { type: 'string', description: 'Table name' },
          payload: { type: 'object', description: 'Match criteria for select/delete, or record data for insert/update. For update, include id.' },
          select_columns: { type: 'string', description: 'Columns to return for select (default "*")' }
        },
        required: ['action', 'table', 'payload']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navigate the app to a specific route',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Route: "/", "/workout", "/diet", "/diet/inventory", "/ai"' }
        },
        required: ['path']
      }
    }
  }
];

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  // Full conversation history for Groq (stateless API needs full context)
  const historyRef = useRef<GroqMessage[]>([]);
  const userIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  const callGroq = async (msgs: GroqMessage[]): Promise<any> => {
    const key = getApiKey();
    if (!key) throw new Error('No VITE_GROQ_API_KEY found in environment');

    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: msgs,
        tools: GROQ_TOOLS,
        tool_choice: 'auto',
        temperature: 0.1,
        max_tokens: 1024
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err));
    }
    return res.json();
  };

  const executeToolCall = async (name: string, args: any): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return JSON.stringify({ error: 'Not authenticated' });

    if (name === 'navigate_to') {
      navigate(args.path);
      return JSON.stringify({ status: 'success', navigated_to: args.path });
    }

    if (name === 'execute_database_query') {
      const { action, table, payload, select_columns = '*' } = args;

      // Auto-inject user_id for inserts
      if (action === 'insert' && typeof payload === 'object' && !Array.isArray(payload) && !payload.user_id && table !== 'exercises') {
        payload.user_id = session.user.id;
      }

      try {
        let result: any;
        if (action === 'select') {
          let query = supabase.from(table).select(select_columns);
          Object.entries(payload).forEach(([k, v]) => { query = (query as any).eq(k, v); });
          result = await query;
        } else if (action === 'insert') {
          result = await supabase.from(table).insert(payload).select();
        } else if (action === 'update') {
          if (!payload.id) return JSON.stringify({ error: "Update requires 'id' in payload" });
          const { id, ...updates } = payload;
          result = await supabase.from(table).update(updates).eq('id', id).select();
        } else if (action === 'delete') {
          let query = supabase.from(table).delete();
          Object.entries(payload).forEach(([k, v]) => { query = (query as any).eq(k, v); });
          result = await query;
        }
        if (result?.error) throw result.error;
        return JSON.stringify({ status: 'success', data: result?.data });
      } catch (err: any) {
        return JSON.stringify({ error: err.message || 'Query failed' });
      }
    }

    return JSON.stringify({ error: 'Unknown tool' });
  };

  const initChat = async () => {
    if (initialized.current) return;
    initialized.current = true;

    const key = getApiKey();
    if (!key) {
      setMessages([{ id: 'no-key', role: 'model', text: 'No API key found. Add VITE_GROQ_API_KEY to your Vercel environment variables.' }]);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      userIdRef.current = session?.user?.id || null;

      // System message initializes the conversation
      historyRef.current = [{
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nDate: ${new Date().toISOString().split('T')[0]}\nUser ID: ${userIdRef.current}`
      }];

      // Load saved UI messages (display only, don't replay)
      if (userIdRef.current) {
        const { data } = await supabase.from('ai_chat').select('messages').eq('user_id', userIdRef.current).maybeSingle();
        if (data?.messages && (data.messages as any[]).length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{ id: '1', role: 'model', text: `Connected via Groq (Llama 3.3 70B). Full dashboard access active. What do you need?` }]);
        }
      }
    } catch (e: any) {
      setMessages([{ id: 'error', role: 'model', text: `Failed to connect: ${e.message}` }]);
    }
  };

  const saveHistory = async (newMessages: AiMessage[]) => {
    if (!userIdRef.current) return;
    const trimmed = newMessages.slice(-30);
    const { data } = await supabase.from('ai_chat').select('id').eq('user_id', userIdRef.current).maybeSingle();
    if (data) {
      await supabase.from('ai_chat').update({ messages: trimmed, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await supabase.from('ai_chat').insert({ user_id: userIdRef.current, messages: trimmed });
    }
  };

  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    // Add user message to Groq history
    historyRef.current = [...historyRef.current, { role: 'user', content: text }];

    try {
      let currentHistory = [...historyRef.current];
      let finalText = '';

      // Agentic loop — keeps going until no more tool calls
      while (true) {
        const groqRes = await callGroq(currentHistory);
        const choice = groqRes.choices[0];
        const assistantMsg = choice.message;

        // Add assistant response to history
        currentHistory = [...currentHistory, assistantMsg];

        if (choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls?.length > 0) {
          // Execute all tool calls in this response
          const toolResultMsgs: GroqMessage[] = [];

          for (const tc of assistantMsg.tool_calls) {
            const toolName = tc.function.name;
            const toolArgs = JSON.parse(tc.function.arguments || '{}');

            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'model',
              text: `⚡ ${toolName.replace(/_/g, ' ')}...`,
              isAction: true
            }]);

            const result = await executeToolCall(toolName, toolArgs);
            toolResultMsgs.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: result
            });
          }

          // Add all tool results to history and loop
          currentHistory = [...currentHistory, ...toolResultMsgs];
        } else {
          // No more tool calls — we have the final answer
          finalText = assistantMsg.content || 'Done.';
          break;
        }
      }

      // Save the final history
      historyRef.current = currentHistory;

      const finalMessages = [...newMessages, { id: crypto.randomUUID(), role: 'model', text: finalText } as AiMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);

    } catch (e: any) {
      console.error(e);
      setMessages([...newMessages, { id: crypto.randomUUID(), role: 'model', text: `Error: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage, initChat, currentModel: MODEL, clearHistory: () => { setMessages([]); historyRef.current = []; } };
};
