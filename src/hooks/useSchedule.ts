import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

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
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        setLoading(false);
        return;
      }

      const weekStart = getWeekStart(activeDateStr);

      const { data, error } = await supabase
        .from('schedules')
        .select('days')
        .eq('user_id', session.user.id)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (error) throw error;

      if (data && data.days && data.days[activeDateStr]) {
        setDayType(data.days[activeDateStr]);
      } else {
        // Default fallback if nothing is scheduled
        setDayType('PUSH'); 
      }
    } catch (err) {
      console.error("Error loading schedule:", err);
      toast.error('Unable to load schedule. Please check your connection.', { id: 'schedule-load-error' });
    } finally {
      setLoading(false);
    }
  }, [activeDateStr]);

  const updateDayType = async (newType: string) => {
    setDayType(newType); // Optimistic UI update
    
    // Broadcast event so other instances of useSchedule (like in useDiet) update instantly
    window.dispatchEvent(new CustomEvent('schedule_updated', { detail: newType }));
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return;
 
      const weekStart = getWeekStart(activeDateStr);
 
      const { data, error: selectError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('week_start', weekStart)
        .maybeSingle();
 
      if (selectError) throw selectError;
 
      let newDays = data?.days || {};
      newDays[activeDateStr] = newType;
 
      let error;
      if (data) {
        const { error: updateError } = await supabase.from('schedules').update({ days: newDays }).eq('id', data.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('schedules').insert({
          user_id: session.user.id,
          week_start: weekStart,
          days: newDays
        });
        error = insertError;
      }
      if (error) throw error;
    } catch (err) {
      console.error("Error updating schedule:", err);
      toast.error('Unable to update schedule day type. Please try again.');
    }
  };

  useEffect(() => {
    loadSchedule();

    // Listen for local updates across components
    const handleLocalUpdate = (e: any) => {
      setDayType(e.detail);
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
