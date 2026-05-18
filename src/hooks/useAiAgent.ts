import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
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
  type: 'insert' | 'update' | 'delete' | 'navigate' | 'update_schedule' | 'update_workout_plan' | 'replace_active_exercise';
  table?: string;
  data?: any;
  match?: Record<string, any>;
  path?: string;
  date?: string;
  dayType?: string;
  planType?: string;
  exercises?: string[];
  oldExercise?: string;
  newExercise?: string;
}

interface AiResponse {
  reply: string;
  actions?: DbAction[];
}

const cache: Record<string, { data: any; ts: number }> = {};
const TTL = 5 * 60 * 1000;
const fromCache = (k: string) => { const e = cache[k]; return e && Date.now() - e.ts < TTL ? e.data : null; };
const toCache = (k: string, d: any) => { cache[k] = { data: d, ts: Date.now() }; };

const getLocalDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};
const getLocalTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:00`;
};

const SYSTEM_PROMPT = (uid: string | null, ctx: string) => {
  const today = getLocalDate();
  const time = getLocalTime();
  const dietLogMatch = ctx.match(/TODAY_DIET_LOG_ID:\s*([a-f0-9-]+)/i);
  const dietLogId = dietLogMatch ? dietLogMatch[1] : "INSERT_DIET_LOG_ID_HERE";

  return `You are Haleem's elite fitness and Strava AI coach (Coach Alberto). Output ONLY valid JSON. Never plain text.
Haleem: 18yo, 182cm, 79.7kg, 17% BF. Targets: 160g P/240g C/70g F/2400kcal.
User ID: ${uid} | Today: ${today}

${ctx}

ALWAYS return ONLY this JSON format:
{"reply":"Your enthusiastic, engaging, and helpful response here","actions":[]}

MEAL LOG EXAMPLE:
{"reply":"Got it! I've logged your rice. That's a solid 28g of carbs to fuel your next session! 🍚🔥","actions":[{"type":"insert","table":"diet_meals","data":{"diet_log_id":"${dietLogId}","name":"Meal","time":"${time}","items":[{"id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","food_id":"","name":"White rice","grams":100,"macros":{"kcal":130,"protein":2.7,"carbs":28,"fat":0.3}}]}}]}

WATER LOG EXAMPLE:
{"reply":"Logged 500ml water","actions":[{"type":"insert","table":"water_logs","data":{"date":"${today}","time":"${today}T${time}Z","amount_ml":500}}]}

RULES:
- Be an enthusiastic, engaging, and encouraging human-like fitness coach! Use emojis, be warm, and celebrate wins. Do NOT be cold or robotic.
- You DO track and analyze running data! If the user asks about a run, their running stats, or running feedback, you MUST analyze their Strava runs provided in 'RECENT_STRAVA_RUNS' and give them elite, coach-level tactical feedback on their pace, elevation spikes, heart rate, and kilometer splits!
- When giving feedback on weightlifting workouts, ONLY mention the EXACT metrics provided in the text (weight, reps). Do NOT invent stats.
- STRICT RULE: 'CURRENT_WORKOUT_PLANS' is just their *planned* schedule. 'RECENT_COMPLETED_WORKOUTS' contains what they *actually* did in reality. Base all performance feedback EXCLUSIVELY on 'RECENT_COMPLETED_WORKOUTS' and 'RECENT_STRAVA_RUNS'.
- If the user explicitly asks you to LOG a workout or CHANGE their schedule/plan, refuse and say: "I cannot log workouts or change your plans directly. Please use the app interface for that."
- HOWEVER, if the user asks for FEEDBACK on past weightlifting workouts or Strava runs, you MUST provide it based on the RECENT_COMPLETED_WORKOUTS and RECENT_STRAVA_RUNS data.
- Use EXACT TODAY_DIET_LOG_ID from context for meals.
- Generate a unique UUID for item id.
- Use your food knowledge. NEVER return 0 for macros unless it's genuinely 0.
- Use diet_meals for caloric foods/drinks.
- For diet_meals, the "time" MUST be exactly formatted as "HH:MM:00" (e.g. "14:30:00"). Do NOT use ISO format.
- For water/hydration, convert to ml and use water_logs (NOT diet_meals).
- actions:[] if no change.`;
};


export const useAiAgent = () => {
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const saved = localStorage.getItem('ai_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
  }, [messages]);
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
          
          let error;
          if (schedData) {
            const updatedDays = { ...schedData.days, [dateStr]: newType };
            const { error: updError } = await supabase.from('schedules').update({ days: updatedDays }).eq('id', schedData.id);
            error = updError;
          } else {
            const d = new Date(dateStr);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];
            
            const { error: insError } = await supabase.from('schedules').insert({
              user_id: session.user.id,
              week_start: weekStart,
              days: { [dateStr]: newType }
            });
            error = insError;
          }

          if (error) {
             allSuccess = false;
             lastError = error.message || "Failed to update schedule";
          } else {
             window.dispatchEvent(new CustomEvent('schedule_updated', { detail: newType }));
          }
        } else if (action.type === 'update_workout_plan') {
          if (!action.planType || !action.exercises) {
            allSuccess = false;
            lastError = "Missing planType or exercises";
            continue;
          }
          const { error } = await supabase.from('user_workout_plans').upsert({
            user_id: session.user.id,
            plan_type: action.planType,
            exercises: action.exercises
          }, { onConflict: 'user_id, plan_type' });
          
          if (error) {
             console.error("Supabase upsert plan error:", error);
             allSuccess = false;
             lastError = error.message || error.details || "Failed to update plan";
          } else {
            window.dispatchEvent(new CustomEvent('plan_updated', { detail: action.planType }));
          }
        } else if (action.type === 'replace_active_exercise') {
           if (!action.oldExercise || !action.newExercise) {
             allSuccess = false;
             lastError = "Missing oldExercise or newExercise";
             continue;
           }
           const activeStr = localStorage.getItem('athlete_dashboard_active_workout');
           if (!activeStr) {
             allSuccess = false;
             lastError = "No active workout found in memory";
             continue;
           }
           try {
             const activeWk = JSON.parse(activeStr);
             const { data: newEx } = await supabase.from('exercises').select('*').eq('name', action.newExercise).single();
             if (!newEx) {
               allSuccess = false;
               lastError = "Exercise not found in database";
               continue;
             }
             activeWk.exercises = activeWk.exercises.map((ex: any) => {
               if (ex.name.toLowerCase() === action.oldExercise!.toLowerCase()) {
                 return {
                   ...ex,
                   id: newEx.id,
                   name: newEx.name,
                   muscle_group: newEx.muscle_group,
                   tier: newEx.tier || 'A',
                   cue: newEx.cue || '',
                   rationale: newEx.rationale || ''
                 };
               }
               return ex;
             });
             localStorage.setItem('athlete_dashboard_active_workout', JSON.stringify(activeWk));
           } catch (e: any) {
             allSuccess = false;
             lastError = "Failed to update active workout";
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
        Object.keys(cache).forEach(k => { if (k.includes(action.table!)) delete cache[k]; });
      } catch (e: any) {
        console.error('Action failed:', e);
        allSuccess = false;
        lastError = e.message || "Unknown error";
      }
    }
    return { success: allSuccess, errorMsg: lastError };
  };

  const loadContext = async (): Promise<string> => {
    const uid = userIdRef.current;
    if (!uid) return '';
    const parts: string[] = [];

    let sched = fromCache('sched');
    if (!sched) {
      const { data } = await supabase.from('schedules').select('id,week_start,days').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle();
      sched = data;
      if (sched) toCache('sched', sched);
    }
    if (sched) parts.push(`SCHEDULE: ${JSON.stringify(sched)}`);

    const ckey = `diet_${getLocalDate()}`;
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

    const { data: customPlans } = await supabase.from('user_workout_plans').select('plan_type, exercises').eq('user_id', uid);
    
    const defaultPlans = {
      PUSH: ['Incline DB Press', 'Machine Chest Press', 'Lateral Raises', 'Overhead Cable Extension (rope)', 'DB Lateral Raise (elbow-lead)'],
      PULL: ['Lat Pulldown (wide grip)', 'Chest-Supported DB Row', 'Sideways One-Arm Rear Delt Fly', 'Face Pull (rope eye height)', 'Incline DB Curl - Bayesian', 'Zottman Curl'],
      LEGS: ['Leg Press (feet high for glutes)', 'DB Romanian Deadlift', 'DB Bulgarian Split Squat', 'Seated Leg Curl', '45° Back Extension (BW/DB)', 'Standing Calf Raise']
    };

    const currentPlans = { ...defaultPlans };
    if (customPlans) {
      customPlans.forEach(p => {
        if (p.exercises && p.exercises.length > 0) currentPlans[p.plan_type as keyof typeof currentPlans] = p.exercises;
      });
    }
    parts.push(`CURRENT_WORKOUT_PLANS: ${JSON.stringify(currentPlans)}`);

    const activeWorkoutStr = localStorage.getItem('athlete_dashboard_active_workout');
    if (activeWorkoutStr) {
       try {
         const aw = JSON.parse(activeWorkoutStr);
         const activeEx = aw.exercises.map((e: any) => e.name);
         parts.push(`ACTIVE_WORKOUT_IN_PROGRESS: ${JSON.stringify(activeEx)}`);
       } catch (e) {}
    }

    // Load recent past gym workouts
    const { data: recentWorkouts } = await supabase.from('workouts')
      .select('day_type, created_at, title, duration, notes, total_volume, workout_exercises(sets, exercises(name))')
      .eq('user_id', uid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentWorkouts && recentWorkouts.length > 0) {
      const summary = recentWorkouts
        .filter(w => w.day_type !== 'RUN')
        .map(w => {
         const exSummary = w.workout_exercises?.map((we: any) => {
           const name = we.exercises?.name;
           const setInfo = we.sets?.map((s: any) => `${s.weight}kg x ${s.reps}`).join(', ') || 'no sets';
           return `${name}: [${setInfo}]`;
         }).join(' | ') || '';
         return `${w.day_type} on ${new Date(w.created_at).toLocaleDateString()}: ${exSummary}`;
      });
      parts.push(`RECENT_COMPLETED_WORKOUTS (with weights and sets): \n${summary.join('\n')}`);

      const recentLifts = recentWorkouts.filter(w => w.day_type !== 'RUN' && w.total_volume > 0);
      if (recentLifts.length >= 2) {
        const latestVol = recentLifts[0].total_volume;
        const prevVol = recentLifts[1].total_volume;
        const diff = latestVol - prevVol;
        if (diff > 0) {
          parts.push(`VOLUME TREND: The user lifted ${diff}kg MORE in their last session (${latestVol}kg) compared to the previous session (${prevVol}kg). Congratulate them on the progressive overload!`);
        }
      }
    }

    // Load recent Strava activities & telemetry streams
    const { data: stravaActs } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('athlete_id', uid)
      .order('start_date', { ascending: false })
      .limit(10);

    if (stravaActs && stravaActs.length > 0) {
      const stravaSummary = stravaActs.map((act: any) => {
        let streamStr = '';
        let splitsStr = '';
        if (act.cached_data) {
          try {
            const cached = typeof act.cached_data === 'string' ? JSON.parse(act.cached_data) : act.cached_data;
            if (cached.splits_metric && cached.splits_metric.length > 0) {
              splitsStr = `KM Splits: [${cached.splits_metric.map((s: any) => {
                const spd = s.average_speed;
                if (!spd) return `KM ${s.split}: 0:00`;
                const paceSecs = 1000 / spd;
                const m = Math.floor(paceSecs / 60);
                const sec = Math.floor(paceSecs % 60);
                return `KM ${s.split}: ${m}:${sec.toString().padStart(2, '0')}/km`;
              }).join(', ')}]`;
            }
            if (cached.stream_data && cached.stream_data.length > 0) {
              const maxElev = Math.max(...cached.stream_data.map((s: any) => s.altitude || 0));
              const minElev = Math.min(...cached.stream_data.map((s: any) => s.altitude || 0));
              const maxHR = Math.max(...cached.stream_data.map((s: any) => s.heartrate || 0));
              streamStr = `Elevation min/max: ${minElev}m to ${maxElev}m. Max Heartrate: ${maxHR > 0 ? maxHR : act.max_heartrate || 'N/A'} bpm.`;
            }
          } catch (e) {}
        }
        const distKm = act.distance ? (Number(act.distance) / 1000).toFixed(2) : '0';
        const durationMins = act.moving_time ? (Number(act.moving_time) / 60).toFixed(1) : '0';
        return `Run "${act.name}" on ${new Date(act.start_date).toLocaleDateString()}: ${distKm}km in ${durationMins} mins. Avg Heartrate: ${act.average_heartrate || 'N/A'} bpm. Total Elevation Gain: ${act.elevation_gain || act.total_elevation_gain || 0}m. ${splitsStr} ${streamStr}`;
      });
      parts.push(`RECENT_STRAVA_RUNS (with kilometer splits and telemetry): \n${stravaSummary.join('\n')}`);
    }

    return parts.join('\n');
  };

  const callGroq = async (userText: string, context: string): Promise<AiResponse> => {
    const key = getApiKey();
    if (!key) throw new Error('VITE_GROQ_API_KEY not set');

    const msgs = [
      { role: 'system', content: SYSTEM_PROMPT(userIdRef.current, context) },
      { role: 'user', content: userText }
    ];

    console.log("AI CONTEXT DUMP:", context);
    console.log("AI MESSAGES:", msgs);

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      const supportsJson = model !== 'mixtral-8x7b-32768';

      try {
        const res = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({
            model,
            messages: msgs,
            temperature: 0.6,
            max_tokens: 512,
            ...(supportsJson ? { response_format: { type: 'json_object' } } : {})
          })
        });

        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          const msg = JSON.stringify(e);
          const isRateLimit = msg.includes('429') || msg.includes('rate_limit') || msg.includes('TPM') || msg.includes('RMP');
          if (isRateLimit && i < MODELS.length - 1) {
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

  const initChat = async () => {
    if (initialized.current) return;
    initialized.current = true;
    const { data: { session } } = await supabase.auth.getSession();
    userIdRef.current = session?.user?.id || null;

    if (!getApiKey()) {
      setMessages([{ id: 'no-key', role: 'model', text: 'Add VITE_GROQ_API_KEY to Vercel environment variables.' }]);
      return;
    }

    setMessages(prev => {
      if (prev.length === 0) {
        return [{ id: '1', role: 'model', text: "Coach Alberto connected. What do you need?" }];
      }
      return prev;
    });
  };

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem('ai_session_id', newId);
    setSessionId(newId);
    setMessages([{ id: '1', role: 'model', text: "New session started. How can I help?" }]);
  };

  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    setIsTyping(true);

    try {
      const context = await loadContext();
      const aiRes = await callGroq(text, context);
      let aiText = aiRes.reply;

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
