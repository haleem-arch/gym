// Revert: Rolled back email implementation to restore registration functionality
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LegalModal from '../../components/LegalModals';
import { toast } from 'react-hot-toast';
import { 
  Activity, 
  Apple, 
  Scale, 
  FileText, 
  Users, 
  Check, 
  ArrowRight, 
  Lock, 
  X,
  CheckCircle2,
  Sparkles,
  Phone,
  Calendar,
  Dumbbell,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    title: "For Coaches",
    items: [
      {
        q: "What is Life Gym?",
        a: "Life Gym is a professional coaching management platform that lets you manage all your athletes in one place — their workouts, nutrition, body composition, hydration, and progress — while giving each athlete their own personal tracking portal."
      },
      {
        q: "How many athletes can I manage?",
        a: "Up to 50 active athletes per coach account."
      },
      {
        q: "Can my athletes see their programs in real time?",
        a: "Yes. Any update you make to a client's workout or nutrition syncs to their portal instantly."
      },
      {
        q: "Can I manage athletes from my phone?",
        a: "Yes. Life Gym works on both mobile and desktop with no difference in functionality."
      },
      {
        q: "Can I have multiple training splits per athlete?",
        a: "Yes. You can create custom splits (Push, Pull, Legs, Upper, Lower, or any name you choose) and assign exercises, sets, and rest times to each."
      },
      {
        q: "Can I set different nutrition targets for gym days and rest days?",
        a: "Yes. You can set completely separate macro targets for each day type — gym days, rest days, run days, or any custom day type you create."
      },
      {
        q: "What is the InBody parser?",
        a: "You paste the text from an InBody scan result and Life Gym automatically reads and stores the data — body fat %, muscle mass, BMR, segmental analysis — directly into the athlete's profile. You can also bulk import a full history via CSV."
      },
      {
        q: "Can I add progress notes for my athletes?",
        a: "Yes. You can add private coach notes to any athlete's profile to track their progress over time."
      },
      {
        q: "Can I suspend or deactivate an athlete's access?",
        a: "Yes. You can suspend, reactivate, reset passwords, or fully delete any athlete account at any time from your dashboard."
      }
    ]
  },
  {
    title: "Subscriptions & Billing",
    items: [
      {
        q: "How do I pay for my subscription?",
        a: "You can pay via mobile wallet (Vodafone Cash, etc.) or Telda app. After completing the transfer, you upload a screenshot receipt through the renewal portal and our team verifies it."
      },
      {
        q: "How long does verification take?",
        a: "Typically within a few hours. You'll see your status update in real time — pending, approved, or rejected — without needing to refresh the page."
      },
      {
        q: "What happens when my subscription expires?",
        a: "Your dashboard access is automatically suspended. Your data and all athlete records are kept safe. Once you renew, everything is restored instantly."
      },
      {
        q: "Are payments refundable?",
        a: "No. All payments are strictly non-refundable once a subscription is activated."
      },
      {
        q: "Can I renew before my subscription expires?",
        a: "Yes. You can upgrade or extend your plan at any time from within your dashboard."
      },
      {
        q: "What subscription plans are available?",
        a: "We offer plans for 2 Weeks, 1 Month, 3 Months, and 6 Months."
      }
    ]
  },
  {
    title: "For Athletes",
    items: [
      {
        q: "How do I access my portal?",
        a: "Your coach will provide you with a username and password. You log in through the Life Gym athlete portal on any device."
      },
      {
        q: "What can I see in my portal?",
        a: "You can see your daily workout plan, nutrition targets, water intake goals, InBody scan history, and progress over time — all updated by your coach in real time."
      },
      {
        q: "Can I log my own meals and water?",
        a: "Yes. You can log your daily meals, track your macros, and record your water intake directly from your portal."
      },
      {
        q: "Can I message my coach through the app?",
        a: "Not directly through the app. Communication with your coach happens via WhatsApp. The platform is focused on program delivery and tracking."
      },
      {
        q: "What if I forget my password?",
        a: "Contact your coach. They can reset your password directly from their dashboard."
      },
      {
        q: "Is my data private?",
        a: "Yes. Only you and your assigned coach can see your data. It is never shared with anyone else."
      }
    ]
  },
  {
    title: "Technical",
    items: [
      {
        q: "Does Life Gym work on iPhone and Android?",
        a: "Yes. Life Gym is a web-based platform that works on any device through your browser — no app download required."
      },
      {
        q: "Is my data safe?",
        a: "Yes. All data is stored on encrypted servers. Passwords are never stored in plain text. All connections are secured with SSL/TLS encryption."
      },
      {
        q: "What if the platform is down?",
        a: "We aim for 99% uptime. If you experience issues, contact us via WhatsApp through your coach portal profile page."
      }
    ]
  }
];

export default function CoachLandingPage() {
  const navigate = useNavigate();
  const isElectron = typeof window !== 'undefined' && (!!(window as any).electronAPI || navigator.userAgent.includes('Electron'));
  
  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'signup_choice' | 'athlete_signup'>('login');
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingMode, setOnboardingMode] = useState<'options' | 'download_instructions' | 'form'>('form');
  const [loading, setLoading] = useState(false);
  const [showCreationLoader, setShowCreationLoader] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationText, setCreationText] = useState('Here we start...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'cookies'>('privacy');
  const [isMobile, setIsMobile] = useState(false);

  // Form states (Coach)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedPlan, setSelectedPlan] = useState<'2_weeks' | '1_month' | '3_months' | '6_months'>('1_month');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // Form states (Athlete)
  const [athleteStep, setAthleteStep] = useState(1);
  const [athleteName, setAthleteName] = useState('');
  const [athleteEmail, setAthleteEmail] = useState('');
  const [athletePassword, setAthletePassword] = useState('');
  const [athleteShowPassword, setAthleteShowPassword] = useState(false);
  const [athleteAge, setAthleteAge] = useState('');
  const [athleteHeight, setAthleteHeight] = useState('');
  const [athleteGender, setAthleteGender] = useState<'male' | 'female'>('male');
  const [athleteWeight, setAthleteWeight] = useState('');
  const [athleteBfPercent, setAthleteBfPercent] = useState('');
  const [athleteMuscleMass, setAthleteMuscleMass] = useState('');
  const [athleteBmr, setAthleteBmr] = useState('');
  const [athleteInbodyScore, setAthleteInbodyScore] = useState('70');
  const [athleteAcceptedTerms, setAthleteAcceptedTerms] = useState(false);
  const [athleteAttemptedSubmit, setAthleteAttemptedSubmit] = useState(false);
  const [athleteEmailTaken, setAthleteEmailTaken] = useState(false);
  const [athleteEmailChecking, setAthleteEmailChecking] = useState(false);

  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = leadEmail.trim();
    if (!targetEmail) return;

    setLeadLoading(true);
    try {
      const response = await fetch('/api/send-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to subscribe to mailing list.');
      }

      setLeadSubmitted(true);
      toast.success('Successfully joined mailing list!');
    } catch (err: any) {
      console.error('Lead Capture Error:', err);
      toast.error(err.message || 'Failed to process request.');
    } finally {
      setLeadLoading(false);
    }
  };

  const [attemptedStep1Submit, setAttemptedStep1Submit] = useState(false);
  const [attemptedStep2Submit, setAttemptedStep2Submit] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  const openLegalModal = (type: 'privacy' | 'terms') => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024);
  }, []);

  // Real-time checks for coach email availability in signup
  useEffect(() => {
    const emailVal = email.trim().toLowerCase();
    if (!emailVal) {
      setIsEmailTaken(false);
      return;
    }

    setIsEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailVal)
          .maybeSingle();

        if (error) throw error;
        setIsEmailTaken(!!data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEmailChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  // Real-time checks for athlete email availability in signup
  useEffect(() => {
    const emailVal = athleteEmail.trim().toLowerCase();
    if (!emailVal) {
      setAthleteEmailTaken(false);
      return;
    }

    setAthleteEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailVal)
          .maybeSingle();

        if (error) throw error;
        setAthleteEmailTaken(!!data);
      } catch (err) {
        console.error(err);
      } finally {
        setAthleteEmailChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [athleteEmail]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#faq-billing') {
        setActiveFaq("1-0");
        setTimeout(() => {
          const el = document.getElementById('faq-billing');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/client-login') {
      openAuth('login');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const openAuth = (mode: 'login' | 'register' | 'signup_choice' | 'athlete_signup', plan?: '2_weeks' | '1_month' | '3_months' | '6_months') => {
    setAuthMode(mode);
    if (plan) setSelectedPlan(plan);
    setOnboardingStep(1);
    setErrorMessage(null);

    const isWindows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);
    if (mode === 'register' && isWindows && !isElectron) {
      setOnboardingMode('options');
    } else {
      setOnboardingMode('form');
    }
    setShowAuthModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!authData.user) throw new Error('Sign in failed.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Allow login for mobile athletes, block on desktop
      if (!isMobileDevice && profile && profile.role !== 'coach' && authData.user.id !== OWNER_ID) {
        await supabase.auth.signOut();
        setErrorMessage('athlete_detected');
        return;
      }

      setShowAuthModal(false);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in.');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedStep2Submit(true);
    if (!phone.trim() || !age.trim() || !acceptedTerms) {
      setErrorMessage('Please fill in all profile details and accept the terms.');
      return;
    }
    if (isEmailTaken) {
      setErrorMessage('This email is already registered.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setShowCreationLoader(true);
    setCreationProgress(5);
    setCreationText('Here we start...');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Set signup in progress flag to bypass App.tsx signout race condition
    localStorage.setItem('signup_in_progress', 'true');
    window.dispatchEvent(new Event('signup_status_changed'));

    try {
      // 1. Start background database registration
      const registrationPromise = (async () => {
        const response = await fetch('/api/register-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            displayName: displayName.trim(),
            phone: phone.trim(),
            age,
            gender,
            selectedPlan
          })
        });
        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Failed to register coach account.');
        }

        // Notify Owner via Telegram (non-blocking)
        fetch('/api/notify-new-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: displayName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            gymName: displayName.trim() + " Gym",
            plan: selectedPlan || '1_month',
            age: age,
            gender: gender
          })
        }).catch(notifyErr => {
          console.error('Failed to notify owner:', notifyErr);
        });

        // Sign in client-side immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (signInError) throw signInError;

        // Clean signup flag so App knows they are fully ready
        localStorage.setItem('is_new_signup', 'false');
        localStorage.removeItem('signup_in_progress');
        window.dispatchEvent(new Event('signup_status_changed'));
      })();

      // 2. Animate progress bar smoothly in parallel
      let currentProgress = 5;
      const progressTexts = [
        { min: 0, max: 20, text: 'Here we start...' },
        { min: 20, max: 40, text: 'Creating ur acc...' },
        { min: 40, max: 60, text: 'Organizing ur experience...' },
        { min: 60, max: 80, text: 'Prepparing tutorial...' },
        { min: 80, max: 95, text: 'Organizing clients...' },
        { min: 95, max: 100, text: 'Almost ready...' }
      ];

      while (currentProgress < 95) {
        currentProgress += 1;
        setCreationProgress(currentProgress);

        const activeTextObj = progressTexts.find(t => currentProgress >= t.min && currentProgress < t.max);
        if (activeTextObj) {
          setCreationText(activeTextObj.text);
        }

        await delay(30);
      }

      // 3. Await database execution to complete
      await registrationPromise;

      // 4. Finish progress animation
      while (currentProgress < 100) {
        currentProgress += 1;
        setCreationProgress(currentProgress);
        setCreationText('Almost ready...');
        await delay(25);
      }

      setCreationText('Ready!');
      await delay(600);

      setShowAuthModal(false);
      setShowCreationLoader(false);

      // Redirect automatically
      navigate(window.innerWidth < 1024 ? '/' : '/coach-portal');
    } catch (err: any) {
      setShowCreationLoader(false);
      localStorage.removeItem('signup_in_progress');
      window.dispatchEvent(new Event('signup_status_changed'));
      setErrorMessage(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleAthleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAthleteAttemptedSubmit(true);

    if (
      !athleteName.trim() || 
      !athleteEmail.trim() || 
      athletePassword.length < 6 || 
      !athleteAge.trim() || 
      !athleteHeight.trim() || 
      !athleteWeight.trim() || 
      !athleteAcceptedTerms
    ) {
      toast.error('Please fill in all profile details and accept the terms.');
      return;
    }

    if (athleteEmailTaken) {
      toast.error('This email is already registered.');
      return;
    }

    setLoading(true);
    setShowCreationLoader(true);
    setCreationProgress(5);
    setCreationText('Connecting to server...');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Set signup in progress flag to bypass App.tsx signout race condition
    localStorage.setItem('signup_in_progress', 'true');
    window.dispatchEvent(new Event('signup_status_changed'));

    try {
      // 1. Start background database registration
      const registrationPromise = (async () => {
        const response = await fetch('/api/register-athlete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: athleteEmail.trim(),
            password: athletePassword,
            displayName: athleteName.trim(),
            age: athleteAge,
            height: athleteHeight,
            gender: athleteGender,
            weight: athleteWeight,
            bfPercent: athleteBfPercent,
            muscleMass: athleteMuscleMass,
            bmr: athleteBmr,
            inbodyScore: athleteInbodyScore
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Failed to register athlete account.');
        }

        // Sign in client-side immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: athleteEmail.trim(),
          password: athletePassword
        });
        if (signInError) throw signInError;

        // Clean signup flags
        localStorage.setItem('is_new_signup', 'true'); // Enables welcome splash animation in App.tsx
        localStorage.removeItem('signup_in_progress');
        window.dispatchEvent(new Event('signup_status_changed'));
      })();

      // 2. Animate progress bar smoothly in parallel
      let currentProgress = 5;
      const progressTexts = [
        { min: 0, max: 20, text: 'Creating athlete account...' },
        { min: 20, max: 45, text: 'Setting up default workout plans...' },
        { min: 45, max: 70, text: 'Configuring calorie & macro targets...' },
        { min: 70, max: 90, text: 'Initializing initial InBody scan...' },
        { min: 90, max: 100, text: 'Preparing your workspace...' }
      ];

      while (currentProgress < 95) {
        currentProgress += 1;
        setCreationProgress(currentProgress);

        const activeTextObj = progressTexts.find(t => currentProgress >= t.min && currentProgress < t.max);
        if (activeTextObj) {
          setCreationText(activeTextObj.text);
        }

        await delay(35);
      }

      // 3. Await database execution to complete
      await registrationPromise;

      // 4. Finish progress
      while (currentProgress < 100) {
        currentProgress += 1;
        setCreationProgress(currentProgress);
        setCreationText('Workspace ready!');
        await delay(20);
      }

      await delay(600);
      setShowCreationLoader(false);
      setShowAuthModal(false);
      navigate('/');
    } catch (err: any) {
      setShowCreationLoader(false);
      localStorage.removeItem('signup_in_progress');
      window.dispatchEvent(new Event('signup_status_changed'));
      toast.error(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: -45 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const cardsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardEntranceVariants = {
    hidden: { opacity: 0, y: -25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 15 }
    }
  };

  const sharedFeaturesList = [
    { text: "Manage up to 50 active athletes" },
    { text: "Custom workout splits & day-type macros" },
    { text: "Parse InBody scans & daily water goals" },
    { text: "Athlete portal access with instant syncing" }
  ];

  // MODAL RENDERS
  const renderSignupChoice = () => (
    <div className="space-y-5 text-center py-2">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mx-auto text-blue-500 shadow-md animate-pulse">
        <Dumbbell size={26} />
      </div>
      <div className="space-y-2">
        <h5 className="text-sm font-black text-white uppercase tracking-wider font-sans">Choose Your Profile</h5>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-[300px] mx-auto font-medium">
          Are you training as an athlete or managing a gym as a coach?
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setAthleteStep(1);
            setAthleteAttemptedSubmit(false);
            setAuthMode('athlete_signup');
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
        >
          <Dumbbell size={14} />
          <span>I am an Athlete</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setOnboardingStep(1);
            setOnboardingMode(typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent) ? 'options' : 'form');
          }}
          className="w-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-800 text-zinc-300 font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
        >
          <Users size={14} />
          <span>I am a Coach</span>
        </button>
      </div>
    </div>
  );

  const renderAthleteSignup = () => (
    <form onSubmit={e => e.preventDefault()} className="space-y-4">
      {/* STEP 1 */}
      {athleteStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            <div className="h-1.5 flex-1 rounded-full bg-zinc-900" />
          </div>

          <div className="space-y-1.5 text-left font-sans">
            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Full Name</label>
            <input 
              type="text" 
              required 
              value={athleteName} 
              onChange={e => setAthleteName(e.target.value)} 
              placeholder="e.g. John Doe"
              className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                athleteAttemptedSubmit && !athleteName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
              }`} 
            />
          </div>

          <div className="space-y-1.5 text-left font-sans">
            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Email Address</label>
            <input 
              type="email" 
              required 
              value={athleteEmail} 
              onChange={e => setAthleteEmail(e.target.value.replace(/\s/g, ''))} 
              placeholder="name@example.com"
              className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                (athleteAttemptedSubmit && !athleteEmail.trim()) || athleteEmailTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-850'
              }`} 
            />
            {athleteEmailChecking && <p className="text-[8px] text-zinc-500 mt-0.5 animate-pulse">Checking availability...</p>}
            {athleteEmailTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">This email is already registered.</p>}
          </div>

          <div className="space-y-1.5 text-left font-sans">
            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Password</label>
            <div className="relative">
              <input 
                type={athleteShowPassword ? "text" : "password"} 
                required 
                value={athletePassword} 
                onChange={e => setAthletePassword(e.target.value)} 
                placeholder="Minimum 6 characters"
                className={`w-full bg-zinc-900/60 border rounded-xl pl-3 pr-10 py-3 text-xs text-white outline-none focus:outline-none transition-all ${
                  athleteAttemptedSubmit && athletePassword.length < 6 ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                }`} 
              />
              <button
                type="button"
                onClick={() => setAthleteShowPassword(!athleteShowPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                {athleteShowPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Age</label>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                required 
                value={athleteAge} 
                onChange={e => setAthleteAge(e.target.value.replace(/\D/g, ''))} 
                placeholder="e.g. 25"
                className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                  athleteAttemptedSubmit && !athleteAge.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                }`} 
              />
            </div>

            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Height (cm)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                required 
                value={athleteHeight} 
                onChange={e => setAthleteHeight(e.target.value.replace(/\D/g, ''))} 
                placeholder="e.g. 175"
                className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                  athleteAttemptedSubmit && !athleteHeight.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                }`} 
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left font-sans">
            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Gender</label>
            <div className="grid grid-cols-2 p-1 bg-zinc-900/60 border border-zinc-900 rounded-2xl relative">
              <button
                type="button"
                onClick={() => setAthleteGender('male')}
                className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${athleteGender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Male
                {athleteGender === 'male' && (
                  <motion.div
                    layoutId="modal-athlete-gender-pill"
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-xl z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setAthleteGender('female')}
                className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${athleteGender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Female
                {athleteGender === 'female' && (
                  <motion.div
                    layoutId="modal-athlete-gender-pill"
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-xl z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAuthMode('signup_choice')}
              className="px-6 py-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer active:scale-95"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setAthleteAttemptedSubmit(true);
                if (!athleteName.trim() || !athleteEmail.trim() || athletePassword.length < 6 || !athleteAge.trim() || !athleteHeight.trim()) {
                  if (athletePassword.length > 0 && athletePassword.length < 6) {
                    toast.error('Password must be at least 6 characters.');
                  } else {
                    toast.error('Please fill in all empty fields.');
                  }
                  return;
                }
                if (athleteEmailTaken) {
                  toast.error('Email is already registered. Please use another email.');
                  return;
                }
                setAthleteStep(2);
              }}
              className="flex-1 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Continue</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {athleteStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Weight (kg)</label>
              <input 
                type="text" 
                inputMode="decimal" 
                required 
                value={athleteWeight} 
                onChange={e => setAthleteWeight(e.target.value.replace(/[^0-9.]/g, ''))} 
                placeholder="e.g. 78.5"
                className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                  athleteAttemptedSubmit && !athleteWeight.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-805'
                }`} 
              />
            </div>

            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Body Fat %</label>
              <input 
                type="text" 
                inputMode="decimal" 
                value={athleteBfPercent} 
                onChange={e => setAthleteBfPercent(e.target.value.replace(/[^0-9.]/g, ''))} 
                placeholder="e.g. 14.5"
                className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Muscle Mass (kg)</label>
              <input 
                type="text" 
                inputMode="decimal" 
                value={athleteMuscleMass} 
                onChange={e => setAthleteMuscleMass(e.target.value.replace(/[^0-9.]/g, ''))} 
                placeholder="e.g. 35.8"
                className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
              />
            </div>

            <div className="space-y-1.5 text-left font-sans">
              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">BMR (kcal)</label>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                value={athleteBmr} 
                onChange={e => setAthleteBmr(e.target.value.replace(/\D/g, ''))} 
                placeholder="e.g. 1750"
                className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left font-sans">
            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">InBody Score</label>
            <input 
              type="text" 
              inputMode="numeric" 
              pattern="[0-9]*" 
              value={athleteInbodyScore} 
              onChange={e => setAthleteInbodyScore(e.target.value.replace(/\D/g, ''))} 
              placeholder="e.g. 70"
              className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-800 rounded-xl p-3 text-xs text-white outline-none" 
            />
          </div>

          {/* Terms Acceptance */}
          <div 
            onClick={() => setAthleteAcceptedTerms(!athleteAcceptedTerms)}
            className="flex items-start gap-3 my-3 text-left cursor-pointer group"
          >
            <div className="relative mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                checked={athleteAcceptedTerms} 
                onChange={() => {}} 
                className="sr-only"
              />
              <motion.div 
                animate={{
                  backgroundColor: athleteAcceptedTerms ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.01)",
                  borderColor: athleteAcceptedTerms ? "#ffffff" : (athleteAttemptedSubmit && !athleteAcceptedTerms ? "#ef4444" : "rgba(255, 255, 255, 0.08)")
                }}
                className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-200"
                style={{ borderWidth: athleteAttemptedSubmit && !athleteAcceptedTerms ? '2px' : '1px' }}
              >
                {athleteAcceptedTerms && (
                  <motion.svg 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 text-white"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </motion.div>
            </div>
            <span className={`text-[10px] font-medium leading-normal select-none ${athleteAttemptedSubmit && !athleteAcceptedTerms ? 'text-red-400 font-bold' : 'text-zinc-450'}`}>
              I agree to the{' '}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openLegalModal('privacy'); }}
                className="text-zinc-200 hover:text-white underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openLegalModal('terms'); }}
                className="text-zinc-200 hover:text-white underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
              >
                Terms of Use
              </button>.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" 
              onClick={() => setAthleteStep(1)}
              className="px-6 py-4 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer active:scale-95"
            >
              Back
            </button>
            <button
              type="button" 
              disabled={loading} 
              onClick={handleAthleteSignup}
              className="flex-1 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-550 text-black font-extrabold text-xs uppercase py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {loading ? 'Registering...' : <><CheckCircle2 size={13} /> Complete Registration</>}
            </button>
          </div>
        </div>
      )}
    </form>
  );

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 scroll-smooth no-scrollbar" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      
      {/* HEADER NAVBAR */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <img src="/icon.svg" alt="Life Gym Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white">LIFE GYM</h1>
            <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">YOUR ATHLETE MANAGER</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Platform Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-6">
          {/* Mobile Login Button */}
          <button
            onClick={() => openAuth('login')}
            className="flex md:hidden items-center justify-center px-5 py-2 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            Login
          </button>
          {!isElectron && (
            <a
              href="https://github.com/haleem-arch/gym/releases/latest/download/Life-Gym-Coach-Portal-Setup.exe"
              download
              className="hidden lg:flex items-center gap-3 px-5 py-3 border border-blue-950/60 hover:border-blue-900/80 bg-blue-950/30 hover:bg-blue-950/60 text-xs font-extrabold uppercase tracking-widest text-blue-400 rounded-xl transition-all whitespace-nowrap shadow-md cursor-pointer active:scale-95 group"
              title="Download Life Gym Coach App for Windows"
            >
              <svg className="w-3.5 h-3.5 text-blue-500/80 group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/>
              </svg>
              <span>Download for Windows</span>
            </a>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <span>Already a coach?</span>
            <button 
              onClick={() => openAuth('login')}
              className="text-zinc-350 hover:text-white bg-transparent border-none p-0 cursor-pointer font-black underline"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 sm:pt-28 pb-24 sm:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10 sm:space-y-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/30 border border-blue-900/40 text-[10px] font-black uppercase tracking-wider text-blue-400">
            Life Gym Desktop Portal
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Professional Coaching Portal.<br />
            <span className="text-blue-500">Everything you need to manage your athletes.</span>
          </h2>

          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Design training splits, build day-type nutrition targets, track segmental InBody scans, and sync metrics to the athlete portal in real-time.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <button
                onClick={() => openAuth('signup_choice')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 border border-blue-500/30"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={14} />
              </button>
              
              {isMobile ? (
                <button
                  onClick={() => openAuth('login')}
                  className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Login</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                !isElectron && (
                  <a
                    href="https://github.com/haleem-arch/gym/releases/latest/download/Life-Gym-Coach-Portal-Setup.exe"
                    download
                    className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 shadow-md group"
                  >
                    <svg className="w-4 h-4 fill-current text-blue-600 transition-colors" viewBox="0 0 24 24">
                      <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/>
                    </svg>
                    <span>Download for Windows</span>
                  </a>
                )
              )}
            </div>
            {!isMobile && (
              <p className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">Already have an account? <span onClick={() => openAuth('login')} className="text-zinc-350 hover:text-white cursor-pointer underline font-extrabold">Log In</span></p>
            )}
          </div>
        </motion.div>
      </section>

      {/* CORE FEATURES GRID */}
      <motion.section 
        id="features" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 sm:py-24 border-t border-zinc-900"
      >
        <div className="text-center space-y-4 mb-24 sm:mb-20">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Engineered for Peak Performance</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-medium">Everything you need to deliver a premium service and keep your athletes accountable.</p>
        </div>

        <motion.div 
          variants={cardsContainerVariants}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 sm:gap-6 md:overflow-x-visible md:px-0 md:mx-0 md:pb-0"
        >
          {[
            {
              icon: <Activity size={20} />,
              title: "Adaptive Training Splits",
              desc: "Build highly customized workout templates. Set exercises, rest periods, reps, and warmups. Give clients clear targets."
            },
            {
              icon: <Apple size={20} />,
              title: "Custom Day-Type Nutrition",
              desc: "Set macro plans based on day type (Work vs Rest). Adjust protein, carbs, fat, and hydration templates."
            },
            {
              icon: <Scale size={20} />,
              title: "InBody Scan & Composition",
              desc: "Track client body composition, water, minerals, and muscle mass trends with interactive segmental mapping."
            },
            {
              icon: <FileText size={20} />,
              title: "Excel History Export",
              desc: "Export unified client logs history and biometrics sheets in one click for professional spreadsheet analysis."
            },
            {
              icon: <Users size={20} />,
              title: "Direct Athlete Directory",
              desc: "Manage profiles, onboarding statuses, suspensions, and targets from a centralized dossier catalog."
            },
            {
              icon: <Sparkles size={20} />,
              title: "Instant Athlete Sync",
              desc: "Updates to workouts, nutrition splits, and water targets synchronize to the athlete portal in real-time with zero delay."
            }
          ].map((feat, idx) => (
            <div 
              key={idx}
              className="w-[82vw] shrink-0 snap-center snap-always p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition-all flex flex-col text-left group md:w-auto md:shrink"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 transition-colors">
                {feat.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{feat.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* PLATFORM PREVIEW MOCKUP */}
      <motion.section 
        id="preview" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 sm:py-24 border-t border-zinc-900 text-center"
      >
        <div className="text-center space-y-4 mb-20 sm:mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">A Look Inside the Portal</h3>
          <p className="text-xs text-zinc-400 font-medium">Roster control panel, active check-in tracking logs, and athlete metrics compliance board.</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-[32px] p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="rounded-[22px] border border-zinc-800 overflow-hidden bg-zinc-950 aspect-[1918/1118] flex flex-col">
            {/* Mock Header */}
            <div className="h-10 bg-zinc-900/80 border-b border-zinc-850 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="w-48 h-4 bg-zinc-950 rounded-md flex items-center justify-center text-[8px] font-bold text-zinc-550">
                app.lifegym.com/coach-portal
              </div>
              <div className="w-6 h-4" />
            </div>
            <div className="flex-1 overflow-hidden bg-zinc-950">
              <img 
                src="/coach_portal_preview.png" 
                alt="Life Gym Coach Portal Preview" 
                className="w-full h-full object-contain select-none" 
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* PRICING PLANS */}
      <motion.section 
        id="pricing" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-28 sm:py-24 border-t border-zinc-900 scroll-mt-24"
      >
        <div className="text-center space-y-4 mb-24 sm:mb-20">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Simple, Flexible Billing</h3>
          <p className="text-xs text-zinc-400 font-medium">Choose a package tailored to your coaching business goals. Swap tiers anytime.</p>
          <p className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider mt-1">No payment or credit card required to start your free trial</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveFaq("1-0");
                setTimeout(() => {
                  const el = document.getElementById('faq-billing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white font-extrabold uppercase tracking-wider bg-transparent border-none cursor-pointer underline transition-colors"
            >
              View Billing FAQ
            </button>
          </div>
        </div>

        <motion.div 
          id="billing-plans"
          variants={cardsContainerVariants}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 items-stretch scroll-mt-24 sm:overflow-x-visible sm:px-0 sm:mx-0 sm:pb-0"
        >
          {/* 2 Weeks Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="w-[76vw] shrink-0 snap-center snap-always p-6 sm:p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl sm:rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-zinc-800 transition-all group sm:w-auto sm:shrink"
          >
            <div className="space-y-4 sm:space-y-5">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest bg-zinc-850 border border-zinc-700/60 px-3 py-1 rounded-lg">2 Weeks</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">2,200</span>
                <span className="text-xs text-zinc-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-zinc-550 font-bold">/ 2 weeks</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Perfect for testing the waters and experiencing the premium coaching tools.</p>
              <ul className="space-y-2.5 sm:space-y-3.5 pt-4 sm:pt-5 text-[11px] font-medium text-zinc-350 border-t border-zinc-900">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={12} className="text-zinc-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2 w-full">
              <button 
                onClick={() => openAuth('signup_choice', '2_weeks')}
                className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-100 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-zinc-700/60 transition-all cursor-pointer shadow-md"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">No card needed</span>
            </div>
          </motion.div>

          {/* 1 Month Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="w-[76vw] shrink-0 snap-center snap-always p-6 sm:p-8 bg-zinc-900 border border-blue-500/40 rounded-2xl sm:rounded-[28px] flex flex-col justify-between relative shadow-xl sm:scale-105 hover:border-blue-500 transition-all group sm:w-auto sm:shrink"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-10 border border-blue-500">
              Most Popular
            </div>
            <div className="space-y-4 sm:space-y-5">
              <span className="text-[9px] font-black text-white uppercase tracking-widest bg-blue-950/40 border border-blue-900/60 px-3 py-1 rounded-lg">1 Month</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">3,500</span>
                <span className="text-xs text-blue-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-zinc-405 font-bold">/ month</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Our standard monthly commitment, ideal for consistent training and tracking.</p>
              <ul className="space-y-2.5 sm:space-y-3.5 pt-4 sm:pt-5 text-[11px] font-medium text-zinc-350 border-t border-zinc-800">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={12} className="text-blue-500 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2 w-full">
              <button 
                onClick={() => openAuth('signup_choice', '1_month')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer border border-blue-500/30"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">No card needed</span>
            </div>
          </motion.div>

          {/* 3 Months Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="w-[76vw] shrink-0 snap-center snap-always p-6 sm:p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl sm:rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-zinc-800 transition-all group sm:w-auto sm:shrink"
          >
            <div className="space-y-4 sm:space-y-5">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest bg-zinc-850 border border-zinc-700/60 px-3 py-1 rounded-lg">3 Months</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">8,500</span>
                <span className="text-xs text-zinc-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-zinc-550 font-bold">/ 3 months</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Accelerate your progress with a quarterly plan. Highly recommended for transformations.</p>
              <ul className="space-y-2.5 sm:space-y-3.5 pt-4 sm:pt-5 text-[11px] font-medium text-zinc-350 border-t border-zinc-900">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={12} className="text-zinc-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2 w-full">
              <button 
                onClick={() => openAuth('signup_choice', '3_months')}
                className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-100 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-zinc-700/60 transition-all cursor-pointer shadow-md"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">No card needed</span>
            </div>
          </motion.div>

          {/* 6 Months Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="w-[76vw] shrink-0 snap-center snap-always p-6 sm:p-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl sm:rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-zinc-800 transition-all group sm:w-auto sm:shrink"
          >
            <div className="space-y-4 sm:space-y-5">
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest bg-zinc-850 border border-zinc-700/60 px-3 py-1 rounded-lg">6 Months</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">14,000</span>
                <span className="text-xs text-zinc-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-zinc-550 font-bold">/ 6 months</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">The ultimate commitment to your goals. Best value for serious, long-term coaches.</p>
              <ul className="space-y-2.5 sm:space-y-3.5 pt-4 sm:pt-5 text-[11px] font-medium text-zinc-350 border-t border-zinc-900">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={12} className="text-zinc-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2 w-full">
              <button 
                onClick={() => openAuth('signup_choice', '6_months')}
                className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-100 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-zinc-700/60 transition-all cursor-pointer shadow-md"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">No card needed</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* LEAD CAPTURE SECTION */}
      <motion.section 
        id="lead-capture" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-zinc-900"
      >
        <div className="bg-zinc-900/30 border border-zinc-900 hover:border-blue-900/30 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 backdrop-blur-md transition-colors">
          <div className="space-y-4 max-w-md relative z-10 text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/30 border border-blue-900/40 text-[9px] font-black uppercase tracking-wider text-blue-400">
              Join Our Newsletter
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
              Join the Life Gym Circle
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Subscribe to our mailing list to receive the latest updates, announcements, and strategies for scaling your fitness academy and coach workflows.
            </p>
          </div>

          <div className="mt-8 md:mt-0 max-w-xs w-full shrink-0 relative z-10">
            {leadSubmitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-750 flex items-center justify-center mx-auto text-zinc-200">
                  <Check size={18} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Welcome on board!</h4>
                <p className="text-[9px] text-zinc-400 leading-relaxed">
                  We've successfully added <strong className="text-white">{leadEmail}</strong> to our list. Check your inbox for a welcome message!
                </p>
                <button
                  type="button"
                  onClick={() => setLeadSubmitted(false)}
                  className="text-[9px] text-zinc-355 hover:text-white font-bold underline bg-transparent border-none cursor-pointer"
                >
                  Subscribe another email
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-[8px] uppercase tracking-wider text-zinc-550 font-black pl-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={leadEmail} 
                    onChange={e => setLeadEmail(e.target.value.replace(/\s/g, ''))} 
                    placeholder="coach@yourgym.com"
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-blue-500/50 rounded-xl p-3.5 text-xs text-white outline-none placeholder-zinc-700 transition-all font-medium" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={leadLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-blue-500/10 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-blue-500/30"
                >
                  {leadLoading ? 'Subscribing...' : 'Join Mailing List'}
                </button>
                <p className="text-[8px] text-zinc-650 font-bold text-center">No spam. Unsubscribe anytime in 1-click.</p>
              </form>
            )}
          </div>
        </div>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section 
        id="faq" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-zinc-900"
      >
        <div className="text-center space-y-3 mb-20">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Frequently Asked Questions</h3>
          <p className="text-xs text-zinc-400 font-medium">Got questions? We've got answers. Explore everything about the platform.</p>
        </div>

        <div className="space-y-12">
          {FAQ_CATEGORIES.map((category, catIdx) => (
            <div 
              key={catIdx} 
              id={category.title === 'Subscriptions & Billing' ? 'faq-billing' : undefined}
              className={`space-y-4 text-left ${category.title === 'Subscriptions & Billing' ? 'scroll-mt-24' : ''}`}
            >
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">
                {category.title}
              </h4>
              <div className="space-y-3.5">
                {category.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = activeFaq === id;
                  return (
                    <div 
                      key={itemIdx}
                      className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : id)}
                        className="w-full flex items-center justify-between p-5 text-left text-white bg-transparent outline-none cursor-pointer border-none"
                      >
                        <span className="text-xs font-bold tracking-wide pr-4 text-zinc-200">{item.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-zinc-500 shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 text-[11px] text-zinc-400 leading-relaxed font-medium">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.04] text-center md:flex md:justify-between md:items-center">
        <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} Life Gym Coaching Platform. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-bold mt-4 md:mt-0">
          <button 
            type="button"
            onClick={() => openLegalModal('privacy')} 
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-bold"
          >
            Privacy Policy
          </button>
          <button 
            type="button"
            onClick={() => openLegalModal('terms')} 
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-bold"
          >
            Terms of Use
          </button>
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new Event('reopen_cookie_consent'))} 
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-bold"
          >
            Cookie Preferences
          </button>
          <a 
            href="https://wa.me/201031449441?text=Hello%20Life%20Gym%20Team%2C%20I%20need%20support%20with%20my%20account." 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-bold text-decoration-none"
          >
            Contact Support
          </a>
        </div>
      </footer>

      {/* AUTH & ONBOARDING MODAL OVERLAY */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md"
            />

            {/* Modal Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[28px] overflow-hidden shadow-2xl z-10"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute right-5 top-5 p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors z-20 cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* MODAL HEADER */}
              <div className="p-6 pb-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <img src="/icon.svg" alt="Life Gym Logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white">LIFE GYM PORTAL</h4>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                    {authMode === 'login' 
                      ? 'Authentication' 
                      : authMode === 'signup_choice'
                        ? 'Choose Profile'
                        : authMode === 'athlete_signup'
                          ? 'Athlete Registration'
                          : onboardingMode === 'options' 
                            ? 'Choose Workspace' 
                            : onboardingMode === 'download_instructions'
                              ? 'Setup Instructions'
                              : `Start Free Trial: Step ${onboardingStep} of 2`}
                  </p>
                </div>
              </div>

              {/* error message bar */}
              {errorMessage && errorMessage !== 'athlete_detected' && errorMessage !== 'coach_detected_web' && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-[10px] font-bold p-3 text-center">
                  {errorMessage}
                </div>
              )}

              {/* MODAL BODY CONTROLLER */}
              <div className="p-6">
                {authMode === 'login' ? (
                  errorMessage === 'coach_detected_web' ? (
                    <div className="space-y-4 text-center p-2">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-200 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                      </div>
                      <h5 className="text-sm font-black text-white uppercase tracking-wider">Coach Portal Disabled on Web</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                        The coach portal is no longer accessible through web browsers. Please download and install the Life Gym Desktop App to manage your athletes.
                      </p>
                      <a
                        href="https://github.com/haleem-arch/gym/releases/latest/download/Life-Gym-Coach-Portal-Setup.exe"
                        className="flex items-center justify-center gap-1.5 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        <Download size={12} /> Download Desktop App
                      </a>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="mt-2 text-xs text-zinc-400 hover:text-white font-black uppercase tracking-wider bg-transparent border-none cursor-pointer underline transition-all"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : errorMessage === 'athlete_detected' ? (
                    <div className="space-y-4 text-center p-2">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-200 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>
                      </div>
                      <h5 className="text-sm font-black text-white uppercase tracking-wider">Athlete Account Detected</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                        You are registered as an athlete. To view your workouts, log meals, and update body stats, please log in from your mobile phone.
                      </p>
                      <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-900 text-xs text-zinc-300 font-extrabold break-all select-all text-center">
                        app.lifegym.com/
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="mt-4 text-xs text-zinc-400 hover:text-white font-black uppercase tracking-wider bg-transparent border-none cursor-pointer underline transition-all"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : showForgotModal ? (
                    /* FORGOT PASSWORD VIEW */
                    <div className="space-y-4 text-left">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Reset Password</h4>
                        <p className="text-[10px] text-zinc-550 font-bold uppercase mt-1">Enter your account email to receive a recovery link.</p>
                      </div>

                      {forgotSuccess ? (
                        <div className="space-y-4 text-center py-2 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">
                            We've sent a password reset link to your email. Please check your inbox and click the link to reset your password. (Valid for 10 minutes)
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgotModal(false);
                              setForgotSuccess(false);
                              setForgotEmail('');
                            }}
                            className="w-full mt-2 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-black uppercase text-zinc-300 transition-all cursor-pointer"
                          >
                            Back to Login
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleRequestReset} className="space-y-3.5">
                          <div className="space-y-1.5 text-left font-sans">
                            <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Account Email</label>
                            <input 
                              type="email" 
                              required 
                              value={forgotEmail} 
                              onChange={e => { setForgotEmail(e.target.value); setForgotError(null); }} 
                              placeholder="name@gym.com" 
                              className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-850 rounded-xl p-3 text-xs text-white outline-none" 
                            />
                          </div>

                          {forgotError && (
                            <p className="text-[10px] font-black tracking-widest uppercase text-red-400 text-left leading-relaxed">
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
                              className="flex-1 py-3.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 font-bold text-xs uppercase transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={forgotLoading}
                              className="flex-1 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                            >
                              {forgotLoading ? 'Sending...' : 'Send Link'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    /* LOGIN VIEW */
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Account Email</label>
                        <input 
                          type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@gym.com"
                          className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-850 rounded-xl p-3 text-xs text-white outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                            className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-zinc-850 rounded-xl pl-3 pr-10 py-3 text-xs text-white outline-none" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
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
                            className="text-[10px] text-zinc-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>
                      <button 
                        type="submit" disabled={loading}
                        className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                      >
                        {loading ? 'Logging in...' : <><Lock size={12} /> Sign In to Portal</>}
                      </button>
                      <p className="text-[10px] text-zinc-505 text-center mt-3 font-medium">
                        Don't have an account? <span onClick={() => { setAuthMode('signup_choice'); }} className="text-zinc-300 hover:text-white font-black cursor-pointer underline">Create Account</span>
                      </p>
                    </form>
                  )
                ) : authMode === 'signup_choice' ? (
                  renderSignupChoice()
                ) : authMode === 'athlete_signup' ? (
                  renderAthleteSignup()
                ) : (
                  /* REGISTER TRIAL VIEWS (COACH) */
                  <div>
                    {onboardingMode === 'options' ? (
                      /* CHOICE SCREEN FOR WINDOWS USERS */
                      <div className="space-y-5 text-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mx-auto text-zinc-250 shadow-md">
                          <Download size={26} />
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-black text-white uppercase tracking-wider font-sans">Choose Workspace</h5>
                          <p className="text-xs text-zinc-400 leading-relaxed max-w-[320px] mx-auto font-medium">
                            For the absolute best coaching experience on Windows, we recommend installing our dedicated desktop app.
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = 'https://github.com/haleem-arch/gym/releases/latest/download/Life-Gym-Coach-Portal-Setup.exe';
                              link.download = 'Life-Gym-Coach-Portal-Setup.exe';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              setOnboardingMode('download_instructions');
                            }}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/>
                            </svg>
                            <span>Download Desktop App</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOnboardingMode('form')}
                            className="w-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-850 text-zinc-300 font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                          >
                            <span>Continue via Web Browser</span>
                          </button>
                        </div>
                      </div>
                    ) : onboardingMode === 'download_instructions' ? (
                      /* STEP-BY-STEP INSTRUCTIONS */
                      <div className="space-y-6 text-left py-2">
                        <div className="text-center space-y-2">
                          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-855 flex items-center justify-center mx-auto text-emerald-500 shadow-md">
                            <CheckCircle2 size={26} />
                          </div>
                          <h5 className="text-sm font-black text-white uppercase tracking-wider font-sans">Setup File Downloading</h5>
                          <p className="text-xs text-zinc-400 font-medium">Follow these simple steps to activate your trial:</p>
                        </div>

                        <div className="space-y-4 bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                          <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center text-[10px] font-black text-white shrink-0">1</span>
                            <div className="space-y-1">
                              <h6 className="text-xs font-black text-white uppercase tracking-wider font-sans">Install the App</h6>
                              <p className="text-[11px] text-zinc-400 leading-normal font-medium">Run the downloaded <strong className="text-zinc-200">Life-Gym-Coach-Portal-Setup.exe</strong> installer file.</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center text-[10px] font-black text-white shrink-0">2</span>
                            <div className="space-y-1">
                              <h6 className="text-xs font-black text-white uppercase tracking-wider font-sans">Register Account</h6>
                              <p className="text-[11px] text-zinc-400 leading-normal font-medium">Open the desktop application and fill out the coach registration details.</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center text-[10px] font-black text-white shrink-0">3</span>
                            <div className="space-y-1">
                              <h6 className="text-xs font-black text-white uppercase tracking-wider font-sans">Start Free Trial</h6>
                              <p className="text-[11px] text-zinc-400 leading-normal font-medium">Your 14-day free trial will automatically activate on your new dashboard.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAuthModal(false)}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                          >
                            <span>Got It, Thanks!</span>
                          </button>
                          
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => setOnboardingMode('form')}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider underline bg-transparent border-none cursor-pointer"
                            >
                              Continue in browser instead
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD MULTI-STEP REGISTER FORM */
                      <form onSubmit={e => e.preventDefault()} className="space-y-4">
                        {/* STEP 1: ACCOUNT CREDENTIALS */}
                        {onboardingStep === 1 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                              <div className="h-1.5 flex-1 rounded-full bg-zinc-900" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Full Name</label>
                              <input 
                                type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Captain Coach"
                                className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                  attemptedStep1Submit && !displayName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                                }`} 
                              />
                            </div>
                            <div className="space-y-1.5 font-sans">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Email Address</label>
                              <input 
                                type="email" required value={email} onChange={e => setEmail(e.target.value.replace(/\s/g, ''))} placeholder="coach@lifegym.com"
                                className={`w-full bg-zinc-900/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                  (attemptedStep1Submit && !email.trim()) || isEmailTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                                }`} 
                              />
                              {isEmailChecking && <p className="text-[8px] text-zinc-500 mt-0.5 animate-pulse">Checking availability...</p>}
                              {isEmailTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">This email is already registered.</p>}
                            </div>
                            <div className="space-y-1.5 font-sans">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Secure Password</label>
                              <div className="relative">
                                <input 
                                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters"
                                  className={`w-full bg-zinc-900/60 border rounded-xl pl-3 pr-10 py-3 text-xs text-white outline-none focus:outline-none transition-all ${
                                    attemptedStep1Submit && password.length < 6 ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 focus:border-zinc-800'
                                  }`} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                                >
                                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAttemptedStep1Submit(true);
                                if (!displayName.trim() || !email.trim() || password.length < 6) {
                                  if (password.length > 0 && password.length < 6) {
                                    toast.error('Password must be at least 6 characters.');
                                  } else {
                                    toast.error('Please fill in all empty fields.');
                                  }
                                  return;
                                }
                                if (isEmailTaken) {
                                  toast.error('Email is already registered. Please use another email.');
                                  return;
                                }
                                setOnboardingStep(2);
                              }}
                              className="w-full bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                            >
                              <span>Continue to Profile Setup</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        )}

                        {/* STEP 2: PROFILE DETAILS */}
                        {onboardingStep === 2 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                              <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                            </div>

                            <div className="space-y-1.5 text-left font-sans">
                              <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Phone Number (WhatsApp)</label>
                              <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-250 transition-colors w-4 h-4" />
                                <input 
                                  type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +201012345678"
                                  className={`w-full bg-zinc-900/60 border rounded-2xl p-3.5 pl-11 text-xs text-white outline-none focus:outline-none transition-all placeholder-zinc-700 ${
                                    attemptedStep2Submit && !phone.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 group-hover:border-zinc-800 focus:border-zinc-800'
                                  }`} 
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5 text-left font-sans">
                                <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Age</label>
                                <div className="relative group">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-250 transition-colors w-4 h-4" />
                                  <input 
                                    type="text" 
                                    inputMode="numeric" 
                                    pattern="[0-9]*" 
                                    required 
                                    value={age} 
                                    onChange={e => setAge(e.target.value.replace(/\D/g, ''))} 
                                    placeholder="e.g. 28"
                                    className={`w-full bg-zinc-900/60 border rounded-2xl p-3.5 pl-11 text-xs text-white outline-none focus:outline-none transition-all placeholder-zinc-700 ${
                                      attemptedStep2Submit && !age.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-900 group-hover:border-zinc-800 focus:border-zinc-800'
                                    }`} 
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 text-left font-sans">
                                <label className="text-[9px] uppercase tracking-wider text-zinc-550 font-black pl-1">Gender</label>
                                <div className="grid grid-cols-2 p-1 bg-zinc-900/60 border border-zinc-900 rounded-2xl relative">
                                  <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${gender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                                  >
                                    Male
                                    {gender === 'male' && (
                                      <motion.div
                                        layoutId="gender-pill"
                                        className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-xl z-[-1]"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                      />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${gender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
                                  >
                                    Female
                                    {gender === 'female' && (
                                      <motion.div
                                        layoutId="gender-pill"
                                        className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-xl z-[-1]"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div 
                              onClick={() => setAcceptedTerms(!acceptedTerms)}
                              className="flex items-start gap-3 my-3 text-left cursor-pointer group"
                            >
                              <div className="relative mt-0.5 shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={acceptedTerms} 
                                  onChange={() => {}} 
                                  className="sr-only"
                                />
                                <motion.div 
                                  animate={{
                                    backgroundColor: acceptedTerms ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.01)",
                                    borderColor: acceptedTerms ? "#ffffff" : (attemptedStep2Submit ? "#ef4444" : "rgba(255, 255, 255, 0.08)")
                                  }}
                                  className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-200"
                                  style={{ borderWidth: attemptedStep2Submit && !acceptedTerms ? '2px' : '1px' }}
                                >
                                  {acceptedTerms && (
                                    <motion.svg 
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2.5 h-2.5 text-white"
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="3.5" 
                                      viewBox="0 0 24 24"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </motion.svg>
                                  )}
                                </motion.div>
                              </div>
                              <span className={`text-[10px] font-medium leading-normal select-none ${attemptedStep2Submit && !acceptedTerms ? 'text-red-400 font-bold' : 'text-zinc-450'}`}>
                                I agree to the{' '}
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openLegalModal('privacy'); }}
                                  className="text-zinc-200 hover:text-white underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
                                >
                                  Privacy Policy
                                </button>{' '}
                                and{' '}
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openLegalModal('terms'); }}
                                  className="text-zinc-200 hover:text-white underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
                                >
                                  Terms of Use
                                </button>.
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-2 mt-2 w-full">
                              <div className="flex gap-3 w-full">
                                <button
                                  type="button" onClick={() => setOnboardingStep(1)}
                                  className="px-6 py-4 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer active:scale-95"
                                >
                                  Back
                                </button>
                                <button
                                  type="button" disabled={loading} onClick={handleRegister}
                                  className="flex-1 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-550 text-black font-extrabold text-xs uppercase py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                >
                                  {loading ? 'Starting Trial...' : <><CheckCircle2 size={13} /> Start My Free Trial</>}
                                </button>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-bold tracking-wide mt-1 uppercase">No card needed</span>
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-zinc-550 text-center mt-3 font-medium">
                          Already have an account? <span onClick={() => { setAuthMode('login'); }} className="text-zinc-300 hover:text-white font-black cursor-pointer underline">Sign In</span>
                        </p>
                      </form>
                    )}
                  </div>
                )}
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {legalModalOpen && (
          <LegalModal 
            isOpen={legalModalOpen} 
            onClose={() => setLegalModalOpen(false)} 
            type={legalModalType} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreationLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/98 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="space-y-8 max-w-xs relative z-10">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-lg"
                >
                  <Dumbbell size={28} />
                </motion.div>
              </div>

              <div className="space-y-4">
                <div>
                  <motion.span 
                    key={creationProgress}
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black text-white tracking-widest font-mono"
                  >
                    {creationProgress}
                  </motion.span>
                  <span className="text-sm font-black text-zinc-400 tracking-wider ml-1">%</span>
                </div>

                <div className="w-56 h-2 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: `${creationProgress}%` }}
                  />
                </div>
              </div>

              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={creationText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-zinc-400 font-extrabold tracking-widest uppercase"
                  >
                    {creationText}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Widget */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-[120] group"
      >
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3.5 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-xl whitespace-nowrap translate-x-2 group-hover:translate-x-0">
          Chat with us!
        </div>

        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping pointer-events-none scale-105" />

        <a
          href="https://wa.me/201031449441?text=Hey%20Life%20Gym%2520team!%20I%20have%20a%2520question%2520about%2520the%2520coaching%2520platform..."
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-500/40 border border-emerald-400/20 active:scale-95 transition-all duration-200 cursor-pointer relative"
        >
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>

          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-[2.5px] border-[#09090b] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </a>
      </motion.div>

    </div>
  );
}
