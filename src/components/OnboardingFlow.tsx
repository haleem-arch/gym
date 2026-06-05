import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  User, Lock, Dumbbell, Apple, Check, 
  ChevronLeft, ChevronRight, Plus, Trash2, 
  Scale, LogOut, ArrowRight, Eye, EyeOff, Search, X,
  Users, UserPlus, Settings, CreditCard, ShieldCheck, AlertTriangle, Key, Save, Phone, RefreshCw, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SplashOverlay } from './SplashOverlay';
import LegalModal from './LegalModals';

interface OnboardingFlowProps {
  initialStep?: number;
  onSessionConfigured?: (session: any) => void;
  onComplete?: () => void;
}

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

// Custom brand dumbbell logo component matching icon.svg / OpeningAnimation.tsx
const BrandLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 512 512" className="w-full h-full" style={{ imageRendering: 'crisp-edges' }}>
      <g transform="translate(256 256) rotate(-45)">
        {/* Rod */}
        <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />
        {/* Left weights */}
        <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
        <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
        <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
        {/* Right weights */}
        <rect x="80" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
        <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
        <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
      </g>
    </svg>
  </div>
);

// Custom login morphing logo component — simple expand on error, brand colors always
const LoginLogo = ({ className = "w-20 h-20", errorMsg = null }: { className?: string, errorMsg?: string | null }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Spring-expands wider on error */}
      <motion.div
        animate={{
          width: errorMsg ? 260 : 80,
          height: 72,
          borderRadius: errorMsg ? '18px' : '20px',
          backgroundColor: errorMsg ? 'rgba(10, 12, 20, 0.85)' : 'transparent',
          borderWidth: errorMsg ? 1 : 0,
          borderColor: errorMsg ? 'rgba(59,130,246,0.35)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ borderStyle: 'solid' }}
      >
        {/* Dumbbell — always brand colours, fixed -45deg */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          shapeRendering="geometricPrecision"
          style={{ width: 72, height: 72, flexShrink: 0 }}
          className="relative z-10 p-3 overflow-visible"
        >
          <g transform="translate(256 256) rotate(-45)">
            <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#1f2937" />
            <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
            <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
            <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
            <rect x="80" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
            <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
            <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
          </g>
        </svg>

        {/* Error text slides in beside the dumbbell */}
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: errorMsg ? 1 : 0, x: errorMsg ? 0 : -6 }}
          transition={{ duration: 0.28, delay: errorMsg ? 0.12 : 0 }}
          className="flex flex-col justify-center pr-4 leading-tight"
          style={{ pointerEvents: 'none' }}
        >
          <span className="text-[10px] font-black tracking-widest uppercase text-red-400 whitespace-nowrap">Wrong username</span>
          <span className="text-[10px] font-black tracking-widest uppercase text-red-400 whitespace-nowrap">or password</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function OnboardingFlow({ 
  initialStep = 1, 
  onSessionConfigured, 
  onComplete 
}: OnboardingFlowProps) {
  // Navigation states
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [showSplash, setShowSplash] = useState(false);
  const [loading, setLoading] = useState(false);

  // CSV InBody Import refs & states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [csvScans, setCsvScans] = useState<any[]>([]);

  // Active user session state (Step 1 -> 2 transition)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Step 1: Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<'athlete' | 'coach'>(() => {
    if (window.innerWidth >= 768) return 'coach';
    return window.location.pathname.startsWith('/coach-portal') ? 'coach' : 'athlete';
  });
  const [showCoachGuide, setShowCoachGuide] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  // Flying Arrow States & Refs
  const [showArrow, setShowArrow] = useState(false);
  const [arrowPoints, setArrowPoints] = useState<{
    startX: number;
    startY: number;
    controlX: number;
    controlY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const privacyContainerRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  // Automatically fade out the flying arrow when legal terms are accepted
  useEffect(() => {
    if (legalAccepted) {
      setShowArrow(false);
    }
  }, [legalAccepted]);

  const triggerPrivacyArrow = () => {
    setShowArrow(false);
    setTimeout(() => {
      const btnEl = loginButtonRef.current;
      const cbEl = privacyContainerRef.current;
      const cardEl = cardRef.current;
      if (btnEl && cbEl && cardEl) {
        const btnRect = btnEl.getBoundingClientRect();
        const cbRect = cbEl.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        // Start: bottom-center of login button
        const startX = btnRect.left - cardRect.left + btnRect.width / 2;
        const startY = btnRect.bottom - cardRect.top;

        // End: left edge of the checkbox
        const endX = cbRect.left - cardRect.left + 8;
        const endY = cbRect.top - cardRect.top + cbRect.height / 2;

        // Loop around the button: go down-right from bottom of button,
        // swing wide to the right, then come back up to the checkbox.
        // Cubic bezier with two control points.
        const controlX = btnRect.right - cardRect.left + 80;  // far right of button
        const controlY = startY + 60;                          // below button

        setArrowPoints({ startX, startY, controlX, controlY, endX, endY });
        setShowArrow(true);
      }
    }, 40);
  };

  // Step 2: Workouts split states with embedded baseline exercises
  const [splits, setSplits] = useState<SplitItem[]>([
    { 
      key: 'PUSH', 
      label: 'Push', 
      emoji: '🔴', 
      color: '#ef4444', 
      desc: 'Chest · Shoulders · Triceps',
      exercises: [
        { id: 'onb-push-0', name: 'Incline DB Bench Press (45°)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'onb-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'onb-push-2', name: 'Incline DB Y-Raise (20-30°)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'onb-push-3', name: 'Cable Chest Fly (low pulley)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'onb-push-4', name: 'Overhead Cable Extension (rope)', muscle_group: 'Triceps', sets: 3, rest: 120 },
        { id: 'onb-push-5', name: 'DB Lateral Raise (elbow-lead)', muscle_group: 'Shoulders', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'PULL', 
      label: 'Pull', 
      emoji: '🔵', 
      color: '#3b82f6', 
      desc: 'Back · Rear Delts · Biceps',
      exercises: [
        { id: 'onb-pull-0', name: 'Lat Pulldown (wide grip)', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'onb-pull-1', name: 'Chest-Supported DB Row', muscle_group: 'Back', sets: 3, rest: 120 },
        { id: 'onb-pull-2', name: 'Sideways One-Arm Rear Delt Fly', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'onb-pull-3', name: 'Face Pull (rope eye height)', muscle_group: 'Rear Delts', sets: 3, rest: 120 },
        { id: 'onb-pull-4', name: 'Incline DB Curl - Bayesian', muscle_group: 'Biceps', sets: 3, rest: 120 },
        { id: 'onb-pull-5', name: 'Zottman Curl', muscle_group: 'Biceps', sets: 3, rest: 120 }
      ]
    },
    { 
      key: 'LEGS', 
      label: 'Legs', 
      emoji: '🟡', 
      color: '#eab308', 
      desc: 'Quads · Hams · Glutes · Calves',
      exercises: [
        { id: 'onb-legs-0', name: 'Leg Press (feet high for glutes)', muscle_group: 'Glutes', sets: 3, rest: 120 },
        { id: 'onb-legs-1', name: 'DB Romanian Deadlift', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'onb-legs-2', name: 'DB Bulgarian Split Squat', muscle_group: 'Quads', sets: 3, rest: 120 },
        { id: 'onb-legs-3', name: 'Seated Leg Curl', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'onb-legs-4', name: '45° Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
        { id: 'onb-legs-5', name: 'Standing Calf Raise', muscle_group: 'Calves', sets: 3, rest: 120 }
      ]
    }
  ]);
  const [newSplitName, setNewSplitName] = useState('');
  
  // Exercise catalog search & edit state
  const [exerciseDb, setExerciseDb] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSplitKey, setActiveSplitKey] = useState<string | null>(null);

  // Step 3: Diet / targets states
  const [kcal, setKcal] = useState(2400);
  const [protein, setProtein] = useState(160);
  const [carbs, setCarbs] = useState(240);
  const [fat, setFat] = useState(70);

  // Rest day targets (auto calculated as normal - 300, protein/fat close, carbs down)
  const [restKcal, setRestKcal] = useState(2100);
  const [restProtein, setRestProtein] = useState(150);
  const [restFat, setRestFat] = useState(70);
  const [restCarbs, setRestCarbs] = useState(218);
  const [isRestOverridden, setIsRestOverridden] = useState(false);

  // Hydration state
  const [waterGoalLiters, setWaterGoalLiters] = useState(3.5);

  // Step 4: InBody Composition states
  const [weight, setWeight] = useState('');
  const [bfPercent, setBfPercent] = useState('');
  const [smm, setSmm] = useState('');
  const [bfm, setBfm] = useState('');
  const [inbodyScore, setInbodyScore] = useState(75);

  // Listen for user changes or session config
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        if (step === 1) {
          // If already logged in, advance to Step 2
          setStep(2);
        }
      }
    };
    fetchUser();
  }, [step]);

  // Fetch full exercise catalog for catalog selection in workouts Step 2
  useEffect(() => {
    const fetchExercises = async () => {
      const { data } = await supabase.from('exercises').select('*').order('name');
      if (data) setExerciseDb(data);
    };
    fetchExercises();
  }, []);

  // Handle baseline macros updating rest day defaults
  useEffect(() => {
    if (!isRestOverridden) {
      const calculatedRestKcal = Math.max(1200, kcal - 300);
      const calculatedRestProtein = Math.max(80, protein - 10);
      const calculatedRestFat = fat;
      // Carbs = (Kcal - Protein * 4 - Fat * 9) / 4
      const calculatedRestCarbs = Math.max(50, Math.round((calculatedRestKcal - calculatedRestProtein * 4 - calculatedRestFat * 9) / 4));
      
      setRestKcal(calculatedRestKcal);
      setRestProtein(calculatedRestProtein);
      setRestFat(calculatedRestFat);
      setRestCarbs(calculatedRestCarbs);
    }
  }, [kcal, protein, fat, isRestOverridden]);

  // Recalculate Body Fat Mass (bfm) when weight or bfPercent changes
  useEffect(() => {
    const w = parseFloat(weight);
    const f = parseFloat(bfPercent);
    if (!isNaN(w) && !isNaN(f)) {
      setBfm(((w * f) / 100).toFixed(1));
      // Auto-estimate Skeletal Muscle Mass if blank
      if (!smm) {
        setSmm(((w * (100 - f) * 0.55) / 100).toFixed(1));
      }
    } else {
      setBfm('');
    }
  }, [weight, bfPercent]);

  // Handle CSV file upload & parsing
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

      // Simple CSV split
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        toast.error('Invalid CSV file or empty file.');
        setIsImporting(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedScans = [];

      // Parse rows
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        if (row.length < 5) continue; // Skip malformed rows

        const getValue = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? parseFloat(row[idx]) : 0;
        };
        
        const getString = (keyContains: string) => {
          const idx = headers.findIndex(h => h.includes(keyContains.toLowerCase()));
          return idx !== -1 ? row[idx] : '';
        };

        const dateRaw = getString('date'); // format: 20260506155832 or YYYY-MM-DD
        if (!dateRaw) continue;

        let dateStr = new Date().toISOString().split('T')[0];
        if (dateRaw.includes('-')) {
          dateStr = dateRaw.split(' ')[0]; // take just the date part if it has timestamp
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
        // Sort scans chronologically by date
        parsedScans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Save the parsed scans
        setCsvScans(parsedScans);

        // Find the latest scan to auto-fill the onboarding inputs!
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

  // Navigation handlers
  const handleNext = () => {
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

  const handleSkip = () => {
    if (step < 4) {
      setDirection(1);
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // Sign In handler — goes directly to the app, no onboarding
  const handleSignInAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalAccepted) {
      toast.error('You must agree to the Terms of Service and Privacy Policy to proceed.');
      triggerPrivacyArrow();
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const finalEmail = email.includes('@') ? email : `${email.trim().toLowerCase()}@stride.fit`;
      const { data, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
      if (error) throw error;
      if (data.session) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();

        const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

        if (loginRole === 'coach') {
          if (profileErr || (profile?.role !== 'coach' && data.session.user.id !== OWNER_ID)) {
            await supabase.auth.signOut();
            throw new Error('Access Denied. Only coaches can log in on this page.');
          }
          localStorage.removeItem('is_new_signup');
          toast.success('Welcome back, Coach!');
          onSessionConfigured?.(data.session);
          if (!window.location.pathname.startsWith('/coach-portal')) {
            window.location.href = '/coach-portal';
          }
        } else {
          localStorage.removeItem('is_new_signup');
          toast.success('Welcome back!');
          onSessionConfigured?.(data.session);
          if (window.location.pathname.startsWith('/coach-portal')) {
            window.location.href = '/';
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Sign in failed.');
      toast.error(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };



  // Log out action
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    onSessionConfigured?.(null);
    localStorage.removeItem('is_new_signup');
    setStep(1);
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

  // Exercises customization within splits
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
              id: ex.id || `onb-custom-${Date.now()}`,
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

  // Submit onboarding details
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || currentUser;
      if (!user) {
        toast.error('No active session. Please sign up first.');
        setStep(1);
        setLoading(false);
        return;
      }

      // 1. Save customized workout plans and dynamic exercises to user_workout_plans
      const planPromises = splits.map(split => {
        const exercisesPayload = split.exercises.map((ex, i) => ({
          id: ex.id || `onboarding-${split.key.toLowerCase()}-${i}`,
          name: ex.name,
          muscle_group: ex.muscle_group || '',
          sets: ex.sets || 3,
          rest: ex.rest || 120
        }));
        
        return supabase
          .from('user_workout_plans')
          .upsert({
            user_id: user.id,
            plan_type: split.key,
            exercises: exercisesPayload
          }, { onConflict: 'user_id,plan_type' });
      });
      await Promise.all(planPromises);

      // 2. Build and save target profile (day_nutrition, water, onboarding complete)
      const dayNutritionMap: Record<string, any> = {};
      
      // Fixed day targets
      dayNutritionMap['REST'] = { kcal: restKcal, protein: restProtein, carbs: restCarbs, fat: restFat };
      dayNutritionMap['RUN'] = { kcal: kcal + 200, protein: protein, carbs: carbs + 50, fat: fat };
      dayNutritionMap['RUN + GYM'] = { kcal: kcal + 400, protein: protein + 10, carbs: carbs + 70, fat: fat + 5 };

      // Set all user splits to normal baseline
      splits.forEach(s => {
        dayNutritionMap[s.key] = { kcal: kcal, protein: protein, carbs: carbs, fat: fat };
      });

      const updatedTargets = {
        onboarding_completed: true,
        water_goal_ml: Math.round(waterGoalLiters * 1000),
        day_nutrition: dayNutritionMap,
        // Carry forward defaults
        kcal, protein, carbs, fat
      };

      await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', user.id);

      // 3. Save initial InBody composition scan(s)
      if (csvScans.length > 0) {
        const scansToInsert = csvScans.map(scan => ({
          ...scan,
          user_id: user.id
        }));
        const { error } = await supabase.from('inbody_scans').insert(scansToInsert);
        if (error) {
          console.error("Error bulk inserting InBody scans from CSV:", error);
          toast.error("Failed to save some InBody scans from CSV, but proceeding.");
        }
      } else {
        const weightVal = parseFloat(weight);
        if (!isNaN(weightVal) && weightVal > 0) {
          const bfVal = parseFloat(bfPercent) || 0;
          const smmVal = parseFloat(smm) || 0;
          const bfmVal = parseFloat(bfm) || 0;

          await supabase.from('inbody_scans').insert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            weight: weightVal,
            smm: smmVal,
            bfm: bfmVal,
            bf_percent: bfVal,
            bmr: Math.round(10 * weightVal + 6.25 * 175 - 5 * 25 + 5),
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

      // Clear new signup flag so App.tsx loads AppContent normally
      localStorage.removeItem('is_new_signup');

      // Broadcast changes so active screens refresh values
      window.dispatchEvent(new Event('plan_updated'));
      window.dispatchEvent(new Event('schedule_updated'));

      // 4. Trigger Strava transition animation
      setLoading(false);
      setShowSplash(true);

    } catch (e: any) {
      console.error(e);
      toast.error('Failed to complete onboarding: ' + e.message);
      setLoading(false);
    }
  };

  const handleSplashFinished = () => {
    setShowSplash(false);
    onComplete?.();
  };

  // Step indicator icons
  const stepsInfo = [
    { label: 'Account', icon: <User size={14} /> },
    { label: 'Workouts', icon: <Dumbbell size={14} /> },
    { label: 'Diet', icon: <Apple size={14} /> },
    { label: 'InBody', icon: <Scale size={14} /> }
  ];

  // Motion variants for slide transition
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

  // Filtering exercise DB for live catalog search inside split days
  const filteredCatalog = exerciseDb.filter(ex => {
    if (!searchQuery) return false;
    return ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           ex.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 5); // display top 5 matches

  return (
    <div className={`w-full ${step === 1 ? 'md:max-w-none md:flex md:flex-row md:h-screen md:overflow-hidden bg-[#05060b]' : 'sm:max-w-[390px]'} mx-auto min-h-[100dvh] bg-[#05060b] relative overflow-y-auto overflow-x-hidden shadow-2xl sm:border-x sm:border-gray-800 flex flex-col justify-between text-gray-100 font-sans pb-8 sm:pb-0`}>
      
      {/* LEFT SIDE PANEL (Desktop Only, only when step === 1) */}
      {step === 1 && (
        <div className="hidden md:flex md:flex-col md:flex-1 p-12 justify-between bg-[#05060b] relative overflow-hidden border-r border-gray-850/60 h-full select-none">
          {/* Dynamic tech-grid background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          
          {/* Background glowing orbs */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/[0.08] rounded-full blur-[110px] pointer-events-none z-0" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/[0.06] rounded-full blur-[110px] pointer-events-none z-0" 
          />

          {/* Top: Brand Header */}
          <div className="flex items-center gap-2.5 relative z-10">
            <BrandLogo className="w-9 h-9" />
            <span className="font-black text-base tracking-widest uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LIFE GYM
            </span>
          </div>

          {/* Center Content */}
          <div className="max-w-xl relative z-10 my-auto py-12 flex flex-col gap-8">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest block">
                PREMIUM COACHING PLATFORM
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                Start Your <br />
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  Coaching Journey.
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-md">
                The all-in-one command center for elite fitness coaches. Manage athletes, deploy workouts, parse InBody scans — all from a single dark dashboard.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0c0e17]/40 backdrop-blur border border-gray-850/60 rounded-2xl p-4 flex items-center gap-3.5 hover:border-blue-500/30 transition-all hover:translate-x-1 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Workout Builder</h3>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">AI-generated plans</p>
                </div>
              </div>

              <div className="bg-[#0c0e17]/40 backdrop-blur border border-gray-850/60 rounded-2xl p-4 flex items-center gap-3.5 hover:border-blue-500/30 transition-all hover:translate-x-1 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <Scale size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">InBody Parser</h3>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">Instant scan analysis</p>
                </div>
              </div>

              <div className="bg-[#0c0e17]/40 backdrop-blur border border-gray-850/60 rounded-2xl p-4 flex items-center gap-3.5 hover:border-blue-500/30 transition-all hover:translate-x-1 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">50+ Athletes</h3>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">One live dashboard</p>
                </div>
              </div>

              <div className="bg-[#0c0e17]/40 backdrop-blur border border-gray-850/60 rounded-2xl p-4 flex items-center gap-3.5 hover:border-blue-500/30 transition-all hover:translate-x-1 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <Apple size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Diet Architect</h3>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">Macro tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-6 border-t border-gray-850/60 pt-8 relative z-10">
            <div>
              <span className="text-2xl font-black text-white">50+</span>
              <p className="text-[9px] text-gray-550 font-black uppercase tracking-widest mt-1">Athletes per coach</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">15h</span>
              <p className="text-[9px] text-gray-550 font-black uppercase tracking-widest mt-1">Saved per week</p>
            </div>
            <div>
              <span className="text-2xl font-black text-white">1s</span>
              <p className="text-[9px] text-gray-550 font-black uppercase tracking-widest mt-1">Real-time sync</p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic tech-grid background overlay */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none ${step === 1 ? 'md:hidden' : ''}`} />

      {/* Dynamic brand blue ribbon glow background */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/[0.08] rounded-full blur-[110px] pointer-events-none ${step === 1 ? 'md:hidden' : ''}`}
      />
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/[0.06] rounded-full blur-[110px] pointer-events-none ${step === 1 ? 'md:hidden' : ''}`}
      />

      {/* Header Bar */}
      <div 
        className={`px-5 pb-5 flex items-center justify-between border-b border-gray-850 bg-[#05060b]/80 backdrop-blur-md z-30 sticky top-0 ${step === 1 ? 'md:hidden' : ''}`}
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2">
          <BrandLogo className="w-8 h-8" />
          <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            LIFE GYM
          </span>
        </div>

        {/* Skip button — only show on steps 2–4 */}
        {step > 1 && step < 5 && (
          <button 
            onClick={handleSkip} 
            className="text-xs font-bold text-blue-400 hover:text-white px-3 py-1.5 rounded-lg border border-blue-900/30 bg-blue-950/20 transition-colors active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Skip
          </button>
        )}
      </div>

      {/* Stepper Progress Bar — hidden on auth step 1 */}
      {step > 1 && (
        <div className="px-5 pt-5 pb-2 flex flex-col gap-2 z-20">
          <div className="flex items-center justify-between relative px-2">
            {/* Connector Line */}
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
                    disabled={idx + 1 > step && !currentUser} 
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
      )}

      {/* Animated Step Content */}
      <div className={step === 1 ? "flex-1 md:flex-none md:w-[480px] lg:w-[520px] md:h-full bg-transparent md:bg-[#07080e] md:border-l md:border-gray-850/30 relative flex flex-col justify-between p-5 md:p-10 overflow-y-auto overflow-x-hidden z-20 shadow-2xl" : "flex-1 relative min-h-[380px] flex flex-col justify-start px-5 py-4 overflow-visible z-20"}>
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
            
            {step === 1 && (
              <div ref={cardRef} className="space-y-5 relative flex flex-col justify-between h-full min-h-0">
                <div className="space-y-5">
                  <div className="text-center">
                    <LoginLogo className="mx-auto mb-3" errorMsg={errorMsg} />
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                      Welcome Back
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                      {loginRole === 'coach' ? 'Authorized coaches & administrators only' : 'Sign in to continue your training journey'}
                    </p>
                  </div>

                  {!currentUser && (
                    <div className="bg-[#05050b]/60 border border-gray-850 p-1 rounded-2xl flex gap-1.5 w-full select-none relative z-10 md:hidden">
                      <button
                        type="button"
                        onClick={() => setLoginRole('athlete')}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer relative z-10 transition-colors ${
                          loginRole === 'athlete' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Dumbbell size={12} className="w-3.5 h-3.5" />
                        Athlete
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole('coach')}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer relative z-10 transition-colors ${
                          loginRole === 'coach' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <User size={12} className="w-3.5 h-3.5" />
                        Coach
                      </button>
                      {/* Sliding background pill */}
                      <div className="absolute inset-y-1 left-1 right-1 pointer-events-none">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/10"
                          animate={{
                            x: loginRole === 'athlete' ? '0%' : '100%',
                            width: '50%',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          style={{ width: 'calc(50% - 2px)' }}
                        />
                      </div>
                    </div>
                  )}

                  {currentUser ? (
                    <div className="bg-[#0d111a]/85 backdrop-blur-2xl border border-gray-850 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Check size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Signed In Successfully</p>
                        <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleLogOut} 
                          className="flex-1 py-2.5 rounded-xl border border-gray-850 text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <LogOut size={13} /> Sign Out
                        </button>
                        <button 
                          onClick={handleNext} 
                          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
                        >
                          Proceed <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── SIGN IN FORM ── */
                    <form onSubmit={handleSignInAuth} className="space-y-4 bg-[#0d111a]/85 backdrop-blur-2xl border border-gray-850 p-6 rounded-3xl shadow-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Username</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <input 
                            type="text" required value={email} onChange={e => { setEmail(e.target.value); if (errorMsg) setErrorMsg(null); }} 
                            placeholder={loginRole === 'coach' ? "e.g. coach_ahmed" : "e.g. ahmed"}
                            className="w-full bg-[#05050b]/80 border border-gray-850 rounded-2xl py-3.5 pl-10 pr-4 text-white text-xs outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.08)] transition-all placeholder-gray-700 font-medium" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <input 
                            type={showPassword ? "text" : "password"} required value={password} onChange={e => { setPassword(e.target.value); if (errorMsg) setErrorMsg(null); }} 
                            placeholder="••••••••" 
                            className="w-full bg-[#05050b]/80 border border-gray-850 rounded-2xl py-3.5 pl-10 pr-10 text-white text-xs outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.08)] transition-all placeholder-gray-700 font-medium" 
                          />
                          <button 
                            type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      {/* Legal Checkbox */}
                      <div ref={privacyContainerRef} className="flex items-start gap-2.5 pt-1 pb-1 select-none relative">
                        <input 
                          type="checkbox" 
                          id="legal-accept-onboarding"
                          checked={legalAccepted} 
                          onChange={e => {
                            setLegalAccepted(e.target.checked);
                            if (e.target.checked) {
                              setShowArrow(false);
                            }
                          }} 
                          className="mt-0.5 h-4 w-4 rounded border-gray-850 bg-[#05050b] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#0d111a] focus:ring-2 cursor-pointer transition-colors"
                        />
                        <label htmlFor="legal-accept-onboarding" className="text-[10px] text-gray-400 leading-normal text-left">
                          I agree to the{' '}
                          <button type="button" onClick={() => setModalType('terms')} className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button type="button" onClick={() => setModalType('privacy')} className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer">
                            Privacy Policy
                          </button>
                        </label>
                      </div>

                      <button 
                        ref={loginButtonRef}
                        type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-98 cursor-pointer mt-1"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                      {/* Hard reset cache button */}
                      <button
                        type="button"
                        onClick={async () => {
                          if ('caches' in window) {
                            const keys = await caches.keys();
                            await Promise.all(keys.map(k => caches.delete(k)));
                          }
                          window.location.reload();
                        }}
                        className="w-full mt-2 py-2 text-[10px] text-gray-650 hover:text-gray-450 transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Clear cache &amp; hard refresh
                      </button>
                    </form>
                  )}

                  {/* Start Now button for coaches (Only on desktop) */}
                  {!currentUser && (
                    <div className="hidden md:block pt-4 border-t border-gray-850/50 text-center mt-4 z-10 relative">
                      <button
                        type="button"
                        onClick={() => setShowCoachGuide(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>START NOW</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Brand Footer (Desktop only) */}
                <div className="hidden md:block text-center pt-6 text-[9px] font-black uppercase tracking-widest text-gray-700 select-none mt-auto">
                  LIFE GYM &copy; {new Date().getFullYear()}
                </div>

                {/* Flying Arrow Overlay */}
                <AnimatePresence>
                  {showArrow && arrowPoints && (
                    <motion.svg
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 pointer-events-none z-50 overflow-visible w-full h-full"
                    >
                        <defs>
                        {/* Gradient fades from transparent at tail to solid blue at head */}
                        <linearGradient id="arrow-trail-grad" gradientUnits="userSpaceOnUse"
                          x1={arrowPoints.startX} y1={arrowPoints.startY}
                          x2={arrowPoints.endX} y2={arrowPoints.endY}>
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                        </linearGradient>
                        <marker id="flying-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                          <path d="M1,1 L9,5 L1,9 Z" fill="#3b82f6" />
                        </marker>
                      </defs>

                      {/* Cubic bezier: bottom-center of button → loops around right side → checkbox */}
                      <motion.path
                        d={`M ${arrowPoints.startX} ${arrowPoints.startY} C ${arrowPoints.controlX} ${arrowPoints.controlY} ${arrowPoints.controlX} ${arrowPoints.endY - 30} ${arrowPoints.endX} ${arrowPoints.endY}`}
                        fill="none"
                        stroke="url(#arrow-trail-grad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        markerEnd="url(#flying-arrowhead)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          pathLength: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
                        }}
                      />

                      {/* Glowing pulse at the checkbox destination */}
                      <motion.circle
                        cx={arrowPoints.endX}
                        cy={arrowPoints.endY}
                        r="8"
                        fill="rgba(59,130,246,0.15)"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0.8, 2, 0.8], opacity: [0, 0.9, 0] }}
                        transition={{ repeat: Infinity, duration: 1.1, delay: 0.7 }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── STEP 2: WORKOUTS (EXERCISE EDITOR) ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Your Training Program</h2>
                  <p className="text-xs text-gray-500 mt-1">Customize splits & exercises for each training day</p>
                </div>

                 {/* Splits list */}
                <div className="space-y-3 max-h-[60vh] md:max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                  {splits.map((item) => {
                    const isExpanded = activeSplitKey === item.key;
                    return (
                      <div 
                        key={item.key}
                        className="bg-[#121620]/60 border border-gray-800 rounded-2xl overflow-hidden transition-all flex flex-col shadow-md"
                        style={{ borderLeft: `4px solid ${item.color}` }}
                      >
                        {/* Header Row */}
                        <div 
                          onClick={() => setActiveSplitKey(isExpanded ? null : item.key)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 active:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.emoji}</span>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-wider">{item.label} Day</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.exercises.length} exercises</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeSplit(item.key); }} 
                              className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                              title="Delete Day"
                            >
                              <Trash2 size={16} />
                            </button>
                            <span className="text-[11px] text-gray-400 font-bold bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full uppercase">
                              {isExpanded ? 'Close' : 'Edit'}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Exercises Editor */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-850 bg-black/30"
                            >
                              <div className="p-3.5 space-y-3.5">
                                
                                {/* Exercises rows */}
                                {item.exercises.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic text-center py-4">No exercises yet. Use the search below to add.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {item.exercises.map((ex, idx) => (
                                      <div key={ex.id} className="flex justify-between items-center bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="text-[10px] font-extrabold text-blue-400 bg-blue-950/30 border border-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                            {idx + 1}
                                          </span>
                                          <div className="min-w-0">
                                            <span className="text-sm text-gray-100 font-semibold truncate block">{ex.name}</span>
                                            {ex.muscle_group && <span className="text-[10px] text-gray-500">{ex.muscle_group}</span>}
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => removeExerciseFromSplit(item.key, ex.id)}
                                          className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 ml-2"
                                        >
                                          <X size={15} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Search & Add exercises in Split */}
                                <div className="border-t border-gray-800 pt-3 relative">
                                  <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                    <input 
                                      value={searchQuery}
                                      onChange={e => setSearchQuery(e.target.value)}
                                      placeholder="Search exercises to add..."
                                      className="w-full bg-[#0d1117] border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-[16px] text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                    {searchQuery && (
                                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1">
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>

                                  {/* Search Results */}
                                  {searchQuery && (
                                    <div className="mt-2 bg-[#0d1117] border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col max-h-[180px] overflow-y-auto">
                                      {filteredCatalog.length === 0 ? (
                                        <span className="p-3 text-xs text-gray-500 italic text-center">No exercises found</span>
                                      ) : (
                                        filteredCatalog.map(ex => (
                                          <button
                                            key={ex.id}
                                            onClick={() => {
                                              addExerciseToSplit(item.key, ex);
                                              setSearchQuery('');
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm hover:bg-blue-600 hover:text-white flex items-center justify-between border-b border-gray-800/60 transition-colors active:bg-blue-700"
                                          >
                                            <span className="font-semibold truncate">{ex.name}</span>
                                            <span className="text-[10px] font-bold uppercase bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded-lg shrink-0 ml-2">{ex.muscle_group}</span>
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

                {/* Add dynamic Day split split */}
                <div className="flex gap-2 border-t border-gray-850 pt-4">
                  <input 
                    value={newSplitName}
                    onChange={e => setNewSplitName(e.target.value)}
                    placeholder="Add dynamic day (e.g. Upper Body, Arms)..." 
                    className="flex-1 bg-[#121620]/60 border border-gray-800 rounded-xl p-3 text-[16px] text-white outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={e => { if (e.key === 'Enter') addSplit(); }}
                  />
                  <button 
                    onClick={addSplit}
                    className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: DIET ── */}
            {step === 3 && (
              <div className="space-y-4 max-h-[60vh] md:max-h-[480px] overflow-y-auto no-scrollbar pr-1 py-1">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Diet & Nutrition targets</h2>
                  <p className="text-xs text-gray-500 mt-1">Set Calories and Hydration baselines</p>
                </div>

                {/* Training Day Targets Card */}
                <div className="bg-[#121620]/60 border border-blue-900/20 p-4 rounded-2xl space-y-3 relative shadow-xl">
                  <div className="absolute top-3 right-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
                    Gym Days
                  </div>
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">🔥 Baseline Targets</h3>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Calories (kcal)</label>
                      <input 
                        type="number" value={kcal} onChange={e => setKcal(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Protein (g)</label>
                      <input 
                        type="number" value={protein} onChange={e => setProtein(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Carbs (g)</label>
                      <input 
                        type="number" value={carbs} onChange={e => setCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Fat (g)</label>
                      <input 
                        type="number" value={fat} onChange={e => setFat(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Rest Day Targets Card */}
                <div className="bg-[#121620]/60 border border-gray-850 p-4 rounded-2xl space-y-3 relative shadow-xl">
                  <div className="absolute top-3 right-3 bg-gray-800 text-gray-400 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
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
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
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
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
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
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
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
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-[16px] text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Hydration Settings Card */}
                <div className="bg-[#121620]/60 border border-blue-900/10 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">Daily Hydration</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Target daily water intake</p>
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
                    <span className="text-sm font-black text-blue-400 min-w-[50px] text-center">
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

            {/* ── STEP 4: INBODY ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Your Body Composition</h2>
                  <p className="text-xs text-gray-500 mt-1">Log your starting InBody scan details</p>
                </div>

                {/* CSV File Upload Zone */}
                <div className="bg-[#121620]/60 border border-dashed border-blue-500/30 hover:border-blue-500 p-4 rounded-2xl text-center space-y-2 cursor-pointer transition-all relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    ref={fileInputRef} 
                    onChange={handleCSVUpload} 
                  />
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📊</span>
                    <p className="text-xs font-bold text-blue-400 group-hover:text-blue-300">
                      {isImporting ? 'Importing Scans...' : 'Import from InBody CSV'}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-1 max-w-[240px]">
                      Upload your InBody export file to auto-populate the fields and import your full history.
                    </p>
                  </div>
                </div>

                <div className="bg-[#121620]/60 border border-gray-800 p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weight (kg)</label>
                      <input 
                        type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)}
                        placeholder="e.g. 78.5"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-[16px] text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Body Fat %</label>
                      <input 
                        type="number" step="any" value={bfPercent} onChange={e => setBfPercent(e.target.value)}
                        placeholder="e.g. 14.8"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-[16px] text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Muscle (SMM kg)</label>
                      <input 
                        type="number" step="any" value={smm} onChange={e => setSmm(e.target.value)}
                        placeholder="e.g. 36.5"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-[16px] text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">InBody Score</label>
                      <input 
                        type="number" value={inbodyScore} onChange={e => setInbodyScore(parseInt(e.target.value) || 0)}
                        placeholder="75"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-[16px] text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>

                  {/* Body Fat Mass Auto Calculation View */}
                  {bfm && (
                    <div className="bg-[#181d29] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
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

      {/* Footer Navigation Buttons — only shown on steps 2–4 */}
      {step > 1 && (
        <div className="p-5 border-t border-gray-850 bg-[#0a0a0f] flex items-center justify-between gap-3 z-30 sticky bottom-0">
          <button 
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-900/50 text-gray-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex-1 max-w-[180px] flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs active:scale-95 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer uppercase tracking-widest border border-white/5 disabled:opacity-50"
          >
            {loading ? 'Saving...' : step === 4 ? (
              <>Finish Setup <Check size={14} strokeWidth={2.5} /></>
            ) : (
              <>Next Step <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      )}

      {/* Full-screen Strava Celebration Ribbon Splash Overlay */}
      <SplashOverlay 
        show={showSplash} 
        onComplete={handleSplashFinished} 
        hideText={true} 
      />

      {/* Render Legal Documents inside Modals */}
      <AnimatePresence>
        {modalType && (
          <LegalModal
            isOpen={!!modalType}
            onClose={() => setModalType(null)}
            type={modalType}
          />
        )}
      </AnimatePresence>

      {/* Interactive Coach Guide Overlay - Step-by-Step Slider with HTML Website Previews */}
      <AnimatePresence>
        {showCoachGuide && (() => {
          // Inner reusable mockup component for high-fidelity rendering
          const BrowserPortalMockup = ({ activeTab, children }: { activeTab: string; children: React.ReactNode }) => {
            return (
              <div className="w-full bg-[#05060b] text-white flex flex-col h-full overflow-hidden text-[7px] border border-gray-850/60 rounded-xl">
                {/* Top Header Bar */}
                <div className="bg-[#08090f] border-b border-gray-850 px-2 py-1 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black rounded-sm shrink-0">
                      <Dumbbell size={8} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-black tracking-widest text-[6px] uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-none">LIFE GYM</span>
                      <span className="text-[4px] text-gray-500 font-bold leading-none mt-0.5">Desktop Coach Portal / Version 3.0</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 px-1 py-0.5 rounded-full text-[4px] font-black uppercase tracking-wider shrink-0">
                      <span className="w-0.5 h-0.5 bg-emerald-400 rounded-full animate-pulse" />
                      Database: ONLINE
                    </div>
                    <div className="bg-gray-950 border border-gray-850 text-gray-400 px-1 py-0.5 rounded flex items-center gap-0.5 text-[4px] font-bold shrink-0">
                      <RefreshCw size={5} />
                      Sync Data
                    </div>
                    <div className="bg-gray-900 border border-gray-850 text-gray-405 px-1 py-0.5 rounded flex items-center gap-0.5 text-[4px] font-bold shrink-0">
                      <RefreshCw size={5} />
                      Force Update
                    </div>
                    <div className="bg-red-950/20 border border-red-900/30 text-red-400 px-1 py-0.5 rounded flex items-center gap-0.5 text-[4px] font-bold shrink-0">
                      <LogOut size={5} />
                      Log Out
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Left Sidebar */}
                  <div className="w-20 bg-[#08090f] border-r border-gray-850 p-1 flex flex-col justify-between shrink-0 select-none text-left">
                    <div className="space-y-1">
                      <span className="text-[4px] font-black text-gray-650 uppercase tracking-widest block px-1">Main Navigation</span>
                      <div className="space-y-0.5">
                        {[
                          { id: 'overview', label: 'Operational Overview', icon: <Activity size={6} /> },
                          { id: 'directory', label: 'Athlete Directory', icon: <Users size={6} /> },
                          { id: 'deploy', label: 'Deploy New Athlete', icon: <UserPlus size={6} /> },
                          { id: 'control', label: 'Athlete Control', icon: <Settings size={6} /> },
                          { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={6} /> },
                          { id: 'profile', label: 'Profile Settings', icon: <User size={6} /> }
                        ].map(item => {
                          const isActive = activeTab === item.id;
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-1 px-1.5 py-1 rounded transition-colors text-[5.5px] font-bold ${
                                isActive 
                                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              {item.icon}
                              <span className="truncate">{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-1.5 border-t border-gray-900/50 text-center">
                      <span className="text-[4px] font-black text-gray-700 uppercase tracking-widest">LIFE GYM</span>
                    </div>
                  </div>

                  {/* Workspace Content Pane */}
                  <div className="flex-1 bg-[#05060b] p-2 overflow-y-auto no-scrollbar">
                    {children}
                  </div>
                </div>
              </div>
            );
          };

          const stepsData = [
            {
              badge: "Step 01",
              title: "Deploy New Athlete",
              desc: "Deploy a new athlete in a single structured flow. Input their credentials (name, username, password, phone), configure their initial workout splits and customized baseline exercises, set their daily calorie/macro targets and water volume, select their subscription package, and deploy their profile instantly.",
              content: (
                <BrowserPortalMockup activeTab="deploy">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-850">
                      <span className="text-[7.5px] font-black uppercase text-blue-400">Deploy New Athlete</span>
                      <span className="text-[5.5px] text-gray-500 font-semibold">Deploy new accounts to database</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5 bg-[#0c0e17]/65 border border-gray-850/60 p-2 rounded-xl">
                        <span className="text-[5.5px] font-black text-blue-450 uppercase tracking-wider block">1. Credentials</span>
                        <div className="space-y-1">
                          <div>
                            <label className="text-[5px] text-gray-550 block">Athlete Full Name</label>
                            <input type="text" readOnly value="Sarah Ahmed" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                          </div>
                          <div>
                            <label className="text-[5px] text-gray-550 block">Username</label>
                            <input type="text" readOnly value="sarah_fit" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="text-[5px] text-gray-550 block">Mobile</label>
                              <input type="text" readOnly value="01128828954" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                            </div>
                            <div>
                              <label className="text-[5px] text-gray-550 block">Passcode</label>
                              <input type="text" readOnly value="sarah@998" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-[#0c0e17]/65 border border-gray-850/60 p-2 rounded-xl">
                        <span className="text-[5.5px] font-black text-blue-455 uppercase tracking-wider block">2. Program &amp; Targets</span>
                        <div className="space-y-1">
                          <div>
                            <label className="text-[5px] text-gray-555 block">Initial Split Days</label>
                            <div className="flex gap-0.5 mt-0.5">
                              {['Push', 'Pull', 'Legs'].map(sp => (
                                <span key={sp} className="text-[5px] bg-blue-950/40 border border-blue-900/30 text-blue-400 px-1 py-0.2 rounded font-black">{sp}</span>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="text-[5px] text-gray-555 block">Target Calories</label>
                              <input type="text" readOnly value="2,400 kcal" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                            </div>
                            <div>
                              <label className="text-[5px] text-gray-555 block">Water Goal</label>
                              <input type="text" readOnly value="3.5 Liters" className="w-full bg-[#05060b] border border-gray-850 rounded p-0.5 text-[6px] text-white outline-none font-bold" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-0.5 text-center mt-1">
                            <div className="bg-[#05060b] border border-gray-850 p-0.5 rounded">
                              <span className="text-[4px] text-gray-500 block">P</span>
                              <span className="text-[5.5px] font-black text-emerald-450">160g</span>
                            </div>
                            <div className="bg-[#05060b] border border-gray-850 p-0.5 rounded">
                              <span className="text-[4px] text-gray-500 block">C</span>
                              <span className="text-[5.5px] font-black text-amber-400">240g</span>
                            </div>
                            <div className="bg-[#05060b] border border-gray-850 p-0.5 rounded">
                              <span className="text-[4px] text-gray-500 block">F</span>
                              <span className="text-[5.5px] font-black text-purple-400">70g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0c0e17]/65 border border-gray-850/60 p-2 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[5.5px] font-black text-blue-455 uppercase tracking-wider block">3. Membership Package</span>
                        <span className="text-[5px] text-gray-500 block font-semibold">Select access duration period</span>
                      </div>
                      <div className="flex gap-1">
                        {['1 Month', '3 Months', '6 Months'].map((pkg, i) => (
                          <div key={pkg} className={`px-2 py-0.5 rounded border text-[5.5px] font-black cursor-pointer ${i === 0 ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-[#05060b] border-gray-850 text-gray-550'}`}>
                            {pkg}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[6.5px] py-1.5 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 cursor-pointer">
                      <UserPlus size={7} /> Deploy Client &amp; Program
                    </button>
                  </div>
                </BrowserPortalMockup>
              )
            },
            {
              badge: "Step 02",
              title: "Operational Overview",
              desc: "Monitor platform metrics and live status feeds in real time. Total system accounts, active coaches, and managed athletes are summarized instantly, while live feeds capture daily workout completions and calorie logging from your active athlete base.",
              content: (
                <BrowserPortalMockup activeTab="overview">
                  <div className="space-y-2 text-left">
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="bg-[#0c0e17] border border-gray-850 rounded p-1.5 space-y-0.5">
                        <span className="text-[4.5px] font-black text-gray-555 uppercase tracking-widest block leading-none">Total System Accounts</span>
                        <span className="text-sm font-black text-blue-450 leading-none">3</span>
                      </div>
                      <div className="bg-[#0c0e17] border border-gray-850 rounded p-1.5 space-y-0.5">
                        <span className="text-[4.5px] font-black text-gray-555 uppercase tracking-widest block leading-none">Coaches Active</span>
                        <span className="text-sm font-black text-blue-450 leading-none">2</span>
                      </div>
                      <div className="bg-[#0c0e17] border border-gray-850 rounded p-1.5 space-y-0.5">
                        <span className="text-[4.5px] font-black text-gray-555 uppercase tracking-widest block leading-none">Managed Athletes</span>
                        <span className="text-sm font-black text-blue-450 leading-none">1</span>
                      </div>
                      <div className="bg-[#0c0e17] border border-gray-850 rounded p-1.5 space-y-0.5 flex flex-col justify-between">
                        <span className="text-[4.5px] font-black text-gray-555 uppercase tracking-widest block leading-none">System Status</span>
                        <span className="text-[7px] font-black text-emerald-450 flex items-center gap-0.5 leading-none">
                          <ShieldCheck size={7} /> SECURE
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0c0e17]/80 border border-gray-850 rounded p-1.5 flex justify-between items-center text-[5px]">
                      <div>
                        <span className="font-black text-white uppercase block leading-none">Feed Activity Filter</span>
                        <span className="text-gray-505 font-semibold block mt-0.5 leading-none">Toggle between monitoring all athlete activity across the platform or narrowing it down.</span>
                      </div>
                      <span className="bg-[#121624] border border-gray-800 text-[4.5px] font-black px-1.5 py-0.5 rounded text-gray-400 shrink-0">ALL SYSTEM ACTIVITY</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 bg-[#0c0e17]/40 border border-gray-850/50 p-1.5 rounded-lg">
                        <span className="text-[5.5px] font-black text-white uppercase tracking-wider block flex items-center gap-0.5">
                          <Dumbbell size={6} className="text-blue-400" /> Workouts Completed Feed
                        </span>
                        <div className="space-y-1">
                          {[
                            { name: "lila wael", code: "#101", detail: "180 kg", desc: "Completed a PUSH day", date: "2026-06-05" },
                            { name: "Haleem", code: null, detail: "Push", desc: "Completed a PUSH day", date: "2026-05-26" },
                            { name: "Haleem", code: null, detail: "Run", desc: "Completed a RUN day", date: "2026-05-20" }
                          ].map((w, idx) => (
                            <div key={idx} className="bg-[#05060b] border border-gray-850 rounded p-1 flex justify-between items-start text-[5.5px] leading-tight">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-white">{w.name}</span>
                                  {w.code && <span className="bg-blue-950 text-blue-400 px-0.5 rounded text-[4.5px] font-black">{w.code}</span>}
                                </div>
                                <span className="text-gray-550 block mt-0.5">{w.desc}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-white block">{w.detail}</span>
                                <span className="text-[4px] text-gray-500 block">{w.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#0c0e17]/40 border border-gray-850/50 p-1.5 rounded-lg">
                        <span className="text-[5.5px] font-black text-white uppercase tracking-wider block flex items-center gap-0.5">
                          <Apple size={6} className="text-emerald-450" /> Nutritional Intake Feed
                        </span>
                        <div className="space-y-1">
                          {[
                            { name: "lila wael", code: "#101", detail: "450 kcal / 23g P", desc: "Tracked daily totals", date: "2026-06-05" },
                            { name: "Haleem", code: null, detail: "403 kcal / 25g P", desc: "Tracked daily totals", date: "2026-06-01" },
                            { name: "Haleem", code: null, detail: "841 kcal / 55g P", desc: "Tracked daily totals", date: "2026-05-30" }
                          ].map((n, idx) => (
                            <div key={idx} className="bg-[#05060b] border border-gray-850 rounded p-1 flex justify-between items-start text-[5.5px] leading-tight">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-white">{n.name}</span>
                                  {n.code && <span className="bg-blue-950 text-blue-400 px-0.5 rounded text-[4.5px] font-black">{n.code}</span>}
                                </div>
                                <span className="text-gray-550 block mt-0.5">{n.desc}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-emerald-450 block">{n.detail}</span>
                                <span className="text-[4px] text-gray-500 block">{n.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </BrowserPortalMockup>
              )
            },
            {
              badge: "Step 03",
              title: "Athlete Directory",
              desc: "Access your client roster inside the Athlete Directory. Filter by your assigned athletes, lookup unique client codes (e.g. #101), review login passcodes, and monitor contact information. Direct toggle filters streamline directory searching.",
              content: (
                <BrowserPortalMockup activeTab="directory">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-650 w-2.5 h-2.5" />
                        <input type="text" readOnly value="Search athletes by name or code..." className="w-full bg-[#0d111a] border border-gray-850 rounded py-1 pl-5 pr-2 text-[5.5px] text-gray-400 outline-none font-bold" />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <input type="checkbox" id="mock-mine-dir" defaultChecked className="w-2.5 h-2.5 rounded border-gray-850 text-blue-600 focus:ring-0 cursor-pointer" />
                        <label htmlFor="mock-mine-dir" className="text-[5px] text-gray-505 font-black uppercase select-none cursor-pointer">Filter Mine Only</label>
                      </div>
                      <button className="bg-blue-600 text-white font-black text-[5.5px] px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 cursor-pointer">+ Add Client</button>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { name: "Lila Wael", code: "#101", user: "@lila_wael", phone: "01062635950", passcode: "lila@554", status: "Active" },
                        { name: "Sarah Ahmed", code: "#102", user: "@sarah_fit", phone: "01128828954", passcode: "sarah@998", status: "Active" },
                        { name: "Mohamed Yousry", code: "#103", user: "@yousry_fit", phone: "01062635950", passcode: "yousry@776", status: "Suspended" }
                      ].map((ath, idx) => (
                        <div key={idx} className="bg-[#0b0c16] border border-gray-850 rounded-xl p-2 flex justify-between items-center hover:border-gray-800 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5.5 h-5.5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/10 text-blue-300 rounded-full flex items-center justify-center font-black text-[7.5px] shrink-0">
                              {ath.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-black text-white text-[7.5px] truncate">{ath.name}</span>
                                <span className="bg-blue-950 text-blue-400 px-1 py-0.2 rounded text-[5px] font-black shrink-0">{ath.code}</span>
                                {ath.status === "Suspended" && (
                                  <span className="bg-amber-950/40 border border-amber-900/30 text-amber-400 px-1 py-0.2 rounded text-[4.5px] font-black uppercase shrink-0">Suspended</span>
                                )}
                              </div>
                              <span className="text-gray-500 text-[6px] block truncate">{ath.user} · {ath.phone}</span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[5px] text-gray-555 block uppercase font-black">Passcode</span>
                            <span className="font-mono font-black text-blue-455 text-[7px]">{ath.passcode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </BrowserPortalMockup>
              )
            },
            {
              badge: "Step 04",
              title: "Athlete Control Panel",
              desc: "Unlock absolute control over individual athlete configurations. Manage subscription packages, temporarily suspend login profiles, clear or assign account passwords, and delete client records. Adjust daily splits, customize workout exercises, and tune macro ranges directly.",
              content: (
                <BrowserPortalMockup activeTab="control">
                  <div className="space-y-2 text-left">
                    <div className="bg-[#0b0c16] border border-gray-850 rounded-xl p-2 flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5.5 h-5.5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/10 text-blue-300 rounded-full flex items-center justify-center font-black text-[7.5px] shrink-0">S</div>
                        <div className="min-w-0">
                          <span className="font-black text-white text-[7.5px] block truncate">Sarah Ahmed</span>
                          <span className="text-gray-500 text-[5.5px] block truncate">Configure access, split plans, and macro targets</span>
                        </div>
                      </div>
                      <span className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded text-[4.5px] font-black uppercase shrink-0">Active</span>
                    </div>

                    <div className="bg-[#05060b] border border-gray-850 p-0.5 rounded-lg flex gap-0.5">
                      {['Overview', 'Diet targets', 'Training splits'].map((tb, idx) => (
                        <span key={tb} className={`flex-1 text-center py-0.5 text-[5px] font-black uppercase rounded ${idx === 2 ? 'bg-blue-600 text-white' : 'text-gray-555'}`}>
                          {tb}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#0c0e17]/50 border border-gray-850/50 p-1.5 rounded-lg space-y-1">
                        <span className="text-[5px] font-black text-gray-550 uppercase tracking-wider block">Training Split (Push split)</span>
                        <div className="space-y-0.5 text-[5px]">
                          <div className="bg-[#05060b] p-1 rounded flex justify-between items-center text-gray-300 border border-gray-850/30">
                            <span className="truncate">1. Incline DB Bench Press</span>
                            <span className="text-blue-400 font-mono shrink-0 ml-1">3 sets</span>
                          </div>
                          <div className="bg-[#05060b] p-1 rounded flex justify-between items-center text-gray-300 border border-gray-850/30">
                            <span className="truncate">2. DB Shoulder Press</span>
                            <span className="text-blue-400 font-mono shrink-0 ml-1">3 sets</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 bg-[#0c0e17]/50 border border-gray-850/50 p-1.5 rounded-lg flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-1">
                          <button className="bg-amber-600 hover:bg-amber-500 text-white font-black text-[4.5px] py-1 rounded uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer">
                            <AlertTriangle size={5} /> Suspend
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[4.5px] py-1 rounded uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer">
                            <CreditCard size={5} /> Upgrade
                          </button>
                        </div>
                        <button className="w-full bg-[#121624] border border-gray-850 hover:border-gray-800 text-white font-black text-[4.5px] py-1 rounded uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer">
                          <Key size={5} /> Set Password
                        </button>
                        <button className="w-full bg-red-950/20 border border-red-900/30 hover:bg-red-900/20 text-red-400 font-black text-[4.5px] py-1 rounded uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer">
                          <Trash2 size={5} /> Delete Client
                        </button>
                      </div>
                    </div>
                  </div>
                </BrowserPortalMockup>
              )
            },
            {
              badge: "Step 05",
              title: "Subscriptions Manager",
              desc: "Supervise billing and subscription cycles in one centralized location. The Subscriptions panel lists package details, subscription start/end timestamps, and computes a live countdown of days remaining. Active, Expired, and Suspended tags are color-coded for quick visual action.",
              content: (
                <BrowserPortalMockup activeTab="subscriptions">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-850">
                      <span className="text-[7.5px] font-black uppercase text-blue-400">Subscriptions Manager</span>
                      <span className="text-[5.5px] text-gray-500 font-semibold">Active client billing terms</span>
                    </div>

                    <div className="bg-[#0b0c16]/55 border border-gray-850 p-1.5 rounded-lg space-y-1">
                      <div className="grid grid-cols-4 text-[4.5px] font-black text-gray-500 uppercase tracking-widest px-1 pb-0.5 border-b border-gray-900/30">
                        <span>Athlete</span>
                        <span>Package</span>
                        <span>Billing Status</span>
                        <span className="text-right">Actions</span>
                      </div>

                      <div className="space-y-0.5">
                        {[
                          { name: "Lila Wael", code: "#101", period: "1 Month", left: "12 Days Left", status: "Active" },
                          { name: "Sarah Ahmed", code: "#102", period: "3 Months", left: "64 Days Left", status: "Active" },
                          { name: "Mohamed Yousry", code: "#103", period: "2 Weeks", left: "EXPIRED (SUSPENDED)", status: "Expired" }
                        ].map((sub, idx) => (
                          <div key={idx} className="grid grid-cols-4 items-center bg-[#05060b] border border-gray-850/60 p-1 rounded text-[5px] px-1 font-bold">
                            <div className="flex items-center gap-0.5 min-w-0">
                              <span className="text-white truncate">{sub.name}</span>
                              <span className="text-[4px] text-gray-500 shrink-0">{sub.code}</span>
                            </div>
                            <span className="text-gray-400">{sub.period}</span>
                            <span className={sub.status === "Expired" ? "text-red-400 font-black font-mono text-[4.5px]" : "text-emerald-450 font-black font-mono text-[4.5px]"}>
                              {sub.left}
                            </span>
                            <div className="flex justify-end">
                              <span className="bg-blue-600 text-white text-[4.5px] px-1.5 py-0.5 rounded font-black cursor-pointer hover:bg-blue-500 leading-none">Extend</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </BrowserPortalMockup>
              )
            },
            {
              badge: "Step 06",
              title: "Profile Settings",
              desc: "Manage your own credentials and support routing settings. Set your coaching display name, modify your login email address, manage portal authorization passcodes (with standard mask toggling), and set your WhatsApp phone number to enable instant notifications.",
              content: (
                <BrowserPortalMockup activeTab="profile">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-850">
                      <span className="text-[7.5px] font-black uppercase text-blue-400">Profile Settings</span>
                      <span className="text-[5.5px] text-gray-555 font-semibold">Coach credentials &amp; contact</span>
                    </div>

                    <div className="bg-[#0b0c16] border border-gray-850 rounded-xl p-2.5 space-y-1.5 max-w-xs mx-auto">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-gray-850/55">
                        <div className="w-5 h-5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[8px] shrink-0">C</div>
                        <div>
                          <span className="font-black text-white text-[7.5px] block">Coach Ahmed</span>
                          <span className="text-gray-500 text-[5px] block">Coach Portal Account Settings</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[5px] text-gray-550 block mb-0.5 uppercase tracking-wider">Coach Display Name</label>
                          <input type="text" readOnly value="Coach Ahmed" className="w-full bg-[#05060b] border border-gray-850 rounded p-1 text-[5.5px] text-white outline-none font-bold" />
                        </div>
                        <div>
                          <label className="text-[5px] text-gray-550 block mb-0.5 uppercase tracking-wider">Email Address</label>
                          <input type="text" readOnly value="ahmed@stride.fit" className="w-full bg-[#05060b] border border-gray-850 rounded p-1 text-[5.5px] text-white outline-none font-bold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[5px] text-gray-555 block mb-0.5 uppercase tracking-wider">Passcode</label>
                          <div className="relative">
                            <input type="password" readOnly value="ahmed@portal" className="w-full bg-[#05060b] border border-gray-850 rounded p-1 pr-3.5 text-[5.5px] text-white outline-none font-mono" />
                            <Eye className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-600 w-2.5 h-2.5" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[5px] text-gray-555 block mb-0.5 uppercase tracking-wider">WhatsApp Contact</label>
                          <div className="relative">
                            <Phone className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-650 w-2 h-2" />
                            <input type="text" readOnly value="+201128828954" className="w-full bg-[#05060b] border border-gray-850 rounded p-1 pl-3.5 text-[5.5px] text-white outline-none font-bold" />
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[5.5px] py-1 rounded-md uppercase tracking-wider flex items-center justify-center gap-0.5 shadow-sm shadow-blue-500/10 mt-1 cursor-pointer">
                        <Save size={6} /> Save Profile Settings
                      </button>
                    </div>
                  </div>
                </BrowserPortalMockup>
              )
            }
          ];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#05060b]/98 backdrop-blur-xl z-50 overflow-hidden flex flex-col p-6 md:p-12 font-sans text-gray-250"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-850 pb-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Life Gym Coach Guide</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Interactive Setup &amp; Onboarding Tour</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCoachGuide(false); setGuideStep(0); }}
                  className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Slider Content Panel */}
              <div className="flex-1 flex flex-col justify-center items-center mt-6 overflow-hidden relative w-full">
                <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center px-4 md:px-12 relative h-full">
                  
                  {/* Left Side: Step Card Text */}
                  <div className="w-full md:w-1/2 space-y-4 text-left">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-max block">
                      {stepsData[guideStep].badge}
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-snug">
                      {stepsData[guideStep].title}
                    </h3>
                    <p className="text-xs text-gray-450 leading-relaxed font-bold">
                      {stepsData[guideStep].desc}
                    </p>
                  </div>

                  {/* Right Side: Zoomed-out Browser View Mockup */}
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-md md:max-w-lg transition-all duration-300 hover:scale-[1.02] relative">
                      {/* Browser Shell Mockup */}
                      <div className="w-full bg-[#07080e] border border-gray-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[340px] select-none text-left">
                        {/* Browser Header */}
                        <div className="bg-[#0b0c16] border-b border-gray-850 px-4 py-2.5 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                            <span className="w-2 h-2 rounded-full bg-yellow-500/80 inline-block" />
                            <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block" />
                          </div>
                          <div className="bg-[#05060b] border border-gray-850/60 px-3 py-0.5 rounded-lg text-[7px] text-gray-555 font-mono w-44 text-center truncate font-bold">
                            https://stride.fit/coach-portal
                          </div>
                          <div className="w-8" />
                        </div>
                        {/* Browser Body */}
                        <div className="flex-1 bg-[#05060b] overflow-hidden relative text-gray-250 text-[9px] no-scrollbar">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={guideStep}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="w-full h-full"
                            >
                              {stepsData[guideStep].content}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Navigation controls at the bottom */}
              <div className="border-t border-gray-850 pt-5 mt-6 flex justify-between items-center shrink-0 w-full max-w-4xl">
                <div className="flex gap-1.5">
                  {stepsData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGuideStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        guideStep === idx ? 'bg-blue-500 w-4' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2.5">
                  {guideStep > 0 && (
                    <button
                      onClick={() => setGuideStep(prev => prev - 1)}
                      className="bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-300 hover:text-white px-5 py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer font-bold"
                    >
                      Previous Step
                    </button>
                  )}

                  {guideStep < stepsData.length - 1 ? (
                    <button
                      onClick={() => setGuideStep(prev => prev + 1)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <span>Next Step</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowTrialModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <span>START FREE TRIAL</span>
                      <Check size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Trial Activation Success Modal */}
      <AnimatePresence>
        {showTrialModal && (
          <div className="fixed inset-0 bg-[#020204]/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c16] border border-gray-850 w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check size={28} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-full w-max mx-auto">
                  Trial Initiated
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  TRIAL ACTIVATED!
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-bold">
                  Your 14-day free trial has been successfully registered. Please contact the administrator via WhatsApp to receive your official coach portal login credentials.
                </p>
              </div>
              <div className="space-y-2.5 pt-2">
                <a
                  href="https://wa.me/201128828954?text=Hello%20Haleem,%20I%20just%20started%20my%20Life%20Gym%20Coach%20free%20trial.%20Could%20I%20get%20my%20login%20credentials?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer flex items-center justify-center gap-2 font-bold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.832 0c3.15.001 6.111 1.229 8.339 3.458 2.228 2.229 3.454 5.192 3.453 8.342-.003 6.507-5.327 11.832-11.83 11.832-2.002-.001-3.97-.512-5.713-1.488L0 24zm6.758-2.917c1.673.993 3.321 1.482 5.068 1.483 5.4 0 9.792-4.393 9.795-9.797.001-2.617-1.018-5.079-2.87-6.932C16.896 3.985 14.432 2.965 11.83 2.964c-5.4 0-9.791 4.394-9.794 9.798 0 1.859.5 3.674 1.448 5.252L2.5 21.5l3.39-1.096c1.6.868 3.1 1.353 4.92 1.353v.001zm11.96-7.387c-.266-.134-1.57-.775-1.814-.864-.243-.089-.42-.134-.596.134-.177.266-.685.864-.84 1.041-.154.177-.31.199-.576.066-.266-.134-1.12-.413-2.133-1.317-.788-.703-1.32-1.572-1.474-1.838-.155-.266-.017-.41.117-.543.12-.12.266-.31.399-.465.133-.155.177-.266.266-.443.089-.177.044-.332-.022-.465-.067-.134-.596-1.439-.817-1.97-.215-.518-.453-.448-.596-.456-.134-.008-.288-.01-.443-.01-.155 0-.409.058-.62.288-.21.23-.807.788-.807 1.921s.823 2.23 1.054 2.54c.23.31 1.62 2.474 3.924 3.468.548.236 1.066.388 1.431.504.606.192 1.157.165 1.593.1.486-.072 1.57-.642 1.792-1.261.222-.619.222-1.151.155-1.261-.067-.11-.243-.199-.51-.332z"/></svg>
                  <span>WhatsApp Admin</span>
                </a>
                <button
                  onClick={() => {
                    setShowTrialModal(false);
                    setShowCoachGuide(false);
                    setGuideStep(0);
                  }}
                  className="w-full bg-gray-900 border border-gray-850 hover:border-gray-750 text-gray-400 hover:text-white py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
