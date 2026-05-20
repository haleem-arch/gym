import { useCoachClients } from '../../hooks/useCoachClients';
import { Card } from '../../components/Card';
import { Link } from 'react-router-dom';
import { Users, Target, Activity, Plus, Terminal, RefreshCw, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { clients, loading } = useCoachClients();
  const [logs, setLogs] = useState<any[]>([]);

  // Telemetry simulation for the tactical command feel
  useEffect(() => {
    const mockLogs = [
      { id: 1, athlete: 'Hassan Sherif', action: 'completed 12.8km Endurance Run', category: 'workout', time: '14 mins ago', status: 'optimal' },
      { id: 2, athlete: 'Nour El-Din', action: 'logged morning biometrics (bf% dropped to 12.8%)', category: 'metrics', time: '1 hr ago', status: 'optimal' },
      { id: 3, athlete: 'Mariam Ali', action: 'synced Strava protocol (PR set on 5K: 21:40)', category: 'achievement', time: '2 hrs ago', status: 'success' },
      { id: 4, athlete: 'Tarek Amin', action: 'adjusted caloric window +200kcal via AI Coach', category: 'diet', time: '4 hrs ago', status: 'warning' },
      { id: 5, athlete: 'Youssef Galal', action: 'initiated week 4 Recomposition Protocol', category: 'system', time: '1 day ago', status: 'info' }
    ];
    setLogs(mockLogs);
  }, []);

  return (
    <div className="animate-slide-up space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-outfit text-4xl font-black tracking-tight uppercase">
            Tactical <span className="text-accent">Operations</span>
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Real-Time Athlete Oversight & Command Center
          </p>
        </div>
        <Link 
          to="/coach/clients/new" 
          className="bg-accent hover:bg-accent/80 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={14} /> Deploy Athlete
        </Link>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-gray-500 mb-2">
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest">Active Deployments</span>
            <Users size={16} className="text-secondary" />
          </div>
          <p className="font-mono text-4xl font-black text-secondary">{clients.length}</p>
          <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest mt-2 block">ATHLETES STAGED IN DATABASE</span>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-success/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-gray-500 mb-2">
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest">Mission Adherence</span>
            <Activity size={16} className="text-success" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-4xl font-black text-success">84.2%</p>
            <span className="font-mono text-[10px] text-success/60 font-bold uppercase">(+2.4%)</span>
          </div>
          <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest mt-2 block">WEEKLY TARGET GOAL ACHIEVED</span>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-gray-500 mb-2">
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest">AI Calibrations</span>
            <Target size={16} className="text-accent" />
          </div>
          <p className="font-mono text-4xl font-black text-accent">18</p>
          <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest mt-2 block">AUTO-CORRECTIONS COMPLETED</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Athletes (Col: 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-outfit text-xl font-bold uppercase tracking-wider">
              Recent <span className="text-secondary">Roster</span>
            </h2>
            <Link to="/coach/clients" className="text-secondary hover:text-accent font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group">
              ARCHIVE DATABASE <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-surface/20 border border-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <Card className="text-center py-16 border-dashed flex flex-col items-center justify-center">
              <Users className="text-gray-600 mb-3" size={24} />
              <p className="text-gray-500 font-mono text-[10px] uppercase mb-4 tracking-widest">No active athletes staged</p>
              <Link to="/coach/clients/new" className="text-accent font-bold uppercase text-[10px] tracking-widest hover:underline">Deploy First Profile</Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {clients.slice(0, 4).map(client => (
                <Link key={client.id} to={`/coach/clients/${client.user?.id}`} className="block">
                  <div className="glass-panel glass-panel-hover p-5 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center font-outfit font-black text-secondary group-hover:scale-105 transition-all">
                        {client.user?.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-outfit font-black text-base uppercase tracking-tight text-white group-hover:text-accent transition-colors">
                          {client.user?.display_name || 'Classified'}
                        </p>
                        <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
                          @{client.user?.username || 'unknown'} · {client.user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Protocol</span>
                        <span className="font-outfit text-[10px] font-bold text-success uppercase">{client.experience_level || 'Beginner'}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Live Command Telemetry Logs (Col: 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-outfit text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal size={18} className="text-accent animate-pulse" /> Telemetry <span className="text-accent">Intel</span>
            </h2>
            <button className="text-gray-500 hover:text-white transition-colors">
              <RefreshCw size={12} className="animate-spin-slow" />
            </button>
          </div>

          <div className="glass-panel rounded-xl p-5 border-white/5 space-y-4 max-h-[390px] overflow-y-auto no-scrollbar font-mono text-[9px]">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0 flex items-start gap-3">
                <span className="relative flex h-2 w-2 mt-1">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    log.status === 'success' ? 'bg-success' : log.status === 'warning' ? 'bg-accent' : 'bg-secondary'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    log.status === 'success' ? 'bg-success' : log.status === 'warning' ? 'bg-accent' : 'bg-secondary'
                  }`}></span>
                </span>
                <div className="flex-1 space-y-0.5">
                  <p className="text-white uppercase leading-relaxed">
                    <span className="text-secondary font-bold">[{log.athlete}]</span> {log.action}
                  </p>
                  <div className="flex justify-between text-gray-500">
                    <span>SECTOR: {log.category.toUpperCase()}</span>
                    <span>{log.time.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

