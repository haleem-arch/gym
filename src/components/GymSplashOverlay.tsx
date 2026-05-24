import { useEffect, useState } from 'react';

interface GymSplashOverlayProps {
  show: boolean;
  onComplete?: () => void;
}

/**
 * GymSplashOverlay — Concept 1: The Plate Stacker (Heavy Industrial Physics)
 *
 * Timeline:
 *   0.00s  Dark overlay opens
 *   0.10s  Plate 1 (Red 25kg) drops          (Lands at 0.5s with slam & sparks)
 *   0.50s  Plate 2 (Blue 20kg) drops         (Lands at 0.9s with slam & sparks)
 *   0.90s  Plate 3 (Yellow 15kg) drops       (Lands at 1.3s with slam & sparks)
 *   1.30s  Barbell Collar Clamp drops         (Clamps shut at 1.65s with shockwave & neon)
 *   1.70s  Hydraulic clamp click, neon blue blast behind stack
 *   1.75s  Barbell stack shifts up & random motivator fades/slides up
 *   3.40s  Overlay fades to nothing           (0.4s)
 *   3.80s  onComplete() fires
 */
export function GymSplashOverlay({ show, onComplete }: GymSplashOverlayProps) {
  const [shiftUp, setShiftUp] = useState(false);
  const [showText, setShowText] = useState(false);
  const [randomPhrase, setRandomPhrase] = useState('');

  const PHRASES = [
    "WEIGHTS CRUSHED! 🏋️‍♂️",
    "PURE STRENGTH! 💪",
    "VOLUME LOADED! 📊",
    "SESSIONS SECURED! 🔒",
    "NO LIMITS! ⚡",
    "EARNED IN SWEAT! 👑",
    "ANOTHER DAY CONQUERED! 🏆",
    "RECORD CHASER! 📈",
    "REST & REBUILD! 🔋",
    "IRON MINDSET! 🌟"
  ];

  useEffect(() => {
    if (!show) {
      setShiftUp(false);
      setShowText(false);
      return;
    }

    // Pick random motivating gym phrase
    const randomIdx = Math.floor(Math.random() * PHRASES.length);
    setRandomPhrase(PHRASES[randomIdx]);

    // Lift the stack and show the text at 1.75s (after the collar clamps)
    const shiftTimer = setTimeout(() => {
      setShiftUp(true);
      setShowText(true);
    }, 1750);

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
    <div id="gym-splash-root" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#05050c',
      animation: 'gymSplashFadeOut 0.4s ease-in 3.4s forwards',
    }}>
      {/* Master CSS Animations */}
      <style>{`
        /* Master Camera Shake (Timed to the exact plate impacts at 0.5s, 0.9s, 1.3s, and 1.65s) */
        @keyframes masterCameraShake {
          0%, 12.5%, 22.5%, 32.5%, 41.5%, 50%, 100% { transform: scale(1) translate(0, 0); }
          /* Impact 1 (0.5s) */
          13% { transform: scale(1.02) translate(-4px, 3px) rotate(-0.5deg); }
          15% { transform: scale(1.01) translate(2px, -2px) rotate(0.3deg); }
          17% { transform: scale(1) translate(0, 0); }
          /* Impact 2 (0.9s) */
          23.5% { transform: scale(1.02) translate(4px, -3px) rotate(0.4deg); }
          25% { transform: scale(1.01) translate(-2px, 2px) rotate(-0.2deg); }
          27% { transform: scale(1) translate(0, 0); }
          /* Impact 3 (1.3s) */
          34% { transform: scale(1.03) translate(-5px, 4px) rotate(-0.6deg); }
          36% { transform: scale(1.01) translate(3px, -2px) rotate(0.3deg); }
          38% { transform: scale(1) translate(0, 0); }
          /* Collar Clamp Impact (1.65s) */
          43.5% { transform: scale(1.01) translate(0px, 3px); }
          45.5% { transform: scale(1.005) translate(0px, -1px); }
        }

        /* Plate 1 Drop Keyframes (Red, 25kg, lands at 0.5s) */
        @keyframes plateDrop1 {
          0% { transform: translateY(-750px) scaleY(1.3); }
          75% { transform: translateY(0) scaleY(1); }
          82% { transform: translateY(-16px) scaleY(0.92); }
          90% { transform: translateY(0) scaleY(1.05); }
          100% { transform: translateY(0) scaleY(1); }
        }

        /* Plate 2 Drop Keyframes (Blue, 20kg, lands at 0.9s) */
        @keyframes plateDrop2 {
          0% { transform: translateY(-750px) scaleY(1.3); }
          75% { transform: translateY(0) scaleY(1); }
          82% { transform: translateY(-14px) scaleY(0.93); }
          90% { transform: translateY(0) scaleY(1.04); }
          100% { transform: translateY(0) scaleY(1); }
        }

        /* Plate 3 Drop Keyframes (Yellow, 15kg, lands at 1.3s) */
        @keyframes plateDrop3 {
          0% { transform: translateY(-750px) scaleY(1.3); }
          75% { transform: translateY(0) scaleY(1); }
          82% { transform: translateY(-12px) scaleY(0.94); }
          90% { transform: translateY(0) scaleY(1.03); }
          100% { transform: translateY(0) scaleY(1); }
        }

        /* Barbell Collar Drop Keyframes (Silver, clamps at 1.65s) */
        @keyframes collarDrop {
          0% { transform: translateY(-750px) rotate(-15deg); }
          75% { transform: translateY(0) rotate(0deg); }
          88% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }

        /* Clamp handle locking animation */
        @keyframes clampCollar {
          to { transform: rotate(0deg); }
        }

        /* Expanding Shockwave Rings */
        @keyframes shockwaveRing {
          0% { transform: scale(0.6); opacity: 0.9; border-color: rgba(59,130,246,0.9); }
          100% { transform: scale(2.5); opacity: 0; border-color: rgba(59,130,246,0); filter: blur(5px); }
        }

        /* Sparks Particles Shooting Left and Right */
        @keyframes sparkLeft {
          0% { width: 0; opacity: 1; transform: rotate(-10deg) translateX(0); }
          100% { width: 50px; opacity: 0; transform: rotate(-10deg) translateX(-90px); }
        }
        @keyframes sparkRight {
          0% { width: 0; opacity: 1; transform: rotate(10deg) translateX(0); }
          100% { width: 50px; opacity: 0; transform: rotate(10deg) translateX(90px); }
        }

        /* Master fade-out animation for the entire overlay */
        @keyframes gymSplashFadeOut {
          to { opacity: 0; pointer-events: none; }
        }

        /* Neon blue blast pulse */
        @keyframes neonBlueBlast {
          0% { transform: scale(0.7); opacity: 0; }
          10% { transform: scale(1.1); opacity: 0.75; }
          100% { transform: scale(1); opacity: 0.35; }
        }
      `}</style>

      {/* ── Screen-Shake wrapper (contains everything inside) ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'masterCameraShake 3.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      }}>

        {/* ── Neon blue backdrop blast (fires as collar clamps at 1.65s) ── */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450, height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)',
          filter: 'blur(35px)',
          opacity: 0,
          animation: 'neonBlueBlast 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) 1.65s forwards',
          zIndex: 1,
        }} />

        {/* ── Vertical Sleeve + Plates Stack assembly ── */}
        <div style={{
          position: 'relative',
          width: 240,
          height: 350,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: `translateY(${shiftUp ? '-25px' : '0px'})`,
          transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 4,
        }}>

          {/* Barbell sleeve base */}
          <div style={{
            width: 220,
            height: 16,
            borderRadius: 4,
            backgroundColor: '#1b1b22',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            zIndex: 5,
          }} />

          {/* Steel sleeve rod */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            width: 24,
            height: 300,
            background: 'linear-gradient(90deg, #27272a 0%, #a1a1aa 50%, #27272a 100%)',
            borderRadius: '4px 4px 0 0',
            borderTop: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)',
            zIndex: 2,
          }} />

          {/* ── PLATE 1: Red (25 KG, lands at 0.5s, resting bottom: 16px) ── */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            width: 196,
            height: 32,
            zIndex: 6,
            animation: 'plateDrop1 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.1s forwards',
            transform: 'translateY(-750px)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundColor: '#dc2626', borderRadius: 6, border: '2px solid #b91c1c',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
            }}>
              <span>25 KG</span>
              {/* Center Hub */}
              <div style={{ width: 34, height: 28, backgroundColor: '#18181b', borderRadius: 4, border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #71717a', backgroundColor: 'transparent' }} />
              </div>
              <span>25 KG</span>
            </div>
          </div>

          {/* ── PLATE 2: Blue (20 KG, lands at 0.9s, resting bottom: 48px) ── */}
          <div style={{
            position: 'absolute',
            bottom: 48,
            width: 180,
            height: 28,
            zIndex: 7,
            animation: 'plateDrop2 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.5s forwards',
            transform: 'translateY(-750px)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundColor: '#2563eb', borderRadius: 5, border: '2px solid #1d4ed8',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6), 0 4px 6px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px', color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
            }}>
              <span>20 KG</span>
              <div style={{ width: 34, height: 24, backgroundColor: '#18181b', borderRadius: 3, border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #71717a', backgroundColor: 'transparent' }} />
              </div>
              <span>20 KG</span>
            </div>
          </div>

          {/* ── PLATE 3: Yellow (15 KG, lands at 1.3s, resting bottom: 76px) ── */}
          <div style={{
            position: 'absolute',
            bottom: 76,
            width: 164,
            height: 24,
            zIndex: 8,
            animation: 'plateDrop3 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.9s forwards',
            transform: 'translateY(-750px)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundColor: '#eab308', borderRadius: 5, border: '2px solid #ca8a04',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6), 0 4px 6px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px', color: 'rgba(0,0,0,0.85)',
              fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em',
            }}>
              <span>15 KG</span>
              <div style={{ width: 34, height: 20, backgroundColor: '#18181b', borderRadius: 3, border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #71717a', backgroundColor: 'transparent' }} />
              </div>
              <span>15 KG</span>
            </div>
          </div>

          {/* ── COLLAR: Silver clamp (clamps shut at 1.65s, resting bottom: 100px) ── */}
          <div style={{
            position: 'absolute',
            bottom: 100,
            width: 62,
            height: 20,
            zIndex: 9,
            animation: 'collarDrop 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.3s forwards',
            transform: 'translateY(-750px)',
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundColor: '#4b5563', borderRadius: 4, border: '1px solid #9ca3af',
              boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Locking lever */}
              <div style={{
                position: 'absolute', right: -10, top: -2,
                width: 14, height: 24,
                backgroundColor: '#1f2937', border: '1.5px solid #6b7280',
                borderRadius: '3px 6px 3px 3px',
                transform: 'rotate(25deg)', transformOrigin: 'left bottom',
                animation: 'clampCollar 0.15s ease-out 1.65s forwards',
              }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#111827' }} />
            </div>
          </div>

          {/* ── DYNAMIC IMPACT PARTICLES AND SHOCKWAVES ── */}
          
          {/* Shockwave Rings (Fired at 0.5s, 0.9s, 1.3s, 1.65s) */}
          <div style={{ position: 'absolute', bottom: 16, width: 220, height: 32, border: '2px solid transparent', borderRadius: '50%', animation: 'shockwaveRing 0.45s ease-out 0.5s forwards', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 48, width: 200, height: 28, border: '2px solid transparent', borderRadius: '50%', animation: 'shockwaveRing 0.45s ease-out 0.9s forwards', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 76, width: 180, height: 24, border: '2px solid transparent', borderRadius: '50%', animation: 'shockwaveRing 0.45s ease-out 1.3s forwards', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 100, width: 80, height: 20, border: '2px solid transparent', borderRadius: '50%', animation: 'shockwaveRing 0.45s ease-out 1.65s forwards', zIndex: 10 }} />

          {/* Sparks Group 1: Plate 1 lands (0.5s) */}
          <div style={{ position: 'absolute', bottom: 16, left: 10, height: 2, backgroundColor: '#fbbf24', animation: 'sparkLeft 0.35s ease-out 0.5s forwards', zIndex: 11 }} />
          <div style={{ position: 'absolute', bottom: 16, right: 10, height: 2, backgroundColor: '#fbbf24', animation: 'sparkRight 0.35s ease-out 0.5s forwards', zIndex: 11 }} />
          
          {/* Sparks Group 2: Plate 2 lands (0.9s) */}
          <div style={{ position: 'absolute', bottom: 48, left: 20, height: 2, backgroundColor: '#fbbf24', animation: 'sparkLeft 0.35s ease-out 0.9s forwards', zIndex: 11 }} />
          <div style={{ position: 'absolute', bottom: 48, right: 20, height: 2, backgroundColor: '#fbbf24', animation: 'sparkRight 0.35s ease-out 0.9s forwards', zIndex: 11 }} />
          
          {/* Sparks Group 3: Plate 3 lands (1.3s) */}
          <div style={{ position: 'absolute', bottom: 76, left: 30, height: 2, backgroundColor: '#fbbf24', animation: 'sparkLeft 0.35s ease-out 1.3s forwards', zIndex: 11 }} />
          <div style={{ position: 'absolute', bottom: 76, right: 30, height: 2, backgroundColor: '#fbbf24', animation: 'sparkRight 0.35s ease-out 1.3s forwards', zIndex: 11 }} />
        </div>

        {/* ── Motivational Text Frame (revealed and shifted as collar locks) ── */}
        <div style={{
          height: 36,
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transform: `translateY(${shiftUp ? '-10px' : '0px'})`,
          transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 5,
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
      </div>
    </div>
  );
}
