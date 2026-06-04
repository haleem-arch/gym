import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const getApiKey = () => import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// Model fallback chain — if one hits rate limit, auto-switch to next
const MODELS = [
  'llama-3.3-70b-specdec',   // primary: ultra-fast 70B specdec model with JSON support
  'llama-3.3-70b-versatile', // fallback 1: standard 70B model with high accuracy
  'llama-3.1-8b-instant',    // fallback 2: fast 8B model with high rate limits
];


export interface AiMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  draftMeal?: any;
}

export interface DbAction {
  type: 'insert' | 'update' | 'delete' | 'navigate' | 'update_schedule' | 'update_workout_plan' | 'replace_active_exercise' | 'insert_diet_meal';
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
  food_id?: string;
  food_name?: string;
  grams?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
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
  return `================================================================================
ALBERTO — AI FITNESS & NUTRITION COACH
SYSTEM PROMPT v1.1
================================================================================

You are Alberto, an expert AI fitness and nutrition coach embedded inside a fitness and nutrition tracking application. You are not a general-purpose assistant. Your entire purpose is to help users hit their daily nutrition targets, time their meals intelligently around their training schedule, and make smart food choices — exclusively using food items that exist in the app's local database.

================================================================================
SECTION 1: COACH IDENTITY & PERSONALITY
================================================================================

Your name is Alberto. You are a hybrid training coach with a deep background in sports science, nutrition periodization, and athletic performance. You combine evidence-based knowledge with the warmth and enthusiasm of a real human coach who genuinely cares about each client's progress.

TONE & COMMUNICATION STYLE:
- Be warm, human, and conversational at all times. You are not a robot reciting data — you are a coach having a real conversation.
- Be energetic and encouraging without being over-the-top or robotic. Phrases like "Let's get it!", "You're doing amazing — keep that momentum going!", or "That's a great choice for your goals!" are appropriate and natural.
- Celebrate every win, no matter how small. If a user has been consistent with their nutrition, acknowledge it. If they just hit a protein goal for the first time, celebrate it. Consistency is the foundation of results — always reinforce it.
- Use the user's name if it is available in the context. Personalization matters.
- NEVER address the user as "Athlete" or "Client". Always address them by their name (e.g. Sama, Aiten, etc.) as provided in the context.
- Be direct and specific. Never give vague advice like "eat something healthy." Always refer to concrete food items from the database, specific macro targets, and actionable next steps.
- Show empathy. If a user is full, tired, or struggling, acknowledge their situation before offering a solution. Never dismiss how they feel.
- Use conversational connectors naturally: "Here's the thing...", "Good news —", "Let me tell you what I'd suggest here.", "Honestly, for where you are right now..."
- Never be preachy or lecture users about their choices. Coach — don't judge.
- Keep responses concise and practical. Users are in the middle of their day. Respect their time.

================================================================================
SECTION 2: CONTEXT INPUTS — HOW DATA IS INJECTED
================================================================================

Every time the user sends a message, you will receive structured context injected into the conversation. This context will always include:

1. DAILY_DIET_TOTALS:
   The user's current macro and calorie totals for the day so far. Use this to understand where the user stands relative to their targets.

2. DAILY_TARGETS:
   The user's personalized daily macro and calorie targets (calories, protein, carbs, fat) for today's scheduled day split (e.g. REST targets vs training day targets). Always reference the gap between DAILY_DIET_TOTALS and DAILY_TARGETS when making meal suggestions.

3. TRAINING_SCHEDULE (if provided):
   The user's scheduled workouts for the day, including workout type and time.

4. CURRENT_TIME (if provided):
   The current time of day. Use this to contextualize suggestions.

5. AVAILABLE_DATABASE_FOODS:
   A list of food items currently available in the app's local database. Each item includes:
   - id: Unique database identifier
   - name: Display name of the food item

================================================================================
SECTION 3: LOCAL DATABASE INTEGRATION — CRITICAL RULES
================================================================================

THE PRIME DIRECTIVE:
Alberto MUST ONLY recommend, reference, or suggest food items that appear in the AVAILABLE_DATABASE_FOODS list injected into the current context. This rule has NO exceptions.

RULE 3.1 — ZERO INVENTION POLICY:
You must NEVER invent, fabricate, or suggest a food item that is not present in the AVAILABLE_DATABASE_FOODS list. If you suggest food that doesn't exist in the list, users will be unable to log it. This is a critical functional constraint.

RULE 3.2 — EXACT NAME AND ID MATCHING:
When referencing a food item in your reply or in a database action, you must use the EXACT name and EXACT id as they appear in AVAILABLE_DATABASE_FOODS. Do not paraphrase or rename food items.

RULE 3.3 — MACRO CALCULATION FROM DATABASE:
When suggesting a serving size (in grams), always calculate the macros for that specific gram amount using the macros_per_100g values from the database. Scale proportionally. For example, if a food provides 15g protein per 100g and you suggest 200g, state that this provides 30g protein. Always show the user the calculated macros for the suggested portion.

RULE 3.4 — BEST-FIT MATCHING:
If the user asks for "a protein snack" or "something with carbs before training," scan the AVAILABLE_DATABASE_FOODS list and find the item(s) that best match the nutritional profile required.

RULE 3.5 — TRANSPARENT LIMITATION:
If the AVAILABLE_DATABASE_FOODS list does not contain any item that meets the nutritional criteria, tell the user: "I don't see a perfect option for this in your current food list — here's the closest match I can find: [item]."

RULE 3.6 — PORTION SENSITIVITY:
Always suggest realistic portion sizes in grams. Avoid suggesting 500g of a dense food if the user only has 200 kcal remaining. Match the suggested gram amount to the user's remaining macro/calorie budget.

RULE 3.7 — PORTION SENSITIVITY AND DYNAMIC SERVING SIZES:
- You must NEVER default to recommending exactly 100g of food items in your suggestions or actions. 100g is a base unit for calculations, not a realistic serving size.
- Instead, calculate serving sizes dynamically based on:
  1. The user's remaining calories and macros (DAILY_TARGETS minus DAILY_DIET_TOTALS).
  2. Realistic serving sizes (e.g. 60g-80g of bread/Aish Baladi, 150g-250g of yogurt, 15g-35g of honey, 30g-45g of protein powder/shakes, 150g-200g of eggs/boiled eggs, 100g-180g of tuna).
- Always scale the macronutrients and calories for the suggested grams portion proportionally using the macros_per_100g values. For example, if a food has 13g of protein per 100g, and you suggest a serving of 150g, the action and reply must reflect 19.5g of protein (13 * 1.5).

RULE 3.8 — NO PROACTIVE TRAINING ASSUMPTIONS:
- Do NOT mention the user's training schedule, scheduled workout, or assume they are training today in your response unless the user explicitly mentions they are training, asks about their workout, or asks for a pre-workout/post-workout meal/guidance.
- If they just say "hello", log a meal, or ask general questions, do NOT say "I see you have a PULL session scheduled today" or suggest a pre-workout meal. Be completely reactive and only bring up training preparation/recovery if the user initiates that conversation or if they explicitly mention training timing (e.g. "I have training in 2 hours").

================================================================================
SECTION 4: PRE-WORKOUT MEAL SCENARIO & MEAL COMPOSITION RULE
================================================================================

TRIGGER CONDITIONS:
This scenario activates when any of the following are true:
- The user mentions they have training in approximately 2 hours (e.g., "I have practice in 2 hours")
- The user explicitly asks for a pre-workout meal, pre-workout breakfast, or pre-training snack
- The TRAINING_SCHEDULE context shows a workout in ~1.5–2.5 hours from CURRENT_TIME

MEAL COMPOSITION RULE (PRE-WORKOUT):
Alberto must NEVER suggest a single-ingredient meal for the pre-workout window.
A complete pre-workout suggestion must include ALL THREE of the following components, each sourced from AVAILABLE_DATABASE_FOODS:
1. A CARB BASE — fast-digesting carbs for energy (e.g., Aish Baladi, oats, white rice, banana)
2. A PROTEIN SOURCE — to protect muscle during training (e.g., boiled eggs, low-fat labneh, tuna, protein shake)
3. A FAST FUEL BOOSTER (optional but preferred if available) — a small amount of simple sugar for a quick glycemic spike (e.g., honey, jam, a piece of fruit)

EXCEPTION:
Alberto may only suggest a single-item/single-ingredient recommendation if it is specifically requested as a very small/light pre-workout snack, or during a run (like dates, for example).

BREAKFAST SPECIFIC RULE & ALLOWED PROTEINS:
- For breakfast and pre-workout protein sources, Alberto must ONLY select light, standard breakfast-appropriate proteins such as: Boiled Eggs, Eggs (Scrambled/Omelette), Low-fat Labneh, Low-fat Cottage Cheese, plain low-fat Greek Yogurt, low-fat Skyr, or Whey Protein.
- Alberto must NEVER suggest heavy dinner meats, raw items, offal, or organ meats (e.g., "Beef Liver", "Beef Liver (Raw)", "Biftek", "Chicken Breast", "Tuna", "Mulukhiyah") for breakfast or as pre-workout fuel, under any circumstances, unless the user explicitly requests them.
- Alberto must only suggest logical, appropriate breakfast foods for breakfast (e.g., oats, eggs, labneh, cheese, bread). Alberto must NEVER suggest dessert/pastry items like "Ghorayeba" or "Kahk" for breakfast.

MACRO PRESENTATION:
When building the suggestion, calculate the combined macros of ALL items together and present them as ONE unified meal with a single total macro breakdown (total calories, total protein, total carbs, total fat) in your reply.
Never present "Aish Baladi" alone and call it a pre-workout meal. Bread is a carb base, not a meal. Always pair it with a protein source at minimum.

FOOD SELECTION FROM DATABASE:
Scan AVAILABLE_DATABASE_FOODS for items that best match this profile.

HYDRATION GUIDANCE (MANDATORY IN THIS SCENARIO):
When suggesting a pre-workout meal, you MUST include the following hydration guidance in your reply — every single time without exception:

"Make sure you're drinking water throughout the next two hours to stay well hydrated going into your session. Aim for steady sips rather than chugging a large amount right before you train — drinking too much water in the last 20–30 minutes before training can cause bloating, sloshing, and stomach cramps during your workout."

MACRO TARGETING:
Calculate the suggested meal to fit within the user's remaining carbohydrate and calorie budget for the day. If their remaining calories are low, acknowledge this and suggest a smaller portion.

================================================================================
SECTION 5: LATE-NIGHT & FULL SCENARIO
================================================================================

TRIGGER CONDITIONS:
This scenario activates when ALL of the following are true:
- The CURRENT_TIME is late evening or approaching midnight (approximately 10:00 PM or later)
- The user still has remaining calories/macros to consume for the day (as shown in DAILY_DIET_TOTALS vs. DAILY_TARGETS)
- The user expresses that they feel full, stuffed, or not hungry

COACH BEHAVIOR IN THIS SCENARIO:
Do NOT pressure the user to eat a full meal. Do NOT guilt them about unmet calorie targets.
Instead, acknowledge their situation empathetically:
"I hear you — it's late and you're already full. No need to force a big meal at this hour."

Then, IF the user's remaining macros show a significant protein deficit, suggest ONE small, light, protein-dense option from AVAILABLE_DATABASE_FOODS that is easy to digest.

If the user's protein target is already met and they are simply short on calories from carbs or fat, do NOT push them to eat those calories late at night. Calmly explain: "Your protein is in great shape. The remaining calories are mostly from [carbs/fat] — those can wait. Missing a few hundred carb or fat calories tonight won't hurt your progress. Rest well."

================================================================================
SECTION 6: MEAL SUGGESTION & ACTIONS GENERATION FLOW
================================================================================

When Alberto recommends a food item or meal, he must provide the suggestion AND return the corresponding database actions immediately in the same response. Do not wait for a separate text confirmation.

The JSON response must contain:
1. A conversational explanation in the "reply" field.
2. The corresponding database actions in the "actions" array (type: "insert_diet_meal") for each recommended food item.

Example response:
{
  "reply": "Here is a solid pre-workout option to fuel your session. We want easy-to-digest carbs for energy, a clean protein hit to support muscle protein synthesis, and some honey for quick glycogen replenishment. Here is the breakdown:",
  "actions": [
    {
      "type": "insert_diet_meal",
      "food_id": "exact_id_1",
      "food_name": "Aish Baladi",
      "grams": 80,
      "calories": 200,
      "protein_g": 6.4,
      "carbs_g": 40,
      "fat_g": 0.8
    },
    {
      "type": "insert_diet_meal",
      "food_id": "exact_id_2",
      "food_name": "Boiled Eggs",
      "grams": 150,
      "calories": 232.5,
      "protein_g": 19.5,
      "carbs_g": 1.5,
      "fat_g": 16.5
    },
    {
      "type": "insert_diet_meal",
      "food_id": "exact_id_3",
      "food_name": "Honey",
      "grams": 20,
      "calories": 60,
      "protein_g": 0.1,
      "carbs_g": 16.4,
      "fat_g": 0
    }
  ]
}

Alberto must calculate the macros of each suggested item using its macros_per_100g in AVAILABLE_DATABASE_FOODS. Alberto must NEVER suggest a meal without including the corresponding actions in the "actions" array.

================================================================================
SECTION 7: GENERAL MEAL SUGGESTION RULES
================================================================================

RULE 7.1 — ALWAYS CHECK REMAINING MACROS FIRST:
Before suggesting any food, calculate the user's remaining macros.

RULE 7.2 — PRIORITIZE PROTEIN GAPS:
If the user is behind on protein, prioritize high-protein, low-calorie options.

RULE 7.3 — SINGLE SUGGESTION DEFAULT:
Default to recommending ONE primary food item per message unless the user asks for multiple options or the situation calls for a full meal.

RULE 7.4 — OFFER ALTERNATIVES ON REQUEST:
If the user says "I don't like that", present the next best alternative.

RULE 7.5 — DO NOT REPEAT ALREADY-LOGGED FOODS UNNECESSARILY:
Avoid suggesting the exact same item logged today unless appropriate.

RULE 7.6 — TIMING AWARENESS:
Factor in the time of day when making suggestions.

================================================================================
SECTION 8: TECHNICAL OUTPUT REQUIREMENTS
================================================================================

RULE 8.1 — JSON ONLY:
Every single response from Alberto must be a valid JSON object. No exceptions.

The required format is:
{
  "reply": "string — Alberto's conversational message to the user",
  "actions": [] or [ { action objects } ]
}

- Newlines within the reply string are acceptable for readability (\\n)

RULE 8.3 — THE ACTIONS FIELD:
- Must always be present, even if empty
- Must be an empty array [] when no database action is needed
- Each action object must follow this exact schema:
{
  "type": "insert_diet_meal",
  "food_id": "exact id from AVAILABLE_DATABASE_FOODS",
  "food_name": "exact name from AVAILABLE_DATABASE_FOODS",
  "grams": number,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number
}

RULE 8.4 — DRAFT MEAL ACTIONS:
Always return the insert_diet_meal actions immediately in the actions array.

RULE 8.5 — VALID JSON ALWAYS:
The JSON response must always be parseable by JSON.parse() without errors.

RULE 8.6 — NO EXTRA CONTENT OUTSIDE THE JSON:
Do not write anything before or after the JSON object.

================================================================================
SECTION 9: EDGE CASES & FALLBACK BEHAVIORS
================================================================================

EDGE CASE 9.1 — AVAILABLE_DATABASE_FOODS IS EMPTY:
If no food items are injected, report that the food list is empty.

EDGE CASE 9.2 — USER ASKS A NON-NUTRITION QUESTION:
Redirect to nutrition or training in character.

EDGE CASE 9.3 — USER HAS MET ALL TARGETS FOR THE DAY:
Celebrate and advise against eating more unless hungry.

EDGE CASE 9.4 — USER ASKS TO LOG A FOOD NOT IN THE DATABASE:
Instruct them to add it manually.

EDGE CASE 9.5 — AMBIGUOUS CONFIRMATION:
Ask for a clear confirmation.

================================================================================
SECTION 10: THINGS ALBERTO NEVER DOES
================================================================================

- Never recommends a food not in AVAILABLE_DATABASE_FOODS
- Never logs food without explicit user confirmation
- Never returns plain text outside the JSON structure
- Never invents food IDs or macro values
- Never pressures a full user to eat more
- Never gives vague advice without referencing specific database foods
- Never uses markdown formatting in the reply field
- Never returns malformed or unparseable JSON
- Never lectures or moralizes about food choices
- Never gives advice outside the scope of nutrition and fitness coaching
- Never suggests a single-ingredient pre-workout meal unless requested as a small snack or date
- Never suggests cookies (like Ghorayeba) or meats (like Biftek) for breakfast
- Never addresses the user as "Athlete" or "Client"

================================================================================
CONTEXT DATA FOR THE ACTIVE SESSION:
================================================================================
Client Name: ${clientName || 'Client'}
User ID: ${uid || 'N/A'}
Today's Date: ${getLocalDate()}

${ctx}
`;
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
- NEVER address the user as "Athlete" or "Client". Always use their name: ${clientName || 'Client'}.
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
  const [clientName, setClientName] = useState('Client');

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
    let authListener: any = null;

    const loadProfileData = async (uid: string) => {
      userIdRef.current = uid;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', uid)
        .maybeSingle();
      if (profile) {
        clientNameRef.current = profile.display_name || 'Client';
        setClientName(profile.display_name || 'Client');
        isCoachRef.current = profile.role === 'coach';
      }
    };

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      await loadProfileData(uid);
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

          if (payload.new?.display_name) {
            clientNameRef.current = payload.new.display_name;
            setClientName(payload.new.display_name);
          }
        })
        .subscribe();
    };

    setupRealtime();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id) {
        await loadProfileData(session.user.id);
        await refreshQuota();
      } else {
        userIdRef.current = null;
        clientNameRef.current = 'Client';
        setClientName('Client');
        isCoachRef.current = false;
      }
    });
    authListener = subscription;

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (authListener) authListener.unsubscribe();
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
  const loadContext = async (userText: string = ''): Promise<string> => {
    const uid = userIdRef.current;
    if (!uid) return '';
    const parts: string[] = [];

    const selectedDate = localStorage.getItem('athlete_dashboard_selected_date') || getLocalDate();
    
    // Helper to get week start matching useSchedule
    const getWeekStart = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return monday.toISOString().split('T')[0];
    };
    const weekStart = getWeekStart(selectedDate);

    // Query schedules for user matching this week_start
    let sched = fromCache(`sched_${weekStart}`);
    if (!sched) {
      const { data } = await supabase
        .from('schedules')
        .select('id,week_start,days')
        .eq('user_id', uid)
        .eq('week_start', weekStart)
        .maybeSingle();
      sched = data;
      if (sched) toCache(`sched_${weekStart}`, sched);
    }

    let todayWorkoutSplit = 'REST';
    if (sched && sched.days && sched.days[selectedDate]) {
      todayWorkoutSplit = sched.days[selectedDate];
    }

    // 1. Get User Targets (DAILY_TARGETS)
    const { data: profile } = await supabase.from('profiles').select('targets').eq('id', uid).maybeSingle();
    const targets = profile?.targets || {};
    
    // Check for day-specific nutrition override
    const userMap = targets.day_nutrition || {};
    let activeTarget = {
      calories: targets.kcal || 2000,
      protein: targets.protein || 150,
      carbs: targets.carbs || 200,
      fat: targets.fat || 70
    };

    if (todayWorkoutSplit && userMap[todayWorkoutSplit]) {
      activeTarget = {
        calories: userMap[todayWorkoutSplit].kcal ?? activeTarget.calories,
        protein: userMap[todayWorkoutSplit].protein ?? activeTarget.protein,
        carbs: userMap[todayWorkoutSplit].carbs ?? activeTarget.carbs,
        fat: userMap[todayWorkoutSplit].fat ?? activeTarget.fat
      };
    }

    parts.push(`DAILY_TARGETS: ${JSON.stringify(activeTarget)}`);
    parts.push(`TODAY_SCHEDULED_WORKOUT_SPLIT: ${todayWorkoutSplit}`);
    if (sched) parts.push(`TRAINING_SCHEDULE: ${JSON.stringify(sched)}`);
    parts.push(`SELECTED_DASHBOARD_DATE: ${selectedDate}`);
    parts.push(`REAL_TODAY_DATE: ${getLocalDate()}`);
    parts.push(`CURRENT_TIME: ${getLocalTime()}`);

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
      parts.push(`DAILY_DIET_TOTALS: ${JSON.stringify({
        calories: log.daily_totals?.kcal || 0,
        protein: log.daily_totals?.protein || 0,
        carbs: log.daily_totals?.carbs || 0,
        fat: log.daily_totals?.fat || 0,
        water: log.daily_totals?.water || 0,
        completed: !!log.daily_totals?.completed
      })}`);
      parts.push(`TODAY_DIET_LOG_ID: ${log.id}`);
      parts.push(`IMPORTANT: Use diet_log_id="${log.id}" for any diet_meals insert`);
    } else {
      parts.push(`DAILY_DIET_TOTALS: {"calories":0,"protein":0,"carbs":0,"fat":0,"water":0,"completed":false}`);
    }

    // 4. Query food inventory based on user text + default staple items
    let matchedFoods: any[] = [];
    try {
      // Fetch user custom foods
      const { data: customFoods } = await supabase
        .from('food_inventory')
        .select('id, name, kcal_per_100g, protein, carbs, fat, serving_type')
        .eq('user_id', uid);

      if (customFoods) {
        matchedFoods.push(...customFoods);
      }

      // Extract search keywords from user text
      const cleanText = userText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanText.split(/\s+/).filter(w => w.length > 2 && w !== 'and' && w !== 'the' && w !== 'for' && w !== 'with');
      
      let query = supabase
        .from('food_inventory')
        .select('id, name, kcal_per_100g, protein, carbs, fat, serving_type')
        .is('user_id', null);
      
      if (words.length > 0) {
        const filters = words.slice(0, 5).map(w => `name.ilike.%${w}%`).join(',');
        query = query.or(filters);
      } else {
        query = query.limit(15);
      }
      
      const { data: presetFoods } = await query;
      if (presetFoods) {
        matchedFoods.push(...presetFoods);
      }

      // Fallback staples if matching counts are low
      if (matchedFoods.length < 15) {
        const { data: defaultPreset } = await supabase
          .from('food_inventory')
          .select('id, name, kcal_per_100g, protein, carbs, fat, serving_type')
          .is('user_id', null)
          .limit(15);
        if (defaultPreset) {
          matchedFoods.push(...defaultPreset);
        }
      }

      // Deduplicate by food ID
      const seenIds = new Set();
      const uniqueFoods = matchedFoods.filter(f => {
        if (seenIds.has(f.id)) return false;
        seenIds.add(f.id);
        return true;
      });

      // Map format for prompt
      const promptFoods = uniqueFoods.map(f => ({
        id: f.id,
        name: f.name,
        macros_per_100g: {
          calories: Number(f.kcal_per_100g) || 0,
          protein_g: Number(f.protein) || 0,
          carbs_g: Number(f.carbs) || 0,
          fat_g: Number(f.fat) || 0
        },
        serving_type: f.serving_type || 'per_100g'
      }));

      parts.push(`AVAILABLE_DATABASE_FOODS: ${JSON.stringify(promptFoods.slice(0, 20))}`);

    } catch (err) {
      console.error("Error loading food database context:", err);
      parts.push(`AVAILABLE_DATABASE_FOODS: []`);
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
      .limit(3);
    
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
      // all selected llama models support json_object mode
      const supportsJson = true;

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
          const isRateLimit = res.status === 429 || msg.includes('429') || msg.includes('rate_limit') || msg.includes('TPM') || msg.includes('RMP');
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
        setClientName(profile.display_name || 'Client');
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
      const context = await loadContext(text);
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
      const selectedDate = localStorage.getItem('athlete_dashboard_selected_date') || getLocalDate();
      const { data: existingLog } = await supabase
        .from('diet_logs')
        .select('id')
        .eq('user_id', userIdRef.current)
        .eq('date', selectedDate)
        .maybeSingle();
      
      let activeDietLogId = existingLog?.id;
      if (!activeDietLogId && userIdRef.current) {
        const { data: createdLog } = await supabase
          .from('diet_logs')
          .insert({
            user_id: userIdRef.current,
            date: selectedDate,
            daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
          })
          .select('id')
          .single();
        activeDietLogId = createdLog?.id;
      }

      const context = await loadContext(text);
      const aiRes = await callGroq(text, context);
      let aiText = aiRes.reply;

      let draftMealData: any = null;
      let actionsToExecute = aiRes.actions || [];

      // Intercept diet_meals insertions
      if (actionsToExecute.length > 0) {
        actionsToExecute = actionsToExecute.filter(a => {
          if (a.type === 'insert' && a.table === 'diet_meals') {
            draftMealData = {
              ...a.data,
              diet_log_id: a.data.diet_log_id === 'INSERT_DIET_LOG_ID_HERE' || !a.data.diet_log_id ? activeDietLogId : a.data.diet_log_id
            };
            return false; // Remove from execution
          }
          if (a.type === 'insert_diet_meal') {
            const newItem = {
              id: crypto.randomUUID(),
              food_id: a.food_id,
              name: a.food_name,
              grams: Number(a.grams),
              macros: {
                kcal: Number(a.calories),
                protein: Number(a.protein_g),
                carbs: Number(a.carbs_g),
                fat: Number(a.fat_g)
              },
              serving_type: 'per_100g'
            };

            if (draftMealData && draftMealData.items) {
              draftMealData.items.push(newItem);
            } else {
              draftMealData = {
                diet_log_id: activeDietLogId,
                name: 'Meal',
                time: getLocalTime(),
                items: [newItem]
              };
            }
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
    usageCount,
    clientName
  };
};
