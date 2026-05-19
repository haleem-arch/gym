import React, { useState, useRef } from 'react';
import { Droplets } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

interface LiquidPourButtonProps {
  onLog: (amountInLiters: number) => void;
  className?: string;
}

export const LiquidPourButton = ({ onLog, className = '' }: LiquidPourButtonProps) => {
  const [isPouring, setIsPouring] = useState(false);
  const [pourAmount, setPourAmount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const controls = useAnimation();

  // How fast the liquid fills (ml per millisecond). 
  // 500ml over 1.5 seconds = 500 / 1500 = 0.333
  const POUR_RATE = 0.333;
  const MAX_POUR = 1000;

  const startPouring = (e: React.PointerEvent) => {
    e.preventDefault();
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    setIsPouring(true);
    setPourAmount(0);
    lastTimeRef.current = performance.now();
    controls.start({ scale: 0.95 });
    
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      setPourAmount(prev => {
        const next = prev + (delta * POUR_RATE);
        return next > MAX_POUR ? MAX_POUR : next;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopPouring = () => {
    if (!isPouring) return;
    
    setIsPouring(false);
    controls.start({ scale: 1 });
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (pourAmount > 50) {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 30]); // Success vibration pattern
      }
      onLog(Number((pourAmount / 1000).toFixed(2)));
    }
    
    // Reset after a tiny delay so the user sees the final amount they logged
    setTimeout(() => {
      setPourAmount(0);
    }, 500);
  };

  const fillPercentage = Math.min((pourAmount / MAX_POUR) * 100, 100);

  return (
    <motion.button
      animate={controls}
      onPointerDown={startPouring}
      onPointerUp={stopPouring}
      onPointerLeave={stopPouring}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      className={`relative w-full h-16 rounded-xl overflow-hidden cursor-pointer shadow-md select-none touch-none ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Background container that masks the wave */}
      <div className="absolute inset-0 bg-surface border border-gray-700/50" />
      
      {/* The animated liquid fill */}
      <div 
        className="liquid-fill"
        style={{ 
          height: `${Math.max(fillPercentage, 10)}%`,
          opacity: pourAmount > 0 ? 1 : 0,
          transition: isPouring ? 'none' : 'height 0.3s ease-out, opacity 0.5s ease-out'
        }}
      />

      {/* Button content (layered on top) */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
        <Droplets size={16} className={pourAmount > 500 ? 'text-white' : 'text-blue-400'} />
        <span className={`text-xs font-bold transition-colors ${pourAmount > 500 ? 'text-white' : 'text-gray-200'}`}>
          {isPouring ? `+ ${Math.round(pourAmount)}ml` : 'HOLD TO POUR WATER'}
        </span>
      </div>
    </motion.button>
  );
};
