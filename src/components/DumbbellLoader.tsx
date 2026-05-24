import { motion } from 'framer-motion';

interface DumbbellLoaderProps {
  size?: number;
  fullScreen?: boolean;
}

/**
 * DumbbellLoader
 *
 * Animated loading indicator using the Life Gym dumbbell icon.
 * The left and right weight plates alternate sliding out along the
 * barbell axis (rotated -45°) and back in, creating a breathing
 * pendulum effect that loops until loading completes.
 *
 * Timeline (2s period):
 *   0%  - 25%: Right plates slide OUT  (+x along rod axis)
 *   25% - 50%: Right plates slide BACK IN  (simultaneously)
 *   25% - 50%: Left plates slide OUT   (-x along rod axis)
 *   50% - 75%: Left plates slide BACK IN
 *   75% - 100%: Brief settle before next cycle
 */
export const DumbbellLoader = ({ size = 130, fullScreen = false }: DumbbellLoaderProps) => {
  const wrapperClass = fullScreen
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-[#0a0a0a]'
    : 'flex flex-col items-center justify-center gap-5';

  // How far plates travel along the rod axis (in SVG units, viewBox=512)
  const travel = 240;

  // Right plates: 0 → out → 0 → idle → 0
  const rightX = [0, travel, 0, 0, 0];
  // Left plates: 0 → idle → 0 → out → 0
  const leftX  = [0, 0, -travel, 0, 0];
  // Shared keyframe timing proportions
  const kTimes = [0, 0.25, 0.5, 0.75, 1];

  const plateTransition = {
    duration: 1.8,
    times: kTimes,
    ease: 'easeInOut' as const,
    repeat: Infinity,
    repeatType: 'loop' as const,
  };

  return (
    <div className={wrapperClass}>
      <div
        style={{
          width: size,
          height: size,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="select-none overflow-visible"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          shapeRendering="geometricPrecision"
          className="w-full h-full overflow-visible"
        >
          <g transform="translate(256 256) rotate(-45)">

            {/* Bar — always fully visible */}
            <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />

            {/* Left weight plates — alternate sliding out to the left */}
            <motion.g
              animate={{ x: leftX }}
              transition={{ ...plateTransition }}
            >
              <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            </motion.g>

            {/* Right weight plates — slide out first, then alternate with left */}
            <motion.g
              animate={{ x: rightX }}
              transition={{ ...plateTransition }}
            >
              <rect x="80"  y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            </motion.g>

          </g>
        </svg>
      </div>
    </div>
  );
};
