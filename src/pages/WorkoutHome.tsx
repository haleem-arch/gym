import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { Play, History, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout } = useActiveWorkout();
  
  const [pastWorkouts, setPastWorkouts] = useState<any[]>([]);
  const [todayPlan, setTodayPlan] = useState<any>({
    type: 'PUSH',
    title: 'Push (Chest/Shoulders/Triceps)',
    exercises: [] // Will be populated with real DB exercises
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Wait for auto-login in App.tsx

      // 1. Fetch Past Workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (workoutsData) {
        setPastWorkouts(workoutsData);
      }

      // 2. Fetch real exercises for the "Start Today's Workout" button
      // We grab 4 random exercises to simulate a plan
      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .limit(4);
        
      if (exData && exData.length > 0) {
        setTodayPlan((prev: any) => ({ ...prev, exercises: exData }));
      }
      
      setLoading(false);
    };
    
    // Slight delay to ensure App.tsx auth completes
    const timeout = setTimeout(() => loadData(), 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleStartWorkout = () => {
    if (workout) {
      navigate('/workout/active');
    } else {
      if (todayPlan.exercises.length === 0) {
        alert("Loading exercises, please wait a second...");
        return;
      }
      navigate('/workout/active', { state: { startNew: true, plan: todayPlan } });
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  };

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <button 
          onClick={handleStartWorkout}
          className={`w-full font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors active:scale-[0.98] shadow-lg ${
            workout ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 'bg-primary text-white shadow-primary/20'
          }`}
        >
          {workout ? (
            <>
              <div className="flex items-center gap-2 text-xl">
                <Play size={20} fill="currentColor" />
                RESUME SESSION
              </div>
              <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">You have an active {workout.dayType} workout</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xl">
                <Play size={20} fill="currentColor" />
                START TODAY'S WORKOUT
              </div>
              <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">Scheduled: {todayPlan.type}</span>
            </>
          )}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <History size={18} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Past Sessions</h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading history...</div>
        ) : pastWorkouts.length === 0 ? (
          <div className="text-center text-gray-500 py-4 bg-surface border border-gray-800 rounded-xl">No workouts logged yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastWorkouts.map((session) => (
              <div 
                key={session.id} 
                onClick={() => navigate(`/workout/${session.id}`)}
                className="bg-surface rounded-xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">{formatDate(session.date)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-800 text-gray-300 border-gray-700">
                      {session.day_type}
                    </span>
                    <span className="text-sm font-bold text-white">{session.total_volume} kg</span>
                    <span className="text-sm text-gray-400 border-l border-gray-700 pl-2">{formatDuration(session.duration)}</span>
                  </div>
                </div>
                <button className="text-primary hover:text-blue-400 transition-colors p-2 bg-gray-900 rounded-full">
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkoutHome;
