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
  actions?: DbAction[];
  actionStatus?: 'pending' | 'accepted' | 'rejected' | 'editing';
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

// ─── System prompt — explicit examples with correct schema ───────────────────
const SYSTEM_PROMPT = (uid: string | null, ctx: string) => {
  const today = getLocalDate();
  const time = getLocalTime();
  const dietLogMatch = ctx.match(/(?:TODAY|SELECTED_DATE)_DIET_LOG_ID:\s*([a-f0-9-]+)/i);
  const dietLogId = dietLogMatch ? dietLogMatch[1] : "INSERT_DIET_LOG_ID_HERE";

  return `You are Haleem's elite personal fitness AI coach. Output ONLY valid JSON. Never plain text.

=== ATHLETE PROFILE ===
Name: Haleem | Age: 18 | Height: 182cm | Weight: 79.7kg | Body Fat: 17%
Daily Targets: Protein 160g | Carbs 240g | Fat 70g | Calories 2400kcal

User ID: ${uid} | Real today: ${today} | Current time: ${time}

${ctx}

=== OUTPUT FORMAT (ALWAYS return exactly this structure) ===
{"reply":"Your warm, engaging coach response here with emojis","actions":[]}

=== MEAL INSERT EXAMPLE (use for ANY meal suggestion or food log) ===
{"reply":"Here's your optimized meal! 🔥 It's perfectly calibrated to hit your remaining macros for the day.","actions":[{"type":"insert","table":"diet_meals","data":{"diet_log_id":"${dietLogId}","name":"Pre-Workout Meal","time":"${time}","items":[{"id":"GENERATE-UNIQUE-UUID-HERE","food_id":"","name":"Chicken breast","grams":200,"macros":{"kcal":220,"protein":41,"carbs":0,"fat":4.8}},{"id":"GENERATE-UNIQUE-UUID-2","food_id":"","name":"White rice","grams":150,"macros":{"kcal":195,"protein":4,"carbs":43,"fat":0.5}},{"id":"GENERATE-UNIQUE-UUID-3","food_id":"","name":"Olive oil","grams":10,"macros":{"kcal":88,"protein":0,"carbs":0,"fat":10}}]}}]}

=== WATER LOG EXAMPLE ===
{"reply":"Hydration logged! 💧","actions":[{"type":"insert","table":"water_logs","data":{"date":"${today}","time":"${today}T${time}Z","amount_ml":500}}]}

=== RULES ===
INTELLIGENCE:
- You have FULL access to the athlete's diet log, sleep, workouts, biometrics and schedule in the CONTEXT above. USE IT.
- When suggesting meals: First look at SELECTED_DATE_DIET_SUMMARY to see what macros remain. Suggest meals that fill the GAP.
- Always name real, specific foods (e.g. "Chicken breast", "Brown rice", "Eggs", "Cottage cheese", "Banana"). Never vague names.
- Each meal should have 3-6 specific food items with ACCURATE grams and macros from your food knowledge.
- When meal suggestions are given, ALWAYS include the actions insert — the user will confirm or dismiss via a UI card.
- Never say "I've saved your meal" — the user must tap "Save to Diet" on the card first.

BEHAVIOR:
- Be enthusiastic, warm, human! Use emojis. Celebrate PRs and good days. Be empathetic on bad days.
- You do NOT analyze running. If asked about runs: "I don't track running data — I focus on your lifting and nutrition! 💪"
- Base all workout feedback ONLY on RECENT_COMPLETED_WORKOUTS data. Never invent numbers.
- If user asks to LOG a workout or CHANGE their plan/schedule, refuse: "Use the app interface for that — I can't modify your workout logs!"
- Use the EXACT SELECTED_DATE_DIET_LOG_ID from context for all meal inserts.
- Generate a UNIQUE random UUID (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx) for every item "id" field.
- NEVER return 0 for macros unless genuinely 0. Use your food knowledge.
- For diet_meals "time": MUST be "HH:MM:00" format (e.g. "14:30:00"). NOT ISO format.
- For water/hydration: use water_logs table.
- actions:[] when no database change needed.`;
};

// ─── Intent detection removed to guarantee context injection ─────────────────

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

    const selectedDate = localStorage.getItem('athlete_dashboard_selected_date') || getLocalDate();
    parts.push(`SELECTED_DASHBOARD_DATE: ${selectedDate}`);
    parts.push(`REAL_TODAY_DATE: ${getLocalDate()}`);

    // ── Schedule ─────────────────────────────────────────────────────────────
    let sched = fromCache('sched');
    if (!sched) {
      const { data } = await supabase.from('schedules').select('id,week_start,days').eq('user_id', uid).order('week_start', { ascending: false }).limit(1).maybeSingle();
      sched = data;
      if (sched) toCache('sched', sched);
    }
    if (sched) parts.push(`WEEKLY_SCHEDULE: ${JSON.stringify(sched.days)}`);

    // ── InBody / Body Composition ─────────────────────────────────────────────
    const { data: inbodyScans } = await supabase
      .from('inbody_scans')
      .select('*')
      .eq('user_id', uid)
      .order('scan_date', { ascending: false })
      .limit(3);
    if (inbodyScans && inbodyScans.length > 0) {
      const latest = inbodyScans[0];
      parts.push(`LATEST_INBODY_SCAN (${latest.scan_date}): Weight=${latest.weight}kg | Muscle=${latest.skeletal_muscle_mass}kg | BF=${latest.body_fat_percentage}% | BFMass=${latest.body_fat_mass}kg | BMI=${latest.bmi} | SMM%=${latest.smm_percentage} | VisceralFat=${latest.visceral_fat_level}`);
      if (inbodyScans.length > 1) {
        const prev = inbodyScans[1];
        const wDiff = (latest.weight - prev.weight).toFixed(1);
        const mDiff = ((latest.skeletal_muscle_mass || 0) - (prev.skeletal_muscle_mass || 0)).toFixed(2);
        const fDiff = ((latest.body_fat_percentage || 0) - (prev.body_fat_percentage || 0)).toFixed(1);
        parts.push(`BODY_COMPOSITION_TREND: Weight ${wDiff > '0' ? '+' : ''}${wDiff}kg | Muscle ${mDiff > '0' ? '+' : ''}${mDiff}kg | BF% ${fDiff > '0' ? '+' : ''}${fDiff}% (since ${prev.scan_date})`);
      }
    }

    // ── Sleep logs ────────────────────────────────────────────────────────────
    const { data: sleepLogs } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(7);
    if (sleepLogs && sleepLogs.length > 0) {
      const sleepSummary = sleepLogs.map(s =>
        `${s.date}: ${s.hours_slept}hrs | Quality: ${s.quality || 'N/A'} | Bedtime: ${s.bedtime || 'N/A'} | Wake: ${s.wake_time || 'N/A'} | Deep: ${s.deep_sleep_pct || 0}% | REM: ${s.rem_sleep_pct || 0}% | Light: ${s.light_sleep_pct || 0}%`
      );
      parts.push(`SLEEP_HISTORY (last 7 days):\n${sleepSummary.join('\n')}`);
      const avgSleep = sleepLogs.reduce((s, l) => s + (l.hours_slept || 0), 0) / sleepLogs.length;
      parts.push(`AVG_SLEEP_LAST_7_DAYS: ${avgSleep.toFixed(1)} hours`);
    }

    // ── Biometric logs (HRV, RHR, readiness) ─────────────────────────────────
    const { data: bioLogs } = await supabase
      .from('biometric_logs')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(7);
    if (bioLogs && bioLogs.length > 0) {
      const bioSummary = bioLogs.map(b =>
        `${b.date}: HRV=${b.hrv ?? 'N/A'}ms | RHR=${b.resting_heart_rate ?? 'N/A'}bpm | Readiness=${b.readiness_score ?? 'N/A'}/100`
      );
      parts.push(`BIOMETRICS_HISTORY (last 7 days):\n${bioSummary.join('\n')}`);
      const latest = bioLogs[0];
      if (latest.readiness_score) parts.push(`TODAY_READINESS_SCORE: ${latest.readiness_score}/100 — HRV: ${latest.hrv}ms | RHR: ${latest.resting_heart_rate}bpm`);
    }

    // ── Diet log for selected date (ID + totals + full meals) ─────────────────
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
          .insert({ user_id: uid, date: selectedDate, daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false } })
          .select('id,daily_totals')
          .single();
        log = created;
      }
      if (log) toCache(ckey, log);
    }

    if (log) {
      parts.push(`SELECTED_DATE_DIET_LOG_ID: ${log.id}`);
      const t = log.daily_totals || {};
      const remainP = Math.max(0, 160 - (t.protein || 0));
      const remainC = Math.max(0, 240 - (t.carbs || 0));
      const remainF = Math.max(0, 70 - (t.fat || 0));
      const remainKcal = Math.max(0, 2400 - (t.kcal || 0));
      parts.push(`SELECTED_DATE_DIET_TOTALS: ${t.kcal || 0}kcal / ${t.protein || 0}g P / ${t.carbs || 0}g C / ${t.fat || 0}g F | Water: ${(t.water || 0) / 1000}L`);
      parts.push(`REMAINING_MACROS_TODAY: ${remainKcal}kcal | Protein: ${remainP}g | Carbs: ${remainC}g | Fat: ${remainF}g`);
      parts.push(`IMPORTANT: Use diet_log_id="${log.id}" for any diet_meals insert`);

      // Load full meals with all food items
      const { data: meals } = await supabase
        .from('diet_meals')
        .select('name, time, items')
        .eq('diet_log_id', log.id)
        .order('time', { ascending: true });
      if (meals && meals.length > 0) {
        const mealStr = meals.map(m => {
          const items = (m.items || []).map((it: any) =>
            `  - ${it.name} (${it.grams}g): ${it.macros?.kcal || 0}kcal P:${it.macros?.protein || 0}g C:${it.macros?.carbs || 0}g F:${it.macros?.fat || 0}g`
          ).join('\n');
          return `${m.time} — ${m.name}:\n${items}`;
        });
        parts.push(`MEALS_LOGGED_TODAY:\n${mealStr.join('\n\n')}`);
      } else {
        parts.push(`MEALS_LOGGED_TODAY: No meals logged yet for ${selectedDate}`);
      }
    } else {
      parts.push(`SELECTED_DATE_DIET_LOG_ID: none`);
      parts.push(`REMAINING_MACROS_TODAY: Full day remaining — 2400kcal | 160g P | 240g C | 70g F`);
    }

    // ── Workouts on selected date ─────────────────────────────────────────────
    const { data: selectedDayWorkouts } = await supabase.from('workouts')
      .select('day_type, created_at, title, duration, notes, total_volume, workout_exercises(sets, exercises(name))')
      .eq('user_id', uid)
      .eq('date', selectedDate)
      .eq('status', 'completed');
    if (selectedDayWorkouts && selectedDayWorkouts.length > 0) {
      const daySummary = selectedDayWorkouts.map(w => {
        if (w.day_type === 'RUN' || (w.notes && w.notes.includes('"type":"run_stats"'))) return null;
        const exSummary = w.workout_exercises?.map((we: any) => {
          const name = we.exercises?.name;
          const setInfo = we.sets?.map((s: any) => `${s.weight}kg x ${s.reps}`).join(', ') || 'no sets';
          return `  - ${name}: [${setInfo}]`;
        }).join('\n') || '';
        return `${w.day_type} (${Math.round((w.duration || 0) / 60)} min, ${w.total_volume}kg volume):\n${exSummary}`;
      }).filter(Boolean);
      parts.push(`COMPLETED_WORKOUTS_ON_SELECTED_DATE (${selectedDate}):\n${daySummary.join('\n\n')}`);
    } else {
      parts.push(`COMPLETED_WORKOUTS_ON_SELECTED_DATE (${selectedDate}): No gym session completed.`);
    }

    // ── Current workout plans ─────────────────────────────────────────────────
    const { data: customPlans } = await supabase.from('user_workout_plans').select('plan_type, exercises').eq('user_id', uid);
    const defaultPlans: Record<string, string[]> = {
      PUSH: ['Incline DB Press', 'Machine Chest Press', 'Lateral Raises', 'Overhead Cable Extension (rope)', 'DB Lateral Raise (elbow-lead)'],
      PULL: ['Lat Pulldown (wide grip)', 'Chest-Supported DB Row', 'Sideways One-Arm Rear Delt Fly', 'Face Pull (rope eye height)', 'Incline DB Curl - Bayesian', 'Zottman Curl'],
      LEGS: ['Leg Press (feet high for glutes)', 'DB Romanian Deadlift', 'DB Bulgarian Split Squat', 'Seated Leg Curl', '45° Back Extension (BW/DB)', 'Standing Calf Raise']
    };
    const currentPlans = { ...defaultPlans };
    if (customPlans) {
      customPlans.forEach(p => { if (p.exercises?.length > 0) currentPlans[p.plan_type] = p.exercises; });
    }
    parts.push(`CURRENT_WORKOUT_PLANS: ${JSON.stringify(currentPlans)}`);

    // ── Recent 10 past gym sessions (full sets + weights) ─────────────────────
    const { data: recentWorkouts } = await supabase.from('workouts')
      .select('day_type, created_at, date, duration, total_volume, workout_exercises(sets, exercises(name))')
      .eq('user_id', uid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);
    if (recentWorkouts && recentWorkouts.length > 0) {
      const gymSessions = recentWorkouts.filter(w => w.day_type !== 'RUN');
      if (gymSessions.length > 0) {
        const summary = gymSessions.map(w => {
          const exSummary = w.workout_exercises?.map((we: any) => {
            const name = we.exercises?.name;
            const setInfo = we.sets?.map((s: any) => `${s.weight}kg×${s.reps}`).join(', ') || 'no sets';
            return `  - ${name}: [${setInfo}]`;
          }).join('\n') || '';
          return `${w.day_type} on ${w.date || new Date(w.created_at).toLocaleDateString()} (${w.total_volume}kg total):\n${exSummary}`;
        });
        parts.push(`RECENT_GYM_SESSIONS (last ${gymSessions.length}, with all sets/weights):\n${summary.join('\n\n')}`);

        // Volume trend
        const vols = gymSessions.filter(w => w.total_volume > 0);
        if (vols.length >= 2) {
          const diff = vols[0].total_volume - vols[1].total_volume;
          if (diff !== 0) parts.push(`VOLUME_TREND: ${diff > 0 ? `+${diff}kg MORE` : `${diff}kg LESS`} in last session vs previous (${vols[0].total_volume}kg vs ${vols[1].total_volume}kg)`);
        }
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
            max_tokens: 1024,
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

    // Since we initialize from localStorage, we just ensure there's at least one message
    setMessages(prev => {
      if (prev.length === 0) {
        return [{ id: '1', role: 'model', text: "Coach connected. What do you need?" }];
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

  const updateMessageStatus = (
    msgId: string, 
    status: 'accepted' | 'rejected' | 'editing', 
    updatedActions?: DbAction[]
  ) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { 
          ...m, 
          actionStatus: status, 
          actions: updatedActions !== undefined ? updatedActions : m.actions 
        };
      }
      return m;
    }));
  };

  // ─── Send ──────────────────────────────────────────────────────────────────
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

      // Filter actions
      const instantActions = aiRes.actions?.filter(a => a.type === 'navigate') || [];
      const pendingDbActions = aiRes.actions?.filter(a => a.type !== 'navigate') || [];

      // Run navigation action instantly if returned
      if (instantActions.length > 0) {
        await executeActions(instantActions);
      }

      const modelMsgId = crypto.randomUUID();
      const modelMsg: AiMessage = { 
        id: modelMsgId, 
        role: 'model', 
        text: aiText,
        actions: pendingDbActions.length > 0 ? pendingDbActions : undefined,
        actionStatus: pendingDbActions.length > 0 ? 'pending' : undefined
      };
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
    sessionId,
    executeActions,
    updateMessageStatus,
    setMessages
  };
};
