import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Dumbbell, Activity, Calendar, Flame, Scale, Sparkles, TrendingUp, Trophy, ArrowRight, Zap, Target, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DumbbellLoader } from '../components/DumbbellLoader';

interface PRData {
  exerciseName: string;
  tier: string;
  best1RM: number;
  best1RMDate: string;
  maxWeight: number;
  maxWeightReps: number;
  maxWeightDate: string;
  totalSets: number;
  totalVolume: number;
}

interface RunLog {
  id: string;
  source: 'strava' | 'manual';
  name: string;
  date: string;
  distance_km: number;
  duration: number; // seconds
  elevation_m: number;
  pace: string;
  average_heartrate?: number;
  average_cadence?: number;
}

interface InBodyDelta {
  weight: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  smm: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  bfm: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  bf_percent: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  score: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  bmr: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
  visceralFat: { current: number; baseline: number; previous: number; deltaBase: number; deltaPrev: number };
}

const AnalyticsView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'workouts' | 'runs'>('insights');
  const [userName, setUserName] = useState('');
  
  // Data States
  const [totalWorkoutsCount, setTotalWorkoutsCount] = useState(0);
  const [workoutsHistory, setWorkoutsHistory] = useState<any[]>([]);
  const [runningLogs, setRunningLogs] = useState<RunLog[]>([]);
  const [prMap, setPrMap] = useState<PRData[]>([]);
  const [totalLiftingTonnage, setTotalLiftingTonnage] = useState(0);
  const [activeStreakCount, setActiveStreakCount] = useState(0);
  
  // Diet states
  const [dietConsistencyScore, setDietConsistencyScore] = useState(0);
  const [proteinConsistencyScore, setProteinConsistencyScore] = useState(0);
  const [dietLogsCount, setDietLogsCount] = useState(0);

  // InBody states
  const [inbodyDeltas, setInbodyDeltas] = useState<InBodyDelta | null>(null);
  const [hasInbodyData, setHasInbodyData] = useState(false);

  // Expandable list states
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        const userId = session.user.id;

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, targets')
          .eq('id', userId)
          .maybeSingle();
        setUserName(profile?.display_name || 'Athlete');
        const userTargets = profile?.targets || { kcal: 2500, protein: 155 };

        // 2. Fetch completed lifting workouts + exercises (single join)
        const { data: workoutExercisesData } = await supabase
          .from('workout_exercises')
          .select('*, workouts!inner(id, date, day_type, status, name, duration), exercises(name, tier)')
          .eq('workouts.user_id', userId)
          .eq('workouts.status', 'completed')
          .order('created_at', { ascending: true }); // chronological

        // 3. Fetch completed manual runs
        const { data: manualRunsData } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .eq('day_type', 'RUN')
          .eq('status', 'completed')
          .order('date', { ascending: false });

        // 4. Fetch Strava activities
        const { data: stravaRunsData } = await supabase
          .from('strava_activities')
          .select('*')
          .eq('athlete_id', userId)
          .order('start_date', { ascending: false });

        // 5. Fetch InBody scans
        const { data: inbodyScansData } = await supabase
          .from('inbody_scans')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true }); // chronological

        // 6. Fetch diet logs
        const { data: dietLogsData } = await supabase
          .from('diet_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        // ────────────────────────────────────────────────────────
        // PROCESSING RUNS (Combine Manual and Strava)
        // ────────────────────────────────────────────────────────
        const runsCombinedMap = new Map<string, RunLog>();
        
        // Strava activities first
        (stravaRunsData || []).forEach(r => {
          const dateStr = new Date(r.start_date).toISOString().split('T')[0];
          const distKm = (r.distance || 0) / 1000;
          const duration = r.moving_time || 0;
          const totalPaceSeconds = distKm > 0 ? duration / distKm : 0;
          const paceMins = Math.floor(totalPaceSeconds / 60);
          const paceSecs = Math.round(totalPaceSeconds % 60);
          const paceStr = distKm > 0 ? `${paceMins}:${paceSecs.toString().padStart(2, '0')}` : '0:00';
          
          const key = `${dateStr}-${distKm.toFixed(1)}`;
          runsCombinedMap.set(key, {
            id: r.id,
            source: 'strava',
            name: r.name || 'Strava Run',
            date: dateStr,
            distance_km: parseFloat(distKm.toFixed(2)),
            duration: duration,
            elevation_m: Math.round(r.elevation_gain || 0),
            pace: paceStr,
            average_heartrate: r.average_heartrate ? Math.round(r.average_heartrate) : undefined,
            average_cadence: r.average_cadence ? Math.round(r.average_cadence) : undefined
          });
        });

        // Manual runs
        (manualRunsData || []).forEach(w => {
          const dateStr = w.date;
          let distKm = 0;
          let elevationM = 0;
          let pace = '0:00';
          try {
            if (w.notes) {
              const parsed = JSON.parse(w.notes);
              distKm = parsed.distance_km || 0;
              elevationM = parsed.elevation_m || 0;
              pace = parsed.pace || '0:00';
            }
          } catch(e) {}
          
          const key = `${dateStr}-${distKm.toFixed(1)}`;
          if (!runsCombinedMap.has(key)) {
            runsCombinedMap.set(key, {
              id: w.id,
              source: 'manual',
              name: w.name || 'Manual Run',
              date: dateStr,
              distance_km: parseFloat(distKm.toFixed(2)),
              duration: w.duration || 0,
              elevation_m: elevationM,
              pace: pace
            });
          }
        });

        const allRuns = Array.from(runsCombinedMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRunningLogs(allRuns);

        // ────────────────────────────────────────────────────────
        // PROCESSING WORKOUTS & LIFTING PRs
        // ────────────────────────────────────────────────────────
        const workoutsMap = new Map<string, any>();
        const prsMap = new Map<string, PRData>();
        let runningVolumeTotal = 0;

        (workoutExercisesData || []).forEach(row => {
          const w = row.workouts;
          if (!w) return;

          // Collect workout detail structures for tab 2
          if (!workoutsMap.has(w.id)) {
            workoutsMap.set(w.id, {
              id: w.id,
              date: w.date,
              day_type: w.day_type,
              name: w.name || `${w.day_type} Session`,
              duration: w.duration || 0,
              exercises: []
            });
          }
          
          const sets = Array.isArray(row.sets) ? row.sets : [];
          const completedSets = sets.filter((s: any) => s.done);

          if (completedSets.length > 0) {
            workoutsMap.get(w.id).exercises.push({
              id: row.id,
              exercise_name: row.exercises?.name || 'Unknown Exercise',
              tier: row.exercises?.tier || 'B',
              notes: row.notes,
              sets: completedSets
            });
          }

          // Process sets for 1RM PRs
          const exName = row.exercises?.name || 'Unknown Exercise';
          const tier = row.exercises?.tier || 'B';

          completedSets.forEach((set: any) => {
            const weight = parseFloat(set.weight) || 0;
            const reps = parseInt(set.reps) || 0;
            if (weight <= 0 || reps <= 0) return;

            // Epley Formula: 1RM = w * (1 + r/30) (reps = 1 -> 1RM = weight)
            const oneRM = reps === 1 ? weight : weight * (1 + reps / 30);
            const volume = weight * reps;
            runningVolumeTotal += volume;

            let prEntry = prsMap.get(exName);
            if (!prEntry) {
              prEntry = {
                exerciseName: exName,
                tier: tier,
                best1RM: 0,
                best1RMDate: '',
                maxWeight: 0,
                maxWeightReps: 0,
                maxWeightDate: '',
                totalSets: 0,
                totalVolume: 0
              };
              prsMap.set(exName, prEntry);
            }

            prEntry.totalSets += 1;
            prEntry.totalVolume += volume;

            if (oneRM > prEntry.best1RM) {
              prEntry.best1RM = parseFloat(oneRM.toFixed(1));
              prEntry.best1RMDate = w.date;
            }

            if (weight > prEntry.maxWeight) {
              prEntry.maxWeight = weight;
              prEntry.maxWeightReps = reps;
              prEntry.maxWeightDate = w.date;
            }
          });
        });

        const sortedWorkouts = Array.from(workoutsMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setWorkoutsHistory(sortedWorkouts);
        setTotalWorkoutsCount(sortedWorkouts.length);
        setTotalLiftingTonnage(runningVolumeTotal);

        const sortedPRList = Array.from(prsMap.values()).sort((a, b) => b.best1RM - a.best1RM);
        setPrMap(sortedPRList);

        // ────────────────────────────────────────────────────────
        // PROCESSING INBODY DELTAS
        // ────────────────────────────────────────────────────────
        if (inbodyScansData && inbodyScansData.length > 0) {
          setHasInbodyData(true);
          const baseline = inbodyScansData[0];
          const previous = inbodyScansData.length > 1 ? inbodyScansData[inbodyScansData.length - 2] : baseline;
          const current = inbodyScansData[inbodyScansData.length - 1];

          const parseVal = (val: any) => parseFloat(val) || 0;
          const parseSegmental = (scan: any, key: string) => {
            if (scan?.segmental && typeof scan.segmental === 'object') {
              return parseFloat(scan.segmental[key]) || 0;
            }
            return 0;
          };

          const deltaObj: InBodyDelta = {
            weight: {
              current: parseVal(current.weight),
              baseline: parseVal(baseline.weight),
              previous: parseVal(previous.weight),
              deltaBase: parseFloat((parseVal(current.weight) - parseVal(baseline.weight)).toFixed(1)),
              deltaPrev: parseFloat((parseVal(current.weight) - parseVal(previous.weight)).toFixed(1))
            },
            smm: {
              current: parseVal(current.smm),
              baseline: parseVal(baseline.smm),
              previous: parseVal(previous.smm),
              deltaBase: parseFloat((parseVal(current.smm) - parseVal(baseline.smm)).toFixed(1)),
              deltaPrev: parseFloat((parseVal(current.smm) - parseVal(previous.smm)).toFixed(1))
            },
            bfm: {
              current: parseVal(current.bfm),
              baseline: parseVal(baseline.bfm),
              previous: parseVal(previous.bfm),
              deltaBase: parseFloat((parseVal(current.bfm) - parseVal(baseline.bfm)).toFixed(1)),
              deltaPrev: parseFloat((parseVal(current.bfm) - parseVal(previous.bfm)).toFixed(1))
            },
            bf_percent: {
              current: parseVal(current.bf_percent),
              baseline: parseVal(baseline.bf_percent),
              previous: parseVal(previous.bf_percent),
              deltaBase: parseFloat((parseVal(current.bf_percent) - parseVal(baseline.bf_percent)).toFixed(1)),
              deltaPrev: parseFloat((parseVal(current.bf_percent) - parseVal(previous.bf_percent)).toFixed(1))
            },
            score: {
              current: parseVal(current.score),
              baseline: parseVal(baseline.score),
              previous: parseVal(previous.score),
              deltaBase: Math.round(parseVal(current.score) - parseVal(baseline.score)),
              deltaPrev: Math.round(parseVal(current.score) - parseVal(previous.score))
            },
            bmr: {
              current: parseVal(current.bmr),
              baseline: parseVal(baseline.bmr),
              previous: parseVal(previous.bmr),
              deltaBase: Math.round(parseVal(current.bmr) - parseVal(baseline.bmr)),
              deltaPrev: Math.round(parseVal(current.bmr) - parseVal(previous.bmr))
            },
            visceralFat: {
              current: parseSegmental(current, 'visceralFat'),
              baseline: parseSegmental(baseline, 'visceralFat'),
              previous: parseSegmental(previous, 'visceralFat'),
              deltaBase: parseFloat((parseSegmental(current, 'visceralFat') - parseSegmental(baseline, 'visceralFat')).toFixed(1)),
              deltaPrev: parseFloat((parseSegmental(current, 'visceralFat') - parseSegmental(previous, 'visceralFat')).toFixed(1))
            }
          };
          setInbodyDeltas(deltaObj);
        } else {
          setHasInbodyData(false);
          setInbodyDeltas(null);
        }

        // ────────────────────────────────────────────────────────
        // PROCESSING DIET & MACRO CONSISTENCY
        // ────────────────────────────────────────────────────────
        setDietLogsCount(dietLogsData?.length || 0);
        if (dietLogsData && dietLogsData.length > 0) {
          const targetKcal = userTargets.kcal || 2500;
          const targetProtein = userTargets.protein || 155;
          let kcalCompliant = 0;
          let proteinCompliant = 0;

          dietLogsData.forEach(log => {
            const totals = log.daily_totals || { kcal: 0, protein: 0 };
            const kcal = totals.kcal || 0;
            const protein = totals.protein || 0;

            // Calorie compliance within +/- 10%
            if (kcal > 0 && Math.abs(kcal - targetKcal) <= targetKcal * 0.1) {
              kcalCompliant++;
            }
            // Protein compliance hit at least 90%
            if (protein > 0 && protein >= targetProtein * 0.9) {
              proteinCompliant++;
            }
          });

          const totalDays = dietLogsData.filter(log => log.daily_totals?.kcal > 0).length || 1;
          setDietConsistencyScore(Math.round((kcalCompliant / totalDays) * 100));
          setProteinConsistencyScore(Math.round((proteinCompliant / totalDays) * 100));
        }

        // ────────────────────────────────────────────────────────
        // PROCESSING HABIT STREAK
        // ────────────────────────────────────────────────────────
        const activeDatesSet = new Set<string>();
        
        allRuns.forEach(r => activeDatesSet.add(r.date));
        sortedWorkouts.forEach(w => activeDatesSet.add(w.date));
        (dietLogsData || []).forEach(log => {
          if (log.daily_totals?.kcal > 0) activeDatesSet.add(log.date);
        });
        (inbodyScansData || []).forEach(scan => activeDatesSet.add(scan.date));

        let currentStreak = 0;
        if (activeDatesSet.size > 0) {
          const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000).toISOString().split('T')[0];

          const hasToday = activeDatesSet.has(todayStr);
          const hasYesterday = activeDatesSet.has(yesterdayStr);

          if (hasToday || hasYesterday) {
            let checkDate = hasToday ? new Date() : yesterday;
            let checkDateStr = checkDate.toISOString().split('T')[0];

            while (activeDatesSet.has(checkDateStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
              checkDateStr = new Date(checkDate.getTime() - checkDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            }
          }
        }
        setActiveStreakCount(currentStreak);

      } catch (err) {
        console.error("Error generating analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <DumbbellLoader label="Calculating deep telemetry..." size={120} />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // NOVEL COMPARISONS CALCULATIONS
  // ────────────────────────────────────────────────────────
  const totalVolumeKm = runningLogs.reduce((sum, r) => sum + r.distance_km, 0);
  const totalElevationM = runningLogs.reduce((sum, r) => sum + r.elevation_m, 0);
  
  // Giza Pyramid Block = 2.5 tonnes (2500 kg), Egyptian Microbus = 2 tonnes (2000 kg)
  const microbussesLifted = totalLiftingTonnage / 2000;
  const pyramidBlocksLifted = totalLiftingTonnage / 2500;

  // Suez Canal = 193.3 km, Cairo to Alex = 220 km, Pyramid perimeter = 0.92 km
  const suezCanalsRun = totalVolumeKm / 193.3;
  const cairoAlexPct = Math.min((totalVolumeKm / 220) * 100, 100);

  // InBody Frying Oil: 1 Liter Oil = 0.9 kg.
  const fatOilBottles = inbodyDeltas ? Math.abs(inbodyDeltas.bfm.deltaBase) / 0.9 : 0;

  // Strength Tier calculation (Top 3 lift composite)
  const top3Composite = prMap.slice(0, 3).reduce((sum, pr) => sum + pr.best1RM, 0);
  let strengthTier = 'Bronze Athlete';
  let tierColor = 'text-gray-400 border-gray-400/30 bg-gray-500/10';
  if (top3Composite >= 600) {
    strengthTier = 'Olympian Titan ⚡';
    tierColor = 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10 shadow-lg shadow-yellow-500/10';
  } else if (top3Composite >= 450) {
    strengthTier = 'Diamond Athlete 💎';
    tierColor = 'text-cyan-400 border-cyan-400/30 bg-cyan-500/10';
  } else if (top3Composite >= 300) {
    strengthTier = 'Platinum Athlete 🏆';
    tierColor = 'text-indigo-400 border-indigo-400/30 bg-indigo-500/10';
  } else if (top3Composite >= 200) {
    strengthTier = 'Gold Athlete 🥇';
    tierColor = 'text-amber-400 border-amber-400/30 bg-amber-500/10';
  } else if (top3Composite >= 100) {
    strengthTier = 'Silver Athlete 🥈';
    tierColor = 'text-slate-300 border-slate-300/30 bg-slate-500/10';
  }

  // Format pace helper (sec to pace)
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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background pb-28 text-gray-200">
      {/* Premium Header */}
      <div className="bg-[#07080e]/95 backdrop-blur-md px-4 pb-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-md" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <button onClick={() => navigate('/')} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <div className="text-center font-bold text-white tracking-tight flex items-center gap-1.5 uppercase text-xs">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span>Athlete Insights</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Main Container */}
      <div className="px-4 pt-6 flex flex-col gap-6 w-full sm:max-w-[390px] mx-auto overflow-x-hidden">
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-950 p-1 rounded-2xl border border-gray-850 shadow-inner w-full shrink-0">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'insights' ? 'bg-[#0f172a] text-primary border border-blue-900/20 shadow-md' : 'text-gray-450 hover:text-white'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'workouts' ? 'bg-[#0f172a] text-primary border border-blue-900/20 shadow-md' : 'text-gray-450 hover:text-white'}`}
          >
            Lifts history
          </button>
          <button 
            onClick={() => setActiveTab('runs')}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'runs' ? 'bg-[#0f172a] text-primary border border-blue-900/20 shadow-md' : 'text-gray-450 hover:text-white'}`}
          >
            Runs history
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'insights' && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6 w-full"
            >
              {/* Active Streak Card */}
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-primary">
                  <Flame size={120} />
                </div>
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Habit Streak</span>
                  <div className="flex items-baseline gap-1 text-white font-black">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                      {activeStreakCount}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">days</span>
                  </div>
                  <span className="text-[9px] text-gray-455 font-bold mt-1 uppercase">Logged workouts, diet, water or scans</span>
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500">
                  <Flame size={24} className="animate-bounce" />
                </div>
              </div>

              {/* Strength & PR Index Card */}
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#3b82f6]/10 text-primary border border-blue-900/25 rounded-lg">
                      <Trophy size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Strength Class Index</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${tierColor}`}>
                    {strengthTier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-550 uppercase font-extrabold tracking-wider leading-none">Tonnage Lifted</span>
                    <span className="text-lg font-black text-white">{totalLiftingTonnage.toLocaleString()} <span className="text-xs font-semibold text-gray-500">kg</span></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-555 uppercase font-extrabold tracking-wider leading-none">Top 3 Lift index</span>
                    <span className="text-lg font-black text-primary">{Math.round(top3Composite)} <span className="text-xs font-semibold text-gray-500">kg</span></span>
                  </div>
                </div>

                {/* Fun comparison statement */}
                {totalLiftingTonnage > 0 && (
                  <div className="bg-[#3b82f6]/5 border border-blue-900/20 rounded-2xl p-3 text-[11px] leading-relaxed text-gray-300 font-medium">
                    🚐 **Egyptian Insight**: You've lifted a cumulative total equivalent to **{microbussesLifted.toFixed(1)} Egyptian microbusses** or **{pyramidBlocksLifted.toFixed(2)} limestone blocks** of the Great Giza Pyramid!
                  </div>
                )}

                {/* Calculated PRs Quick Summary */}
                {prMap.length > 0 ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest pl-0.5">Best Estimated 1-Rep Maxes</span>
                    <div className="flex flex-col gap-1.5">
                      {prMap.slice(0, 3).map((pr, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900 text-xs font-semibold">
                          <span className="text-gray-300 truncate max-w-[180px]">{pr.exerciseName}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-white font-extrabold">{Math.round(pr.best1RM)}kg</span>
                            <span className="text-[9px] text-gray-550">1RM</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2 font-medium">No lift exercises logged to estimate PRs yet.</p>
                )}
              </div>

              {/* Running Performance Card */}
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#10b981]/10 text-success border border-emerald-900/25 rounded-lg">
                      <Activity size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Running Performance</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-555 uppercase font-extrabold tracking-wider leading-none">Total Distance</span>
                    <span className="text-lg font-black text-success">{totalVolumeKm.toFixed(1)} <span className="text-xs font-semibold text-gray-500">km</span></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-555 uppercase font-extrabold tracking-wider leading-none">Elevation Gained</span>
                    <span className="text-lg font-black text-white">{totalElevationM} <span className="text-xs font-semibold text-gray-500">m</span></span>
                  </div>
                </div>

                {/* Running fun insight */}
                {totalVolumeKm > 0 && (
                  <div className="bg-[#10b981]/5 border border-emerald-900/20 rounded-2xl p-3 text-[11px] leading-relaxed text-gray-300 font-medium space-y-1.5">
                    <div>
                      🚢 **Suez Canal**: Your running mileage is equivalent to running **{suezCanalsRun.toFixed(2)} times the entire length** of the Suez Canal!
                    </div>
                    {cairoAlexPct > 0 && (
                      <div className="w-full bg-gray-900 rounded-full h-1 mt-1 overflow-hidden">
                        <div className="bg-success h-1 rounded-full" style={{ width: `${cairoAlexPct}%` }}></div>
                      </div>
                    )}
                    <div className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-wider leading-none">
                      {cairoAlexPct >= 100 ? "You completed the Cairo-Alexandria highway! 🛣️" : `Cairo to Alexandria progress: ${Math.round(cairoAlexPct)}%`}
                    </div>
                  </div>
                )}
              </div>

              {/* InBody Scan Progress Card */}
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-purple-900/25 rounded-lg">
                      <Scale size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">InBody Improvements</span>
                  </div>
                  {hasInbodyData && (
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider">
                      Baseline vs. Latest
                    </span>
                  )}
                </div>

                {hasInbodyData && inbodyDeltas ? (
                  <div className="flex flex-col gap-4">
                    {/* Muscle and Fat deltas */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-emerald-950/20 border border-emerald-500/25 p-3 rounded-2xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Skeletal Muscle Mass</span>
                        <span className={`text-base font-black ${inbodyDeltas.smm.deltaBase >= 0 ? 'text-success' : 'text-danger'}`}>
                          {inbodyDeltas.smm.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.smm.deltaBase} kg
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Base: {inbodyDeltas.smm.baseline}kg → {inbodyDeltas.smm.current}kg</span>
                      </div>
                      <div className="bg-red-950/20 border border-red-500/25 p-3 rounded-2xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Body Fat Mass</span>
                        <span className={`text-base font-black ${inbodyDeltas.bfm.deltaBase <= 0 ? 'text-success' : 'text-danger'}`}>
                          {inbodyDeltas.bfm.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.bfm.deltaBase} kg
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Base: {inbodyDeltas.bfm.baseline}kg → {inbodyDeltas.bfm.current}kg</span>
                      </div>
                    </div>

                    {/* Weight and BF deltas */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Total Weight</span>
                        <span className="text-base font-black text-white">
                          {inbodyDeltas.weight.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.weight.deltaBase} kg
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Base: {inbodyDeltas.weight.baseline}kg → {inbodyDeltas.weight.current}kg</span>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Body Fat Percent</span>
                        <span className={`text-base font-black ${inbodyDeltas.bf_percent.deltaBase <= 0 ? 'text-success' : 'text-danger'}`}>
                          {inbodyDeltas.bf_percent.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.bf_percent.deltaBase}%
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Base: {inbodyDeltas.bf_percent.baseline}% → {inbodyDeltas.bf_percent.current}%</span>
                      </div>
                    </div>

                    {/* Giza / Local comparisons */}
                    {(Math.abs(inbodyDeltas.smm.deltaBase) > 0 || Math.abs(inbodyDeltas.bfm.deltaBase) > 0) && (
                      <div className="bg-[#8b5cf6]/5 border border-purple-900/20 rounded-2xl p-3 text-[11px] leading-relaxed text-gray-300 font-medium space-y-1">
                        {inbodyDeltas.smm.deltaBase > 0 && (
                          <div>
                            💪 **Muscle gain**: You built **{inbodyDeltas.smm.deltaBase} kg** of muscle mass! That's like adding the weight of **{(inbodyDeltas.smm.deltaBase * 2).toFixed(1)} standard gym plates** of solid granite!
                          </div>
                        )}
                        {inbodyDeltas.bfm.deltaBase < 0 && (
                          <div>
                            🔥 **Fat loss**: You burned **{Math.abs(inbodyDeltas.bfm.deltaBase)} kg** of fat! That's equivalent to replacing **{fatOilBottles.toFixed(1)} standard bottles of frying oil** 🫗 with pure athletic engine power!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-gray-900/40 rounded-2xl border border-gray-800/80">
                    <p className="text-xs text-gray-400 mb-2">You need at least 1 logged scan to calculate InBody changes</p>
                    <button onClick={() => navigate('/inbody')} className="text-xs text-primary font-bold hover:underline">
                      Log First Scan →
                    </button>
                  </div>
                )}
              </div>

              {/* Diet Consistency Score Card */}
              <div className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-900/25 rounded-lg">
                      <Apple size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Nutrition Consistency</span>
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider">
                    {dietLogsCount} Logs
                  </span>
                </div>

                {dietLogsCount > 0 ? (
                  <div className="flex flex-col gap-4 text-xs font-semibold">
                    {/* Calorie compliance bar */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-bold text-gray-400">
                        <span>Calorie Compliance (±10% Target)</span>
                        <span className="text-white font-black">{dietConsistencyScore}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${dietConsistencyScore}%` }}></div>
                      </div>
                    </div>

                    {/* Protein compliance bar */}
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-bold text-gray-400">
                        <span>Protein Goal Consistency (≥90% Target)</span>
                        <span className="text-white font-black">{proteinConsistencyScore}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${proteinConsistencyScore}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-900/20 rounded-2xl p-3 text-[11px] leading-relaxed text-gray-300 font-medium mt-1">
                      🍏 **Coach Feedback**: {dietConsistencyScore >= 80 ? "Phenomenal nutritional consistency! You're providing your muscles with the perfect ratio of recovery fuel. Keep it up! 🚀" : dietConsistencyScore >= 50 ? "Decent food tracking! Try focusing on keeping your calorie intake closer to target ranges on rest days. 📈" : "Consistency is key. Logging your meals every day, even when you go off plan, helps build the habit. Let's pick it up! 🤝"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-gray-900/40 rounded-2xl border border-gray-800/80">
                    <p className="text-xs text-gray-400 mb-2">No diet logs found in database</p>
                    <button onClick={() => navigate('/diet')} className="text-xs text-amber-500 font-bold hover:underline">
                      Log First Meal →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* LIFTING PR & HISTORY TAB */}
          {activeTab === 'workouts' && (
            <motion.div
              key="workouts-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 w-full"
            >
              <h3 className="text-[10px] text-gray-550 uppercase font-black tracking-widest pl-1 mt-1">Lifting PR Library (Estimated 1RM)</h3>
              
              {prMap.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {prMap.map((pr, idx) => (
                    <div key={idx} className="bg-surface rounded-2xl border border-gray-800 p-4 shadow-md flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-gray-800/60 pb-2">
                        <span className="font-extrabold text-white text-sm truncate max-w-[200px]">{pr.exerciseName}</span>
                        {pr.tier && (
                          <span className="text-[9px] font-black bg-gray-900 text-gray-400 border border-gray-800 px-2 py-0.5 rounded-full uppercase leading-none">
                            Tier {pr.tier}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Est 1-Rep Max</span>
                          <span className="font-black text-primary text-sm">{Math.round(pr.best1RM)} kg</span>
                          <span className="text-[7px] text-gray-500 font-semibold uppercase mt-0.5">{pr.best1RMDate}</span>
                        </div>
                        <div className="flex flex-col border-x border-gray-800/80">
                          <span className="text-[8px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Max Weight</span>
                          <span className="font-black text-white text-sm">{pr.maxWeight} kg</span>
                          <span className="text-[7px] text-gray-500 font-semibold uppercase mt-0.5">{pr.maxWeightReps} reps</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Total Sets / Vol</span>
                          <span className="font-black text-gray-300 text-sm">{pr.totalSets} <span className="text-[10px] text-gray-500 font-normal">sets</span></span>
                          <span className="text-[7px] text-gray-500 font-bold uppercase mt-0.5">{Math.round(pr.totalVolume).toLocaleString()}kg vol</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-surface rounded-3xl border border-gray-800">
                  <p className="text-xs text-gray-405">No completed exercises found to calculate PRs.</p>
                </div>
              )}

              <div className="w-full border-t border-white/10 my-4" />

              <h3 className="text-[10px] text-gray-550 uppercase font-black tracking-widest pl-1">All Workouts Ever Logged</h3>
              {workoutsHistory.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {workoutsHistory.map((workout) => {
                    const isExpanded = expandedWorkoutId === workout.id;
                    const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);

                    return (
                      <div key={workout.id} className="bg-surface rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
                        {/* Summary Header */}
                        <div 
                          onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800/20 transition-colors"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none">
                              {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="font-black text-white text-sm">{workout.name}</span>
                            <span className="text-[9px] text-primary font-bold uppercase mt-0.5">{workout.day_type} session</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col text-right">
                              <span className="text-xs font-black text-white">{totalSets} Sets</span>
                              <span className="text-[9px] text-gray-550 font-bold">{formatDuration(workout.duration)}</span>
                            </div>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="bg-gray-950/40 border-t border-gray-900 p-3.5 flex flex-col gap-3">
                            {workout.exercises.map((ex: any) => (
                              <div key={ex.id} className="flex flex-col gap-1.5 bg-gray-900/30 p-2.5 rounded-xl border border-gray-900/50">
                                <div className="flex justify-between items-center text-xs font-extrabold border-b border-gray-900/80 pb-1">
                                  <span className="text-gray-300 truncate max-w-[220px]">{ex.exercise_name}</span>
                                  <span className="text-[9px] text-gray-550 uppercase">Tier {ex.tier}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {ex.sets.map((set: any, setIdx: number) => (
                                    <div key={setIdx} className="flex justify-between items-center text-[11px] font-semibold text-gray-400">
                                      <span>Set {set.setNum}</span>
                                      <span className="text-white font-extrabold">{set.weight} kg × {set.reps} reps <span className="text-[10px] text-gray-550 font-normal">@{set.rpe} RPE</span></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-surface rounded-3xl border border-gray-800">
                  <p className="text-xs text-gray-400">No lifting history logged yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* RUNNING PERFORMANCE HISTORY TAB */}
          {activeTab === 'runs' && (
            <motion.div
              key="runs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 w-full"
            >
              <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1 mt-1">Completed Runs Timeline</h3>
              
              {runningLogs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {runningLogs.map((run) => (
                    <div key={run.id} className="bg-surface rounded-2xl border border-gray-800 p-4 shadow-sm flex flex-col gap-3.5">
                      {/* Run Header */}
                      <div className="flex justify-between items-start border-b border-gray-800/80 pb-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-gray-550 uppercase font-black tracking-widest leading-none">
                            {new Date(run.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <h4 className="font-black text-white text-sm leading-tight truncate max-w-[200px]">{run.name}</h4>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${run.source === 'strava' ? 'bg-orange-500/10 text-orange-400 border-orange-500/25' : 'bg-blue-500/10 text-blue-400 border-blue-500/25'}`}>
                          {run.source}
                        </span>
                      </div>

                      {/* Run Stats */}
                      <div className="grid grid-cols-4 gap-1 text-center text-xs font-semibold text-gray-400">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] text-gray-550 uppercase font-bold tracking-wider leading-none mb-1">Distance</span>
                          <span className="font-black text-success text-sm leading-tight">{run.distance_km} <span className="text-[9px] font-normal text-gray-505">km</span></span>
                        </div>
                        <div className="flex flex-col border-l border-gray-850">
                          <span className="text-[7.5px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Pace</span>
                          <span className="font-black text-white text-sm leading-tight">{run.pace} <span className="text-[9px] font-normal text-gray-505">/km</span></span>
                        </div>
                        <div className="flex flex-col border-l border-gray-850">
                          <span className="text-[7.5px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Duration</span>
                          <span className="font-black text-white text-sm leading-tight">{formatDuration(run.duration)}</span>
                        </div>
                        <div className="flex flex-col border-l border-gray-850">
                          <span className="text-[7.5px] text-gray-555 uppercase font-bold tracking-wider leading-none mb-1">Elevation</span>
                          <span className="font-black text-white text-sm leading-tight">{run.elevation_m}m</span>
                        </div>
                      </div>

                      {/* Optional Cadence / Heart rate */}
                      {(run.average_heartrate || run.average_cadence) && (
                        <div className="bg-gray-950/60 rounded-xl p-2.5 border border-gray-900 flex justify-around text-center text-[10px] font-bold text-gray-555 leading-none">
                          {run.average_heartrate && (
                            <div>
                              <span>Heart Rate: </span>
                              <span className="text-white font-extrabold">{run.average_heartrate} bpm</span>
                            </div>
                          )}
                          {run.average_cadence && (
                            <div>
                              <span>Cadence: </span>
                              <span className="text-white font-extrabold">{run.average_cadence} spm</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-surface rounded-3xl border border-gray-800">
                  <p className="text-xs text-gray-400">No runs logged yet.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Spacer for safe area bottom */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};

export default AnalyticsView;
