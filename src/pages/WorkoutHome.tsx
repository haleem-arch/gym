import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useSchedule } from '../hooks/useSchedule';
import { Play, History, ChevronRight, Check, Activity, BarChart2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { WorkoutButtonSkeleton, WorkoutTemplatesSkeleton, PastSessionItemSkeleton } from '../components/SkeletonLoaders';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout, loadWorkout, endWorkout } = useActiveWorkout();
  
  const debugLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_loading') === 'true';

  const location = useLocation();
  const selectedDateStr = location.state?.activeDateStr || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const getLocalDateString = () => selectedDateStr;
  const { dayType, setDayType, loading: scheduleLoadingRaw } = useSchedule(getLocalDateString());
  const scheduleLoading = debugLoading || scheduleLoadingRaw;

  const [hybridLiftingType, setHybridLiftingType] = useState(location.state?.forceLiftingType || 'PUSH');
  const [pastWorkouts, setPastWorkouts] = useState<any[]>([]);
  const [inProgressWorkout, setInProgressWorkout] = useState<any>(null);
  const [todayPlan, setTodayPlan] = useState<any>({
    type: 'PUSH',
    title: 'Workout Session',
    exercises: []
  });
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(debugLoading || true);
  const effectiveLoading = debugLoading || loading;

  const [showRunModal, setShowRunModal] = useState(false);
  const [runStats, setRunStats] = useState({ name: '', distance: '', elevation: '', paceMin: '', paceSec: '', durationHour: '', durationMin: '', durationSec: '' });
  const [lastEditedFields, setLastEditedFields] = useState<string[]>([]);
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);


  // Auto-open Run modal or Add Workout split modal if navigated from TodayView
  useEffect(() => {
    if (location.state?.openRunModal) {
      setShowRunModal(true);
    }
    if (location.state?.openAddWorkoutModal) {
      setShowAddWorkoutModal(true);
    }
    if (location.state?.forceLiftingType) {
      setHybridLiftingType(location.state.forceLiftingType);
    }
  }, [location.state]);

  const getDefaultRunName = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning Run";
    if (hour >= 12 && hour < 17) return "Afternoon Run";
    if (hour >= 17 && hour < 21) return "Evening Run";
    return "Night Run";
  };

  const saveRunDirectly = async (statsToSave: { name: string; distance: string; elevation: string; paceMin: string; paceSec: string; durationHour: string; durationMin: string; durationSec: string }) => {
    setIsSubmittingRun(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const localDateStr = getLocalDateString();
      const durationSeconds = (parseInt(statsToSave.durationHour) || 0) * 3600 + (parseInt(statsToSave.durationMin) || 0) * 60 + (parseInt(statsToSave.durationSec) || 0);
      
      const finalName = statsToSave.name.trim() || getDefaultRunName();
      const formattedPace = `${statsToSave.paceMin || '0'}:${(statsToSave.paceSec || '00').padStart(2, '0')}`;
      const formattedDuration = formatDuration(durationSeconds);

      const runData = {
        type: 'run_stats',
        distance_km: parseFloat(statsToSave.distance) || 0,
        elevation_m: parseInt(statsToSave.elevation) || 0,
        pace: formattedPace
      };

      const { data, error } = await supabase.from('workouts').insert({
        user_id: session.user.id,
        date: localDateStr,
        day_type: 'RUN',
        name: finalName,
        duration: durationSeconds,
        total_volume: 0,
        notes: JSON.stringify(runData),
        status: 'completed'
      }).select().single();

      if (error) throw error;
      
      setPastWorkouts(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowRunModal(false);
      setRunStats({ name: '', distance: '', elevation: '', paceMin: '', paceSec: '', durationHour: '', durationMin: '', durationSec: '' });
      setLastEditedFields([]);
      
      // Dispatch custom window event to trigger root-level brand ribbon explosion + premium receipt
      window.dispatchEvent(new CustomEvent('trigger-run-saved', {
        detail: {
          distance: statsToSave.distance,
          pace: formattedPace,
          duration: formattedDuration,
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

  const handleFieldChange = (field: 'distance' | 'duration' | 'pace', val: any) => {
    let newStats = { ...runStats };
    
    if (field === 'distance') {
      newStats.distance = val;
    } else if (field === 'duration') {
      let h = parseInt(val.hour) || 0;
      let m = parseInt(val.min) || 0;
      let s = parseInt(val.sec) || 0;
      if (s >= 60) {
        m += Math.floor(s / 60);
        s = s % 60;
      }
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
      newStats.durationHour = h > 0 ? h.toString() : '';
      newStats.durationMin = m.toString();
      newStats.durationSec = s.toString();
    } else if (field === 'pace') {
      let min = parseInt(val.min) || 0;
      let sec = parseInt(val.sec) || 0;
      if (sec >= 60) {
        min += Math.floor(sec / 60);
        sec = sec % 60;
      }
      newStats.paceMin = min.toString();
      newStats.paceSec = sec.toString();
    }

    // Keep track of the order of edited fields (only distance, duration, pace)
    let updatedEdited = lastEditedFields.filter(f => f !== field);
    updatedEdited.push(field);

    if (updatedEdited.length >= 2) {
      const lastTwo = updatedEdited.slice(-2);
      const targetField = ['distance', 'duration', 'pace'].find(f => !lastTwo.includes(f));

      const distVal = parseFloat(newStats.distance);
      const durHourVal = parseInt(newStats.durationHour) || 0;
      const durMinVal = parseInt(newStats.durationMin) || 0;
      const durSecVal = parseInt(newStats.durationSec) || 0;
      const totalDurSec = durHourVal * 3600 + durMinVal * 60 + durSecVal;

      const paceMinVal = parseInt(newStats.paceMin) || 0;
      const paceSecVal = parseInt(newStats.paceSec) || 0;
      const totalPaceSec = paceMinVal * 60 + paceSecVal;

      if (targetField === 'pace') {
        if (!isNaN(distVal) && distVal > 0 && totalDurSec > 0) {
          const calculatedPaceSec = totalDurSec / distVal;
          const mins = Math.floor(calculatedPaceSec / 60);
          const secs = Math.round(calculatedPaceSec % 60);
          
          if (secs === 60) {
            newStats.paceMin = (mins + 1).toString();
            newStats.paceSec = '0';
          } else {
            newStats.paceMin = mins.toString();
            newStats.paceSec = secs.toString();
          }
        }
      } else if (targetField === 'duration') {
        if (!isNaN(distVal) && totalPaceSec > 0) {
          const calculatedDurSec = Math.round(distVal * totalPaceSec);
          const hours = Math.floor(calculatedDurSec / 3600);
          const mins = Math.floor((calculatedDurSec % 3600) / 60);
          const secs = calculatedDurSec % 60;
          
          newStats.durationHour = hours > 0 ? hours.toString() : '';
          newStats.durationMin = mins.toString();
          newStats.durationSec = secs.toString();
        }
      } else if (targetField === 'distance') {
        if (totalDurSec > 0 && totalPaceSec > 0) {
          const calculatedDist = totalDurSec / totalPaceSec;
          newStats.distance = parseFloat(calculatedDist.toFixed(2)).toString();
        }
      }
    }

    setLastEditedFields(updatedEdited);
    setRunStats(newStats);
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
      const { data: myProfile } = await supabase.from('profiles').select('targets, coach_id').eq('id', session.user.id).maybeSingle();
      if (myProfile?.targets?.disable_workout && myProfile.coach_id) {
        setIsLocked(true);
      }

      // Load Haleem's toggles
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      
      let shouldDisableWorkout = true;
      if (myProfile && !myProfile.coach_id) {
        shouldDisableWorkout = false; // Self-guided athletes can always edit workouts/templates
      } else if (myProfile?.targets && myProfile.targets.disable_workout_templates !== undefined) {
        shouldDisableWorkout = !!myProfile.targets.disable_workout_templates;
      } else if (ownerProfile?.targets && ownerProfile.targets.disable_workout_templates !== undefined) {
        shouldDisableWorkout = !!ownerProfile.targets.disable_workout_templates;
      }
      setDisableWorkoutTemplates(shouldDisableWorkout);

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
          'Incline DB Bench Press (45 Degree)',
          'DB Shoulder Press (seated neutral)',
          'Incline DB Y-Raise (20-30 Degree)',
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
          '45 Degree Back Extension (BW/DB)',
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
        
        // Find saved plan (no hardcoded fallback to planMap for split types)
        const matchingPlan = activePlans.find(p => p.plan_type.toUpperCase() === targetSplit.toUpperCase());
        const targetItems = (matchingPlan?.exercises && matchingPlan.exercises.length > 0) 
          ? matchingPlan.exercises 
          : [];

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
      
      if (!debugLoading) setLoading(false);
    };
    
    const timeout = setTimeout(() => loadData(), 500);
    const handlePlanUpdated = () => loadData();
    window.addEventListener('plan_updated', handlePlanUpdated);
    
    // Auto-refresh when user brings the tab back to focus (saves connection but keeps data fresh)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('plan_updated', handlePlanUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dayType, hybridLiftingType, selectedDateStr]);

  // Automatically align dayType with a valid plan type if it's not currently set to a valid option
  useEffect(() => {
    if (scheduleLoading) return;
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
  }, [dayType, savedTemplates, scheduleLoading]);

  const handleStartWorkout = async () => {
    const targetSplit = dayType === 'RUN + GYM' ? hybridLiftingType : dayType;

    if (workout) {
      if (workout.date === selectedDateStr && workout.dayType.toUpperCase() === targetSplit.toUpperCase()) {
        navigate('/workout/active');
        return;
      }
      
      const confirmMsg = workout.date !== selectedDateStr
        ? "You have an unfinished workout from a previous day. Do you want to discard it and start today's workout?"
        : `You have an active ${workout.dayType} workout in progress. Do you want to discard it and start a new ${targetSplit} workout?`;
        
      if (!window.confirm(confirmMsg)) {
        return;
      }
      endWorkout();
    } 
    
    if (inProgressWorkout && inProgressWorkout.date === selectedDateStr && inProgressWorkout.day_type?.toUpperCase() === targetSplit.toUpperCase()) {
      const { data: exercisesData } = await supabase
        .from('workout_exercises')
        .select(`*, exercises(*)`)
        .eq('workout_id', inProgressWorkout.id)
        .order('created_at', { ascending: true });

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

  const handleStartWorkoutForSplit = async (splitName: string) => {
    if (workout) {
      if (workout.date === selectedDateStr && workout.dayType.toUpperCase() === splitName.toUpperCase()) {
        navigate('/workout/active');
        return;
      }
      
      const confirmMsg = workout.date !== selectedDateStr
        ? "You have an unfinished workout from a previous day. Do you want to discard it and start today's workout?"
        : `You have an active ${workout.dayType} workout in progress. Do you want to discard it and start a new ${splitName} workout?`;
        
      if (!window.confirm(confirmMsg)) {
        return;
      }
      endWorkout();
    }

    const matchingPlan = savedTemplates.find(p => p.plan_type.toUpperCase() === splitName.toUpperCase());
    const targetItems = (matchingPlan?.exercises && matchingPlan.exercises.length > 0) 
      ? matchingPlan.exercises 
      : [];

    const namesOnly = targetItems.map((e: any) => typeof e === 'string' ? e : e.name);

    let richExercises: any[] = [];
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

      richExercises = targetItems.map((item: any, idx: number) => {
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
    }

    const planToStart = {
      type: splitName,
      title: `${splitName} Session`,
      exercises: richExercises
    };

    setShowAddWorkoutModal(false);
    navigate('/workout/active', { state: { startNew: true, plan: planToStart, activeDateStr: selectedDateStr } });
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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ') || '0m';
  };

  const isTodayCompleted = pastWorkouts.some(w => w.date === getLocalDateString() && w.day_type === dayType);
  const hasCompletedRunToday = pastWorkouts.some(w => w.date === getLocalDateString() && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
  const hasCompletedGymToday = pastWorkouts.some(w => w.date === getLocalDateString() && w.day_type !== 'RUN' && w.day_type !== 'REST');
  const hasCompletedWorkoutsToday = pastWorkouts.some(w => w.date === getLocalDateString());
  const showActiveOrResume = !!(workout || inProgressWorkout);

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

  const durationHourInt = parseInt(runStats.durationHour) || 0;
  const durationMinInt = parseInt(runStats.durationMin) || 0;
  const durationSecInt = parseInt(runStats.durationSec) || 0;
  const totalDurationSeconds = durationHourInt * 3600 + durationMinInt * 60 + durationSecInt;
  const showHoursField = totalDurationSeconds >= 3600;

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
      <ErrorBoundary title="Today's Workout Button">
        {effectiveLoading || scheduleLoading ? (
          <WorkoutButtonSkeleton />
        ) : (
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
                    Log Run (Manual)
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
                      <Activity size={18} /> LOG RUN (MANUAL)
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

                  {/* Start Another Session Button */}
                  <button
                    onClick={() => setShowAddWorkoutModal(true)}
                    className="w-full py-3.5 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 text-primary hover:text-blue-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] cursor-pointer shadow-md uppercase tracking-wider mt-1"
                  >
                    + Start Another Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2">
                <button 
                  onClick={showActiveOrResume ? handleStartWorkout : isTodayCompleted ? undefined : handleStartWorkout}
                  disabled={isTodayCompleted && !showActiveOrResume}
                  className={`w-full font-bold py-5 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl cursor-pointer ${
                    showActiveOrResume
                      ? 'bg-yellow-500 text-black shadow-yellow-500/20'
                      : isTodayCompleted 
                        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 shadow-none cursor-default' 
                        : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                  }`}
                >
                  {showActiveOrResume ? (
                    workout ? (
                      <>
                        <div className="flex items-center gap-2 text-xl">
                          <Play size={20} fill="currentColor" />
                          RESUME SESSION
                        </div>
                        <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">Active session in progress</span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xl">
                          <Play size={20} fill="currentColor" />
                          RESUME WORKOUT
                        </div>
                        <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">Saved: {inProgressWorkout.day_type} (In Progress)</span>
                      </>
                    )
                  ) : isTodayCompleted ? (
                    <>
                      <div className="flex items-center gap-2 text-xl">
                        <Check size={20} />
                        WORKOUT COMPLETED
                      </div>
                      <span className="text-xs font-semibold opacity-85 uppercase tracking-wide">Excellent training today!</span>
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

                {hasCompletedWorkoutsToday && !workout && !inProgressWorkout && (
                  <button
                    onClick={() => setShowAddWorkoutModal(true)}
                    className="w-full mt-2 py-4 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 text-primary hover:text-blue-400 font-extrabold rounded-3xl flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] cursor-pointer shadow-md uppercase tracking-wider animate-fade-in"
                  >
                    + Start Another Session
                  </button>
                )}

                {showActiveOrResume && (
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
                    className="text-[11px] font-bold text-gray-500 hover:text-danger transition-colors py-1 px-3 mt-1 active:scale-95 cursor-pointer"
                  >
                    Restart Session & Start Fresh
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </ErrorBoundary>

      {/* ── Workout Templates & Programs Section ── */}
      <ErrorBoundary title="Workout Templates & Programs">
        {effectiveLoading ? (
          <WorkoutTemplatesSkeleton />
        ) : (
          (currentUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c' || !disableWorkoutTemplates) && (
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
          )
        )}
      </ErrorBoundary>

      <ErrorBoundary title="Past Workout Sessions">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <History size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Past Sessions</h2>
            </div>
          </div>

          {effectiveLoading ? (
            <div className="flex flex-col gap-3">
              <PastSessionItemSkeleton />
              <PastSessionItemSkeleton />
              <PastSessionItemSkeleton />
            </div>
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
      </ErrorBoundary>

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
            
            <form onSubmit={handleLogRun} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Run Name (Optional)</label>
                <input 
                  type="text" 
                  value={runStats.name}
                  onChange={e => setRunStats({...runStats, name: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                  placeholder="e.g. Afternoon Run"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Distance (km)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={runStats.distance}
                  onChange={e => handleFieldChange('distance', e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none"
                  placeholder="5.00"
                  inputMode="decimal"
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Avg Pace (Min:Sec)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      required
                      value={runStats.paceMin}
                      onChange={e => handleFieldChange('pace', { min: e.target.value, sec: runStats.paceSec })}
                      className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none text-center"
                      placeholder="M"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <input 
                      type="number" 
                      required
                      value={runStats.paceSec}
                      onChange={e => handleFieldChange('pace', { min: runStats.paceMin, sec: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none text-center"
                      placeholder="S"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs font-bold text-gray-400 mb-1 block">Duration</label>
                <div className="flex gap-2">
                  <AnimatePresence initial={false}>
                    {showHoursField && (
                      <motion.div
                        initial={{ width: 0, opacity: 0, marginRight: 0 }}
                        animate={{ width: '33.33%', opacity: 1, marginRight: 8 }}
                        exit={{ width: 0, opacity: 0, marginRight: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="overflow-hidden shrink-0 flex flex-col items-center gap-1"
                      >
                        <input 
                          type="number" 
                          value={runStats.durationHour}
                          onChange={e => handleFieldChange('duration', { hour: e.target.value, min: runStats.durationMin, sec: runStats.durationSec })}
                          className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none text-center"
                          placeholder="H"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">h</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <input 
                        type="number" 
                        required
                        value={runStats.durationMin}
                        onChange={e => handleFieldChange('duration', { hour: runStats.durationHour, min: e.target.value, sec: runStats.durationSec })}
                        className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none text-center"
                        placeholder="Min"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">m</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <input 
                        type="number" 
                        required
                        value={runStats.durationSec}
                        onChange={e => handleFieldChange('duration', { hour: runStats.durationHour, min: runStats.durationMin, sec: e.target.value })}
                        className="w-full bg-black/50 border border-gray-700 rounded-2xl p-3.5 text-white font-bold focus:border-primary outline-none text-center"
                        placeholder="Sec"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">s</span>
                    </div>
                  </div>
                </div>
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

      {/* Start Another Workout Modal */}
      {showAddWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0c1020]/95 backdrop-blur-md w-full max-w-sm rounded-3xl p-6 border border-blue-900/35 shadow-2xl relative animate-fade-in"
          >
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <span>🏋️‍♂️</span> Start Another Session
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">Select one of your saved workout splits to begin another training session for today.</p>

            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto no-scrollbar mb-6">
              {effectiveLoading ? (
                <div className="flex flex-col gap-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full p-4 rounded-2xl bg-slate-900/30 border border-gray-850/40 animate-pulse flex items-center justify-between">
                      <div className="h-4 bg-gray-800 rounded w-2/3" />
                      <div className="h-6 bg-gray-800 rounded-lg w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {savedTemplates
                    .filter(t => {
                      const typeUpper = t.plan_type.toUpperCase();
                      return typeUpper !== 'REST' && typeUpper !== 'RUN + GYM';
                    })
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleStartWorkoutForSplit(template.plan_type)}
                        className="w-full p-4 rounded-2xl bg-slate-900/50 hover:bg-[#1d4ed8]/20 border border-gray-800 hover:border-blue-500/30 text-white font-black text-sm text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between"
                      >
                        <span>{template.plan_type} Split</span>
                        <span className="text-[10px] bg-blue-950 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-900/40 uppercase font-extrabold tracking-wider">Start</span>
                      </button>
                    ))}
                  {savedTemplates.filter(t => {
                    const typeUpper = t.plan_type.toUpperCase();
                    return typeUpper !== 'REST' && typeUpper !== 'RUN + GYM';
                  }).length === 0 && (
                    <p className="text-center text-xs text-gray-555 italic py-4">No split templates found. Create some in templates tab!</p>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setShowAddWorkoutModal(false)}
              className="w-full py-4 rounded-2xl border border-gray-800 hover:bg-gray-800 text-gray-300 font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancel
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
