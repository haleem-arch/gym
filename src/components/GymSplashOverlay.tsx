import { useEffect, useState, useRef } from 'react';

interface GymSplashOverlayProps {
  show: boolean;
  onComplete?: () => void;
  workoutName?: string;
}

/**
 * GymSplashOverlay — Concept 2: CNS Pulse & Overload (Sci-Fi Blueprint)
 *
 * Timeline:
 *   0.00s  Dark sci-fi grid appears
 *   0.30s  Human body outline fades in (blueprint style)
 *   0.60s  CNS spine line draws in top→bottom
 *   1.00s  EKG heartbeat starts pulsing (2 normal beats)
 *   2.40s  Heart rate spikes wildly (overload phase)
 *   3.00s  Flatline — dead silence for 0.3s
 *   3.30s  DETONATION — bright shockwave sphere expands outward
 *   3.60s  Shockwave clears → muscle blueprint glows in (split-specific)
 *   4.20s  Motivational text fades in
 *   5.00s  Overlay fades out
 *   5.40s  onComplete() fires
 */

// Muscle group mapping by workout split
const MUSCLE_MAP: Record<string, { groups: string[]; color: string; label: string }> = {
  push: {
    groups: ['chest', 'front-delt', 'tricep'],
    color: '#00e5ff',
    label: 'CHEST · SHOULDERS · TRICEPS',
  },
  pull: {
    groups: ['back', 'rear-delt', 'bicep'],
    color: '#00e5ff',
    label: 'BACK · REAR DELTS · BICEPS',
  },
  legs: {
    groups: ['quad', 'hamstring', 'glute', 'calf'],
    color: '#00e5ff',
    label: 'QUADS · HAMSTRINGS · GLUTES',
  },
  upper: {
    groups: ['chest', 'back', 'front-delt', 'bicep', 'tricep'],
    color: '#00e5ff',
    label: 'UPPER BODY',
  },
  lower: {
    groups: ['quad', 'hamstring', 'glute', 'calf'],
    color: '#00e5ff',
    label: 'LOWER BODY',
  },
  full: {
    groups: ['chest', 'back', 'quad', 'hamstring', 'front-delt', 'bicep', 'tricep'],
    color: '#00e5ff',
    label: 'FULL BODY',
  },
};

function getMuscleData(workoutName: string) {
  const lower = (workoutName || '').toLowerCase();
  if (lower.includes('push')) return MUSCLE_MAP.push;
  if (lower.includes('pull')) return MUSCLE_MAP.pull;
  if (lower.includes('leg')) return MUSCLE_MAP.legs;
  if (lower.includes('upper')) return MUSCLE_MAP.upper;
  if (lower.includes('lower')) return MUSCLE_MAP.lower;
  // Default full body
  return MUSCLE_MAP.full;
}

// Draws the EKG path for a given "mode": normal | spike | flatline
function buildEkgPath(mode: 'normal' | 'spike' | 'flatline', width: number, cy: number): string {
  if (mode === 'flatline') {
    return `M 0,${cy} L ${width},${cy}`;
  }
  if (mode === 'normal') {
    const w = width;
    // Two heartbeat peaks spread across width
    return [
      `M 0,${cy}`,
      `L ${w * 0.12},${cy}`,
      `L ${w * 0.17},${cy - 18}`,
      `L ${w * 0.22},${cy + 10}`,
      `L ${w * 0.27},${cy - 38}`,
      `L ${w * 0.32},${cy + 15}`,
      `L ${w * 0.37},${cy}`,
      `L ${w * 0.57},${cy}`,
      `L ${w * 0.62},${cy - 18}`,
      `L ${w * 0.67},${cy + 10}`,
      `L ${w * 0.72},${cy - 38}`,
      `L ${w * 0.77},${cy + 15}`,
      `L ${w * 0.82},${cy}`,
      `L ${w},${cy}`,
    ].join(' ');
  }
  // spike — wild multi-peak
  const w = width;
  return [
    `M 0,${cy}`,
    `L ${w * 0.05},${cy}`,
    `L ${w * 0.09},${cy - 14}`,
    `L ${w * 0.13},${cy + 8}`,
    `L ${w * 0.17},${cy - 52}`,
    `L ${w * 0.21},${cy + 22}`,
    `L ${w * 0.25},${cy - 30}`,
    `L ${w * 0.29},${cy + 10}`,
    `L ${w * 0.33},${cy}`,
    `L ${w * 0.38},${cy - 10}`,
    `L ${w * 0.43},${cy + 6}`,
    `L ${w * 0.47},${cy - 62}`,
    `L ${w * 0.51},${cy + 28}`,
    `L ${w * 0.55},${cy - 45}`,
    `L ${w * 0.59},${cy + 18}`,
    `L ${w * 0.63},${cy - 22}`,
    `L ${w * 0.67},${cy + 8}`,
    `L ${w * 0.71},${cy}`,
    `L ${w * 0.76},${cy - 8}`,
    `L ${w * 0.80},${cy + 5}`,
    `L ${w * 0.84},${cy - 70}`,
    `L ${w * 0.88},${cy + 30}`,
    `L ${w * 0.92},${cy}`,
    `L ${w},${cy}`,
  ].join(' ');
}

export function GymSplashOverlay({ show, onComplete, workoutName = '' }: GymSplashOverlayProps) {
  // Animation phase state
  const [phase, setPhase] = useState<'idle' | 'blueprint' | 'ekg' | 'spike' | 'flatline' | 'shockwave' | 'muscles' | 'text'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const muscleData = getMuscleData(workoutName);

  useEffect(() => {
    if (!show) {
      setPhase('idle');
      timers.current.forEach(clearTimeout);
      timers.current = [];
      return;
    }

    const add = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timers.current.push(t);
    };

    add(() => setPhase('blueprint'), 200);
    add(() => setPhase('ekg'),       700);
    add(() => setPhase('spike'),     2200);
    add(() => setPhase('flatline'),  3050);
    add(() => setPhase('shockwave'), 3380);
    add(() => setPhase('muscles'),   3700);
    add(() => setPhase('text'),      4300);
    add(() => onComplete?.(),        5600);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [show]);

  if (!show) return null;

  const ekgMode =
    phase === 'spike' ? 'spike'
    : phase === 'flatline' ? 'flatline'
    : 'normal';

  const showEkg     = ['ekg','spike','flatline'].includes(phase);
  const showShock   = phase === 'shockwave';
  const showMuscles = ['muscles','text'].includes(phase);
  const showText    = phase === 'text';

  const VW = 390; // design viewport width
  const ekgCY = 60;

  return (
    <div
      id="gym-splash-root"
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        overflow: 'hidden',
        backgroundColor: '#030308',
        animation: 'cnsFadeOut 0.5s ease-in 5.0s forwards',
      }}
    >
      <style>{`
        /* ── Grid background ── */
        @keyframes gridAppear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        /* ── Blueprint body outline ── */
        @keyframes bodyFadeIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        /* ── CNS spine draw-in ── */
        @keyframes spineDrawIn {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        /* ── EKG line draw-in ── */
        @keyframes ekgDraw {
          from { stroke-dashoffset: 1400; }
          to   { stroke-dashoffset: 0; }
        }
        /* ── EKG pulse glow ── */
        @keyframes ekgGlow {
          0%,100% { filter: drop-shadow(0 0 3px #00e5ff88); }
          50%      { filter: drop-shadow(0 0 12px #00e5ffee) drop-shadow(0 0 24px #00e5ff55); }
        }
        /* ── Flatline ping dot ── */
        @keyframes flatlinePing {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(6);   opacity: 0; }
        }
        /* ── Shockwave rings ── */
        @keyframes shockRing1 {
          0%   { transform: translate(-50%,-50%) scale(0);   opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
        }
        @keyframes shockRing2 {
          0%   { transform: translate(-50%,-50%) scale(0);   opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(5);   opacity: 0; }
        }
        @keyframes shockRing3 {
          0%   { transform: translate(-50%,-50%) scale(0);   opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(7);   opacity: 0; }
        }
        /* ── White flash on detonation ── */
        @keyframes whiteFlash {
          0%   { opacity: 0.95; }
          100% { opacity: 0; }
        }
        /* ── Muscle glow pulse ── */
        @keyframes muscleGlow {
          0%,100% { opacity: 0.55; }
          50%     { opacity: 1; }
        }
        /* ── Blueprint reveal ── */
        @keyframes blueprintReveal {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        /* ── Text slide up ── */
        @keyframes textSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* ── Scanline sweep ── */
        @keyframes scanline {
          0%   { top: -5%; }
          100% { top: 105%; }
        }
        /* ── CNS spine pulse ── */
        @keyframes spinePulse {
          0%,100% { stroke: #00e5ff88; stroke-width: 2; }
          50%     { stroke: #00e5ffff; stroke-width: 3.5; filter: drop-shadow(0 0 8px #00e5ff); }
        }
        /* ── Overlay fade out ── */
        @keyframes cnsFadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        /* ── Grid dot pulse ── */
        @keyframes dotPulse {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.22; }
        }
      `}</style>

      {/* ── 1. Animated dot grid ── */}
      <svg
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          animation: 'gridAppear 0.4s ease-out forwards',
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="cns-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="1" fill="#00e5ff" opacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cns-grid)" />
        {/* Horizontal scan line */}
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#00e5ff" strokeWidth="0.5" opacity="0.08"
          style={{ animation: 'scanline 4s linear 0.5s infinite' }} />
      </svg>

      {/* ── Corner HUD brackets ── */}
      {[
        { top: 16, left: 16, rotate: 0 },
        { top: 16, right: 16, rotate: 90 },
        { bottom: 16, left: 16, rotate: 270 },
        { bottom: 16, right: 16, rotate: 180 },
      ].map((pos, i) => (
        <svg key={i} width="32" height="32" style={{ position: 'absolute', ...pos as any, opacity: 0.4 }}>
          <polyline
            points="0,28 0,0 28,0"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
            transform={`rotate(${(pos as any).rotate}, 16, 16)`}
          />
        </svg>
      ))}

      {/* ── HUD labels ── */}
      <div style={{
        position: 'absolute', top: 22, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        fontFamily: "'Courier New', monospace", fontSize: 9,
        letterSpacing: '0.3em', color: '#00e5ff66',
        textTransform: 'uppercase',
      }}>
        CNS ANALYSIS · ACTIVE
      </div>
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        fontFamily: "'Courier New', monospace", fontSize: 9,
        letterSpacing: '0.3em', color: '#00e5ff44',
      }}>
        NEURAL LOAD COMPLETE
      </div>

      {/* ── STAGE 1 + 2: Blueprint body + CNS spine + EKG ── */}
      {(phase !== 'idle') && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 0,
        }}>

          {/* EKG strip — shown above body */}
          <div style={{
            width: VW * 0.82,
            height: 130,
            position: 'relative',
            marginBottom: -10,
            opacity: showEkg ? 1 : 0,
            transition: 'opacity 0.3s ease-out',
          }}>
            <svg
              width="100%" height="130"
              viewBox={`0 0 ${VW * 0.82} 130`}
              style={{
                overflow: 'visible',
                animation: showEkg ? 'ekgGlow 0.85s ease-in-out infinite' : 'none',
              }}
            >
              {/* EKG baseline glow track */}
              <line
                x1="0" y1={ekgCY} x2={VW * 0.82} y2={ekgCY}
                stroke="#00e5ff" strokeWidth="0.5" opacity="0.18"
              />

              {/* EKG signal path */}
              <path
                key={ekgMode}
                d={buildEkgPath(ekgMode, VW * 0.82, ekgCY)}
                fill="none"
                stroke={ekgMode === 'flatline' ? '#ff4444' : '#00e5ff'}
                strokeWidth={ekgMode === 'spike' ? 2.5 : ekgMode === 'flatline' ? 2 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1400"
                strokeDashoffset="0"
                style={{
                  animation: `ekgDraw ${ekgMode === 'spike' ? '0.4s' : '0.7s'} cubic-bezier(0.4,0,0.2,1) forwards`,
                  filter: ekgMode === 'flatline'
                    ? 'drop-shadow(0 0 8px #ff4444)'
                    : 'drop-shadow(0 0 6px #00e5ff)',
                }}
              />

              {/* BPM label */}
              <text
                x={VW * 0.82 - 4} y={ekgCY - 12}
                textAnchor="end"
                fill={ekgMode === 'spike' ? '#ff6644' : ekgMode === 'flatline' ? '#ff2222' : '#00e5ff'}
                fontSize="11"
                fontFamily="'Courier New', monospace"
                fontWeight="bold"
                style={{ transition: 'fill 0.2s' }}
              >
                {ekgMode === 'flatline' ? '---' : ekgMode === 'spike' ? '212 BPM' : '68 BPM'}
              </text>
              <text
                x={4} y={ekgCY - 12}
                fill="#00e5ff55"
                fontSize="9"
                fontFamily="'Courier New', monospace"
              >
                CARDIAC
              </text>

              {/* Flatline detonation ping dot */}
              {phase === 'flatline' && (
                <circle
                  cx={VW * 0.82 / 2} cy={ekgCY} r="5"
                  fill="none" stroke="#ff2222" strokeWidth="2"
                  style={{ animation: 'flatlinePing 0.5s ease-out forwards' }}
                />
              )}
            </svg>
          </div>

          {/* ── Human body blueprint SVG ── */}
          <div style={{
            position: 'relative',
            animation: phase === 'blueprint' || phase === 'ekg' || phase === 'spike' || phase === 'flatline'
              ? 'bodyFadeIn 0.5s ease-out forwards'
              : undefined,
            opacity: showMuscles ? 0 : 1,
            transition: showMuscles ? 'opacity 0.25s ease-in' : undefined,
          }}>
            <svg
              viewBox="0 0 200 340"
              width="160"
              height="272"
              style={{ overflow: 'visible' }}
            >
              {/* Glow filter */}
              <defs>
                <filter id="bodyGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="cnsGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* ─ Body outline (blueprint) ─ */}
              <g filter="url(#bodyGlow)" stroke="#00e5ff" strokeWidth="1.2" fill="none" opacity="0.45">
                {/* Head */}
                <ellipse cx="100" cy="28" rx="22" ry="26" />
                {/* Neck */}
                <line x1="88" y1="52" x2="84" y2="68" />
                <line x1="112" y1="52" x2="116" y2="68" />
                {/* Torso */}
                <path d="M 84,68 Q 68,72 65,90 L 62,155 Q 68,165 100,165 Q 132,165 138,155 L 135,90 Q 132,72 116,68 Z" />
                {/* Shoulder ridge */}
                <path d="M 84,70 Q 72,66 58,76" />
                <path d="M 116,70 Q 128,66 142,76" />
                {/* Collarbone */}
                <line x1="84" y1="72" x2="116" y2="72" />
                {/* Left arm */}
                <path d="M 58,76 Q 48,95 46,120 L 44,150 Q 43,162 48,165" />
                {/* Right arm */}
                <path d="M 142,76 Q 152,95 154,120 L 156,150 Q 157,162 152,165" />
                {/* Left forearm */}
                <path d="M 48,165 Q 46,185 45,210 L 44,230" />
                {/* Right forearm */}
                <path d="M 152,165 Q 154,185 155,210 L 156,230" />
                {/* Left hand */}
                <ellipse cx="43" cy="237" rx="7" ry="9" />
                {/* Right hand */}
                <ellipse cx="157" cy="237" rx="7" ry="9" />
                {/* Hip */}
                <path d="M 62,155 Q 60,172 62,185 L 68,200 Q 75,210 100,210 Q 125,210 132,200 L 138,185 Q 140,172 138,155" />
                {/* Left leg */}
                <path d="M 68,200 Q 65,225 64,255 L 63,285" />
                {/* Right leg */}
                <path d="M 132,200 Q 135,225 136,255 L 137,285" />
                {/* Left calf */}
                <path d="M 63,285 Q 62,305 63,325" />
                {/* Right calf */}
                <path d="M 137,285 Q 138,305 137,325" />
                {/* Left foot */}
                <path d="M 63,325 Q 58,334 55,336 L 70,336" />
                {/* Right foot */}
                <path d="M 137,325 Q 142,334 145,336 L 130,336" />
              </g>

              {/* ─ CNS Spine line ─ */}
              {(true) && (
                <path
                  d="M 100,54 L 100,68 Q 100,100 100,120 Q 100,140 100,160 Q 100,180 100,200"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  style={{
                    animation: 'spineDrawIn 0.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards',
                    filter: 'drop-shadow(0 0 5px #00e5ff)',
                  }}
                />
              )}

              {/* ─ CNS pulse dots along spine ─ */}
              {['ekg','spike'].includes(phase) && [68, 90, 110, 130, 150, 175, 198].map((y, i) => (
                <circle key={i} cx="100" cy={y} r="2.5"
                  fill="#00e5ff"
                  style={{
                    animation: `spinePulse 0.85s ease-in-out ${i * 0.1}s infinite`,
                    filter: 'drop-shadow(0 0 4px #00e5ff)',
                  }}
                />
              ))}

              {/* ─ Overload sparks on spine (spike phase) ─ */}
              {phase === 'spike' && [80, 105, 130, 158, 185].map((y, i) => (
                <g key={i} transform={`translate(100,${y})`}>
                  <line x1="-12" y1="0" x2="-6" y2="-4" stroke="#ff6600" strokeWidth="1.5" opacity="0.8"
                    style={{ animation: `ekgDraw 0.2s ${i * 0.07}s infinite` }} />
                  <line x1="12" y1="0" x2="6" y2="4" stroke="#ff6600" strokeWidth="1.5" opacity="0.8"
                    style={{ animation: `ekgDraw 0.2s ${i * 0.07 + 0.1}s infinite` }} />
                  <circle cx="0" cy="0" r="3" fill="#ff4400" opacity="0.7"
                    style={{ animation: `flatlinePing 0.3s ${i * 0.07}s infinite` }} />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* ── STAGE 3A: Shockwave detonation ── */}
      {showShock && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* White flash */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#ffffff',
            animation: 'whiteFlash 0.4s ease-out forwards',
          }} />
          {/* Ring 1 — tight, fast */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 80, height: 80,
            borderRadius: '50%',
            border: '3px solid #00e5ff',
            boxShadow: '0 0 30px #00e5ff, inset 0 0 20px #00e5ff44',
            animation: 'shockRing1 0.7s cubic-bezier(0.1,0.9,0.3,1) forwards',
          }} />
          {/* Ring 2 — wider */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 80, height: 80,
            borderRadius: '50%',
            border: '2px solid #00e5ffaa',
            animation: 'shockRing2 0.9s cubic-bezier(0.1,0.9,0.3,1) 0.05s forwards',
          }} />
          {/* Ring 3 — largest */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 80, height: 80,
            borderRadius: '50%',
            border: '1.5px solid #00e5ff55',
            animation: 'shockRing3 1.1s cubic-bezier(0.1,0.9,0.3,1) 0.1s forwards',
          }} />
          {/* Center core burst */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, #00e5ff 40%, transparent 70%)',
            filter: 'blur(4px)',
            animation: 'whiteFlash 0.5s ease-out forwards',
          }} />
        </div>
      )}

      {/* ── STAGE 3B: Muscle blueprint reveal ── */}
      {showMuscles && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'blueprintReveal 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 280, height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${muscleData.color}33 0%, transparent 65%)`,
            filter: 'blur(30px)',
            animation: 'muscleGlow 1.5s ease-in-out infinite',
          }} />

          {/* Muscle blueprint body — highlighted split */}
          <svg viewBox="0 0 200 340" width="170" height="289" style={{ overflow: 'visible', position: 'relative' }}>
            <defs>
              <filter id="muscleGlowFilter">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="dimGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Dim body outline */}
            <g stroke="#00e5ff22" strokeWidth="1" fill="none">
              <ellipse cx="100" cy="28" rx="22" ry="26" />
              <line x1="88" y1="52" x2="84" y2="68" />
              <line x1="112" y1="52" x2="116" y2="68" />
              <path d="M 84,68 Q 68,72 65,90 L 62,155 Q 68,165 100,165 Q 132,165 138,155 L 135,90 Q 132,72 116,68 Z" />
              <path d="M 58,76 Q 48,95 46,120 L 44,150 Q 43,162 48,165" />
              <path d="M 142,76 Q 152,95 154,120 L 156,150 Q 157,162 152,165" />
              <path d="M 48,165 Q 46,185 45,210 L 44,230" />
              <path d="M 152,165 Q 154,185 155,210 L 156,230" />
              <ellipse cx="43" cy="237" rx="7" ry="9" />
              <ellipse cx="157" cy="237" rx="7" ry="9" />
              <path d="M 62,155 Q 60,172 62,185 L 68,200 Q 75,210 100,210 Q 125,210 132,200 L 138,185 Q 140,172 138,155" />
              <path d="M 68,200 Q 65,225 64,255 L 63,285" />
              <path d="M 132,200 Q 135,225 136,255 L 137,285" />
              <path d="M 63,285 Q 62,305 63,325" />
              <path d="M 137,285 Q 138,305 137,325" />
              <path d="M 63,325 Q 58,334 55,336 L 70,336" />
              <path d="M 137,325 Q 142,334 145,336 L 130,336" />
            </g>

            {/* ─ HIGHLIGHTED MUSCLES — filled glowing regions ─ */}

            {/* CHEST */}
            {muscleData.groups.includes('chest') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.1s infinite' }}>
                <path d="M 87,74 Q 80,78 76,92 L 75,112 Q 85,118 100,116 Q 115,118 125,112 L 124,92 Q 120,78 113,74 Z"
                  fill={`${muscleData.color}55`} stroke={muscleData.color} strokeWidth="1.5" />
              </g>
            )}

            {/* FRONT DELTS / SHOULDERS */}
            {muscleData.groups.includes('front-delt') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.2s infinite' }}>
                <ellipse cx="60" cy="82" rx="14" ry="10" fill={`${muscleData.color}55`} stroke={muscleData.color} strokeWidth="1.5" />
                <ellipse cx="140" cy="82" rx="14" ry="10" fill={`${muscleData.color}55`} stroke={muscleData.color} strokeWidth="1.5" />
              </g>
            )}

            {/* TRICEPS */}
            {muscleData.groups.includes('tricep') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.3s infinite' }}>
                <path d="M 47,95 Q 43,110 43,130 Q 43,145 46,155" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
                <path d="M 153,95 Q 157,110 157,130 Q 157,145 154,155" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
              </g>
            )}

            {/* BICEPS */}
            {muscleData.groups.includes('bicep') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.35s infinite' }}>
                <path d="M 54,93 Q 50,108 50,122" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
                <path d="M 146,93 Q 150,108 150,122" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
              </g>
            )}

            {/* BACK (shown as glowing lats behind torso) */}
            {muscleData.groups.includes('back') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.15s infinite' }}>
                <path d="M 68,75 Q 62,90 63,115 L 67,140 Q 75,148 84,150 L 84,80 Z"
                  fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.5" opacity="0.8" />
                <path d="M 132,75 Q 138,90 137,115 L 133,140 Q 125,148 116,150 L 116,80 Z"
                  fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.5" opacity="0.8" />
              </g>
            )}

            {/* REAR DELTS */}
            {muscleData.groups.includes('rear-delt') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.25s infinite' }}>
                <ellipse cx="58" cy="78" rx="11" ry="8" fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.2" />
                <ellipse cx="142" cy="78" rx="11" ry="8" fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.2" />
              </g>
            )}

            {/* QUADS */}
            {muscleData.groups.includes('quad') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.1s infinite' }}>
                <path d="M 70,205 Q 66,230 65,255 L 64,280 Q 70,282 76,278 L 78,255 Q 79,230 80,205 Z"
                  fill={`${muscleData.color}55`} stroke={muscleData.color} strokeWidth="1.5" />
                <path d="M 130,205 Q 134,230 135,255 L 136,280 Q 130,282 124,278 L 122,255 Q 121,230 120,205 Z"
                  fill={`${muscleData.color}55`} stroke={muscleData.color} strokeWidth="1.5" />
              </g>
            )}

            {/* HAMSTRINGS */}
            {muscleData.groups.includes('hamstring') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.2s infinite' }}>
                <path d="M 80,208 Q 82,232 82,255 Q 82,270 81,282" stroke={muscleData.color} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
                <path d="M 120,208 Q 118,232 118,255 Q 118,270 119,282" stroke={muscleData.color} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
              </g>
            )}

            {/* GLUTES */}
            {muscleData.groups.includes('glute') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.05s infinite' }}>
                <ellipse cx="78" cy="195" rx="16" ry="14" fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.5" />
                <ellipse cx="122" cy="195" rx="16" ry="14" fill={`${muscleData.color}44`} stroke={muscleData.color} strokeWidth="1.5" />
              </g>
            )}

            {/* CALVES */}
            {muscleData.groups.includes('calf') && (
              <g filter="url(#muscleGlowFilter)" style={{ animation: 'muscleGlow 1.2s ease-in-out 0.4s infinite' }}>
                <path d="M 63,288 Q 61,305 63,322" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
                <path d="M 137,288 Q 139,305 137,322" stroke={muscleData.color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
              </g>
            )}

            {/* CNS spine — always shown in muscle view */}
            <path
              d="M 100,54 L 100,68 Q 100,100 100,120 Q 100,140 100,160 Q 100,180 100,200"
              fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px #00e5ff)' }}
            />
            {[68, 90, 110, 130, 150, 175, 198].map((y, i) => (
              <circle key={i} cx="100" cy={y} r="2.2" fill="#00e5ff"
                style={{ animation: `spinePulse 0.85s ease-in-out ${i * 0.1}s infinite`, filter: 'drop-shadow(0 0 4px #00e5ff)' }}
              />
            ))}
          </svg>

          {/* Split label */}
          <div style={{
            marginTop: 14,
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: muscleData.color,
            textTransform: 'uppercase',
            opacity: 0.8,
            textAlign: 'center',
            textShadow: `0 0 12px ${muscleData.color}`,
          }}>
            {muscleData.label}
          </div>
        </div>
      )}

      {/* ── STAGE 4: Motivational text ── */}
      {showText && (
        <div style={{
          position: 'absolute',
          bottom: 90,
          left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4,
          animation: 'textSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.18em',
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: '0 0 20px #00e5ff, 0 0 40px #00e5ff55',
          }}>
            OVERLOAD LOGGED
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.3em',
            color: '#00e5ff99',
          }}>
            CNS RECOVERY INITIATED
          </div>
        </div>
      )}
    </div>
  );
}
