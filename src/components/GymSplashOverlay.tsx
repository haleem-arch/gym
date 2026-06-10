import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface GymSplashOverlayProps {
  show: boolean;
  onComplete?: () => void;
  workoutName?: string;
}

export function GymSplashOverlay({ show, onComplete, workoutName = 'Workout' }: GymSplashOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md px-6 select-none"
        >
          {/* Subtle Radial Gradient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Animated Success Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative flex items-center justify-center w-24 h-24 rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] mb-8"
          >
            {/* Outer pulse ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.25, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-emerald-500/40 pointer-events-none"
            />
            <Check className="w-12 h-12 text-emerald-400 stroke-[2.5]" />
          </motion.div>

          {/* Title Text */}
          <motion.h2
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase text-center mb-2"
          >
            Workout Completed
          </motion.h2>

          {/* Workout Name */}
          {workoutName && (
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm font-semibold text-emerald-400/90 tracking-wide uppercase text-center max-w-md"
            >
              {workoutName}
            </motion.p>
          )}

          {/* Locked In Message */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.4 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-[10px] font-black tracking-[0.2em] text-white uppercase text-center mt-12"
          >
            Session Saved & Locked
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
