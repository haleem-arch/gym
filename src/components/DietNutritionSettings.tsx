import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';

export const FIXED_DAY_TYPES = ['REST', 'RUN', 'RUN+GYM'] as const;
// kept for backwards compat in useDiet defaults
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
  PULL:      { kcal: 2400, protein: 170, carbs: 230, fat: 70 },
  LEGS:      { kcal: 2500, protein: 170, carbs: 250, fat: 70 },
  'RUN+GYM': { kcal: 2800, protein: 180, carbs: 310, fat: 75 },
};

const KNOWN_META: Record<string, { icon: string; color: string; gradient: string; label: string }> = {
  REST:      { icon: '🛌', color: '#8b949e', gradient: 'from-slate-500/20 to-slate-800/10', label: 'Rest Day' },
  RUN:       { icon: '🏃', color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-700/10', label: 'Run Day' },
  PUSH:      { icon: '💪', color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-700/10', label: 'Push Day' },
  PULL:      { icon: '🔝', color: '#8b5cf6', gradient: 'from-purple-500/20 to-purple-700/10', label: 'Pull Day' },
  LEGS:      { icon: '🦵', color: '#ec4899', gradient: 'from-pink-500/20 to-pink-700/10', label: 'Legs Day' },
  'RUN+GYM': { icon: '⚡', color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-700/10', label: 'Run + Gym' },
};

const CUSTOM_COLORS = ['#f97316', '#06b6d4', '#a855f7', '#84cc16', '#f43f5e', '#14b8a6'];

// Get meta for any day type including custom ones
const getMeta = (dt: string, customIndex: number) => {
  if (KNOWN_META[dt]) return KNOWN_META[dt];
  const col = CUSTOM_COLORS[customIndex % CUSTOM_COLORS.length];
  return {
    icon: '🏋️',
    color: col,
    gradient: `from-[${col}]/20 to-gray-800/10`,
    label: dt,
  };
};

// Default targets for unknown day types (gym-style)
const getDefaultTarget = (dt: string): MacroTarget =>
  DEFAULT_DAY_NUTRITION[dt] ?? { kcal: 2400, protein: 170, carbs: 230, fat: 70 };

interface Props {
  open: boolean;
  onClose: () => void;
  currentDayType: string;
  allDayTypes: string[]; // full dynamic list from DB + fixed
  dayNutrition: Record<string, MacroTarget>;
  onSave: (map: Record<string, MacroTarget>) => Promise<void>;
}

export const DietNutritionSettings = ({ open, onClose, currentDayType, allDayTypes, dayNutrition, onSave }: Props) => {
  const [activeTab, setActiveTab] = useState<string>(currentDayType || 'REST');
  const [draft, setDraft] = useState<Record<string, MacroTarget>>({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Sync draft from prop when opening or allDayTypes changes
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
    await onSave(draft);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const active = draft[activeTab] ?? getDefaultTarget(activeTab);
  const customIdx = allDayTypes.indexOf(activeTab);
  const meta = getMeta(activeTab, customIdx);

  const portalRoot = document.getElementById('modal-portal');

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Full-screen overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${portalRoot ? 'absolute' : 'fixed'} inset-0 bg-black/80 backdrop-blur-md z-[60] pointer-events-auto`}
            onClick={onClose}
          />

          {/* Full-screen sheet — slides up and fills entire container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={`${portalRoot ? 'absolute' : 'fixed'} inset-0 z-[70] bg-gradient-to-b from-[#090b14] to-[#04050a] flex flex-col overflow-hidden pointer-events-auto`}
          >
            {/* Full-page Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-xl">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-850 hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center justify-center active:scale-90 cursor-pointer"
              >
                <X size={18} className="text-gray-400" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">Nutrition Targets</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Calories &amp; macros per day type</p>
              </div>
              <div className="w-10" />
            </div>

            {/* Day Type Tabs — scrollable, shows ALL day types including custom */}
            <div className="flex gap-2.5 px-6 py-4 overflow-x-auto no-scrollbar border-b border-slate-900/60 bg-slate-950/20">
              {allDayTypes.map((dt, idx) => {
                const m = getMeta(dt, idx);
                const isActive = dt === activeTab;
                return (
                  <button
                    key={dt}
                    onClick={() => setActiveTab(dt)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 border cursor-pointer"
                    style={{
                      background: isActive ? m.color + '15' : 'rgba(255,255,255,0.02)',
                      borderColor: isActive ? m.color : 'rgba(255,255,255,0.05)',
                      boxShadow: isActive ? `0 4px 20px ${m.color}10` : 'none',
                    }}
                  >
                    <span className="text-lg leading-none">{m.icon}</span>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider max-w-[85px] truncate"
                      style={{ color: isActive ? m.color : '#64748b' }}
                    >
                      {dt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Day label + reset */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{meta.icon}</span>
                      <div>
                        <span className="font-black text-lg text-white tracking-tight uppercase block leading-tight">{meta.label}</span>
                        {currentDayType === activeTab && (
                          <span
                            className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5"
                            style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}33` }}
                          >
                            Today's Active Split
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={resetTab}
                      className="text-xs text-gray-500 font-bold hover:text-white uppercase tracking-wider flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800/80 active:scale-90 transition-all cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>

                  {/* Macro Inputs */}
                  <div className="flex flex-col gap-4">
                    {/* Calories Card */}
                    <div
                      className="rounded-3xl p-5 border relative overflow-hidden bg-gradient-to-br"
                      style={{ 
                        backgroundImage: `linear-gradient(135deg, ${meta.color}15, rgba(0,0,0,0.4))`, 
                        borderColor: meta.color + '33' 
                      }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-25" style={{ background: meta.color }} />
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                        🔥 Calories Target
                      </label>
                      <div className="flex items-baseline gap-1.5">
                        <input
                          type="number"
                          value={active.kcal}
                          onChange={e => updateField('kcal', e.target.value)}
                          className="bg-transparent text-4xl font-black outline-none border-none max-w-[180px] p-0"
                          style={{ color: meta.color }}
                        />
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">kcal</span>
                      </div>
                      <div className="h-1.5 rounded-full mt-4 bg-slate-950/80 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((active.kcal / 4000) * 100, 100)}%`, background: meta.color }}
                        />
                      </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: 'protein' as const, label: 'Protein', emoji: '🥩', color: '#3b82f6', bg: 'bg-blue-500/5', border: 'border-blue-500/15' },
                        { key: 'carbs'   as const, label: 'Carbs',   emoji: '🍚', color: '#10b981', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15' },
                        { key: 'fat'     as const, label: 'Fat',     emoji: '🥑', color: '#f59e0b', bg: 'bg-amber-500/5', border: 'border-amber-500/15' },
                      ]).map(({ key, label, emoji, color, bg, border }) => (
                        <div key={key} className={`rounded-2xl p-4 border ${bg} ${border} flex flex-col gap-1.5 bg-slate-950/40 relative overflow-hidden group hover:border-slate-700 transition-colors`}>
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block">{emoji} {label}</span>
                          <div className="flex items-baseline gap-0.5 mt-1">
                            <input
                              type="number"
                              value={active[key]}
                              onChange={e => updateField(key, e.target.value)}
                              className="w-full bg-transparent text-2xl font-black outline-none border-none p-0"
                              style={{ color }}
                            />
                            <span className="text-[10px] text-gray-500 font-bold">g</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calorie split preview */}
                    <div className="bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 border border-slate-900">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3.5">Calorie Split Preview</p>
                      
                      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-950/80 p-0.5 border border-slate-900">
                        <div className="rounded-full transition-all duration-300" style={{ width: `${Math.round((active.protein * 4 / Math.max(active.kcal, 1)) * 100)}%`, background: '#3b82f6' }} />
                        <div className="rounded-full transition-all duration-300" style={{ width: `${Math.round((active.carbs * 4 / Math.max(active.kcal, 1)) * 100)}%`, background: '#10b981' }} />
                        <div className="rounded-full transition-all duration-300" style={{ width: `${Math.round((active.fat * 9 / Math.max(active.kcal, 1)) * 100)}%`, background: '#f59e0b' }} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        {[
                          { label: 'Protein', pct: Math.round((active.protein * 4 / Math.max(active.kcal, 1)) * 100), kcal: active.protein * 4, color: 'text-blue-400' },
                          { label: 'Carbs', pct: Math.round((active.carbs * 4 / Math.max(active.kcal, 1)) * 100), kcal: active.carbs * 4, color: 'text-emerald-400' },
                          { label: 'Fat', pct: Math.round((active.fat * 9 / Math.max(active.kcal, 1)) * 100), kcal: active.fat * 9, color: 'text-amber-400' },
                        ].map(({ label, pct, kcal, color }) => (
                          <div key={label} className="bg-slate-950/30 py-2 rounded-xl border border-slate-900/40">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">{label}</span>
                            <span className={`text-sm font-black ${color} block mt-0.5`}>{pct}%</span>
                            <span className="text-[9px] text-gray-600 font-bold block mt-0.5">{kcal} kcal</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-900/60 text-xs font-bold">
                        <span className="text-gray-500 uppercase text-[9px] tracking-wider font-black">Summed Total Calories</span>
                        <span className="text-gray-300 font-black font-mono">
                          {Math.round(active.protein * 4 + active.carbs * 4 + active.fat * 9)} / {active.kcal} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Save Button */}
            <div className="px-6 pb-9 pt-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-white transition-all shadow-xl uppercase tracking-widest text-xs cursor-pointer border"
                style={{ 
                  background: savedFlash ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderColor: savedFlash ? '#059669' : '#1d4ed8',
                  boxShadow: savedFlash ? '0 4px 20px rgba(16,185,129,0.2)' : '0 4px 20px rgba(37,99,235,0.2)'
                }}
              >
                {saving ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : savedFlash ? (
                  <>✅ Saved Successfully</>
                ) : (
                  <><Save size={14} /> Save All Targets</>
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
