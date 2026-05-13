import { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAction?: boolean;
}

const SYSTEM_PROMPT = `You are Haleem's Omnipotent AI Coach. You have full read and write access to the entire Athlete Dashboard database.
You act on Haleem's behalf. You can add foods, edit workouts, log meals, change his schedule, and query anything.

DATABASE SCHEMA:
- profiles (id, name, targets {"kcal": 2400, "protein": 160, "carbs": 240, "fat": 70})
- exercises (id, name, muscle_group, tier, focus, cue, rationale, equipment) -> Global library
- food_inventory (id, user_id, name, kcal_per_100g, protein, carbs, fat) -> User's saved foods
- schedules (id, user_id, week_start, days {"2026-05-13": "PUSH"}) -> Weekly planner
- workouts (id, user_id, date, day_type, duration, total_volume, status)
- workout_exercises (id, workout_id, exercise_id, sets [{"setNum":1,"weight":50,"reps":10,"rpe":8,"done":true}])
- diet_logs (id, user_id, date, daily_totals {"kcal": 0, "protein": 0, "carbs": 0, "fat": 0, "water": 0})
- diet_meals (id, diet_log_id, name, time, items [{"food_id":"...","name":"Tahini","grams":100,"macros":{...}}])

INSTRUCTIONS:
1. When asked to do something, use the \`execute_database_query\` tool. 
2. You can chain queries (e.g., first SELECT to find an ID, then INSERT/UPDATE using that ID).
3. If asked to navigate, use \`navigate_to\`.
4. Always confirm what you did briefly in your response.
5. BE CONFIDENT AND DIRECT. You are in full control of his dashboard.

Example: "I just ate 100g of Tahini for breakfast"
- Query food_inventory for 'Tahini'
- Get diet_log_id for today
- Insert into diet_meals.
`;

const tools: any = [{
  functionDeclarations: [
    {
      name: 'execute_database_query',
      description: 'Execute a read or write query against the Supabase database. You have full access to all tables.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: 'One of: select, insert, update, delete' },
          table: { type: Type.STRING, description: 'The table name' },
          payload: { type: Type.OBJECT, description: 'For insert/update: the record data. For select/delete: the match criteria (e.g. {"name": "Tahini"} or {"id": "123"}).' },
          select_columns: { type: Type.STRING, description: 'For select action: columns to return. Default "*"' }
        },
        required: ['action', 'table', 'payload']
      }
    },
    {
      name: 'navigate_to',
      description: 'Navigate the user to a specific page in the app',
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'Route path (e.g., "/", "/workout", "/diet", "/diet/inventory")' }
        },
        required: ['path']
      }
    }
  ]
}];

export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const chatSessionRef = useRef<any>(null);

  const initChat = async () => {
    if (chatSessionRef.current) return;
    
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const { data: { session } } = await supabase.auth.getSession();
      
      const contextPrompt = `${SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\nDate: ${new Date().toISOString().split('T')[0]}\nUser ID: ${session?.user?.id}`;

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          systemInstruction: contextPrompt,
          temperature: 0.2,
          tools: tools as any,
        }
      });
      
      // Load history
      if (session?.user?.id) {
        const { data } = await supabase.from('ai_chat').select('messages').eq('user_id', session.user.id).maybeSingle();
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
          // Note: Full history reconstruction for the genai client is complex, we just keep UI history for now
          // and let the agent rely on current context queries.
        } else {
          setMessages([{ id: '1', role: 'model', text: "I'm connected and have full control of your dashboard. What's the plan for today?" }]);
        }
      }
    } catch (e: any) {
      console.error("Failed to init AI:", e);
    }
  };

  const saveHistory = async (newMessages: AiMessage[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    
    const { data } = await supabase.from('ai_chat').select('id').eq('user_id', session.user.id).maybeSingle();
    if (data) {
      await supabase.from('ai_chat').update({ messages: newMessages, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await supabase.from('ai_chat').insert({ user_id: session.user.id, messages: newMessages });
    }
  };

  const executeToolCall = async (call: any): Promise<any> => {
    const { name, args } = call;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Not authenticated" };

    if (name === 'navigate_to') {
      navigate(args.path);
      return { status: 'success', navigated_to: args.path };
    }

    if (name === 'execute_database_query') {
      const { action, table, payload, select_columns = '*' } = args;
      
      // Auto-inject user_id for inserts if table requires it and it's missing
      if (action === 'insert' && typeof payload === 'object' && !Array.isArray(payload) && !payload.user_id && table !== 'exercises') {
        payload.user_id = session.user.id;
      }

      try {
        let result;
        if (action === 'select') {
          let query = supabase.from(table).select(select_columns);
          Object.entries(payload).forEach(([k, v]) => { query = query.eq(k, v); });
          result = await query;
        } else if (action === 'insert') {
          result = await supabase.from(table).insert(payload).select();
        } else if (action === 'update') {
          // Need an ID or match criteria. Assuming payload isn't the match, wait, payload needs to separate data vs match.
          // Since the tool definition only has payload, let's assume update requires { id: ... } in payload.
          if (payload.id) {
            const { id, ...updates } = payload;
            result = await supabase.from(table).update(updates).eq('id', id).select();
          } else {
             // If they provide match criteria in a different way, this might fail, but let's assume they provide ID
            return { error: "Update requires 'id' in payload" };
          }
        } else if (action === 'delete') {
          let query = supabase.from(table).delete();
          Object.entries(payload).forEach(([k, v]) => { query = query.eq(k, v); });
          result = await query;
        }

        if (result?.error) throw result.error;
        return { status: 'success', data: result?.data };
      } catch (err: any) {
        return { error: err.message || "Query failed" };
      }
    }
    
    return { error: "Unknown tool" };
  };

  const sendMessage = async (text: string) => {
    if (!chatSessionRef.current) await initChat();
    
    const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) throw new Error("Brain not initialized");
      let response = await chatSessionRef.current.sendMessage(text);
      
      // Handle tool calls recursively
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        
        // Add visual indicator for action
        setMessages(prev => [...prev, { 
          id: crypto.randomUUID(), 
          role: 'model', 
          text: `Executing: ${functionCall.name}...`, 
          isAction: true 
        }]);

        const toolResult = await executeToolCall(functionCall);
        
        // Send result back to model
        response = await chatSessionRef.current.sendMessage(
          [{ functionResponse: { name: functionCall.name, response: toolResult } }]
        );
      }

      const modelText = response.text || 'Done.';
      
      // Filter out action messages for final state to keep it clean, or keep them. Let's keep them but faded.
      const finalMessages = [...newMessages, { id: crypto.randomUUID(), role: 'model', text: modelText } as AiMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);

    } catch (e: any) {
      console.error(e);
      setMessages([...newMessages, { id: crypto.randomUUID(), role: 'model', text: `Error connecting to brain: ${e.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage, initChat, clearHistory: () => setMessages([]) };
};
