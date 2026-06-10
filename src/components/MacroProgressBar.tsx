import { motion } from 'framer-motion';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  colorClass: string; // e.g. "bg-gradient-to-r from-blue-500 to-cyan-500"
  unit?: string;
}

export const MacroProgressBar = ({ label, current, target, colorClass, unit = 'g' }: MacroProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100)) || 0;
  const isOver = current > target;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-end select-none">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-black text-white">
          {Math.round(current)}<span className="text-zinc-500 text-[10px] font-normal"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-1 w-full bg-zinc-900/60 rounded-full overflow-hidden border border-zinc-900/30">
        <motion.div 
          className={`h-full rounded-full ${isOver ? 'bg-gradient-to-r from-red-600 to-rose-500' : colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};
