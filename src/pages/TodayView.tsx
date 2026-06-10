import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Droplets, FileSpreadsheet, Download, X, Check, Activity, Target, LogOut, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useDiet } from '../hooks/useDiet';
import { supabase } from '../lib/supabase';

import { useSchedule } from '../hooks/useSchedule';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { exportHistoryToCsv } from '../utils/exportHistory';
import { BioStatusRing } from '../components/BioStatusRing';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PlanCardSkeleton, NutritionCardSkeleton, HydrationCardSkeleton, InBodyCardSkeleton } from '../components/SkeletonLoaders';

const RippleButton = ({ onClick, className, children }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, className?: string, children: React.ReactNode }) => {
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    
    setRipples(prev => [...prev, newRipple]);
    if (onClick) onClick(e);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/40 rounded-full ripple-anim pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginTop: -50,
            marginLeft: -50,
          }}
        />
      ))}
      {children}
    </button>
  );
};

const TodayView = () => {
  const debugLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_loading') === 'true';
  // Instant Offline Reconnect state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isRunningInElectron = typeof window !== 'undefined' && (!!(window as any).electronAPI || navigator.userAgent.includes('Electron'));
  const navigate = useNavigate();
  const [userDisplayName, setUserDisplayName] = useState('');
  const [isHaleem, setIsHaleem] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let isUserHaleem = session.user.email?.toLowerCase().startsWith('haleem') || false;
        if (!isUserHaleem) {
          const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', session.user.id).maybeSingle();
          if (profile?.role === 'coach') {
            isUserHaleem = true;
          }
          if (profile?.display_name) {
            setUserDisplayName(profile.display_name);
          }
        } else {
          setUserDisplayName('Haleem');
        }
        setIsHaleem(isUserHaleem);
      }
    };
    fetchProfile();
  }, []);


  const { workout, endWorkout } = useActiveWorkout();
  const { log, targets, waterLogs, logWater, resetWater, activeDate, setActiveDate, waterGoalMl, loading: dietLoadingRaw } = useDiet();
  const dietLoading = debugLoading || dietLoadingRaw;
  
  const getLocalDateString = (d: Date) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };
  const activeDateStr = getLocalDateString(activeDate);

  const { dayType, setDayType, loading: scheduleLoadingRaw } = useSchedule(activeDateStr);
  const scheduleLoading = debugLoading || scheduleLoadingRaw;
  const [showTargetsModal, setShowTargetsModal] = useState(false);
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
  const [completedWorkoutsList, setCompletedWorkoutsList] = useState<any[]>([]);
  const [hybridLiftingType, setHybridLiftingType] = useState('PUSH');
  const [latestInbody, setLatestInbody] = useState<{
    weight: number | string;
    bf: number | string;
    muscle: number | string;
    score: number | string;
  } | null>(null);
  const [workoutTemplates, setWorkoutTemplates] = useState<any[]>([]);

  const [templatesLoading, setTemplatesLoading] = useState<boolean>(debugLoading || true);
  const [statusLoading, setStatusLoading] = useState<boolean>(debugLoading || true);
  const [inbodyLoading, setInbodyLoading] = useState<boolean>(debugLoading || true);

  useEffect(() => {
    let active = true;
    const fetchWorkoutStatus = async () => {
      if (active) setStatusLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (active && !debugLoading) setStatusLoading(false);
          return;
        }

        const { data: completedWorkouts } = await supabase
          .from('workouts')
          .select('id, status, day_type, notes')
          .eq('user_id', session.user.id)
          .eq('date', activeDateStr);

        if (!active) return;

        const workoutsList = completedWorkouts || [];
        setCompletedWorkoutsList(workoutsList);

        const completedGym = workoutsList.find((w: any) => w.status === 'completed' && w.day_type !== 'RUN' && w.day_type !== 'REST');
        if (completedGym) {
          setHybridLiftingType(completedGym.day_type);
        }

        let resolvedStatus = 0.0;

        if (dayType === 'RUN + GYM') {
          const hasRun = workoutsList.some((w: any) => w.status === 'completed' && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
          const hasGym = workoutsList.some((w: any) => w.status === 'completed' && w.day_type !== 'RUN' && w.day_type !== 'REST');
          
          if (hasRun && hasGym) {
            if (isToday) {
              localStorage.removeItem('athlete_dashboard_active_workout');
              if (workout) endWorkout();
            }
            resolvedStatus = 1.0;
          } else if (hasRun || hasGym) {
            resolvedStatus = 0.5;
          } else {
            resolvedStatus = 0.0;
          }
        } else if (workoutsList.length > 0 && workoutsList.some((w: any) => w.status === 'completed')) {
          if (isToday) {
            localStorage.removeItem('athlete_dashboard_active_workout');
            if (workout) endWorkout();
          }
          resolvedStatus = 1.0;
        } else if (workoutsList.some((w: any) => w.status === 'in_progress')) {
          resolvedStatus = 0.5;
        } else {
          const activeStr = localStorage.getItem('athlete_dashboard_active_workout');
          let foundActiveLocal = false;
          if (activeStr) {
            try {
              const parsed = JSON.parse(activeStr);
              if (parsed && parsed.date === activeDateStr) {
                resolvedStatus = 0.5;
                foundActiveLocal = true;
              }
            } catch (e) {}
          }
          if (!foundActiveLocal) {
            if (workout && workout.date === activeDateStr) {
              resolvedStatus = 0.5;
            } else {
              resolvedStatus = 0.0;
            }
          }
        }

        setWorkoutStatus(resolvedStatus);
      } catch (err) {
        console.error("Error fetching workout status:", err);
      } finally {
        if (active && !debugLoading) setStatusLoading(false);
      }
    };

    const fetchLatestInbody = async () => {
      if (active) setInbodyLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (active && !debugLoading) setInbodyLoading(false);
          return;
        }

        const { data: scans } = await supabase
          .from('inbody_scans')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);

        if (!active) return;

        const scansList = scans || [];
        if (scansList.length > 0) {
          setLatestInbody({
            weight: scansList[0].weight || 0,
            bf: scansList[0].bf_percent || 0,
            muscle: scansList[0].smm || 0,
            score: scansList[0].score || 0
          });
        } else {
          setLatestInbody(null);
        }
      } catch (err) {
        console.error("Error fetching InBody scans:", err);
      } finally {
        if (active && !debugLoading) setInbodyLoading(false);
      }
    };

    fetchWorkoutStatus();
    fetchLatestInbody();

    return () => { 
      active = false; 
    };
  }, [activeDateStr, workout, isToday, dayType]);

  useEffect(() => {
    localStorage.setItem('athlete_dashboard_selected_date', activeDateStr);
  }, [activeDateStr]);

  useEffect(() => {
    let active = true;
    const fetchWorkoutTemplates = async () => {
      if (active) setTemplatesLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (active && !debugLoading) setTemplatesLoading(false);
          return;
        }
        
        const { data: plansData } = await supabase
          .from('user_workout_plans')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (!active) return;
        
        let activePlans = plansData || [];
        // Seed default splits (PUSH/PULL/LEGS) only if user has NO templates at all
        if (activePlans.length === 0) {
          const defaultExercises: Record<string, string[]> = {
            PUSH: ['Incline DB Bench Press (45 Degree)', 'DB Shoulder Press (seated neutral)', 'Incline DB Y-Raise (20-30 Degree)', 'Cable Chest Fly (low pulley)', 'Overhead Cable Extension (rope)', 'DB Lateral Raise (elbow-lead)'],
            PULL: ['Lat Pulldown (wide grip)', 'Chest-Supported DB Row', 'Sideways One-Arm Rear Delt Fly', 'Face Pull (rope eye height)', 'Incline DB Curl - Bayesian', 'Zottman Curl'],
            LEGS: ['Leg Press (feet high for glutes)', 'DB Romanian Deadlift', 'DB Bulgarian Split Squat', 'Seated Leg Curl', '45 Degree Back Extension (BW/DB)', 'Standing Calf Raise']
          };
          const defaultInserts = ['PUSH', 'PULL', 'LEGS'].map(split => ({
            user_id: session.user.id,
            plan_type: split,
            exercises: defaultExercises[split].map((name: string, i: number) => ({
              id: `default-${split.toLowerCase()}-${i}`,
              name,
              sets: 3,
              rest: 120
            }))
          }));
          const { data: seededData } = await supabase
            .from('user_workout_plans')
            .insert(defaultInserts)
            .select();
          if (seededData) {
            activePlans = [...activePlans, ...seededData];
          }
        }
        
        setWorkoutTemplates(activePlans);
        
        // Update hybridLiftingType to a valid loaded template plan_type if the current one is PUSH but PUSH doesn't exist anymore
        if (activePlans.length > 0) {
          const types = activePlans.map(p => p.plan_type);
          setHybridLiftingType(prev => {
            if (types.includes(prev)) return prev;
            const fallback = types.find(t => ['PUSH', 'PULL', 'LEGS'].includes(t)) || types[0];
            return fallback;
          });
        }
      } catch (err) {
        console.error("Error fetching workout templates:", err);
      } finally {
        if (active && !debugLoading) setTemplatesLoading(false);
      }
    };
    
    fetchWorkoutTemplates();
    
    const handlePlanUpdated = () => fetchWorkoutTemplates();
    window.addEventListener('plan_updated', handlePlanUpdated);
    
    // Auto-refresh when user brings the tab back to focus (saves connection but keeps data fresh)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWorkoutTemplates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
      
    return () => {
      active = false;
      window.removeEventListener('plan_updated', handlePlanUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Automatically align dayType with a valid plan type if it's not currently set to a valid option
  useEffect(() => {
    if (scheduleLoading) return;
    if (workoutTemplates.length > 0) {
      const types = workoutTemplates.map(t => t.plan_type);
      const validOptions = ['REST', 'RUN', 'RUN + GYM', ...types];
      
      const matchedOption = validOptions.find(opt => opt.toUpperCase() === dayType.toUpperCase());
      
      if (!matchedOption) {
        const fallback = types.find(t => t.toUpperCase() === 'PUSH') || types[0] || 'REST';
        setDayType(fallback);
      } else if (matchedOption !== dayType) {
        setDayType(matchedOption);
      }
    }
  }, [dayType, workoutTemplates, scheduleLoading]);

  const handlePrevDay = () => setActiveDate(new Date(activeDate.getTime() - 86400000));
  const handleNextDay = () => setActiveDate(new Date(activeDate.getTime() + 86400000));
  
  const dateDisplay = isToday ? 'Today' : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getPlanDetails = () => {
    if (dayType === 'REST') {
      return { title: 'Rest Day', exercises: ['Focus on hydration', 'Ensure adequate rest', 'Light stretching if needed'] };
    }
    if (dayType === 'RUN') {
      return { title: 'Cardio (Running Session)', exercises: ['Run smart', 'Control your pace', 'Focus on your breathing', 'Keep a steady rhythm'] };
    }
    if (dayType === 'RUN + GYM') {
      // Find hybrid split template
      let matched = workoutTemplates.find(t => t.plan_type.toUpperCase() === hybridLiftingType.toUpperCase());
      if (!matched && workoutTemplates.length > 0) {
        matched = workoutTemplates.find(t => t.plan_type.toUpperCase() === 'PUSH') || workoutTemplates[0];
      }
      const exNames = matched?.exercises ? matched.exercises.map((e: any) => typeof e === 'string' ? e : e.name) : [];
      return { 
        title: `Run + Gym (${matched?.plan_type || hybridLiftingType})`, 
        exercises: ['🏃‍♂️ Manual Run Session', ...exNames.map((name: string) => `🏋️‍♂️ ${name}`)] 
      };
    }
    
    // Custom split or PUSH/PULL/LEGS from templates
    let matched = workoutTemplates.find(t => t.plan_type.toUpperCase() === dayType.toUpperCase());
    if (matched) {
      const exNames = matched.exercises ? matched.exercises.map((e: any) => typeof e === 'string' ? e : e.name) : [];
      return {
        title: `${matched.plan_type} Session`,
        exercises: exNames
      };
    }
    
    return { title: `${dayType} Session`, exercises: [] };
  };
  const plan = getPlanDetails();

  const macros = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  const waterTotalMl = waterLogs?.reduce((sum: number, entry: any) => sum + (entry.amount_ml || 0), 0) || 0;
  const waterCurrent = waterTotalMl / 1000;
  const waterTarget = (waterGoalMl || 3500) / 1000;

  const lastWaterLog = waterLogs && waterLogs.length > 0 ? waterLogs[waterLogs.length - 1] : null;
  const lastLoggedTime = lastWaterLog && lastWaterLog.created_at
    ? new Date(lastWaterLog.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null;

  const inbody = latestInbody;

  const hasCompletedRun = completedWorkoutsList.some(w => w.status === 'completed' && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
  const hasCompletedGym = completedWorkoutsList.some(w => w.status === 'completed' && w.day_type !== 'RUN' && w.day_type !== 'REST');

  return (
    <div className="px-4 py-6 flex flex-col gap-6 w-full sm:max-w-[390px] mx-auto overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">{isHaleem ? "Haleem's HQ" : `${userDisplayName || 'Athlete'}'s HQ`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-1.5 bg-surface hover:bg-gray-800 border border-gray-800 text-[10px] font-bold px-3 py-2 rounded-xl text-primary hover:text-blue-400 hover:border-blue-900 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <FileSpreadsheet size={14} className="text-primary" />
            Export
          </button>
          {isHaleem && (
            <button 
              onClick={() => navigate(window.innerWidth < 1024 ? '/coach/dashboard' : '/coach-portal')} 
              className="flex items-center bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 text-[10px] font-bold px-3 py-2 rounded-xl text-blue-400 hover:text-blue-300 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Coach
            </button>
          )}

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                supabase.auth.signOut();
              }
            }} 
            className="flex items-center justify-center p-2 bg-surface hover:bg-red-950/20 border border-gray-800 hover:border-red-900/50 rounded-xl text-gray-400 hover:text-red-400 transition-all active:scale-95 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={14} />
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
      <ErrorBoundary title="Scheduled Plan">
        {scheduleLoading || templatesLoading || statusLoading ? (
          <PlanCardSkeleton />
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-lg relative flex flex-col w-full"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Scheduled Plan</span>
              <select 
                value={(() => {
                  const options = ['REST', 'RUN', 'RUN + GYM', ...workoutTemplates.map(t => t.plan_type)];
                  const matched = options.find(x => x.toUpperCase() === dayType.toUpperCase());
                  return matched || (workoutTemplates.find(t => t.plan_type.toUpperCase() === 'PUSH')?.plan_type || workoutTemplates[0]?.plan_type || 'REST');
                })()}
                onChange={(e) => setDayType(e.target.value)}
                className="bg-gray-800 text-xs font-bold text-white border border-gray-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              >
                {['REST', 'RUN', 'RUN + GYM', ...workoutTemplates.map(t => t.plan_type)].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <h2 className="text-xl font-extrabold text-white mb-4">{plan.title}</h2>
            
            {dayType === 'RUN + GYM' && (
              <div className="flex items-center gap-2 mb-5 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 overflow-x-auto scrollbar-none">
                <span className="text-xs font-bold text-gray-400 px-2 shrink-0">Select Gym Split:</span>
                {workoutTemplates.map(tmpl => {
                  const t = tmpl.plan_type;
                  return (
                    <button
                      key={t}
                      disabled={hasCompletedGym}
                      onClick={() => setHybridLiftingType(t)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all shrink-0 ${hybridLiftingType === t ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'} ${hasCompletedGym ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                    >
                      {t} {hasCompletedGym && hybridLiftingType === t ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            )}

            {dayType !== 'REST' && dayType !== 'RUN + GYM' && (
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                {plan.exercises.map((ex: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                    <span className="text-sm font-semibold text-gray-200">{ex}</span>
                  </li>
                ))}
              </ul>
            )}

            {dayType === 'RUN + GYM' ? (
              <div className="flex flex-col gap-3 mt-1">
                {/* Run Action Button */}
                {hasCompletedRun ? (
                  <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 text-xs">
                    <Check size={16} />
                    Run Completed
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/workout', { state: { activeDateStr, openRunModal: true, forceLiftingType: hybridLiftingType } })}
                    className="w-full h-[48px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Activity size={16} />
                    Log Run Session
                  </button>
                )}

                {/* Gym Action Button */}
                {hasCompletedGym ? (
                  <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 text-xs">
                    <Check size={16} />
                    {hybridLiftingType} Completed
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/workout', { state: { activeDateStr, forceLiftingType: hybridLiftingType } })}
                    className="w-full h-[48px] bg-primary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    Start {hybridLiftingType} Workout
                  </button>
                )}
              </div>
            ) : dayType !== 'REST' && (
              workoutStatus === 1.0 ? (
                <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2">
                  <Check size={18} />
                  WORKOUT COMPLETED
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-2">
                  <button 
                    onClick={() => {
                      if (workout && workout.date === activeDateStr) {
                        navigate('/workout/active');
                      } else {
                        navigate('/workout', { state: { activeDateStr } });
                      }
                    }}
                    className={`w-full h-[48px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${(workout && workout.date === activeDateStr) ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-blue-500/10'}`}
                  >
                    <Play size={18} fill="currentColor" />
                    {(workout && workout.date === activeDateStr) ? 'Resume Session' : 'Start Workout'}
                  </button>
                  
                  {workout && workout.date === activeDateStr && (
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
        )}
      </ErrorBoundary>

      {/* Subtle Separation Divider */}
      <div className="w-full border-t border-white/10 my-1" />

      {/* DETAILS Header & Bottom Cards */}
      <div className="flex flex-col gap-4 w-full">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Details</span>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Nutrition Card (4 progress bars) */}
          <ErrorBoundary title="Nutrition Snapshot">
            {dietLoading ? (
              <NutritionCardSkeleton />
            ) : (
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
                      <span className="text-gray-400 font-bold">{Math.round(macros.kcal)}/{targets.kcal}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: `${Math.min((macros.kcal/targets.kcal)*100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Protein */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 leading-none">
                      <span className="font-semibold text-gray-300">Protein</span>
                      <span className="text-gray-400 font-bold">{Math.round(macros.protein)}/{targets.protein}g</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#475569] h-1.5 rounded-full" style={{ width: `${Math.min((macros.protein/targets.protein)*100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 leading-none">
                      <span className="font-semibold text-gray-300">Carbs</span>
                      <span className="text-gray-450 font-bold">{Math.round(macros.carbs)}/{targets.carbs || 250}g</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#64748b] h-1.5 rounded-full" style={{ width: `${Math.min((macros.carbs/(targets.carbs || 250))*100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 leading-none">
                      <span className="font-semibold text-gray-300">Fat</span>
                      <span className="text-gray-450 font-bold">{Math.round(macros.fat)}/{targets.fat || 75}g</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#94a3b8] h-1.5 rounded-full" style={{ width: `${Math.min((macros.fat/(targets.fat || 75))*100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </ErrorBoundary>

          {/* Hydration Card (Prominent Button & Timestamp) */}
          <ErrorBoundary title="Hydration Snapshot">
            {dietLoading ? (
              <HydrationCardSkeleton />
            ) : (
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
                        <RippleButton 
                          onClick={() => logWater(0.25)} 
                          className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Log 250ml Water
                        </RippleButton>
                       <span className="text-xs font-semibold text-gray-500 mt-2 block text-center leading-none">
                         {lastLoggedTime ? `Last logged: ${lastLoggedTime}` : 'No logs today'}
                       </span>
                     </div>
                   </div>
                 </SwipeToDeleteRow>
                </motion.div>
            )}
          </ErrorBoundary>

        {/* InBody Snapshot */}
        <ErrorBoundary title="InBody Scan">
          {inbodyLoading ? (
            <InBodyCardSkeleton />
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
               className="bg-surface rounded-2xl p-4 border border-gray-800 animate-fade-in w-full col-span-2"
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
                  <button onClick={() => navigate('/inbody')} className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer">
                    Log First Scan →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </ErrorBoundary>
      </div>
    </div>

      {/* Subtle Separation Divider */}
      <div className="w-full border-t border-white/10 my-1" />

      {/* CONCENTRIC TARGETS CARD */}
      <ErrorBoundary title="Bio Status Rings">
        <div className="w-full animate-fade-in">
          <BioStatusRing 
            kcalPct={targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0}
            waterPct={waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0}
            workoutStatus={workoutStatus}
            isRestDay={dayType === 'REST'}
            compact={false}
            onClick={() => setShowTargetsModal(true)}
          />
        </div>
      </ErrorBoundary>
      
      {/* Dev Reset Button */}
      {!isRunningInElectron && (
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
            className="text-[10px] text-gray-600 uppercase font-bold tracking-widest hover:text-danger transition-colors p-2 cursor-pointer"
          >
            Force Reset App Cache
          </button>
        </div>
      )}

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
              className="fixed inset-0 bg-black z-[100] backdrop-blur-sm"
            />
            {/* Modal Bottom Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-surface border-t border-gray-800 rounded-t-3xl p-6 z-[101] flex flex-col gap-5 shadow-2xl"
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

        {showTargetsModal && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setShowTargetsModal(false)} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-[101] overflow-y-auto flex justify-center items-start p-4 py-8 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative w-full max-w-sm my-auto mb-16 pointer-events-auto"
              >
                {/* Close Button */}
                <button 
                  type="button"
                  onClick={() => setShowTargetsModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Title */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-blue-400">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Today's Targets</h3>
                    <p className="text-[9px] text-gray-550 font-bold uppercase tracking-widest leading-none mt-0.5">Biometric Compliance</p>
                  </div>
                </div>

                {/* Rings Visualizer (full version) */}
                <div className="flex flex-col items-center mb-6 bg-slate-950/40 p-5 rounded-3xl border border-slate-800/40">
                  <BioStatusRing 
                    kcalPct={targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0}
                    waterPct={waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0}
                    workoutStatus={workoutStatus}
                    isRestDay={dayType === 'REST'}
                    compact={false}
                  />
                  <div className="mt-4 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-800 text-gray-300 border border-slate-700/60">
                    Overall Target Fulfillment
                  </div>
                </div>

                {/* Detailed progress values */}
                <div className="space-y-4 text-xs font-semibold text-gray-300 leading-relaxed mb-6">
                  {/* Nutrition Progress */}
                  <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Nutrition Target</span>
                      <span>{Math.round((targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0) * 100)}%</span>
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none text-xs text-gray-400">
                        <span>Energy Consumption</span>
                        <span className="text-white font-black">{Math.round(macros.kcal)} / {targets.kcal} kcal</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#3b82f6] h-2 rounded-full" style={{ width: `${Math.min((targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Hydration Progress */}
                  <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-[#475569] uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Hydration Target</span>
                      <span>{Math.round((waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0) * 100)}%</span>
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none text-xs text-gray-400">
                        <span>Water Consumed</span>
                        <span className="text-white font-black">{(waterTotalMl / 1000).toFixed(1)} / {waterTarget} L</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#475569] h-2 rounded-full" style={{ width: `${Math.min((waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Training Progress */}
                  <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Training Compliance</span>
                      <span>{Math.round((dayType === 'REST' ? 1.0 : workoutStatus) * 100)}%</span>
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none text-xs text-gray-400">
                        <span>Status</span>
                        <span className="text-white font-black">
                          {dayType === 'REST' ? 'Rest Day' : workoutStatus === 1.0 ? 'Completed' : workoutStatus === 0.5 ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#94a3b8] h-2 rounded-full" style={{ width: `${Math.min((dayType === 'REST' ? 1.0 : workoutStatus) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setShowTargetsModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer shadow-lg"
                >
                  Close Details
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Instant Offline Reconnect Overlay */}
      {!isOnline && (
        <div className="fixed inset-0 bg-[#07080e] z-[1000] flex items-center justify-center p-6 select-none font-sans text-left">
          <div className="bg-[#111322] border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative flex flex-col items-center">
            {/* Pulsing WiFi Off Icon */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
              <WifiOff size={32} className="text-red-500" />
            </div>

            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Connection Lost</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-[280px] mb-8">
              It looks like you are offline. Please check your WiFi or mobile connection. The app will automatically reconnect once your internet is restored.
            </p>

            {/* Reconnect Spinner */}
            <div className="flex items-center gap-2 justify-center text-xs font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Waiting for connection...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayView;
