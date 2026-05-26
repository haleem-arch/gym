import { supabaseAdmin } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useCoachClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      // Use admin client so it works regardless of the current auth session state.
      // The clients page is already protected by the coach hub passcode.
      const { data, error } = await supabaseAdmin
        .from('client_profiles')
        .select(`
          *,
          user:profiles(id, username, email, display_name, targets, created_at)
        `)
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
