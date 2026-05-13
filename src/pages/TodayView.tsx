import { motion } from 'framer-motion';
import { Play, Utensils, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';

const TodayView = () => {
  const navigate = useNavigate();
  const { workout } = useActiveWorkout();
  // Mock data for Phase 1 UI building
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const plan = {
    type: 'PUSH',
    title: 'Push (Chest/Shoulders/Triceps)',
    exercises: ['Incline DB Press', 'Overhead Cable Extension', 'Lateral Raises', 'Machine Chest Press']
  };

  const macros = {
    cals: { current: 950, target: 2400 },
    protein: { current: 95, target: 160 },
  };

  const inbody = {
    weight: 79.7,
    bf: 17.2,
    muscle: 37.6,
    score: 82
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Haleem 💪</h1>
        <p className="text-sm text-gray-400 mt-1">{today}</p>
      </motion.div>

      {/* Today's Plan Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Today's Focus</span>
        <h2 className="text-xl font-bold text-white mb-4">{plan.title}</h2>
        
        <ul className="space-y-2 mb-6 text-sm text-gray-300">
          {plan.exercises.map((ex, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              {ex}
            </li>
          ))}
        </ul>

        <button 
          onClick={() => {
            if (workout) {
              navigate('/workout/active');
            } else {
              navigate('/workout'); // Redirect to Workout Home to fetch real DB exercises
            }
          }}
          className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${workout ? 'bg-yellow-500 text-black' : 'bg-primary hover:bg-blue-600 text-white'}`}
        >
          <Play size={18} fill="currentColor" />
          {workout ? 'RESUME SESSION' : 'START WORKOUT'}
        </button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl p-4 border border-gray-800 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Utensils size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Nutrition</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Calories</span>
              <span className="text-gray-400">{macros.cals.current} / {macros.cals.target}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-success h-1.5 rounded-full" style={{ width: `${(macros.cals.current/macros.cals.target)*100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Protein</span>
              <span className="text-gray-400">{macros.protein.current} / {macros.protein.target}g</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(macros.protein.current/macros.protein.target)*100}%` }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl p-4 border border-gray-800 flex flex-col justify-between"
        >
           <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Droplets size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Hydration</span>
          </div>
          <div className="flex-1 flex items-end justify-center pb-2">
             <span className="text-2xl font-bold">1.5<span className="text-sm text-gray-500 font-normal"> / 3L</span></span>
          </div>
           <button className="w-full bg-gray-800 hover:bg-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors">
            + LOG WATER
          </button>
        </motion.div>
      </div>

      {/* InBody Snapshot */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
         className="bg-surface rounded-2xl p-4 border border-gray-800"
      >
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">Latest InBody Scan</span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="block text-lg font-bold text-white">{inbody.weight}</span>
            <span className="text-[10px] text-gray-500">Weight (kg)</span>
          </div>
          <div>
             <span className="block text-lg font-bold text-danger">{inbody.bf}%</span>
            <span className="text-[10px] text-gray-500">Body Fat</span>
          </div>
          <div>
             <span className="block text-lg font-bold text-success">{inbody.muscle}</span>
            <span className="text-[10px] text-gray-500">SMM (kg)</span>
          </div>
           <div>
             <span className="block text-lg font-bold text-primary">{inbody.score}</span>
            <span className="text-[10px] text-gray-500">Score</span>
          </div>
        </div>
      </motion.div>
      
      {/* Dev Reset Button */}
      <div className="mt-2 text-center">
        <button 
          onClick={() => {
            if (window.confirm("This will clear all local app data and force update. Continue?")) {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  } 
                });
              }
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] text-gray-600 uppercase font-bold tracking-widest hover:text-danger transition-colors p-2"
        >
          Force Reset App Cache
        </button>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-4"></div>
    </div>
  );
};

export default TodayView;
