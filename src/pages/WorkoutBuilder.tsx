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
  { key: 'PUSH', label: 'Push', emoji: '🔴', color: '#ef4444', desc: 'Chest · Shoulders · Triceps' },
  { key: 'PULL', label: 'Pull', emoji: '🔵', color: '#3b82f6', desc: 'Back · Rear Delts · Biceps' },
  { key: 'LEGS', label: 'Legs', emoji: '🟡', color: '#eab308', desc: 'Quads · Hams · Glutes · Calves' },
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
  Chest: '#ef4444',
  Shoulders: '#f97316',
  Triceps: '#eab308',
  Back: '#3b82f6',
  Biceps: '#06b6d4',
  'Rear Delts': '#8b5cf6',
  Quads: '#22c55e',
  Hamstrings: '#10b981',
  Glutes: '#f59e0b',
  Calves: '#84cc16',
  Core: '#ec4899',
  Traps: '#6366f1',
};

function muscleColor(group: string) {
  for (const [key, col] of Object.entries(MUSCLE_COLORS)) {
    if (group?.toLowerCase().includes(key.toLowerCase())) return col;
  }
  return '#6b7280';
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
      className="touch-none"
      whileDrag={{ scale: 1.03, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
          cursor: 'grab',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Drag / Index / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '150px' }}>
          {/* Index badge */}
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#60a5fa', flexShrink: 0,
          }}>
            {index + 1}
          </div>

          {/* Grip icon */}
          <GripVertical size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />

          {/* Name + muscle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#f1f5f9',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {exercise.name}
            </div>
            {exercise.muscle_group && (
              <div style={{
                fontSize: 10, fontWeight: 600, marginTop: 2,
                color: muscleColor(exercise.muscle_group),
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {exercise.muscle_group}
              </div>
            )}
          </div>
        </div>

        {/* Right: Steppers & Tier & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Sets stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Sets</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateSets(Math.max(1, (exercise.sets || 3) - 1)); }}
              style={{ width: 18, height: 18, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}
            >
              -
            </button>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', minWidth: 12, textAlign: 'center' }}>
              {exercise.sets || 3}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateSets(Math.min(10, (exercise.sets || 3) + 1)); }}
              style={{ width: 18, height: 18, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}
            >
              +
            </button>
          </div>

          {/* Rest stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Rest</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRest(Math.max(30, (exercise.rest || 120) - 30)); }}
              style={{ width: 18, height: 18, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}
            >
              -
            </button>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399', minWidth: 32, textAlign: 'center' }}>
              {exercise.rest || 120}s
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateRest(Math.min(600, (exercise.rest || 120) + 30)); }}
              style={{ width: 18, height: 18, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Trash2 size={13} color="#f87171" />
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
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: 'linear-gradient(180deg, #0f1122 0%, #080910 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Add Exercise</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Search or pick from library</div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#94a3b8" />
            </button>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search exercises or muscle group…"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 34, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, outline: 'none',
                color: '#f1f5f9', fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '8px 16px 24px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: 32, fontSize: 13 }}>Loading exercises…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: 32, fontSize: 13 }}>
              No exercises found{query ? ` for "${query}"` : ''}
            </div>
          ) : (
            filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => { onAdd(ex); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 12, padding: '11px 12px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: muscleColor(ex.muscle_group),
                  boxShadow: `0 0 6px ${muscleColor(ex.muscle_group)}66`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ex.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {ex.muscle_group}
                    {ex.tier ? ` · Tier ${ex.tier}` : ''}
                  </div>
                </div>
                <Plus size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
      // Seed any missing default splits (PUSH/PULL/LEGS)
      const existingTypes = activePlans.map(p => p.plan_type);
      const missingDefaults = ['PUSH', 'PULL', 'LEGS'].filter(t => !existingTypes.includes(t));
      if (missingDefaults.length > 0) {
        const defaultInserts = missingDefaults.map(split => ({
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

        let exercisesWithRichInfo: Exercise[] = [];
        if (exData && exData.length > 0) {
          const sorted = [...exData].sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));
          exercisesWithRichInfo = sorted.map(ex => {
            const matched = rawExercises.find(r => (typeof r === 'string' ? r : r.name) === ex.name);
            return {
              id: ex.id,
              name: ex.name,
              muscle_group: ex.muscle_group,
              tier: ex.tier,
              cue: ex.cue,
              sets: matched && typeof matched !== 'string' ? matched.sets : 3,
              rest: matched && typeof matched !== 'string' ? matched.rest : 120,
            };
          });
        } else {
          // Fallback stubs
          exercisesWithRichInfo = rawExercises.map((r, i) => {
            const name = typeof r === 'string' ? r : r.name;
            const sets = typeof r === 'string' ? 3 : r.sets || 3;
            const rest = typeof r === 'string' ? 120 : r.rest || 120;
            return {
              id: `stub-${split}-${i}`,
              name,
              muscle_group: '',
              tier: '',
              sets,
              rest
            };
          });
        }

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
      color: '#818cf8',
      desc: 'Custom Workout Program'
    };
  };

  const splitInfo = getSplitInfo(activeSplit);

  return (
    <div style={{
      minHeight: '100%',
      background: 'transparent',
      paddingBottom: 120,
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '20px 20px 0',
        position: 'sticky', top: 0, zIndex: 20,
        background: 'linear-gradient(180deg, #060610 85%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button
            onClick={() => navigate('/workout')}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color="#94a3b8" />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
              Workout Builder
            </h1>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 3, letterSpacing: '0.05em' }}>
              Customize &amp; save your training templates
            </div>
          </div>
        </div>

        {/* ── Split tabs ── */}
        <div style={{
          display: 'flex', gap: 8,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 16, padding: 4,
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {Object.keys(templates).map(key => {
            const split = templates[key];
            const isActive = activeSplit === key;
            const hasDirty = split?.isDirty;
            const info = getSplitInfo(key);
            
            return (
              <button
                key={key}
                onClick={() => setActiveSplit(key)}
                style={{
                  padding: '9px 14px', borderRadius: 12,
                  background: isActive
                    ? `linear-gradient(135deg, ${info.color}22, ${info.color}11)`
                    : 'transparent',
                  border: isActive
                    ? `1px solid ${info.color}44`
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 800,
                  color: isActive ? '#f1f5f9' : '#64748b',
                  letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </div>
                {hasDirty && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#f59e0b',
                    boxShadow: '0 0 6px #f59e0b',
                  }} />
                )}
              </button>
            );
          })}
          
          {/* Add custom template button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '9px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.15)',
              color: '#34d399', fontSize: 11, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              flexShrink: 0,
            }}
          >
            <Plus size={12} />
            New Split
          </button>
        </div>
      </div>

      {/* ── Split info bar ── */}
      <div style={{ padding: '10px 20px 0' }}>
        {currentTemplate && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            background: `linear-gradient(135deg, ${splitInfo.color}10, transparent)`,
            border: `1px solid ${splitInfo.color}22`,
            borderRadius: 14, marginBottom: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: splitInfo.color }}>
                  {splitInfo.label}
                </span>
                
                {/* Rename Button */}
                <button
                  onClick={() => {
                    setRenameTarget(activeSplit);
                    setRenameValue(activeSplit);
                    setShowRenameModal(true);
                  }}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
                    padding: '2px 4px', borderRadius: 4, gap: 2
                  }}
                  title="Rename Template"
                >
                  <Edit2 size={9} />
                  <span style={{ fontSize: 9, fontWeight: 700 }}>Rename</span>
                </button>
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {splitInfo.desc}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Dumbbell size={13} color={splitInfo.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  {currentTemplate.exercises.length} ex
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteTemplate(activeSplit)}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Delete Template"
              >
                <Trash2 size={12} color="#ef4444" />
              </button>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: 58, borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 1 - i * 0.12,
              }} />
            ))}
          </div>
        )}

        {/* ── Reorderable exercise list ── */}
        {!loading && currentTemplate && (
          <>
            {currentTemplate.exercises.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center', padding: '48px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  marginBottom: 16,
                }}
              >
                <BookOpen size={32} color="#334155" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  No exercises yet
                </div>
                <div style={{ fontSize: 12, color: '#334155' }}>
                  Tap "+ Add Exercise" to start building your template
                </div>
              </motion.div>
            ) : (
              <Reorder.Group
                axis="y"
                values={currentTemplate.exercises}
                onReorder={handleReorder}
                style={{ listStyle: 'none', padding: 0, margin: 0 }}
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

            {/* ── Drag hint ── */}
            {currentTemplate.exercises.length > 1 && (
              <div style={{
                textAlign: 'center', fontSize: 10, color: '#334155',
                margin: '8px 0 16px', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <GripVertical size={11} />
                DRAG TO REORDER
              </div>
            )}

            {/* ── Add exercise button ── */}
            <button
              onClick={() => setShowPicker(true)}
              style={{
                width: '100%', padding: '14px',
                background: 'rgba(59,130,246,0.07)',
                border: '1px dashed rgba(59,130,246,0.3)',
                borderRadius: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, color: '#60a5fa', fontSize: 13, fontWeight: 700,
                marginBottom: 16,
              }}
            >
              <Plus size={16} />
              Add Exercise
            </button>

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Save template */}
              <button
                onClick={handleSave}
                disabled={saving || !currentTemplate.isDirty}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: 14,
                  background: currentTemplate.isDirty
                    ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                    : 'rgba(255,255,255,0.04)',
                  border: currentTemplate.isDirty
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.07)',
                  color: currentTemplate.isDirty ? '#fff' : '#475569',
                  fontSize: 13, fontWeight: 800,
                  cursor: currentTemplate.isDirty ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.2s',
                  boxShadow: currentTemplate.isDirty ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saved ? <Check size={15} /> : <Save size={15} />}
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Template'}
              </button>

              {/* Start workout now */}
              <button
                onClick={handleStartNow}
                disabled={currentTemplate.exercises.length === 0}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: 14,
                  background: currentTemplate.exercises.length > 0
                    ? `linear-gradient(135deg, ${splitInfo.color}cc, ${splitInfo.color})`
                    : 'rgba(255,255,255,0.04)',
                  border: 'none',
                  color: currentTemplate.exercises.length > 0 ? '#fff' : '#475569',
                  fontSize: 13, fontWeight: 800,
                  cursor: currentTemplate.exercises.length > 0 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: currentTemplate.exercises.length > 0
                    ? `0 4px 20px ${splitInfo.color}44`
                    : 'none',
                  opacity: currentTemplate.exercises.length === 0 ? 0.4 : 1,
                }}
              >
                <Play size={15} />
                Start Now
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Create Template Modal ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(180deg, #101224 0%, #07080f 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: 24, width: '100%', maxWidth: 340,
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Create New Template</h3>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>Give your custom program a descriptive name.</p>
            
            <input
              autoFocus
              type="text"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              placeholder="e.g. Upper Body, Legs A, Core..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, outline: 'none', marginBottom: 18
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateTemplate(); }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                }}
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Rename Template Modal ── */}
      {showRenameModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(180deg, #101224 0%, #07080f 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: 24, width: '100%', maxWidth: 340,
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Rename Template</h3>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>Change the template name for your split.</p>
            
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="Template name..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, outline: 'none', marginBottom: 18
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleRenameTemplate(); }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowRenameModal(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRenameTemplate}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Exercise Picker sheet ── */}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 99999, whiteSpace: 'nowrap',
            }}
          >
            <Check size={14} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutBuilder;
