import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { Activity, TrendingUp, Scale, AlertCircle } from 'lucide-react';

interface AnalyticsChartsProps {
  userId: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [runData, setRunData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {

      // 1. Fetch Workouts (Volume & Runs)
      const { data: workouts, error: workoutErr } = await supabase
        .from('workouts')
        .select('id, date, day_type, total_volume, notes, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true }); // chronological

      if (workoutErr) throw workoutErr;

      // 2. Fetch InBody (Weight)
      const { data: inbody, error: inbodyErr } = await supabase
        .from('inbody_scans')
        .select('date, weight')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (inbodyErr) throw inbodyErr;

      // Process Lifting Volume Data
      const vData = (workouts || [])
        .filter(w => w.day_type !== 'RUN' && w.total_volume > 0)
        .map(w => ({
          date: new Date(w.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          volume: w.total_volume,
          type: w.day_type
        }));
      setVolumeData(vData);

      // Process Run Data
      const rData = (workouts || [])
        .filter(w => w.day_type === 'RUN' && w.notes && w.notes.includes('"type":"run_stats"'))
        .map(w => {
          try {
            const stats = JSON.parse(w.notes);
            // Convert pace string "5:30" to a decimal 5.5 for charting
            const paceParts = (stats.pace || "0:0").split(':');
            const paceDecimal = parseInt(paceParts[0]) + (parseInt(paceParts[1]) / 60);

            return {
              date: new Date(w.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              distance: stats.distance_km || 0,
              paceRaw: stats.pace,
              paceDecimal: parseFloat(paceDecimal.toFixed(2))
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      setRunData(rData);

      // Process Weight Data
      const wData = (inbody || []).map(i => ({
        date: new Date(i.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: i.weight
      }));
      setWeightData(wData);



    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-slate-300 font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-bold">
              {entry.name}: {entry.value}
              {entry.dataKey === 'volume' && ' kg'}
              {entry.dataKey === 'distance' && ' km'}
              {entry.dataKey === 'weight' && ' kg'}
              {entry.dataKey === 'paceDecimal' && ' min/km'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="h-48 flex items-center justify-center text-slate-400">Loading insights...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-center space-x-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* LIFTING VOLUME CHART */}
      {volumeData.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp size={100} />
          </div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Volume Trends</h3>
              <p className="text-slate-400 text-sm">Total kg lifted per session</p>
            </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Volume"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RUN PERFORMANCE CHART */}
      {runData.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity size={100} />
          </div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Run Performance</h3>
              <p className="text-slate-400 text-sm">Distance vs Pace</p>
            </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={runData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} reversed />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="distance" name="Distance" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="paceDecimal" name="Pace" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* BODYWEIGHT TRENDS */}
      {weightData.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Scale size={100} />
          </div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Bodyweight Trends</h3>
              <p className="text-slate-400 text-sm">Weight fluctuation</p>
            </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  name="Weight"
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {volumeData.length === 0 && runData.length === 0 && weightData.length === 0 && (
        <div className="text-center p-10 bg-slate-800/50 rounded-3xl border border-slate-700/50">
          <div className="bg-slate-700/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-slate-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No Data Yet</h3>
          <p className="text-slate-400 text-sm">Complete workouts, runs, and InBody tests to see your progress charts here.</p>
        </div>
      )}

    </div>
  );
};
