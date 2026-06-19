import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Activity, Flame, Scale, Sparkles, Trophy, Apple, 
  Dumbbell, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DumbbellLoader } from '../components/DumbbellLoader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

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
  const [inbodyHistory, setInbodyHistory] = useState<any[]>([]);
  const [dietHistory, setDietHistory] = useState<any[]>([]);

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

        const getTableMeta = async (table: string, userCol: string) => {
          let query = supabase
            .from(table)
            .select('id, updated_at')
            .eq(userCol, userId);
          
          if (table === 'workouts') {
            query = query.eq('status', 'completed');
          } else if (table === 'inbody_scans') {
            query = query.is('deleted_at', null);
          }
          
          const { data } = await query;
          if (!data) return { count: 0, maxUpdated: '' };
          
          const count = data.length;
          let maxUpdated = '';
          data.forEach((row: any) => {
            if (row.updated_at && (!maxUpdated || row.updated_at > maxUpdated)) {
              maxUpdated = row.updated_at;
            }
          });
          return { count, maxUpdated };
        };

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, targets')
          .eq('id', userId)
          .maybeSingle();
        setUserName(profile?.display_name || 'Athlete');
        const userTargets = profile?.targets || { kcal: 2500, protein: 155 };

        // Fetch metadata of other tables
        const workoutsMeta = await getTableMeta('workouts', 'user_id');
        const stravaMeta = await getTableMeta('strava_activities', 'athlete_id');
        const inbodyMeta = await getTableMeta('inbody_scans', 'user_id');
        const dietMeta = await getTableMeta('diet_logs', 'user_id');

        const metaKey = JSON.stringify({
          userId,
          targets: userTargets,
          workouts: workoutsMeta,
          strava: stravaMeta,
          inbody: inbodyMeta,
          diet: dietMeta
        });

        const cachedData = localStorage.getItem(`athlete_analytics_cache_${userId}`);
        const cachedMeta = localStorage.getItem(`athlete_analytics_meta_${userId}`);

        if (cachedData && cachedMeta && cachedMeta === metaKey) {
          const parsed = JSON.parse(cachedData);
          setUserName(parsed.userName || 'Athlete');
          setWorkoutsHistory(parsed.workoutsHistory);
          setRunningLogs(parsed.runningLogs);
          setPrMap(parsed.prMap);
          setTotalLiftingTonnage(parsed.totalLiftingTonnage);
          setActiveStreakCount(parsed.activeStreakCount);
          setDietConsistencyScore(parsed.dietConsistencyScore);
          setProteinConsistencyScore(parsed.proteinConsistencyScore);
          setDietLogsCount(parsed.dietLogsCount);
          setInbodyDeltas(parsed.inbodyDeltas);
          setHasInbodyData(parsed.hasInbodyData);
          setInbodyHistory(parsed.inbodyHistory || []);
          setDietHistory(parsed.dietHistory || []);
          setLoading(false);
          return;
        }

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
        setTotalLiftingTonnage(runningVolumeTotal);

        const sortedPRList = Array.from(prsMap.values()).sort((a, b) => b.best1RM - a.best1RM);
        setPrMap(sortedPRList);

        // ────────────────────────────────────────────────────────
        // PROCESSING INBODY DELTAS
        // ────────────────────────────────────────────────────────
        let deltaObj: InBodyDelta | null = null;
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

          deltaObj = {
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
        let kcalCompliant = 0;
        let proteinCompliant = 0;
        let totalDays = 1;

        setDietLogsCount(dietLogsData?.length || 0);
        if (dietLogsData && dietLogsData.length > 0) {
          const targetKcal = userTargets.kcal || 2500;
          const targetProtein = userTargets.protein || 155;

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

          totalDays = dietLogsData.filter(log => log.daily_totals?.kcal > 0).length || 1;
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

        const dietConsistencyScoreVal = dietLogsData && dietLogsData.length > 0
          ? Math.round((kcalCompliant / totalDays) * 100)
          : 0;
        const proteinConsistencyScoreVal = dietLogsData && dietLogsData.length > 0
          ? Math.round((proteinCompliant / totalDays) * 100)
          : 0;
        const hasInbodyDataVal = !!(inbodyScansData && inbodyScansData.length > 0);

        setInbodyHistory(inbodyScansData || []);
        setDietHistory(dietLogsData || []);

        const dataToCache = {
          userName: profile?.display_name || 'Athlete',
          workoutsHistory: sortedWorkouts,
          runningLogs: allRuns,
          prMap: sortedPRList,
          totalLiftingTonnage: runningVolumeTotal,
          activeStreakCount: currentStreak,
          dietConsistencyScore: dietConsistencyScoreVal,
          proteinConsistencyScore: proteinConsistencyScoreVal,
          dietLogsCount: dietLogsData?.length || 0,
          inbodyDeltas: deltaObj,
          hasInbodyData: hasInbodyDataVal,
          inbodyHistory: inbodyScansData || [],
          dietHistory: dietLogsData || []
        };
        localStorage.setItem(`athlete_analytics_cache_${userId}`, JSON.stringify(dataToCache));
        localStorage.setItem(`athlete_analytics_meta_${userId}`, metaKey);

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
  let tierColor = 'text-slate-400 border-slate-800 bg-slate-900/10';
  if (top3Composite >= 600) {
    strengthTier = 'Olympian Titan';
    tierColor = 'text-blue-400 border-blue-900/30 bg-blue-950/10 shadow-lg shadow-blue-500/5';
  } else if (top3Composite >= 450) {
    strengthTier = 'Diamond Athlete';
    tierColor = 'text-cyan-400 border-cyan-900/30 bg-cyan-950/10';
  } else if (top3Composite >= 300) {
    strengthTier = 'Platinum Athlete';
    tierColor = 'text-slate-300 border-slate-700 bg-slate-800/15';
  } else if (top3Composite >= 200) {
    strengthTier = 'Gold Athlete';
    tierColor = 'text-yellow-500/85 border-yellow-900/20 bg-yellow-950/5';
  } else if (top3Composite >= 100) {
    strengthTier = 'Silver Athlete';
    tierColor = 'text-slate-400 border-slate-850 bg-slate-900/10';
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

  // ────────────────────────────────────────────────────────
  // CHART DATA PREPARATION
  // ────────────────────────────────────────────────────────
  const inbodyChartData = inbodyHistory.map(scan => ({
    date: new Date(scan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Weight: parseFloat(scan.weight) || 0,
    Muscle: parseFloat(scan.smm) || 0,
    Fat: parseFloat(scan.bfm) || 0
  }));

  const dietTrendData = dietHistory.slice(0, 7).reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Calories: log.daily_totals?.kcal || 0
  }));

  const liftsTrendData = workoutsHistory.slice(0, 10).reverse().map(w => {
    let volume = 0;
    w.exercises.forEach((ex: any) => {
      ex.sets.forEach((s: any) => {
        volume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
      });
    });
    return {
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Volume: volume
    };
  });

  const runsTrendData = runningLogs.slice(0, 10).reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Distance: r.distance_km
  }));

  // Radar data calculations
  const powerScore = Math.min(Math.round((top3Composite / 550) * 100), 100);
  const staminaScore = Math.min(Math.round((totalVolumeKm / 100) * 100), 100);
  const diligenceScore = Math.min(Math.round(((workoutsHistory.length + runningLogs.length) / 25) * 100), 100);
  const radarData = [
    { subject: 'Power (Lifts)', value: powerScore, fullMark: 100 },
    { subject: 'Stamina (Runs)', value: staminaScore, fullMark: 100 },
    { subject: 'Diet (Calories)', value: dietConsistencyScore, fullMark: 100 },
    { subject: 'Fuel (Protein)', value: proteinConsistencyScore, fullMark: 100 },
    { subject: 'Diligence (Log)', value: diligenceScore, fullMark: 100 }
  ];

  // Nutrition Pie Chart Calculations
  let avgProtein = 0;
  let avgCarbs = 0;
  let avgFat = 0;
  let hasNutritionData = false;
  if (dietHistory && dietHistory.length > 0) {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let loggedDays = 0;
    dietHistory.forEach(log => {
      const totals = log.daily_totals;
      if (totals && (totals.protein > 0 || totals.carbs > 0 || totals.fat > 0)) {
        totalProtein += totals.protein || 0;
        totalCarbs += totals.carbs || 0;
        totalFat += totals.fat || 0;
        loggedDays++;
      }
    });
    if (loggedDays > 0) {
      avgProtein = Math.round(totalProtein / loggedDays);
      avgCarbs = Math.round(totalCarbs / loggedDays);
      avgFat = Math.round(totalFat / loggedDays);
      hasNutritionData = true;
    }
  }

  const macroCalorieData = [
    { name: 'Protein', value: Math.round(avgProtein * 4), grams: avgProtein, color: '#3b82f6' },
    { name: 'Carbs', value: Math.round(avgCarbs * 4), grams: avgCarbs, color: '#94a3b8' },
    { name: 'Fat', value: Math.round(avgFat * 9), grams: avgFat, color: '#06b6d4' }
  ];
  const totalMacroKcal = macroCalorieData.reduce((sum, item) => sum + item.value, 0);

  // Workout Splits Pie Chart Calculations
  const splitFrequencies: Record<string, number> = {};
  workoutsHistory.forEach(w => {
    const type = w.day_type || 'GYM';
    splitFrequencies[type] = (splitFrequencies[type] || 0) + 1;
  });
  const splitChartData = Object.entries(splitFrequencies).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);
  const totalWorkoutSessions = splitChartData.reduce((sum, item) => sum + item.value, 0);

  const splitColors: Record<string, string> = {
    PUSH: '#3b82f6',
    PULL: '#06b6d4',
    LEGS: '#64748b',
    RUN: '#f59e0b',
    REST: '#1e293b'
  };
  const getSplitColor = (name: string, index: number) => {
    if (splitColors[name.toUpperCase()]) return splitColors[name.toUpperCase()];
    const colors = ['#3b82f6', '#06b6d4', '#64748b', '#94a3b8', '#475569'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#030712] pb-28 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Premium Header */}
      <div className="bg-[#07080e]/95 backdrop-blur-md px-4 pb-4 border-b border-slate-900 sticky top-0 z-30 flex items-center justify-between shadow-md" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <button onClick={() => navigate('/')} className="p-2.5 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div className="text-center font-black text-white tracking-widest flex items-center gap-2 uppercase text-xs">
          <Sparkles size={14} className="text-blue-500 animate-pulse" />
          <span>{userName ? `${userName}'s Insights` : 'Athlete Insights'}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Container */}
      <div className="px-4 pt-6 flex flex-col gap-6 w-full sm:max-w-[390px] mx-auto overflow-x-hidden">
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-inner w-full shrink-0">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'insights' ? 'bg-[#0f172a] text-blue-400 border border-blue-900/20 shadow-md' : 'text-slate-500 hover:text-white'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'workouts' ? 'bg-[#0f172a] text-blue-400 border border-blue-900/20 shadow-md' : 'text-slate-500 hover:text-white'}`}
          >
            Lifts
          </button>
          <button 
            onClick={() => setActiveTab('runs')}
            className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'runs' ? 'bg-[#0f172a] text-blue-400 border border-blue-900/20 shadow-md' : 'text-slate-500 hover:text-white'}`}
          >
            Runs
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
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-blue-500">
                  <Flame size={120} />
                </div>
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active Streak</span>
                  <div className="flex items-baseline gap-1 text-white font-black">
                    <span className="text-3xl font-black text-blue-400">
                      {activeStreakCount}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">days</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Lifts, runs, diet, or scans logged</span>
                </div>
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                  <Flame size={20} />
                </div>
              </div>

              {/* Athletic Radar Profile */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-900/20 rounded-xl">
                    <Activity size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Athletic Performance Profile</span>
                </div>
                <div className="w-full h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={8} tickCount={6} />
                      <Radar name="Athlete" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[9px] text-slate-500 text-center uppercase font-bold tracking-wider leading-none">
                  Multi-dimensional analysis based on your logged statistics
                </div>
              </div>

              {/* Strength & PR Index Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-900/20 rounded-xl">
                      <Trophy size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Strength Index</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${tierColor}`}>
                    {strengthTier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider leading-none">Tonnage Lifted</span>
                    <span className="text-base font-black text-white">{totalLiftingTonnage.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kg</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider leading-none">Top 3 Index</span>
                    <span className="text-base font-black text-blue-400">{Math.round(top3Composite)} <span className="text-[10px] font-normal text-slate-500">kg</span></span>
                  </div>
                </div>

                {totalLiftingTonnage > 0 && (
                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-300">
                    <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 leading-none">Egyptian Equivalency</div>
                    You have lifted a cumulative total equivalent to approximately <span className="text-blue-400 font-bold">{microbussesLifted.toFixed(1)}</span> Egyptian microbusses or <span className="text-blue-400 font-bold">{pyramidBlocksLifted.toFixed(2)}</span> limestone blocks of the Great Giza Pyramid.
                  </div>
                )}
              </div>

              {/* Running Performance Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-900/20 rounded-xl">
                      <Activity size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Running Telemetry</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider leading-none">Total Distance</span>
                    <span className="text-base font-black text-white">{totalVolumeKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">km</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider leading-none">Elevation Gained</span>
                    <span className="text-base font-black text-white">{totalElevationM} <span className="text-[10px] font-normal text-slate-500">m</span></span>
                  </div>
                </div>

                {totalVolumeKm > 0 && (
                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-300 space-y-3">
                    <div>
                      <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 leading-none">Suez Canal Equivalency</div>
                      Your running mileage is equivalent to running <span className="text-blue-400 font-bold">{suezCanalsRun.toFixed(2)}</span> times the entire length of the Suez Canal.
                    </div>
                    {cairoAlexPct > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">
                          <span>Cairo-Alex Highway Progress</span>
                          <span className="text-blue-400">{Math.round(cairoAlexPct)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${cairoAlexPct}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* InBody Scan Progress Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-900/20 rounded-xl">
                      <Scale size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">InBody Progress</span>
                  </div>
                  {hasInbodyData && (
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider">
                      Baseline vs Latest
                    </span>
                  )}
                </div>

                {hasInbodyData && inbodyDeltas ? (
                  <div className="flex flex-col gap-5">
                    {/* Muscle and Fat deltas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[8px] text-slate-550 uppercase font-black tracking-wider leading-none">Skeletal Muscle</span>
                        <span className={`text-base font-black ${inbodyDeltas.smm.deltaBase >= 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                          {inbodyDeltas.smm.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.smm.deltaBase} kg
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5 leading-none">Start: {inbodyDeltas.smm.baseline} → {inbodyDeltas.smm.current}</span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[8px] text-slate-550 uppercase font-black tracking-wider leading-none">Body Fat Mass</span>
                        <span className={`text-base font-black ${inbodyDeltas.bfm.deltaBase <= 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {inbodyDeltas.bfm.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.bfm.deltaBase} kg
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5 leading-none">Start: {inbodyDeltas.bfm.baseline} → {inbodyDeltas.bfm.current}</span>
                      </div>
                    </div>

                    {/* Weight and BF deltas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[8px] text-slate-555 uppercase font-black tracking-wider leading-none">Total Weight</span>
                        <span className="text-base font-black text-white">
                          {inbodyDeltas.weight.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.weight.deltaBase} kg
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5 leading-none">Start: {inbodyDeltas.weight.baseline} → {inbodyDeltas.weight.current}</span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-2xl flex flex-col gap-1">
                        <span className="text-[8px] text-slate-555 uppercase font-black tracking-wider leading-none">Body Fat Percent</span>
                        <span className={`text-base font-black ${inbodyDeltas.bf_percent.deltaBase <= 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {inbodyDeltas.bf_percent.deltaBase >= 0 ? '+' : ''}{inbodyDeltas.bf_percent.deltaBase}%
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5 leading-none">Start: {inbodyDeltas.bf_percent.baseline}% → {inbodyDeltas.bf_percent.current}%</span>
                      </div>
                    </div>

                    {/* InBody progress chart */}
                    {inbodyChartData.length > 1 && (
                      <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-900/50">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest pl-0.5 leading-none">InBody Scans History Chart</span>
                        <div className="w-full h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={inbodyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" stroke="#334155" fontSize={8} tickLine={false} />
                              <YAxis stroke="#334155" fontSize={8} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="Weight" stroke="#94a3b8" strokeWidth={1.5} fill="none" name="Weight" />
                              <Area type="monotone" dataKey="Muscle" stroke="#3b82f6" strokeWidth={1.5} fill="url(#colorMuscle)" name="Muscle" />
                              <Area type="monotone" dataKey="Fat" stroke="#06b6d4" strokeWidth={1.5} fill="url(#colorFat)" name="Fat" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Local comparisons */}
                    {(Math.abs(inbodyDeltas.smm.deltaBase) > 0 || Math.abs(inbodyDeltas.bfm.deltaBase) > 0) && (
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-300 space-y-2">
                        {inbodyDeltas.smm.deltaBase > 0 && (
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-none">Muscle Mass Equivalency</div>
                            You built <span className="text-blue-400 font-bold">{inbodyDeltas.smm.deltaBase} kg</span> of muscle mass, equivalent to adding approximately <span className="text-blue-400 font-bold">{(inbodyDeltas.smm.deltaBase * 2).toFixed(1)}</span> standard plates of granite.
                          </div>
                        )}
                        {inbodyDeltas.bfm.deltaBase < 0 && (
                          <div>
                            <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-none">Fat Loss Equivalency</div>
                            You burned <span className="text-cyan-400 font-bold">{Math.abs(inbodyDeltas.bfm.deltaBase)} kg</span> of fat, equivalent to burning approximately <span className="text-cyan-400 font-bold">{fatOilBottles.toFixed(1)}</span> bottles of frying oil.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-slate-900/40 rounded-2xl border border-slate-900">
                    <p className="text-xs text-slate-500 mb-2">At least one scan is required to calculate InBody changes</p>
                    <button onClick={() => navigate('/inbody')} className="text-xs text-blue-400 font-bold hover:underline">
                      Log First Scan →
                    </button>
                  </div>
                )}
              </div>

              {/* Diet Consistency Score Card */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-900/20 rounded-xl">
                      <Apple size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Nutrition Consistency</span>
                  </div>
                  <span className="text-[8px] text-slate-550 uppercase font-black tracking-wider">
                    {dietLogsCount} Days
                  </span>
                </div>

                {dietLogsCount > 0 ? (
                  <div className="flex flex-col gap-5 text-xs font-semibold">
                    {/* Calorie compliance bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Calorie Compliance (±10% Target)</span>
                        <span className="text-blue-400 font-black">{dietConsistencyScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${dietConsistencyScore}%` }}></div>
                      </div>
                    </div>

                    {/* Protein compliance bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Protein Target Consistency (≥90% Target)</span>
                        <span className="text-cyan-400 font-black">{proteinConsistencyScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${proteinConsistencyScore}%` }}></div>
                      </div>
                    </div>

                    {/* Diet Trend Chart */}
                    {dietTrendData.length > 1 && (
                      <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-900/50">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest pl-0.5 leading-none">Calorie Intake Trends</span>
                        <div className="w-full h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dietTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <XAxis dataKey="date" stroke="#334155" fontSize={8} tickLine={false} />
                              <YAxis stroke="#334155" fontSize={8} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                              />
                              <Bar dataKey="Calories" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calories" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Macro ratio caloric split chart */}
                    {hasNutritionData && totalMacroKcal > 0 && (
                      <div className="w-full flex flex-col gap-3 pt-4 border-t border-slate-900/50">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest pl-0.5 leading-none">Average Daily Macro Ratio (Caloric Split)</span>
                        <div className="flex items-center justify-between bg-slate-900/10 p-3 rounded-2xl border border-slate-900/40">
                          <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={macroCalorieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={36}
                                  outerRadius={48}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {macroCalorieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: any, name: any, props: any) => {
                                    const pct = totalMacroKcal > 0 ? Math.round((Number(value) / totalMacroKcal) * 100) : 0;
                                    return [`${value} kcal (${pct}%)`, `${name} (${props.payload.grams}g)`];
                                  }}
                                  contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                              <span className="text-[10px] font-black text-white leading-none">{Math.round(totalMacroKcal)}</span>
                              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">kcal/day</span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-2 pl-4 justify-center">
                            {macroCalorieData.map((entry, idx) => {
                              const pct = totalMacroKcal > 0 ? Math.round((entry.value / totalMacroKcal) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-slate-350">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span>{entry.name}</span>
                                  </div>
                                  <div className="flex items-baseline gap-1 text-right">
                                    <span className="text-white font-extrabold">{entry.grams}g</span>
                                    <span className="text-[8px] text-slate-500 font-normal">({pct}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-300">
                      <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 leading-none">Coach Feedback</div>
                      {dietConsistencyScore >= 80 
                        ? "Phenomenal nutritional consistency! You are providing your muscles with the perfect ratio of recovery fuel. Keep it up!" 
                        : dietConsistencyScore >= 50 
                          ? "Decent food tracking! Try focusing on keeping your calorie intake closer to target ranges on rest days." 
                          : "Consistency is key. Logging your meals every day, even when you go off plan, helps build the habit. Let's pick it up."
                      }
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-slate-900/40 rounded-2xl border border-slate-900">
                    <p className="text-xs text-slate-500 mb-2">No diet logs found in database</p>
                    <button onClick={() => navigate('/diet')} className="text-xs text-blue-400 font-bold hover:underline">
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
              className="flex flex-col gap-6 w-full"
            >
              {/* Lifts Tonnage Chart */}
              {liftsTrendData.length > 1 && (
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
                    <Dumbbell size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Lifting Tonnage Trend</span>
                  </div>
                  <div className="w-full h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={liftsTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#334155" fontSize={8} tickLine={false} />
                        <YAxis stroke="#334155" fontSize={8} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                          labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="Volume" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Volume (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Workout Splits Balance */}
              {splitChartData.length > 0 && (
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
                    <Activity size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Workout Splits Balance</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/10 p-3 rounded-2xl border border-slate-900/40">
                    <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={splitChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={48}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {splitChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getSplitColor(entry.name, index)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [`${value} sessions`, name]}
                            contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-white leading-none">{totalWorkoutSessions}</span>
                        <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">sessions</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 pl-4 justify-center">
                      {splitChartData.map((entry, idx) => {
                        const pct = totalWorkoutSessions > 0 ? Math.round((entry.value / totalWorkoutSessions) * 100) : 0;
                        return (
                          <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-slate-350">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSplitColor(entry.name, idx) }} />
                              <span className="truncate max-w-[80px]">{entry.name}</span>
                            </div>
                            <div className="flex items-baseline gap-1 text-right">
                              <span className="text-white font-extrabold">{entry.value}</span>
                              <span className="text-[8px] text-slate-500 font-normal">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest pl-1">Lifting PR Library (Estimated 1RM)</span>
                {prMap.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {prMap.map((pr, idx) => (
                      <div key={idx} className="bg-slate-950/40 rounded-3xl border border-slate-900 p-5 shadow-md flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                          <span className="font-extrabold text-white text-sm truncate max-w-[200px]">{pr.exerciseName}</span>
                          {pr.tier && (
                            <span className="text-[8px] font-black bg-slate-900 text-slate-400 border border-slate-850 px-2 py-0.5 rounded-full uppercase leading-none">
                              Tier {pr.tier}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">Est 1-Rep Max</span>
                            <span className="font-black text-blue-400 text-sm">{Math.round(pr.best1RM)} kg</span>
                            <span className="text-[7.5px] text-slate-500 font-semibold uppercase mt-0.5">{pr.best1RMDate}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-x border-slate-900/80">
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">Max Weight</span>
                            <span className="font-black text-white text-sm">{pr.maxWeight} kg</span>
                            <span className="text-[7.5px] text-slate-500 font-semibold uppercase mt-0.5">{pr.maxWeightReps} reps</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">Total Sets / Vol</span>
                            <span className="font-black text-slate-300 text-sm">{pr.totalSets} <span className="text-[9px] text-slate-500 font-normal">sets</span></span>
                            <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">{Math.round(pr.totalVolume).toLocaleString()}kg vol</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-950/40 rounded-3xl border border-slate-900">
                    <p className="text-xs text-slate-505">No completed exercises found to calculate PRs.</p>
                  </div>
                )}
              </div>

              <div className="w-full border-t border-slate-900/40 my-1" />

              <div className="flex flex-col gap-3">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest pl-1">All Workouts Logged</span>
                {workoutsHistory.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {workoutsHistory.map((workout) => {
                      const isExpanded = expandedWorkoutId === workout.id;
                      const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);

                      return (
                        <div key={workout.id} className="bg-slate-950/40 rounded-3xl border border-slate-900 overflow-hidden shadow-sm">
                          {/* Summary Header */}
                          <div 
                            onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                            className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-900/20 transition-colors"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">
                                {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="font-black text-white text-sm">{workout.name}</span>
                              <span className="text-[9px] text-blue-400 font-bold uppercase mt-0.5">{workout.day_type} session</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col text-right">
                                <span className="text-xs font-black text-white">{totalSets} Sets</span>
                                <span className="text-[9px] text-slate-500 font-bold">{formatDuration(workout.duration)}</span>
                              </div>
                              <ChevronDown 
                                size={16} 
                                className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`}
                              />
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          {isExpanded && (
                            <div className="bg-slate-950/80 border-t border-slate-900 p-4 flex flex-col gap-4">
                              {workout.exercises.map((ex: any) => (
                                <div key={ex.id} className="flex flex-col gap-2 bg-slate-900/20 p-3 rounded-2xl border border-slate-900/60">
                                  <div className="flex justify-between items-center text-xs font-extrabold border-b border-slate-900/60 pb-1.5">
                                    <span className="text-white truncate max-w-[220px]">{ex.exercise_name}</span>
                                    <span className="text-[8px] text-slate-500 uppercase font-black">Tier {ex.tier}</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {ex.sets.map((set: any, setIdx: number) => (
                                      <div key={setIdx} className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                                        <span>Set {set.setNum}</span>
                                        <span className="text-white font-extrabold">{set.weight} kg × {set.reps} reps <span className="text-[9px] text-slate-500 font-normal">@{set.rpe} RPE</span></span>
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
                  <div className="text-center py-10 bg-slate-950/40 rounded-3xl border border-slate-900">
                    <p className="text-xs text-slate-505">No lifting history logged yet.</p>
                  </div>
                )}
              </div>
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
              className="flex flex-col gap-6 w-full"
            >
              {/* Runs Distance Chart */}
              {runsTrendData.length > 1 && (
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
                    <Activity size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Running Distance Trend</span>
                  </div>
                  <div className="w-full h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={runsTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#334155" fontSize={8} tickLine={false} />
                        <YAxis stroke="#334155" fontSize={8} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '9px' }}
                          labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                        />
                        <Bar dataKey="Distance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Distance (km)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest pl-1">Completed Runs Timeline</span>
                {runningLogs.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {runningLogs.map((run) => (
                      <div key={run.id} className="bg-slate-950/40 rounded-3xl border border-slate-900 p-5 shadow-sm flex flex-col gap-4">
                        {/* Run Header */}
                        <div className="flex justify-between items-start border-b border-slate-900/60 pb-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-550 uppercase font-black tracking-widest leading-none">
                              {new Date(run.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <h4 className="font-black text-white text-sm leading-tight truncate max-w-[200px]">{run.name}</h4>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border ${run.source === 'strava' ? 'bg-orange-500/10 text-orange-400 border-orange-500/25' : 'bg-blue-500/10 text-blue-400 border-blue-500/25'}`}>
                            {run.source}
                          </span>
                        </div>

                        {/* Run Stats */}
                        <div className="grid grid-cols-4 gap-1 text-center text-xs font-semibold text-slate-400">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider leading-none mb-1">Distance</span>
                            <span className="font-black text-blue-400 text-sm leading-tight">{run.distance_km} <span className="text-[9px] font-normal text-slate-505">km</span></span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-l border-slate-900/80">
                            <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider leading-none mb-1">Pace</span>
                            <span className="font-black text-white text-sm leading-tight">{run.pace} <span className="text-[9px] font-normal text-slate-505">/km</span></span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-l border-slate-900/80">
                            <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider leading-none mb-1">Duration</span>
                            <span className="font-black text-white text-sm leading-tight">{formatDuration(run.duration)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-l border-slate-900/80">
                            <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider leading-none mb-1">Elevation</span>
                            <span className="font-black text-white text-sm leading-tight">{run.elevation_m}m</span>
                          </div>
                        </div>

                        {/* Optional Cadence / Heart rate */}
                        {(run.average_heartrate || run.average_cadence) && (
                          <div className="bg-slate-900/30 rounded-2xl p-3 border border-slate-900 flex justify-around text-center text-[10px] font-bold text-slate-400 leading-none">
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
                  <div className="text-center py-10 bg-slate-950/40 rounded-3xl border border-slate-900">
                    <p className="text-xs text-slate-500">No runs logged yet.</p>
                  </div>
                )}
              </div>
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
