import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Search, Check,
  Save, Play, Dumbbell, X, BookOpen, Edit2
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  tier?: string;
  cue?: string;
  sets?: number;
  rest?: number;
}

interface Template {
  split: string;
  exercises: Exercise[];
  isDirty: boolean;
}

const SPLITS = [
  { key: 'PUSH', label: 'Push', emoji: '💪', desc: 'Chest · Shoulders · Triceps' },
  { key: 'PULL', label: 'Pull', emoji: '⚡', desc: 'Back · Rear Delts · Biceps' },
  { key: 'LEGS', label: 'Legs', emoji: '🦵', desc: 'Quads · Hams · Glutes · Calves' },
];

const DEFAULT_EXERCISES: Record<string, string[]> = {
  PUSH: [
    'Incline DB Bench Press (45°)',
    'DB Shoulder Press (seated neutral)',
    'Incline DB Y-Raise (20-30°)',
    'Cable Chest Fly (low pulley)',
    'Overhead Cable Extension (rope)',
    'DB Lateral Raise (elbow-lead)',
  ],
  PULL: [
    'Lat Pulldown (wide grip)',
    'Chest-Supported DB Row',
    'Sideways One-Arm Rear Delt Fly',
    'Face Pull (rope eye height)',
    'Incline DB Curl - Bayesian',
    'Zottman Curl',
  ],
  LEGS: [
    'Leg Press (feet high for glutes)',
    'DB Romanian Deadlift',
    'DB Bulgarian Split Squat',
    'Seated Leg Curl',
    '45° Back Extension (BW/DB)',
    'Standing Calf Raise',
  ],
};

const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#3b82f6',
  Shoulders: '#f97316',
  Triceps: '#eab308',
  Back: '#6366f1',
  Biceps: '#06b6d4',
  'Rear Delts': '#8b5cf6',
  Quads: '#10b981',
  Hamstrings: '#14b8a6',
  Glutes: '#f59e0b',
  Calves: '#84cc16',
  Core: '#ec4899',
  Traps: '#818cf8',
};

function muscleColor(group: string) {
  for (const [key, col] of Object.entries(MUSCLE_COLORS)) {
    if (group?.toLowerCase().includes(key.toLowerCase())) return col;
  }
  return '#9ca3af';
}

// ─── Draggable Exercise Row ───────────────────────────────────────────────────
function ExerciseRow({
  exercise,
  index,
  onRemove,
  onUpdateSets,
  onUpdateRest,
}: {
  exercise: Exercise;
  index: number;
  onRemove: () => void;
  onUpdateSets: (sets: number) => void;
  onUpdateRest: (rest: number) => void;
}) {
  return (
    <Reorder.Item
      value={exercise}
      id={exercise.id}
      className="touch-none list-none mb-3"
      whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}
    >
      <div className="bg-[#070709] border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 flex-wrap cursor-grab active:cursor-grabbing transition-colors duration-150">
        {/* Left: Drag Handle, Index, Title Info */}
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          {/* Index Badge */}
          <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 flex-shrink-0">
            {index + 1}
          </div>

          {/* Grip Icon */}
          <GripVertical size={14} className="text-zinc-650 flex-shrink-0" />

          {/* Title and Muscle Group */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white truncate">
              {exercise.name}
            </div>
            {exercise.muscle_group && (
              <div 
                className="text-[9px] font-black mt-1 text-left uppercase tracking-wider block"
                style={{ color: muscleColor(exercise.muscle_group) }}
              >
                {exercise.muscle_group}
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls for Sets, Rest, and Actions */}
        <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap">
          {/* Sets Control */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Sets</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateSets(Math.max(1, (exercise.sets || 3) - 1)); }}
              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-black text-white min-w-[14px] text-center font-mono">
              {exercise.sets || 3}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateSets(Math.min(10, (exercise.sets || 3) + 1)); }}
              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Rest Control */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Rest</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRest(Math.max(30, (exercise.rest || 120) - 30)); }}
              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-black text-white min-w-[34px] text-center font-mono">
              {exercise.rest || 120}s
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRest(Math.min(600, (exercise.rest || 120) + 30)); }}
              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Trash/Remove Button */}
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer flex-shrink-0"
            title="Remove exercise"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── Exercise Picker Sheet ────────────────────────────────────────────────────
function ExercisePicker({
  existing,
  onAdd,
  onClose,
}: {
  split: string;
  existing: string[];
  onAdd: (ex: Exercise) => void;
  onClose: () => void;
}) {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('exercises').select('*').order('name');
      if (data) setAllExercises(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = allExercises.filter(ex =>
    !existing.includes(ex.id) &&
    (query === '' || ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-h-[85vh] bg-[#000000] border-t border-zinc-900 rounded-t-[28px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-950 bg-[#040406]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Add Exercise</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Search or pick from library</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center transition-colors cursor-pointer text-zinc-400"
            >
              <X size={14} />
            </button>
          </div>
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search exercises or muscle group…"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 focus:border-white rounded-xl outline-none text-zinc-200 text-xs font-bold placeholder-zinc-700 transition-colors"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto px-6 py-4 pb-8 flex-1 space-y-2.5 bg-[#000000]">
          {loading ? (
            <div className="text-center text-zinc-500 py-12 text-xs font-bold uppercase tracking-wider">Loading exercise database…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 text-xs font-bold uppercase tracking-wider">
              No exercises found{query ? ` for "${query}"` : ''}
            </div>
          ) : (
            filtered.map(ex => {
              const col = muscleColor(ex.muscle_group);
              return (
                <button
                  key={ex.id}
                  onClick={() => { onAdd(ex); }}
                  className="w-full flex items-center gap-3.5 p-3.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer text-left transition-all group"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: col }} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {ex.name}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-wider block">
                      {ex.muscle_group}
                      {ex.tier ? ` · Tier ${ex.tier}` : ''}
                    </div>
                  </div>
                  <Plus size={14} className="text-zinc-500 group-hover:text-white transition-all flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
const WorkoutBuilder = () => {
  const navigate = useNavigate();
  const [activeSplit, setActiveSplit] = useState('PUSH');
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Custom Split Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState('');
  const [renameValue, setRenameValue] = useState('');

  // ── Load saved templates from Supabase ──
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: plansData } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', session.user.id);

      let activePlans = plansData || [];
      // Seed default splits (PUSH/PULL/LEGS) only if user has NO templates at all
      if (activePlans.length === 0) {
        const defaultInserts = ['PUSH', 'PULL', 'LEGS'].map(split => ({
          user_id: session.user.id,
          plan_type: split,
          exercises: DEFAULT_EXERCISES[split].map((name: string, i: number) => ({
            id: `default-${split.toLowerCase()}-${i}`,
            name,
            sets: 3,
            rest: 120
          }))
        }));
        const { data: seededData } = await supabase
          .from('user_workout_plans')
          .insert(defaultInserts)
          .select();
        if (seededData) {
          activePlans = [...activePlans, ...seededData];
        }
      }

      const loadedTemplates: Record<string, Template> = {};

      for (const plan of activePlans) {
        const split = plan.plan_type;
        const rawExercises: any[] = plan.exercises || [];
        const names = rawExercises.map(e => typeof e === 'string' ? e : e.name);

        const { data: exData } = await supabase
          .from('exercises')
          .select('*')
          .in('name', names);

        const dbExMap = new Map();
        if (exData) {
          exData.forEach(ex => {
            dbExMap.set(ex.name, ex);
          });
        }

        const exercisesWithRichInfo: Exercise[] = rawExercises.map((r, i) => {
          const name = typeof r === 'string' ? r : r.name;
          const sets = typeof r === 'string' ? 3 : r.sets || 3;
          const rest = typeof r === 'string' ? 120 : r.rest || 120;
          
          const dbEx = dbExMap.get(name);
          return {
            id: dbEx?.id || `stub-${split}-${i}-${Date.now()}`,
            name,
            muscle_group: dbEx?.muscle_group || 'Custom',
            tier: dbEx?.tier || 'A',
            cue: dbEx?.cue || '',
            sets,
            rest
          };
        });

        loadedTemplates[split] = {
          split,
          exercises: exercisesWithRichInfo,
          isDirty: false
        };
      }

      setTemplates(loadedTemplates);
      
      const keys = Object.keys(loadedTemplates);
      if (keys.length > 0 && !keys.includes(activeSplit)) {
        setActiveSplit(keys[0]);
      }
      
      setLoading(false);
    };
    load();
  }, []);

  const currentTemplate = templates[activeSplit];

  // ── Reorder handler ──
  const handleReorder = (newOrder: Exercise[]) => {
    setTemplates(prev => ({
      ...prev,
      [activeSplit]: { ...prev[activeSplit], exercises: newOrder, isDirty: true },
    }));
  };

  // ── Remove exercise ──
  const handleRemove = (id: string) => {
    setTemplates(prev => ({
      ...prev,
      [activeSplit]: {
        ...prev[activeSplit],
        exercises: prev[activeSplit].exercises.filter(e => e.id !== id),
        isDirty: true,
      },
    }));
  };

  // ── Add exercise from picker ──
  const handleAdd = (ex: Exercise) => {
    setTemplates(prev => ({
      ...prev,
      [activeSplit]: {
        ...prev[activeSplit],
        exercises: [...prev[activeSplit].exercises, { ...ex, sets: 3, rest: 120 }],
        isDirty: true,
      },
    }));
    setShowPicker(false);
  };

  // ── Stepper Handlers ──
  const handleUpdateSets = (id: string, sets: number) => {
    setTemplates(prev => ({
      ...prev,
      [activeSplit]: {
        ...prev[activeSplit],
        exercises: prev[activeSplit].exercises.map(e => e.id === id ? { ...e, sets } : e),
        isDirty: true,
      },
    }));
  };

  const handleUpdateRest = (id: string, rest: number) => {
    setTemplates(prev => ({
      ...prev,
      [activeSplit]: {
        ...prev[activeSplit],
        exercises: prev[activeSplit].exercises.map(e => e.id === id ? { ...e, rest } : e),
        isDirty: true,
      },
    }));
  };

  // ── Save template ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const exercisePayload = currentTemplate.exercises.map(e => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscle_group || '',
        tier: e.tier || '',
        sets: e.sets || 3,
        rest: e.rest || 120
      }));

      const { error } = await supabase
        .from('user_workout_plans')
        .upsert({
          user_id: session.user.id,
          plan_type: activeSplit,
          exercises: exercisePayload,
        }, { onConflict: 'user_id,plan_type' });

      if (error) throw error;

      setTemplates(prev => ({
        ...prev,
        [activeSplit]: { ...prev[activeSplit], isDirty: false },
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setToastMsg(`${activeSplit} template saved!`);
      setTimeout(() => setToastMsg(''), 2500);
      window.dispatchEvent(new Event('plan_updated'));
    } catch (e: any) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Create Custom Split ──
  const handleCreateTemplate = () => {
    const trimmedName = newTemplateName.trim();
    if (!trimmedName) {
      alert('Please enter a template name.');
      return;
    }
    if (templates[trimmedName]) {
      alert('A template with this name already exists.');
      return;
    }

    setTemplates(prev => ({
      ...prev,
      [trimmedName]: { split: trimmedName, exercises: [], isDirty: true },
    }));
    setActiveSplit(trimmedName);
    setNewTemplateName('');
    setShowCreateModal(false);
    setToastMsg(`Template "${trimmedName}" created!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // ── Rename Custom Split ──
  const handleRenameTemplate = async () => {
    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      alert('Please enter a template name.');
      return;
    }
    if (templates[trimmedName] && trimmedName !== renameTarget) {
      alert('A template with this name already exists.');
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const targetTemplate = templates[renameTarget];
      const exercisePayload = targetTemplate.exercises.map(e => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscle_group || '',
        tier: e.tier || '',
        sets: e.sets || 3,
        rest: e.rest || 120
      }));

      // Delete the old split
      await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', session.user.id)
        .eq('plan_type', renameTarget);

      // Save the new split
      const { error } = await supabase
        .from('user_workout_plans')
        .upsert({
          user_id: session.user.id,
          plan_type: trimmedName,
          exercises: exercisePayload,
        }, { onConflict: 'user_id,plan_type' });

      if (error) throw error;

      // Update all schedules referencing the renamed template
      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id);

      if (schedulesData && schedulesData.length > 0) {
        for (const sched of schedulesData) {
          let daysChanged = false;
          const updatedDays = { ...sched.days };
          for (const [dateStr, val] of Object.entries(updatedDays)) {
            if (val === renameTarget) {
              updatedDays[dateStr] = trimmedName;
              daysChanged = true;
            }
          }
          if (daysChanged) {
            await supabase
              .from('schedules')
              .update({ days: updatedDays })
              .eq('id', sched.id);
          }
        }
      }

      const updatedTemplates = { ...templates };
      delete updatedTemplates[renameTarget];
      updatedTemplates[trimmedName] = {
        split: trimmedName,
        exercises: targetTemplate.exercises,
        isDirty: false
      };

      setTemplates(updatedTemplates);
      setActiveSplit(trimmedName);
      setShowRenameModal(false);
      setToastMsg(`Template renamed to "${trimmedName}"!`);
      setTimeout(() => setToastMsg(''), 2500);
      window.dispatchEvent(new Event('plan_updated'));
    } catch (e: any) {
      alert('Failed to rename: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Custom Split ──
  const handleDeleteTemplate = async (splitKey: string) => {
    const isDefault = ['PUSH', 'PULL', 'LEGS'].includes(splitKey);
    if (!window.confirm(`Are you sure you want to delete the "${splitKey}" template?${isDefault ? ' (This is a default split, but you can delete it if you want)' : ''}`)) {
      return;
    }
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', session.user.id)
        .eq('plan_type', splitKey);

      if (error) throw error;

      const updatedTemplates = { ...templates };
      delete updatedTemplates[splitKey];
      
      const remainingKeys = Object.keys(updatedTemplates);
      if (remainingKeys.length > 0) {
        setActiveSplit(remainingKeys[0]);
      } else {
        updatedTemplates['PUSH'] = { split: 'PUSH', exercises: [], isDirty: false };
        setActiveSplit('PUSH');
      }
      
      setTemplates(updatedTemplates);
      setToastMsg(`Template "${splitKey}" deleted!`);
      setTimeout(() => setToastMsg(''), 2500);
      window.dispatchEvent(new Event('plan_updated'));
    } catch (e: any) {
      alert('Failed to delete template: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Start workout from this template ──
  const handleStartNow = () => {
    navigate('/workout/active', {
      state: {
        startNew: true,
        plan: {
          type: activeSplit,
          title: `${activeSplit} Session`,
          exercises: currentTemplate.exercises.map(e => ({
            ...e,
            setsCount: e.sets || 3,
            restTime: e.rest || 120
          })),
        },
        activeDateStr: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString().split('T')[0],
      },
    });
  };

  const getSplitInfo = (key: string) => {
    const found = SPLITS.find(s => s.key === key);
    if (found) return found;
    return {
      key: key,
      label: key,
      emoji: '🏋️‍♂️',
      desc: 'Custom Workout Program'
    };
  };

  const splitInfo = getSplitInfo(activeSplit);

  return (
    <div className="min-h-full pb-32 max-w-lg mx-auto w-full px-5 pt-[calc(max(1.25rem,env(safe-area-inset-top))+12px)] flex flex-col gap-6 bg-black">
      {/* ── Header ── */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => navigate('/workout')}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center active:scale-90 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-widest leading-tight">
            Workout Builder
          </h1>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1 block">
            Customize &amp; save your splits
          </p>
        </div>
      </div>

      {/* ── Split Tabs Scroll ── */}
      <div className="flex gap-2.5 p-1 bg-[#040406] border border-zinc-950 rounded-2xl overflow-x-auto no-scrollbar">
        {Object.keys(templates).map(key => {
          const split = templates[key];
          const isActive = activeSplit === key;
          const hasDirty = split?.isDirty;
          const info = getSplitInfo(key);
          
          return (
            <button
              key={key}
              onClick={() => setActiveSplit(key)}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer relative shrink-0 border text-[10px] font-black uppercase tracking-wider ${
                isActive 
                  ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
                  : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </span>
              {hasDirty && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>
          );
        })}
        
        {/* Add custom template button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-dashed border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-all"
        >
          <Plus size={12} />
          New Split
        </button>
      </div>

      {/* ── Split Info Bar Card ── */}
      {currentTemplate && (
        <div className="flex items-center justify-between p-4 bg-[#070709] rounded-2xl border border-zinc-900">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-white">
                {splitInfo.label}
              </span>
              
              {/* Rename Button */}
              <button
                onClick={() => {
                  setRenameTarget(activeSplit);
                  setRenameValue(activeSplit);
                  setShowRenameModal(true);
                }}
                className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Edit2 size={10} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Rename</span>
              </button>
            </div>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 truncate">
              {splitInfo.desc}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 px-2.5 py-1.5 rounded-xl">
              <Dumbbell size={12} className="text-zinc-500" />
              <span className="text-[9px] font-black text-zinc-300 font-mono">
                {currentTemplate.exercises.length} EX
              </span>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteTemplate(activeSplit)}
              className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-red-500/20 hover:text-red-400 text-zinc-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Delete Template"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-16 rounded-2xl bg-zinc-950 border border-zinc-900 animate-pulse" 
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      )}

      {/* ── Reorderable exercise list ── */}
      {!loading && currentTemplate && (
        <div className="flex-1 flex flex-col gap-4">
          {currentTemplate.exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-14 px-6 bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center"
            >
              <BookOpen size={36} className="text-zinc-700 mb-3" />
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">No exercises added</h4>
              <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider max-w-[200px]">Tap "+ Add Exercise" below to start building your template</p>
            </motion.div>
          ) : (
            <Reorder.Group
              axis="y"
              values={currentTemplate.exercises}
              onReorder={handleReorder}
              className="list-none p-0 m-0"
            >
              {currentTemplate.exercises.map((ex, i) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  onRemove={() => handleRemove(ex.id)}
                  onUpdateSets={(sets) => handleUpdateSets(ex.id, sets)}
                  onUpdateRest={(rest) => handleUpdateRest(ex.id, rest)}
                />
              ))}
            </Reorder.Group>
          )}

          {/* Drag Reorder Hint */}
          {currentTemplate.exercises.length > 1 && (
            <div className="text-center text-[9px] font-black text-zinc-600 tracking-widest flex items-center justify-center gap-1.5 uppercase my-1">
              <GripVertical size={11} />
              Drag items to reorder exercises
            </div>
          )}

          {/* Add Exercise Button */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full py-4 bg-zinc-950 border border-dashed border-zinc-900 hover:border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer mt-1"
          >
            <Plus size={14} />
            Add Exercise
          </button>

          {/* Footer Save & Play Actions */}
          <div className="grid grid-cols-2 gap-3.5 mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !currentTemplate.isDirty}
              className="py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer border"
              style={{
                background: currentTemplate.isDirty 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'rgba(255,255,255,0.02)',
                borderColor: currentTemplate.isDirty 
                  ? '#059669' 
                  : 'rgba(255,255,255,0.05)',
                color: currentTemplate.isDirty ? '#ffffff' : '#475569',
                boxShadow: currentTemplate.isDirty ? '0 4px 20px rgba(16,185,129,0.1)' : 'none'
              }}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Split'}
            </button>

            <button
              onClick={handleStartNow}
              disabled={currentTemplate.exercises.length === 0}
              className="py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-black bg-white hover:bg-zinc-150 border border-white"
              style={{
                opacity: currentTemplate.exercises.length === 0 ? 0.35 : 1
              }}
            >
              <Play size={14} className="fill-current" />
              Start Now
            </button>
          </div>
        </div>
      )}

      {/* ── Create Template Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#070709] border border-zinc-900 rounded-[24px] p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Create Custom Split</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1 mb-5">Give your split a name</p>
            
            <input
              autoFocus
              type="text"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              placeholder="e.g. Upper Body, Legs A..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-slate-200 text-xs font-bold outline-none placeholder-zinc-700 mb-6"
              onKeyDown={e => { if (e.key === 'Enter') handleCreateTemplate(); }}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="py-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="py-3.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-wider cursor-pointer border border-white"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Rename Template Modal ── */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#070709] border border-zinc-900 rounded-[24px] p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Rename Template</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1 mb-5">Enter new template name</p>
            
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="e.g. Push Split..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-slate-200 text-xs font-bold outline-none placeholder-zinc-700 mb-6"
              onKeyDown={e => { if (e.key === 'Enter') handleRenameTemplate(); }}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="py-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameTemplate}
                className="py-3.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-wider cursor-pointer border border-white"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Exercise Picker Sheet ── */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            split={activeSplit}
            existing={currentTemplate?.exercises.map(e => e.id) || []}
            onAdd={handleAdd}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-2 z-[99999]"
          >
            <Check size={14} className="text-emerald-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutBuilder;
