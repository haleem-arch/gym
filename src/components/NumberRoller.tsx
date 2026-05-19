import { useEffect, useState, useRef } from 'react';

interface NumberRollerProps {
  value: number;
  duration?: number;
  decimals?: number;
}

export const NumberRoller = ({ value, duration = 800, decimals = 0 }: NumberRollerProps) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef(value);

  useEffect(() => {
    // If the value hasn't changed or it's the initial render, do nothing
    if (value === startValueRef.current) return;

    const startValue = startValueRef.current;
    const endValue = value;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easedProgress = easeOutQuart(progress);
      const currentVal = startValue + (endValue - startValue) * easedProgress;
      
      setDisplayValue(currentVal);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        startValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <>{displayValue.toFixed(decimals)}</>;
};
