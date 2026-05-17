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
      // Default fallback if nothing is scheduled: fetch the user's first available plan from user_workout_plans
      const { data: plans } = await supabase
        .from('user_workout_plans')
        .select('plan_type')
        .eq('user_id', session.user.id)
        .limit(1);

      if (plans && plans.length > 0) {
        setDayType(plans[0].plan_type.toUpperCase());
      } else {
        setDayType('PUSH'); 
      }
    }
    setLoading(false);
  }, [activeDateStr]);

  const updateDayType = async (newType: string) => {
    setDayType(newType); // Optimistic UI update
    
    // Broadcast event so other instances of useSchedule (like in useDiet) update instantly
    window.dispatchEvent(new CustomEvent('schedule_updated', { detail: newType }));
    
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

    // Listen for local updates across components
    const handleLocalUpdate = (e: any) => {
      if (e.detail) {
        setDayType(e.detail);
      } else {
        loadSchedule();
      }
    };
    window.addEventListener('schedule_updated', handleLocalUpdate);

    const channelId = `schedules-channel-${Date.now()}-${Math.random()}`;
    const subscription = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, (payload: any) => {
        if (payload.new && payload.new.days && payload.new.days[activeDateStr]) {
          setDayType(payload.new.days[activeDateStr]);
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('schedule_updated', handleLocalUpdate);
      supabase.removeChannel(subscription);
    };
  }, [loadSchedule, activeDateStr]);

  return { dayType, setDayType: updateDayType, loading };
};
