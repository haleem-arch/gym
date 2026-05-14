import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useSchedule } from '../hooks/useSchedule';
import { Play, History, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { BarChart2 } from 'lucide-react';

const WorkoutHome = () => {
  const navigate = useNavigate();
  const { workout, loadWorkout } = useActiveWorkout();
  
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

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
      } else if (planMap[dayType]) {
        // Fetch custom plan from database if it exists
        const { data: customPlan } = await supabase
          .from('user_workout_plans')
          .select('exercises')
          .eq('user_id', session.user.id)
          .eq('plan_type', dayType)
          .maybeSingle();

        const targetNames = (customPlan?.exercises && customPlan.exercises.length > 0) 
          ? customPlan.exercises 
          : planMap[dayType];

        const { data: exData } = await supabase
          .from('exercises')
          .select('*')
          .in('name', targetNames);
          
        if (exData && exData.length > 0) {
          // Sort to match the plan's exact order
          const sorted = [...exData].sort((a, b) => targetNames.indexOf(a.name) - targetNames.indexOf(b.name));
          setTodayPlan((prev: any) => ({ ...prev, exercises: sorted }));
        }
      }
      
      setLoading(false);
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
      // Resume from Supabase
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
    }

    // Start fresh
    if (todayPlan.exercises.length === 0) {
      alert("Loading exercises, please wait a second...");
      return;
    }
    navigate('/workout/active', { state: { startNew: true, plan: todayPlan } });
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
            <p className="text-sm text-gray-400">Recovery is part of training. Sleep well, hydrate, and hit the sauna if possible.</p>
          </div>
        ) : dayType === 'RUN' ? (
          <div className="bg-surface border border-blue-900/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/10">
            <span className="text-4xl mb-3">🏃</span>
            <h2 className="text-xl font-bold text-white mb-2">Run Day</h2>
            <p className="text-sm text-gray-400 mb-4">Time to hit the pavement. Focus on Zone 2 unless scheduled for tempo.</p>
            <button 
              onClick={() => setShowRunModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-colors active:scale-95"
            >
              Log Run
            </button>
          </div>
        ) : (
          <button 
            onClick={handleStartWorkout}
            className={`w-full font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors active:scale-[0.98] shadow-lg ${
              workout || inProgressWorkout ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 'bg-primary text-white shadow-primary/20'
            }`}
          >
            {workout ? (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
