import { useEffect, useState, useRef } from 'react';


interface TypewriterTextProps {
  text: string;
  speed?: number;
  glitchProbability?: number;
  className?: string;
  onComplete?: () => void;
}

const GLITCH_CHARS = '!<>-_\\\\/[]{}—=+*^?#_@%';

export const TypewriterText = ({ 
  text, 
  speed = 15, 
  glitchProbability = 0.1,
  className = "",
  onComplete
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textRef = useRef(text);
  const currentIndexRef = useRef(0);
  
  // Reset if text changes entirely
  useEffect(() => {
    if (text !== textRef.current) {
      textRef.current = text;
      setDisplayedText('');
      currentIndexRef.current = 0;
      setIsTyping(true);
    }
  }, [text]);

  useEffect(() => {
    if (!isTyping) return;
    
    const targetText = textRef.current;
    
    // Quick resolve if we somehow overshoot
    if (currentIndexRef.current >= targetText.length) {
      setIsTyping(false);
      setDisplayedText(targetText);
      if (onComplete) onComplete();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const i = currentIndexRef.current;
      
      // Do we glitch this tick?
      const isGlitch = Math.random() < glitchProbability;
      
      if (isGlitch) {
        // Show a glitch character for one tick
        const randomChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setDisplayedText(targetText.slice(0, i) + randomChar);
        timeoutId = setTimeout(tick, speed);
      } else {
        // Advance normally
        setDisplayedText(targetText.slice(0, i + 1));
        currentIndexRef.current += 1;
        
        // Add varying speed to simulate real AI chunk streaming
        const variableSpeed = speed + (Math.random() * speed * 2) + (targetText[i] === '.' || targetText[i] === '\n' ? 100 : 0);
        
        if (currentIndexRef.current >= targetText.length) {
          setIsTyping(false);
          if (onComplete) onComplete();
        } else {
          timeoutId = setTimeout(tick, variableSpeed);
        }
      }
    };

    timeoutId = setTimeout(tick, speed);

    return () => clearTimeout(timeoutId);
  }, [isTyping, speed, glitchProbability, onComplete]);

  // Parse basic markdown like bold and lists dynamically
  const renderText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, i) => {
          if (!line.trim() && i !== lines.length - 1) return <div key={i} className="h-2" />;
          
          const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>
              : p
          );
          
          const isBullet = /^[-•*]\s/.test(line);
          return (
            <div key={i} className={isBullet ? 'flex gap-2' : ''}>
              {isBullet && <span className="text-primary mt-0.5 flex-shrink-0">•</span>}
              <span className={isBullet ? '' : 'inline'}>
                {isBullet ? parts.map((p) => typeof p === 'string' ? p.replace(/^[-•*]\s/, '') : p) : parts}
                {/* Show cursor directly after text to ensure proper wrapping */}
                {i === lines.length - 1 && isTyping && (
                  <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse translate-y-0.5" />
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {renderText(displayedText)}
    </div>
  );
};
