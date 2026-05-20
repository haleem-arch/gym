import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MacroPlateProps {
  totals: { protein: number; carbs: number; fat: number; kcal: number } | null;
  targets: { protein: number; carbs: number; fat: number } | null;
}

export const MacroPlate: React.FC<MacroPlateProps> = ({ totals, targets }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pTarget = targets?.protein || 160;
  const cTarget = targets?.carbs || 240;
  const fTarget = targets?.fat || 70;

  const pKcal = pTarget * 4;
  const cKcal = cTarget * 4;
  const fKcal = fTarget * 9;
  const totalTargetKcal = pKcal + cKcal + fKcal;

  const pPct = pKcal / totalTargetKcal;
  const cPct = cKcal / totalTargetKcal;
  const fPct = fKcal / totalTargetKcal;

  const r = 76;
  const C = 2 * Math.PI * r;
  
  // strokeWidth is 18. Round linecaps extend 9px on each side.
  // We need the visual gap to be clean, so we subtract extra length.
  const strokeW = 16;
  const gap = strokeW + 8; 

  const pLen = Math.max(0, (pPct * C) - gap);
  const cLen = Math.max(0, (cPct * C) - gap);
  const fLen = Math.max(0, (fPct * C) - gap);

  // Calculate rotations. The actual SVG stroke starts exactly where we tell it, 
  // but round caps push it back by strokeW/2 visually. We handle this inherently.
  // To distribute them properly, we calculate based on percentages.
  // But wait, the gap subtracts from the arc length, so the remaining empty space IS the gap!
  const pRot = -90;
  const cRot = pRot + (pPct * 360);
  const fRot = cRot + (cPct * 360);

  // Eaten amounts capped at 100% for the visual arc
  const pEaten = Math.min(totals?.protein || 0, pTarget) / pTarget;
  const cEaten = Math.min(totals?.carbs || 0, cTarget) / cTarget;
  const fEaten = Math.min(totals?.fat || 0, fTarget) / fTarget;

  const pFill = pEaten * pLen;
  const cFill = cEaten * cLen;
  const fFill = fEaten * fLen;

  const remainingKcal = Math.max(0, Math.round(totalTargetKcal - (totals?.kcal || 0)));

  return (
    <div className="relative flex justify-center items-center w-full max-w-[280px] mx-auto py-2">
      <svg viewBox="0 0 200 200" className="w-full h-auto drop-shadow-xl overflow-visible">
        <defs>
          {/* Subtle inner glow for the empty tracks */}
          <filter id="track-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
          </filter>
        </defs>

        {/* PROTEIN (Indigo) */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${pRot} 100 100)`} strokeDasharray={`${pLen} ${C}`} filter="url(#track-shadow)" />
        <motion.circle cx="100" cy="100" r={r} fill="none" stroke="#6366f1" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${pRot} 100 100)`}
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${mounted ? Math.max(0.1, pFill) : 0} ${C}` }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
        />

        {/* CARBS (Amber) */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${cRot} 100 100)`} strokeDasharray={`${cLen} ${C}`} filter="url(#track-shadow)" />
        <motion.circle cx="100" cy="100" r={r} fill="none" stroke="#f59e0b" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${cRot} 100 100)`}
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${mounted ? Math.max(0.1, cFill) : 0} ${C}` }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.2, delay: 0.1 }}
        />

        {/* FAT (Rose/Red) */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${fRot} 100 100)`} strokeDasharray={`${fLen} ${C}`} filter="url(#track-shadow)" />
        <motion.circle cx="100" cy="100" r={r} fill="none" stroke="#ef4444" strokeWidth={strokeW} strokeLinecap="round"
          transform={`rotate(${fRot} 100 100)`}
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${mounted ? Math.max(0.1, fFill) : 0} ${C}` }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.2, delay: 0.2 }}
        />
      </svg>

      {/* Inner Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Left</span>
        <span className="text-3xl font-black text-white -mt-1 tracking-tighter">
          {remainingKcal}
        </span>
        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">/ {Math.round(totalTargetKcal)} kcal</span>
      </div>
    </div>
  );
};
