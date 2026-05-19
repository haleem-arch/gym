import { motion } from 'framer-motion';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  colorClass: string; // e.g. "bg-blue-500"
  unit?: string;
}

export const MacroProgressBar = ({ label, current, target, colorClass, unit = 'g' }: MacroProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100)) || 0;
  const isOver = current > target;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-white">
          {Math.round(current)}<span className="text-gray-500 text-xs"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${isOver ? 'bg-danger' : colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
