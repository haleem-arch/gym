import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Droplets, FileSpreadsheet, Download, X, Check, User, LogOut, Plus, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useDiet } from '../hooks/useDiet';
import { supabase } from '../lib/supabase';

import { useSchedule } from '../hooks/useSchedule';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { exportHistoryToCsv } from '../utils/exportHistory';
import { BioStatusRing } from '../components/BioStatusRing';


const LOCAL_EXERCISES_DICTIONARY = [
  // Chest
  { id: 'dict-incline-db', name: 'Incline DB Bench Press', muscle_group: 'Chest' },
  { id: 'dict-flat-db', name: 'Flat DB Bench Press', muscle_group: 'Chest' },
  { id: 'dict-flat-bb', name: 'Flat Barbell Bench Press', muscle_group: 'Chest' },
  { id: 'dict-cable-fly-low', name: 'Cable Chest Fly (Low Pulley)', muscle_group: 'Chest' },
  { id: 'dict-cable-fly-high', name: 'Cable Chest Fly (High Pulley)', muscle_group: 'Chest' },
  { id: 'dict-pec-deck', name: 'Pec Deck Fly', muscle_group: 'Chest' },
  { id: 'dict-dips', name: 'Chest Dips (Bodyweight/Weighted)', muscle_group: 'Chest' },
  
  // Back
  { id: 'dict-weighted-pullup', name: 'Weighted Pull-up', muscle_group: 'Back' },
  { id: 'dict-chinup', name: 'Pull-up / Chin-up (Bodyweight)', muscle_group: 'Back' },
  { id: 'dict-lat-pulldown', name: 'Lat Pulldown (Wide Grip)', muscle_group: 'Back' },
  { id: 'dict-chest-sup-row', name: 'Chest-Supported Row', muscle_group: 'Back' },
  { id: 'dict-db-row', name: 'Single-Arm DB Row', muscle_group: 'Back' },
  { id: 'dict-barbell-row', name: 'Barbell Row', muscle_group: 'Back' },
  { id: 'dict-facepull', name: 'Face Pull (Rope)', muscle_group: 'Back' },
  { id: 'dict-reverse-pec-deck', name: 'Reverse Pec Deck Fly', muscle_group: 'Back' },
  
  // Shoulders
  { id: 'dict-bb-ohp', name: 'Barbell Overhead Press', muscle_group: 'Shoulders' },
  { id: 'dict-db-shoulder-press', name: 'DB Shoulder Press (Seated)', muscle_group: 'Shoulders' },
  { id: 'dict-db-lateral-raise', name: 'DB Lateral Raise', muscle_group: 'Shoulders' },
  { id: 'dict-cable-lateral-raise', name: 'Cable Lateral Raise', muscle_group: 'Shoulders' },
  { id: 'dict-incline-y-raise', name: 'Incline DB Y-Raise', muscle_group: 'Shoulders' },
  
  // Legs
  { id: 'dict-back-squat', name: 'Barbell Back Squat', muscle_group: 'Legs' },
  { id: 'dict-front-squat', name: 'Barbell Front Squat', muscle_group: 'Legs' },
  { id: 'dict-leg-press', name: 'Leg Press (Feet High)', muscle_group: 'Legs' },
  { id: 'dict-db-rdl', name: 'DB Romanian Deadlift', muscle_group: 'Legs' },
  { id: 'dict-bb-rdl', name: 'Barbell Romanian Deadlift', muscle_group: 'Legs' },
  { id: 'dict-bulgarian-split', name: 'DB Bulgarian Split Squat', muscle_group: 'Legs' },
  { id: 'dict-seated-leg-curl', name: 'Seated Leg Curl', muscle_group: 'Legs' },
  { id: 'dict-leg-extension', name: 'Leg Extension', muscle_group: 'Legs' },
  { id: 'dict-standing-calf-raise', name: 'Standing Calf Raise', muscle_group: 'Legs' },
  { id: 'dict-back-extension', name: '45° Back Extension', muscle_group: 'Legs' },
  
  // Arms
  { id: 'dict-incline-db-curl', name: 'Incline DB Curl', muscle_group: 'Arms' },
  { id: 'dict-hammer-curl', name: 'Hammer Curl', muscle_group: 'Arms' },
  { id: 'dict-zottman-curl', name: 'Zottman Curl', muscle_group: 'Arms' },
  { id: 'dict-cable-bicep-curl', name: 'Cable Bicep Curl', muscle_group: 'Arms' },
  { id: 'dict-cable-pushdown', name: 'Cable Tricep Pushdown (Straight Bar)', muscle_group: 'Arms' },
  { id: 'dict-overhead-cable-ext', name: 'Overhead Cable Tricep Extension', muscle_group: 'Arms' },
  { id: 'dict-db-skullcrusher', name: 'DB Skullcrusher', muscle_group: 'Arms' }
];

const DAY_TYPES = ['PUSH', 'PULL', 'LEGS', 'REST', 'RUN'];

const TodayView = () => {
  const navigate = useNavigate();
  const { workout, endWorkout } = useActiveWorkout();
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

  // ─── User Settings Modal states ───
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [kcalInput, setKcalInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatInput, setFatInput] = useState('');

  // Gym Program Editor states
  const [planToEdit, setPlanToEdit] = useState<'PUSH' | 'PULL' | 'LEGS'>('PUSH');
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [globalExercises, setGlobalExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Load settings when modal is opened
  useEffect(() => {
    if (!showSettingsModal) return;

    const loadUserSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setUserEmail(session.user.email || '');

      // 1. Fetch profile macro targets
      const { data: profile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile && profile.targets) {
        setKcalInput(profile.targets.kcal?.toString() || '2400');
        setProteinInput(profile.targets.protein?.toString() || '160');
        setCarbsInput(profile.targets.carbs?.toString() || '240');
        setFatInput(profile.targets.fat?.toString() || '70');
      } else {
        setKcalInput('2400');
        setProteinInput('160');
        setCarbsInput('240');
        setFatInput('70');
      }

      // 2. Fetch global exercise list for the search/add utility
      const { data: globalExs } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      const dbExs = globalExs || [];
      const dbNames = dbExs.map((e: any) => e.name.toLowerCase());
      
      // Merge with the local offline library, ensuring no duplicate exercises
      const filteredLocal = LOCAL_EXERCISES_DICTIONARY.filter(
        (localEx) => !dbNames.includes(localEx.name.toLowerCase())
      );
      
      setGlobalExercises([...dbExs, ...filteredLocal].sort((a, b) => a.name.localeCompare(b.name)));
    };

    loadUserSettings();
  }, [showSettingsModal]);

  // Load custom plan exercises when the target plan selection changes
  useEffect(() => {
    if (!showSettingsModal) return;

    const loadPlanExercises = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const planMap: Record<string, string[]> = {
        PUSH: [
          'Incline DB Bench Press',
          'Flat DB Bench Press',
          'Barbell Overhead Press',
          'DB Lateral Raise',
          'Cable Tricep Pushdown (Straight Bar)',
          'Overhead Cable Tricep Extension'
        ],
        PULL: [
          'Weighted Pull-up',
          'Lat Pulldown (Wide Grip)',
          'Chest-Supported Row',
          'Reverse Pec Deck Fly',
          'Incline DB Curl',
          'Hammer Curl'
        ],
        LEGS: [
          'Barbell Back Squat',
          'Leg Press (feet high for glutes)',
          'DB Romanian Deadlift',
          'DB Bulgarian Split Squat',
          'Seated Leg Curl',
          '45° Back Extension (BW/DB)',
          'Standing Calf Raise'
        ]
      };

      const { data: customPlan } = await supabase
        .from('user_workout_plans')
        .select('exercises')
        .eq('user_id', session.user.id)
        .eq('plan_type', planToEdit)
        .maybeSingle();

      if (customPlan && customPlan.exercises && customPlan.exercises.length > 0) {
        setCustomExercises(customPlan.exercises);
      } else {
        setCustomExercises(planMap[planToEdit] || []);
      }
    };

    loadPlanExercises();
  }, [planToEdit, showSettingsModal]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Update profiles targets
      const kcalVal = parseInt(kcalInput) || 2400;
      const proteinVal = parseInt(proteinInput) || 160;
      const carbsVal = parseInt(carbsInput) || 240;
      const fatVal = parseInt(fatInput) || 70;

      await supabase
        .from('profiles')
        .update({
          targets: { kcal: kcalVal, protein: proteinVal, carbs: carbsVal, fat: fatVal }
        })
        .eq('id', session.user.id);

      // 2. Update user_workout_plans
      const { data: existingPlan } = await supabase
        .from('user_workout_plans')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('plan_type', planToEdit)
        .maybeSingle();

      if (existingPlan) {
        await supabase
          .from('user_workout_plans')
          .update({ exercises: customExercises })
          .eq('id', existingPlan.id);
      } else {
        await supabase
          .from('user_workout_plans')
          .insert({
            user_id: session.user.id,
            plan_type: planToEdit,
            exercises: customExercises
          });
      }

      // Broadcast update events so other hooks and components update instantly
      window.dispatchEvent(new CustomEvent('plan_updated'));
      window.dispatchEvent(new CustomEvent('schedule_updated'));
      
      setShowSettingsModal(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchWorkoutStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Check if a workout has been logged in Supabase for the activeDateStr first!
      const { data: completedWorkouts } = await supabase
        .from('workouts')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr);

      if (!active) return;

      if (completedWorkouts && completedWorkouts.length > 0) {
        const hasCompleted = completedWorkouts.some((w: any) => w.status === 'completed');
        if (hasCompleted) {
          // Self-heal: Clear any local active workout state & localStorage if it's already completed today
          localStorage.removeItem('athlete_dashboard_active_workout');
          if (workout) {
            endWorkout();
          }
          setWorkoutStatus(1.0);
          return;
        }
      }

      // 2. If not completed in database, check if active workout is currently in memory
      const activeStr = localStorage.getItem('athlete_dashboard_active_workout');
      if (activeStr) {
        try {
          const parsed = JSON.parse(activeStr);
          if (parsed && isToday) {
            if (active) setWorkoutStatus(0.5);
            return;
          }
        } catch (e) {}
      }

      // 3. If not in memory, check if in_progress in database
      if (completedWorkouts && completedWorkouts.length > 0) {
        const hasInProgress = completedWorkouts.some((w: any) => w.status === 'in_progress');
        if (hasInProgress) {
          setWorkoutStatus(0.5);
        } else {
          setWorkoutStatus(0.0);
        }
      } else {
        if (workout && isToday) {
          setWorkoutStatus(0.5);
        } else {
          setWorkoutStatus(0.0);
        }
      }
    };

    fetchWorkoutStatus();
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

  const inbody = {
    weight: 79.7,
    bf: 17.2,
    muscle: 37.6,
    score: 82
  };

  return (
    <div className="px-4 py-6 flex flex-col gap-6 w-full sm:max-w-[390px] mx-auto overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Haleem's HQ</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-1.5 bg-surface hover:bg-gray-800 border border-gray-800 text-[10px] font-bold px-3 py-2 rounded-xl text-primary hover:text-blue-400 hover:border-blue-900 transition-all active:scale-95 cursor-pointer uppercase tracking-wider h-[34px]"
          >
            <FileSpreadsheet size={14} className="text-primary" />
            Export
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center bg-surface hover:bg-gray-800 border border-gray-800 rounded-xl w-[34px] h-[34px] text-primary hover:text-blue-400 hover:border-blue-900 transition-all active:scale-95 cursor-pointer"
          >
            <User size={16} />
          </button>
        </div>
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
            <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2">
              <Check size={18} />
              WORKOUT COMPLETED
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  if (workout) {
                    navigate('/workout/active');
                  } else {
                    navigate('/workout'); // Redirect to Workout Home to fetch real DB exercises
                  }
                }}
                className={`w-full h-[48px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${workout ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-blue-500/10'}`}
              >
                <Play size={18} fill="currentColor" />
                {workout ? 'RESUME SESSION' : 'START WORKOUT'}
              </button>
              
              {workout && (
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

      {/* User Settings Overlay Sheet */}
      <AnimatePresence>
        {showSettingsModal && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm animate-fade-in"
            />
            {/* Full height glassmorphic majestic panel (iOS Slide Up Sheet) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-0 z-50 w-full max-w-[390px] mx-auto bg-black flex flex-col h-full shadow-2xl overflow-hidden border-x border-gray-800"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-4 py-4 border-b border-gray-800 bg-surface/50 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm uppercase tracking-wide">User Settings</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 no-scrollbar pb-10">
                
                {/* Section 1: Baseline Diet Program */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    Diet Program (Macro Targets)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3.5 bg-surface/30 p-4 border border-white/5 rounded-2xl">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Calories (kcal)</label>
                      <input 
                        type="number" 
                        value={kcalInput}
                        onChange={(e) => setKcalInput(e.target.value)}
                        className="bg-black/40 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Protein (g)</label>
                      <input 
                        type="number" 
                        value={proteinInput}
                        onChange={(e) => setProteinInput(e.target.value)}
                        className="bg-black/40 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Carbs (g)</label>
                      <input 
                        type="number" 
                        value={carbsInput}
                        onChange={(e) => setCarbsInput(e.target.value)}
                        className="bg-black/40 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Fat (g)</label>
                      <input 
                        type="number" 
                        value={fatInput}
                        onChange={(e) => setFatInput(e.target.value)}
                        className="bg-black/40 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Gym Workout Customizer */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center pl-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Gym Program Editor
                    </h4>
                  </div>

                  <div className="bg-surface/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                    {/* Day Selection Slider Tabs */}
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      {(['PUSH', 'PULL', 'LEGS'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setPlanToEdit(t); setSearchQuery(''); }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider cursor-pointer ${
                            planToEdit === t ? 'bg-surface text-primary shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Active Exercises List in selected day */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">
                        Active {planToEdit} List ({customExercises.length})
                      </span>
                      
                      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                        {customExercises.map((exName, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold animate-fade-in"
                          >
                            <span className="truncate max-w-[200px]">{exName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomExercises(prev => prev.filter(e => e !== exName));
                              }}
                              className="text-danger/60 hover:text-danger p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Exercise autocomplete lookup */}
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">
                        Add New Exercise
                      </span>
                      <div className="relative flex items-center">
                        <Search size={13} className="absolute left-3 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search database..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 focus:border-primary/50 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none placeholder-gray-600 font-medium"
                        />
                      </div>

                      {/* Display matched autocomplete results */}
                      {searchQuery.trim().length > 0 && (
                        <div className="bg-black/60 border border-white/5 rounded-xl max-h-[140px] overflow-y-auto no-scrollbar flex flex-col p-1.5 gap-1 shadow-lg animate-fade-in">
                          {globalExercises
                            .filter(ex => 
                              ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                              !customExercises.includes(ex.name)
                            )
                            .slice(0, 5)
                            .map((ex) => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() => {
                                  setCustomExercises(prev => [...prev, ex.name]);
                                  setSearchQuery('');
                                }}
                                className="flex justify-between items-center text-left text-xs font-semibold px-3 py-2 rounded-lg hover:bg-surface/50 text-gray-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <span>{ex.name}</span>
                                <Plus size={13} className="text-primary" />
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Logout Action Row */}
                <div className="border-t border-white/5 pt-4 flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to sign out?")) {
                        await supabase.auth.signOut();
                        setShowSettingsModal(false);
                      }
                    }}
                    className="w-full bg-danger/10 hover:bg-danger/25 border border-danger/25 text-danger font-black text-[10px] uppercase py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 tracking-widest shadow-inner active:scale-[0.98]"
                  >
                    <LogOut size={13} />
                    Sign Out Account
                  </button>
                </div>
              </div>

              {/* Bottom Fixed Action Actions */}
              <div className="p-4 border-t border-gray-800 bg-surface/50 backdrop-blur-xl flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 border border-white/5 hover:bg-gray-800 text-gray-300 font-black text-xs uppercase py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer tracking-wider text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={handleSaveSettings}
                  className="flex-1 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-black text-xs uppercase py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer tracking-wider flex items-center justify-center gap-1.5"
                >
                  {savingSettings ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodayView;
