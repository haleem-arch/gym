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
              style={{ width: 150, height: 150 }}
              className={`relative flex items-center justify-center ${isSpinning ? 'motion-blur-effect' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="150"
                height="150"
                viewBox="0 0 100 100"
                className="w-full h-full select-none"
              >
                {/* Bar (Rod) */}
                <rect
                  id="bar"
                  x="46"
                  y="12"
                  width="8"
                  height="76"
                  rx="4"
                  transform="rotate(45 50 50)"
                  fill="#1e2738"
                />

                {/* Top Plates (Fly in from top-left) */}
                <motion.g
                  id="top-plates"
                  initial={{ x: -150, y: -150 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1], // easeOutCubic
                    delay: 0.2,
                  }}
                  fill="#3b82f6"
                >
                  <rect
                    x="4"
                    y="19"
                    width="38"
                    height="11"
                    rx="5.5"
                    transform="rotate(45 23 24.5)"
                  />
                  <rect
                    x="10"
                    y="14.5"
                    width="32"
                    height="9"
                    rx="4.5"
                    transform="rotate(45 26 19)"
                  />
                </motion.g>

                {/* Bottom Plates (Fly in from bottom-right) */}
                <motion.g
                  id="bottom-plates"
                  initial={{ x: 150, y: 150 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1], // easeOutCubic
                    delay: 0.2,
                  }}
                  fill="#3b82f6"
                >
                  <rect
                    x="58"
                    y="70"
                    width="38"
                    height="11"
                    rx="5.5"
                    transform="rotate(45 77 75.5)"
                  />
                  <rect
                    x="58"
                    y="76.5"
                    width="32"
                    height="9"
                    rx="4.5"
                    transform="rotate(45 74 81)"
                  />
                </motion.g>
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
