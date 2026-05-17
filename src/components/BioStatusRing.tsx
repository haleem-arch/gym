import { motion } from 'framer-motion';
import { Flame, Droplets, Target } from 'lucide-react';

interface BioStatusRingProps {
  kcalPct: number;
  waterPct: number;
  workoutStatus: number; // 0.0 = not started, 0.5 = in progress, 1.0 = completed
  kcalCurrent: number;
  kcalTarget: number;
  waterCurrentL: number;
  waterTargetL: number;
}

export const BioStatusRing = ({
  kcalPct,
  waterPct,
  workoutStatus,
  kcalCurrent,
  kcalTarget,
  waterCurrentL,
  waterTargetL
}: BioStatusRingProps) => {
  // Concurrency & geometry calculations
  const size = 160;
  const center = size / 2;
  const strokeWidth = 8;

  // Concentric ring properties
  const rOuter = 62;
  const circOuter = 2 * Math.PI * rOuter; // ~389.56
  
  const rMiddle = 48;
  const circMiddle = 2 * Math.PI * rMiddle; // ~301.59
  
  const rInner = 34;
  const circInner = 2 * Math.PI * rInner; // ~213.63

  // Interpolate HSL colors based on percentage
  const getCalorieColor = (pct: number) => {
    if (pct === 0) return 'rgba(31, 41, 55, 0.4)';
    if (pct > 1.15) return 'hsl(0, 80%, 50%)'; // Crimson (over-target bulk cap)
    if (pct > 0.9) return 'hsl(142, 70%, 48%)'; // Emerald (on target)
    const hue = Math.min(pct * 142, 142);
    return `hsl(${hue}, 70%, 48%)`;
  };

  const getWaterColor = (pct: number) => {
    if (pct === 0) return 'rgba(31, 41, 55, 0.4)';
    const hue = 195 + Math.min(pct * 25, 25); // Ocean Cyan-Blue transitions
    return `hsl(${hue}, 85%, 50%)`;
  };

  const getWorkoutColor = (status: number) => {
    if (status === 1.0) return 'hsl(270, 90%, 65%)'; // Royal Violet (completed)
    if (status === 0.5) return 'hsl(45, 95%, 52%)'; // Glowing Gold (active in progress)
    return 'rgba(75, 85, 99, 0.4)'; // Slate Gray (rest/not started)
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: [1, 1.012, 1] 
      }}
      transition={{
        scale: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: { duration: 0.3 }
      }}
      className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl flex items-center justify-between gap-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Pulsing Concentric SVG Organs */}
      <div className="relative w-[150px] h-[150px] flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <defs>
            <filter id="glowing-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ─── Outer Circle: Calories ─── */}
          <circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="transparent"
            stroke="rgba(31, 41, 55, 0.3)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="transparent"
            stroke={getCalorieColor(kcalPct)}
            strokeWidth={strokeWidth}
            strokeDasharray={circOuter}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circOuter }}
            animate={{ strokeDashoffset: circOuter * (1 - Math.min(kcalPct, 1)) }}
            transition={{ type: 'spring', damping: 20, stiffness: 90 }}
            style={{ filter: kcalPct >= 0.95 ? 'url(#glowing-glow)' : 'none' }}
          />

          {/* ─── Middle Circle: Hydration ─── */}
          <circle
            cx={center}
            cy={center}
            r={rMiddle}
            fill="transparent"
            stroke="rgba(31, 41, 55, 0.3)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rMiddle}
            fill="transparent"
            stroke={getWaterColor(waterPct)}
            strokeWidth={strokeWidth}
            strokeDasharray={circMiddle}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circMiddle }}
            animate={{ strokeDashoffset: circMiddle * (1 - Math.min(waterPct, 1)) }}
            transition={{ type: 'spring', damping: 20, stiffness: 90, delay: 0.15 }}
            style={{ filter: waterPct >= 0.95 ? 'url(#glowing-glow)' : 'none' }}
          />

          {/* ─── Inner Circle: Workout ─── */}
          <circle
            cx={center}
            cy={center}
            r={rInner}
            fill="transparent"
            stroke="rgba(31, 41, 55, 0.3)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rInner}
            fill="transparent"
            stroke={getWorkoutColor(workoutStatus)}
            strokeWidth={strokeWidth}
            strokeDasharray={circInner}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circInner }}
            animate={{ strokeDashoffset: circInner * (1 - workoutStatus) }}
            transition={{ type: 'spring', damping: 20, stiffness: 90, delay: 0.3 }}
            style={{ filter: workoutStatus === 1.0 ? 'url(#glowing-glow)' : 'none' }}
          />
        </svg>

        {/* Small Center Bio Score Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">BIOMETRIC</span>
          <span className="text-lg font-black text-white leading-none">
            {Math.round((Math.min(kcalPct, 1) + Math.min(waterPct, 1) + workoutStatus) * 33.3)}%
          </span>
        </div>
      </div>

      {/* Concentric Legends & Detail Indicators */}
      <div className="flex-1 flex flex-col gap-3 justify-center">
        {/* Outer Circle: Calories */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getCalorieColor(kcalPct) }} />
          <Flame size={14} className="text-gray-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nutrition</span>
            <span className="text-xs font-bold text-white">
              {Math.round(kcalCurrent)} <span className="text-[10px] text-gray-500 font-normal">/ {kcalTarget} kcal</span>
            </span>
          </div>
        </div>

        {/* Middle Circle: Hydration */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getWaterColor(waterPct) }} />
          <Droplets size={14} className="text-gray-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hydration</span>
            <span className="text-xs font-bold text-white">
              {waterCurrentL.toFixed(1)} <span className="text-[10px] text-gray-500 font-normal">/ {waterTargetL} L</span>
            </span>
          </div>
        </div>

        {/* Inner Circle: Workout */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getWorkoutColor(workoutStatus) }} />
          <Target size={14} className="text-gray-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Training Plan</span>
            <span className="text-xs font-bold text-white">
              {workoutStatus === 1.0 
                ? 'Completed ✓' 
                : workoutStatus === 0.5 
                ? 'In Progress ⏳' 
                : 'Not Started'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
