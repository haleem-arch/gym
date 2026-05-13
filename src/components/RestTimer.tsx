import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X } from 'lucide-react';

interface RestTimerProps {
  initialTime: number; // in seconds
  isActive: boolean;
  onClose: () => void;
}

export const RestTimer = ({ initialTime, isActive, onClose }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(initialTime);
    }
  }, [isActive, initialTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Play sound
      const audio = new Audio('/beep.mp3'); 
      audio.play().catch(() => {});
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-surface border border-gray-700 shadow-2xl rounded-2xl p-4 z-40 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${timeLeft === 0 ? 'bg-danger/20 text-danger animate-pulse' : 'bg-primary/20 text-primary'}`}>
              <Timer size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rest Timer</p>
              <p className={`text-2xl font-bold tabular-nums ${timeLeft === 0 ? 'text-danger' : 'text-white'}`}>
                {timeLeft === 0 ? '0:00' : formatTime(timeLeft)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setTimeLeft(prev => prev + 30)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold hover:bg-gray-700 transition-colors"
            >
              +30s
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
