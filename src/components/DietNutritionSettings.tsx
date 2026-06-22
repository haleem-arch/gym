import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Flame, Pencil } from 'lucide-react';

export const FIXED_DAY_TYPES = ['REST', 'RUN', 'RUN+GYM'] as const;
export const DAY_TYPES = ['REST', 'RUN', 'PUSH', 'PULL', 'LEGS', 'RUN+GYM'] as const;
export type DayTypeKey = typeof DAY_TYPES[number];

export interface MacroTarget {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_DAY_NUTRITION: Record<string, MacroTarget> = {
  REST:      { kcal: 2100, protein: 155, carbs: 140, fat: 65 },
  RUN:       { kcal: 2600, protein: 155, carbs: 300, fat: 65 },
  PUSH:      { kcal: 2400, protein: 170, carbs: 230, fat: 70 },
  PULL:      { kcal: 2400, protein: 170, carbs: 230, font: 70 } as any as MacroTarget, // standard fallback
  LEGS:      { kcal: 2500, protein: 170, carbs: 250, fat: 70 },
  'RUN+GYM': { kcal: 2800, protein: 180, carbs: 310, fat: 75 },
};

// Map keys to cleaner names and standard icons
const DAY_META: Record<string, { label: string; icon: string }> = {
  REST:      { label: 'Rest Day', icon: '🛌' },
  RUN:       { label: 'Run Day', icon: '🏃' },
  PUSH:      { label: 'Push Day', icon: '💪' },
  PULL:      { label: 'Pull Day', icon: '⚡' },
  LEGS:      { label: 'Legs Day', icon: '🦵' },
  'RUN+GYM': { label: 'Run + Gym', icon: '🔥' },
};

const getDefaultTarget = (dt: string): MacroTarget =>
  DEFAULT_DAY_NUTRITION[dt] ?? { kcal: 2400, protein: 170, carbs: 230, fat: 70 };

interface Props {
  open: boolean;
  onClose: () => void;
  currentDayType: string;
  allDayTypes: string[];
  dayNutrition: Record<string, MacroTarget>;
  onSave: (map: Record<string, MacroTarget>, waterGoalMl?: number) => Promise<void>;
  waterGoalMl: number;
}

export const DietNutritionSettings = ({ open, onClose, currentDayType, allDayTypes, dayNutrition, onSave, waterGoalMl }: Props) => {
  const [activeTab, setActiveTab] = useState<string>(currentDayType || 'REST');
  const [draft, setDraft] = useState<Record<string, MacroTarget>>({});
  const [waterGoal, setWaterGoal] = useState<number>(waterGoalMl || 3500);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (open && allDayTypes.length > 0) {
      const merged: Record<string, MacroTarget> = {};
      allDayTypes.forEach(dt => {
        merged[dt] = dayNutrition[dt] ? { ...dayNutrition[dt] } : getDefaultTarget(dt);
      });
      setDraft(merged);
      setActiveTab(allDayTypes.includes(currentDayType) ? currentDayType : allDayTypes[0]);
    }
  }, [open, dayNutrition, currentDayType, allDayTypes]);

  useEffect(() => {
    if (open) {
      setWaterGoal(waterGoalMl || 3500);
    }
  }, [open, waterGoalMl]);

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
      [activeTab]: getDefaultTarget(activeTab)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft, waterGoal);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const active = draft[activeTab] ?? getDefaultTarget(activeTab);
  const portalRoot = document.getElementById('modal-portal');

  const activeLabel = DAY_META[activeTab]?.label || activeTab;

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Full-screen overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${portalRoot ? 'absolute' : 'fixed'} inset-0 bg-black/90 backdrop-blur-xl z-[60] pointer-events-auto`}
            onClick={onClose}
          />

          {/* Full-screen sheet — slides up and fills entire container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={`${portalRoot ? 'absolute' : 'fixed'} inset-0 z-[70] bg-[#0a0d1e] flex flex-col overflow-hidden pointer-events-auto`}
          >
            {/* Header: Fixed reachable spacing on phones with clock/notch status bar */}
            <div className="flex items-center justify-between px-6 pb-5 pt-[calc(max(1.5rem,env(safe-area-inset-top))+10px)] border-b border-blue-900/15 bg-[#07080e]/90 backdrop-blur-md">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center active:scale-90 cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-black tracking-widest text-white uppercase">Nutrition Targets</h2>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Edit calories &amp; macros</p>
              </div>
              <div className="w-10" />
            </div>

            {/* Day Type Tabs — scrollable, clean minimalist pills */}
            <div className="flex gap-2.5 px-6 py-4 overflow-x-auto no-scrollbar border-b border-blue-950/20 bg-[#060814]/80 backdrop-blur-md">
              {allDayTypes.map((dt) => {
                const isActive = dt === activeTab;
                return (
                  <button
                    key={dt}
                    onClick={() => setActiveTab(dt)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                      isActive 
                        ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
                        : 'bg-[#070709]/80 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {dt}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5 bg-[#0a0d1e]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* Day Label + Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Selected Target Group</span>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">{activeLabel}</h3>
                      {currentDayType === activeTab && (
                        <span className="inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#0c1020]/40 border border-blue-900/20 text-emerald-400 mt-1.5">
                          Active Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentTarget = draft[activeTab];
                          if (currentTarget && window.confirm(`Copy targets from ${activeLabel} to all other day types?`)) {
                            const updated = { ...draft };
                            allDayTypes.forEach(dt => {
                              updated[dt] = { ...currentTarget };
                            });
                            setDraft(updated);
                          }
                        }}
                        className="text-[10px] text-blue-400 font-black hover:text-white uppercase tracking-wider flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-2 rounded-xl border border-blue-500/20 transition-all cursor-pointer active:scale-95"
                      >
                        Apply to All Days
                      </button>
                      <button
                        type="button"
                        onClick={resetTab}
                        className="text-[10px] text-zinc-500 font-black hover:text-white uppercase tracking-wider flex items-center gap-1 bg-[#070709]/85 hover:bg-zinc-900/85 px-3 py-2 rounded-xl border border-zinc-900 transition-all cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Inputs Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Pencil size={11} className="text-blue-400" />
                      Tap any number to edit its target value directly.
                    </p>

                    {/* Calories Card (Blue Accent) */}
                    <div className="rounded-2xl p-5 border border-blue-950/20 bg-[#0c1020]/30 backdrop-blur-md relative overflow-hidden group hover:border-blue-900/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                          🔥 Total Calories Target
                        </label>
                        <Flame size={12} className="text-blue-500" />
                      </div>
                      <div className="flex items-center gap-2 mt-2 bg-[#07080e]/60 border border-blue-900/30 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all w-fit">
                        <input
                          type="number"
                          value={active.kcal}
                          onChange={e => updateField('kcal', e.target.value)}
                          className="bg-transparent text-2xl font-black text-white outline-none border-none max-w-[120px] p-0 font-mono"
                        />
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mr-1">kcal</span>
                        <Pencil size={12} className="text-zinc-550" />
                      </div>
                      {/* Premium Blue Progress Line */}
                      <div className="h-1 rounded-full mt-4 bg-zinc-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                          style={{ width: `${Math.min((active.kcal / 4000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Macros Grid (Obsidian Minimalist Panels) */}
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: 'protein' as const, label: 'Protein', emoji: '🥩', dotColor: 'bg-blue-500' },
                        { key: 'carbs'   as const, label: 'Carbs',   emoji: '🍚', dotColor: 'bg-emerald-500' },
                        { key: 'fat'     as const, label: 'Fat',     emoji: '🥑', dotColor: 'bg-amber-500' },
                      ]).map(({ key, label, dotColor }) => (
                        <div key={key} className="rounded-xl p-3.5 border border-blue-950/20 bg-[#0c1020]/30 backdrop-blur-md flex flex-col gap-1 hover:border-blue-900/40 transition-colors">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">{label}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 bg-[#07080e]/60 border border-blue-900/25 rounded-xl px-2.5 py-2 focus-within:border-blue-500/40 transition-all">
                            <input
                              type="number"
                              value={active[key]}
                              onChange={e => updateField(key, e.target.value)}
                              className="w-full bg-transparent text-base font-black text-white outline-none border-none p-0 font-mono"
                            />
                            <span className="text-[10px] text-zinc-500 font-bold mr-1">g</span>
                            <Pencil size={10} className="text-zinc-550 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calorie Split Preview */}
                    <div className="bg-[#0c1020]/30 backdrop-blur-md rounded-xl p-5 border border-blue-950/20">
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-3.5">Calorie Split Preview</p>
                      
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-950 p-0.5">
                        <div className="rounded-full transition-all duration-300 bg-blue-500" style={{ width: `${Math.round((active.protein * 4 / Math.max(active.kcal, 1)) * 100)}%` }} />
                        <div className="rounded-full transition-all duration-300 bg-emerald-500" style={{ width: `${Math.round((active.carbs * 4 / Math.max(active.kcal, 1)) * 100)}%` }} />
                        <div className="rounded-full transition-all duration-300 bg-amber-500" style={{ width: `${Math.round((active.fat * 9 / Math.max(active.kcal, 1)) * 100)}%` }} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        {[
                          { label: 'Protein', pct: Math.round((active.protein * 4 / Math.max(active.kcal, 1)) * 100), kcal: active.protein * 4, color: 'text-blue-400' },
                          { label: 'Carbs', pct: Math.round((active.carbs * 4 / Math.max(active.kcal, 1)) * 100), kcal: active.carbs * 4, color: 'text-emerald-400' },
                          { label: 'Fat', pct: Math.round((active.fat * 9 / Math.max(active.kcal, 1)) * 100), kcal: active.fat * 9, color: 'text-amber-400' },
                        ].map(({ label, pct, kcal, color }) => (
                          <div key={label} className="bg-zinc-950/40 py-2 rounded-lg border border-zinc-900/40">
                            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">{label}</span>
                            <span className={`text-xs font-black ${color} block mt-0.5`}>{pct}%</span>
                            <span className="text-[8px] text-zinc-600 font-bold block mt-0.5">{kcal} kcal</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-zinc-950 text-xs font-bold">
                        <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-black">Summed Calorie Total</span>
                        <span className="text-zinc-300 font-black font-mono text-xs">
                          {Math.round(active.protein * 4 + active.carbs * 4 + active.fat * 9)} / {active.kcal} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Global Hydration Target */}
              <div className="mt-6 pt-6 border-t border-blue-950/20">
                <div className="rounded-2xl p-5 border border-blue-950/20 bg-[#0c1020]/30 backdrop-blur-md relative overflow-hidden group hover:border-blue-900/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                      💧 Daily Water Target (Applies to all days)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-2 bg-[#07080e]/60 border border-blue-900/30 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all w-fit">
                    <input
                      type="number"
                      value={waterGoal}
                      onChange={e => {
                        const num = parseInt(e.target.value, 10);
                        if (!isNaN(num) && num >= 0) setWaterGoal(num);
                      }}
                      className="bg-transparent text-2xl font-black text-white outline-none border-none max-w-[120px] p-0 font-mono"
                    />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mr-1">ml</span>
                    <Pencil size={12} className="text-zinc-550" />
                  </div>
                  {/* Premium Blue Progress Line */}
                  <div className="h-1 rounded-full mt-4 bg-zinc-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                      style={{ width: `${Math.min((waterGoal / 6000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-6 pb-9 pt-4 border-t border-blue-950/20 bg-[#060814]/90 backdrop-blur-md">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs cursor-pointer border ${
                  savedFlash 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                    : 'bg-white hover:bg-zinc-100 text-black border-white shadow-lg shadow-white/5'
                }`}
              >
                {saving ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : savedFlash ? (
                  <>✓ Saved successfully</>
                ) : (
                  <><Save size={13} /> Save Targets</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return portalRoot ? createPortal(content, portalRoot) : content;
};
