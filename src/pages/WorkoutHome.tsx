import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useSchedule } from '../hooks/useSchedule';
import { Play, History, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { BarChart2 } from 'lucide-react';
import { LOCAL_EXERCISES_DICTIONARY } from '../utils/localExercises';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout, loadWorkout, endWorkout } = useActiveWorkout();
  
  // Use today's schedule
  const getLocalDateString = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const { dayType } = useSchedule(getLocalDateString());

  const [pastWorkouts, setPastWorkouts] = useState<any[]>([]);
  const [inProgressWorkout, setInProgressWorkout] = useState<any>(null);
  const [todayPlan, setTodayPlan] = useState<any>({
    type: 'PUSH',
    title: 'Workout Session',
    exercises: []
  });
  const [loading, setLoading] = useState(true);

  const [showRunModal, setShowRunModal] = useState(false);
  const [runStats, setRunStats] = useState({ distance: '', elevation: '', pace: '', duration: '' });
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const handleLogRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRun(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const localDateStr = getLocalDateString();
      const durationSeconds = (parseFloat(runStats.duration) || 0) * 60;
      
      const runData = {
        type: 'run_stats',
        distance_km: parseFloat(runStats.distance) || 0,
        elevation_m: parseInt(runStats.elevation) || 0,
        pace: runStats.pace
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
      
      // Update past workouts state
      setPastWorkouts(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowRunModal(false);
      setRunStats({ distance: '', elevation: '', pace: '', duration: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to log run");
    } finally {
      setIsSubmittingRun(false);
    }
  };

  // Sync todayPlan type with dayType from schedule
  useEffect(() => {
    setTodayPlan((prev: any) => ({ ...prev, type: dayType, title: `${dayType} Session` }));
  }, [dayType]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        setCurrentUserId(session.user.id);

        // 1. Fetch Past Workouts (completed only)
        try {
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
        } catch (err) {
          console.error("Error loading past workouts:", err);
        }

        // 2. Fetch In Progress session for today (or recent)
        try {
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
        } catch (err) {
          console.error("Error loading in-progress workout:", err);
        }

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

        if (dayType === 'REST' || dayType === 'RUN') {
          setTodayPlan((prev: any) => ({ ...prev, exercises: [] }));
        } else {
          let targetNames: string[] = [];
          let parsedConfigs: { name: string; sets: number; rest: number }[] = [];
          
          try {
            const { data: customPlan } = await supabase
              .from('user_workout_plans')
              .select('exercises')
              .eq('user_id', session.user.id)
              .eq('plan_type', dayType)
              .maybeSingle();

            if (customPlan?.exercises && customPlan.exercises.length > 0) {
              parsedConfigs = customPlan.exercises.map((ex: any) => {
                if (typeof ex === 'string') return { name: ex, sets: 4, rest: 90 };
                return { name: ex.name || '', sets: ex.sets || 4, rest: ex.rest || 90 };
              });
              targetNames = parsedConfigs.map(e => e.name);
            } else {
              // Fallback to planMap defaults if the user has an empty DB somehow
              targetNames = planMap[dayType] || planMap['PUSH'];
              parsedConfigs = targetNames.map(name => ({ name, sets: 4, rest: 90 }));
            }
          } catch (err) {
            console.error("Error loading custom plan:", err);
            targetNames = planMap[dayType] || planMap['PUSH'];
            parsedConfigs = targetNames.map(name => ({ name, sets: 4, rest: 90 }));
          }

          let finalExercises = [];
          try {
            const { data: exData } = await supabase
              .from('exercises')
              .select('*')
              .in('name', targetNames);
              
            if (exData && exData.length > 0) {
              finalExercises = [...exData].sort((a, b) => targetNames.indexOf(a.name) - targetNames.indexOf(b.name));
            }
          } catch (err) {
            console.error("Error fetching exercises:", err);
          }

          // Self-Healing Fallback: Check local dictionary or templates
          if (finalExercises.length < targetNames.length) {
            const matchedNames = finalExercises.map((e: any) => e.name);
            const missingNames = targetNames.filter((name: string) => !matchedNames.includes(name));

            const tempRecords = missingNames.map((name: string, i: number) => {
              const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const localMatch = LOCAL_EXERCISES_DICTIONARY.find(le => {
                const cleanLeName = le.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                return cleanLeName.includes(cleanName) || cleanName.includes(cleanLeName);
              });

              return {
                id: localMatch?.id || `temp-id-${name.replace(/\s+/g, '-').toLowerCase()}-${i}`,
                name: name,
                muscle_group: localMatch?.muscle_group || 'All Muscles',
                tier: localMatch?.tier || 'A',
                focus: localMatch?.focus || 'Hypertrophy',
                cue: localMatch?.cue || 'Maintain perfect execution control throughout the set.',
                rationale: localMatch?.rationale || 'Key exercise movement.',
                equipment: localMatch?.equipment || 'Gym Equipment'
              };
            });

            finalExercises = [...finalExercises, ...tempRecords].sort((a, b) => targetNames.indexOf(a.name) - targetNames.indexOf(b.name));
          }

          // Inject target sets and rest times
          finalExercises = finalExercises.map(fe => {
            const config = parsedConfigs.find(c => c.name.toLowerCase() === fe.name.toLowerCase());
            return {
              ...fe,
              targetSets: config ? config.sets : 4,
              targetRest: config ? config.rest : 90
            };
          });

          setTodayPlan((prev: any) => ({ ...prev, exercises: finalExercises }));
        }
      } catch (globalErr) {
        console.error("Global data loading exception caught:", globalErr);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(() => loadData(), 500);
    
    const handlePlanUpdated = () => {
      loadData();
    };
    window.addEventListener('plan_updated', handlePlanUpdated);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('plan_updated', handlePlanUpdated);
    };
  }, [dayType]);

  const handleStartWorkout = async () => {
    if (workout) {
      navigate('/workout/active');
      return;
    } 
    
    if (inProgressWorkout) {
      try {
        // Resume from Supabase
        const { data: exercisesData } = await supabase
          .from('workout_exercises')
          .select(`*, exercises(*)`)
          .eq('workout_id', inProgressWorkout.id);

        if (exercisesData && exercisesData.length > 0) {
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
            id: inProgressWorkout.id, // Re-use the same ID to update instead of insert
            dayType: inProgressWorkout.day_type,
            title: `${inProgressWorkout.day_type} Workout`,
            startTime: new Date().toISOString(),
            exercises: reconstructedExercises,
            notes: inProgressWorkout.notes || ''
          });
          navigate('/workout/active');
          return;
        }
      } catch (err) {
        console.error("Error resuming in-progress session:", err);
      }
    }

    // Start fresh
    let activePlan = todayPlan;
    
    // If today is a weightlifting day but exercises are empty/still loading, fetch them instantly!
    if (dayType !== 'REST' && dayType !== 'RUN' && (!activePlan.exercises || activePlan.exercises.length === 0)) {
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

      let targetNames: string[] = [];
      let parsedConfigs: { name: string; sets: number; rest: number }[] = [];

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: customPlan } = await supabase
            .from('user_workout_plans')
            .select('exercises')
            .eq('user_id', session.user.id)
            .eq('plan_type', dayType)
            .maybeSingle();

          if (customPlan?.exercises && customPlan.exercises.length > 0) {
            parsedConfigs = customPlan.exercises.map((ex: any) => {
              if (typeof ex === 'string') return { name: ex, sets: 4, rest: 90 };
              return { name: ex.name || '', sets: ex.sets || 4, rest: ex.rest || 90 };
            });
            targetNames = parsedConfigs.map(e => e.name);
          }
        }
      } catch (e) {
        console.error("Fast fetch error:", e);
      }

      if (targetNames.length === 0) {
        targetNames = planMap[dayType] || planMap['PUSH'];
        parsedConfigs = targetNames.map(name => ({ name, sets: 4, rest: 90 }));
      }

      const fallbackExercises = targetNames.map((name: string, i: number) => {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const localMatch = LOCAL_EXERCISES_DICTIONARY.find(le => {
          const cleanLeName = le.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanLeName.includes(cleanName) || cleanName.includes(cleanLeName);
        });
        const config = parsedConfigs.find(c => c.name.toLowerCase() === name.toLowerCase());

        return {
          id: localMatch?.id || `temp-id-${name.replace(/\s+/g, '-').toLowerCase()}-${i}`,
          name: name,
          muscle_group: localMatch?.muscle_group || 'All Muscles',
          tier: localMatch?.tier || 'A',
          focus: localMatch?.focus || 'Hypertrophy',
          cue: localMatch?.cue || 'Maintain perfect execution control throughout the set.',
          rationale: localMatch?.rationale || 'Key exercise movement.',
          equipment: localMatch?.equipment || 'Gym Equipment',
          targetSets: config?.sets || 4,
          targetRest: config?.rest || 90
        };
      });

      activePlan = {
        type: dayType,
        title: `${dayType} Session`,
        exercises: fallbackExercises
      };
    } else if (!activePlan.exercises || activePlan.exercises.length === 0) {
      // Only prompt if it's actually a REST/RUN day and they clicked "Start Workout Anyway" or "Lift Weights Instead"
      const userChoice = window.prompt("Today is scheduled for Rest/Run.\n\nWhich program would you like to start? (Type your program name e.g. PUSH, UPPER)", "PUSH");
      if (!userChoice) return;
      
      const selectedType = userChoice.toUpperCase().trim();

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

      const targetNames = planMap[selectedType] || planMap['PUSH'];
      const fallbackExercises = targetNames.map((name: string, i: number) => {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const localMatch = LOCAL_EXERCISES_DICTIONARY.find(le => {
          const cleanLeName = le.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanLeName.includes(cleanName) || cleanName.includes(cleanLeName);
        });

        return {
          id: localMatch?.id || `temp-id-${name.replace(/\s+/g, '-').toLowerCase()}-${i}`,
          name: name,
          muscle_group: localMatch?.muscle_group || 'All Muscles',
          tier: localMatch?.tier || 'A',
          focus: localMatch?.focus || 'Hypertrophy',
          cue: localMatch?.cue || 'Maintain perfect execution control throughout the set.',
          rationale: localMatch?.rationale || 'Key exercise movement.',
          equipment: localMatch?.equipment || 'Gym Equipment',
          targetSets: 4,
          targetRest: 90
        };
      });

      activePlan = {
        type: selectedType,
        title: `${selectedType} Session`,
        exercises: fallbackExercises
      };
    }

    navigate('/workout/active', { state: { startNew: true, plan: activePlan } });
  };

  const handleDeleteSession = async (id: string) => {
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

  const isTodayCompleted = pastWorkouts.some(w => w.date === getLocalDateString());

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setShowAnalytics(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!showAnalytics ? 'bg-primary text-black' : 'text-slate-400'}`}
          >
            History
          </button>
          <button 
            onClick={() => setShowAnalytics(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${showAnalytics ? 'bg-primary text-black' : 'text-slate-400'}`}
          >
            <BarChart2 size={16} className={showAnalytics ? 'text-black' : ''} />
            <span>Insights</span>
          </button>
        </div>
      </motion.div>

      {showAnalytics ? (
        <AnalyticsCharts userId={currentUserId} />
      ) : (
        <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        {dayType === 'REST' ? (
          <div className="bg-surface border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-4xl mb-3">💤</span>
            <h2 className="text-xl font-bold text-white mb-2">Rest Day</h2>
            <p className="text-sm text-gray-400 mb-4">Recovery is part of training. Sleep well, hydrate, and hit the sauna if possible.</p>
            <button 
              onClick={handleStartWorkout}
              className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors active:scale-95 text-xs uppercase tracking-wider"
            >
              Start Workout Anyway
            </button>
          </div>
        ) : dayType === 'RUN' ? (
          <div className="bg-surface border border-blue-900/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/10">
            <span className="text-4xl mb-3">🏃</span>
            <h2 className="text-xl font-bold text-white mb-2">Run Day</h2>
            <p className="text-sm text-gray-400 mb-4">Time to hit the pavement. Focus on Zone 2 unless scheduled for tempo.</p>
            <div className="flex gap-3 w-full justify-center">
              <button 
                onClick={() => setShowRunModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors active:scale-95 text-xs uppercase tracking-wider"
              >
                Log Run
              </button>
              <button 
                onClick={handleStartWorkout}
                className="bg-gray-850 hover:bg-gray-800 text-gray-300 font-bold py-3 px-6 rounded-xl border border-gray-700 transition-colors active:scale-95 text-xs uppercase tracking-wider"
              >
                Lift Weights Instead
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <button 
              onClick={isTodayCompleted ? undefined : handleStartWorkout}
              disabled={isTodayCompleted}
              className={`w-full font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                isTodayCompleted 
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 shadow-none cursor-default' 
                  : workout || inProgressWorkout 
                    ? 'bg-yellow-500 text-black shadow-yellow-500/20' 
                    : 'bg-primary text-white shadow-primary/20'
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
                  <span className="text-xs font-semibold opacity-85 uppercase tracking-wide">Active session in progress</span>
                </>
              ) : inProgressWorkout ? (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <Play size={20} fill="currentColor" />
                    RESUME WORKOUT
                  </div>
                  <span className="text-xs font-semibold opacity-85 uppercase tracking-wide">Saved: {inProgressWorkout.day_type} (In Progress)</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <Play size={20} fill="currentColor" />
                    START TODAY'S WORKOUT
                  </div>
                  <span className="text-xs font-semibold opacity-85 uppercase tracking-wide">Scheduled: {todayPlan.type}</span>
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
                className="text-[11px] font-bold text-gray-500 hover:text-danger transition-colors py-1 px-3 mt-0.5 active:scale-95"
              >
                Restart Session & Start Fresh
              </button>
            )}
          </div>
        )}
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
              <SwipeToDeleteRow 
                key={session.id} 
                onDelete={() => handleDeleteSession(session.id)}
                backgroundRounded="rounded-xl"
              >
                <div 
                  onClick={() => navigate(`/workout/${session.id}`)}
                  className="bg-surface rounded-xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform w-full"
                >
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">{formatDate(session.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-800 text-gray-300 border-gray-700">
                        {session.day_type}
                      </span>
                      {(() => {
                        if (session.day_type === 'RUN' && session.notes && session.notes.includes('"type":"run_stats"')) {
                          try {
                            const stats = JSON.parse(session.notes);
                            return (
                              <>
                                <span className="text-sm font-bold text-blue-400">{stats.distance_km} km</span>
                                <span className="text-sm text-gray-400 border-l border-gray-700 pl-2">{stats.pace}/km</span>
                                <span className="text-sm text-gray-400 border-l border-gray-700 pl-2">{formatDuration(session.duration)}</span>
                              </>
                            );
                          } catch (e) {}
                        }
                        return (
                          <>
                            <span className="text-sm font-bold text-white">{session.total_volume} kg</span>
                            <span className="text-sm text-gray-400 border-l border-gray-700 pl-2">{formatDuration(session.duration)}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button className="text-primary hover:text-blue-400 transition-colors p-2 bg-gray-900 rounded-full">
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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-sm rounded-2xl p-6 border border-gray-800 shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🏃</span> Log Run
            </h3>
            
            <form onSubmit={handleLogRun} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Distance (km)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={runStats.distance}
                  onChange={e => setRunStats({...runStats, distance: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none"
                  placeholder="5.0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Elevation (m)</label>
                  <input 
                    type="number" 
                    value={runStats.elevation}
                    onChange={e => setRunStats({...runStats, elevation: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Avg Pace</label>
                  <input 
                    type="text" 
                    required
                    value={runStats.pace}
                    onChange={e => setRunStats({...runStats, pace: e.target.value})}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none"
                    placeholder="5:30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration (mins)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={runStats.duration}
                  onChange={e => setRunStats({...runStats, duration: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none"
                  placeholder="27.5"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowRunModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingRun}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmittingRun ? 'Saving...' : 'Save Run'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default WorkoutHome;
