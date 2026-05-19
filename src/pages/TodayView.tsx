import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Droplets, FileSpreadsheet, Download, X, Check, Activity, Moon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useDiet } from '../hooks/useDiet';
import { supabase } from '../lib/supabase';

import { useSchedule } from '../hooks/useSchedule';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';
import { exportHistoryToCsv } from '../utils/exportHistory';
import { BioStatusRing } from '../components/BioStatusRing';


const DAY_TYPES = ['PUSH', 'PULL', 'LEGS', 'REST', 'RUN', 'RUN + GYM'];

const TodayView = () => {
  const navigate = useNavigate();
  const { workout, endWorkout } = useActiveWorkout();
  const { log, targets, waterLogs, logWater, resetWater, activeDate, setActiveDate } = useDiet();
  
  const getLocalDateString = (d: Date) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };
  const activeDateStr = getLocalDateString(activeDate);
  const { dayType, setDayType } = useSchedule(activeDateStr);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepAnalysis, setSleepAnalysis] = useState<{
    score: number;
    verdict: string;
    action: string;
    advice: string;
    deepStatus: 'optimal' | 'moderate' | 'low';
    remStatus: 'optimal' | 'moderate' | 'low';
    totalStatus: 'optimal' | 'moderate' | 'low';
    tips: string[];
  } | null>(null);
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
  const [sleepHours, setSleepHours] = useState<number>(0);
  const [todaySteps, setTodaySteps] = useState<number>(0);
  // Keep background sync logic fully operational
  if (todaySteps === -999) {
    console.log(todaySteps);
  }
  const [deepSleepHours, setDeepSleepHours] = useState<number>(0);
  const [remSleepHours, setRemSleepHours] = useState<number>(0);
  const [lightSleepHours, setLightSleepHours] = useState<number>(0);
  const [completedWorkoutsList, setCompletedWorkoutsList] = useState<any[]>([]);
  const [hybridLiftingType, setHybridLiftingType] = useState('PUSH');
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

      const { data: completedWorkouts } = await supabase
        .from('workouts')
        .select('id, status, day_type, notes')
        .eq('user_id', session.user.id)
        .eq('date', activeDateStr);

      if (!active) return;

      if (completedWorkouts) {
        setCompletedWorkoutsList(completedWorkouts);

        const completedGym = completedWorkouts.find((w: any) => w.status === 'completed' && ['PUSH', 'PULL', 'LEGS'].includes(w.day_type));
        if (completedGym) {
          setHybridLiftingType(completedGym.day_type);
        }

        if (dayType === 'RUN + GYM') {
          const hasRun = completedWorkouts.some((w: any) => w.status === 'completed' && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
          const hasGym = completedWorkouts.some((w: any) => w.status === 'completed' && ['PUSH', 'PULL', 'LEGS'].includes(w.day_type));
          
          if (hasRun && hasGym) {
            if (isToday) {
              localStorage.removeItem('athlete_dashboard_active_workout');
              if (workout) endWorkout();
            }
            setWorkoutStatus(1.0);
          } else if (hasRun || hasGym) {
            setWorkoutStatus(0.5);
          } else {
            setWorkoutStatus(0.0);
          }
          return;
        }

        if (completedWorkouts.length > 0) {
          const hasCompleted = completedWorkouts.some((w: any) => w.status === 'completed');
          if (hasCompleted) {
            if (isToday) {
              localStorage.removeItem('athlete_dashboard_active_workout');
              if (workout) endWorkout();
            }
            setWorkoutStatus(1.0);
            return;
          }
        }

        const hasInProgress = completedWorkouts.some((w: any) => w.status === 'in_progress');
        if (hasInProgress) {
          setWorkoutStatus(0.5);
          return;
        }
      }

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

      if (workout && isToday) {
        setWorkoutStatus(0.5);
      } else {
        setWorkoutStatus(0.0);
      }
    };

    const fetchTodayBiometrics = async () => {
      const { data } = await supabase
        .from('athlete_biometrics')
        .select('steps, resting_hr, sleep_hours, deep_sleep_hours, rem_sleep_hours, light_sleep_hours')
        .eq('date', activeDateStr)
        .single();
      
      if (data) {
        setTodaySteps(data.steps || 0);
        setSleepHours(data.sleep_hours || 0);
        setDeepSleepHours(data.deep_sleep_hours || 0);
        setRemSleepHours(data.rem_sleep_hours || 0);
        setLightSleepHours(data.light_sleep_hours || 0);
      } else {
        setTodaySteps(0);
        setSleepHours(0);
        setDeepSleepHours(0);
        setRemSleepHours(0);
        setLightSleepHours(0);
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
    fetchTodayBiometrics();
    
    // 🔄 Listen for Biometrics updates in Database
    const dbBiometricsChannel = supabase.channel('db_biometrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'athlete_biometrics' }, (payload: any) => {
        if (payload.new && payload.new.date === activeDateStr) {
          setTodaySteps(payload.new.steps || 0);
          setSleepHours(payload.new.sleep_hours || 0);
          setDeepSleepHours(payload.new.deep_sleep_hours || 0);
          setRemSleepHours(payload.new.rem_sleep_hours || 0);
          setLightSleepHours(payload.new.light_sleep_hours || 0);
        }
      })
      .subscribe();

    return () => { 
      active = false; 
      supabase.removeChannel(dbBiometricsChannel);
    };
  }, [activeDateStr, workout, isToday, dayType]);

  const analyzeSleepWithAi = () => {
    const total = sleepHours || 0;
    const deep = deepSleepHours || 0;
    const rem = remSleepHours || 0;
    const light = lightSleepHours || 0;

    if (total === 0) {
      setSleepAnalysis({
        score: 0,
        totalStatus: 'low',
        deepStatus: 'low',
        remStatus: 'low',
        verdict: "No Sleep Data Recorded",
        advice: "Please sync or enter sleep data for today to get a detailed physiological recovery analysis.",
        action: "Rest & Log Sleep",
        tips: []
      });
      setShowSleepModal(true);
      return;
    }

    // Calculate score
    let durationPoints = 0;
    if (total >= 8) durationPoints = 50;
    else if (total >= 7) durationPoints = 42;
    else if (total >= 6) durationPoints = 30;
    else if (total >= 5) durationPoints = 15;
    else durationPoints = 5;

    const totalStaged = (deep + rem + light) || total;
    const deepRatio = deep / totalStaged;
    const remRatio = rem / totalStaged;

    let deepPoints = 0;
    if (deepRatio >= 0.20) deepPoints = 25;
    else if (deepRatio >= 0.14) deepPoints = 18;
    else if (deepRatio >= 0.08) deepPoints = 10;
    else deepPoints = 2;

    let remPoints = 0;
    if (remRatio >= 0.22) remPoints = 25;
    else if (remRatio >= 0.16) remPoints = 18;
    else if (remRatio >= 0.10) remPoints = 10;
    else remPoints = 2;

    const score = Math.min(100, Math.round(durationPoints + deepPoints + remPoints));

    // Status strings
    const totalStatus = total >= 7.5 ? 'optimal' : total >= 6 ? 'moderate' : 'low';
    const deepStatus = deepRatio >= 0.18 ? 'optimal' : deepRatio >= 0.10 ? 'moderate' : 'low';
    const remStatus = remRatio >= 0.20 ? 'optimal' : remRatio >= 0.12 ? 'moderate' : 'low';

    // Formulate Verdict
    let verdict = "";
    let advice = "";
    let action = "";
    const tips: string[] = [];

    const formatHours = (hrs: number) => {
      const totalMins = Math.round(hrs * 60);
      if (totalMins < 60) return `${totalMins} min`;
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const totalStr = formatHours(total);
    const deepStr = formatHours(deep);
    const remStr = formatHours(rem);

    let durationAnalysis = "";
    if (total >= 7.5 && total <= 9.2) {
      durationAnalysis = `Your sleep duration of ${totalStr} falls squarely within the healthy athletic window.`;
    } else if (total > 9.2) {
      durationAnalysis = `With ${totalStr} of sleep, you have accumulated ample horizontal time to aid heavy systemic repair.`;
    } else {
      durationAnalysis = `At ${totalStr}, your total sleep volume is sub-optimal for maintaining intense physical training.`;
    }

    let deepAnalysis = "";
    if (deepRatio >= 0.18 || deep >= 1.5) {
      deepAnalysis = `The deep sleep phase was highly solid at ${deepStr}, providing robust muscle tissue repair, protein synthesis, and vital growth hormone secretion.`;
    } else {
      deepAnalysis = `However, deep sleep was restricted at ${deepStr}, which may compromise physical tissue repair, cellular restoration, and muscular adaptations.`;
    }

    let remAnalysis = "";
    if (remRatio >= 0.18 || rem >= 1.5) {
      remAnalysis = `Additionally, a healthy ${remStr} of REM sleep ensures your central nervous system (CNS), reaction times, and focus are fully restored.`;
    } else {
      remAnalysis = `Additionally, your REM sleep was cut short at ${remStr}. Since REM is the primary window for neurological recovery, you may notice a decrease in cognitive focus, reaction speed, and mental drive.`;
    }

    advice = `${durationAnalysis} ${deepAnalysis} ${remAnalysis}`;

    // Add tailored tips for next time
    if (remRatio < 0.18 || rem < 1.4) {
      tips.push("Block blue light: Wear blue-light blocking glasses or avoid all screens for 60 minutes before bed to allow your natural melatonin to rise, stabilizing REM sleep.");
      tips.push("Darken room completely: Cover any LED lights on appliances and use blackout curtains. REM sleep is highly sensitive to ambient light changes.");
    }
    if (deepRatio < 0.15 || deep < 1.3) {
      tips.push("Lower bedroom temperature: Keep the room cool, around 18-20°C (64-68°F). Core body temperature must drop to trigger deep sleep entry.");
      tips.push("Avoid late stimulation: Avoid heavy meals, caffeine, or high-intensity training within 3-4 hours of bed to prevent heart rate elevations during deep sleep cycles.");
    }
    if (total < 7.5) {
      tips.push("Consistent bedtime: Go to bed and wake up at the exact same times. Circadian alignment is the single most powerful tool for sleep efficiency.");
    }
    if (tips.length === 0) {
      tips.push("Keep current protocol: Your sleep architecture is fully optimized. Maintain your current sleep environment and pre-bed habits for peak performance.");
    }

    if (score >= 85) {
      verdict = "CNS & Muscular Primed";
      action = "💪 Full Green Light: Train heavy, smash PRs, or run a high-intensity session!";
    } else if (score >= 70) {
      verdict = "Sub-Optimal Rest; Recovery Moderate";
      action = "🏋️‍♂️ Yellow Light: Moderate training. Push yourself, but avoid going to absolute failure on heavy compound movements.";
    } else if (score >= 50) {
      verdict = "Systemic Fatigue Warning";
      action = "🏃‍♀️ Orange Light: Active Recovery. Focus on Zone 2 cardio, mobility work, or lower weight (60-70% 1RM) accessory lifts.";
    } else {
      verdict = "Severe Deficit: Rest Recommended";
      action = "🛑 Red Light: Complete Rest Day. Hydrate, focus on nutrition, and go to bed early tonight.";
    }

    setSleepAnalysis({
      score,
      verdict,
      advice,
      action,
      totalStatus,
      deepStatus,
      remStatus,
      tips
    });
    setShowSleepModal(true);
  };


  const handlePrevDay = () => setActiveDate(new Date(activeDate.getTime() - 86400000));
  const handleNextDay = () => setActiveDate(new Date(activeDate.getTime() + 86400000));
  
  const dateDisplay = isToday ? 'Today' : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const generatePlan = (type: string) => {
    switch(type) {
      case 'PUSH': return { title: 'Push (Chest/Shoulders/Triceps)', exercises: ['Incline DB Press', 'Overhead Cable Extension', 'Lateral Raises', 'Machine Chest Press'] };
      case 'PULL': return { title: 'Pull (Back/Biceps)', exercises: ['Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls'] };
      case 'LEGS': return { title: 'Legs (Quads/Hams/Calves)', exercises: ['Squats', 'Leg Extension', 'Hamstring Curls', 'Calf Raises'] };
      case 'RUN': return { title: 'Cardio (Running Session)', exercises: ['Run smart', 'Control your pace', 'Focus on your breathing', 'Keep a steady rhythm'] };
      case 'RUN + GYM': return { title: `Run + Gym (${hybridLiftingType})`, exercises: ['🏃‍♂️ Strava / Manual Run Session', `🏋️‍♂️ ${hybridLiftingType} Lifting Session`] };
      case 'REST': return { title: 'Active Recovery', exercises: ['Focus on hydration', 'Get 8 hours of sleep', 'Light stretching if needed'] };
      default: return { title: 'Workout', exercises: [] };
    }
  };
  const plan = generatePlan(dayType);

  const macros = log?.daily_totals || { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  const waterTotalMl = waterLogs?.reduce((sum: number, entry: any) => sum + (entry.amount_ml || 0), 0) || 0;
  const waterCurrent = waterTotalMl / 1000;
  const waterTarget = 3.5;

  const lastWaterLog = waterLogs && waterLogs.length > 0 ? waterLogs[waterLogs.length - 1] : null;
  const lastLoggedTime = lastWaterLog && lastWaterLog.created_at
    ? new Date(lastWaterLog.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null;

  const inbody = latestInbody;

  const hasCompletedRun = completedWorkoutsList.some(w => w.status === 'completed' && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
  const hasCompletedGym = completedWorkoutsList.some(w => w.status === 'completed' && ['PUSH', 'PULL', 'LEGS'].includes(w.day_type));

  const getReadinessData = () => {
    const total = sleepHours || 0;
    const deep = deepSleepHours || 0;
    const rem = remSleepHours || 0;
    const light = lightSleepHours || 0;
    
    let sleepScore = 75; // baseline average if no sleep data is logged yet
    if (total > 0) {
      let durationPoints = 0;
      if (total >= 8) durationPoints = 50;
      else if (total >= 7) durationPoints = 42;
      else if (total >= 6) durationPoints = 30;
      else if (total >= 5) durationPoints = 15;
      else durationPoints = 5;

      const totalStaged = (deep + rem + light) || total;
      const deepRatio = deep / totalStaged;
      const remRatio = rem / totalStaged;

      let deepPoints = 0;
      if (deepRatio >= 0.20) deepPoints = 25;
      else if (deepRatio >= 0.14) deepPoints = 18;
      else if (deepRatio >= 0.08) deepPoints = 10;
      else deepPoints = 2;

      let remPoints = 0;
      if (remRatio >= 0.22) remPoints = 25;
      else if (remRatio >= 0.16) remPoints = 18;
      else if (remRatio >= 0.10) remPoints = 10;
      else remPoints = 2;

      sleepScore = Math.min(100, Math.round(durationPoints + deepPoints + remPoints));
    }

    const completedList = completedWorkoutsList || [];
    const hasTodayRun = completedList.some(w => w.status === 'completed' && (w.day_type === 'RUN' || (w.notes && w.notes.includes('run_stats'))));
    const hasTodayGym = completedList.some(w => w.status === 'completed' && ['PUSH', 'PULL', 'LEGS'].includes(w.day_type));

    let workoutScore = 100;
    if (dayType === 'RUN') {
      workoutScore = hasTodayRun ? 100 : 0;
    } else if (['PUSH', 'PULL', 'LEGS'].includes(dayType)) {
      workoutScore = hasTodayGym ? 100 : 0;
    } else if (dayType === 'RUN + GYM') {
      if (hasTodayRun && hasTodayGym) workoutScore = 100;
      else if (hasTodayRun || hasTodayGym) workoutScore = 50;
      else workoutScore = 0;
    } else if (dayType === 'REST') {
      workoutScore = completedList.length > 0 ? 80 : 100;
    }

    let readinessScore = sleepScore;
    
    let recommendation = "";
    let verdict = "";
    let color = "";
    let bgGradient = "";
    
    if (readinessScore >= 85) {
      verdict = "Optimal Readiness";
      recommendation = "Central nervous system (CNS) and muscle tissue recovery are fully restored. Your body is in the prime adaptation zone for high-intensity load or progressive overload splits today. Push hard.";
      color = "#6366f1"; // Indigo
      bgGradient = "from-indigo-500/20 to-purple-500/20";
    } else if (readinessScore >= 70) {
      verdict = "Moderate Readiness";
      recommendation = "Adequate systemic restoration. Fit for training, but keep special focus on a thorough warm-up split. Ensure hydration levels remain high.";
      color = "#3b82f6"; // Blue
      bgGradient = "from-blue-500/20 to-indigo-500/20";
    } else if (readinessScore >= 50) {
      verdict = "Accumulated Fatigue";
      recommendation = "Sleep debt or deficit in REM/Deep stages is impacting your recovery index. Consider a minor volume reduction or focus on technical accuracy rather than heavy resistance.";
      color = "#f59e0b"; // Orange
      bgGradient = "from-amber-500/20 to-orange-500/20";
    } else {
      verdict = "High Recovery Deficit";
      recommendation = "Significant sleep deprivation or deep repair debt detected. We suggest substituting today's scheduled training split with active rest or hydration focus.";
      color = "#ef4444"; // Red
      bgGradient = "from-red-500/20 to-orange-500/20";
    }

    return {
      readinessScore,
      sleepScore,
      workoutScore,
      verdict,
      recommendation,
      color,
      bgGradient,
      hasSleepData: total > 0,
      total,
      deep,
      rem,
      light
    };
  };

  const readiness = getReadinessData();

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
            className="bg-gray-800 text-xs font-bold text-white border border-gray-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            {DAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <h2 className="text-xl font-extrabold text-white mb-4">{plan.title}</h2>
        
        {dayType === 'RUN + GYM' && (
          <div className="flex items-center gap-2 mb-5 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800">
            <span className="text-xs font-bold text-gray-400 px-2">Select Gym Split:</span>
            {['PUSH', 'PULL', 'LEGS'].map(t => (
              <button
                key={t}
                disabled={hasCompletedGym}
                onClick={() => setHybridLiftingType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${hybridLiftingType === t ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'} ${hasCompletedGym ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
              >
                {t} {hasCompletedGym && hybridLiftingType === t ? '✓' : ''}
              </button>
            ))}
          </div>
        )}

        {dayType !== 'REST' && dayType !== 'RUN + GYM' && (
          <ul className="space-y-2 mb-6 text-sm text-gray-300">
            {plan.exercises.map((ex, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
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
                RUN COMPLETED
              </div>
            ) : (
              <button 
                onClick={() => navigate('/workout', { state: { activeDateStr, openRunModal: true, forceLiftingType: hybridLiftingType } })}
                className="w-full h-[48px] bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Activity size={16} />
                LOG RUN (MANUAL / STRAVA)
              </button>
            )}

            {/* Gym Action Button */}
            {hasCompletedGym ? (
              <div className="w-full h-[48px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 text-xs">
                <Check size={16} />
                {hybridLiftingType} COMPLETED
              </div>
            ) : (
              <button 
                onClick={() => navigate('/workout', { state: { activeDateStr, forceLiftingType: hybridLiftingType } })}
                className="w-full h-[48px] bg-primary hover:bg-blue-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                START {hybridLiftingType} WORKOUT
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
                  if (workout && isToday) {
                    navigate('/workout/active');
                  } else {
                    navigate('/workout', { state: { activeDateStr } });
                  }
                }}
                className={`w-full h-[48px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${(workout && isToday) ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-blue-500/10'}`}
              >
                <Play size={18} fill="currentColor" />
                {(workout && isToday) ? 'RESUME SESSION' : 'START WORKOUT'}
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
                     className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* Daily Biometrics - Sleep Recovery Card */}
        {isToday && (
          <div className="w-full animate-fade-in">
            {/* Resting HR & Sleep Card */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
               className="bg-surface rounded-2xl p-4 border border-gray-800 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health & Sleep</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded-full">Daily</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Moon size={18} className="text-indigo-400" />
                {(() => {
                  const totalMins = Math.floor(sleepHours * 60);
                  const h = Math.floor(totalMins / 60);
                  const m = totalMins % 60;
                  return (
                    <span className="text-2xl font-black text-white">{h}h{m > 0 ? ` ${m}m` : ''}</span>
                  );
                })()}
              </div>
              
              {/* Sleep Stages Breakdown */}
              <div className="mt-2 border-t border-gray-800 pt-2">
                {(() => {
                  const totalStaged = (deepSleepHours + remSleepHours + lightSleepHours) || sleepHours || 1;
                  const formatStage = (hrs: number) => {
                    const totalMins = Math.round(hrs * 60);
                    if (totalMins < 60) return `${totalMins}m`;
                    const h = Math.floor(totalMins / 60);
                    const m = totalMins % 60;
                    return m > 0 ? `${h}h ${m}m` : `${h}h`;
                  };
                  return (
                    <>
                      <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-800">
                        <div className="bg-purple-600" style={{ width: `${(deepSleepHours / totalStaged) * 100}%` }} title="Deep Sleep"></div>
                        <div className="bg-blue-500" style={{ width: `${(remSleepHours / totalStaged) * 100}%` }} title="REM Sleep"></div>
                        <div className="bg-emerald-500" style={{ width: `${(lightSleepHours / totalStaged) * 100}%` }} title="Light Sleep"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] mt-2.5 text-gray-400 font-bold">
                        <div className="flex flex-col items-center bg-gray-900/40 p-2 rounded-lg border border-gray-800/50">
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0"></div>
                            <span className="text-gray-500 font-semibold">Deep</span>
                          </div>
                          <span className="text-white font-black text-[11px] whitespace-nowrap">{formatStage(deepSleepHours)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-900/40 p-2 rounded-lg border border-gray-800/50">
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                            <span className="text-gray-500 font-semibold">REM</span>
                          </div>
                          <span className="text-white font-black text-[11px] whitespace-nowrap">{formatStage(remSleepHours)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-900/40 p-2 rounded-lg border border-gray-800/50">
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                            <span className="text-gray-500 font-semibold">Light</span>
                          </div>
                          <span className="text-white font-black text-[11px] whitespace-nowrap">{formatStage(lightSleepHours)}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-center mt-3.5">
                <button
                  onClick={analyzeSleepWithAi}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 border border-indigo-500/25 active:scale-95 cursor-pointer shadow-inner"
                >
                  <Sparkles size={11} className="text-indigo-400 animate-pulse" />
                  <span>Analyze Sleep</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
              <button onClick={() => navigate('/inbody')} className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer">
                Log First Scan →
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Subtle Separation Divider */}
      <div className="w-full border-t border-white/10 my-1" />

      {/* SIDE-BY-SIDE METRICS GRID */}
      <div className="grid grid-cols-2 gap-4 w-full animate-fade-in">
        {/* READINESS INDEX CARD */}
        <motion.div
          onClick={() => setShowReadinessModal(true)}
          whileTap={{ scale: 0.98 }}
          className="bg-surface rounded-3xl p-4 border border-gray-800 flex flex-col items-center justify-between gap-3 cursor-pointer hover:border-gray-700 transition-colors w-full relative overflow-hidden group min-h-[140px]"
        >
          {/* Glow */}
          <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-tr ${readiness.bgGradient} blur-2xl opacity-60 pointer-events-none`} />

          {/* Title */}
          <div className="flex items-center gap-1 w-full justify-center">
            <Sparkles size={11} style={{ color: readiness.color }} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Readiness</span>
          </div>

          {/* SVG Ring (compact 64x64px) */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 z-10">
            <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="27"
                stroke="#1e293b"
                strokeWidth="5"
                fill="transparent"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="27"
                stroke={readiness.color}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={169.6}
                strokeDashoffset={169.6 - (169.6 * readiness.readinessScore) / 100}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 169.6 }}
                animate={{ strokeDashoffset: 169.6 - (169.6 * readiness.readinessScore) / 100 }}
                transition={{ type: 'spring', damping: 20, stiffness: 80 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-white tracking-tight leading-none">{readiness.readinessScore}</span>
              <span className="text-[6px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 leading-none">Score</span>
            </div>
          </div>

          {/* Verdict label */}
          <span className="text-[10px] font-black uppercase tracking-wider z-10 leading-none" style={{ color: readiness.color }}>
            {readiness.verdict.split(' ')[0]}
          </span>
        </motion.div>

        {/* COMPACT CONCENTRIC TARGETS CARD */}
        <BioStatusRing 
          kcalPct={targets.kcal > 0 ? (macros.kcal / targets.kcal) : 0}
          waterPct={waterTarget > 0 ? (waterTotalMl / (waterTarget * 1000)) : 0}
          workoutStatus={workoutStatus}
          sleepPct={sleepHours / 8}
          isRestDay={dayType === 'REST'}
          compact={true}
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
          className="text-[10px] text-gray-600 uppercase font-bold tracking-widest hover:text-danger transition-colors p-2 cursor-pointer"
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

        {showSleepModal && sleepAnalysis && (() => {
          const formatStageMins = (hrs: number) => {
            const totalMins = Math.round(hrs * 60);
            if (totalMins < 60) return `${totalMins} min`;
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
          };
          return (
            <>
              {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowSleepModal(false)} />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-y-auto md:top-[15%] md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-[51] flex flex-col justify-between overflow-y-auto no-scrollbar"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setShowSleepModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Title */}
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Sleep Recovery Engine</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Athlete Intelligence</p>
                </div>
              </div>

              {/* Divided Donut Ring & Diagnostics Grid */}
              {(() => {
                const totalStaged = (deepSleepHours + remSleepHours + lightSleepHours) || sleepHours || 1;
                const deepRatio = deepSleepHours / totalStaged;
                const remRatio = remSleepHours / totalStaged;
                const lightRatio = lightSleepHours / totalStaged;
                


                return (
                  <div className="flex flex-col gap-4 py-4 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/40 mb-6">
                    <div className="flex items-center justify-between gap-6">
                      {/* Visual Segmented Ring */}
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background base */}
                          <circle 
                            cx="50" cy="50" r="40" 
                            stroke="#1e293b" strokeWidth="8" fill="transparent" 
                          />
                          {/* Deep Segment (Purple) */}
                          {deepRatio > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              stroke="#a855f7" 
                              strokeWidth="8" fill="transparent" 
                              strokeDasharray={`${deepRatio * 251.33} 251.33`}
                              strokeDashoffset={0}
                              strokeLinecap="round"
                            />
                          )}
                          {/* REM Segment (Blue) */}
                          {remRatio > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              stroke="#3b82f6" 
                              strokeWidth="8" fill="transparent" 
                              strokeDasharray={`${remRatio * 251.33} 251.33`}
                              strokeDashoffset={-deepRatio * 251.33}
                              strokeLinecap="round"
                            />
                          )}
                          {/* Light Segment (Emerald) */}
                          {lightRatio > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              stroke="#10b981" 
                              strokeWidth="8" fill="transparent" 
                              strokeDasharray={`${lightRatio * 251.33} 251.33`}
                              strokeDashoffset={-(deepRatio + remRatio) * 251.33}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-[17px] font-black text-white leading-none">{sleepAnalysis.score}%</span>
                          <span className="text-[6.5px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Readiness</span>
                        </div>
                      </div>

                      {/* Sleep stage numbers beside the ring */}
                      <div className="flex-1 flex flex-col gap-1.5 text-xs text-gray-300 font-bold">
                        <div className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/30">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>
                            <span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider">Deep</span>
                          </div>
                          <span className="text-white text-xs font-black">{formatStageMins(deepSleepHours)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/30">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                            <span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider">REM</span>
                          </div>
                          <span className="text-white text-xs font-black">{formatStageMins(remSleepHours)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/30">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                            <span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider">Light</span>
                          </div>
                          <span className="text-white text-xs font-black">{formatStageMins(lightSleepHours)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center border-t border-slate-800/60 pt-3">
                      <h4 className="text-sm font-extrabold text-white tracking-tight">{sleepAnalysis.verdict}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Physiological Readiness Rating</p>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Feedback & Action Item */}
              <div className="flex-1 space-y-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>🔬</span> Physiological Verdict
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {sleepAnalysis.advice}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  sleepAnalysis.score >= 85 ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' :
                  sleepAnalysis.score >= 70 ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' :
                  sleepAnalysis.score >= 50 ? 'bg-orange-950/20 border-orange-500/30 text-orange-300' :
                  'bg-red-950/20 border-red-500/30 text-red-300'
                }`}>
                  <h5 className="text-[10px] font-black uppercase tracking-wider mb-1.5">
                    🎯 Today's Action Plan
                  </h5>
                  <p className="text-xs font-bold leading-normal">
                    {sleepAnalysis.action}
                  </p>
                </div>

                {/* Sleep Architecture vs. Targets */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span>📊</span> Sleep Architecture vs. Reference Targets
                  </h5>
                  
                  <div className="space-y-3.5 text-xs">
                    {/* Total Sleep */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-gray-300">Total Duration</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{formatStageMins(sleepHours)}</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 7.5h - 9.0h)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((sleepHours / 9.0) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Deep Sleep */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-[#a855f7]">Deep Sleep</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{formatStageMins(deepSleepHours)}</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 1.5h - 2.0h)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#a855f7] h-2 rounded-full" style={{ width: `${Math.min((deepSleepHours / 2.0) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* REM Sleep */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-[#3b82f6]">REM Sleep</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{formatStageMins(remSleepHours)}</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 1.5h - 2.0h)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#3b82f6] h-2 rounded-full" style={{ width: `${Math.min((remSleepHours / 2.0) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Light Sleep */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-[#10b981]">Light Sleep</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{formatStageMins(lightSleepHours)}</span>
                          <span className="text-[9px] text-gray-500 font-bold">(Target: 3.5h - 5.0h)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#10b981] h-2 rounded-full" style={{ width: `${Math.min((lightSleepHours / 5.0) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Sleep Coach Tips */}
                {sleepAnalysis.tips.length > 0 && (
                  <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/25">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span>💡</span> AI Coach: How to Improve Next Time
                    </h5>
                    <ul className="space-y-2 text-xs text-indigo-200/90 font-semibold list-disc list-inside">
                      {sleepAnalysis.tips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-indigo-300 font-bold">{tip.split(':')[0]}:</span>
                          {tip.split(':').slice(1).join(':')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        );
      })()}

        {showReadinessModal && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowReadinessModal(false)} />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-[51] overflow-y-auto flex justify-center items-start p-4 py-8 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative w-full max-w-sm my-auto mb-16 pointer-events-auto"
              >
                {/* Close Button */}
                <button 
                  type="button"
                  onClick={() => setShowReadinessModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Title */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Physiological Readiness</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-0.5">Unified AI Score</p>
                  </div>
                </div>

                {/* Score Dial */}
                <div className="flex flex-col items-center mb-6 bg-slate-950/40 p-5 rounded-3xl border border-slate-800/40">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="#1e293b"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke={readiness.color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={326.7}
                        strokeDashoffset={326.7 - (326.7 * readiness.readinessScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-black text-white tracking-tighter">{readiness.readinessScore}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Readiness Index</span>
                    </div>
                  </div>
                  <div className="mt-4 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase" style={{ backgroundColor: `${readiness.color}15`, color: readiness.color, border: `1px solid ${readiness.color}30` }}>
                    {readiness.verdict}
                  </div>
                </div>

                {/* Breakdown Progress Bars */}
                <div className="space-y-4 text-xs font-semibold text-gray-300 leading-relaxed mb-6">
                  {/* Recovery Foundation */}
                  <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span>💤</span> Recovery Foundation (Sleep Score)
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-gray-300">Sleep Quality</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{readiness.sleepScore}/100</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${readiness.sleepScore}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Workout Compliance */}
                  <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span>🏋️‍♂️</span> Training Compliance (Workout Score)
                    </h5>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-bold leading-none">
                        <span className="text-gray-300">Target Fulfillment</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-black">{readiness.workoutScore}/100</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/50">
                        <div className="bg-[#a855f7] h-2 rounded-full" style={{ width: `${readiness.workoutScore}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Physiological Coach Verdict */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <span>🧠</span> Physiological Verdict
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      Your recovery foundation is scored <span className="text-white font-bold">{readiness.sleepScore}/100</span> based on <span className="text-white font-bold">{readiness.total.toFixed(1)}h</span> of sleep (REM: {readiness.rem.toFixed(1)}h, Deep: {readiness.deep.toFixed(1)}h). Today's scheduled plan is <span className="text-white font-bold">{dayType}</span>. {readiness.recommendation}
                    </p>
                  </div>
                </div>

                {/* OK Button */}
                <button 
                  onClick={() => setShowReadinessModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer shadow-lg"
                >
                  Acknowledge & Train
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodayView;
