import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useCoachClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:profiles(id, username, email, display_name, created_at)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  return { clients, loading };
};
