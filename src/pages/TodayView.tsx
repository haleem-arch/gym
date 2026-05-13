import { motion } from 'framer-motion';
import { Play, Utensils, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useDiet } from '../hooks/useDiet';

import { useSchedule } from '../hooks/useSchedule';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';

const DAY_TYPES = ['PUSH', 'PULL', 'LEGS', 'REST', 'RUN'];

const TodayView = () => {
  const navigate = useNavigate();
  const { workout } = useActiveWorkout();
  const { log, targets, waterLogs, logWater, resetWater, activeDate, setActiveDate } = useDiet();
  
  // Need to safely get date string respecting timezone
  const getLocalDateString = (d: Date) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };
  const activeDateStr = getLocalDateString(activeDate);
  const { dayType, setDayType } = useSchedule(activeDateStr);

  const handlePrevDay = () => setActiveDate(new Date(activeDate.getTime() - 86400000));
  const handleNextDay = () => setActiveDate(new Date(activeDate.getTime() + 86400000));
  
  const isToday = activeDate.toDateString() === new Date().toDateString();
  const dateDisplay = isToday ? 'Today' : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Phase 1 Mock Plan Generation based on Day Type
  const generatePlan = (type: string) => {
    switch(type) {
      case 'PUSH': return { title: 'Push (Chest/Shoulders/Triceps)', exercises: ['Incline DB Press', 'Overhead Cable Extension', 'Lateral Raises', 'Machine Chest Press'] };
      case 'PULL': return { title: 'Pull (Back/Biceps)', exercises: ['Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls'] };
      case 'LEGS': return { title: 'Legs (Quads/Hams/Calves)', exercises: ['Squats', 'Leg Extension', 'Hamstring Curls', 'Calf Raises'] };
      case 'RUN': return { title: 'Cardio (Running Session)', exercises: ['5K Run', 'Stretching'] };
      case 'REST': return { title: 'Active Recovery', exercises: ['Walking', 'Mobility Work'] };
      default: return { title: 'Workout', exercises: [] };
    }
  };
  const plan = generatePlan(dayType);

  const macros = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  
  const waterTotalMl = waterLogs?.reduce((sum: number, entry: any) => sum + (entry.amount_ml || 0), 0) || 0;
  const waterCurrent = waterTotalMl / 1000;
  const waterTarget = 3; // 3 Liters

  const inbody = {
    weight: 79.7,
    bf: 17.2,
    muscle: 37.6,
    score: 82
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Haleem's HQ</p>
        </div>
      </motion.div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-surface border border-gray-800 rounded-xl p-2">
        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="font-bold text-lg">{dateDisplay}</span>
        <button onClick={handleNextDay} className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Today's Plan Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-lg relative overflow-hidden flex flex-col"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Scheduled Plan</span>
          <select 
            value={dayType} 
            onChange={(e) => setDayType(e.target.value)}
            className="bg-gray-800 text-xs font-bold text-white border border-gray-700 rounded-lg px-2 py-1 outline-none"
          >
            {DAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <h2 className="text-xl font-bold text-white mb-4">{plan.title}</h2>
        
        {dayType !== 'REST' && (
          <ul className="space-y-2 mb-6 text-sm text-gray-300">
            {plan.exercises.map((ex, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                {ex}
              </li>
            ))}
          </ul>
        )}

        {dayType !== 'REST' && (
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
        )}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl p-4 border border-gray-800 flex flex-col justify-between cursor-pointer"
          onClick={() => navigate('/diet')}
        >
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Utensils size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Nutrition</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Calories</span>
              <span className="text-gray-400">{Math.round(macros.kcal)} / {targets.kcal}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-success h-1.5 rounded-full" style={{ width: `${Math.min((macros.kcal/targets.kcal)*100, 100)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Protein</span>
              <span className="text-gray-400">{Math.round(macros.protein)} / {targets.protein}g</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min((macros.protein/targets.protein)*100, 100)}%` }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl border border-gray-800 flex flex-col overflow-hidden"
        >
           <SwipeToDeleteRow onDelete={resetWater} threshold={60} backgroundRounded="rounded-2xl">
             <div className="p-4 flex flex-col h-full bg-surface">
               <div className="flex items-center justify-between text-gray-400 mb-2">
                 <div className="flex items-center gap-2">
                   <Droplets size={16} />
                   <span className="text-xs font-medium uppercase tracking-wider">Hydration</span>
                 </div>
               </div>
               <div className="flex-1 flex items-end justify-center pb-2">
                 <span className="text-2xl font-bold">{waterCurrent.toFixed(1)}<span className="text-sm text-gray-500 font-normal"> / {waterTarget}L</span></span>
               </div>
               <button 
                 onClick={() => logWater(0.25)} 
                 className="w-full bg-gray-800 hover:bg-gray-700 active:scale-95 text-xs font-semibold py-2 rounded-lg transition-all"
               >
                 + 250ml WATER
               </button>
             </div>
           </SwipeToDeleteRow>
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
