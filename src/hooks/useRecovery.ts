import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RecoveryLog {
  id: string;
  user_id: string;
  date: string;
  type: 'sauna' | 'cold_plunge' | 'stretching' | 'walk';
  duration: number; // in minutes
  metrics: {
    temp?: number; // for sauna/cold plunge in °C
    distance_km?: number; // for walk
    focus_area?: string; // for stretching
  };
  notes?: string;
  created_at: string;
}

export const useRecovery = (activeDateStr: string) => {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecoveryLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr)
        .order('created_at', { ascending: true });

      if (error) {
        // Fall back to localStorage if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.warn("Supabase recovery_logs table not found. Falling back to localStorage.");
          const local = localStorage.getItem(`athlete_local_recovery_logs_${activeDateStr}`);
          setRecoveryLogs(local ? JSON.parse(local) : []);
        } else {
          throw error;
        }
      } else {
        setRecoveryLogs(data || []);
      }
    } catch (err) {
      console.error("Error fetching recovery logs, trying localStorage fallback:", err);
      const local = localStorage.getItem(`athlete_local_recovery_logs_${activeDateStr}`);
      setRecoveryLogs(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  }, [activeDateStr]);

  const logRecoverySession = async (
    type: 'sauna' | 'cold_plunge' | 'stretching' | 'walk',
    duration: number,
    metrics: RecoveryLog['metrics'],
    notes: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = {
      user_id: session.user.id,
      date: activeDateStr,
      type,
      duration,
      metrics,
      notes: notes.trim() || null
    };

    try {
      const { data, error } = await supabase
        .from('recovery_logs')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.message?.includes('relation') || error.code === '42P01') {
          // Table missing, fallback to localStorage
          const localLogs = localStorage.getItem(`athlete_local_recovery_logs_${activeDateStr}`);
          const currentLogs = localLogs ? JSON.parse(localLogs) : [];
          const localPayload = {
            ...payload,
            id: 'local_' + crypto.randomUUID(),
            created_at: new Date().toISOString()
          };
          const updated = [...currentLogs, localPayload];
          localStorage.setItem(`athlete_local_recovery_logs_${activeDateStr}`, JSON.stringify(updated));
          setRecoveryLogs(updated);
        } else {
          throw error;
        }
      } else if (data) {
        setRecoveryLogs(prev => [...prev, data]);
      }
    } catch (err) {
      console.warn("Failed to log recovery in Supabase, using localStorage fallback:", err);
      const localLogs = localStorage.getItem(`athlete_local_recovery_logs_${activeDateStr}`);
      const currentLogs = localLogs ? JSON.parse(localLogs) : [];
      const localPayload = {
        ...payload,
        id: 'local_' + crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      const updated = [...currentLogs, localPayload];
      localStorage.setItem(`athlete_local_recovery_logs_${activeDateStr}`, JSON.stringify(updated));
      setRecoveryLogs(updated);
    }
  };

  const deleteRecoverySession = async (id: string) => {
    // Optimistic UI update
    setRecoveryLogs(prev => prev.filter(log => log.id !== id));

    if (id.startsWith('local_')) {
      const localLogs = localStorage.getItem(`athlete_local_recovery_logs_${activeDateStr}`);
      if (localLogs) {
        const parsed = JSON.parse(localLogs);
        const updated = parsed.filter((log: any) => log.id !== id);
        localStorage.setItem(`athlete_local_recovery_logs_${activeDateStr}`, JSON.stringify(updated));
      }
    } else {
      try {
        const { error } = await supabase
          .from('recovery_logs')
          .delete()
          .eq('id', id);
        if (error) {
          console.error("Error deleting from database:", error);
        }
      } catch (err) {
        console.error("Unhandled delete error:", err);
      }
    }
  };

  useEffect(() => {
    loadRecoveryLogs();
  }, [loadRecoveryLogs]);

  return {
    recoveryLogs,
    loading,
    logRecoverySession,
    deleteRecoverySession,
    reload: loadRecoveryLogs
  };
};
