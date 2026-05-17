import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LOCAL_EXERCISES_DICTIONARY } from '../utils/localExercises';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Search, 
  Dumbbell, 
  Save, 
  Activity, 
  Utensils 
} from 'lucide-react';

interface CustomExerciseConfig {
  name: string;
  sets: number;
  rest: number;
}

const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

const fuzzyMatch = (text: string, query: string): boolean => {
  text = text.toLowerCase().trim();
  query = query.toLowerCase().trim();
  
  if (!query) return false;
  if (text.includes(query)) return true;
  
  const queryTokens = query.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const textTokens = text.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  
  if (queryTokens.length === 0) return false;
  
  return queryTokens.every(qToken => {
    if (qToken.length <= 3) {
      return textTokens.some(tToken => tToken.startsWith(qToken));
    }
    if (textTokens.some(tToken => tToken.startsWith(qToken) || tToken.includes(qToken))) {
      return true;
    }
    return textTokens.some(tToken => {
      if (tToken.length < 3) return false;
      const allowedDistance = qToken.length > 5 ? 2 : 1;
      return getLevenshteinDistance(qToken, tToken) <= allowedDistance;
    });
  });
};

const parsePlanExercises = (exs: any[]): CustomExerciseConfig[] => {
  return (exs || []).map(ex => {
    if (typeof ex === 'string') {
      return { name: ex, sets: 4, rest: 90 };
    }
    return {
      name: ex.name || '',
      sets: parseInt(ex.sets as any) || 4,
      rest: parseInt(ex.rest as any) || 90
    };
  });
};

const ManagePlans = () => {
  const navigate = useNavigate();

  // Basic States
  const [userEmail, setUserEmail] = useState('');
  const [availablePlans, setAvailablePlans] = useState<string[]>(['PUSH', 'PULL', 'LEGS']);
  const [planToEdit, setPlanToEdit] = useState<string>('PUSH');
  const [customExercises, setCustomExercises] = useState<CustomExerciseConfig[]>([]);
  const [globalExercises, setGlobalExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Targets Input for Active Plan
  const [kcalInput, setKcalInput] = useState('2400');
  const [proteinInput, setProteinInput] = useState('160');
  const [carbsInput, setCarbsInput] = useState('240');
  const [fatInput, setFatInput] = useState('70');
  const [waterInput, setWaterInput] = useState('3.5');

  // Load general user data & dynamic plan types
  const loadUserPlans = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setUserEmail(session.user.email || '');

    const { data: plans } = await supabase
      .from('user_workout_plans')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (plans && plans.length > 0) {
      const sortedPlans = Array.from(new Set(plans.map(p => p.plan_type.toUpperCase())));
      setAvailablePlans(sortedPlans);
    } else if (plans && plans.length === 0) {
      // Database has no plans. Let's auto-seed the default three plans into the database so they are fully database-driven, deletable, and renameable!
      const defaultPlans = [
        {
          user_id: session.user.id,
          plan_type: 'PUSH',
          exercises: parsePlanExercises([
            'Incline DB Bench Press (45°)',
            'DB Shoulder Press (seated neutral)',
            'Incline DB Y-Raise (20-30°)',
            'Cable Chest Fly (low pulley)',
            'Overhead Cable Extension (rope)',
            'DB Lateral Raise (elbow-lead)'
          ]),
          targets: { kcal: 2400, protein: 160, carbs: 240, fat: 70, water: 3.5 }
        },
        {
          user_id: session.user.id,
          plan_type: 'PULL',
          exercises: parsePlanExercises([
            'Lat Pulldown (wide grip)',
            'Chest-Supported DB Row',
            'Sideways One-Arm Rear Delt Fly',
            'Face Pull (rope eye height)',
            'Incline DB Curl - Bayesian',
            'Zottman Curl'
          ]),
          targets: { kcal: 2400, protein: 160, carbs: 240, fat: 70, water: 3.5 }
        },
        {
          user_id: session.user.id,
          plan_type: 'LEGS',
          exercises: parsePlanExercises([
            'Leg Press (feet high for glutes)',
            'DB Romanian Deadlift',
            'DB Bulgarian Split Squat',
            'Seated Leg Curl',
            '45° Back Extension (BW/DB)',
            'Standing Calf Raise'
          ]),
          targets: { kcal: 2400, protein: 160, carbs: 240, fat: 70, water: 3.5 }
        }
      ];

      await supabase.from('user_workout_plans').insert(defaultPlans);
      setAvailablePlans(['PUSH', 'PULL', 'LEGS']);
    }
  };

  useEffect(() => {
    loadUserPlans();
    
    // Fetch global exercise list once
    const loadGlobalExercises = async () => {
      const { data: globalExs } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      const dbExs = globalExs || [];
      const dbNames = dbExs.map((e: any) => e.name.toLowerCase());
      
      const filteredLocal = LOCAL_EXERCISES_DICTIONARY.filter(
        (localEx) => !dbNames.includes(localEx.name.toLowerCase())
      );
      
      setGlobalExercises([...dbExs, ...filteredLocal].sort((a, b) => a.name.localeCompare(b.name)));
    };

    loadGlobalExercises();
  }, []);

  // Fetch plan details (exercises and targets) when selected tab changes
  useEffect(() => {
    const loadPlanDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const planMap: Record<string, string[]> = {
        PUSH: [
          'Incline DB Bench Press (45°)',
          'DB Shoulder Press (seated neutral)',
          'Incline DB Y-Raise (20-30°)',
          'Cable Chest Fly (low pulley)',
          'Overhead Cable Extension (rope)',
          'DB Lateral Raise (elbow-lead)'
        ],
        PULL: [
          'Lat Pulldown (wide grip)',
          'Chest-Supported DB Row',
          'Sideways One-Arm Rear Delt Fly',
          'Face Pull (rope eye height)',
          'Incline DB Curl - Bayesian',
          'Zottman Curl'
        ],
        LEGS: [
          'Leg Press (feet high for glutes)',
          'DB Romanian Deadlift',
          'DB Bulgarian Split Squat',
          'Seated Leg Curl',
          '45° Back Extension (BW/DB)',
          'Standing Calf Raise'
        ]
      };

      const { data: customPlan } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('plan_type', planToEdit)
        .maybeSingle();

      if (customPlan) {
        setCustomExercises(parsePlanExercises(customPlan.exercises));
        // Load plan specific macro targets if they exist, otherwise fallback to defaults
        const targets = customPlan.targets || {};
        setKcalInput(targets.kcal?.toString() || '2400');
        setProteinInput(targets.protein?.toString() || '160');
        setCarbsInput(targets.carbs?.toString() || '240');
        setFatInput(targets.fat?.toString() || '70');
        setWaterInput(targets.water?.toString() || '3.5');
      } else {
        setCustomExercises(parsePlanExercises(planMap[planToEdit] || []));
        setKcalInput('2400');
        setProteinInput('160');
        setCarbsInput('240');
        setFatInput('70');
        setWaterInput('3.5');
      }
    };

    loadPlanDetails();
  }, [planToEdit]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const kcalVal = parseInt(kcalInput) || 2400;
      const proteinVal = parseInt(proteinInput) || 160;
      const carbsVal = parseInt(carbsInput) || 240;
      const fatVal = parseInt(fatInput) || 70;
      const waterVal = parseFloat(waterInput) || 3.5;

      const targetsJson = {
        kcal: kcalVal,
        protein: proteinVal,
        carbs: carbsVal,
        fat: fatVal,
        water: waterVal
      };

      const { data: existingPlan } = await supabase
        .from('user_workout_plans')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('plan_type', planToEdit)
        .maybeSingle();

      if (existingPlan) {
        await supabase
          .from('user_workout_plans')
          .update({ 
            exercises: customExercises,
            targets: targetsJson
          })
          .eq('id', existingPlan.id);
      } else {
        await supabase
          .from('user_workout_plans')
          .insert({
            user_id: session.user.id,
            plan_type: planToEdit,
            exercises: customExercises,
            targets: targetsJson
          });
      }

      // Broadcast events so TodayView updates instantly
      window.dispatchEvent(new CustomEvent('plan_updated'));
      window.dispatchEvent(new CustomEvent('schedule_updated'));
      
      alert(`Plan ${planToEdit} saved successfully!`);
      loadUserPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to save program changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    const confirmMsg = `Are you sure you want to delete the program day "${planToEdit}" entirely?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', session.user.id)
        .eq('plan_type', planToEdit);

      const remainingPlans = availablePlans.filter(p => p !== planToEdit);
      const nextPlan = remainingPlans.length > 0 ? remainingPlans[0] : 'PUSH';

      // Clean up references in postgres user schedule
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id);

      if (schedules) {
        for (const schedule of schedules) {
          if (schedule.days) {
            let updated = false;
            const newDays = { ...schedule.days };
            for (const [dateStr, val] of Object.entries(newDays)) {
              if (val === planToEdit) {
                newDays[dateStr] = nextPlan;
                updated = true;
              }
            }
            if (updated) {
              await supabase
                .from('schedules')
                .update({ days: newDays })
                .eq('id', schedule.id);
            }
          }
        }
      }

      // Broadcast events so the dashboard updates
      window.dispatchEvent(new CustomEvent('plan_updated'));
      window.dispatchEvent(new CustomEvent('schedule_updated'));

      alert(`Successfully deleted plan day "${planToEdit}"`);
      setPlanToEdit(nextPlan);
      await loadUserPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to delete day program');
    }
  };

  const handleRenamePlan = async () => {
    const oldName = planToEdit;
    const newName = window.prompt(`Rename "${oldName}" day type to:`);
    if (!newName) return;
    
    const formattedName = newName.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    if (formattedName.length < 2) {
      alert("Name is too short!");
      return;
    }
    if (formattedName === oldName) return;
    if (availablePlans.includes(formattedName)) {
      alert("This day type already exists!");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Update the user_workout_plans row
      const { data: existingPlan } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('plan_type', oldName)
        .maybeSingle();

      if (existingPlan) {
        await supabase
          .from('user_workout_plans')
          .update({ plan_type: formattedName })
          .eq('id', existingPlan.id);
      } else {
        const kcalVal = parseInt(kcalInput) || 2400;
        const proteinVal = parseInt(proteinInput) || 160;
        const carbsVal = parseInt(carbsInput) || 240;
        const fatVal = parseInt(fatInput) || 70;
        const waterVal = parseFloat(waterInput) || 3.5;

        await supabase
          .from('user_workout_plans')
          .insert({
            user_id: session.user.id,
            plan_type: formattedName,
            exercises: customExercises,
            targets: { kcal: kcalVal, protein: proteinVal, carbs: carbsVal, fat: fatVal, water: waterVal }
          });
      }

      // 2. Update references in postgres user schedule
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id);

      if (schedules) {
        for (const schedule of schedules) {
          if (schedule.days) {
            let updated = false;
            const newDays = { ...schedule.days };
            for (const [dateStr, val] of Object.entries(newDays)) {
              if (val === oldName) {
                newDays[dateStr] = formattedName;
                updated = true;
              }
            }
            if (updated) {
              await supabase
                .from('schedules')
                .update({ days: newDays })
                .eq('id', schedule.id);
            }
          }
        }
      }

      // Broadcast changes
      window.dispatchEvent(new CustomEvent('plan_updated'));
      window.dispatchEvent(new CustomEvent('schedule_updated'));

      alert(`Successfully renamed program from "${oldName}" to "${formattedName}"`);
      setPlanToEdit(formattedName);
      await loadUserPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to rename program day');
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 min-h-full bg-gradient-to-b from-black via-slate-950 to-black text-gray-100">
      
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>
        <div className="text-right">
          <h1 className="text-md font-black tracking-widest text-primary uppercase">Program Manager</h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{userEmail}</p>
        </div>
      </div>

      {/* Tabs list (Dynamic plan types) */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Select Program Day</span>
        <div className="flex flex-wrap gap-1.5 bg-white/5 rounded-2xl p-2 border border-white/5 shadow-inner">
          {availablePlans.map((t) => (
            <button
              key={t}
              onClick={() => setPlanToEdit(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
                planToEdit === t ? 'bg-primary text-black shadow-md shadow-primary/20 scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => {
              const newName = window.prompt("Enter the name of your custom training day (e.g. UPPER, LOWER, ARMS):");
              if (!newName) return;
              const formattedName = newName.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
              if (formattedName.length < 2) {
                alert("Name is too short!");
                return;
              }
              if (availablePlans.includes(formattedName)) {
                alert("This day type already exists!");
                return;
              }
              setAvailablePlans(prev => [...prev, formattedName]);
              setPlanToEdit(formattedName);
              setCustomExercises([]);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-wider cursor-pointer bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-800/30 flex items-center gap-1"
          >
            <Plus size={14} />
            Add Day
          </button>
        </div>
      </div>

      {/* Dynamic Macro & Water Targets for the active Day type */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
          <Utensils size={14} className="text-primary" />
          <span>Macro & Water Targets for {planToEdit}</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-3.5 bg-surface/30 p-4 border border-white/5 rounded-3xl shadow-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Calories (kcal)</label>
            <input 
              type="number" 
              value={kcalInput}
              onChange={(e) => setKcalInput(e.target.value)}
              className="bg-black/50 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Water Target (L)</label>
            <input 
              type="number" 
              step="0.1"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
              className="bg-black/50 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Protein (g)</label>
            <input 
              type="number" 
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              className="bg-black/50 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Carbs (g)</label>
            <input 
              type="number" 
              value={carbsInput}
              onChange={(e) => setCarbsInput(e.target.value)}
              className="bg-black/50 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
            />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Fat (g)</label>
            <input 
              type="number" 
              value={fatInput}
              onChange={(e) => setFatInput(e.target.value)}
              className="bg-black/50 border border-white/5 focus:border-primary/50 text-white rounded-xl px-3 py-2.5 text-xs outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* Gym Program Exercises customizer */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          <span>Active Exercises ({customExercises.length})</span>
        </h3>

        <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
          {customExercises.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
              No exercises added to {planToEdit} yet. Add some below!
            </div>
          ) : (
            customExercises.map((ex, idx) => {
              const cleanName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const dbEx = globalExercises.find(ge => ge.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName);
              const muscle = dbEx?.muscle_group || 'All Muscles';
              const equip = dbEx?.equipment || 'Gym';
              const imgUrl = dbEx?.image;
              
              return (
                <div 
                  key={idx} 
                  className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3 shadow-md relative"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-3 w-full max-w-[85%]">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={ex.name}
                          className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center flex-shrink-0">
                          <Dumbbell size={14} className="text-gray-600" />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-black text-white truncate">{ex.name}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase tracking-wide">
                            {equip}
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase tracking-wide">
                            {muscle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomExercises(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-danger/60 hover:text-danger p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Sets & Rest Duration editors */}
                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-2 flex-wrap">
                    {/* Sets Stepper */}
                    <div className="flex items-center justify-between bg-black/40 rounded-xl px-2.5 py-1.5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Sets</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomExercises(prev => prev.map((e, i) => i === idx ? { ...e, sets: Math.max(1, e.sets - 1) } : e));
                          }}
                          className="w-4.5 h-4.5 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white cursor-pointer active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-white w-4 text-center">{ex.sets}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomExercises(prev => prev.map((e, i) => i === idx ? { ...e, sets: Math.min(8, e.sets + 1) } : e));
                          }}
                          className="w-4.5 h-4.5 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white cursor-pointer active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rest Stepper */}
                    <div className="flex items-center justify-between bg-black/40 rounded-xl px-2.5 py-1.5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Rest</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const currentIdx = [30, 45, 60, 90, 120, 150, 180].indexOf(ex.rest);
                            const prevVal = [30, 45, 60, 90, 120, 150, 180][Math.max(0, currentIdx - 1)];
                            setCustomExercises(prev => prev.map((e, i) => i === idx ? { ...e, rest: prevVal } : e));
                          }}
                          className="w-4.5 h-4.5 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white cursor-pointer active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-black text-white w-8 text-center">{ex.rest}s</span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentIdx = [30, 45, 60, 90, 120, 150, 180].indexOf(ex.rest);
                            const nextVal = [30, 45, 60, 90, 120, 150, 180][Math.min(6, currentIdx + 1)];
                            setCustomExercises(prev => prev.map((e, i) => i === idx ? { ...e, rest: nextVal } : e));
                          }}
                          className="w-4.5 h-4.5 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white cursor-pointer active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add New Exercise autocomplete lookup */}
      <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
          Add New Exercise
        </span>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/5 focus:border-primary/50 text-white rounded-2xl pl-10 pr-4 py-3 text-xs outline-none placeholder-gray-600 font-medium"
          />
        </div>

        {/* Display matched autocomplete results */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-black/80 border border-white/5 rounded-2xl max-h-[260px] overflow-y-auto no-scrollbar flex flex-col p-1.5 gap-1 shadow-2xl z-20">
            {globalExercises
              .filter(ex => 
                fuzzyMatch(ex.name, searchQuery) &&
                !customExercises.some(e => e.name === ex.name)
              )
              .slice(0, 12)
              .map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setCustomExercises(prev => [...prev, { name: ex.name, sets: 4, rest: 90 }]);
                    setSearchQuery('');
                  }}
                  className="flex justify-between items-center text-left text-xs font-semibold px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors cursor-pointer gap-2 w-full"
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    {ex.image ? (
                      <img
                        src={ex.image}
                        alt={ex.name}
                        className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={14} className="text-gray-600" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="line-clamp-1 truncate text-white">{ex.name}</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">
                        {ex.equipment} • {ex.muscle_group}
                      </span>
                    </div>
                  </div>
                  <Plus size={14} className="text-primary flex-shrink-0" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Save & Reset Panel Row */}
      <div className="flex flex-col gap-3 mt-4 border-t border-white/5 pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving...' : `Save ${planToEdit} Program`}
        </button>

        <button
          onClick={handleRenamePlan}
          className="w-full bg-amber-950/20 border border-amber-500/20 hover:bg-amber-800/30 text-amber-400 font-bold text-[10px] uppercase py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 tracking-widest active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          Rename {planToEdit} Day
        </button>

        <button
          onClick={handleDeletePlan}
          className="w-full bg-danger/10 hover:bg-danger/25 border border-danger/25 text-danger font-bold text-[10px] uppercase py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 tracking-widest active:scale-95"
        >
          <Trash2 size={13} />
          Delete {planToEdit} Day entirely
        </button>
      </div>

    </div>
  );
};

export default ManagePlans;
