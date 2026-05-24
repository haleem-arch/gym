import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';

export const DAY_TYPES = ['REST', 'RUN', 'PUSH', 'PULL', 'LEGS', 'RUN+GYM'] as const;
export type DayTypeKey = typeof DAY_TYPES[number];

export interface MacroTarget {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_DAY_NUTRITION: Record<DayTypeKey, MacroTarget> = {
  REST:      { kcal: 2100, protein: 155, carbs: 140, fat: 65 },
  RUN:       { kcal: 2600, protein: 155, carbs: 300, fat: 65 },
  PUSH:      { kcal: 2400, protein: 170, carbs: 230, fat: 70 },
  PULL:      { kcal: 2400, protein: 170, carbs: 230, fat: 70 },
  LEGS:      { kcal: 2500, protein: 170, carbs: 250, fat: 70 },
  'RUN+GYM': { kcal: 2800, protein: 180, carbs: 310, fat: 75 },
};

const DAY_META: Record<DayTypeKey, { icon: string; color: string; label: string }> = {
  REST:      { icon: '🛌', color: '#6b7280', label: 'Rest Day' },
  RUN:       { icon: '🏃', color: '#f59e0b', label: 'Run Day' },
  PUSH:      { icon: '💪', color: '#3b82f6', label: 'Push Day' },
  PULL:      { icon: '🔝', color: '#8b5cf6', label: 'Pull Day' },
  LEGS:      { icon: '🦵', color: '#ec4899', label: 'Legs Day' },
  'RUN+GYM': { icon: '⚡', color: '#10b981', label: 'Run + Gym' },
};

interface Props {
  open: boolean;
  onClose: () => void;
  currentDayType: string;
  dayNutrition: Record<string, MacroTarget>;
  onSave: (map: Record<string, MacroTarget>) => Promise<void>;
}

export const DietNutritionSettings = ({ open, onClose, currentDayType, dayNutrition, onSave }: Props) => {
  const [activeTab, setActiveTab] = useState<DayTypeKey>(() => {
    return DAY_TYPES.includes(currentDayType as DayTypeKey) ? (currentDayType as DayTypeKey) : 'REST';
  });
  const [draft, setDraft] = useState<Record<string, MacroTarget>>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Sync draft from prop when opening
  useEffect(() => {
    if (open) {
      const merged: Record<string, MacroTarget> = {};
      DAY_TYPES.forEach(dt => {
        merged[dt] = dayNutrition[dt] ? { ...dayNutrition[dt] } : { ...DEFAULT_DAY_NUTRITION[dt] };
      });
      setDraft(merged);
      if (DAY_TYPES.includes(currentDayType as DayTypeKey)) {
        setActiveTab(currentDayType as DayTypeKey);
      }
    }
  }, [open, dayNutrition, currentDayType]);

  const updateField = (field: keyof MacroTarget, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    setDraft(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: num }
    }));
  };

  const resetTab = () => {
    setDraft(prev => ({
      ...prev,
      [activeTab]: { ...DEFAULT_DAY_NUTRITION[activeTab] }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const active = draft[activeTab] || DEFAULT_DAY_NUTRITION[activeTab];
  const meta = DAY_META[activeTab];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-3xl border-t border-gray-800 max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Nutrition Targets</h2>
                <p className="text-xs text-gray-400 mt-0.5">Set calories & macros per training day</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>
            </div>

            {/* Day Type Tabs */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
              {DAY_TYPES.map(dt => {
                const m = DAY_META[dt];
                const isActive = dt === activeTab;
                return (
                  <button
                    key={dt}
                    onClick={() => setActiveTab(dt)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95"
                    style={{
                      background: isActive ? m.color + '22' : 'transparent',
                      border: `1.5px solid ${isActive ? m.color : '#374151'}`,
                    }}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: isActive ? m.color : '#9ca3af' }}
                    >
                      {dt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Day label + reset */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <span className="font-bold text-white">{meta.label}</span>
                      {currentDayType === activeTab && (
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: meta.color + '33', color: meta.color }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>
                    <button
                      onClick={resetTab}
                      className="text-xs text-gray-400 flex items-center gap-1 active:scale-90 transition-transform"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>

                  {/* Macro Inputs */}
                  <div className="flex flex-col gap-3">
                    {/* Calories — full width, prominent */}
                    <div
                      className="rounded-2xl p-4 border"
                      style={{ background: meta.color + '11', borderColor: meta.color + '44' }}
                    >
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                        🔥 Calories (kcal)
                      </label>
                      <input
                        type="number"
                        value={active.kcal}
                        onChange={e => updateField('kcal', e.target.value)}
                        className="w-full bg-transparent text-3xl font-black text-white outline-none border-none"
                        style={{ color: meta.color }}
                      />
                      <div className="h-1 rounded-full mt-3" style={{ background: meta.color + '33' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min((active.kcal / 4000) * 100, 100)}%`, background: meta.color }}
                        />
                      </div>
                    </div>

                    {/* Macros — 3 columns */}
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: 'protein' as const, label: 'Protein', emoji: '🥩', color: '#3b82f6' },
                        { key: 'carbs'   as const, label: 'Carbs',   emoji: '🍚', color: '#22c55e' },
                        { key: 'fat'     as const, label: 'Fat',     emoji: '🥑', color: '#eab308' },
                      ]).map(({ key, label, emoji, color }) => (
                        <div
                          key={key}
                          className="rounded-xl p-3 border border-gray-800 bg-[#1a1a1a] flex flex-col gap-1"
                        >
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{emoji} {label}</span>
                          <input
                            type="number"
                            value={active[key]}
                            onChange={e => updateField(key, e.target.value)}
                            className="w-full bg-transparent text-xl font-black outline-none border-none"
                            style={{ color }}
                          />
                          <span className="text-[10px] text-gray-600 font-semibold">grams</span>
                        </div>
                      ))}
                    </div>

                    {/* Macro ratio preview */}
                    <div className="bg-[#1a1a1a] rounded-xl p-3 border border-gray-800">
                      <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Calorie split preview</p>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${Math.round((active.protein * 4 / Math.max(active.kcal, 1)) * 100)}%`, background: '#3b82f6' }} />
                        <div style={{ width: `${Math.round((active.carbs * 4 / Math.max(active.kcal, 1)) * 100)}%`, background: '#22c55e' }} />
                        <div style={{ width: `${Math.round((active.fat * 9 / Math.max(active.kcal, 1)) * 100)}%`, background: '#eab308' }} />
                      </div>
                      <div className="flex gap-4 mt-2">
                        {[
                          { label: 'P', val: active.protein * 4, color: '#3b82f6' },
                          { label: 'C', val: active.carbs * 4, color: '#22c55e' },
                          { label: 'F', val: active.fat * 9, color: '#eab308' },
                        ].map(({ label, val, color }) => (
                          <span key={label} className="text-[10px] font-bold" style={{ color }}>
                            {label}: {Math.round((val / Math.max(active.kcal, 1)) * 100)}%
                          </span>
                        ))}
                        <span className="text-[10px] text-gray-500 ml-auto">
                          {Math.round(active.protein * 4 + active.carbs * 4 + active.fat * 9)} kcal from macros
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Save Button */}
            <div className="px-5 pb-8 pt-3 border-t border-gray-800 bg-[#111]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-white transition-all shadow-xl"
                style={{ background: savedFlash ? '#10b981' : '#3b82f6' }}
              >
                {saving ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : savedFlash ? (
                  <>✅ Saved!</>
                ) : (
                  <><Save size={18} /> Save All Targets</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
