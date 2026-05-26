import { motion } from 'framer-motion';

interface BioStatusRingProps {
  kcalPct: number;
  waterPct: number;
  workoutStatus: number; // 0.0 = not started, 0.5 = in progress, 1.0 = completed
  isRestDay?: boolean;
  compact?: boolean;
  onClick?: () => void;
  disableNutrition?: boolean;
}

export const BioStatusRing = ({
  kcalPct,
  waterPct,
  workoutStatus,
  isRestDay = false,
  compact = false,
  onClick,
  disableNutrition = false
}: BioStatusRingProps) => {
  // SVG Geometry Settings dynamically scaled
  const size = compact ? 90 : 100;
  const center = size / 2;
  const strokeWidth = compact ? 3.2 : 3.5;

  const rOuter = compact ? 39 : 42;
  const circOuter = 2 * Math.PI * rOuter;
  
  const rMiddle = compact ? 31 : 32;
  const circMiddle = 2 * Math.PI * rMiddle;
  
  const rInner = compact ? 23 : 22;
  const circInner = 2 * Math.PI * rInner;

  // Colors
  const colorNutrition = '#F97316';
  const colorHydration = '#38BDF8';
  const colorTraining = '#A78BFA';

  const trackNutrition = 'rgba(249, 115, 22, 0.15)';
  const trackHydration = 'rgba(56, 189, 248, 0.15)';
  const trackTraining = 'rgba(167, 139, 250, 0.15)';

  // On a REST day, training is completed by resting!
  const effectiveWorkoutStatus = isRestDay ? 1.0 : workoutStatus;

  // Calculate today's dynamic average daily biometric completion score
  const divisor = disableNutrition ? 2 : 3;
  const sumPct = (disableNutrition ? 0 : Math.min(kcalPct, 1)) + Math.min(waterPct, 1) + effectiveWorkoutStatus;
  const dailyBioScore = Math.round((sumPct / divisor) * 100);

  return (
    <motion.div 
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ backgroundColor: compact ? 'transparent' : '#0D1117' }}
      className={compact 
        ? `rounded-3xl p-4 border border-gray-800 flex flex-col items-center justify-between gap-3 w-full min-h-[165px] bg-surface ${onClick ? 'cursor-pointer hover:border-gray-700 transition-colors' : ''}` 
        : "rounded-[20px] p-4 border border-gray-800 shadow-2xl flex items-center justify-between gap-6 w-full"
      }
    >
      {compact && (
        <div className="text-[10px] font-bold text-gray-550 uppercase tracking-widest text-center w-full">
          Targets
        </div>
      )}

      {/* Centered Compact SVG Ring with Centered Compliance Percentage */}
      <div className={`relative flex items-center justify-center flex-shrink-0`} style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* ─── Outer Ring: Nutrition (Orange) ─── */}
          {!disableNutrition && (
            <>
              <circle cx={center} cy={center} r={rOuter} fill="transparent" stroke={trackNutrition} strokeWidth={strokeWidth} />
              <motion.circle
                cx={center} cy={center} r={rOuter} fill="transparent" stroke={colorNutrition} strokeWidth={strokeWidth}
                strokeDasharray={circOuter} strokeLinecap="round"
                initial={{ strokeDashoffset: circOuter }}
                animate={{ strokeDashoffset: circOuter * (1 - Math.min(kcalPct, 1)) }}
                transition={{ type: 'spring', damping: 22, stiffness: 95 }}
              />
            </>
          )}

          {/* ─── Middle Ring: Hydration (Sky Blue) ─── */}
          <circle cx={center} cy={center} r={rMiddle} fill="transparent" stroke={trackHydration} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rMiddle} fill="transparent" stroke={colorHydration} strokeWidth={strokeWidth}
            strokeDasharray={circMiddle} strokeLinecap="round"
            initial={{ strokeDashoffset: circMiddle }}
            animate={{ strokeDashoffset: circMiddle * (1 - Math.min(waterPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.05 }}
          />

          {/* ─── Inner Ring: Training (Violet) ─── */}
          <circle cx={center} cy={center} r={rInner} fill="transparent" stroke={trackTraining} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rInner} fill="transparent" stroke={colorTraining} strokeWidth={strokeWidth}
            strokeDasharray={circInner} strokeLinecap="round"
            initial={{ strokeDashoffset: circInner }}
            animate={{ strokeDashoffset: circInner * (1 - effectiveWorkoutStatus) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.1 }}
          />
        </svg>

        {/* Small readable percentage inside the inner ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
          <span className={`${compact ? 'text-[9.5px]' : 'text-[10px]'} font-extrabold text-white tracking-tight leading-none`}>
            {dailyBioScore}%
          </span>
        </div>
      </div>

      {compact ? (
        <span className="text-[10px] font-black uppercase tracking-wider text-primary leading-none">
          {dailyBioScore}% Targets
        </span>
      ) : (
        /* Redesigned Legend: dynamic vertical look */
        <div className="flex-1 flex flex-col gap-2.5 justify-center pl-2">
          {/* Nutrition */}
          {!disableNutrition && (
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wider mb-0.5">Nutrition</span>
              <span className="text-xs font-black" style={{ color: colorNutrition }}>
                {kcalPct >= 0.95 ? 'Completed' : kcalPct >= 0.75 ? 'On Track' : kcalPct > 0 ? 'Fueling' : 'Fuel Up'}
              </span>
            </div>
          )}

          {/* Hydration */}
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wider mb-0.5">Hydration</span>
            <span className="text-xs font-black" style={{ color: colorHydration }}>
              {waterPct >= 0.95 ? 'Completed' : waterPct >= 0.5 ? 'On Track' : waterPct > 0 ? 'Hydrating' : 'Hydrate'}
            </span>
          </div>

          {/* Training */}
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wider mb-0.5">Training</span>
            <span className="text-xs font-black" style={{ color: colorTraining }}>
              {isRestDay ? 'Rest Day' : workoutStatus === 1.0 ? 'Completed' : workoutStatus === 0.5 ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
