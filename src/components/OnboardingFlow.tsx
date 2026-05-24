import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  User, Mail, Lock, Dumbbell, Apple, Check, 
  ChevronLeft, ChevronRight, Plus, Trash2, Edit2, 
  Scale, LogOut, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SplashOverlay } from './SplashOverlay';

interface OnboardingFlowProps {
  initialStep?: number;
  onSessionConfigured?: (session: any) => void;
  onComplete?: () => void;
}

interface SplitItem {
  key: string;
  label: string;
  emoji: string;
  color: string;
  desc: string;
}

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

  // Active user session state (Step 1 -> 2 transition)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Step 1: Auth form states
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Workouts split states
  const [splits, setSplits] = useState<SplitItem[]>([
    { key: 'PUSH', label: 'Push', emoji: '🔴', color: '#ef4444', desc: 'Chest · Shoulders · Triceps' },
    { key: 'PULL', label: 'Pull', emoji: '🔵', color: '#3b82f6', desc: 'Back · Rear Delts · Biceps' },
    { key: 'LEGS', label: 'Legs', emoji: '🟡', color: '#eab308', desc: 'Quads · Hams · Glutes · Calves' }
  ]);
  const [newSplitName, setNewSplitName] = useState('');
  const [editingSplitKey, setEditingSplitKey] = useState<string | null>(null);
  const [editingSplitVal, setEditingSplitVal] = useState('');

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
          // If already logged in, automatically advance to workouts
          setStep(2);
        }
      }
    };
    fetchUser();
  }, [step]);

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

  // Navigation handlers
  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep(prev => prev + 1);
    } else {
      // Step 4 (InBody) next -> Submit Onboarding
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

  // Sign up or sign in authentication handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) throw new Error('Please enter your name.');
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } }
        });

        if (error) throw error;
        if (data.user) {
          // Initialize user profile in Database
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            display_name: displayName,
            role: 'client',
            targets: { kcal: 2400, protein: 160, carbs: 240, fat: 70 }
          });
          
          toast.success('Account created! Welcome to Stride Rite.');
          if (data.session) {
            onSessionConfigured?.(data.session);
            setCurrentUser(data.user);
            setDirection(1);
            setStep(2);
          } else {
            toast.success('Please check your email for confirmation link.');
            setIsSignUp(false);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          toast.success(`Welcome back, ${data.session.user.user_metadata?.display_name || data.session.user.email}!`);
          onSessionConfigured?.(data.session);
          setCurrentUser(data.session.user);
          setDirection(1);
          setStep(2);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Log out action (available on Step 1 if user is logged in already)
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    onSessionConfigured?.(null);
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
        desc: 'Custom split day targets'
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
  };

  const startRenameSplit = (item: SplitItem) => {
    setEditingSplitKey(item.key);
    setEditingSplitVal(item.label);
  };

  const saveRenameSplit = () => {
    const trimmed = editingSplitVal.trim();
    if (!trimmed || !editingSplitKey) return;
    setSplits(prev => prev.map(s => {
      if (s.key === editingSplitKey) {
        return { ...s, label: trimmed, key: trimmed.toUpperCase() };
      }
      return s;
    }));
    setEditingSplitKey(null);
  };

  // Submit onboarding details
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || currentUser;
      if (!user) {
        toast.error('No active session. Please sign up or log in first.');
        setStep(1);
        setLoading(false);
        return;
      }

      // 1. Save dynamic workout plans to user_workout_plans
      // Fetch default exercise profiles for basic splits
      const exerciseFallbacks: Record<string, string[]> = {
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

      const planPromises = splits.map(split => {
        const fallbackExs = exerciseFallbacks[split.key] || [];
        const exercisesPayload = fallbackExs.map((name, i) => ({
          id: `onboarding-${split.key.toLowerCase()}-${i}`,
          name,
          sets: 3,
          rest: 120
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

      // 3. Save initial InBody composition scan if weight was entered
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
          bmr: Math.round(10 * weightVal + 6.25 * 175 - 5 * 25 + 5), // rough default BMR formula
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

  return (
    <div className="w-full sm:max-w-[390px] mx-auto min-h-[100dvh] bg-[#090b11] relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800 flex flex-col justify-between text-gray-100 font-sans">
      
      {/* Dynamic ribbon background */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-[#090b11]/80 backdrop-blur-md z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-white/10">
            <Dumbbell size={14} className="text-white" />
          </div>
          <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            STRIDE RITE
          </span>
        </div>

        {/* Skip button (only shown for Steps 2, 3, 4) */}
        {step > 1 && step < 5 && (
          <button 
            onClick={handleSkip} 
            className="text-xs font-bold text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/50 transition-colors active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Skip
          </button>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="px-5 pt-5 pb-2 flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between relative px-2">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-800 z-0">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${((step - 1) / (stepsInfo.length - 1)) * 100}%` }}
            />
          </div>

          {stepsInfo.map((info, idx) => {
            const isCompleted = step > idx + 1;
            const isActive = step === idx + 1;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 z-10 relative">
                <button
                  disabled={idx + 1 > step && !currentUser} // only click visited steps
                  onClick={() => {
                    setDirection(idx + 1 > step ? 1 : -1);
                    setStep(idx + 1);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : isActive 
                        ? 'bg-gradient-to-tr from-blue-600 to-purple-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] scale-110'
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

      {/* Animated Step Content */}
      <div className="flex-1 relative min-h-[420px] flex flex-col justify-center px-5 py-3 overflow-hidden z-20">
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
            
            {/* ── STEP 1: ACCOUNT ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Create Your Account</h2>
                  <p className="text-xs text-gray-500 mt-1">Get started on your athletic performance journey</p>
                </div>

                {currentUser ? (
                  <div className="bg-[#121620]/80 border border-gray-800 rounded-2xl p-5 text-center space-y-4 shadow-xl">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Check size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Account Created Successfully</p>
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
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
                      >
                        Proceed <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAuth} className="space-y-3.5 bg-[#121620]/60 border border-gray-800 p-5 rounded-2xl shadow-xl">
                    {isSignUp && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <input 
                            type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} 
                            placeholder="Alex Mercer" 
                            className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none focus:border-blue-500 transition-colors" 
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                          type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                          placeholder="alex@performance.com" 
                          className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                          type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 pl-10 pr-10 text-white text-xs outline-none focus:border-blue-500 transition-colors" 
                        />
                        <button 
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 shadow-blue-500/10 cursor-pointer mt-2"
                    >
                      {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>

                    <p className="text-center text-[10px] text-gray-400 mt-2">
                      {isSignUp ? 'Already have an account? ' : 'First time here? '}
                      <button 
                        type="button" onClick={() => setIsSignUp(!isSignUp)}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        {isSignUp ? 'Sign In' : 'Create Account'}
                      </button>
                    </p>
                  </form>
                )}
              </div>
            )}

            {/* ── STEP 2: WORKOUTS ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Your Training Program</h2>
                  <p className="text-xs text-gray-500 mt-1">Configure your weekly training splits</p>
                </div>

                {/* Splits list */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                  {splits.map((item) => {
                    const isEditing = editingSplitKey === item.key;
                    return (
                      <div 
                        key={item.key}
                        className="p-3 bg-[#121620]/80 border border-gray-800 hover:border-gray-700/80 rounded-xl flex items-center justify-between transition-all"
                        style={{ borderLeft: `3px solid ${item.color}` }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                          <span className="text-lg shrink-0">{item.emoji}</span>
                          {isEditing ? (
                            <input 
                              autoFocus
                              value={editingSplitVal}
                              onChange={e => setEditingSplitVal(e.target.value)}
                              className="bg-black/50 border border-gray-700 rounded px-2 py-0.5 text-xs text-white outline-none w-full"
                              onKeyDown={e => { if (e.key === 'Enter') saveRenameSplit(); }}
                              onBlur={saveRenameSplit}
                            />
                          ) : (
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.label}</p>
                              <p className="text-[10px] text-gray-500 truncate">{item.desc}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <button onClick={saveRenameSplit} className="text-emerald-400 p-1.5 hover:bg-white/5 rounded-lg">
                              <Check size={13} />
                            </button>
                          ) : (
                            <button onClick={() => startRenameSplit(item)} className="text-gray-500 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                              <Edit2 size={13} />
                            </button>
                          )}
                          <button onClick={() => removeSplit(item.key)} className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add dynamic split */}
                <div className="flex gap-2">
                  <input 
                    value={newSplitName}
                    onChange={e => setNewSplitName(e.target.value)}
                    placeholder="Add day (e.g. Upper, Arms)..." 
                    className="flex-1 bg-[#121620]/60 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={e => { if (e.key === 'Enter') addSplit(); }}
                  />
                  <button 
                    onClick={addSplit}
                    className="px-4 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:shadow-lg active:scale-95 transition-all shadow-blue-500/10 cursor-pointer"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: DIET ── */}
            {step === 3 && (
              <div className="space-y-4 max-h-[360px] overflow-y-auto no-scrollbar pr-1 py-1">
                <div className="text-center">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Diet & Nutrition targets</h2>
                  <p className="text-xs text-gray-500 mt-1">Set calories and hydration baselines</p>
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
                        type="number" value={kcal} onChange={e => setKcal(Math.max(1000, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Protein (g)</label>
                      <input 
                        type="number" value={protein} onChange={e => setProtein(Math.max(50, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Carbs (g)</label>
                      <input 
                        type="number" value={carbs} onChange={e => setCarbs(Math.max(50, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Fat (g)</label>
                      <input 
                        type="number" value={fat} onChange={e => setFat(Math.max(20, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Rest Day Targets Card */}
                <div className="bg-[#121620]/60 border border-gray-800 p-4 rounded-2xl space-y-3 relative shadow-xl">
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
                          setRestKcal(Math.max(1000, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Protein (g)</label>
                      <input 
                        type="number" value={restProtein} 
                        onChange={e => {
                          setRestProtein(Math.max(50, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Carbs (g)</label>
                      <input 
                        type="number" value={restCarbs} 
                        onChange={e => {
                          setRestCarbs(Math.max(50, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Fat (g)</label>
                      <input 
                        type="number" value={restFat} 
                        onChange={e => {
                          setRestFat(Math.max(20, parseInt(e.target.value) || 0));
                          setIsRestOverridden(true);
                        }}
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none" 
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

                <div className="bg-[#121620]/60 border border-gray-800 p-5 rounded-2xl space-y-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weight (kg)</label>
                      <input 
                        type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)}
                        placeholder="e.g. 78.5"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Body Fat %</label>
                      <input 
                        type="number" step="any" value={bfPercent} onChange={e => setBfPercent(e.target.value)}
                        placeholder="e.g. 14.8"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Muscle (SMM kg)</label>
                      <input 
                        type="number" step="any" value={smm} onChange={e => setSmm(e.target.value)}
                        placeholder="e.g. 36.5"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">InBody Score</label>
                      <input 
                        type="number" value={inbodyScore} onChange={e => setInbodyScore(parseInt(e.target.value) || 0)}
                        placeholder="75"
                        className="w-full bg-[#181d29] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors" 
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

      {/* Footer Navigation Buttons */}
      <div className="p-5 border-t border-gray-850 bg-[#0c0f17] flex items-center justify-between gap-3 z-30 sticky bottom-0">
        {step > 1 ? (
          <button 
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-900/50 text-gray-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <ChevronLeft size={14} /> Back
          </button>
        ) : (
          <div /> // dummy empty space to keep layout alignment
        )}

        {step > 1 && (
          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex-1 max-w-[180px] flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xs active:scale-95 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer uppercase tracking-widest border border-white/5 disabled:opacity-50"
          >
            {loading ? 'Saving...' : step === 4 ? (
              <>Finish Onboarding <Check size={14} strokeWidth={2.5} /></>
            ) : (
              <>Next Step <ChevronRight size={14} /></>
            )}
          </button>
        )}
      </div>

      {/* Full-screen Strava Celebration Ribbon Splash Overlay */}
      <SplashOverlay 
        show={showSplash} 
        onComplete={handleSplashFinished} 
        hideText={true} 
      />

    </div>
  );
}
