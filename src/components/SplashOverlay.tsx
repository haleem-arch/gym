import { useEffect, useState } from 'react';

interface SplashOverlayProps {
  show: boolean;
  onComplete?: () => void;
  hideText?: boolean;
}

/**
 * SplashOverlay — brand ribbon explosion + fade to dark
 *
 * Timeline:
 *   0.10s  Ribbon pass 1 sweeps           (0.9s)
 *   0.60s  Ribbon pass 2 explodes         (1.0s)
 *   1.45s  Solid blue locks in
 *   1.50s  Dumbbell pops in               (0.5s)
 *   1.95s  Blue fades → black + blue glow (0.5s)
 *   1.95s  Dumbbell shifts up, random phrase fades/slides up
 *   2.60s  Overlay fades to nothing       (0.4s)
 *   3.00s  onComplete() fires
 */
export function SplashOverlay({ show, onComplete, hideText = false }: SplashOverlayProps) {
  const [shiftUp, setShiftUp] = useState(false);
  const [showText, setShowText] = useState(false);
  const [randomPhrase, setRandomPhrase] = useState('');

  const PHRASES = [
    "GOOD JOB! ⚡",
    "YOU NAILED IT! 🔥",
    "SMASHED IT! 🚀",
    "UNSTOPPABLE! 💪",
    "WORK DONE! 🎯",
    "EARNED, NOT GIVEN. 👑",
    "ANOTHER ONE DOWN! 🏆",
    "MAKING PROGRESS! 📈",
    "PURE DEDICATION! 🔋",
    "STRONGER TODAY! 🌟"
  ];

  useEffect(() => {
    if (!show) {
      setShiftUp(false);
      setShowText(false);
      return;
    }

    // Set a random congratulatory phrase from the array of 10 phrases
    const randomIdx = Math.floor(Math.random() * PHRASES.length);
    setRandomPhrase(PHRASES[randomIdx]);

    // Lift the dumbbell and show the text at 1.95s (as the background fades to dark)
    const shiftTimer = setTimeout(() => {
      setShiftUp(true);
      setShowText(true);
    }, 1950);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3800);

    return () => {
      clearTimeout(shiftTimer);
      clearTimeout(completeTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div id="splash-root" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#0a0a0a',
      animation: 'splashFadeOut 0.4s ease-in 3.4s forwards',
    }}>
      <style>{`
        @keyframes swoopThrough {
          0%   { stroke-dashoffset: 3000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes explosiveWave {
          0%   { stroke-dashoffset: 4000; stroke-width: 70; }
          65%  { stroke-width: 90; }
          85%  { stroke-width: 1500; }
          100% { stroke-dashoffset: 0; stroke-width: 4000; }
        }
        @keyframes slightDrift {
          0%   { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(3deg); }
        }
        @keyframes lockSolidFill {
          to { opacity: 1; }
        }
        @keyframes fadeToBlackLayer {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes popLogoIn {
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashFadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes pulseGlow {
          0%   { transform: scale(0.9); opacity: 0.3; }
          50%  { transform: scale(1.15); opacity: 0.6; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
        @keyframes ambientGlowPulse {
          0%   { opacity: 0.4; transform: scale(1); }
          50%  { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(1); }
        }
      `}</style>

      {/* ── Ribbon SVG ── */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          transformOrigin: 'center',
          animation: 'slightDrift 2s ease-out forwards',
        }}
      >
        <path
          fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"
          strokeWidth="80" strokeDasharray="3000" strokeDashoffset="3000"
          d="M -200,200 Q 400,-200 1200,800"
          style={{ animation: 'swoopThrough 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s forwards' }}
        />
        <path
          fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"
          strokeWidth="70" strokeDasharray="4000" strokeDashoffset="4000"
          d="M -200,1200 C 300,1100 400,300 1200,-200"
          style={{ animation: 'explosiveWave 1.0s cubic-bezier(0.5,0,0.1,1) 0.6s forwards' }}
        />
      </svg>

      {/* ── Solid blue fill (snaps in at 1.45s) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#3b82f6',
        opacity: 0, zIndex: 1,
        animation: 'lockSolidFill 0.1s linear 1.45s forwards',
      }} />

      {/* ── Fade back to dark (starts at 1.95s) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#060610',
        opacity: 0, zIndex: 2,
        animation: 'fadeToBlackLayer 0.55s ease-in 1.95s forwards',
      }} />

      {/* ── Blue ambient radial glow on the dark bg ── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0) 70%)',
        filter: 'blur(30px)',
        opacity: 0, zIndex: 3,
        animation: 'ambientGlowPulse 0.8s ease-in-out 2.0s infinite',
      }} />

      {/* ── Vertical Flex layout holding the Dumbbell + Random Text ── */}
      <div className="flex flex-col items-center justify-center p-6" style={{ position: 'relative', zIndex: 4 }}>
        
        {/* Logo pop-in wrapper (handles scale-pop on load, shifts up when shiftUp is true) */}
        <div style={{
          width: 140,
          height: 140,
          opacity: 0,
          transform: 'scale(0.5) translateY(20px)',
          animation: 'popLogoIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) 1.5s forwards',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Shift transition wrapper */}
          <div style={{
            transform: `translateY(${shiftUp && !hideText ? '-20px' : '0px'})`,
            transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Blue glow */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)',
              filter: 'blur(16px)',
              animation: 'pulseGlow 1.2s ease-in-out infinite',
              zIndex: 2,
            }} />
            
            {/* SVG dumbbell (Steady, no piston slide wiggling, with high-contrast shadows) */}
            <svg viewBox="0 0 512 512" style={{
              width: '100%', height: '100%',
              position: 'relative', zIndex: 3, overflow: 'visible',
              filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.95)) drop-shadow(0 4px 8px rgba(0,0,0,0.85))',
            }}>
              <g transform="translate(256 256) rotate(-45)">
                {/* Barbell handle */}
                <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />
                
                {/* Left plates (steady/connected) */}
                <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
                <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
                <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
                
                {/* Right plates (steady/connected) */}
                <rect x="80" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
                <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
                <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
              </g>
            </svg>
          </div>
        </div>

        {/* Text Container (slides and fades in below the dumbbell as it lifts) */}
        {!hideText && (
          <div style={{
            height: 36,
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: `translateY(${shiftUp ? '-10px' : '0px'})`,
            transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
          }}>
            <div style={{
              opacity: showText ? 1 : 0,
              transform: `translateY(${showText ? '0px' : '15px'})`,
              transition: 'opacity 0.55s ease-out, transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              {randomPhrase}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
