import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

export const useCoachClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);

    // Get the current coach's user ID
    const { data: { session } } = await supabase.auth.getSession();
    const coachId = session?.user?.id;
    if (!coachId) {
      setClients([]);
      setLoading(false);
      return;
    }

    // Owner sees all clients; other coaches see only their own
    let query = supabase
      .from('client_profiles')
      .select(`
        *,
        user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)
      `)
      .order('created_at', { ascending: false });

    if (coachId !== OWNER_ID) {
      query = query.eq('coach_id', coachId);
    }

    const { data, error } = await query;

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
