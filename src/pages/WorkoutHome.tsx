import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { Play, History, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout } = useActiveWorkout();

  // Mock schedule data (would be fetched from Supabase)
  const todayPlan = {
    type: 'PUSH',
    title: 'Push (Chest/Shoulders/Triceps)',
    exercises: ['Incline DB Press', 'Overhead Cable Extension', 'Lateral Raises', 'Machine Chest Press']
  };

  // Mock history data (would be fetched from Supabase)
  const pastWorkouts = [
    { id: 1, date: 'Mon, May 11', type: 'LEGS', volume: '12,400', duration: '55m' },
    { id: 2, date: 'Sat, May 9', type: 'PULL', volume: '9,850', duration: '48m' },
    { id: 3, date: 'Wed, May 6', type: 'PUSH', volume: '10,200', duration: '51m' },
  ];

  const handleStartWorkout = () => {
    if (workout) {
      navigate('/workout/active');
    } else {
      navigate('/workout/active', { state: { startNew: true, plan: todayPlan } });
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
      </motion.div>

      {/* Start Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
      >
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

      {/* History List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="mt-2"
      >
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <History size={18} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Past Sessions</h2>
        </div>

        <div className="flex flex-col gap-3">
          {pastWorkouts.map((session) => (
            <div key={session.id} className="bg-surface rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">{session.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-800 text-gray-300 border-gray-700">
                    {session.type}
                  </span>
                  <span className="text-sm font-bold text-white">{session.volume} kg</span>
                  <span className="text-sm text-gray-400 border-l border-gray-700 pl-2">{session.duration}</span>
                </div>
              </div>
              <button className="text-primary hover:text-blue-400 transition-colors p-2 bg-gray-900 rounded-full">
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Spacer for bottom nav */}
      <div className="h-4"></div>
    </div>
  );
};

export default WorkoutHome;
