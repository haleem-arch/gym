import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, CalendarDays, Zap, TrendingUp, Heart, Award, Sparkles, Activity, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Polyline as LeafletPolyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Polyline decoder helper
const decodePolyline = (encoded: string): [number, number][] => {
  if (!encoded) return [];
  const poly: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
};

// Auto-fit bounds component for React Leaflet
const FitMapBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      map.fitBounds(points, { padding: [25, 25] });
    }
  }, [points, map]);
  return null;
};

// Custom Tooltips for Recharts
const StravaCustomTooltip = ({ active, payload, label, unit = '', valueLabel = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary text-white font-extrabold px-3 py-1.5 rounded-xl shadow-2xl border border-white/20 text-xs flex flex-col items-center gap-0.5 backdrop-blur-md animate-pop">
        <span className="text-[9px] text-blue-100 uppercase font-bold tracking-wider">{valueLabel} (KM {Number(label).toFixed(1)})</span>
        <span className="text-sm font-black tracking-tight">{payload[0].value} {unit}</span>
      </div>
    );
  }
  return null;
};

const StravaPaceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const minPerKm = payload[0].value;
    const mins = Math.floor(minPerKm);
    const secs = Math.floor((minPerKm - mins) * 60);
    const paceStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    return (
      <div className="bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-2xl border border-white/20 text-xs flex flex-col items-center gap-0.5 backdrop-blur-md animate-pop">
        <span className="text-[9px] text-blue-100 uppercase font-bold tracking-wider">Pace (KM {Number(label).toFixed(1)})</span>
        <span className="text-sm font-black tracking-tight">{paceStr} /km</span>
      </div>
    );
  }
  return null;
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [stravaActivity, setStravaActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      
      const { data: wData } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (wData) {
        setWorkout(wData);
        
        if (wData.day_type === 'RUN') {
          // Fetch matching Strava activity from Supabase offline cache or localStorage
          const { data: sData } = await supabase
            .from('strava_activities')
            .select('*')
            .order('start_date', { ascending: false });

          let match: any = null;
          if (sData && sData.length > 0) {
            match = sData.find(a => wData.notes && wData.notes.includes(a.name)) || sData[0];
          } else {
            const local = localStorage.getItem('strava_cached_runs');
            if (local) {
              const parsed = JSON.parse(local);
              match = parsed.find((a:any) => wData.notes && wData.notes.includes(a.name)) || parsed[0];
            }
          }
          if (match) setStravaActivity(match);
        } else {
          const { data: exData } = await supabase
            .from('workout_exercises')
            .select('*, exercises(name, tier)')
            .eq('workout_id', id)
            .order('id', { ascending: true });
            
          if (exData) {
            setExercises(exData);
          }
        }
      }
      setLoading(false);
    };
    
    fetchWorkout();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading receipt...</div>;
  if (!workout) return <div className="p-6 text-center text-gray-500">Workout not found.</div>;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPace = (speedMs: number) => {
    if (!speedMs) return '0:00';
    const paceSeconds = 1000 / speedMs;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S+': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'S': return 'bg-gray-300/20 text-gray-200 border-gray-300/30';
      case 'A': return 'bg-success/20 text-success border-success/30';
      case 'B':
      case 'C': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      case 'F': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  let totalSets = 0;
  let bestSet = { weight: 0, reps: 0 };

  exercises.forEach(ex => {
    ex.sets.forEach((s: any) => {
      if (s.done) {
        totalSets++;
        if (s.weight > bestSet.weight || (s.weight === bestSet.weight && s.reps > bestSet.reps)) {
          bestSet = { weight: s.weight, reps: s.reps };
        }
      }
    });
  });

  const isRun = workout.day_type === 'RUN';
  let runStats: any = null;
  if (isRun && workout.notes && workout.notes.includes('"type":"run_stats"')) {
    try { runStats = JSON.parse(workout.notes); } catch(e) {}
  }

  // Extract normalized Strava details whether from Supabase DB or localStorage
  const polyline = stravaActivity?.polyline || stravaActivity?.map?.summary_polyline;
  const streamData = stravaActivity?.cached_data?.stream_data || stravaActivity?.stream_data;
  const splitsMetric = stravaActivity?.cached_data?.splits_metric || stravaActivity?.splits_metric;
  const aiSummary = stravaActivity?.cached_data?.ai_summary || stravaActivity?.cached_summary;
  const hasHR = stravaActivity?.cached_data?.has_heartrate ?? stravaActivity?.has_heartrate ?? (Number(stravaActivity?.average_heartrate) > 0);

  const getSmoothedStreamData = (rawStreams: any[]) => {
    if (!rawStreams || !rawStreams.length) return [];
    const len = rawStreams.length;
    const windowSize = 5; 
    
    return rawStreams.map((point, idx) => {
      let sumPace = 0;
      let count = 0;
      for (let w = Math.max(0, idx - windowSize); w <= Math.min(len - 1, idx + windowSize); w++) {
        const p = rawStreams[w].pace;
        if (p > 0 && p < 12.0) {
          sumPace += p;
          count++;
        }
      }
      const smoothPace = count > 0 ? sumPace / count : point.pace;
      const cleanPace = smoothPace > 9.0 ? 9.0 : smoothPace < 2.5 ? 2.5 : smoothPace;
      
      return {
        ...point,
        pace: Number(cleanPace.toFixed(2))
      };
    });
  };

  const smoothedStreamData = getSmoothedStreamData(streamData || []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative pb-28 overflow-x-hidden">
      {/* Header */}
      <div className="bg-surface px-4 py-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <button onClick={() => navigate('/workout')} className="text-gray-400 hover:text-white p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center font-bold text-white tracking-tight flex items-center gap-1.5">
          {isRun ? <Activity size={18} className="text-blue-400" /> : null}
          <span>Session Receipt</span>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
        
        {/* Top Summary Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-3xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800/80 pb-4">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${isRun ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-primary border-gray-700'}`}>
              {workout.day_type}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <CalendarDays size={14} className={isRun ? 'text-blue-400' : 'text-primary'} />
              {formatDate(workout.date)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Duration</span>
              <div className="flex items-center gap-2 text-white font-black text-xl">
                <Clock size={18} className="text-primary" />
                <span>{formatDuration(workout.duration)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Volume / Sets</span>
              <div className="flex items-center gap-2 text-white font-black text-xl">
                <Zap size={18} className="text-yellow-500" />
                <span>{totalSets} Sets</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Run Telemetry Cards (If Run Day or Strava stats exist) */}
        {(isRun || runStats || stravaActivity) ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <MapPin size={16} className="text-primary mb-1" />
                <span className="text-base font-extrabold text-white">
                  {stravaActivity ? (stravaActivity.distance / 1000).toFixed(2) : runStats?.distance || '0.00'}
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">Distance (km)</span>
              </div>
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <Zap size={16} className="text-yellow-500 mb-1" />
                <span className="text-base font-extrabold text-white">
                  {stravaActivity ? formatPace(stravaActivity.average_speed) : runStats?.pace || '0:00'}
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">Pace (/km)</span>
              </div>
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <TrendingUp size={16} className="text-green-500 mb-1" />
                <span className="text-base font-extrabold text-white">
                  {stravaActivity ? stravaActivity.total_elevation_gain : runStats?.elevation || '0'}m
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">Elevation</span>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            {polyline && (
              <div className="w-full h-64 rounded-3xl overflow-hidden bg-[#121212] border border-gray-800 relative shadow-2xl flex-shrink-0">
                <MapContainer
                  style={{ height: '100%', width: '100%' }}
                  zoom={13}
                  scrollWheelZoom={true}
                  zoomControl={false}
                  attributionControl={false}
                  className="z-10"
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <LeafletPolyline
                    positions={decodePolyline(polyline)}
                    pathOptions={{ color: '#38bdf8', weight: 4.5, opacity: 0.95 }}
                  />
                  <FitMapBounds points={decodePolyline(polyline)} />
                </MapContainer>
              </div>
            )}

            {/* Coach Alberto AI Analysis Summary Card */}
            {aiSummary && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl flex-shrink-0">
                <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide">Coach Alberto's Analysis</h4>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed space-y-3">
                  {aiSummary.split('\n').map((line: string, idx: number) => {
                    if (!line.trim()) return <div key={idx} className="h-1" />;
                    const isBoldHeader = line.startsWith('**') && line.includes('**');
                    if (isBoldHeader) {
                      const parts = line.split('**');
                      return (
                        <div key={idx} className="bg-background/80 border border-gray-800 rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm">
                          <span className="text-[11px] uppercase font-extrabold text-primary tracking-wider border-b border-gray-800/80 pb-1">{parts[1]}</span>
                          <span className="text-gray-200 text-xs mt-1 font-medium leading-relaxed">{parts[2]}</span>
                        </div>
                      );
                    }
                    return <p key={idx} className="px-1 text-gray-300 font-medium leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            )}

            {/* Pace Stream Area Chart */}
            {smoothedStreamData && smoothedStreamData.length > 0 && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 flex flex-col gap-2 shadow-xl flex-shrink-0">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Zap size={14} className="text-blue-500" />
                  <span>Pace Stream (/KM)</span>
                </h4>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={smoothedStreamData}>
                      <defs>
                        <linearGradient id="paceDetailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="distance" stroke="#4B5563" fontSize={10} tickLine={false} tickFormatter={val => `${val}km`} />
                      <YAxis reversed={true} stroke="#4B5563" fontSize={10} tickLine={false} width={38} domain={['auto', 'auto']} tickFormatter={val => `${Math.floor(val)}:${Math.floor((val - Math.floor(val)) * 60).toString().padStart(2, '0')}`} />
                      <Tooltip content={<StravaPaceTooltip />} cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="pace" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#paceDetailGrad)" activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#38bdf8' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Elevation Stream Area Chart */}
            {streamData && streamData.length > 0 && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 flex flex-col gap-2 shadow-xl flex-shrink-0">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <TrendingUp size={14} className="text-green-500" />
                  <span>Elevation Stream (Meters)</span>
                </h4>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={streamData}>
                      <defs>
                        <linearGradient id="elevDetailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="distance" stroke="#4B5563" fontSize={10} tickLine={false} tickFormatter={val => `${val}km`} />
                      <YAxis stroke="#4B5563" fontSize={10} tickLine={false} width={32} domain={['auto', 'auto']} />
                      <Tooltip content={<StravaCustomTooltip unit="m" valueLabel="Elevation" />} cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="altitude" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#elevDetailGrad)" activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#10B981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Heart Rate Stream Area Chart */}
            {hasHR && streamData && streamData.some((s: any) => s.heartrate !== undefined) && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 flex flex-col gap-2 shadow-xl flex-shrink-0">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Heart size={14} className="text-red-500" />
                  <span>Heart Rate Stream (BPM)</span>
                </h4>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={streamData}>
                      <defs>
                        <linearGradient id="hrDetailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="distance" stroke="#4B5563" fontSize={10} tickLine={false} tickFormatter={val => `${val}km`} />
                      <YAxis stroke="#4B5563" fontSize={10} tickLine={false} width={32} domain={['auto', 'auto']} />
                      <Tooltip content={<StravaCustomTooltip unit="bpm" valueLabel="Heart Rate" />} cursor={{ stroke: '#EF4444', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="heartrate" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#hrDetailGrad)" activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#EF4444' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Kilometer Splits Bar Chart */}
            {splitsMetric && splitsMetric.length > 0 && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 flex flex-col gap-2 shadow-xl flex-shrink-0">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Award size={14} className="text-purple-500" />
                  <span>Kilometer Splits (/km)</span>
                </h4>
                <div className="w-full h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={splitsMetric.map((s: any) => ({ km: s.split, pace: s.moving_time }))}>
                      <XAxis dataKey="km" stroke="#4B5563" fontSize={10} tickLine={false} />
                      <YAxis stroke="#4B5563" fontSize={10} tickLine={false} width={35} tickFormatter={val => formatDuration(val)} />
                      <Tooltip
                        contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                        formatter={(val: any) => [formatDuration(val), 'Pace']}
                      />
                      <Bar dataKey="pace" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Gym Lifting Exercises */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 flex-shrink-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Exercises Logged</h3>
            
            {exercises.map((ex, i) => {
              const completedSets = ex.sets.filter((s:any) => s.done);
              if (completedSets.length === 0) return null;
              
              return (
              <div key={ex.id} className="bg-surface rounded-2xl border border-gray-800 overflow-hidden shadow-md flex-shrink-0">
                <div className="p-3.5 border-b border-gray-800 flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-xs font-bold text-gray-400 border border-gray-800">
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-white flex-1 truncate text-sm">{ex.exercises?.name || 'Unknown Exercise'}</h4>
                  {ex.exercises?.tier && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getTierColor(ex.exercises.tier)}`}>
                      {ex.exercises.tier}
                    </span>
                  )}
                </div>
                
                <div className="p-3.5">
                  <div className="grid grid-cols-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center px-2">
                    <div>Set</div>
                    <div>kg</div>
                    <div>Reps</div>
                    <div>RPE</div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {completedSets.map((set: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-4 items-center text-center py-2 bg-gray-900/40 rounded-xl text-xs px-2 border border-gray-800/50 font-medium">
                        <div className="font-bold text-gray-400">{set.setNum}</div>
                        <div className="font-extrabold text-white">{set.weight}</div>
                        <div className="font-extrabold text-white">{set.reps}</div>
                        <div className="text-gray-400">{set.rpe}</div>
                      </div>
                    ))}
                  </div>
                  
                  {ex.notes && (
                    <div className="mt-3 bg-gray-900/60 rounded-xl p-2.5 text-xs text-gray-300 border-l-2 border-primary font-medium">
                      {ex.notes}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </motion.div>
        )}

      </div>

      {/* Summary Footer (Only for Gym Lifting sessions) */}
      {!isRun && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-gray-800 p-4 flex justify-around z-40 max-w-[390px] mx-auto shadow-lg" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total Sets</p>
            <p className="text-lg font-extrabold text-white">{totalSets}</p>
          </div>
          <div className="w-px bg-gray-800 my-1"></div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Best Set</p>
            <p className="text-lg font-extrabold text-primary">{bestSet.weight}kg × {bestSet.reps}</p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default WorkoutDetail;
