import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Zap, TrendingUp } from 'lucide-react';

interface RunReceiptProps {
  stats: {
    distance: string;
    pace: string;
    duration: string;
    elevation?: string;
  };
  onClose: () => void;
}

function useCountUp(target: number, duration: number, decimals: number = 2) {
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

export function RunReceipt({ stats, onClose }: RunReceiptProps) {
  const distance  = useCountUp(parseFloat(stats.distance) || 0, 1200);
  const elevation = useCountUp(parseFloat(stats.elevation || '0') || 0, 900, 0);

  const statRows = [
    {
      icon: <MapPin  size={16} className="text-blue-400" />,
      label: 'Distance',
      value: `${distance.toFixed(2)}`,
      unit: 'km',
      color: '#3b82f6',
    },
    {
      icon: <Zap     size={16} className="text-emerald-400" />,
      label: 'Avg Pace',
      value: stats.pace || '—',
      unit: '/km',
      color: '#34d399',
    },
    {
      icon: <Clock   size={16} className="text-purple-400" />,
      label: 'Duration',
      value: stats.duration ? `${stats.duration}` : '—',
      unit: 'min',
      color: '#a78bfa',
    },
    {
      icon: <TrendingUp size={16} className="text-orange-400" />,
      label: 'Elevation',
      value: `${elevation}`,
      unit: 'm',
      color: '#fb923c',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[99998] flex items-end justify-center pb-6 px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.12) 0%, rgba(6,6,16,0.97) 60%)' }}
      >
        {/* Tap outside to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
          className="relative w-full max-w-sm z-10"
          onClick={e => e.stopPropagation()}
        >
          {/* Receipt card */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(17,17,34,0.98) 0%, rgba(10,10,20,0.98) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 30px 60px rgba(0,0,0,0.6)',
          }}>

            {/* Top bar — blue glow strip */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa, #3b82f6, #1d4ed8)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
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
                  <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-[0.2em] mb-1">
                    Session Complete
                  </p>
                  <h2 className="text-2xl font-black text-white leading-none">Run Receipt</h2>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Animated checkmark badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
                  style={{
                    width: 48, height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(59,130,246,0.5)',
                    flexShrink: 0,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {statRows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${row.color}22`,
                      borderRadius: 16,
                      padding: '14px 14px',
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {row.icon}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{row.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-white leading-none">{row.value}</span>
                      <span className="text-xs text-gray-500 font-semibold">{row.unit}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Divider — dashed receipt style */}
              <div style={{
                borderTop: '1px dashed rgba(255,255,255,0.07)',
                margin: '0 -4px 20px',
              }} />

              {/* Bottom buttons */}
              <div className="flex gap-3">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
                    boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                  }}
                >
                  Done 💪
                </motion.button>
              </div>
            </div>
          </div>

          {/* Pill handle */}
          <div className="flex justify-center mt-3">
            <div className="w-10 h-1 bg-white/10 rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
