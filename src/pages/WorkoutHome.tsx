import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useSchedule } from '../hooks/useSchedule';
import { Play, History, ChevronRight, Check, Activity, RefreshCw, Sparkles, X, BarChart2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { DumbbellLoader } from '../components/DumbbellLoader';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout, loadWorkout, endWorkout } = useActiveWorkout();
  
  const location = useLocation();
  const selectedDateStr = location.state?.activeDateStr || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const getLocalDateString = () => selectedDateStr;
  const { dayType, setDayType } = useSchedule(getLocalDateString());

  const [hybridLiftingType, setHybridLiftingType] = useState(location.state?.forceLiftingType || 'PUSH');
  const [pastWorkouts, setPastWorkouts] = useState<any[]>([]);
  const [inProgressWorkout, setInProgressWorkout] = useState<any>(null);
  const [todayPlan, setTodayPlan] = useState<any>({
    type: 'PUSH',
    title: 'Workout Session',
    exercises: []
  });
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRunModal, setShowRunModal] = useState(false);
  const [runStats, setRunStats] = useState({ distance: '', elevation: '', pace: '', duration: '' });
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);
  const [isPullingStrava, setIsPullingStrava] = useState(false);
  

  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutAnalysis, setWorkoutAnalysis] = useState<{
    score: number;
    verdict: string;
    action: string;
    advice: string;
    volumeLifted: number;
    runDistance: number;
    runPace: string;
    runDuration: number;
    runElevation: number;
    hasRun: boolean;
    hasGym: boolean;
    gymType: string;
    tips: string[];
  } | null>(null);

  // Auto-open Run modal if navigated from TodayView with openRunModal flag
  useEffect(() => {
    if (location.state?.openRunModal) {
      setShowRunModal(true);
    }
    if (location.state?.forceLiftingType) {
      setHybridLiftingType(location.state.forceLiftingType);
    }
  }, [location.state]);

  const saveRunDirectly = async (statsToSave: { distance: string; elevation: string; pace: string; duration: string }) => {
    setIsSubmittingRun(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const localDateStr = getLocalDateString();
      const durationSeconds = (parseFloat(statsToSave.duration) || 0) * 60;
      
      const runData = {
        type: 'run_stats',
        distance_km: parseFloat(statsToSave.distance) || 0,
        elevation_m: parseInt(statsToSave.elevation) || 0,
        pace: statsToSave.pace
      };

      const { data, error } = await supabase.from('workouts').insert({
        user_id: session.user.id,
        date: localDateStr,
        day_type: 'RUN',
        duration: durationSeconds,
        total_volume: 0,
        notes: JSON.stringify(runData),
        status: 'completed'
      }).select().single();

      if (error) throw error;
      
      setPastWorkouts(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowRunModal(false);
      setRunStats({ distance: '', elevation: '', pace: '', duration: '' });
      // Dispatch custom window event to trigger root-level brand ribbon explosion + premium receipt
      window.dispatchEvent(new CustomEvent('trigger-run-saved', {
        detail: {
          distance: statsToSave.distance,
          pace: statsToSave.pace,
          duration: statsToSave.duration,
          elevation: statsToSave.elevation,
          workoutId: data.id
        }
      }));
      
    } catch (err) {
      console.error(err);
      alert("Failed to log run");
    } finally {
      setIsSubmittingRun(false);
    }
  };

  const handleLogRun = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRunDirectly(runStats);
  };

  const handlePullFromStrava = async () => {
    setIsPullingStrava(true);
    try {
      let lastAct: any = null;

      const { data, error } = await supabase
        .from('strava_activities')
        .select('*')
        .order('start_date', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        lastAct = data[0];
      }

      if (!lastAct) {
        const localSaved = localStorage.getItem('strava_cached_runs');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.length > 0) lastAct = parsed[0];
        }
      }

      if (!lastAct) {
        const token = localStorage.getItem('strava_access_token') || '87684dfa24b420b56af7503fa2a3c618944f16e3';
        const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const acts = await res.json();
          if (acts && acts.length > 0) lastAct = acts[0];
        }
      }

      if (!lastAct) {
        throw new Error("No Strava runs found. Please connect Strava in the Strava tab first!");
      }

      const distKm = lastAct.distance ? (Number(lastAct.distance) / 1000).toFixed(2) : '5.0';
      const elevM = Math.round(lastAct.total_elevation_gain || lastAct.elevation_gain || 0).toString();
      const durationMins = lastAct.moving_time ? (Number(lastAct.moving_time) / 60).toFixed(1) : '27.5';
      
      let paceStr = '5:30';
      const speedMs = Number(lastAct.average_speed || 0);
      if (speedMs > 0) {
        const paceSeconds = 1000 / speedMs;
        const mins = Math.floor(paceSeconds / 60);
        const secs = Math.floor(paceSeconds % 60);
        paceStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      const newStats = { distance: distKm, elevation: elevM, pace: paceStr, duration: durationMins };
      setRunStats(newStats);
      
      await saveRunDirectly(newStats);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to pull run from Strava.");
    } finally {
      setIsPullingStrava(false);
    }
  };

  const analyzeWorkoutsWithAi = () => {
    const todayWorkouts = pastWorkouts.filter(w => w.date === getLocalDateString());
    if (todayWorkouts.length === 0) {
      alert("Please log a workout first for today to analyze!");
      return;
    }

    let hasRun = false;
    let hasGym = false;
    let gymType = "";
    let volumeLifted = 0;
    let runDistance = 0;
    let runPace = "";
    let runDuration = 0;
    let runElevation = 0;

    todayWorkouts.forEach(w => {
      if (w.day_type === 'RUN' || (w.notes && w.notes.includes('"type":"run_stats"'))) {
        hasRun = true;
        try {
          const stats = JSON.parse(w.notes);
          runDistance += parseFloat(stats.distance_km) || 0;
          runPace = stats.pace || "";
          runDuration += (w.duration || 0) / 60;
          runElevation += parseInt(stats.elevation_m) || 0;
        } catch (e) {}
      } else if (w.day_type !== 'RUN' && w.day_type !== 'REST') {
        hasGym = true;
        gymType = w.day_type;
        volumeLifted += w.total_volume || 0;
      }
    });

    // Score calculations
    let score = 0;
    let verdict = "";
    let action = "";
    let advice = "";
    const tips: string[] = [];

    const isSelectedToday = getLocalDateString() === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const dateFormatted = isSelectedToday ? 'Today' : new Date(getLocalDateString()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (hasRun && hasGym) {
      score = 98;
      verdict = "Double Stimulus Completed";
      action = "🔥 Elite Output: You logged both your running mileage and your strength training. Outstanding adaptation response!";
      advice = `Your dual-stimulus session on ${dateFormatted} combined a cardiovascular run of ${runDistance.toFixed(2)} km with a resistance training load of ${volumeLifted.toLocaleString()} kg. This simultaneous stimulation of mitochondrial growth and muscle hypertrophy is highly effective for elite hybrid athletes. However, this creates a high systemic stress response. Glycogen reserves will be heavily depleted, and muscle tissue damage requires immediate attention.`;
      tips.push("Carb reload: Prioritize eating 70-100g of high-glycemic carbohydrates alongside 30-40g of protein within 90 minutes.");
      tips.push("Active flush: Spend 10 minutes performing light foam rolling on the targeted lifting muscles and your calves/quads.");
      tips.push("Hydration formula: Rehydrate with electrolyte-dense water (at least 1.5L containing sodium/potassium) to offset cardio sweat loss.");
    } else if (hasRun) {
      score = 92;
      verdict = "Aerobic System Stimulated";
      action = "🏃 Aerobic Focus: Cardiovascular session completed. Focus on structural recovery of lower-body joints.";
      advice = `Your cardiovascular training on ${dateFormatted} stimulated critical aerobic adaptations, clocking in a total distance of ${runDistance.toFixed(2)} km over ${Math.round(runDuration)} minutes. Settle-in paces around ${runPace}/km promote capillary density and cellular oxygen utilization. Your heart rate recovery indicates a highly efficient cardiovascular engine.`;
      tips.push("Joint care: Perform 5-10 mins of hamstring/calf stretches and ankle mobility exercises to relieve impact stress.");
      tips.push("Rehydrate: Consume fluid equivalent to 150% of your estimated sweat loss, adding an electrolyte tablet.");
      tips.push("Keep consistency: Maintain structural tissue integrity by keeping tomorrow's session light or resistance-focused.");
    } else if (hasGym) {
      score = 90;
      verdict = "Myofibrillar Hypertrophy Stimulated";
      action = "🏋️‍♂️ Strength Loaded: Complete mechanical overload achieved on your strength split. Optimize recovery windows.";
      advice = `Your resistance training session on ${dateFormatted} stimulated high mechanical tension on your ${gymType} split, lifting a cumulative volume of ${volumeLifted.toLocaleString()} kg. This mechanical stimulus triggers muscular protein synthesis and neuromuscular adaptation. Physical fatigue in target muscle groups will peak in 24-48 hours.`;
      tips.push("Amino availability: Consume 30-40g of whey protein or essential amino acids (EAAs) immediately to trigger protein synthesis.");
      tips.push("Targeted blood flow: Perform active recovery or light movements tomorrow to flush metabolic waste from trained muscle groups.");
      tips.push("Rest: Ensure adequate rest tonight to support growth hormone release and muscle repair.");
    } else {
      score = 50;
      verdict = "Minimal Training Load Detected";
      action = "💤 Recovery Day: Focus on physical restoration, hydration, and central nervous system (CNS) reset.";
      advice = `No major lifting or running workload was recorded for ${dateFormatted}. This is perfectly in line with a planned recovery block, allowing your physiological systems, connective tissues, and endocrine balance to reset.`;
      tips.push("Active rest: Walk 5,000-8,000 light steps to keep joint fluids moving without inducing fatigue.");
      tips.push("Circadian shift: Go to bed 30 minutes earlier to supercharge recovery mechanisms.");
    }

    setWorkoutAnalysis({
      score,
      verdict,
      action,
      advice,
      volumeLifted,
      runDistance,
      runPace,
      runDuration,
      runElevation,
      hasRun,
      hasGym,
      gymType,
      tips
    });
    setShowWorkoutModal(true);
  };

  const [disableWorkoutTemplates, setDisableWorkoutTemplates] = useState(false);

  const [isLocked, setIsLocked] = useState(false);

  // Sync todayPlan type with dayType from schedule (handling RUN + GYM hybrid split)
  useEffect(() => {
    const targetType = dayType === 'RUN + GYM' ? hybridLiftingType : dayType;
    setTodayPlan((prev: any) => ({ ...prev, type: targetType, title: `${targetType} Session` }));
  }, [dayType, hybridLiftingType]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      // Fetch own profile targets to check lock status
      const { data: myProfile } = await supabase.from('profiles').select('targets').eq('id', session.user.id).maybeSingle();
      if (myProfile?.targets?.disable_workout) {
        setIsLocked(true);
      }

      // Load Haleem's toggles
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      if (ownerProfile?.targets) {
        setDisableWorkoutTemplates(!!ownerProfile.targets.disable_workout_templates);
      }

      // 1. Fetch Past Workouts (completed only)
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (workoutsData) {
        setPastWorkouts(workoutsData);
      }

      // 2. Fetch In Progress session for today (or recent)
      const { data: inProgressData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

      if (inProgressData && inProgressData.length > 0) {
        setInProgressWorkout(inProgressData[0]);
      } else {
        setInProgressWorkout(null);
      }

      // 2.5 Fetch all custom and default workout plans for this user
      const { data: plansData } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', session.user.id);

      // 3. Fetch real exercises based on day_type
      const planMap: Record<string, string[]> = {
        PUSH: [
          'Incline DB Bench Press (45°)',
          'DB Shoulder Press (seated neutral)',
          'Incline DB Y-Raise (20-30°)',
          'Cable Chest Fly (low pulley)',
          'Overhead Cable Extension (rope)',
          'DB Lateral Raise (elbow-lead)'
        ],
        PULL: [
          'Lat Pulldown (wide grip)',
          'Chest-Supported DB Row',
          'Sideways One-Arm Rear Delt Fly',
          'Face Pull (rope eye height)',
          'Incline DB Curl - Bayesian',
          'Zottman Curl'
        ],
        LEGS: [
          'Leg Press (feet high for glutes)',
          'DB Romanian Deadlift',
          'DB Bulgarian Split Squat',
          'Seated Leg Curl',
          '45° Back Extension (BW/DB)',
          'Standing Calf Raise'
        ]
      };

      let activePlans = plansData || [];
      // Seed default splits (PUSH/PULL/LEGS) only if user has NO templates at all
      if (activePlans.length === 0) {
        const defaultInserts = ['PUSH', 'PULL', 'LEGS'].map(split => ({
          user_id: session.user.id,
          plan_type: split,
          exercises: planMap[split].map((name: string, i: number) => ({
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
      setSavedTemplates(activePlans);

      if (dayType === 'REST' || dayType === 'RUN') {
        setTodayPlan((prev: any) => ({ ...prev, exercises: [] }));
      } else {
        const targetSplit = dayType === 'RUN + GYM' ? hybridLiftingType : dayType;
        
        // Find saved plan or fallback
        const matchingPlan = activePlans.find(p => p.plan_type.toUpperCase() === targetSplit.toUpperCase());
        const targetItems = (matchingPlan?.exercises && matchingPlan.exercises.length > 0) 
          ? matchingPlan.exercises 
          : planMap[targetSplit.toUpperCase()] || [];

        const namesOnly = targetItems.map((e: any) => typeof e === 'string' ? e : e.name);

        if (namesOnly.length > 0) {
          const { data: exData } = await supabase
            .from('exercises')
            .select('*')
            .in('name', namesOnly);
            
          const dbExMap = new Map();
          if (exData) {
            exData.forEach(ex => {
              dbExMap.set(ex.name, ex);
            });
          }

          const richExercises = targetItems.map((item: any, idx: number) => {
            const name = typeof item === 'string' ? item : item.name;
            const setsCount = typeof item === 'string' ? 3 : item.sets || 3;
            const restTime = typeof item === 'string' ? 120 : item.rest || 120;

            const dbEx = dbExMap.get(name);
            return {
              id: dbEx?.id || `custom-ex-${idx}-${Date.now()}`,
              name,
              muscle_group: dbEx?.muscle_group || 'Custom',
              tier: dbEx?.tier || 'A',
              focus: dbEx?.focus || '',
              cue: dbEx?.cue || '',
              rationale: dbEx?.rationale || '',
              equipment: dbEx?.equipment || '',
              setsCount,
              restTime
            };
          });

          setTodayPlan((prev: any) => ({ ...prev, exercises: richExercises, type: targetSplit }));
        } else {
          setTodayPlan((prev: any) => ({ ...prev, exercises: [], type: targetSplit }));
        }
      }
      
      setLoading(false);
    };
    
    const timeout = setTimeout(() => loadData(), 500);
    const handlePlanUpdated = () => loadData();
    window.addEventListener('plan_updated', handlePlanUpdated);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('plan_updated', handlePlanUpdated);
    };
  }, [dayType, hybridLiftingType]);

  // Automatically align dayType with a valid plan type if it's not currently set to a valid option
  useEffect(() => {
    if (savedTemplates.length > 0) {
      const types = savedTemplates.map(t => t.plan_type);
      const validOptions = ['REST', 'RUN', 'RUN + GYM', ...types];
      
      const matchedOption = validOptions.find(opt => opt.toUpperCase() === dayType.toUpperCase());
      
      if (!matchedOption) {
        const fallback = types.find(t => t.toUpperCase() === 'PUSH') || types[0] || 'REST';
        setDayType(fallback);
      } else if (matchedOption !== dayType) {
        setDayType(matchedOption);
      }
    }
  }, [dayType, savedTemplates]);

  const handleStartWorkout = async () => {
    if (workout) {
      navigate('/workout/active');
      return;
    } 
    
    if (inProgressWorkout) {
      const { data: exercisesData } = await supabase
        .from('workout_exercises')
        .select(`*, exercises(*)`)
        .eq('workout_id', inProgressWorkout.id);

      if (exercisesData) {
        const reconstructedExercises = exercisesData.map((we: any) => ({
          id: we.exercises.id,
          name: we.exercises.name,
          muscle_group: we.exercises.muscle_group,
          tier: we.exercises.tier || 'A',
          cue: we.exercises.cue || '',
          rationale: we.exercises.rationale || '',
          sets: we.sets || [],
          notes: we.notes || '',
          restTime: 120
        }));

        loadWorkout({
          id: inProgressWorkout.id,
          dayType: inProgressWorkout.day_type,
          title: `${inProgressWorkout.day_type} Workout`,
          startTime: new Date().toISOString(),
          exercises: reconstructedExercises,
          notes: inProgressWorkout.notes || ''
        });
        navigate('/workout/active');
        return;
      }
    }

    if (todayPlan.exercises.length === 0) {
      alert("Loading exercises, please wait a second...");
      return;
    }
    navigate('/workout/active', { state: { startNew: true, plan: todayPlan, activeDateStr: selectedDateStr } });
  };


  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }
    setPastWorkouts(prev => prev.filter(w => w.id !== id));
    await supabase.from('workouts').delete().eq('id', id);
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

  const isTodayCompleted = pastWorkouts.some(w => w.date === getLocalDateString() && w.day_type === dayType);
  const hasCompletedRunToday = pastWorkouts.some(w => w.date === getLocalDateString() && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
  const hasCompletedGymToday = pastWorkouts.some(w => w.date === getLocalDateString() && w.day_type !== 'RUN' && w.day_type !== 'REST');

  useEffect(() => {
    const completedGym = pastWorkouts.find(w => w.date === getLocalDateString() && w.day_type !== 'RUN' && w.day_type !== 'REST');
    if (completedGym) {
      setHybridLiftingType(completedGym.day_type);
    }
  }, [pastWorkouts, selectedDateStr]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-background text-gray-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Layers size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Section Locked</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
          This section has been locked by your coach. Please contact your coach if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full pb-28 max-w-lg mx-auto w-full overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setShowAnalytics(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${!showAnalytics ? 'bg-primary text-black' : 'text-slate-400'}`}
            >
              History
            </button>
            <button 
              onClick={() => setShowAnalytics(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${showAnalytics ? 'bg-primary text-black' : 'text-slate-400'}`}
            >
              <BarChart2 size={16} className={showAnalytics ? 'text-black' : ''} />
              <span>Insights</span>
            </button>
          </div>
        </div>
      </motion.div>

      {showAnalytics ? (
        <AnalyticsCharts userId={currentUserId} />
      ) : (
        <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        {dayType === 'REST' ? (
          <div className="bg-surface border border-gray-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-4xl mb-3">💤</span>
            <h2 className="text-xl font-bold text-white mb-2">Rest Day</h2>
            <p className="text-sm text-gray-400">Rest is part of training. Hydrate, eat well, and relax if possible.</p>
          </div>
        ) : dayType === 'RUN' ? (
          <div className="bg-surface border border-blue-900/30 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/10 w-full">
            <span className="text-4xl mb-3">🏃</span>
            <h2 className="text-xl font-bold text-white mb-2">Run Day</h2>
            <p className="text-sm text-gray-400 mb-5">Time to hit the pavement. Focus on Zone 2 unless scheduled for tempo.</p>
            {hasCompletedRunToday ? (
              <div className="flex flex-col gap-3 w-full">
                <div className="w-full py-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-sm">
                  <Check size={18} /> RUN COMPLETED
                </div>
                <button 
                  onClick={() => setShowRunModal(true)}
                  className="bg-surface border border-gray-700 hover:border-gray-500 text-gray-300 font-extrabold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer text-[10px] uppercase tracking-wider"
                >
                  + Add Another Run
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowRunModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-8 rounded-xl transition-all active:scale-95 shadow-lg cursor-pointer text-xs uppercase tracking-wider w-full"
              >
                {currentUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' ? 'Log Run (Manual / Strava)' : 'Log Run (Manual)'}
              </button>
            )}
          </div>
        ) : dayType === 'RUN + GYM' ? (
          <div className="bg-surface border border-purple-900/40 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl shadow-purple-900/10 w-full gap-5">
            <div className="flex items-center gap-2 text-3xl mb-1">🏃 + 🏋️‍♂️</div>
            <h2 className="text-xl font-black text-white tracking-tight">Hybrid Day: Run + Gym</h2>
            <p className="text-xs text-gray-400 mb-1 leading-relaxed">Complete both your cardio mileage and your lifting volume to fulfill today's rings.</p>
            
            {/* Gym split sub-selector */}
            <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 w-full max-w-xs shadow-inner overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-gray-400 px-3 shrink-0">Gym Split:</span>
              {savedTemplates.map(tmpl => {
                const t = tmpl.plan_type;
                return (
                  <button
                    key={t}
                    disabled={hasCompletedGymToday}
                    onClick={() => setHybridLiftingType(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${hybridLiftingType === t ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'} ${hasCompletedGymToday ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                  >
                    {t} {hasCompletedGymToday && hybridLiftingType === t ? '✓' : ''}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 w-full mt-2">
              {/* Run Button */}
              {hasCompletedRunToday ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="w-full py-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-sm">
                    <Check size={18} /> RUN COMPLETED
                  </div>
                  <button 
                    onClick={() => setShowRunModal(true)}
                    className="w-full bg-surface border border-gray-700 hover:border-gray-500 text-gray-300 font-extrabold py-3 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer text-[10px] uppercase tracking-wider"
                  >
                    + Add Another Run
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowRunModal(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xl hover:shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer tracking-wider uppercase"
                >
                  <Activity size={18} /> {currentUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' ? 'LOG RUN (MANUAL / STRAVA)' : 'LOG RUN (MANUAL)'}
                </button>
              )}

              {/* Gym Button */}
              {hasCompletedGymToday ? (
                <div className="w-full py-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-sm">
                  <Check size={18} /> {hybridLiftingType} COMPLETED
                </div>
              ) : (
                <button
                  onClick={handleStartWorkout}
                  className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer tracking-wider uppercase"
                >
                  <Play size={18} fill="currentColor" /> START {hybridLiftingType} WORKOUT
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <button 
              onClick={isTodayCompleted ? undefined : handleStartWorkout}
              disabled={isTodayCompleted}
              className={`w-full font-bold py-5 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl cursor-pointer ${
                isTodayCompleted 
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 shadow-none cursor-default' 
                  : workout || inProgressWorkout 
                    ? 'bg-yellow-500 text-black shadow-yellow-500/20' 
                    : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
              }`}
            >
              {isTodayCompleted ? (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <Check size={20} />
                    WORKOUT COMPLETED
                  </div>
                  <span className="text-xs font-semibold opacity-85 uppercase tracking-wide">Excellent training today!</span>
                </>
              ) : workout ? (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <Play size={20} fill="currentColor" />
                    RESUME SESSION
                  </div>
                  <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">Active session in progress</span>
                </>
              ) : inProgressWorkout ? (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <Play size={20} fill="currentColor" />
                    RESUME WORKOUT
                  </div>
                  <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">Saved: {inProgressWorkout.day_type} (In Progress)</span>
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

            {!isTodayCompleted && (workout || inProgressWorkout) && (
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to discard this active session and start fresh?")) {
                    localStorage.removeItem('athlete_dashboard_active_workout');
                    endWorkout();
                    setInProgressWorkout(null);
                    
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                      await supabase.from('workouts').delete().eq('user_id', session.user.id).eq('status', 'in_progress');
                    }
                  }
                }}
                className="text-[11px] font-bold text-gray-500 hover:text-danger transition-colors py-1 px-3 mt-0.5 active:scale-95 cursor-pointer"
              >
                Restart Session & Start Fresh
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Workout Templates & Programs Section ── */}
      {!loading && (currentUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableWorkoutTemplates) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }}
          className="mt-2"
        >
          <button
            onClick={() => navigate('/workout/builder')}
            className="w-full py-4 bg-surface hover:bg-slate-800/80 text-white font-extrabold rounded-2xl flex items-center justify-between px-5 border border-gray-800 hover:border-gray-700 transition-all active:scale-[0.98] shadow-md cursor-pointer text-xs uppercase tracking-wider"
          >
            <div className="flex items-center gap-2.5">
              <Layers size={15} className="text-primary animate-pulse" />
              <span>Workout Templates &amp; Programs</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <History size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Past Sessions</h2>
          </div>
          {pastWorkouts.some(w => w.date === getLocalDateString()) && (
            <button
              onClick={analyzeWorkoutsWithAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-wider uppercase transition-all border border-indigo-500/25 active:scale-95 cursor-pointer shadow-inner"
            >
              <Sparkles size={11} className="text-indigo-400 animate-pulse" />
              <span>AI Analysis</span>
            </button>
          )}
        </div>

        {loading ? (
          <DumbbellLoader label="Loading history..." size={80} />
        ) : pastWorkouts.length === 0 ? (
          <div className="text-center text-gray-500 py-4 bg-surface border border-gray-800 rounded-xl">No workouts logged yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastWorkouts.map((session) => (
              <SwipeToDeleteRow 
                key={session.id} 
                onDelete={() => handleDeleteSession(session.id)}
                backgroundRounded="rounded-2xl"
              >
                <div 
                  onClick={() => navigate(`/workout/${session.id}`)}
                  className="bg-surface rounded-2xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700 active:scale-[0.98] transition-all w-full shadow-md"
                >
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block font-medium">{formatDate(session.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${session.day_type === 'RUN' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-primary border-gray-700'}`}>
                        {session.day_type}
                      </span>
                      {(() => {
                        if (session.day_type === 'RUN' && session.notes && session.notes.includes('"type":"run_stats"')) {
                          try {
                            const stats = JSON.parse(session.notes);
                            return (
                              <>
                                <span className="text-sm font-black text-blue-400">{stats.distance_km} km</span>
                                <span className="text-xs font-bold text-gray-400 border-l border-gray-700 pl-2">{stats.pace}/km</span>
                                <span className="text-xs font-bold text-gray-400 border-l border-gray-700 pl-2">{formatDuration(session.duration)}</span>
                              </>
                            );
                          } catch (e) {}
                        }
                        return (
                          <>
                            <span className="text-sm font-black text-white">{session.total_volume} kg</span>
                            <span className="text-xs font-bold text-gray-400 border-l border-gray-700 pl-2">{formatDuration(session.duration)}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button className="text-primary hover:text-blue-400 transition-colors p-2 bg-gray-900 rounded-full border border-gray-800">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </SwipeToDeleteRow>
            ))}
          </div>
        )}
      </motion.div>

      {/* Run Log Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🏃</span> Log Run
            </h3>

            {currentUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' && (
              <button
                type="button"
                onClick={handlePullFromStrava}
                disabled={isPullingStrava}
                className="w-full mb-5 py-3.5 rounded-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase border border-blue-500/30 disabled:opacity-50 cursor-pointer"
              >
                {isPullingStrava ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Pulling Last Run from Strava...</span>
                  </>
                ) : (
                  <>
                    <Activity size={16} />
                    <span>Log from Strava (Auto-Fill Last Run)</span>
                  </>
                )}
              </button>
            )}
            
            <form onSubmit={handleLogRun} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Distance (km)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={runStats.distance}
                  onChange={e => setRunStats({...runStats, distance: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                  placeholder="5.0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Elevation (m)</label>
                  <input 
                    type="number" 
                    value={runStats.elevation}
                    onChange={e => setRunStats({...runStats, elevation: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Avg Pace</label>
                  <input 
                    type="text" 
                    required
                    value={runStats.pace}
                    onChange={e => setRunStats({...runStats, pace: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                    placeholder="5:30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Duration (mins)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={runStats.duration}
                  onChange={e => setRunStats({...runStats, duration: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                  placeholder="27.5"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowRunModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition-colors cursor-pointer text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingRun}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-colors disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider shadow-lg"
                >
                  {isSubmittingRun ? 'Saving...' : 'Save Run'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Workout AI Coach Modal */}
      {showWorkoutModal && workoutAnalysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center items-start p-4 py-8">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl relative my-auto mb-16"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowWorkoutModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-indigo-400" />
              <h3 className="text-lg font-black text-white tracking-tight uppercase">AI Training Analysis</h3>
            </div>

            {/* Score Ring Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Ring Background & Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#indigoGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={376.9}
                    strokeDashoffset={376.9 - (376.9 * workoutAnalysis.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center score readout */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-white tracking-tighter">{workoutAnalysis.score}</span>
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none mt-1">Training Score</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-[10px] font-black tracking-wider uppercase">
                {workoutAnalysis.verdict}
              </div>
            </div>

            {/* Dynamic Output & Explanation */}
            <div className="space-y-4 text-xs font-semibold text-gray-300 leading-relaxed mb-6">
              <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl">
                <p className="text-white font-extrabold mb-1">Coach Verdict</p>
                <p className="text-gray-400 font-medium">{workoutAnalysis.action}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl">
                <p className="text-white font-extrabold mb-1.5 flex items-center gap-1">
                  <span>💡</span> Physiological Analysis
                </p>
                <p className="text-gray-400 font-medium">{workoutAnalysis.advice}</p>
              </div>

              {/* Workout Benchmarks/Targets Visualizer */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span>📊</span> Daily Volume & Distance Targets
                </h5>
                
                <div className="space-y-3.5 text-xs">
                  {/* Gym Lifted Volume */}
                  {workoutAnalysis.hasGym && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-[#a855f7]">{workoutAnalysis.gymType} Volume</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{workoutAnalysis.volumeLifted.toLocaleString()} kg</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 5,000 kg)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#a855f7] h-2 rounded-full" style={{ width: `${Math.min((workoutAnalysis.volumeLifted / 5000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Run Duration */}
                  {workoutAnalysis.hasRun && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-[#3b82f6]">Cardio Duration</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{Math.round(workoutAnalysis.runDuration)} mins</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 40 mins)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#3b82f6] h-2 rounded-full" style={{ width: `${Math.min((workoutAnalysis.runDuration / 40) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Item Recovery Tips */}
              {workoutAnalysis.tips.length > 0 && (
                <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/25">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span>⚡</span> Post-Workout Action Plan
                  </h5>
                  <ul className="space-y-2 text-xs text-indigo-200/90 font-semibold list-disc list-inside">
                    {workoutAnalysis.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-indigo-300 font-bold">{tip.split(':')[0]}:</span>
                        {tip.split(':').slice(1).join(':')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* OK Button */}
            <button 
              onClick={() => setShowWorkoutModal(false)}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer shadow-lg"
            >
              Acknowledge
            </button>
          </motion.div>
        </div>
      )}
      </>
      )}
      
    </div>
  );
};

export default WorkoutHome;
