import { motion } from 'framer-motion';

interface DumbbellLoaderProps {
  size?: number;
  fullScreen?: boolean;
  label?: string;
}

/**
 * DumbbellLoader
 *
 * Animated loading indicator using the Life Gym dumbbell icon.
 * The left and right weight plates alternate sliding out along the
 * barbell axis (rotated -45°) and back in.
 *
 * Continuous Piston Motion:
 *   - At t = 0: Right is at center (0), Left is fully out (-travel)
 *   - At t = 0.25: Right is fully out (travel), Left is at center (0)
 *   - At t = 0.5: Right is at center (0), Left is fully out (-travel)
 *   - At t = 0.75: Right is fully out (travel), Left is at center (0)
 *   - At t = 1.0: Right is at center (0), Left is fully out (-travel)
 *
 * This ensures that as one set of plates slides back in, the other slides out,
 * in a seamless, high-energy loop with no pauses.
 */
export const DumbbellLoader = ({ size = 120, fullScreen = false, label }: DumbbellLoaderProps) => {
  const wrapperClass = fullScreen
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-[#0a0a0a]'
    : 'flex flex-col items-center justify-center gap-4 py-8';

  // Travel distance along the rod axis in SVG coordinates (viewBox 512)
  const travel = 50; // A smaller travel distance of 50 makes it look cohesive and not split apart completely

  // Right plates: 0 -> travel -> 0 -> travel -> 0
  const rightX = [0, travel, 0, travel, 0];
  // Left plates: -travel -> 0 -> -travel -> 0 -> -travel
  const leftX  = [-travel, 0, -travel, 0, -travel];
  
  const kTimes = [0, 0.25, 0.5, 0.75, 1];

  const plateTransition = {
    duration: 1.6,
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
        className="select-none overflow-visible relative flex items-center justify-center"
      >
        {/* Soft breathing background glow */}
        <motion.div
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl pointer-events-none"
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          shapeRendering="geometricPrecision"
          className="w-full h-full overflow-visible relative z-10"
        >
          <g transform="translate(256 256) rotate(-45)">
            {/* Bar/Handle */}
            <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />

            {/* Left weight plates (slides to left/bottom-left along axis) */}
            <motion.g
              animate={{ x: leftX }}
              transition={plateTransition}
            >
              <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            </motion.g>

            {/* Right weight plates (slides to right/top-right along axis) */}
            <motion.g
              animate={{ x: rightX }}
              transition={plateTransition}
            >
              <rect x="80"  y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
              <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
              <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            </motion.g>
          </g>
        </svg>
      </div>

      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-gray-400 text-xs font-semibold uppercase tracking-widest text-center"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

