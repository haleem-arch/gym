import { motion } from 'framer-motion';

interface BioStatusRingProps {
  kcalPct: number;
  waterPct: number;
  workoutStatus: number; // 0.0 = not started, 0.5 = in progress, 1.0 = completed
  sleepPct: number;      // 0.0 to 1.0
  isRestDay?: boolean;
}

export const BioStatusRing = ({
  kcalPct,
  waterPct,
  workoutStatus,
  sleepPct,
  isRestDay = false
}: BioStatusRingProps) => {
  // SVG Geometry Settings (compact 100x100px)
  const size = 100;
  const center = size / 2;
  const strokeWidth = 3.5; // Slightly thinner to fit 4 rings comfortably

  // Concentric radii with gaps:
  // outer radius = 42, stroke = 3.5 -> edge boundary [40.25, 43.75]
  // middle radius = 32, stroke = 3.5 -> edge boundary [30.25, 33.75] (gap ~6.5px)
  // inner radius = 22, stroke = 3.5 -> edge boundary [20.25, 23.75] (gap ~6.5px)
  // inner-inner radius = 12, stroke = 3.5 -> edge boundary [10.25, 13.75] (gap ~6.5px)
  
  const rOuter = 42;
  const circOuter = 2 * Math.PI * rOuter;
  
  const rMiddle = 32;
  const circMiddle = 2 * Math.PI * rMiddle;
  
  const rInner = 22;
  const circInner = 2 * Math.PI * rInner;

  const rInnerInner = 12;
  const circInnerInner = 2 * Math.PI * rInnerInner;

  // Colors
  const colorNutrition = '#F97316';
  const colorHydration = '#38BDF8';
  const colorTraining = '#A78BFA';
  const colorSleep = '#6366F1'; // Indigo for sleep

  const trackNutrition = 'rgba(249, 115, 22, 0.15)';
  const trackHydration = 'rgba(56, 189, 248, 0.15)';
  const trackTraining = 'rgba(167, 139, 250, 0.15)';
  const trackSleep = 'rgba(99, 102, 241, 0.15)';

  // On a REST day, training is completed by resting!
  const effectiveWorkoutStatus = isRestDay ? 1.0 : workoutStatus;

  // Calculate today's dynamic average daily biometric completion score (out of 4 metrics now!)
  const dailyBioScore = Math.round(
    ((Math.min(kcalPct, 1) + Math.min(waterPct, 1) + effectiveWorkoutStatus + Math.min(sleepPct, 1)) / 4) * 100
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ backgroundColor: '#0D1117' }}
      className="rounded-[20px] p-4 border border-gray-800 shadow-2xl flex items-center justify-between gap-6 w-full"
    >
      {/* Centered Compact SVG Ring with Centered Compliance Percentage */}
      <div className="relative w-[100px] h-[100px] flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* ─── Outer Ring: Nutrition (Orange) ─── */}
          <circle cx={center} cy={center} r={rOuter} fill="transparent" stroke={trackNutrition} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rOuter} fill="transparent" stroke={colorNutrition} strokeWidth={strokeWidth}
            strokeDasharray={circOuter} strokeLinecap="round"
            initial={{ strokeDashoffset: circOuter }}
            animate={{ strokeDashoffset: circOuter * (1 - Math.min(kcalPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95 }}
          />

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

          {/* ─── Inner-Inner Ring: Sleep (Indigo) ─── */}
          <circle cx={center} cy={center} r={rInnerInner} fill="transparent" stroke={trackSleep} strokeWidth={strokeWidth} />
          <motion.circle
            cx={center} cy={center} r={rInnerInner} fill="transparent" stroke={colorSleep} strokeWidth={strokeWidth}
            strokeDasharray={circInnerInner} strokeLinecap="round"
            initial={{ strokeDashoffset: circInnerInner }}
            animate={{ strokeDashoffset: circInnerInner * (1 - Math.min(sleepPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.15 }}
          />
        </svg>

        {/* Small readable percentage inside the inner ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-black text-white tracking-tight leading-none">
            {dailyBioScore}%
          </span>
        </div>
      </div>

      {/* Redesigned Legend: Stacked Stat Rows */}
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {/* Row 1: Nutrition */}
        <div className="flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorNutrition }} />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Nutrition</span>
            <span className="text-xs font-black" style={{ color: colorNutrition }}>
              {kcalPct >= 0.95 ? 'Completed' : kcalPct >= 0.75 ? 'On Track' : kcalPct > 0 ? 'Fueling' : 'Fuel Up'}
            </span>
          </div>
        </div>

        {/* Row 2: Hydration */}
        <div className="flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorHydration }} />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Hydration</span>
            <span className="text-xs font-black" style={{ color: colorHydration }}>
              {waterPct >= 0.95 ? 'Completed' : waterPct >= 0.5 ? 'On Track' : waterPct > 0 ? 'Hydrating' : 'Hydrate'}
            </span>
          </div>
        </div>

        {/* Row 3: Training */}
        <div className="flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorTraining }} />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Training</span>
            <span className="text-xs font-black" style={{ color: colorTraining }}>
              {isRestDay ? 'Rest Day' : workoutStatus === 1.0 ? 'Completed' : workoutStatus === 0.5 ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Row 4: Sleep */}
        <div className="flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorSleep }} />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Sleep</span>
            <span className="text-xs font-black" style={{ color: colorSleep }}>
              {sleepPct >= 0.95 ? 'Fully Rested' : sleepPct >= 0.75 ? 'Rested' : sleepPct > 0 ? 'Charging' : 'Needs Sleep'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
