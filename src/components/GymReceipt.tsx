import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Clock, Trophy, Flame } from 'lucide-react';

interface GymReceiptProps {
  stats: {
    workoutName: string;
    totalVolume: number;
    totalSets: number;
    durationMinutes: number;
    prExercise?: string;
    workoutId: string;
  };
  onClose: () => void;
}

// Custom spring count-up hook
function useCountUp(target: number, duration: number, decimals: number = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
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
  const volume = useCountUp(stats.totalVolume, 1400, 0);
  const sets = useCountUp(stats.totalSets, 1000, 0);
  const duration = useCountUp(stats.durationMinutes, 900, 0);

  const statCards = [
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
      value: `${duration}`,
      unit: 'minutes',
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
          style={{ position: 'relative', width: '100%', maxWidth: 360, zIndex: 10 }}
        >
          {/* Main Card */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(17,17,34,0.98) 0%, rgba(10,10,20,0.98) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 30px 60px rgba(0,0,0,0.6)',
          }}>
            {/* Shimmering brand bar */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa, #3b82f6, #1d4ed8)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.2s linear infinite',
            }} />

            <style>{`
              @keyframes shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.2em] mb-1">
                    WORKOUT ENDED
                  </p>
                  <h2 className="text-2xl font-black text-white leading-none">{stats.workoutName}</h2>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
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
              <div className="flex flex-col gap-3 mb-5">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${card.color}15`,
                      borderRadius: 16,
                      padding: '12px 16px',
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5">{card.icon}</div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{card.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white">{card.value}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{card.unit}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* PR Highlight Card (If present) */}
              {stats.prExercise && (
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
                  <p className="text-xs font-bold text-white leading-normal">{stats.prExercise}</p>
                </motion.div>
              )}

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
