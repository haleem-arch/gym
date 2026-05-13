import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DailyMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
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
  const [log, setLog] = useState<DietLog | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);

  // Targets (Hardcoded for now as requested)
  const targets = {
    kcal: 2400,
    protein: 160,
    carbs: 250,
    fat: 80
  };

  const getLocalDateString = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const loadTodayData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const todayStr = getLocalDateString();

    // 1. Fetch or create diet_log for today
    let { data: dietLog } = await supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', todayStr)
      .maybeSingle();

    if (!dietLog) {
      // Create new log
      const { data: newLog, error: insertError } = await supabase
        .from('diet_logs')
        .insert({
          user_id: session.user.id,
          date: todayStr,
          daily_totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        })
        .select()
        .single();
      
      if (insertError) console.error("Error creating log:", insertError);
      dietLog = newLog;
    }

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
        // Automatically recalculate totals to ensure sync
        recalculateTotals(dietLog.id, mealsData);
      }
    }

    setLoading(false);
  }, []);

  const recalculateTotals = async (logId: string, currentMeals: DietMeal[]) => {
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    
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

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  return {
    log,
    meals,
    loading,
    targets,
    createMeal,
    reload: loadTodayData
  };
};
