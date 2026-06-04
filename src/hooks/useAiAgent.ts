import { useState, useRef, useEffect } from 'react';
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
  draftMeal?: any;
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

const SYSTEM_PROMPT = (clientName: string, uid: string | null, ctx: string) => {
  const today = getLocalDate();
  const time = getLocalTime();
  // Support both key variants for diet log id
  const dietLogMatch = ctx.match(/(?:SELECTED_DATE_DIET_LOG_ID|TODAY_DIET_LOG_ID):\s*([a-f0-9-]+)/i);
  const dietLogId = dietLogMatch ? dietLogMatch[1] : "INSERT_DIET_LOG_ID_HERE";

  return `You are ${clientName || 'Client'}'s Nano Banana Pro nutrition and hydration AI coach. Your name is Alberto. Output ONLY valid JSON. Never plain text.
Client Name: ${clientName || 'Client'}
User ID: ${uid} | Today: ${today}

${ctx}

ALWAYS return ONLY this JSON format:
{"reply":"Your enthusiastic, engaging, and helpful response here","actions":[]}

SAFETY & COMPLIANCE RULES:
- You are a performance nutrition coach, NOT a medical doctor or licensed clinical dietitian.
- If the user asks for medical advice, disease diagnostics, clinical treatment, or metabolic syndrome answers, you MUST state that you are a Nano Banana Pro performance coach, decline medical prescribing, and direct them to consult a qualified physician.
- If the user reports chest pain, extreme dizziness, severe joint swelling, or sharp muscular pain, immediately instruct them to stop exercising and consult a medical professional.
- Do NOT prescribe extreme calorie deficits (under 1000 kcal/day) or dangerous weight-loss goals.

MEAL LOG EXAMPLE:
{"reply":"Got it! I've logged your rice. That's a solid 28g of carbs to fuel your day! 🍚🔥","actions":[{"type":"insert","table":"diet_meals","data":{"diet_log_id":"${dietLogId}","name":"Meal","time":"${time}","items":[{"id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","food_id":"","name":"White rice","grams":100,"macros":{"kcal":130,"protein":2.7,"carbs":28,"fat":0.3}}]}}]}

WATER LOG EXAMPLE:
{"reply":"Logged 500ml water","actions":[{"type":"insert","table":"water_logs","data":{"date":"${today}","time":"${today}T${time}Z","amount_ml":500}}]}

TOPIC RESTRICTION RULE:
- You ONLY handle diet, nutrition, meals, calories, and water tracking.
- If the user asks about workouts, weightlifting exercises, training splits, gym schedules, gym routines, cardio, running, or anything other than diet/nutrition/water, you MUST refuse and reply exactly: "Sorry, I'm only here for diet, water, and nutrition tracking." and do NOT return any actions.

WATER LOGGING RULES:
- If the user says they drank water but does NOT specify a quantity/amount (e.g. "I drank water", "water"), you MUST reply: "How much water did you drink?" and do NOT insert a water log action.
- If the user specifies an amount with or without units (e.g. "I drank 290 water" or "I drank 290ml water"), assume the unit is milliliters (ml) and log that amount (e.g. 290ml).

RULES:
- Be an enthusiastic, engaging, and encouraging human-like fitness coach! Use emojis, be warm, and celebrate wins. Do NOT be cold or robotic.
- Use EXACT TODAY_DIET_LOG_ID from context for meals.
- Generate a unique UUID for item id.
- Use your food knowledge. NEVER return 0 for macros unless it's genuinely 0.
- Use diet_meals for caloric foods/drinks.
- For diet_meals, the "time" MUST be exactly formatted as "HH:MM:00" (e.g. "14:30:00"). Do NOT use ISO format.
- For water/hydration, convert to ml and use water_logs (NOT diet_meals).
- actions:[] if no change.`;
};

const WORKOUT_SYSTEM_PROMPT = (clientName: string, uid: string | null, ctx: string) => {
  const today = getLocalDate();
  return `You are ${clientName || 'Client'}'s elite strength and conditioning coach and physiological analyst from Nano Banana Pro. Your name is Alberto. Output ONLY valid JSON. Never plain text.
User ID: ${uid} | Today: ${today}

${ctx}

ALWAYS return ONLY this JSON format:
{"reply":"Your clinical, detailed, tough and constructive coaching feedback here","actions":[]}

SAFETY & COMPLIANCE RULES:
- You are a strength coach and physiological analyst, NOT a medical doctor or physical therapist.
- If the user asks about diagnosing or treating clinical injuries, joint pain, or cardiovascular issues, immediately direct them to see a medical professional or physical therapist.

COACHING PHILOSOPHY & RULES:
- STRICTLY NO cringe, generic, or overly enthusiastic hyping (e.g., do NOT say "Wow, you crushed that!", "Keep it up!", "Great job!", "Crushed it!").
- NEVER use generic emojis (no 🏋️, 👏, 💪, 🔥, 🎉, etc.). Keep the response clean, highly professional, scientific, and clinical.
- Be serious, analytical, and highly knowledgeable. Speak like an elite sports scientist and strength coordinator.
- Analyze the workout data deeply:
  - Check mechanical tension: Assess load (kg), rep ranges, and consistency.
  - Analyze fatigue management: Notice drops in weight or reps between sets. Explain the physiological mechanism (e.g. peripheral muscle fatigue, neural drive decay, or metabolic accumulation).
  - Target progressive overload: Point out whether the load and total work capacity are progressing or regressing.
  - Suggest highly specific, actionable, and scientific adjustments for their next session (e.g., "Keep the load stable and let reps drop naturally to 8, 7, 6 to maximize motor unit recruitment," or "Increase rest intervals between sets to 3 minutes to restore ATP-CP stores and maintain high-threshold mechanical tension.").
- Base all feedback strictly on the provided exercises and sets. If a set has 0kg, treat it as bodyweight, or note it analytically without making assumptions.
- Do NOT invent metrics or make fake claims. Be physiologically precise.`;
};

// ─── Intent detection removed to guarantee context injection ─────────────────

export const useAiAgent = (options?: { storageKey?: string; mode?: 'default' | 'workout' }) => {
  const storageKey = options?.storageKey || 'ai_chat_messages';
  const sessionKey = options?.storageKey ? options.storageKey + '_session' : 'ai_session_id';

  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);
  
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem(sessionKey, newId);
    return newId;
  });
  const navigate = useNavigate();
  const userIdRef = useRef<string | null>(null);
  const clientNameRef = useRef<string>('Client');
  const isCoachRef = useRef<boolean>(false);
  const initialized = useRef(false);

  // ─── Per-minute rate limit: max 3 messages per 60 seconds ─────────────────
  const perMinuteTimestamps = useRef<number[]>([]);
  const PER_MINUTE_LIMIT = 3;
  const PER_MINUTE_WINDOW_MS = 60 * 1000;

  const [quotaLimit, setQuotaLimit] = useState(20);
  const [usageCount, setUsageCount] = useState(0);

  const refreshQuota = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return { limit: 20, count: 0, exceeded: false };

    const { data: profile } = await supabase.from('profiles').select('targets, role').eq('id', uid).maybeSingle();
    if (!profile) return { limit: 20, count: 0, exceeded: false };

    // Coach bypasses AI limit
    if (profile.role === 'coach' || uid === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c') {
      setQuotaLimit(Infinity);
      setUsageCount(0);
      return { limit: Infinity, count: 0, exceeded: false };
    }

    const targets = profile.targets || {};
    const limit = typeof targets.ai_quota_limit === 'number' ? targets.ai_quota_limit : 20;
    const usage = targets.ai_usage || { date: '', count: 0 };
    const todayStr = getLocalDate();

    let count = 0;
    if (usage.date === todayStr) {
      count = usage.count || 0;
    }

    setQuotaLimit(limit);
    setUsageCount(count);
    return { limit, count, exceeded: count >= limit };
  };

  useEffect(() => {
    let channel: any = null;
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      await refreshQuota();

      channel = supabase
        .channel(`quota-profile-${uid}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${uid}`
        }, (payload: any) => {
          const isCoach = payload.new?.role === 'coach' || uid === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
          if (isCoach) {
            setQuotaLimit(Infinity);
            setUsageCount(0);
            return;
          }

          const targets = payload.new?.targets || {};
          const limit = typeof targets.ai_quota_limit === 'number' ? targets.ai_quota_limit : 20;
          const usage = targets.ai_usage || { date: '', count: 0 };
          const todayStr = getLocalDate();
          const count = usage.date === todayStr ? (usage.count || 0) : 0;

          setQuotaLimit(limit);
          setUsageCount(count);
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

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
          
          let error;
          if (schedData) {
            const updatedDays = { ...schedData.days, [dateStr]: newType };
            const { error: updError } = await supabase.from('schedules').update({ days: updatedDays }).eq('id', schedData.id);
            error = updError;
          } else {
            // Calculate week_start for the new row
            const d = new Date(dateStr);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
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
             // Broadcast event to instantly update UI
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
            // Force reload of WorkoutHome by broadcasting an event (or user can refresh)
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

    const selectedDate = localStorage.getItem('athlete_dashboard_selected_date') || getLocalDate();
    parts.push(`SELECTED_DASHBOARD_DATE: ${selectedDate}`);
    parts.push(`REAL_TODAY_DATE: ${getLocalDate()}`);

    // Always load diet (cached)
    const ckey = `diet_${selectedDate}`;
    let log = fromCache(ckey);

    if (!log) {
      const { data: existing } = await supabase
        .from('diet_logs')
        .select('id,daily_totals')
        .eq('user_id', uid)
        .eq('date', selectedDate)
        .maybeSingle();

      if (existing) {
        log = existing;
      } else if (selectedDate === getLocalDate()) {
        const { data: created } = await supabase
          .from('diet_logs')
          .insert({
            user_id: uid,
            date: selectedDate,
            daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
          })
          .select('id,daily_totals')
          .single();
        log = created;
      }
      if (log) toCache(ckey, log);
    }

    if (log) {
      parts.push(`SELECTED_DATE_DIET_LOG_ID: ${log.id}`);
      parts.push(`SELECTED_DATE_TOTALS: ${JSON.stringify(log.daily_totals)}`);
      parts.push(`IMPORTANT: Use diet_log_id="${log.id}" for any diet_meals insert`);
    } else {
      parts.push(`SELECTED_DATE_TOTALS: No meals or calories logged for selected date ${selectedDate}`);
    }

    // Load completed workouts on the selected date
    const { data: selectedDayWorkouts } = await supabase.from('workouts')
      .select('day_type, created_at, title, duration, notes, total_volume, workout_exercises(sets, exercises(name))')
      .eq('user_id', uid)
      .eq('date', selectedDate)
      .eq('status', 'completed');

    if (selectedDayWorkouts && selectedDayWorkouts.length > 0) {
      const daySummary = selectedDayWorkouts
        .map(w => {
          if (w.day_type === 'RUN' || (w.notes && w.notes.includes('"type":"run_stats"'))) {
            try {
              const runStats = JSON.parse(w.notes);
              return `RUN: ${runStats.distance_km}km run in ${Math.round((w.duration || 0) / 60)} mins (Pace: ${runStats.pace}, Elev: ${runStats.elevation_m}m)`;
            } catch (e) {
              return `RUN: completed (${Math.round((w.duration || 0) / 60)} mins)`;
            }
          }
          const exSummary = w.workout_exercises?.map((we: any) => {
            const name = we.exercises?.name;
            const setInfo = we.sets?.map((s: any) => `${s.weight}kg x ${s.reps}`).join(', ') || 'no sets';
            return `${name}: [${setInfo}]`;
          }).join(' | ') || '';
          return `${w.day_type}: ${exSummary} (Volume: ${w.total_volume}kg)`;
        });
      parts.push(`COMPLETED_WORKOUTS_ON_SELECTED_DATE (${selectedDate}): \n${daySummary.join('\n')}`);
    } else {
      parts.push(`COMPLETED_WORKOUTS_ON_SELECTED_DATE (${selectedDate}): No workouts completed on this date.`);
    }

    // Load custom workout plans
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

    // Load recent past workouts for performance tracking context
    const { data: recentWorkouts } = await supabase.from('workouts')
      .select('day_type, created_at, title, duration, notes, total_volume, workout_exercises(sets, exercises(name))')
      .eq('user_id', uid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentWorkouts && recentWorkouts.length > 0) {
      const summary = recentWorkouts
        .filter(w => w.day_type !== 'RUN') // Hide runs from AI completely
        .map(w => {
         const exSummary = w.workout_exercises?.map((we: any) => {
           const name = we.exercises?.name;
           const setInfo = we.sets?.map((s: any) => `${s.weight}kg x ${s.reps}`).join(', ') || 'no sets';
           return `${name}: [${setInfo}]`;
         }).join(' | ') || '';
         return `${w.day_type} on ${new Date(w.created_at).toLocaleDateString()}: ${exSummary}`;
      });
      parts.push(`RECENT_COMPLETED_WORKOUTS (with weights and sets): \n${summary.join('\n')}`);

      // Calculate recent volume trend
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

    return parts.join('\n');
  };

  // ─── Groq call with model fallback chain ──────────────────────────────────
  const callGroq = async (userText: string, context: string): Promise<AiResponse> => {
    const key = getApiKey();
    if (!key) throw new Error('VITE_GROQ_API_KEY not set');

    const systemPromptContent = options?.mode === 'workout'
      ? WORKOUT_SYSTEM_PROMPT(clientNameRef.current, userIdRef.current, context)
      : SYSTEM_PROMPT(clientNameRef.current, userIdRef.current, context);

    const msgs = [
      { role: 'system', content: systemPromptContent },
      { role: 'user', content: userText }
    ];

    console.log("AI CONTEXT DUMP:", context);
    console.log("AI MESSAGES:", msgs);

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

    // Load client name and role
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profile) {
        clientNameRef.current = profile.display_name || 'Client';
        isCoachRef.current = profile.role === 'coach';
      }
    }

    if (!getApiKey()) {
      setMessages([{ id: 'no-key', role: 'model', text: 'Add VITE_GROQ_API_KEY to Vercel environment variables.' }]);
      return;
    }

    setMessages(prev => {
      if (prev.length === 0 && !options?.storageKey) {
        return [{ id: '1', role: 'model', text: `Hey ${clientNameRef.current}! I'm your nutrition coach. What do you need?` }];
      }
      return prev;
    });
  };

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(sessionKey, newId);
    setSessionId(newId);
    setMessages(options?.storageKey ? [] : [{ id: '1', role: 'model', text: "New session started. How can I help?" }]);
  };

  const sendInvisibleMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;
    setIsTyping(true);
    try {
      const context = await loadContext();
      // append the specific workout context to the prompt context directly
      const aiRes = await callGroq(text, context + "\n\nADDITIONAL CONTEXT: " + text);
      const modelMsgId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: aiRes.reply }]);
    } catch (e: any) {
      console.error("AI Coach invisible query error:", e);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: 'The AI Coach is temporarily offline for maintenance. Please check back shortly.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!initialized.current) await initChat();
    if (!getApiKey()) return;

    // ── Per-minute rolling window check (max 3 msgs / 60s) ──────────────────
    const now = Date.now();
    perMinuteTimestamps.current = perMinuteTimestamps.current.filter(
      ts => now - ts < PER_MINUTE_WINDOW_MS
    );
    if (perMinuteTimestamps.current.length >= PER_MINUTE_LIMIT) {
      const oldestTs = perMinuteTimestamps.current[0];
      const waitSec = Math.ceil((PER_MINUTE_WINDOW_MS - (now - oldestTs)) / 1000);
      setMessages(prev => [...prev,
        { id: crypto.randomUUID(), role: 'user', text },
        { id: crypto.randomUUID(), role: 'model',
          text: `⏱️ You're sending messages too fast. Please wait ${waitSec} second${waitSec !== 1 ? 's' : ''} before trying again.` }
      ]);
      return;
    }

    // ── Daily quota check ────────────────────────────────────────────────────
    const { limit, count, exceeded } = await refreshQuota();
    if (exceeded) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'user',
        text
      }, {
        id: crypto.randomUUID(),
        role: 'model',
        text: `⚡ Daily limit reached (${limit}/${limit} messages). Please ask your coach to increase your daily AI limit!`
      }]);
      return;
    }

    // Record this message timestamp BEFORE the API call
    perMinuteTimestamps.current.push(now);

    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    setIsTyping(true);

    try {
      const context = await loadContext();
      const aiRes = await callGroq(text, context);
      let aiText = aiRes.reply;

      let draftMealData: any = null;
      let actionsToExecute = aiRes.actions || [];

      // Intercept diet_meals insertions
      if (actionsToExecute.length > 0) {
        actionsToExecute = actionsToExecute.filter(a => {
          if (a.type === 'insert' && a.table === 'diet_meals') {
            draftMealData = a.data;
            return false; // Remove from execution
          }
          return true;
        });
      }

      // Handle DB Actions — show role-appropriate status messages
      if (actionsToExecute.length > 0) {
        const { success, errorMsg } = await executeActions(actionsToExecute);
        if (success) {
          // Coaches see full DB success message; clients see a clean tick
          aiText += isCoachRef.current
            ? "\n\n*(✓ Successfully saved to database)*"
            : "\n\n*(✓ Saved successfully)*";
        } else {
          // Coaches see the raw error; clients see a friendly message
          aiText += isCoachRef.current
            ? `\n\n*(⚠ Failed to save to database. Error: ${errorMsg || 'Please try again'})*`
            : "\n\n*(⚠ Error while saving. Please try again)*";
        }
      }

      const modelMsgId = crypto.randomUUID();
      const modelMsg: AiMessage = { 
        id: modelMsgId, 
        role: 'model', 
        text: aiText,
        ...(draftMealData ? { draftMeal: draftMealData } : {})
      };
      setMessages(prev => [...prev, modelMsg]);

      // Successfully sent! Now increment DB counter
      const todayStr = getLocalDate();
      const newCount = count + 1;
      setUsageCount(newCount);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isCoach = isCoachRef.current || session.user.id === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
        if (!isCoach) {
          const { data: profile } = await supabase.from('profiles').select('targets').eq('id', session.user.id).maybeSingle();
          if (profile) {
            const updatedTargets = {
              ...(profile.targets || {}),
              ai_usage: { date: todayStr, count: newCount }
            };
            await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', session.user.id);
          }
        }
      }

    } catch (e: any) {
      console.error("AI Coach query error:", e);
      const isRate = e.message === 'RATE_LIMIT_ALL' || e.message === 'RATE_LIMIT';
      const isQuotaOrKeyError = e.message?.includes('API_KEY') || e.message?.includes('key') || e.message?.includes('quota') || e.message?.includes('401') || e.message?.includes('403') || e.message?.includes('429');
      
      let userFacingText = 'The AI Coach is temporarily offline for maintenance. Please check back shortly!';
      if (isRate) {
        userFacingText = '⏱️ The AI is busy right now. Please wait a moment and try again.';
      } else if (isQuotaOrKeyError) {
        userFacingText = '🤖 The AI Coach has reached its daily training capacity. Please try again shortly or notify your coach!';
      }
      
      if (isCoachRef.current) {
        userFacingText = `🤖 AI Coach Status: Offline. (Reason: ${isRate ? 'Rate Limit' : (isQuotaOrKeyError ? 'API Quota Exceeded' : 'Service Connection Issue')})`;
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: userFacingText
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateMessage = (id: string, updates: Partial<AiMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  return {
    messages,
    isTyping,
    sendMessage,
    sendInvisibleMessage,
    updateMessage,
    startNewChat,
    initChat,
    sessionId,
    quotaLimit,
    usageCount
  };
};
