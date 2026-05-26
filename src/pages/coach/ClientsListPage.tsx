import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { SwipeToDeleteRow } from '../../components/SwipeToDeleteRow';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function ClientsListPage() {
  const { clients, loading, refetch } = useCoachClients();

  const handleDeleteClient = async (client: any) => {
    const phoneNumber = client.user?.targets?.phone_number;
    const clientCode = client.user?.targets?.client_code;
    const displayName = client.user?.display_name || 'this client';
    
    // Legacy support fallback if phone number is not defined
    const expectedVerifyVal = phoneNumber || String(clientCode || '123');

    const input = window.prompt(
      `To delete client "${displayName}", please enter their Phone Number (verification: ${expectedVerifyVal}):`
    );

    if (input !== expectedVerifyVal) {
      if (input !== null) {
        toast.error('Incorrect verification value. Deletion cancelled.');
      }
      return;
    }

    const toastId = toast.loading(`Deleting ${displayName}...`);
    try {
      const uid = client.user_id;

      // 1. Delete from auth account using secure Vercel Serverless API.
      const { data: { session: coachSession } } = await supabase.auth.getSession();
      if (!coachSession) throw new Error('COACH AUTH REQUIRED');

      const deleteRes = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${coachSession.access_token}`
        },
        body: JSON.stringify({ uid })
      });

      if (!deleteRes.ok) {
        const errData = await deleteRes.json().catch(() => ({}));
        console.warn('Auth user delete warning:', errData.error || 'Failed');
      }

      // 2. Cascade delete database records
      await supabase.from('inbody_scans').delete().eq('user_id', uid);
      await supabase.from('client_workout_days').delete().eq('user_id', uid);
      await supabase.from('user_workout_plans').delete().eq('user_id', uid);
      await supabase.from('progress_notes').delete().eq('user_id', uid);
      await supabase.from('water_logs').delete().eq('user_id', uid);
      await supabase.from('client_profiles').delete().eq('user_id', uid);
      await supabase.from('profiles').delete().eq('id', uid);

      toast.success(`${displayName} deleted successfully`, { id: toastId });
      
      // Refetch clients list
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to delete client. Please check your connection.', { id: toastId });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <Link 
          to="/coach/clients/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          + Add Client
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <DumbbellLoader label="Loading clients..." size={100} />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center p-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
          <p className="text-gray-400 mb-4">You don't have any clients yet.</p>
          <Link to="/coach/clients/new" className="text-blue-400 hover:underline">Register your first client</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(client => (
            <SwipeToDeleteRow key={client.id} onDelete={() => handleDeleteClient(client)} backgroundRounded="rounded-xl">
              <Link to={`/coach/clients/${client.user?.id}`}>
                <Card className="flex justify-between items-center p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-blue-200 font-bold">
                      {client.user?.display_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{client.user?.display_name || 'Unnamed Client'}</p>
                        {client.user?.targets?.client_code && (
                          <span className="text-[10px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1.5 py-0.5 rounded font-black">
                            #{client.user.targets.client_code}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">@{client.user?.username || 'no-username'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Passcode</p>
                    <p className="font-mono text-sm text-blue-400">{client.generated_passcode || 'N/A'}</p>
                  </div>
                </Card>
              </Link>
            </SwipeToDeleteRow>
          ))}
        </div>
      )}
    </div>
  );
}
