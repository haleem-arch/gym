import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Helper to get Monday of the week for a given date
const getWeekStart = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const useSchedule = (activeDateStr: string) => {
  const [dayType, setDayType] = useState<string>('PUSH');
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    if (!activeDateStr) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const weekStart = getWeekStart(activeDateStr);

    const { data } = await supabase
      .from('schedules')
      .select('days')
      .eq('user_id', session.user.id)
      .eq('week_start', weekStart)
      .maybeSingle();

    if (data && data.days && data.days[activeDateStr]) {
      setDayType(data.days[activeDateStr]);
    } else {
      // Default fallback if nothing is scheduled
      setDayType('PUSH'); 
    }
    setLoading(false);
  }, [activeDateStr]);

  const updateDayType = async (newType: string) => {
    setDayType(newType); // Optimistic UI update
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const weekStart = getWeekStart(activeDateStr);

    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('week_start', weekStart)
      .maybeSingle();

    let newDays = data?.days || {};
    newDays[activeDateStr] = newType;

    if (data) {
      await supabase.from('schedules').update({ days: newDays }).eq('id', data.id);
    } else {
      await supabase.from('schedules').insert({
        user_id: session.user.id,
        week_start: weekStart,
        days: newDays
      });
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return { dayType, setDayType: updateDayType, loading };
};
