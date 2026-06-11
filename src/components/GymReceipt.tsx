import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Clock, Trophy, Flame, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GymReceiptProps {
  stats: {
    workoutName?: string;
    name?: string;
    totalVolume?: number;
    total_volume?: number;
    totalSets?: number;
    durationMinutes?: number;
    duration?: number;
    prExercise?: string;
    pr_exercise?: string;
    workoutId?: string;
    id?: string;
    day_type?: string;
    dayType?: string;
    notes?: string;
    date?: string;
    created_at?: string;
  };
  onClose: () => void;
}

// Custom spring count-up hook
function useCountUp(target: number, duration: number, decimals: number = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    const delay = setTimeout(() => { rafRef.current = requestAnimationFrame(step); }, 300);
    return () => { clearTimeout(delay); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return value;
}

export function GymReceipt({ stats, onClose }: GymReceiptProps) {
  const workoutId = stats.workoutId || stats.id || '';
  const dayType = stats.dayType || stats.day_type || 'GYM';
  const workoutName = stats.workoutName || stats.name || `${dayType} Session`;
  
  const [dbWorkout, setDbWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedTotalSets, setFetchedTotalSets] = useState<number | null>(null);
  const [userWeight, setUserWeight] = useState<number>(75);

  useEffect(() => {
    const fetchData = async () => {
      if (!workoutId) return;
      
      setLoading(true);
      try {
        // 1. Fetch workout details from the DB
        const { data: wData, error: wError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', workoutId)
          .maybeSingle();
          
        if (wError) throw wError;
        if (wData) {
          setDbWorkout(wData);
          
          // Fetch weight
          try {
            const { data: scans } = await supabase
              .from('inbody_scans')
              .select('weight')
              .eq('user_id', wData.user_id)
              .order('date', { ascending: false })
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (scans && scans.length > 0 && scans[0].weight) {
              setUserWeight(parseFloat(scans[0].weight));
            } else {
              const { data: profile } = await supabase
                .from('profiles')
                .select('targets')
                .eq('id', wData.user_id)
                .maybeSingle();
                
              if (profile?.targets?.weight) {
                setUserWeight(parseFloat(profile.targets.weight));
              }
            }
          } catch (e) {
            console.error("Error fetching user weight in coach receipt:", e);
          }
        }
        
        // 2. Fetch workout exercises from the DB
        if (dayType !== 'RUN') {
          const { data: exData, error: exError } = await supabase
            .from('workout_exercises')
            .select('*, exercises(name, tier)')
            .eq('workout_id', workoutId)
            .order('created_at', { ascending: true });
            
          if (exError) throw exError;
          if (exData) {
            setExercises(exData);
            
            let count = 0;
            exData.forEach((ex: any) => {
              if (ex.sets && Array.isArray(ex.sets)) {
                ex.sets.forEach((s: any) => {
                  if (s.done) count++;
                });
              }
            });
            setFetchedTotalSets(count);
          }
        }
      } catch (err) {
        console.error('Error fetching workout details in receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [workoutId, dayType]);

  const mergedStats = {
    ...stats,
    ...(dbWorkout || {})
  };

  // Total volume calculation
  const computedVolume = (() => {
    if (dayType === 'RUN') return 0;
    let vol = 0;
    exercises.forEach(ex => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((s: any) => {
          if (s.done && s.weight && s.reps) {
            const w = parseFloat(s.weight);
            const r = parseInt(s.reps);
            if (!isNaN(w) && !isNaN(r)) {
              vol += (w * r);
            }
          }
        });
      }
    });
    return vol;
  })();

  const rawTotalVolume = computedVolume > 0 
    ? computedVolume 
    : (() => {
        const val = mergedStats.totalVolume ?? mergedStats.total_volume;
        if (val === undefined || val === null) return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      })();
  
  const durationSeconds = (() => {
    const d = mergedStats.duration;
    if (d !== undefined && d !== null) {
      const num = Number(d);
      if (!isNaN(num)) return num;
    }
    const dm = mergedStats.durationMinutes;
    if (dm !== undefined && dm !== null) {
      const num = Number(dm);
      if (!isNaN(num)) return num * 60;
    }
    return 0;
  })();

  const formatSecondsToMinSec = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.round(totalSeconds % 60);
    
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ') || '0m';
  };

  // Display Date
  const rawDate = mergedStats.date || mergedStats.created_at;
  const displayDateStr = (() => {
    if (rawDate) {
      try {
        const d = new Date(rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00');
        return d.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
      } catch (e) {}
    }
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  })();

  // Compute best set if prExercise is missing
  let computedBestSet = '';
  if (exercises.length > 0) {
    let maxWeight = 0;
    let bestRep = 0;
    let bestExName = '';
    exercises.forEach(ex => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((s: any) => {
          if (s.done) {
            const w = parseFloat(s.weight);
            const r = parseInt(s.reps);
            if (!isNaN(w) && !isNaN(r)) {
              if (w > maxWeight || (w === maxWeight && r > bestRep)) {
                maxWeight = w;
                bestRep = r;
                bestExName = ex.exercises?.name || 'Exercise';
              }
            }
          }
        });
      }
    });
    if (maxWeight > 0) {
      computedBestSet = `${bestExName}: ${maxWeight}kg × ${bestRep}`;
    }
  }

  // Parse Run statistics if dayType is RUN and notes has JSON
  const notesText = mergedStats.notes || '';
  let runStats: any = null;
  if (dayType === 'RUN' && notesText.includes('"type":"run_stats"')) {
    try {
      runStats = JSON.parse(notesText);
    } catch (e) {
      console.error('Error parsing runStats JSON:', e);
    }
  }

  const displayTotalSets = (() => {
    const ts = mergedStats.totalSets;
    if (ts !== undefined && ts !== null) {
      const num = Number(ts);
      if (!isNaN(num)) return num;
    }
    return fetchedTotalSets ?? 0;
  })();

  const prHighlight = mergedStats.prExercise || mergedStats.pr_exercise || computedBestSet;

  const volumeTarget = dayType === 'RUN' ? parseFloat(runStats?.distance_km || 0) : rawTotalVolume;
  const volumeDecimals = dayType === 'RUN' ? 2 : 0;
  const volume = useCountUp(volumeTarget, 1400, volumeDecimals);
  const sets = useCountUp(displayTotalSets, 1000, 0);
  const durationSec = useCountUp(durationSeconds, 900, 0);

  const approxCalories = (() => {
    if (dayType !== 'RUN') return 0;
    const dist = parseFloat(runStats?.distance_km || 0);
    return Math.round(userWeight * dist * 1.036);
  })();

  const statCards = dayType === 'RUN' ? [
    {
      icon: <Dumbbell size={18} className="text-blue-400" />,
      label: 'Distance',
      value: `${volume}`,
      unit: 'km',
      color: '#3b82f6',
    },
    {
      icon: <Flame size={18} className="text-orange-400" />,
      label: 'Avg Pace',
      value: `${runStats?.pace || '0:00'}`,
      unit: '/km',
      color: '#fb923c',
    },
    {
      icon: <TrendingUp size={18} className="text-emerald-400" />,
      label: 'Elevation',
      value: `${runStats?.elevation_m || 0}`,
      unit: 'm',
      color: '#34d399',
    },
    {
      icon: <Clock size={18} className="text-purple-400" />,
      label: 'Duration',
      value: formatSecondsToMinSec(durationSec),
      unit: '',
      color: '#a78bfa',
    },
    {
      icon: <Flame size={18} className="text-orange-500 animate-pulse" />,
      label: 'Approx Calories',
      value: `${approxCalories}`,
      unit: 'kcal',
      color: '#f97316',
      warning: 'not very accurate'
    }
  ] : [
    {
      icon: <Dumbbell size={18} className="text-blue-400" />,
      label: 'Total Volume',
      value: `${volume.toLocaleString()}`,
      unit: 'kg',
      color: '#3b82f6',
    },
    {
      icon: <Flame size={18} className="text-orange-400" />,
      label: 'Sets Logged',
      value: `${sets}`,
      unit: 'completed',
      color: '#fb923c',
    },
    {
      icon: <Clock size={18} className="text-purple-400" />,
      label: 'Gym Time',
      value: formatSecondsToMinSec(durationSec),
      unit: '',
      color: '#a78bfa',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          background: 'radial-gradient(circle at 50% 45%, rgba(59,130,246,0.18) 0%, rgba(6,6,16,0.97) 65%)',
        }}
      >
        {/* Tap backdrop to close */}
        <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28, delay: 0.05 }}
          style={{ position: 'relative', width: '100%', maxWidth: 580, zIndex: 10 }}
        >
          {/* Main Card */}
          <div id="tutorial-receipt-modal" style={{
            background: 'linear-gradient(160deg, rgba(17,17,34,0.98) 0%, rgba(10,10,20,0.98) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 30px 60px rgba(0,0,0,0.6)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Shimmering brand bar */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa, #3b82f6, #1d4ed8)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.2s linear infinite',
              flexShrink: 0,
            }} />

            <style>{`
              @keyframes shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              .receipt-scroll::-webkit-scrollbar {
                width: 4px;
              }
              .receipt-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .receipt-scroll::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.15);
                border-radius: 99px;
              }
              .receipt-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.35);
              }
            `}</style>

            <div className="receipt-scroll flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.2em] mb-1">
                    WORKOUT ENDED
                  </p>
                  <h2 className="text-2xl font-black text-white leading-none">{workoutName}</h2>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    {displayDateStr}
                  </p>
                </div>

                {/* Animated Golden Trophy Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.35 }}
                  style={{
                    width: 48, height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #b45309, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                    flexShrink: 0,
                  }}
                >
                  <Trophy size={20} className="text-white" />
                </motion.div>
              </div>

              {/* Stats Columns */}
              <div className={`grid gap-3 mb-5 ${dayType === 'RUN' ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${card.color}15`,
                      borderRadius: 16,
                      padding: '14px 12px',
                    }}
                    className="flex flex-col items-center justify-center text-center gap-1.5"
                  >
                    <div className="p-2 rounded-xl bg-white/5">{card.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{card.label}</span>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-base font-black text-white">{card.value}</span>
                        {card.unit && <span className="text-[10px] text-gray-500 font-semibold">{card.unit}</span>}
                      </div>
                      {card.warning && (
                        <span className="text-[8px] text-red-500 font-bold leading-none mt-1">{card.warning}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* PR Highlight Card (If present) */}
              {prHighlight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 100%)',
                    border: '1px solid rgba(245,158,11,0.18)',
                    borderRadius: 16,
                    padding: '14px',
                    marginBottom: 20
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Trophy size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Record Set</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-normal">{prHighlight}</p>
                </motion.div>
              )}

              {/* Exercises / Running telemetry details */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Loading logs...</span>
                </div>
              ) : dayType === 'RUN' ? (
                stats.notes && !stats.notes.includes('"type":"run_stats"') ? (
                  <div className="space-y-3 mb-5">
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '12px 0' }} />
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Workout Notes</h3>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-gray-300 leading-relaxed font-medium">
                      {stats.notes}
                    </div>
                  </div>
                ) : null
              ) : exercises.length > 0 ? (
                <div className="space-y-3 mb-5">
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '12px 0' }} />
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Exercises Logged</h3>
                  
                  <div className="space-y-2.5">
                    {exercises.map((ex, i) => {
                      const completedSets = ex.sets?.filter((s: any) => s.done) || [];
                      if (completedSets.length === 0) return null;
                      
                      return (
                        <div key={ex.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                          <div className="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 font-bold">#{i + 1}</span>
                              <span className="text-xs font-black text-white truncate max-w-[200px]">{ex.exercises?.name || 'Exercise'}</span>
                            </div>
                            {ex.exercises?.tier && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${
                                ex.exercises.tier === 'S+' || ex.exercises.tier === 'S' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                ex.exercises.tier === 'A' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                'bg-gray-800 text-gray-400 border-gray-700'
                              }`}>
                                Tier {ex.exercises.tier}
                              </span>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <div className="grid grid-cols-4 text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-center">
                              <div>Set</div>
                              <div>kg</div>
                              <div>Reps</div>
                              <div>RPE</div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              {completedSets.map((set: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-4 items-center text-center py-1.5 bg-white/[0.01] rounded-lg text-xs border border-white/[0.02] font-semibold text-gray-300">
                                  <div className="text-[10px] text-gray-500 font-bold">{set.setNum}</div>
                                  <div className="font-black text-white">{set.weight}</div>
                                  <div className="font-black text-white">{set.reps}</div>
                                  <div className="text-[11px] text-gray-400">{set.rpe || '-'}</div>
                                </div>
                              ))}
                            </div>
                            
                            {ex.notes && (
                              <p className="mt-2 text-[10px] text-gray-400 italic bg-black/20 p-2 rounded-lg border-l border-blue-500/50">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Torn-Receipt Dashed Line */}
              <div style={{
                borderTop: '1px dashed rgba(255,255,255,0.08)',
                margin: '0 -4px 20px',
              }} />

              {/* Action button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                  }}
                >
                  Done 💪
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
