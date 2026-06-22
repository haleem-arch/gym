import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useSchedule } from './useSchedule';
import { DEFAULT_DAY_NUTRITION } from '../components/DietNutritionSettings';
import type { MacroTarget } from '../components/DietNutritionSettings';

export interface DailyMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  water?: number;
  completed?: boolean;
}

export interface DietLog {
  id: string;
  user_id: string;
  date: string;
  daily_totals: DailyMacros;
}

export interface DietMealItem {
  id: string; // internal UUID for the array item to map uniquely
  food_id: string;
  name: string;
  grams: number;
  macros: DailyMacros; // the calculated macros for this specific gram amount
  serving_type?: 'per_100g' | 'per_item';
}

export interface DietMeal {
  id: string;
  diet_log_id: string;
  name: string;
  time: string;
  items: DietMealItem[];
}

export const useDiet = () => {
  const getLocalDateString = (d: Date = new Date()) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const activeDateStr = useMemo(() => getLocalDateString(activeDate), [activeDate]);

  const { dayType } = useSchedule(activeDateStr);

  const [log, setLog] = useState<DietLog | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<MacroTarget>(DEFAULT_DAY_NUTRITION['PUSH']);
  const [dayNutrition, setDayNutrition] = useState<Record<string, MacroTarget>>({});
  const [allDayTypes, setAllDayTypes] = useState<string[]>(['REST', 'RUN', 'RUN + GYM', 'PUSH', 'PULL', 'LEGS']);
  const [waterGoalMl, setWaterGoalMl] = useState<number>(3500);

  const getDefaultTarget = (dt: string, profileTargets?: any): MacroTarget => {
    const normalized = dt.replace(/\s+/g, '');
    const baseline = {
      kcal: profileTargets?.kcal ?? 2400,
      protein: profileTargets?.protein ?? 170,
      carbs: profileTargets?.carbs ?? 230,
      fat: profileTargets?.fat ?? 70
    };
    return DEFAULT_DAY_NUTRITION[dt] ?? DEFAULT_DAY_NUTRITION[normalized] ?? baseline;
  };

  // Load per-day targets and dynamic day types
  const fetchAndAdjustTargets = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 1. Fetch user's workout plans to get dynamic day types
    const { data: plansData } = await supabase
      .from('user_workout_plans')
      .select('plan_type')
      .eq('user_id', session.user.id);

    const planTypes = plansData ? plansData.map(p => p.plan_type) : [];
    // System-wide default non-workout day types
    const systemDefaults = ['REST', 'RUN', 'RUN + GYM'];
    // Deduplicate and filter empty values
    const activeSplits = planTypes.filter(Boolean);
    // If the user has plans in user_workout_plans, use them. If they have none (e.g. first login), fallback to PUSH/PULL/LEGS
    const splits = activeSplits.length > 0 ? activeSplits : ['PUSH', 'PULL', 'LEGS'];
    // Merge system defaults and workout splits uniquely
    const finalTypes = Array.from(new Set([...systemDefaults, ...splits]));
    
    setAllDayTypes(finalTypes);

    // 2. Fetch profile targets
    const { data: profile } = await supabase
      .from('profiles')
      .select('targets')
      .eq('id', session.user.id)
      .maybeSingle();

    const userMap: Record<string, MacroTarget> = profile?.targets?.day_nutrition || {};
    const merged: Record<string, MacroTarget> = {};
    
    setWaterGoalMl(profile?.targets?.water_goal_ml || 3500);

    finalTypes.forEach(dt => {
      const exactKey = userMap[dt] 
        ? dt 
        : (userMap[dt.replace(/\s+/g, '')] ? dt.replace(/\s+/g, '') : null);
      merged[dt] = exactKey ? { ...userMap[exactKey] } : getDefaultTarget(dt, profile?.targets);
    });
    setDayNutrition(merged);

    // 3. Apply active targets for today's scheduled dayType
    const matchedType = finalTypes.find(t => t.toLowerCase().replace(/\s+/g, '') === dayType.toLowerCase().replace(/\s+/g, ''));
    const fallbackKey = finalTypes.includes(dayType)
      ? dayType
      : (finalTypes[3] || finalTypes[0] || 'REST');
    const activeTarget = matchedType 
      ? merged[matchedType] 
      : (merged[fallbackKey] || getDefaultTarget(dayType, profile?.targets));
      
    setTargets({ ...activeTarget });
  }, [dayType]);

  // Load targets on mount or when dayType changes
  useEffect(() => {
    fetchAndAdjustTargets();
  }, [fetchAndAdjustTargets]);

  // Listen to plan updates, schedule updates, and profiles real-time changes to reload instantly
  useEffect(() => {
    let subscription: any = null;

    const handleUpdate = () => {
      fetchAndAdjustTargets();
    };

    window.addEventListener('plan_updated', handleUpdate);
    window.addEventListener('schedule_updated', handleUpdate);

    // Real-time subscription to targets updates in the profiles table
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const channelId = `profile-targets-${session.user.id}-${Date.now()}`;
        subscription = supabase.channel(channelId)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles', 
            filter: `id=eq.${session.user.id}` 
          }, () => {
            fetchAndAdjustTargets();
          })
          .subscribe();
      }
    });

    return () => {
      window.removeEventListener('plan_updated', handleUpdate);
      window.removeEventListener('schedule_updated', handleUpdate);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchAndAdjustTargets]);

  // Save updated day_nutrition map to Supabase
  const saveDayNutrition = async (map: Record<string, MacroTarget>, newWaterGoalMl?: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('targets')
      .eq('id', session.user.id)
      .maybeSingle();

    const currentTargets = profile?.targets || {};
    const updatedTargets = { ...currentTargets, day_nutrition: map };
    if (newWaterGoalMl !== undefined) {
      updatedTargets.water_goal_ml = newWaterGoalMl;
    }

    await supabase
      .from('profiles')
      .update({ targets: updatedTargets })
      .eq('id', session.user.id);

    // Update local state immediately
    setDayNutrition(map);
    if (newWaterGoalMl !== undefined) {
      setWaterGoalMl(newWaterGoalMl);
    }
    const matchedType = allDayTypes.find(t => t.toLowerCase().replace(/\s+/g, '') === dayType.toLowerCase().replace(/\s+/g, ''));
    if (matchedType && map[matchedType]) {
      setTargets({ ...map[matchedType] });
    }
  };

  const loadDateData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        setLoading(false);
        return;
      }

      // 1. Fetch diet_log for active date
      const { data: dietLog, error: dietError } = await supabase
        .from('diet_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr)
        .maybeSingle();

      if (dietError) throw dietError;

      if (dietLog) {
        // Auto-complete past dates (prior to today's local date) if they are not already marked completed
        const todayStr = getLocalDateString(new Date());
        if (dietLog.date < todayStr && !dietLog.daily_totals.completed) {
          dietLog.daily_totals.completed = true;
          supabase
            .from('diet_logs')
            .update({ daily_totals: dietLog.daily_totals })
            .eq('id', dietLog.id)
            .then();
        }
        setLog(dietLog);
        
        // 2. Fetch meals for this log
        const { data: mealsData, error: mealsError } = await supabase
          .from('diet_meals')
          .select('*')
          .eq('diet_log_id', dietLog.id)
          .order('created_at', { ascending: true });
          
        if (mealsError) throw mealsError;
        if (mealsData) {
          setMeals(mealsData);
          recalculateTotals(dietLog.id, mealsData, dietLog.daily_totals?.water || 0, dietLog.daily_totals?.completed);
        }
      } else {
        setLog(null);
        setMeals([]);
      }

      // 3. Fetch water logs separately
      const { data: waterData, error: waterError } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr)
        .order('time', { ascending: true });

      if (waterError) throw waterError;

      if (waterData) {
        setWaterLogs(waterData);
      } else {
        setWaterLogs([]);
      }
    } catch (err) {
      console.error("Error loading date data:", err);
      toast.error('Unable to load nutrition data. Please check your connection.', { id: 'diet-load-error' });
    } finally {
      setLoading(false);
    }
  }, [activeDateStr]);

  const startDay = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setLoading(true);
    const { data: newLog, error: insertError } = await supabase
      .from('diet_logs')
      .insert({
        user_id: session.user.id,
        date: activeDateStr,
        daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
      })
      .select()
      .single();
    
    if (insertError) console.error("Error starting day:", insertError);
    if (newLog) {
      setLog(newLog);
      setMeals([]);
      setWaterLogs([]);
    }
    setLoading(false);
  };

  const toggleDayCompletion = async () => {
    if (!log) return;
    const isCompleted = log.daily_totals.completed || false;
    const updatedTotals = { ...log.daily_totals, completed: !isCompleted };
    
    setLog(prev => prev ? { ...prev, daily_totals: updatedTotals } : null);
    await supabase.from('diet_logs').update({ daily_totals: updatedTotals }).eq('id', log.id);
  };

  const recalculateTotals = async (logId: string, currentMeals: DietMeal[], existingWater?: number, existingCompleted?: boolean) => {
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, water: existingWater || 0, completed: existingCompleted || false };
    
    currentMeals.forEach(meal => {
      meal.items.forEach(item => {
        totals.kcal += item.macros.kcal;
        totals.protein += item.macros.protein;
        totals.carbs += item.macros.carbs;
        totals.fat += item.macros.fat;
      });
    });

    // Round everything to 1 decimal place to prevent floating point weirdness
    totals = {
      kcal: Math.round(totals.kcal),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      water: totals.water,
      completed: totals.completed
    };

    // Update state
    setLog(prev => prev ? { ...prev, daily_totals: totals } : null);

    // Update Supabase
    await supabase.from('diet_logs').update({ daily_totals: totals }).eq('id', logId);
  };

  const createMeal = async (name: string) => {
    if (!log) return null;
    
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:00`;

    const { data: newMeal, error } = await supabase
      .from('diet_meals')
      .insert({
        diet_log_id: log.id,
        name: name,
        time: timeStr,
        items: []
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating meal:", error);
      return null;
    }

    setMeals(prev => [...prev, newMeal]);
    return newMeal;
  };

  const logWater = async (amountLiters: number) => {
    let currentLog = log;
    
    if (!currentLog) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setLoading(true);
      const { data: newLog, error: insertError } = await supabase
        .from('diet_logs')
        .insert({
          user_id: session.user.id,
          date: activeDateStr,
          daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0, completed: false }
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error starting day on water log:", insertError);
        setLoading(false);
        return;
      }
      
      if (newLog) {
        setLog(newLog);
        setMeals([]);
        setWaterLogs([]);
        currentLog = newLog;
      }
      setLoading(false);
    }
    
    if (!currentLog) return;
    
    const amountMl = Math.round(amountLiters * 1000);
    
    const currentTotalMl = waterLogs.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0);
    if (currentTotalMl + amountMl > 10000) {
      toast.error("Water intake cannot exceed 10 liters per day!");
      return;
    }
    
    const d = new Date();
    
    const newLog = {
      user_id: currentLog.user_id,
      date: activeDateStr,
      time: d.toISOString(),
      amount_ml: amountMl
    };
    
    const { data: inserted, error } = await supabase.from('water_logs').insert(newLog).select().single();
    if (!error && inserted) {
      setWaterLogs(prev => [...prev, inserted]);
    } else {
      console.error("Failed to log water:", error);
    }
  };

  const resetWater = async () => {
    if (!log) return;
    
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('user_id', log.user_id)
      .eq('date', activeDateStr);

    if (!error) {
      setWaterLogs([]);
      const updatedTotals = { ...log.daily_totals, water: 0 };
      setLog(prev => prev ? { ...prev, daily_totals: updatedTotals } : null);
      await supabase.from('diet_logs').update({ daily_totals: updatedTotals }).eq('id', log.id);
    }
  };

  useEffect(() => {
    loadDateData();
  }, [loadDateData]);

  return {
    log,
    meals,
    waterLogs,
    loading,
    targets,
    dayType,
    dayNutrition,
    allDayTypes,
    saveDayNutrition,
    activeDate,
    setActiveDate,
    createMeal,
    logWater,
    resetWater,
    startDay,
    toggleDayCompletion,
    waterGoalMl,
    reload: loadDateData
  };
};
