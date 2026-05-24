import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation = ({ onComplete }: OpeningAnimationProps) => {
  const [shiftUp, setShiftUp] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Timing configuration:
    // 0.0s - 0.2s: Brief dark screen delay.
    // 0.2s - 1.05s: Plates slide perfectly along the rod and snap together (recreating icon.svg).
    // 1.05s - 1.6s: Complete logo translates upward slightly while the white text "LIFE GYM" fades in below.
    // 1.6s - 2.4s: Settle state for brand presentation.
    // 2.4s: Exit transition starts (fades out and scales down overlay).
    
    const textTimer = setTimeout(() => {
      setShiftUp(true);
      setShowText(true);
    }, 1050);

    const animationEnd = setTimeout(() => {
      setIsDone(true);
    }, 2450);

    return () => {
      clearTimeout(textTimer);
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
        >
          <div className="relative flex flex-col items-center justify-center">
            
            {/* Dumbbell Logo Container (Translates up once plates attach) */}
            <motion.div
              animate={{ y: shiftUp ? -35 : 0 }}
              transition={{
                duration: 0.65,
                ease: [0.25, 1, 0.5, 1], // Smooth deceleration curve
              }}
              style={{ width: 180, height: 180 }}
              className="relative flex items-center justify-center select-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-full h-full"
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

                  {/* Left Weights (Fly in along the rod from top-left) */}
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

                  {/* Right Weights (Fly in along the rod from bottom-right) */}
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

            {/* LIFE GYM Text (Fades in directly below center dumbbell) */}
            <div className="absolute top-[58%] w-full flex justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{
                  duration: 0.55,
                  ease: 'easeOut',
                }}
                className="text-white font-black text-2xl uppercase tracking-[0.25em] select-none text-center whitespace-nowrap"
              >
                LIFE GYM
              </motion.h1>
            </div>

            {/* Glowing Accent Ring (Soft pulse upon impact) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={showText ? { scale: [0.8, 1.25, 0.8], opacity: [0, 0.45, 0] } : {}}
              transition={{
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
