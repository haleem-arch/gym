import { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, User, Dumbbell, Apple, Scale, 
  Check, Lock, Search, X, Activity, Ruler, ShieldCheck 
} from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  muscle_group: string;
  sets: number;
  rest: number;
}

interface SplitItem {
  key: string;
  label: string;
  emoji: string;
  color: string;
  desc: string;
  exercises: ExerciseItem[];
}

export default function AddClientPage() {
  const navigate = useNavigate();
  
  // Navigation states
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedData, setDeployedData] = useState({
    displayName: '',
    username: '',
    password: '',
    clientCode: 0
  });

  // Exercise catalog search
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSplitKey, setActiveSplitKey] = useState<string | null>(null);

  // CSV InBody Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [csvScans, setCsvScans] = useState<any[]>([]);

  // Step 1: Credentials & Identity
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    clientCode: '',
    age: '',
    height: '',
    experience_level: 'beginner',
    goals: '',
    injuries_notes: ''
  });
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Step 2: Training Program Splits
  const [splits, setSplits] = useState<SplitItem[]>([
    { 
      key: 'PUSH', 
      label: 'Push', 
      emoji: '🔴', 
      color: '#ef4444', 
      desc: 'Chest · Shoulders · Triceps',
      exercises: [
        { id: 'coach-push-0', name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'coach-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'coach-push-2', name: 'Incline DB Y-Raise (20-30°)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'coach-push-3', name: 'Cable Chest Fly (low pulley)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'coach-push-4', name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', sets: 3, rest: 120 },
        { id: 'coach-push-5', name: 'DB Lateral Raise (elbow-lead)', muscle_group: 'Shoulders', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'PULL', 
      label: 'Pull', 
      emoji: '🔵', 
      color: '#3b82f6', 
      desc: 'Back · Rear Delts · Biceps',
      exercises: [
        { id: 'coach-pull-0', name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'coach-pull-1', name: 'Chest-Supported DB Row', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'coach-pull-2', name: 'Sideways One-Arm Rear Delt Fly', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'coach-pull-3', name: 'Face Pull (rope eye height)', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'coach-pull-4', name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', sets: 3, rest: 120 },
        { id: 'coach-pull-5', name: 'Zottman Curl', muscle_group: 'Biceps', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'LEGS', 
      label: 'Legs', 
      emoji: '🟡', 
      color: '#eab308', 
      desc: 'Quads · Hams · Glutes · Calves',
      exercises: [
        { id: 'coach-legs-0', name: 'Leg Press (feet high for glutes)', muscle_group: 'Glutes', sets: 3, rest: 120 },
        { id: 'coach-legs-1', name: 'DB Romanian Deadlift', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'coach-legs-2', name: 'DB Bulgarian Split Squat', muscle_group: 'Quads', sets: 3, rest: 120 },
        { id: 'coach-legs-3', name: 'Seated Leg Curl', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'coach-legs-4', name: '45° Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'coach-legs-5', name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
      ]
    }
  ]);
  const [newSplitName, setNewSplitName] = useState('');

  // Step 3: Diet & Nutrition
  const [kcal, setKcal] = useState(2400);
  const [protein, setProtein] = useState(160);
  const [carbs, setCarbs] = useState(240);
  const [fat, setFat] = useState(70);

  const [restKcal, setRestKcal] = useState(2100);
  const [restProtein, setRestProtein] = useState(150);
  const [restCarbs, setRestCarbs] = useState(218);
  const [restFat, setRestFat] = useState(70);
  const [isRestOverridden, setIsRestOverridden] = useState(false);

  const [waterGoalLiters, setWaterGoalLiters] = useState(3.5);

  // Step 4: Biometrics & InBody composition
  const [weight, setWeight] = useState('');
  const [bfPercent, setBfPercent] = useState('');
  const [smm, setSmm] = useState('');
  const [bfm, setBfm] = useState('');
  const [inbodyScore, setInbodyScore] = useState(75);

  // Fetch full exercise catalog for catalog selection
  useEffect(() => {
    supabase.from('exercises').select('*').order('name').then(({ data }) => {
      if (data) setExerciseDb(data);
    });
  }, []);

  // Update rest day defaults
  useEffect(() => {
    if (!isRestOverridden) {
      const calculatedRestKcal = Math.max(1200, kcal - 300);
      const calculatedRestProtein = Math.max(80, protein - 10);
      const calculatedRestFat = fat;
      const calculatedRestCarbs = Math.max(50, Math.round((calculatedRestKcal - calculatedRestProtein * 4 - calculatedRestFat * 9) / 4));
      
      setRestKcal(calculatedRestKcal);
      setRestProtein(calculatedRestProtein);
      setRestFat(calculatedRestFat);
      setRestCarbs(calculatedRestCarbs);
    }
  }, [kcal, protein, fat, isRestOverridden]);

  // Recalculate Body Fat Mass
  useEffect(() => {
    const w = parseFloat(weight);
    const f = parseFloat(bfPercent);
    if (!isNaN(w) && !isNaN(f)) {
      setBfm(((w * f) / 100).toFixed(1));
      if (!smm) {
        setSmm(((w * (100 - f) * 0.55) / 100).toFixed(1));
      }
    } else {
      setBfm('');
    }
  }, [weight, bfPercent]);

  // CSV file parsing
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setIsImporting(false);
        return;
      }

      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        toast.error('Invalid CSV file or empty file.');
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedScans = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        if (row.length < 5) continue;

        const getValue = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? parseFloat(row[idx]) : 0;
        };
        
        const getString = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? row[idx] : '';
        };

        const dateRaw = getString('date');
        if (!dateRaw) continue;

        let dateStr = new Date().toISOString().split('T')[0];
        if (dateRaw.includes('-')) {
          dateStr = dateRaw.split(' ')[0];
        } else if (dateRaw.length >= 8) {
           dateStr = `${dateRaw.substring(0,4)}-${dateRaw.substring(4,6)}-${dateRaw.substring(6,8)}`;
        }

        const parsedWeight = getValue('weight(kg)') || getValue('weight') || 0;
        const parsedSmm = getValue('skeletal muscle mass') || getValue('muscle') || getValue('smm') || 0;
        const parsedBfm = getValue('body fat mass') || getValue('bfm') || 0;
        const parsedBfPercent = getValue('percent body fat') || getValue('body fat %') || getValue('bf%') || getValue('percent body fat(%)') || 0;
        const parsedBmr = getValue('basal metabolic rate') || getValue('bmr') || Math.round(10 * parsedWeight + 6.25 * 175 - 5 * 25 + 5);
        const parsedScore = getValue('inbody score') || getValue('score') || 75;

        const segmental = {
          visceralFat: getValue('visceral fat level') || 6,
          tbw: getValue('total body water') || Math.round(parsedWeight * 0.6),
          protein: getValue('protein') || Math.round(parsedWeight * 0.18),
          minerals: getValue('mineral') || Math.round(parsedWeight * 0.05),
          raLean: getValue('right arm lean') || Math.round(parsedWeight * 0.05),
          laLean: getValue('left arm lean') || Math.round(parsedWeight * 0.05),
          trunkLean: getValue('trunk lean') || Math.round(parsedWeight * 0.28),
          rlLean: getValue('right leg lean') || Math.round(parsedWeight * 0.12),
          llLean: getValue('left leg lean') || Math.round(parsedWeight * 0.12),
        };

        if (parsedWeight > 0) {
          parsedScans.push({
            date: dateStr,
            weight: parsedWeight,
            smm: parsedSmm,
            bfm: parsedBfm || ((parsedWeight * parsedBfPercent) / 100),
            bf_percent: parsedBfPercent || (parsedWeight > 0 ? (parsedBfm / parsedWeight) * 100 : 0),
            bmr: Math.round(parsedBmr),
            score: Math.round(parsedScore),
            segmental: segmental
          });
        }
      }

      if (parsedScans.length > 0) {
        parsedScans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setCsvScans(parsedScans);

        const latestScan = parsedScans[parsedScans.length - 1];
        setWeight(latestScan.weight ? latestScan.weight.toString() : '');
        setBfPercent(latestScan.bf_percent ? latestScan.bf_percent.toFixed(1) : '');
        setSmm(latestScan.smm ? latestScan.smm.toString() : '');
        setInbodyScore(latestScan.score || 75);
        setBfm(latestScan.bfm ? latestScan.bfm.toFixed(1) : '');

        toast.success(`Loaded ${parsedScans.length} scans from CSV!`);
      } else {
        toast.error("No valid InBody data found in CSV.");
      }

      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 2 split actions
  const addSplit = () => {
    const trimmed = newSplitName.trim();
    if (!trimmed) return;
    if (splits.some(s => s.key.toUpperCase() === trimmed.toUpperCase())) {
      toast.error('This split name already exists.');
      return;
    }
    const colorOptions = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#10b981', '#f97316', '#06b6d4'];
    const randomColor = colorOptions[splits.length % colorOptions.length];
    
    setSplits(prev => [
      ...prev,
      {
        key: trimmed.toUpperCase(),
        label: trimmed,
        emoji: '🏋️‍♂️',
        color: randomColor,
        desc: 'Custom split day targets',
        exercises: []
      }
    ]);
    setNewSplitName('');
    toast.success(`Split "${trimmed}" added!`);
  };

  const removeSplit = (key: string) => {
    if (splits.length <= 1) {
      toast.error('You must keep at least one training split.');
      return;
    }
    setSplits(prev => prev.filter(s => s.key !== key));
    if (activeSplitKey === key) setActiveSplitKey(null);
  };

  const removeExerciseFromSplit = (splitKey: string, exId: string) => {
    setSplits(prev => prev.map(s => {
      if (s.key === splitKey) {
        return {
          ...s,
          exercises: s.exercises.filter(ex => ex.id !== exId)
        };
      }
      return s;
    }));
  };

  const addExerciseToSplit = (splitKey: string, ex: any) => {
    setSplits(prev => prev.map(s => {
      if (s.key === splitKey) {
        if (s.exercises.some(e => e.name === ex.name)) {
          toast.error(`${ex.name} is already in this workout.`);
          return s;
        }
        return {
          ...s,
          exercises: [
            ...s.exercises,
            {
              id: ex.id || `coach-custom-${Date.now()}`,
              name: ex.name,
              muscle_group: ex.muscle_group || '',
              sets: 3,
              rest: 120
            }
          ]
        };
      }
      return s;
    }));
    toast.success(`Added ${ex.name}`);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.displayName.trim()) {
        toast.error('Full Name is required.');
        return;
      }
      if (!formData.username.trim()) {
        toast.error('Username is required.');
        return;
      }
      if (!formData.password.trim()) {
        toast.error('Password is required.');
        return;
      }
    }
    if (step < 4) {
      setDirection(1);
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user: coachUser } } = await supabase.auth.getUser();
      if (!coachUser) throw new Error('COACH AUTH REQUIRED');

      // Calculate next client code
      let nextClientCode = parseInt(formData.clientCode);
      
      if (isNaN(nextClientCode)) {
        // Fall back to auto-calculation if not provided
        const { data: existingProfiles } = await supabaseAdmin
          .from('profiles')
          .select('targets')
          .eq('role', 'client');
        
        nextClientCode = 101;
        if (existingProfiles && existingProfiles.length > 0) {
          const codes = existingProfiles
            .map(p => p.targets?.client_code)
            .filter(c => typeof c === 'number');
          if (codes.length > 0) {
            nextClientCode = Math.max(...codes) + 1;
          } else {
            nextClientCode = 101 + existingProfiles.length;
          }
        }
      } else {
        // Verify custom code is unique
        const { data: duplicateCheck } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('role', 'client')
          .eq('targets->>client_code', String(nextClientCode))
          .maybeSingle();

        if (duplicateCheck) {
          throw new Error(`Client Number #${nextClientCode} is already assigned to another user.`);
        }
      }

      const virtualEmail = `${formData.username.trim().toLowerCase()}@stride.fit`;

      // 1. Provision new Supabase Auth Client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: virtualEmail,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          display_name: formData.displayName,
          gender: gender
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to generate user account');

      const clientUserId = authData.user.id;

      // 2. Build profile targets JSONB
      const dayNutritionMap: Record<string, any> = {};
      dayNutritionMap['REST'] = { kcal: restKcal, protein: restProtein, carbs: restCarbs, fat: restFat };
      dayNutritionMap['RUN'] = { kcal: kcal + 200, protein, carbs: carbs + 50, fat };
      dayNutritionMap['RUN + GYM'] = { kcal: kcal + 400, protein: protein + 10, carbs: carbs + 70, fat: fat + 5 };

      splits.forEach(s => {
        dayNutritionMap[s.key] = { kcal, protein, carbs, fat };
      });

      const targets = {
        onboarding_completed: true,
        show_welcome_animation: true,
        water_goal_ml: Math.round(waterGoalLiters * 1000),
        day_nutrition: dayNutritionMap,
        gender: gender,
        kcal,
        protein,
        carbs,
        fat,
        client_code: nextClientCode
      };

      // 3. Insert public.profiles
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: clientUserId,
        username: formData.username.trim().toLowerCase(),
        email: virtualEmail,
        display_name: formData.displayName,
        role: 'client',
        coach_id: coachUser.id,
        targets: targets
      });

      if (profileError) throw profileError;

      // 4. Insert public.client_profiles
      const { error: clientProfileError } = await supabaseAdmin.from('client_profiles').insert({
        user_id: clientUserId,
        coach_id: coachUser.id,
        age: parseInt(formData.age) || null,
        height: parseFloat(formData.height) || null,
        experience_level: formData.experience_level,
        workouts_per_week: splits.length,
        goals: formData.goals || '',
        injuries_notes: formData.injuries_notes || '',
        generated_passcode: formData.password
      });

      if (clientProfileError) throw clientProfileError;

      // 5. Handle InBody Upload
      if (csvScans.length > 0) {
        const scansToInsert = csvScans.map(scan => ({
          ...scan,
          user_id: clientUserId
        }));
        await supabaseAdmin.from('inbody_scans').insert(scansToInsert);
      } else {
        const weightVal = parseFloat(weight);
        if (!isNaN(weightVal) && weightVal > 0) {
          const bfVal = parseFloat(bfPercent) || 0;
          const smmVal = parseFloat(smm) || 0;
          const bfmVal = parseFloat(bfm) || 0;

          await supabaseAdmin.from('inbody_scans').insert({
            user_id: clientUserId,
            date: new Date().toISOString().split('T')[0],
            weight: weightVal,
            smm: smmVal,
            bfm: bfmVal,
            bf_percent: bfVal,
            bmr: Math.round(10 * weightVal + 6.25 * (parseFloat(formData.height) || 175) - 5 * (parseInt(formData.age) || 25) + 5),
            score: inbodyScore,
            segmental: {
              visceralFat: 6,
              tbw: Math.round(weightVal * 0.6),
              protein: Math.round(weightVal * 0.18),
              minerals: Math.round(weightVal * 0.05),
              raLean: Math.round(weightVal * 0.05),
              laLean: Math.round(weightVal * 0.05),
              trunkLean: Math.round(weightVal * 0.28),
              rlLean: Math.round(weightVal * 0.12),
              llLean: Math.round(weightVal * 0.12)
            }
          });
        }
      }

      // 6. Save workout plans to user_workout_plans
      const planPromises = splits.map(split => {
        const exercisesPayload = split.exercises.map((ex, i) => ({
          id: ex.id || `coach-${split.key.toLowerCase()}-${i}`,
          name: ex.name,
          muscle_group: ex.muscle_group || '',
          sets: ex.sets || 3,
          rest: ex.rest || 120
        }));
        
        return supabaseAdmin
          .from('user_workout_plans')
          .upsert({
            user_id: clientUserId,
            plan_type: split.key,
            exercises: exercisesPayload
          }, { onConflict: 'user_id,plan_type' });
      });
      await Promise.all(planPromises);

      // 7. Save workout days to client_workout_days
      const dayPromises = splits.map((split, index) => {
        const exercisesPayload = split.exercises.map((ex, i) => ({
          id: ex.id || `coach-${split.key.toLowerCase()}-${i}`,
          name: ex.name,
          muscle_group: ex.muscle_group || '',
          sets: ex.sets || 3,
          rest: ex.rest || 120
        }));

        return supabaseAdmin
          .from('client_workout_days')
          .insert({
            user_id: clientUserId,
            day_number: index + 1,
            day_name: `${split.key} Day`,
            exercises: exercisesPayload
          });
      });
      await Promise.all(dayPromises);

      setDeployedData({
        displayName: formData.displayName,
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        clientCode: nextClientCode
      });
      setIsDeployed(true);
      toast.success(`Athlete deployed successfully! Handle: @${formData.username}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Deployment protocol failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { label: 'Identity', icon: <User size={14} /> },
    { label: 'Workouts', icon: <Dumbbell size={14} /> },
    { label: 'Diet', icon: <Apple size={14} /> },
    { label: 'InBody', icon: <Scale size={14} /> }
  ];

  const pageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  const filteredCatalog = exerciseDb.filter(ex => {
    if (!searchQuery) return false;
    return ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           ex.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 5);

  if (isDeployed) {
    return (
      <div className="w-full sm:max-w-[420px] mx-auto min-h-screen bg-[#060610] relative overflow-y-auto flex flex-col justify-center items-center text-gray-100 font-sans p-6 shadow-2xl sm:border-x sm:border-gray-800">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-sm bg-[#0d1220] border border-emerald-500/20 rounded-3xl p-6 text-center space-y-6 shadow-2xl relative">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={36} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Athlete Deployed!</h2>
            <p className="text-xs text-gray-400 mt-1">Pass credentials to the athlete to log in</p>
          </div>

          <div className="space-y-3 bg-[#131b2e] border border-gray-800 rounded-2xl p-4 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Client Code</span>
              <p className="font-mono text-sm text-emerald-400 font-black">#{deployedData.clientCode}</p>
            </div>
            <div className="border-t border-gray-800/60 my-2" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Display Name</span>
              <p className="text-sm text-white font-bold">{deployedData.displayName}</p>
            </div>
            <div className="border-t border-gray-800/60 my-2" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Username</span>
              <p className="font-mono text-sm text-white">{deployedData.username}</p>
            </div>
            <div className="border-t border-gray-800/60 my-2" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Password</span>
              <p className="font-mono text-sm text-blue-400 font-bold">{deployedData.password}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                const text = `Life Gym Access:\nClient Code: #${deployedData.clientCode}\nUsername: ${deployedData.username}\nPassword: ${deployedData.password}`;
                navigator.clipboard.writeText(text);
                toast.success('Credentials copied to clipboard!');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Copy Info
            </button>
            <button
              onClick={() => navigate('/coach/clients')}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-850 py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:max-w-[420px] mx-auto min-h-screen bg-[#060610] relative overflow-y-auto overflow-x-hidden shadow-2xl sm:border-x sm:border-gray-800 flex flex-col justify-between text-gray-100 font-sans pb-8 sm:pb-0">
      
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <div className="p-5 flex items-center gap-4 border-b border-gray-800 bg-[#060610]/80 backdrop-blur-md z-30 sticky top-0">
        <button onClick={() => navigate('/coach/clients')} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95">
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <div>
          <h1 className="font-extrabold text-sm uppercase tracking-wider">Deploy Athlete</h1>
          <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Tactical Setup wizard</p>
        </div>
      </div>

      {/* Stepper progress */}
      <div className="px-5 pt-5 pb-2 flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-800 z-0">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((step - 1) / (stepsInfo.length - 1)) * 100}%` }}
            />
          </div>

          {stepsInfo.map((info, idx) => {
            const isCompleted = step > idx + 1;
            const isActive = step === idx + 1;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 z-10 relative">
                <button
                  type="button"
                  onClick={() => {
                    setDirection(idx + 1 > step ? 1 : -1);
                    setStep(idx + 1);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                    isCompleted 
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : isActive 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] scale-110'
                        : 'bg-[#121620] border-gray-800 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : info.icon}
                </button>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard contents */}
      <div className="flex-1 relative min-h-[380px] flex flex-col justify-start px-5 py-4 overflow-visible z-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="w-full flex flex-col gap-5"
          >
            
            {/* STEP 1: IDENTITY & CREDENTIALS */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input 
                      type="text" required name="displayName" value={formData.displayName} onChange={handleInputChange}
                      placeholder="e.g. Ahmed Salem"
                      className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Username</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="text" required name="username" value={formData.username} onChange={handleInputChange}
                        placeholder="ahmed"
                        className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="text" required name="password" value={formData.password} onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Client Number (Optional)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input 
                      type="number" name="clientCode" value={formData.clientCode} onChange={handleInputChange}
                      placeholder="e.g. 112 (Leave blank to auto-generate)"
                      className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        gender === 'male'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                          : 'bg-[#121620]/60 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-xl">👨</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        gender === 'female'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                          : 'bg-[#121620]/60 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-xl">👩</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Female</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Age</label>
                    <div className="relative">
                      <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="number" name="age" value={formData.age} onChange={handleInputChange}
                        placeholder="Years"
                        className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="number" name="height" value={formData.height} onChange={handleInputChange}
                        placeholder="cm"
                        className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Experience level</label>
                    <select 
                      name="experience_level" 
                      value={formData.experience_level} 
                      onChange={handleInputChange} 
                      className="bg-[#121620]/60 border border-gray-800 rounded-xl px-4 py-3 font-semibold text-xs text-white uppercase outline-none focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="beginner" className="bg-[#0b0e14]">Beginner</option>
                      <option value="intermediate" className="bg-[#0b0e14]">Intermediate</option>
                      <option value="advanced" className="bg-[#0b0e14]">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Strategic Objectives</label>
                  <textarea 
                    name="goals" 
                    value={formData.goals} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#121620]/60 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors min-h-[70px]" 
                    placeholder="Describe athlete objectives..." 
                  />
                </div>
              </div>
            )}

            {/* STEP 2: WORKOUT SPLITS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Training splits</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Customize daily templates and initial exercises</p>
                </div>

                <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1 no-scrollbar">
                  {splits.map((item) => {
                    const isExpanded = activeSplitKey === item.key;
                    return (
                      <div 
                        key={item.key}
                        className="bg-[#121620]/60 border border-gray-800 rounded-2xl overflow-hidden transition-all flex flex-col shadow-md"
                        style={{ borderLeft: `4px solid ${item.color}` }}
                      >
                        <div 
                          onClick={() => setActiveSplitKey(isExpanded ? null : item.key)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.emoji}</span>
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wider">{item.label} Day Plan</p>
                              <p className="text-[10px] text-gray-400 font-semibold">{item.exercises.length} exercises configured</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeSplit(item.key); }} 
                              className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Split"
                            >
                              <Trash2 size={14} />
                            </button>
                            <span className="text-[9px] text-gray-400 font-bold bg-gray-900 border border-gray-850 px-2 py-1 rounded-full uppercase">
                              {isExpanded ? 'Close' : 'Configure'}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-850 bg-black/20"
                            >
                              <div className="p-3 space-y-3">
                                {item.exercises.length === 0 ? (
                                  <p className="text-[10px] text-gray-500 italic text-center py-2">No exercises yet. Search below to add.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {item.exercises.map((ex, idx) => (
                                      <div key={ex.id} className="flex justify-between items-center bg-gray-900/60 p-2.5 rounded-xl border border-gray-850">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-[9px] font-extrabold text-blue-400 bg-blue-950/30 border border-blue-900/30 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                            {idx + 1}
                                          </span>
                                          <div className="min-w-0">
                                            <span className="text-xs text-gray-200 font-semibold truncate block">{ex.name}</span>
                                            {ex.muscle_group && <span className="text-[9px] text-gray-500">{ex.muscle_group}</span>}
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => removeExerciseFromSplit(item.key, ex.id)}
                                          className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 ml-2"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="border-t border-gray-850 pt-2 relative">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                                    <input 
                                      value={searchQuery}
                                      onChange={e => setSearchQuery(e.target.value)}
                                      placeholder="Search and add exercises..."
                                      className="w-full bg-[#0d1117] border border-gray-850 rounded-xl py-2 pl-9 pr-9 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                    {searchQuery && (
                                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1">
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>

                                  {searchQuery && (
                                    <div className="mt-1 bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col max-h-[140px] overflow-y-auto">
                                      {filteredCatalog.length === 0 ? (
                                        <span className="p-2.5 text-[10px] text-gray-500 italic text-center">No exercises found</span>
                                      ) : (
                                        filteredCatalog.map(ex => (
                                          <button
                                            key={ex.id}
                                            onClick={() => {
                                              addExerciseToSplit(item.key, ex);
                                              setSearchQuery('');
                                            }}
                                            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between border-b border-gray-850/60 transition-colors active:bg-blue-700"
                                          >
                                            <span className="font-semibold truncate">{ex.name}</span>
                                            <span className="text-[8px] font-bold uppercase bg-gray-800 border border-gray-700 text-gray-400 px-1.5 py-0.5 rounded shrink-0 ml-2">{ex.muscle_group}</span>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 border-t border-gray-850 pt-3">
                  <input 
                    value={newSplitName}
                    onChange={e => setNewSplitName(e.target.value)}
                    placeholder="New dynamic day split (e.g. Arms)..." 
                    className="flex-1 bg-[#121620]/60 border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                    onKeyDown={e => { if (e.key === 'Enter') addSplit(); }}
                  />
                  <button 
                    onClick={addSplit}
                    className="px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Plus size={12} /> Add Split
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DIET & NUTRITION */}
            {step === 3 && (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1 py-1">
                <div className="bg-[#121620]/60 border border-blue-900/20 p-4 rounded-2xl space-y-3 relative shadow-xl">
                  <div className="absolute top-3 right-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
                    Gym Days
                  </div>
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">🔥 Daily Baseline Targets</h3>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Calories (kcal)</label>
                      <input 
                        type="number" value={kcal} onChange={e => setKcal(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Protein (g)</label>
                      <input 
                        type="number" value={protein} onChange={e => setProtein(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Carbs (g)</label>
                      <input 
                        type="number" value={carbs} onChange={e => setCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Fat (g)</label>
                      <input 
                        type="number" value={fat} onChange={e => setFat(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#121620]/60 border border-gray-850 p-4 rounded-2xl space-y-3 relative shadow-xl">
                  <div className="absolute top-3 right-3 bg-gray-850 text-gray-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
                    Rest Days
                  </div>
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">🛌 Rest Targets</h3>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Calories (kcal)</label>
                      <input 
                        type="number" value={restKcal} 
                        onChange={e => {
                          setRestKcal(Math.max(0, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Protein (g)</label>
                      <input 
                        type="number" value={restProtein} 
                        onChange={e => {
                          setRestProtein(Math.max(0, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Carbs (g)</label>
                      <input 
                        type="number" value={restCarbs} 
                        onChange={e => {
                          setRestCarbs(Math.max(0, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Fat (g)</label>
                      <input 
                        type="number" value={restFat} 
                        onChange={e => {
                          setRestFat(Math.max(0, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2 text-sm text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#121620]/60 border border-blue-900/10 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">Daily Hydration</h3>
                      <p className="text-[9px] text-gray-500 mt-0.5">Target daily water intake</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setWaterGoalLiters(prev => Math.max(1, parseFloat((prev - 0.25).toFixed(2))))}
                      className="w-7 h-7 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-blue-400 min-w-[50px] text-center">
                      {waterGoalLiters.toFixed(2)}L
                    </span>
                    <button 
                      type="button"
                      onClick={() => setWaterGoalLiters(prev => Math.min(10, parseFloat((prev + 0.25).toFixed(2))))}
                      className="w-7 h-7 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: INITIAL BIOMETRICS */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Body composition</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Initial metrics uploader or CSV scanner</p>
                </div>

                <div className="bg-[#121620]/60 border border-dashed border-blue-500/30 hover:border-blue-500 p-4 rounded-2xl text-center space-y-1.5 cursor-pointer transition-all relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    ref={fileInputRef} 
                    onChange={handleCSVUpload} 
                  />
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📊</span>
                    <p className="text-xs font-bold text-blue-400 group-hover:text-blue-300">
                      {isImporting ? 'Scanning CSV...' : 'Import from InBody CSV'}
                    </p>
                    <p className="text-[8px] text-gray-500 mt-1 max-w-[220px]">
                      Upload the InBody CSV file to auto-populate fields and sync their entire composition logs.
                    </p>
                  </div>
                </div>

                <div className="bg-[#121620]/60 border border-gray-800 p-4 rounded-2xl space-y-3.5 shadow-xl">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weight (kg)</label>
                      <input 
                        type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)}
                        placeholder="78.5"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Body Fat %</label>
                      <input 
                        type="number" step="any" value={bfPercent} onChange={e => setBfPercent(e.target.value)}
                        placeholder="15.2"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Muscle (SMM kg)</label>
                      <input 
                        type="number" step="any" value={smm} onChange={e => setSmm(e.target.value)}
                        placeholder="35.8"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">InBody Score</label>
                      <input 
                        type="number" value={inbodyScore} onChange={e => setInbodyScore(parseInt(e.target.value) || 0)}
                        placeholder="75"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  {bfm && (
                    <div className="bg-[#181d29] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 font-semibold">Body Fat Mass (estimated)</span>
                      <span className="text-blue-400 font-black">{bfm} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepper controls */}
      <div className="p-5 border-t border-gray-850 bg-[#0a0a0f] flex items-center justify-between gap-3 z-30 sticky bottom-0">
        {step > 1 && (
          <button 
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-900/50 text-gray-300 font-bold text-xs active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}

        <button 
          onClick={handleNext}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs active:scale-95 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer uppercase tracking-widest border border-white/5 disabled:opacity-50"
        >
          {loading ? (
            'PROVISIONING...'
          ) : step === 4 ? (
            <>Deploy Athlete <Check size={14} strokeWidth={2.5} /></>
          ) : (
            <>Next Step <ChevronRight size={14} /></>
          )}
        </button>
      </div>

    </div>
  );
}
