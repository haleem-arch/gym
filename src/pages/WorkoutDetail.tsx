import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
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
        
        const { data: exData } = await supabase
          .from('workout_exercises')
          .select('*, exercises(name, tier)')
          .eq('workout_id', id)
          .order('id', { ascending: true }); // keep insertion order
          
        if (exData) {
          setExercises(exData);
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
    // Fix timezone offset issues if it's stored as YYYY-MM-DD
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative pb-28">
      {/* Header */}
      <div className="bg-surface px-4 py-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => navigate('/workout')} className="text-gray-400 hover:text-white p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center font-bold text-white tracking-tight">Session Receipt</div>
        <div className="w-6"></div>
      </div>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Top Summary Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-2 py-1 rounded bg-gray-800 text-primary border border-gray-700">
              {workout.day_type}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              <CalendarDays size={14} />
              {formatDate(workout.date)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Volume</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tracking-tight">{workout.total_volume}</span>
                <span className="text-sm font-semibold text-gray-500">kg</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Duration</p>
              <div className="flex items-center gap-1 text-xl font-bold text-white tracking-tight">
                <Clock size={18} className="text-gray-400" />
                {formatDuration(workout.duration)}
              </div>
            </div>
          </div>
          
          {workout.notes && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-300 italic">"{workout.notes}"</p>
            </div>
          )}
        </motion.div>

        {/* Exercises */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Exercises Logged</h3>
          
          {exercises.map((ex, i) => {
            const completedSets = ex.sets.filter((s:any) => s.done);
            if (completedSets.length === 0) return null; // hide exercises with 0 done sets in receipt
            
            return (
            <div key={ex.id} className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-3 border-b border-gray-800 flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-xs font-bold text-gray-400">
                  {i + 1}
                </div>
                <h4 className="font-bold text-white flex-1 truncate">{ex.exercises?.name || 'Unknown Exercise'}</h4>
                {ex.exercises?.tier && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTierColor(ex.exercises.tier)}`}>
                    {ex.exercises.tier}
                  </span>
                )}
              </div>
              
              <div className="p-3">
                <div className="grid grid-cols-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center px-2">
                  <div>Set</div>
                  <div>kg</div>
                  <div>Reps</div>
                  <div>RPE</div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  {completedSets.map((set: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-4 items-center text-center py-1.5 bg-gray-900/50 rounded-lg text-sm px-2">
                      <div className="font-bold text-gray-400">{set.setNum}</div>
                      <div className="font-bold text-white">{set.weight}</div>
                      <div className="font-bold text-white">{set.reps}</div>
                      <div className="text-gray-400">{set.rpe}</div>
                    </div>
                  ))}
                </div>
                
                {ex.notes && (
                  <div className="mt-3 bg-gray-900/80 rounded p-2 text-xs text-gray-400 border-l-2 border-primary">
                    {ex.notes}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </motion.div>

      </div>

      {/* Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-gray-800 p-4 flex justify-around z-40 max-w-[390px] mx-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total Sets</p>
          <p className="text-lg font-bold text-white">{totalSets}</p>
        </div>
        <div className="w-px bg-gray-800 my-1"></div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Best Set</p>
          <p className="text-lg font-bold text-primary">{bestSet.weight}kg × {bestSet.reps}</p>
        </div>
      </div>
      
    </div>
  );
};

export default WorkoutDetail;
