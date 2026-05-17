import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Droplets, FileSpreadsheet, Download, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useDiet } from '../hooks/useDiet';
import { supabase } from '../lib/supabase';

import { useSchedule } from '../hooks/useSchedule';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { exportHistoryToCsv } from '../utils/exportHistory';
import { BioStatusRing } from '../components/BioStatusRing';


const DAY_TYPES = ['PUSH', 'PULL', 'LEGS', 'REST', 'RUN'];

const TodayView = () => {
  const navigate = useNavigate();
  const { workout, startWorkout, endWorkout } = useActiveWorkout();
  const { log, targets, waterLogs, logWater, resetWater, activeDate, setActiveDate } = useDiet();
  
  // Need to safely get date string respecting timezone
  const getLocalDateString = (d: Date) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };
  const activeDateStr = getLocalDateString(activeDate);
  const { dayType, setDayType } = useSchedule(activeDateStr);
  const isToday = activeDate.toDateString() === new Date().toDateString();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });

  const [workoutStatus, setWorkoutStatus] = useState<number>(0.0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [showAddAnother, setShowAddAnother] = useState<boolean>(false);
  const [latestInbody, setLatestInbody] = useState<{
    weight: number | string;
    bf: number | string;
    muscle: number | string;
    score: number | string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const fetchWorkoutStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Check completed workouts for activeDateStr
      const { data: dateWorkouts } = await supabase
        .from('workouts')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr);

      if (!active) return;

      let completedList: any[] = [];
      let inProgressList: any[] = [];

      if (dateWorkouts && dateWorkouts.length > 0) {
        completedList = dateWorkouts.filter((w: any) => w.status === 'completed');
        inProgressList = dateWorkouts.filter((w: any) => w.status === 'in_progress');
      }

      setCompletedCount(completedList.length);

      // Check if there is an active workout in memory for THIS activeDateStr
      let memoryWorkout: any = null;
      const activeStr = localStorage.getItem('athlete_dashboard_active_workout');
      if (activeStr) {
        try {
          const parsed = JSON.parse(activeStr);
          if (parsed && parsed.targetDate === activeDateStr) {
            memoryWorkout = parsed;
          } else if (parsed && !parsed.targetDate && isToday) {
            memoryWorkout = parsed;
          }
        } catch (e) {}
      }

      if (memoryWorkout) {
        setWorkoutStatus(0.5); // Currently active in memory!
      } else if (completedList.length > 0) {
        setWorkoutStatus(1.0); // Completed for this day!
      } else if (inProgressList.length > 0) {
        setWorkoutStatus(0.5); // In progress in database!
      } else {
        setWorkoutStatus(0.0); // Not started for this day!
      }
    };

    const fetchLatestInbody = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: scans } = await supabase
        .from('inbody_scans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (scans && scans.length > 0 && active) {
        setLatestInbody({
          weight: scans[0].weight || 0,
          bf: scans[0].bf_percent || 0,
          muscle: scans[0].smm || 0,
          score: scans[0].score || 0
        });
      } else if (active) {
        setLatestInbody(null);
      }
    };

    fetchWorkoutStatus();
    fetchLatestInbody();
    return () => {
      active = false;
    };
  }, [activeDateStr, workout, isToday]);


  const handlePrevDay = () => setActiveDate(new Date(activeDate.getTime() - 86400000));
  const handleNextDay = () => setActiveDate(new Date(activeDate.getTime() + 86400000));
  
  const dateDisplay = isToday ? 'Today' : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Phase 1 Mock Plan Generation based on Day Type
  const generatePlan = (type: string) => {
    switch(type) {
      case 'PUSH': return { title: 'Push (Chest/Shoulders/Triceps)', exercises: ['Incline DB Press', 'Overhead Cable Extension', 'Lateral Raises', 'Machine Chest Press'] };
      case 'PULL': return { title: 'Pull (Back/Biceps)', exercises: ['Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls'] };
      case 'LEGS': return { title: 'Legs (Quads/Hams/Calves)', exercises: ['Squats', 'Leg Extension', 'Hamstring Curls', 'Calf Raises'] };
      case 'RUN': return { title: 'Cardio (Running Session)', exercises: ['Run smart', 'Control your pace', 'Focus on your breathing', 'Keep a steady rhythm'] };
      case 'REST': return { title: 'Active Recovery', exercises: ['Focus on hydration', 'Get 8 hours of sleep', 'Light stretching if needed'] };
      default: return { title: 'Workout', exercises: [] };
    }
  };
  const plan = generatePlan(dayType);

  const macros = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  
  const waterTotalMl = waterLogs?.reduce((sum: number, entry: any) => sum + (entry.amount_ml || 0), 0) || 0;
  const waterCurrent = waterTotalMl / 1000;
  const waterTarget = 3.5; // 3.5 Liters

  // Find the last logged entry from waterLogs
  const lastWaterLog = waterLogs && waterLogs.length > 0 
    ? waterLogs[waterLogs.length - 1] 
    : null;
  
  // Parse and format the last log time (e.g. 8:02 AM)
  const lastLoggedTime = lastWaterLog && lastWaterLog.created_at
    ? new Date(lastWaterLog.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : null;

  const inbody = latestInbody;

  return (
    <div className="px-4 py-6 flex flex-col gap-6 w-full sm:max-w-[390px] mx-auto overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Haleem's HQ</p>
        </div>
        <button 
          onClick={() => setShowExportModal(true)} 
          className="flex items-center gap-1.5 bg-surface hover:bg-gray-800 border border-gray-800 text-[10px] font-bold px-3 py-2 rounded-xl text-primary hover:text-blue-400 hover:border-blue-900 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <FileSpreadsheet size={14} className="text-primary" />
          Export
        </button>
      </motion.div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-surface border border-gray-800 rounded-xl p-2.5 w-full">
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
        className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-lg relative overflow-hidden flex flex-col w-full"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-primary uppercase tracking-wider">Scheduled Plan</span>
          <select 
            value={dayType} 
            onChange={(e) => setDayType(e.target.value)}
            className="bg-gray-800 text-xs font-bold text-white border border-gray-700 rounded-lg px-2.5 py-1.5 outline-none"
          >
            {DAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <h2 className="text-xl font-extrabold text-white mb-4">{plan.title}</h2>
        
        {dayType !== 'REST' && (
          <ul className="space-y-2 mb-6 text-sm text-gray-300">
            {plan.exercises.map((ex, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                <span className="text-sm font-semibold text-gray-200">{ex}</span>
              </li>
            ))}
          </ul>
        )}

        {dayType !== 'REST' && (
          workoutStatus === 1.0 ? (
            <div className="w-full flex flex-col gap-2">
              <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md">
                <Check size={18} />
                {completedCount > 1 ? `${completedCount} WORKOUTS COMPLETED TODAY` : 'WORKOUT COMPLETED'}
              </div>
              
              {!showAddAnother ? (
                <button
                  onClick={() => setShowAddAnother(true)}
                  className="w-full py-2 bg-gray-800/80 hover:bg-gray-700/80 text-xs font-bold text-gray-300 rounded-xl border border-gray-700 transition-all active:scale-95"
                >
                  + Add Another Workout to This Day
                </button>
              ) : (
                <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex flex-col gap-2 animate-fade-in">
                  <span className="text-[11px] font-bold text-gray-400 uppercase text-center block">Select Additional Plan</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['PUSH', 'PULL', 'LEGS', 'RUN'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const planMap: Record<string, { title: string; ex: any[] }> = {
                            PUSH: {
                              title: 'Push Workout',
                              ex: [
                                { id: crypto.randomUUID(), name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', tier: 'A', cue: 'Full range of motion', rationale: 'Upper chest development', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] },
                                { id: crypto.randomUUID(), name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', tier: 'A', cue: 'Control descent', rationale: 'Anterior delt focus', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] }
                              ]
                            },
                            PULL: {
                              title: 'Pull Workout',
                              ex: [
                                { id: crypto.randomUUID(), name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', tier: 'A', cue: 'Drive elbows down', rationale: 'Lat width', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] },
                                { id: crypto.randomUUID(), name: 'Chest-Supported DB Row', muscle_group: 'Back', tier: 'A', cue: 'Squeeze shoulder blades', rationale: 'Upper back thickness', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] }
                              ]
                            },
                            LEGS: {
                              title: 'Legs Workout',
                              ex: [
                                { id: crypto.randomUUID(), name: 'Leg Press (feet high for glutes)', muscle_group: 'Legs', tier: 'A', cue: 'Drive through heels', rationale: 'Glute & quad focus', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] },
                                { id: crypto.randomUUID(), name: 'DB Romanian Deadlift', muscle_group: 'Legs', tier: 'A', cue: 'Hinge at hips', rationale: 'Hamstring & glute development', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 8, done: false }] }
                              ]
                            },
                            RUN: {
                              title: 'Cardio (Running Session)',
                              ex: [
                                { id: crypto.randomUUID(), name: '5 min Warmup Walk', muscle_group: 'Cardio', tier: 'A', cue: 'Easy pace', rationale: 'Warm up hips and calves', restTime: 60, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 6, done: false }] },
                                { id: crypto.randomUUID(), name: 'Outdoor Run / Treadmill (Zone 2)', muscle_group: 'Cardio', tier: 'A', cue: 'Conversational pace', rationale: 'Aerobic base building', restTime: 120, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 7, done: false }] },
                                { id: crypto.randomUUID(), name: '5 min Cooldown Walk', muscle_group: 'Cardio', tier: 'A', cue: 'Bring heart rate down', rationale: 'Recovery', restTime: 60, notes: '', sets: [{ setNum: 1, weight: 0, reps: 0, rpe: 5, done: false }] }
                              ]
                            }
                          };
                          const selected = planMap[type];
                          startWorkout(type, selected.title, selected.ex, activeDateStr);
                          navigate('/workout/active');
                        }}
                        className={`py-2 px-1 text-[11px] font-extrabold rounded-lg border transition-all active:scale-95 ${type === 'RUN' ? 'bg-blue-900/40 border-blue-500/40 text-blue-300 hover:bg-blue-800/50' : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowAddAnother(false)} className="text-[10px] text-gray-500 hover:text-gray-400 mt-1 underline text-center">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  if (workout && (workout.targetDate === activeDateStr || (!workout.targetDate && isToday))) {
                    navigate('/workout/active');
                  } else {
                    navigate('/workout', { state: { targetDate: activeDateStr } }); // Redirect to Workout Home to fetch real DB exercises for targetDate
                  }
                }}
                className={`w-full h-[48px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${workout && (workout.targetDate === activeDateStr || (!workout.targetDate && isToday)) ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-blue-500/10'}`}
              >
                <Play size={18} fill="currentColor" />
                {workout && (workout.targetDate === activeDateStr || (!workout.targetDate && isToday)) ? 'RESUME SESSION' : 'START WORKOUT'}
              </button>
              
              {workout && (workout.targetDate === activeDateStr || (!workout.targetDate && isToday)) && (
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to discard this active session and start fresh?")) {
                      localStorage.removeItem('athlete_dashboard_active_workout');
                      endWorkout();
                      
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) {
                        await supabase.from('workouts').delete().eq('user_id', session.user.id).eq('status', 'in_progress');
                      }
                      setWorkoutStatus(0.0);
                    }
                  }}
                  className="text-[11px] font-bold text-gray-500 hover:text-danger transition-colors py-1 px-3 mt-0.5 active:scale-95 animate-fade-in"
                >
                  Restart Session & Start Fresh
                </button>
              )}
            </div>
          )
        )}
      </motion.div>

      {/* Subtle Separation Divider */}
      <div className="w-full border-t border-white/10 my-1" />

      {/* DETAILS Header & Bottom Cards */}
      <div className="flex flex-col gap-4 w-full">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Details</span>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Nutrition Card (4 progress bars) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl p-4 border border-gray-800 flex flex-col justify-between cursor-pointer hover:border-gray-700 transition-colors w-full"
            onClick={() => navigate('/diet')}
          >
            <div className="flex items-center gap-2 text-gray-400 mb-3">
              <Utensils size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">Nutrition</span>
            </div>
            <div className="flex flex-col gap-3">
              {/* Calories */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 leading-none">
                  <span className="font-semibold text-gray-300">Calories</span>
                  <span className="text-gray-450 font-bold">{Math.round(macros.kcal)}/{targets.kcal}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#F97316] h-1.5 rounded-full" style={{ width: `${Math.min((macros.kcal/targets.kcal)*100, 100)}%` }}></div>
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 leading-none">
                  <span className="font-semibold text-gray-300">Protein</span>
                  <span className="text-gray-450 font-bold">{Math.round(macros.protein)}/{targets.protein}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-success h-1.5 rounded-full" style={{ width: `${Math.min((macros.protein/targets.protein)*100, 100)}%` }}></div>
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 leading-none">
                  <span className="font-semibold text-gray-300">Carbs</span>
                  <span className="text-gray-450 font-bold">{Math.round(macros.carbs)}/{targets.carbs || 250}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#38BDF8] h-1.5 rounded-full" style={{ width: `${Math.min((macros.carbs/(targets.carbs || 250))*100, 100)}%` }}></div>
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 leading-none">
                  <span className="font-semibold text-gray-300">Fat</span>
                  <span className="text-gray-450 font-bold">{Math.round(macros.fat)}/{targets.fat || 75}g</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#A78BFA] h-1.5 rounded-full" style={{ width: `${Math.min((macros.fat/(targets.fat || 75))*100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hydration Card (Prominent Button & Timestamp) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl border border-gray-800 flex flex-col overflow-hidden justify-between w-full"
          >
             <SwipeToDeleteRow onDelete={resetWater} threshold={60} backgroundRounded="rounded-2xl">
               <div className="p-4 flex flex-col justify-between h-full bg-surface">
                 <div className="flex items-center justify-between text-gray-400 mb-2">
                   <div className="flex items-center gap-2">
                     <Droplets size={16} />
                     <span className="text-sm font-bold uppercase tracking-wider">Hydration</span>
                   </div>
                 </div>
                 <div className="my-auto flex items-center justify-center py-3">
                   <span className="text-2xl font-black text-white">{waterCurrent.toFixed(1)}<span className="text-sm text-gray-500 font-normal">/{waterTarget}L</span></span>
                 </div>
                 <div className="w-full flex flex-col items-center">
                   <button 
                     onClick={() => logWater(0.25)} 
                     className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md mt-1 flex items-center justify-center gap-1.5"
                   >
                     + 250ml WATER
                   </button>
                   <span className="text-xs font-semibold text-gray-500 mt-2 block text-center leading-none">
                     {lastLoggedTime ? `Last logged: ${lastLoggedTime}` : 'No logs today'}
                   </span>
                 </div>
               </div>
             </SwipeToDeleteRow>
          </motion.div>
        </div>

        {/* InBody Snapshot */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
           className="bg-surface rounded-2xl p-4 border border-gray-800 animate-fade-in w-full"
        >
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3.5 block">Latest InBody Scan</span>
          {inbody ? (
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div>
                <span className="block text-lg font-extrabold text-white">{inbody.weight}</span>
                <span className="text-xs font-semibold text-gray-500 mt-0.5 block">Weight (kg)</span>
              </div>
              <div>
                 <span className="block text-lg font-extrabold text-danger">{inbody.bf}%</span>
                <span className="text-xs font-semibold text-gray-500 mt-0.5 block">Body Fat</span>
              </div>
              <div>
                 <span className="block text-lg font-extrabold text-success">{inbody.muscle}</span>
                <span className="text-xs font-semibold text-gray-500 mt-0.5 block">SMM (kg)</span>
              </div>
               <div>
                 <span className="block text-lg font-extrabold text-primary">{inbody.score}</span>
                <span className="text-xs font-semibold text-gray-500 mt-0.5 block">Score</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 bg-gray-900/40 rounded-xl border border-gray-800/80">
              <p className="text-xs text-gray-400 mb-1.5">No InBody scans logged yet</p>
              <button onClick={() => navigate('/inbody')} className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
                Log First Scan →
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Subtle Separation Divider */}
      <div className="w-full border-t border-white/10 my-1" />

      {/* TODAY'S SCORE Header (Moved to bottom) */}
      <div className="flex flex-col gap-1.5 w-full animate-fade-in">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Today's Score</span>
        <BioStatusRing 
          kcalPct={targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0}
          waterPct={waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0}
          workoutStatus={workoutStatus}
          isRestDay={dayType === 'REST'}
        />
      </div>
      
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

      {/* Date Range Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            {/* Modal Bottom Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-surface border-t border-gray-800 rounded-t-3xl p-6 z-50 flex flex-col gap-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-950 text-primary rounded-lg border border-blue-900">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Export History</h3>
                    <p className="text-[10px] text-gray-400">Download Excel compatible CSV</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date</span>
                  <input 
                    type="date" 
                    value={startDateStr} 
                    onChange={(e) => setStartDateStr(e.target.value)}
                    max={endDateStr}
                    className="bg-gray-800 border border-gray-700 text-white font-bold rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date</span>
                  <input 
                    type="date" 
                    value={endDateStr} 
                    onChange={(e) => setEndDateStr(e.target.value)}
                    min={startDateStr}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-gray-800 border border-gray-700 text-white font-bold rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <button 
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  const res = await exportHistoryToCsv(startDateStr, endDateStr);
                  setExporting(false);
                  if (res.success) {
                    setShowExportModal(false);
                  } else {
                    alert(`Failed to export: ${res.error}`);
                  }
                }}
                className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-white text-xs cursor-pointer"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    GENERATING SPREADSHEET...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    GENERATE & DOWNLOAD
                  </>
                )}
              </button>

              <div className="text-[9px] text-gray-500 text-center leading-normal">
                ✓ Fully optimized for Microsoft Excel & Google Sheets<br />
                ✓ Arabic presets and detailed sets are preserved in UTF-8
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodayView;
