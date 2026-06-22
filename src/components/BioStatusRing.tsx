import { motion } from 'framer-motion';

interface BioStatusRingProps {
  kcalPct: number;
  waterPct: number;
  workoutStatus: number; // 0.0 = not started, 0.5 = in progress, 1.0 = completed
  isRestDay?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const BioStatusRing = ({
  kcalPct,
  waterPct,
  workoutStatus,
  isRestDay = false,
  compact = false,
  onClick
}: BioStatusRingProps) => {
  // SVG Geometry Settings dynamically scaled
  const size = compact ? 80 : 135;
  const center = size / 2;
  const strokeWidth = compact ? 3.5 : 9.5;

  const rOuter = compact ? 34 : 60;
  const circOuter = 2 * Math.PI * rOuter;
  
  const rMiddle = compact ? 26.5 : 47.5;
  const circMiddle = 2 * Math.PI * rMiddle;
  
  const rInner = compact ? 19 : 35;
  const circInner = 2 * Math.PI * rInner;

  // Premium flat unified blue scale (human designed feel)
  const colorNutrition = '#3b82f6';  // Solid Blue
  const colorHydration = '#60a5fa';  // Light Blue
  const colorTraining = '#1d4ed8';   // Deep Blue

  const trackNutrition = 'rgba(59, 130, 246, 0.08)';
  const trackHydration = 'rgba(96, 165, 250, 0.08)';
  const trackTraining = 'rgba(29, 78, 216, 0.08)';

  const effectiveWorkoutStatus = isRestDay ? 1.0 : workoutStatus;

  // Calculate today's dynamic average daily biometric completion score
  const divisor = 3;
  const sumPct = Math.min(kcalPct, 1) + Math.min(waterPct, 1) + effectiveWorkoutStatus;
  const dailyBioScore = Math.round((sumPct / divisor) * 100);

  return (
    <motion.div 
      onClick={onClick}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={compact 
        ? `rounded-2xl p-4 border border-slate-800/80 flex flex-col items-center justify-between gap-3 w-full min-h-[150px] bg-slate-900/60 ${onClick ? 'cursor-pointer hover:border-slate-700/80 transition-colors' : ''}` 
        : `rounded-2xl p-5 border border-blue-900/20 bg-[#0c1020]/40 backdrop-blur-md flex items-center justify-start gap-12 w-full ${onClick ? 'cursor-pointer hover:border-blue-900/40 transition-colors' : ''}`
      }
    >
      {compact && (
        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest text-center w-full">
          Compliance
        </div>
      )}

      {/* Centered Compact SVG Ring */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Outer Ring: Nutrition */}
          <circle cx={center} cy={center} r={rOuter} fill="transparent" stroke={trackNutrition} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rOuter} fill="transparent" stroke={colorNutrition} strokeWidth={strokeWidth}
            strokeDasharray={circOuter} strokeLinecap="round"
            initial={{ strokeDashoffset: circOuter }}
            animate={{ strokeDashoffset: circOuter * (1 - Math.min(kcalPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95 }}
          />

          {/* Middle Ring: Hydration */}
          <circle cx={center} cy={center} r={rMiddle} fill="transparent" stroke={trackHydration} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rMiddle} fill="transparent" stroke={colorHydration} strokeWidth={strokeWidth}
            strokeDasharray={circMiddle} strokeLinecap="round"
            initial={{ strokeDashoffset: circMiddle }}
            animate={{ strokeDashoffset: circMiddle * (1 - Math.min(waterPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.05 }}
          />

          {/* Inner Ring: Training */}
          <circle cx={center} cy={center} r={rInner} fill="transparent" stroke={trackTraining} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rInner} fill="transparent" stroke={colorTraining} strokeWidth={strokeWidth}
            strokeDasharray={circInner} strokeLinecap="round"
            initial={{ strokeDashoffset: circInner }}
            animate={{ strokeDashoffset: circInner * (1 - effectiveWorkoutStatus) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.1 }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
          <span className={`${compact ? 'text-[11px] font-bold' : 'text-xl font-black'} text-white tracking-tight leading-none`}>
            {dailyBioScore}%
          </span>
        </div>
      </div>

      {compact ? (
        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 leading-none">
          {dailyBioScore}% Compliant
        </span>
      ) : (
        /* Redesigned Legend: Dynamic vertical list with color-anchor dots */
        <div className="flex-grow flex flex-col gap-3.5 justify-center pl-8 border-l border-blue-900/20">
          {/* Nutrition */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorNutrition }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nutrition</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-white">
                  {kcalPct >= 0.95 ? 'Completed' : kcalPct >= 0.75 ? 'On Track' : kcalPct > 0 ? 'Active' : 'Pending'}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">•</span>
                <span className="text-xs font-black text-blue-450">{Math.round(kcalPct * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorHydration }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hydration</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-white">
                  {waterPct >= 0.95 ? 'Completed' : waterPct >= 0.5 ? 'On Track' : waterPct > 0 ? 'Active' : 'Pending'}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">•</span>
                <span className="text-xs font-black text-sky-400">{Math.round(waterPct * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Training */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorTraining }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Training</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-white">
                  {isRestDay ? 'Rest Day' : workoutStatus === 1.0 ? 'Completed' : workoutStatus === 0.5 ? 'Active' : 'Pending'}
                </span>
                {!isRestDay && (
                  <>
                    <span className="text-[10px] text-zinc-500 font-bold">•</span>
                    <span className="text-xs font-black text-indigo-400">{Math.round(workoutStatus * 100)}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
