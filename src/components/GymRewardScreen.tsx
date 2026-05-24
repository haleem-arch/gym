import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GymRewardScreenProps {
  stats: {
    duration: number; // seconds
    sets: number;
    volume: number; // kg
    dayType: string;
  };
  onDone: () => void;
  onBack: () => void;
}

export const GymRewardScreen = ({ stats, onDone, onBack }: GymRewardScreenProps) => {
  const [displayVolume, setDisplayVolume] = useState(0);
  const targetVolume = stats.volume;

  // Count-up animation for volume
  useEffect(() => {
    const delay = setTimeout(() => {
      let start: number | null = null;
      const duration = 1200;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setDisplayVolume(Math.floor(progress * targetVolume));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1300);
    return () => clearTimeout(delay);
  }, [targetVolume]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background"
    >
      <div className="w-full max-w-sm text-center">

        {/* Dumbbell Logo Pop-In */}
        <div className="flex justify-center mb-8">
          <div className="gym-reward-badge w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)', boxShadow: '0 0 40px rgba(59,130,246,0.4)' }}
          >
            {/* CSS Dumbbell Icon — matching your app's icon */}
            <div style={{ transform: 'rotate(-45deg)', width: 52, height: 52, position: 'relative' }}>
              {/* Bar */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 38,
                height: 7,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
              }} />
              {/* Left Plates */}
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0 }}>
                <div style={{ width: 10, height: 24, background: 'white', borderRadius: 3, marginBottom: 2 }} />
              </div>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 5 }}>
                <div style={{ width: 8, height: 18, background: 'rgba(255,255,255,0.7)', borderRadius: 3 }} />
              </div>
              {/* Right Plates */}
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 0 }}>
                <div style={{ width: 10, height: 24, background: 'white', borderRadius: 3 }} />
              </div>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 5 }}>
                <div style={{ width: 8, height: 18, background: 'rgba(255,255,255,0.7)', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="gym-reward-title font-black text-3xl text-white mb-1 tracking-tight">
          Session Complete
        </h2>
        <p className="gym-reward-subtitle text-gray-400 mb-10 font-medium text-sm uppercase tracking-widest">
          {stats.dayType} Workout Saved
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="gym-reward-stat-1 bg-surface border border-gray-800 rounded-2xl p-4">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Duration</span>
            <div className="text-xl font-black text-white">{formatDuration(stats.duration)}</div>
          </div>
          <div className="gym-reward-stat-2 bg-surface border border-gray-800 rounded-2xl p-4">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Sets</span>
            <div className="text-xl font-black text-white">{stats.sets}</div>
          </div>
          <div className="gym-reward-stat-3 bg-surface border border-gray-800 rounded-2xl p-4">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Volume</span>
            <div className="text-xl font-black text-white">
              {displayVolume.toLocaleString()}<span className="text-xs text-gray-500 ml-0.5 font-bold">kg</span>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onDone}
          className="gym-reward-btn w-full py-4 bg-primary hover:bg-blue-600 text-white font-extrabold rounded-2xl transition-all active:scale-[0.97] shadow-xl shadow-primary/30 text-sm tracking-wide uppercase"
        >
          View Session Receipt →
        </button>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="gym-reward-back-btn w-full mt-3 py-3.5 border border-gray-800 hover:bg-surface text-gray-400 font-bold rounded-2xl transition-all active:scale-[0.97] text-sm tracking-wide uppercase"
        >
          Back to Workouts
        </button>
      </div>
    </motion.div>
  );
};
