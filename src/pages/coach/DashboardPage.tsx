import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { DumbbellLoader } from '../../components/DumbbellLoader';

export default function DashboardPage() {
  const { clients, loading } = useCoachClients();

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Coach Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-gray-400 text-sm">Total Clients</p>
          <p className="text-3xl font-bold text-blue-400">{clients.length}</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm">Active Plans</p>
          <p className="text-3xl font-bold text-green-400">{clients.filter(c => c.has_active_plan).length}</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm">Adherence (Avg)</p>
          <p className="text-3xl font-bold text-emerald-400">78%</p>
        </Card>
      </div>

      {/* Recent Clients */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Clients</h2>
        <Link to="/coach/clients" className="text-blue-400 text-sm hover:underline">View All</Link>
      </div>

      {loading ? (
        <DumbbellLoader label="Loading dashboard..." size={80} />
      ) : clients.length === 0 ? (
        <p className="text-gray-400">No clients yet. <Link to="/coach/clients/new" className="text-blue-400 underline">Create one</Link></p>
      ) : (
        <div className="space-y-2">
          {clients.slice(0, 5).map(client => (
            <Link key={client.id} to={`/coach/clients/${client.user?.id}`}>
              <Card className="flex justify-between items-center p-4 hover:bg-gray-700 transition-colors mb-2">
                <div>
                  <p className="font-bold text-white">{client.user?.display_name || 'Unnamed Client'}</p>
                  <p className="text-sm text-gray-400">{client.user?.email}</p>
                </div>
                <span className="text-blue-400 text-sm">View</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
