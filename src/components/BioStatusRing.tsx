import { motion } from 'framer-motion';

interface BioStatusRingProps {
  kcalPct: number;
  waterPct: number;
  workoutStatus: number; // 0.0 = not started, 0.5 = in progress, 1.0 = completed
  kcalCurrent: number;
  kcalTarget: number;
  waterCurrentL: number;
  waterTargetL: number;
  inbodyScore?: number;
}

export const BioStatusRing = ({
  kcalPct,
  waterPct,
  workoutStatus,
  kcalCurrent,
  kcalTarget,
  waterCurrentL,
  waterTargetL,
  inbodyScore = 82
}: BioStatusRingProps) => {
  // SVG Geometry Settings
  const size = 160;
  const center = size / 2;
  const strokeWidth = 6;

  // Ring Radii for 10px physical gap between adjacent boundaries:
  // outer radius = 66, stroke = 6 -> edge boundary [63, 69]
  // middle radius = 50, stroke = 6 -> edge boundary [47, 53] (gap = 63 - 53 = 10px!)
  // inner radius = 34, stroke = 6 -> edge boundary [31, 37] (gap = 47 - 37 = 10px!)
  const rOuter = 66;
  const circOuter = 2 * Math.PI * rOuter; // ~414.69
  
  const rMiddle = 50;
  const circMiddle = 2 * Math.PI * rMiddle; // ~314.16
  
  const rInner = 34;
  const circInner = 2 * Math.PI * rInner; // ~213.63

  // Colors
  const colorNutrition = '#F97316';
  const colorHydration = '#38BDF8';
  const colorTraining = '#A78BFA';

  const trackNutrition = 'rgba(249, 115, 22, 0.15)';
  const trackHydration = 'rgba(56, 189, 248, 0.15)';
  const trackTraining = 'rgba(167, 139, 250, 0.15)';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ 
        opacity: 1, 
        scale: [1, 1.008, 1] 
      }}
      transition={{
        scale: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: { duration: 0.25 }
      }}
      style={{ backgroundColor: '#0D1117' }}
      className="rounded-[20px] p-5 pl-6 pr-6 border border-gray-800 shadow-2xl flex items-center justify-between gap-6"
    >
      {/* Centered Concentric Ring Widget */}
      <div className="relative w-[160px] h-[160px] flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* ─── Outer Ring: Nutrition (Orange) ─── */}
          <circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="transparent"
            stroke={trackNutrition}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="transparent"
            stroke={colorNutrition}
            strokeWidth={strokeWidth}
            strokeDasharray={circOuter}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circOuter }}
            animate={{ strokeDashoffset: circOuter * (1 - Math.min(kcalPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95 }}
          />

          {/* ─── Middle Ring: Hydration (Sky Blue) ─── */}
          <circle
            cx={center}
            cy={center}
            r={rMiddle}
            fill="transparent"
            stroke={trackHydration}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rMiddle}
            fill="transparent"
            stroke={colorHydration}
            strokeWidth={strokeWidth}
            strokeDasharray={circMiddle}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circMiddle }}
            animate={{ strokeDashoffset: circMiddle * (1 - Math.min(waterPct, 1)) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.1 }}
          />

          {/* ─── Inner Ring: Training (Violet) ─── */}
          <circle
            cx={center}
            cy={center}
            r={rInner}
            fill="transparent"
            stroke={trackTraining}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={rInner}
            fill="transparent"
            stroke={colorTraining}
            strokeWidth={strokeWidth}
            strokeDasharray={circInner}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circInner }}
            animate={{ strokeDashoffset: circInner * (1 - workoutStatus) }}
            transition={{ type: 'spring', damping: 22, stiffness: 95, delay: 0.2 }}
          />
        </svg>

        {/* Center Text (Compact, perfectly fitting typography) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-1">
          <span className="text-xl font-extrabold text-white tracking-tight leading-none">
            {inbodyScore}%
          </span>
          <span className="text-[8px] text-gray-500 uppercase tracking-widest font-semibold mt-1 leading-none">
            InBody
          </span>
        </div>
      </div>

      {/* Redesigned Legend: Stacked Stat Rows */}
      <div className="flex-1 flex flex-col gap-4 justify-center">
        {/* Row 1: Nutrition */}
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorNutrition }} />
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nutrition</span>
            <span className="text-sm font-bold text-white mb-1">
              {Math.round(kcalCurrent)} kcal
            </span>
            <span className="text-[12px] text-gray-500">
              of {kcalTarget} kcal
            </span>
          </div>
        </div>

        {/* Row 2: Hydration */}
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorHydration }} />
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Hydration</span>
            <span className="text-sm font-bold text-white mb-1">
              {waterCurrentL.toFixed(1)} L
            </span>
            <span className="text-[12px] text-gray-500">
              of {waterTargetL} L
            </span>
          </div>
        </div>

        {/* Row 3: Training */}
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colorTraining }} />
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Training</span>
            <span className="text-sm font-bold text-white mb-1">
              {workoutStatus === 1.0 
                ? 'Completed' 
                : workoutStatus === 0.5 
                ? 'Active' 
                : 'Rest'}
            </span>
            <span className="text-[12px] text-gray-500">
              {workoutStatus === 1.0 
                ? '1 of 1 session' 
                : workoutStatus === 0.5 
                ? '0.5 of 1 session' 
                : '0 of 1 session'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
