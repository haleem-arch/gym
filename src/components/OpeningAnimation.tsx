import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation = ({ onComplete }: OpeningAnimationProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Timing configuration:
    // 0.0s - 0.2s: Delay before plates fly-in
    // 0.2s - 1.0s: Plates fly-in from corner of the screen
    // 0.9s: Core spin starts (slight overlap for seamless feel)
    // 0.9s - 1.8s: Dumbbell performs two full spins (720deg)
    // 1.8s - 2.0s: Settle and prepare fade-out
    // 2.0s: Exit transition starts
    
    const spinStart = setTimeout(() => {
      setIsSpinning(true);
    }, 900);

    const spinEnd = setTimeout(() => {
      setIsSpinning(false);
    }, 1800);

    const animationEnd = setTimeout(() => {
      setIsDone(true);
    }, 2100);

    return () => {
      clearTimeout(spinStart);
      clearTimeout(spinEnd);
      clearTimeout(animationEnd);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            
            {/* Dumbbell Logo Container */}
            <motion.div
              animate={isSpinning ? { rotate: 720 } : { rotate: 0 }}
              transition={{
                duration: 1.0,
                ease: [0.25, 0.8, 0.25, 1], // Custom smooth ease-in-out curve
                delay: 0.9,
              }}
              style={{ width: 180, height: 180 }}
              className={`relative flex items-center justify-center ${isSpinning ? 'motion-blur-effect' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-full h-full select-none"
              >
                <g transform="translate(256 256) rotate(-45)">
                  {/* Handle/Bar (Rod) */}
                  <rect
                    id="bar"
                    x="-120"
                    y="-16"
                    width="240"
                    height="32"
                    rx="8"
                    fill="#1f2937"
                  />

                  {/* Left Weights (Fly in from top-left end of the rod) */}
                  <motion.g
                    id="left-weights"
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1], // easeOutCubic
                      delay: 0.2,
                    }}
                  >
                    <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
                    <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
                    <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
                  </motion.g>

                  {/* Right Weights (Fly in from bottom-right end of the rod) */}
                  <motion.g
                    id="right-weights"
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1], // easeOutCubic
                      delay: 0.2,
                    }}
                  >
                    <rect x="80" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
                    <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
                    <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
                  </motion.g>
                </g>
              </svg>
            </motion.div>

            {/* Glowing Accent Ring (Pulse effect upon impact) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.8, 1.25, 0.8], opacity: [0, 0.55, 0] }}
              transition={{
                delay: 1.5,
                duration: 0.75,
                ease: 'easeOut',
              }}
              className="absolute w-44 h-44 rounded-full border-2 border-primary/45 bg-primary/5 filter blur-[6px] pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
