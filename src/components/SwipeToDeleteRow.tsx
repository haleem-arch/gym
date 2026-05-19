import { useState, useRef, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

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
  const rowRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    // Only allow swiping left
    if (diff < 0) {
      setCurrentX(Math.max(diff, -threshold - 40)); // Prevent swiping too far past threshold
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX < -threshold) {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      onDelete();
      setCurrentX(0); // Reset for component reuse
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
      <div 
        ref={rowRef}
        className="relative w-full bg-surface transition-transform duration-200 ease-out z-10"
        style={{ transform: `translateX(${currentX}px)`, transitionDuration: isSwiping ? '0ms' : '200ms' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
