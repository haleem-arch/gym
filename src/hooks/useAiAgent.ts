import { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
// Clear any stale cached key from localStorage that may be suspended
try { localStorage.removeItem('gemini_api_key'); } catch (_) {}

// Model fallback chain — auto-switches on quota exhaustion
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const isQuotaError = (e: any) => {
  const msg = JSON.stringify(e?.message || e || '');
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
};

export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAction?: boolean;
}

// Compact system prompt — sent ONCE per session, not per message
const SYSTEM_PROMPT = `You are Haleem's Omnipotent AI Coach with full DB read/write access.

TABLES: profiles, exercises, food_inventory(user_id,name,kcal_per_100g,protein,carbs,fat), schedules, workouts, workout_exercises(sets JSON), diet_logs(date,daily_totals), diet_meals(diet_log_id,name,time,items JSON).

RULES:
- Minimize tool calls. Use intrinsic knowledge for food macros — never search externally.
- To log food: SELECT diet_logs for today → INSERT into diet_meals with macros from your own knowledge.
- For DB writes always include user_id (injected automatically for inserts).
- Be brief and direct in responses.`;

const tools: any = [{
  functionDeclarations: [
    {
      name: 'execute_database_query',
      description: 'Run select/insert/update/delete on any Supabase table.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: 'select | insert | update | delete' },
          table: { type: Type.STRING, description: 'Table name' },
          payload: { type: Type.OBJECT, description: 'Match criteria for select/delete, or record data for insert/update. For update, include id.' },
          select_columns: { type: Type.STRING, description: 'Columns to return for select (default "*")' }
        },
        required: ['action', 'table', 'payload']
      }
    },
    {
      name: 'navigate_to',
      description: 'Navigate the app to a route',
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'Route: "/", "/workout", "/diet", "/diet/inventory", "/ai"' }
        },
        required: ['path']
      }
    }
  ]
}];

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState(MODEL_CHAIN[0]);
  const navigate = useNavigate();
  const chatSessionRef = useRef<any>(null);
  const modelIndexRef = useRef(0);
  const aiRef = useRef<any>(null);
  const userIdRef = useRef<string | null>(null);

  const createSession = (modelName: string) => {
    if (!aiRef.current) return null;
    return aiRef.current.chats.create({
      model: modelName,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nDate: ${new Date().toISOString().split('T')[0]}\nUser ID: ${userIdRef.current}`,
        temperature: 0.1,
        tools: tools as any,
      }
    });
  };

  const switchToNextModel = () => {
    modelIndexRef.current = Math.min(modelIndexRef.current + 1, MODEL_CHAIN.length - 1);
    const nextModel = MODEL_CHAIN[modelIndexRef.current];
    setCurrentModel(nextModel);
    chatSessionRef.current = createSession(nextModel);
    return nextModel;
  };

  const initChat = async (providedKey?: string) => {
    if (chatSessionRef.current) return;

    const keyToUse = providedKey || getApiKey();
    if (!keyToUse) {
      setMessages([{ id: 'no-key', role: 'model', text: "No API key found. Paste your Gemini API Key (starts with AIzaSy...) here to connect." }]);
      return;
    }

    try {
      aiRef.current = new GoogleGenAI({ apiKey: keyToUse });
      const { data: { session } } = await supabase.auth.getSession();
      userIdRef.current = session?.user?.id || null;

      chatSessionRef.current = createSession(MODEL_CHAIN[0]);

      // Do NOT save to localStorage — keys get suspended and get stuck in browsers

      // Load saved history (UI only — no replay cost)
      if (userIdRef.current) {
        const { data } = await supabase.from('ai_chat').select('messages').eq('user_id', userIdRef.current).maybeSingle();
        if (data?.messages && (data.messages as any[]).length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{ id: '1', role: 'model', text: `Connected on ${MODEL_CHAIN[0]}. Full dashboard access active. What do you need?` }]);
        }
      }
    } catch (e: any) {
      setMessages([{ id: 'error', role: 'model', text: `Failed to connect: ${e.message}` }]);
    }
  };

  const saveHistory = async (newMessages: AiMessage[]) => {
    if (!userIdRef.current) return;
    // Only save last 30 messages to keep storage lean
    const trimmed = newMessages.slice(-30);
    const { data } = await supabase.from('ai_chat').select('id').eq('user_id', userIdRef.current).maybeSingle();
    if (data) {
      await supabase.from('ai_chat').update({ messages: trimmed, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await supabase.from('ai_chat').insert({ user_id: userIdRef.current, messages: trimmed });
    }
  };

  const executeToolCall = async (call: any): Promise<any> => {
    const { name, args } = call;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'Not authenticated' };

    if (name === 'navigate_to') {
      navigate(args.path);
      return { status: 'success', navigated_to: args.path };
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
          if (!payload.id) return { error: "Update requires 'id' in payload" };
          const { id, ...updates } = payload;
          result = await supabase.from(table).update(updates).eq('id', id).select();
        } else if (action === 'delete') {
          let query = supabase.from(table).delete();
          Object.entries(payload).forEach(([k, v]) => { query = (query as any).eq(k, v); });
          result = await query;
        }
        if (result?.error) throw result.error;
        return { status: 'success', data: result?.data };
      } catch (err: any) {
        return { error: err.message || 'Query failed' };
      }
    }

    return { error: 'Unknown tool' };
  };

  const sendMessage = async (text: string) => {
    let keyProvidedNow = false;

    if (!chatSessionRef.current) {
      await initChat();
    }

    if (!chatSessionRef.current) return;
    if (keyProvidedNow) return;

    const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    const attemptSend = async (retryCount = 0): Promise<string> => {
      try {
        let response = await chatSessionRef.current.sendMessage({ message: text });

        while (response.functionCalls && response.functionCalls.length > 0) {
          const functionCall = response.functionCalls[0];
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: `⚡ ${functionCall.name.replace(/_/g, ' ')}...`,
            isAction: true
          }]);
          const toolResult = await executeToolCall(functionCall);
          response = await chatSessionRef.current.sendMessage({
            message: [{ functionResponse: { name: functionCall.name, response: toolResult } }]
          });
        }

        return response.text || 'Done.';
      } catch (e: any) {
        if (isQuotaError(e) && retryCount < MODEL_CHAIN.length - 1) {
          const nextModel = switchToNextModel();
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: `⚠️ Quota hit. Switching to ${nextModel}...`,
            isAction: true
          }]);
          return attemptSend(retryCount + 1);
        }
        throw e;
      }
    };

    try {
      const modelText = await attemptSend();
      const finalMessages = [...newMessages, { id: crypto.randomUUID(), role: 'model', text: modelText } as AiMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (e: any) {
      setMessages([...newMessages, { id: crypto.randomUUID(), role: 'model', text: `All models exhausted. Try again later. (${e.message})` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage, initChat, currentModel, clearHistory: () => setMessages([]) };
};
