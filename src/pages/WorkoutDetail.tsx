import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, CalendarDays, Zap, TrendingUp, Activity, MapPin, ChevronLeft, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { DumbbellLoader } from '../components/DumbbellLoader';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userWeight, setUserWeight] = useState<number>(75);

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
        
        // Fetch user weight
        try {
          const { data: scans } = await supabase
            .from('inbody_scans')
            .select('weight')
            .eq('user_id', wData.user_id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (scans && scans.length > 0 && scans[0].weight) {
            setUserWeight(parseFloat(scans[0].weight));
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('targets')
              .eq('id', wData.user_id)
              .maybeSingle();
              
            if (profile?.targets?.weight) {
              setUserWeight(parseFloat(profile.targets.weight));
            }
          }
        } catch (e) {
          console.error("Error fetching user weight:", e);
        }

        if (wData.day_type !== 'RUN') {
          const { data: exData } = await supabase
            .from('workout_exercises')
            .select('*, exercises(name, tier)')
            .eq('workout_id', id)
            .order('created_at', { ascending: true });
            
          if (exData) {
            setExercises(exData);
          }
        }
      }
      setLoading(false);
    };
    
    fetchWorkout();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <DumbbellLoader label="Loading receipt..." size={100} />
      </div>
    );
  }
  if (!workout) return <div className="p-6 text-center text-gray-500">Workout not found.</div>;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ') || '0m';
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

  const approxCalories = (() => {
    if (!runStats || !runStats.distance_km) return 0;
    const dist = parseFloat(runStats.distance_km) || 0;
    return Math.round(userWeight * dist * 1.036);
  })();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative pb-28 overflow-x-hidden text-gray-200">
      {/* Header */}
      <div className="bg-[#07080e]/95 backdrop-blur-md px-4 pb-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-md" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer">
          <ChevronLeft size={16} className="text-gray-400" />
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
          <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-4">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${isRun ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-primary border-gray-700'}`}>
              {workout.day_type}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <CalendarDays size={14} className={isRun ? 'text-blue-400' : 'text-primary'} />
              {formatDate(workout.date)}
            </div>
          </div>

          {workout.name && (
            <h2 className="text-lg font-black text-white mb-4 pl-1 tracking-tight">{workout.name}</h2>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Duration</span>
              <div className="flex items-center gap-2 text-white font-black text-xl">
                <Clock size={18} className="text-primary" />
                <span>{formatDuration(workout.duration)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">{isRun ? "Distance" : "Volume / Sets"}</span>
              <div className="flex items-center gap-2 text-white font-black text-xl">
                {isRun ? (
                  <>
                    <MapPin size={18} className="text-blue-400" />
                    <span>{runStats?.distance_km || '0.00'} km</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} className="text-yellow-500" />
                    <span>{totalSets} Sets</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Run Telemetry Cards (If Run Day) */}
        {isRun ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <MapPin size={16} className="text-primary mb-1" />
                <span className="text-base font-extrabold text-white">
                  {runStats?.distance_km || '0.00'}
                </span>
                <span className="text-[9px] text-gray-555 uppercase font-bold tracking-wider mt-0.5">Distance (km)</span>
              </div>
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <Zap size={16} className="text-yellow-500 mb-1" />
                <span className="text-base font-extrabold text-white">
                  {runStats?.pace || '0:00'}
                </span>
                <span className="text-[9px] text-gray-555 uppercase font-bold tracking-wider mt-0.5">Pace (/km)</span>
              </div>
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg">
                <TrendingUp size={16} className="text-green-500 mb-1" />
                <span className="text-base font-extrabold text-white">
                  {runStats?.elevation_m || '0'}m
                </span>
                <span className="text-[9px] text-gray-555 uppercase font-bold tracking-wider mt-0.5">Elevation</span>
              </div>
              <div className="bg-surface border border-gray-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-lg relative">
                <Flame size={16} className="text-orange-500 mb-1" />
                <span className="text-base font-extrabold text-white">
                  {approxCalories} kcal
                </span>
                <span className="text-[9px] text-gray-555 uppercase font-bold tracking-wider mt-0.5">Approx Calories</span>
                <span className="text-[8px] text-red-500 font-bold mt-1 block">not very accurate</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Gym Lifting Exercises */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 flex-shrink-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mt-2">Exercises Logged</h3>
            
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
