import { useState, useRef, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwipeToDeleteRowProps {
  children: ReactNode;
  onDelete: () => void;
  threshold?: number;
  className?: string;
  backgroundRounded?: string;
}

export const SwipeToDeleteRow = ({ children, onDelete, threshold = 80, className = '', backgroundRounded = 'rounded-lg' }: SwipeToDeleteRowProps) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isShredding, setIsShredding] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isShredding) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || isShredding) return;
    const diff = e.touches[0].clientX - startX;
    if (diff < 0) {
      setCurrentX(Math.max(diff, -threshold - 40));
    }
  };

  const handleTouchEnd = () => {
    if (isShredding) return;
    setIsSwiping(false);
    
    if (currentX < -threshold) {
      if (navigator.vibrate) navigator.vibrate(30);
      setIsShredding(true);
      setCurrentX(0);
      
      setTimeout(() => {
        onDelete();
        // Reset state after a short delay in case component is reused instead of unmounted
        setTimeout(() => setIsShredding(false), 100);
      }, 500); // 500ms for shredding animation
    } else {
      setCurrentX(0); // Snap back
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background Delete Layer */}
      <div className={`absolute inset-0 bg-danger flex items-center justify-end pr-4 ${backgroundRounded}`}>
        <Trash2 className="text-white w-5 h-5" />
      </div>
      
      {/* Foreground Content */}
      <AnimatePresence>
        {!isShredding ? (
          <motion.div 
            ref={rowRef}
            initial={false}
            animate={{ x: currentX }}
            exit={{ 
              opacity: 0,
              scale: 0.8,
              filter: "blur(4px)",
              transition: { duration: 0.4 } 
            }}
            className="relative w-full bg-surface z-10 origin-right"
            style={{ 
              transition: isSwiping ? 'none' : 'transform 0.2s ease-out' 
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div 
            className="relative w-full bg-surface z-10 origin-center pointer-events-none"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1, scale: 1 }}
            animate={{ 
              clipPath: ["polygon(0 0, 100% 0, 100% 100%, 0 100%)", "polygon(0 40%, 100% 0, 100% 60%, 0 100%)", "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)"],
              opacity: 0,
              scale: 0.5,
              rotate: [0, -10, 10, -5],
              filter: ["blur(0px)", "blur(2px)", "blur(8px)"]
            }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
