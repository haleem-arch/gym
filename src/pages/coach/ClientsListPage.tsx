import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, User } from 'lucide-react';
import { useState } from 'react';

export default function ClientsListPage() {
  const { clients, loading } = useCoachClients();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client => {
    const name = (client.user?.display_name || '').toLowerCase();
    const username = (client.user?.username || '').toLowerCase();
    const email = (client.user?.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || username.includes(query) || email.includes(query);
  });

  return (
    <div className="animate-slide-up space-y-8 p-4 relative min-h-screen pb-24">
      {/* Swirling Cosmic Background Mesh */}
      <div className="cosmic-mesh">
        <div className="cosmic-blob-1" />
        <div className="cosmic-blob-2" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-outfit text-4xl font-black tracking-tight uppercase text-white">Client <span className="text-secondary">Archive</span></h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">Full database of registered athletes</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH DATABASE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-3 font-mono text-[9px] uppercase tracking-widest text-white focus:border-secondary outline-none transition-all"
            />
          </div>
          <Link 
            to="/coach/clients/new" 
            className="bg-accent hover:bg-accent/80 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={14} /> Add Athlete
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-surface/20 border border-white/5 animate-pulse rounded-xl" />)}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="text-center py-20 flex flex-col items-center justify-center border-dashed border-white/10">
          <User className="text-gray-600 mb-3" size={24} />
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">No matching athletes found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map(client => (
            <Link key={client.id} to={`/coach/clients/${client.user?.id}`}>
              <Card className="flex justify-between items-center p-4 hover:bg-surface/80 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center font-outfit font-black text-secondary group-hover:scale-105 transition-all">
                    {client.user?.display_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-outfit font-black text-lg uppercase tracking-tight text-white group-hover:text-accent transition-colors">{client.user?.display_name || 'Classified'}</p>
                    <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{client.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Experience</span>
                    <span className="font-outfit text-[10px] font-bold text-success uppercase">{client.experience_level || 'Beginner'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Access Pass</span>
                    <span className="font-mono text-[10px] font-bold text-accent uppercase">{client.generated_passcode || 'N/A'}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-accent transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
