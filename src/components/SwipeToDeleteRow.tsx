import { useState, useRef, type ReactNode } from 'react';
import { Trash2, X } from 'lucide-react';

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
    <div className={`relative w-full overflow-hidden group ${className}`}>
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

      {/* Desktop-only delete X button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
        className="hidden md:flex absolute right-1.5 top-1.5 z-20 items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 transition-all hover:scale-105 active:scale-95 shadow-sm border border-red-500/30 cursor-pointer opacity-0 group-hover:opacity-100"
        title="Delete item"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};
