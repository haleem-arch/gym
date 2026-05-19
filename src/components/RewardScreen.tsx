import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardScreenProps {
  stats: {
    distance: string;
    pace: string;
    duration: string;
  };
  onClose: () => void;
}

export const RewardScreen = ({ stats, onClose }: RewardScreenProps) => {
  const [displayDistance, setDisplayDistance] = useState('0.00');
  
  useEffect(() => {
    const endValue = parseFloat(stats.distance) || 0;
    const duration = 1000;
    
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const currentVal = (progress * endValue).toFixed(2);
      setDisplayDistance(currentVal);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    // Start animation after a 500ms delay to match the Strava feel
    const timeoutId = setTimeout(() => {
      animationFrameId = window.requestAnimationFrame(step);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [stats.distance]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-surface p-8 rounded-3xl shadow-2xl border border-gray-800 text-center w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          {/* Popping Badge */}
          <div className="w-16 h-16 bg-[#fc4c02] rounded-full flex items-center justify-center mx-auto mb-5 pop-in-badge shadow-lg shadow-[#fc4c02]/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h2 className="title-slide font-black text-2xl text-white mb-1">Great Job!</h2>
          <p className="subtitle-slide text-gray-400 mb-8 font-medium">Run successfully saved.</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-slide-1">
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Distance</span>
              <div className="text-xl font-black text-white">
                <span>{displayDistance}</span> <small className="text-xs text-gray-400">km</small>
              </div>
            </div>
            
            <div className="stat-slide-2">
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Pace</span>
              <div className="text-xl font-black text-white">
                {stats.pace || '--'} <small className="text-xs text-gray-400">/km</small>
              </div>
            </div>
            
            <div className="stat-slide-3">
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Time</span>
              <div className="text-xl font-black text-white">
                {stats.duration ? `${stats.duration}m` : '--'}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-10 w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
