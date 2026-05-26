import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useCoachClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_profiles')
      .select(`
        *,
        user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, refetch: fetchClients };
};
