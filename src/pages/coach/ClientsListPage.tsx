import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { DumbbellLoader } from '../../components/DumbbellLoader';

export default function ClientsListPage() {
  const { clients, loading } = useCoachClients();

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
            <Link key={client.id} to={`/coach/clients/${client.user?.id}`}>
              <Card className="flex justify-between items-center p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-blue-200 font-bold">
                    {client.user?.display_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{client.user?.display_name || 'Unnamed Client'}</p>
                    <p className="text-sm text-gray-400">@{client.user?.username || 'no-username'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Passcode</p>
                  <p className="font-mono text-sm text-blue-400">{client.generated_passcode || 'N/A'}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
