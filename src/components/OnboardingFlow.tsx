import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  User, Lock, Dumbbell, Apple, Check, 
  ChevronLeft, ChevronRight, Plus, Trash2, 
  Scale, LogOut, ArrowRight, Eye, EyeOff, Search, X,
  Mail, CheckCircle
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

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

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

        // Start: center of login button relative to card
        const startX = btnRect.left - cardRect.left + btnRect.width / 2;
        const startY = btnRect.top - cardRect.top + btnRect.height / 2;

        // End: point directly at the checkbox (raised higher)
        const endX = cbRect.left - cardRect.left + 8;
        const endY = cbRect.top - cardRect.top + 8;

        // Curved path swooping to the right (arched upwards, never goes below the button)
        const controlX = Math.max(startX, endX) + 110;
        const controlY = (startY + endY) / 2 - 25;

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
        { id: 'onb-push-0', name: 'Incline DB Bench Press (45 Degree)', muscle_group: 'Chest', sets: 3, rest: 120 },
        { id: 'onb-push-1', name: 'DB Shoulder Press (seated neutral)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
        { id: 'onb-push-2', name: 'Incline DB Y-Raise (20-30 Degree)', muscle_group: 'Shoulders', sets: 3, rest: 120 },
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
        { id: 'onb-legs-4', name: '45 Degree Back Extension (BW/DB)', muscle_group: 'Hamstrings', sets: 3, rest: 120 },
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
        if (window.location.pathname.startsWith('/coach-portal')) {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .maybeSingle();

          const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
          if (profileErr || (profile?.role !== 'coach' && data.session.user.id !== OWNER_ID)) {
            await supabase.auth.signOut();
            throw new Error('Access Denied. Only coaches can log in on this page.');
          }
        }
        localStorage.removeItem('is_new_signup'); // ensure no onboarding triggered
        toast.success('Welcome back!');
        onSessionConfigured?.(data.session);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Sign in failed.');
      toast.error(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('Email is required.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    try {
      const finalEmail = forgotEmail.includes('@') ? forgotEmail.trim() : `${forgotEmail.trim().toLowerCase()}@stride.fit`;
      
      const res = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: finalEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(true);
        toast.success('Reset link sent!');
      } else {
        setForgotError(data.error || 'Failed to request password reset.');
        toast.error(data.error || 'Failed to request password reset.');
      }
    } catch (err) {
      console.error('Request reset error:', err);
      setForgotError('Failed to send reset link. Please check your connection.');
      toast.error('Failed to send reset link.');
    } finally {
      setForgotLoading(false);
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
    <div className="w-full sm:max-w-[390px] mx-auto min-h-[100dvh] bg-[#060610] relative overflow-y-auto overflow-x-hidden shadow-2xl sm:border-x sm:border-gray-800 flex flex-col justify-between text-gray-100 font-sans pb-8 sm:pb-0">
      
      {/* Dynamic brand blue ribbon glow background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div 
        className="px-5 pb-5 flex items-center justify-between border-b border-gray-800 bg-[#060610]/80 backdrop-blur-md z-30 sticky top-0"
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
            
            {/* ── STEP 1: SIGN IN ── */}
            {step === 1 && (
              <div ref={cardRef} className="space-y-5 relative">
                <div className="text-center">
                  <LoginLogo className="mx-auto mb-3" errorMsg={errorMsg} />
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Sign in to continue your training journey
                  </p>
                </div>

                {currentUser ? (
                  <div className="bg-[#121620]/80 border border-gray-800 rounded-2xl p-5 text-center space-y-4 shadow-xl">
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
                        className="flex-1 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
                ) : showForgotModal ? (
                  /* ── FORGOT PASSWORD FORM ── */
                  <div className="space-y-4 bg-[#121620]/60 border border-gray-800 p-5 rounded-2xl shadow-xl text-left">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Reset Password</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Enter your account email to receive a recovery link.</p>
                    </div>

                    {forgotSuccess ? (
                      <div className="space-y-4 text-center py-2 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed font-bold">
                          We've sent a password reset link to your email. Please check your inbox and click the link to reset your password. (Valid for 10 minutes)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotModal(false);
                            setForgotSuccess(false);
                            setForgotEmail('');
                          }}
                          className="w-full mt-2 py-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-xl text-xs font-black uppercase text-gray-300 transition-all cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleRequestReset} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input 
                              type="text" 
                              required 
                              value={forgotEmail} 
                              onChange={e => { setForgotEmail(e.target.value); setForgotError(null); }} 
                              placeholder="name@example.com" 
                              className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-[16px] outline-none focus:border-blue-500 transition-colors" 
                            />
                          </div>
                        </div>

                        {forgotError && (
                          <p className="text-[10px] font-black tracking-widest uppercase text-red-400 leading-relaxed">
                            ⚠️ {forgotError}
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgotModal(false);
                              setForgotError(null);
                              setForgotEmail('');
                            }}
                            className="flex-1 py-3 rounded-xl border border-gray-800 bg-[#181d29] hover:bg-gray-900 text-gray-400 font-bold text-xs uppercase transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={forgotLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                          >
                            {forgotLoading ? 'Sending...' : 'Send Link'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* ── SIGN IN FORM ── */
                  <form onSubmit={handleSignInAuth} className="space-y-3.5 bg-[#121620]/60 border border-gray-800 p-5 rounded-2xl shadow-xl">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Username</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                          type="text" required value={email} onChange={e => { setEmail(e.target.value); if (errorMsg) setErrorMsg(null); }} 
                          placeholder="e.g. ahmed" 
                          className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-[16px] outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                          type={showPassword ? "text" : "password"} required value={password} onChange={e => { setPassword(e.target.value); if (errorMsg) setErrorMsg(null); }} 
                          placeholder="••••••••" 
                          className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-10 text-white text-[16px] outline-none focus:border-blue-500 transition-colors" 
                        />
                        <button 
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <div className="text-right pt-1 select-none">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowForgotModal(true);
                            setForgotEmail(email);
                            setForgotError(null);
                            setForgotSuccess(false);
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                    {/* Legal Checkbox */}
                    <div ref={privacyContainerRef} className="flex items-start gap-2.5 pt-1.5 pb-1 select-none relative">
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
                        className="mt-0.5 h-4 w-4 rounded border-gray-800 bg-[#181d29] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#121620] focus:ring-2 cursor-pointer transition-colors"
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
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 shadow-blue-500/20 cursor-pointer mt-1"
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
                      className="w-full mt-1 py-2 text-[10px] text-gray-600 hover:text-gray-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      Clear cache &amp; hard refresh
                    </button>
                  </form>
                )}

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

                      {/* Quadratic bezier: center of button → swoops right → checkbox */}
                      <motion.path
                        d={`M ${arrowPoints.startX} ${arrowPoints.startY} Q ${arrowPoints.controlX} ${arrowPoints.controlY} ${arrowPoints.endX} ${arrowPoints.endY}`}
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
    </div>
  );
}
