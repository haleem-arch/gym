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
  const [isDeleted, setIsDeleted] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleted) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || isDeleted) return;
    const diff = e.touches[0].clientX - startX;
    if (diff < 0) {
      setCurrentX(Math.max(diff, -threshold - 40));
    }
  };

  const handleTouchEnd = () => {
    if (isDeleted) return;
    setIsSwiping(false);
    
    if (currentX < -threshold) {
      if (navigator.vibrate) navigator.vibrate(30);
      setIsDeleted(true);
      
      // Delay so exit animation can play before we unmount/call backend
      setTimeout(() => {
        onDelete();
        // Fallback to reset state in case the component is reused (e.g. key didn't change)
        setTimeout(() => setIsDeleted(false), 200);
      }, 300);
    } else {
      setCurrentX(0); // Snap back
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background Delete Layer */}
      <AnimatePresence>
        {!isDeleted && (
          <motion.div 
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-danger flex items-center justify-end pr-4 ${backgroundRounded}`}
          >
            <Trash2 className="text-white w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Foreground Content */}
      <AnimatePresence>
        {!isDeleted && (
          <motion.div 
            ref={rowRef}
            initial={false}
            animate={{ x: currentX }}
            exit={{ 
              opacity: 0,
              height: 0,
              transition: { duration: 0.3 } 
            }}
            className="relative w-full bg-surface z-10"
            style={{ 
              transition: isSwiping ? 'none' : 'transform 0.2s ease-out' 
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
