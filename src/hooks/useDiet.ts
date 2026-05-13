import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

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

  const [log, setLog] = useState<DietLog | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState({
    kcal: 2400,
    protein: 160,
    carbs: 240, // Corrected from 250
    fat: 70     // Corrected from 80
  });

  const loadDateData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Try to load profile targets
    const { data: profile } = await supabase.from('profiles').select('targets').eq('id', session.user.id).maybeSingle();
    if (profile && profile.targets && profile.targets.kcal) {
      setTargets(profile.targets);
    }

    // 1. Fetch diet_log for active date
    let { data: dietLog } = await supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', activeDateStr)
      .maybeSingle();

    if (dietLog) {
      setLog(dietLog);
      
      // 2. Fetch meals for this log
      const { data: mealsData, error: mealsError } = await supabase
        .from('diet_meals')
        .select('*')
        .eq('diet_log_id', dietLog.id)
        .order('created_at', { ascending: true });
        
      if (mealsError) console.error("Error fetching meals:", mealsError);
      if (mealsData) {
        setMeals(mealsData);
        // Automatically recalculate totals to ensure sync, passing existing water & completed status
        recalculateTotals(dietLog.id, mealsData, dietLog.daily_totals?.water || 0, dietLog.daily_totals?.completed);
      }
    } else {
      setLog(null);
      setMeals([]);
    }

    setLoading(false);
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
    if (!log) return;
    
    const currentWater = log.daily_totals.water || 0;
    const newWater = Math.round((currentWater + amountLiters) * 10) / 10;
    
    const updatedTotals = { ...log.daily_totals, water: newWater };
    
    setLog(prev => prev ? { ...prev, daily_totals: updatedTotals } : null);
    await supabase.from('diet_logs').update({ daily_totals: updatedTotals }).eq('id', log.id);
  };

  const resetWater = async () => {
    if (!log) return;
    const updatedTotals = { ...log.daily_totals, water: 0 };
    setLog(prev => prev ? { ...prev, daily_totals: updatedTotals } : null);
    await supabase.from('diet_logs').update({ daily_totals: updatedTotals }).eq('id', log.id);
  };

  useEffect(() => {
    loadDateData();
  }, [loadDateData]);

  return {
    log,
    meals,
    loading,
    targets,
    activeDate,
    setActiveDate,
    createMeal,
    logWater,
    resetWater,
    startDay,
    toggleDayCompletion,
    reload: loadDateData
  };
};
