import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashOverlayProps {
  /** Whether the splash is active */
  show: boolean;
  /** Called once the full animation finishes and overlay is gone */
  onComplete?: () => void;
}

/**
 * SplashOverlay
 *
 * Full-screen brand ribbon explosion that plays before revealing content.
 *
 * Timeline (ms):
 *   100  → Ribbon pass 1 starts sweeping (900ms)
 *   600  → Ribbon pass 2 starts exploding outward (1000ms)
 *   1450 → Solid blue fill snaps in
 *   1500 → Dumbbell piston logo pops in
 *   4800 → Everything fades out (500ms)
 *   5300 → onComplete() fires, component unmounts
 */
export function SplashOverlay({ show, onComplete }: SplashOverlayProps) {
  const [mounted, setMounted] = useState(show);

  useEffect(() => {
    if (show) {
      setMounted(true);
    }
  }, [show]);

  const handleAnimationEnd = () => {
    setMounted(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'transparent',
            animation: 'splashFadeOut 0.5s ease-in-out 4.8s forwards',
          }}
          onAnimationEnd={(e) => {
            // Only trigger on the fadeOut, not inner animations
            if ((e.target as HTMLElement).id === 'splash-root') {
              handleAnimationEnd();
            }
          }}
          id="splash-root"
        >
          <style>{`
            /* ── Ribbon pass 1: fast swoop ── */
            @keyframes swoopThrough {
              0%   { stroke-dashoffset: 3000; }
              100% { stroke-dashoffset: 0; }
            }

            /* ── Ribbon pass 2: explosive fill ── */
            @keyframes explosiveWave {
              0%   { stroke-dashoffset: 4000; stroke-width: 70; }
              65%  { stroke-width: 90; }
              85%  { stroke-width: 1500; }
              100% { stroke-dashoffset: 0; stroke-width: 4000; }
            }

            /* ── SVG canvas drifts slightly ── */
            @keyframes slightDrift {
              0%   { transform: scale(1) rotate(0deg); }
              100% { transform: scale(1.1) rotate(3deg); }
            }

            /* ── Solid blue snaps in ── */
            @keyframes lockSolidFill {
              to { opacity: 1; }
            }

            /* ── Logo bounces in ── */
            @keyframes popLogoIn {
              to { opacity: 1; transform: scale(1) translateY(0); }
            }

            /* ── Whole overlay fades out ── */
            @keyframes splashFadeOut {
              to { opacity: 0; visibility: hidden; pointer-events: none; }
            }

            /* ── Dumbbell plate animations (piston) ── */
            @keyframes slideLeftPlates {
              0%   { transform: translateX(-50px); }
              25%  { transform: translateX(0px);   }
              50%  { transform: translateX(-50px); }
              75%  { transform: translateX(0px);   }
              100% { transform: translateX(-50px); }
            }

            @keyframes slideRightPlates {
              0%   { transform: translateX(0px);  }
              25%  { transform: translateX(50px); }
              50%  { transform: translateX(0px);  }
              75%  { transform: translateX(50px); }
              100% { transform: translateX(0px);  }
            }

            /* ── Logo glow pulse ── */
            @keyframes pulseGlow {
              0%   { transform: scale(0.9); opacity: 0.2; }
              50%  { transform: scale(1.1); opacity: 0.45; }
              100% { transform: scale(0.9); opacity: 0.2; }
            }

            /* ── Glow ring that appears around the dark circle ── */
            @keyframes ringPulse {
              0%   { box-shadow: 0 0 0px 0px rgba(59,130,246,0.0); }
              50%  { box-shadow: 0 0 30px 12px rgba(59,130,246,0.35); }
              100% { box-shadow: 0 0 0px 0px rgba(59,130,246,0.0); }
            }
          `}</style>

          {/* ── SVG Ribbon canvas ── */}
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              transformOrigin: 'center',
              animation: 'slightDrift 2.5s ease-out forwards',
            }}
          >
            {/* Pass 1 — fast swoop */}
            <path
              fill="none"
              stroke="#3b82f6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="80"
              strokeDasharray="3000"
              strokeDashoffset="3000"
              d="M -200,200 Q 400,-200 1200,800"
              style={{ animation: 'swoopThrough 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s forwards' }}
            />
            {/* Pass 2 — explosive wave */}
            <path
              fill="none"
              stroke="#3b82f6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="70"
              strokeDasharray="4000"
              strokeDashoffset="4000"
              d="M -200,1200 C 300,1100 400,300 1200,-200"
              style={{ animation: 'explosiveWave 1.0s cubic-bezier(0.5,0,0.1,1) 0.6s forwards' }}
            />
          </svg>

          {/* ── Solid blue fill that locks in ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#3b82f6',
              opacity: 0,
              zIndex: 1,
              animation: 'lockSolidFill 0.1s linear 1.45s forwards',
            }}
          />

          {/* ── Logo: dark circle + dumbbell piston ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: 140,
              height: 140,
              opacity: 0,
              transform: 'scale(0.5) translateY(20px)',
              animation: 'popLogoIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 1.5s forwards',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Dark backdrop circle so blue plates are visible on blue bg */}
            <div
              style={{
                position: 'absolute',
                inset: -20,
                backgroundColor: '#0a0a0a',
                borderRadius: '50%',
                zIndex: 1,
                animation: 'ringPulse 1.6s ease-in-out 1.8s infinite',
              }}
            />

            {/* Blue glow layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(59,130,246,0.2)',
                filter: 'blur(20px)',
                animation: 'pulseGlow 1.6s ease-in-out 1.8s infinite',
                zIndex: 2,
              }}
            />

            {/* Dumbbell SVG with piston plates */}
            <svg
              viewBox="0 0 512 512"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 3,
                overflow: 'visible',
              }}
            >
              <g transform="translate(256 256) rotate(-45)">
                {/* Static bar */}
                <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />

                {/* Left plates — piston out */}
                <g style={{ animation: 'slideLeftPlates 1.6s ease-in-out 1.8s infinite' }}>
                  <rect x="-110" y="-60"  width="30" height="120" rx="8"  fill="#3b82f6" />
                  <rect x="-150" y="-80"  width="30" height="160" rx="10" fill="#3b82f6" />
                  <rect x="-170" y="-40"  width="10" height="80"  rx="4"  fill="#60a5fa" />
                </g>

                {/* Right plates — piston out (opposite phase) */}
                <g style={{ animation: 'slideRightPlates 1.6s ease-in-out 1.8s infinite' }}>
                  <rect x="80"  y="-60" width="30" height="120" rx="8"  fill="#3b82f6" />
                  <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
                  <rect x="160" y="-40" width="10" height="80"  rx="4"  fill="#60a5fa" />
                </g>
              </g>
            </svg>
          </div>

          {/* Invisible timer: remove from DOM at 5.3s */}
          <RemoveTimer onDone={handleAnimationEnd} delay={5300} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Tiny helper that fires a callback after `delay` ms */
function RemoveTimer({ onDone, delay }: { onDone: () => void; delay: number }) {
  useEffect(() => {
    const t = setTimeout(onDone, delay);
    return () => clearTimeout(t);
  }, []);
  return null;
}
