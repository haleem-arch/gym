import { useState } from 'react';
import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { SwipeToDeleteRow } from '../../components/SwipeToDeleteRow';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

export default function ClientsListPage() {
  const { clients, loading, refetch } = useCoachClients();
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [targetClientToDelete, setTargetClientToDelete] = useState<any | null>(null);

  if (deleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060610]">
        <DumbbellLoader label="Deleting client account. Please wait..." size={100} />
      </div>
    );
  }

  const handleDeleteClientClick = (client: any) => {
    setTargetClientToDelete(client);
    setDeleteConfirmText('');
    setShowConfirmDeleteModal(true);
  };

  const executeDeleteClient = async () => {
    if (!targetClientToDelete) return;
    const client = targetClientToDelete;
    const displayName = client.user?.display_name || 'this client';
    
    setShowConfirmDeleteModal(false);
    setDeleting(true);
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
      setTargetClientToDelete(null);
      
      // Refetch clients list
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to delete client. Please check your connection.', { id: toastId });
    } finally {
      setDeleting(false);
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
            <SwipeToDeleteRow key={client.id} onDelete={() => handleDeleteClientClick(client)} backgroundRounded="rounded-xl">
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

      {/* Custom Confirmation Modal */}
      {showConfirmDeleteModal && targetClientToDelete && (() => {
        const displayName = targetClientToDelete.user?.display_name || 'Unnamed Client';
        const isMatched = deleteConfirmText.trim() === displayName;

        return (
          <div className="fixed inset-0 bg-[#05050b]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isMatched) executeDeleteClient();
              }}
              className="w-full max-w-xs bg-[#0d1220] border border-gray-800 rounded-3xl p-6 space-y-5 relative z-10 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Delete Client Account?</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  This action is permanent and will completely delete the client account and all of their historical records.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider text-center">
                  Type <span className="text-red-400 font-mono select-none">"{displayName}"</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDeleteConfirmText(val);
                    if (val.trim() === displayName && !deleting) {
                      executeDeleteClient();
                    }
                  }}
                  placeholder="Type client name..."
                  className="w-full bg-[#131b2e] border border-gray-700 rounded-2xl py-3 px-4 text-center text-xs outline-none focus:border-red-500 transition-colors text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDeleteModal(false);
                    setTargetClientToDelete(null);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-850 hover:bg-gray-850 active:scale-95 text-gray-300 py-3 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatched}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase transition-all text-center cursor-pointer active:scale-95 ${
                    isMatched
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-red-950/20 text-red-400/30 border border-red-950/40 cursor-not-allowed'
                  }`}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
}
