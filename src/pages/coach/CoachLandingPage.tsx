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
  Dumbbell
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreationLoader, setShowCreationLoader] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationText, setCreationText] = useState('Here we start...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  const openLegalModal = (type: 'privacy' | 'terms') => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.replace('/client-login');
    }
  }, []);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedPlan, setSelectedPlan] = useState<'2_weeks' | '1_month' | '3_months' | '6_months'>('1_month');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const [attemptedStep1Submit, setAttemptedStep1Submit] = useState(false);
  const [attemptedStep2Submit, setAttemptedStep2Submit] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

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


  const openAuth = (mode: 'login' | 'register', plan?: '2_weeks' | '1_month' | '3_months' | '6_months') => {
    setAuthMode(mode);
    if (plan) setSelectedPlan(plan);
    setOnboardingStep(1);
    setErrorMessage(null);
    setShowAuthModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';

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

      if (profile && profile.role !== 'coach' && authData.user.id !== OWNER_ID) {
        await supabase.auth.signOut();
        setErrorMessage('athlete_detected');
        return;
      }

      setShowAuthModal(false);
      navigate(window.innerWidth < 1024 ? '/coach/dashboard' : '/coach-portal');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
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
        // Create authentication user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed.');

        // Normalize username
        const baseUser = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueUsername = `${baseUser}${Math.floor(1000 + Math.random() * 9000)}`;

        // Use display name or default for gymName internally to keep Supabase payload correct
        const finalGymName = displayName.trim() + " Gym";

        // Insert profile record with role = 'coach'
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: uniqueUsername,
            email: email.trim(),
            display_name: displayName.trim(),
            role: 'coach',
            targets: {
              onboarding_completed: true,
              is_new_signup: false,
              show_welcome_animation: true,
              phone_number: phone.trim(),
              gym_name: finalGymName,
              subscription_plan: selectedPlan || '1_month',
              subscription_status: 'trial',
              trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              age: parseInt(age) || null,
              gender: gender
            }
          });

        if (profileError) throw profileError;

        // Notify Owner via Telegram Bot (Non-blocking background fetch)
        fetch('/api/notify-new-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: displayName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            gymName: finalGymName,
            plan: selectedPlan || '1_month',
            age: age,
            gender: gender
          })
        }).catch(notifyErr => {
          console.error('Failed to notify owner:', notifyErr);
        });

        // Clean signup flag so App knows they are fully ready
        localStorage.setItem('is_new_signup', 'false');
        localStorage.removeItem('signup_in_progress');
        window.dispatchEvent(new Event('signup_status_changed'));
      })();

      // 2. Animate progress bar smoothly in parallel
      const progressTexts = [
        { min: 0, max: 20, text: 'Here we start...' },
        { min: 20, max: 40, text: 'Creating ur acc...' },
        { min: 40, max: 60, text: 'Organizing ur experience...' },
        { min: 60, max: 80, text: 'Prepparing tutorial...' },
        { min: 80, max: 95, text: 'Organizing clients...' },
        { min: 95, max: 100, text: 'Almost ready...' }
      ];

      const timerPromise = delay(2500); // 2.5 seconds minimum parallel delay
      const startTime = Date.now();
      const climbDuration = 2300; // Climb to 95% over 2.3 seconds

      while (true) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= climbDuration) {
          setCreationProgress(95);
          setCreationText('Almost ready...');
          break;
        }

        const currentPct = 5 + Math.floor((elapsed / climbDuration) * 90);
        setCreationProgress(currentPct);

        const activeTextObj = progressTexts.find(t => currentPct >= t.min && currentPct < t.max);
        if (activeTextObj) {
          setCreationText(activeTextObj.text);
        }

        await delay(30);
      }

      // 3. Await BOTH the database inserts and the minimum 2.5s timer to complete
      await Promise.all([registrationPromise, timerPromise]);

      // 4. Finish animation from 95% to 100%
      let currentProgress = 95;
      while (currentProgress < 100) {
        currentProgress += 1;
        setCreationProgress(currentProgress);
        setCreationText('Almost ready...');
        await delay(20); // ~100ms total
      }

      setCreationText('Ready!');
      await delay(400); // 400ms display

      setShowAuthModal(false);
      setShowCreationLoader(false);

      // Redirect to log them in automatically
      navigate(window.innerWidth < 1024 ? '/coach/dashboard' : '/coach-portal');
    } catch (err: any) {
      setShowCreationLoader(false);
      localStorage.removeItem('signup_in_progress');
      window.dispatchEvent(new Event('signup_status_changed'));
      setErrorMessage(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants for section slide down
  const sectionVariants = {
    hidden: { opacity: 0, y: -45 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  // Staggered card container variants
  const cardsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Card slide-down entrance
  const cardEntranceVariants = {
    hidden: { opacity: 0, y: -25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 15 }
    }
  };

  // Icon interactive hover and load variants
  const iconVariants = {
    hidden: { scale: 0.75, rotate: -15, opacity: 0 },
    visible: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 220, damping: 15 }
    },
    hover: { 
      scale: 1.25, 
      rotate: [0, -10, 15, -5, 0],
      transition: { duration: 0.45, ease: "easeInOut" as const }
    }
  };

  const sharedFeaturesList = [
    { text: "Manage up to 50 active athletes" },
    { text: "Custom workout splits & day-type macros" },
    { text: "Parse InBody scans & daily water goals" },
    { text: "Athlete portal access with instant syncing" }
  ];

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-[#060713] text-gray-100 font-sans selection:bg-blue-500/30 scroll-smooth no-scrollbar">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center shadow-lg border border-blue-500/20">
            <img src="/icon.svg" alt="Life Gym Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white">LIFE GYM</h1>
            <p className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">YOUR ULTIMATE FITNESS COACHING APP</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Platform Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <span>Already have an account?</span>
            <button 
              onClick={() => openAuth('login')}
              className="text-blue-400 hover:text-blue-300 bg-transparent border-none p-0 cursor-pointer font-black"
            >
              Log In (Coaches Only)
            </button>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('pricing');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider text-blue-400">
            <Sparkles size={11} /> Next-Gen Fitness Coaching Platform
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Scale Your Coaching Business,<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Not Your Admin Work.</span>
          </h2>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Design workouts splits, build nutrition targets, track body composition scans, and communicate with athletes on a single premium dashboard.
          </p>

          <div className="pt-6 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('pricing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => openAuth('login')}
                className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Coach Login
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">Already have an account? <span onClick={() => openAuth('login')} className="text-blue-400 hover:text-blue-300 cursor-pointer underline">Log In</span> (Coaches Only)</p>
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
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.03]"
      >
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Engineered for Peak Performance</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">Everything you need to deliver a premium service and keep your athletes accountable.</p>
        </div>

        <motion.div 
          variants={cardsContainerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Activity className="text-blue-400" size={24} />,
              title: "Adaptive Training Splits",
              desc: "Build highly customized workout templates. Set exercises, rest periods, reps, and warmups. Give clients clear targets."
            },
            {
              icon: <Apple className="text-purple-400" size={24} />,
              title: "Custom Day-Type Nutrition",
              desc: "Set macro plans based on day type (Work vs Rest). Adjust protein, carbs, fat, and hydration templates."
            },
            {
              icon: <Scale className="text-emerald-400" size={24} />,
              title: "InBody Scan & Composition",
              desc: "Track client body composition, water, minerals, and muscle mass trends with interactive segmental mapping."
            },
            {
              icon: <FileText className="text-orange-400" size={24} />,
              title: "Excel History Export",
              desc: "Export unified client logs history and biometrics sheets in one click for professional spreadsheet analysis."
            },
            {
              icon: <Users className="text-pink-400" size={24} />,
              title: "Direct Athlete Directory",
              desc: "Manage profiles, onboarding statuses, suspensions, and targets from a centralized dossier catalog."
            },
            {
              icon: <Sparkles className="text-cyan-400" size={24} />,
              title: "Instant Athlete Sync",
              desc: "Updates to workouts, nutrition splits, and water targets synchronize to the athlete portal in real-time with zero delay."
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              variants={cardEntranceVariants}
              whileHover="hover"
              className="p-8 rounded-[24px] bg-[#111326]/30 border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#111326]/50 transition-all shadow-lg flex flex-col group cursor-default"
            >
              <motion.div 
                variants={iconVariants}
                className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6"
              >
                {feat.icon}
              </motion.div>
              <h4 className="text-sm font-black text-white mb-3 tracking-wide">{feat.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* PLATFORM PREVIEW MOCKUP (HIGH FIDELITY MOCK COACH PORTAL) */}
      <motion.section 
        id="preview" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.03] text-center"
      >
        <div className="text-center space-y-3 mb-12">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">A Look Inside the Portal</h3>
          <p className="text-xs text-gray-400">Roster control panel, active check-in tracking logs, and athlete metrics compliance board.</p>
        </div>

        <div className="bg-[#111326]/50 border border-white/[0.06] rounded-[32px] p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="rounded-[22px] border border-white/[0.05] overflow-hidden bg-[#070814]/90 aspect-[1918/1118] flex flex-col">
            
            {/* Mock Header */}
            <div className="h-10 bg-[#0a0b16] border-b border-white/[0.03] px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="w-48 h-4 bg-white/5 rounded-md flex items-center justify-center text-[8px] font-bold text-gray-400">
                app.lifegym.com/coach-portal
              </div>
              <div className="w-6 h-4" />
            </div>
            {/* High Fidelity Mock Content Layout */}
            <div className="flex-1 overflow-hidden bg-[#070814]">
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
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.03]"
      >
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Simple, Flexible Billing</h3>
          <p className="text-xs text-gray-400">Choose a package tailored to your coaching business goals. Swap tiers anytime.</p>
          <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider mt-1">No payment or credit card required to start your free trial</p>
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
              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer underline"
            >
              View Billing FAQ
            </button>
          </div>
        </div>

        <motion.div 
          variants={cardsContainerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {/* 2 Weeks Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="p-6 bg-[#111326]/30 border border-white/[0.04] rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-white/[0.1] hover:bg-[#111326]/40 transition-all group"
          >
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">2 Weeks</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">2,200</span>
                <span className="text-xs text-gray-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 2 weeks</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Perfect for testing the waters and experiencing the premium coaching tools.</p>
              <ul className="space-y-2 pt-4 text-[11px] font-medium text-gray-300 border-t border-white/[0.03]">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={12} className="text-blue-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col items-center gap-1.5 w-full">
              <button 
                onClick={() => openAuth('register', '2_weeks')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-gray-500 font-bold">No card needed</span>
            </div>
          </motion.div>

          {/* 1 Month Plan (Popular) */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="p-6 bg-[#161a35]/60 border border-blue-500/30 rounded-[28px] flex flex-col justify-between relative shadow-xl scale-105 hover:border-blue-500/50 transition-all group"
          >
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg z-10">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">1 Month</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">3,500</span>
                <span className="text-xs text-gray-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-gray-500 font-bold">/ month</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Our standard monthly commitment, ideal for consistent training and tracking.</p>
              <ul className="space-y-2 pt-4 text-[11px] font-medium text-gray-300 border-t border-white/[0.03]">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={12} className="text-blue-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col items-center gap-1.5 w-full">
              <button 
                onClick={() => openAuth('register', '1_month')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-gray-550 font-bold">No card needed</span>
            </div>
          </motion.div>

          {/* 3 Months Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="p-6 bg-[#111326]/30 border border-white/[0.04] rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-white/[0.1] hover:bg-[#111326]/40 transition-all group"
          >
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">3 Months</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">8,500</span>
                <span className="text-xs text-gray-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 3 months</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Accelerate your progress with a quarterly plan. Highly recommended for transformations.</p>
              <ul className="space-y-2 pt-4 text-[11px] font-medium text-gray-300 border-t border-white/[0.03]">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={12} className="text-blue-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col items-center gap-1.5 w-full">
              <button 
                onClick={() => openAuth('register', '3_months')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-gray-500 font-bold">No card needed</span>
            </div>
          </motion.div>

          {/* 6 Months Plan */}
          <motion.div 
            variants={cardEntranceVariants}
            whileHover="hover"
            className="p-6 bg-[#111326]/30 border border-white/[0.04] rounded-[28px] flex flex-col justify-between relative shadow-lg hover:border-white/[0.1] hover:bg-[#111326]/40 transition-all group"
          >
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">6 Months</span>
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-2xl font-black text-white">14,000</span>
                <span className="text-xs text-gray-400 font-extrabold">EGP</span>
                <span className="text-[10px] text-gray-500 font-bold">/ 6 months</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">The ultimate commitment to your goals. Best value for serious, long-term coaches.</p>
              <ul className="space-y-2 pt-4 text-[11px] font-medium text-gray-300 border-t border-white/[0.03]">
                {sharedFeaturesList.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={12} className="text-blue-400 shrink-0 mt-0.5" /> 
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col items-center gap-1.5 w-full">
              <button 
                onClick={() => openAuth('register', '6_months')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Start Free Trial
              </button>
              <span className="text-[9px] text-gray-550 font-bold">No card needed</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section 
        id="faq" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-white/[0.03]"
      >
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-400">Got questions? We've got answers. Explore everything about the platform.</p>
        </div>

        <div className="space-y-12">
          {FAQ_CATEGORIES.map((category, catIdx) => (
            <div 
              key={catIdx} 
              id={category.title === 'Subscriptions & Billing' ? 'faq-billing' : undefined}
              className="space-y-4 text-left"
            >
              <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest pl-1">
                {category.title}
              </h4>
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = activeFaq === id;
                  return (
                    <div 
                      key={itemIdx}
                      className="bg-[#111326]/20 border border-white/[0.04] rounded-2xl overflow-hidden hover:border-white/[0.08] transition-all duration-300"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : id)}
                        className="w-full flex items-center justify-between p-5 text-left text-white bg-transparent outline-none cursor-pointer border-none"
                      >
                        <span className="text-xs font-bold tracking-wide pr-4">{item.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-500 shrink-0"
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
                            <div className="px-5 pb-5 text-[11px] text-gray-400 leading-relaxed font-medium">
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
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
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
              className="absolute inset-0 bg-[#060713]/85 backdrop-blur-md"
            />

            {/* Modal Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#111326] border border-white/[0.06] rounded-[28px] overflow-hidden shadow-2xl z-10"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute right-5 top-5 p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors z-20 cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* MODAL HEADER */}
              <div className="p-6 pb-4 border-b border-white/[0.04] bg-[#0c0d1b] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-blue-500/20">
                  <img src="/icon.svg" alt="Life Gym Logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white">LIFE GYM COACH HUB</h4>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">{authMode === 'login' ? 'Authentication' : `Start Free Trial: Step ${onboardingStep} of 2`}</p>
                </div>
              </div>

              {/* error message bar */}
              {errorMessage && errorMessage !== 'athlete_detected' && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-[10px] font-bold p-3 text-center">
                  {errorMessage}
                </div>
              )}

              {/* MODAL BODY CONTROLLER */}
              <div className="p-6">
                {authMode === 'login' ? (
                  errorMessage === 'athlete_detected' ? (
                    <div className="space-y-4 text-center p-2">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>
                      </div>
                      <h5 className="text-sm font-black text-white uppercase tracking-wider">Athlete Account Detected</h5>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                        You are registered as an athlete. To view your workouts, log meals, and update body stats, please log in from your mobile phone.
                      </p>
                      <div className="p-3.5 bg-[#080910] rounded-2xl border border-white/[0.04] text-xs text-blue-400 font-extrabold break-all select-all text-center">
                        app.lifegym.com/client-login
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-black uppercase tracking-wider bg-transparent border-none cursor-pointer underline transition-all"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    /* LOGIN VIEW */
                    <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Account Email</label>
                      <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@gym.com"
                        className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Password</label>
                      <input 
                        type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                      />
                    </div>
                    <button 
                      type="submit" disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                    >
                      {loading ? 'Logging in...' : <><Lock size={12} /> Sign In to Portal</>}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-3 font-medium">
                      Don't have an account? <span onClick={() => { setAuthMode('register'); setOnboardingStep(1); }} className="text-blue-400 hover:text-blue-300 font-black cursor-pointer">Register Trial</span>
                    </p>
                  </form>
                )
              ) : (
                  /* MULTI-STEP REGISTER TRIAL VIEW */
                  <form onSubmit={e => e.preventDefault()} className="space-y-4">
                    
                    {/* STEP 1: ACCOUNT CREDENTIALS */}
                    {onboardingStep === 1 && (
                      <div className="space-y-4">
                        {/* Stepper Progress Bar */}
                        <div className="flex items-center gap-2 mb-6">
                          <div className="h-1.5 flex-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                          <div className="h-1.5 flex-1 rounded-full bg-white/5" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Full Name</label>
                          <input 
                            type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Captain Coach"
                            className={`w-full bg-[#0a0b16]/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                              attemptedStep1Submit && !displayName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-white/[0.05] focus:border-blue-500/50'
                            }`} 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Email Address</label>
                          <input 
                            type="email" required value={email} onChange={e => setEmail(e.target.value.replace(/\s/g, ''))} placeholder="coach@lifegym.com"
                            className={`w-full bg-[#0a0b16]/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                              (attemptedStep1Submit && !email.trim()) || isEmailTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-white/[0.05] focus:border-blue-500/50'
                            }`} 
                          />
                          {isEmailChecking && <p className="text-[8px] text-gray-500 mt-0.5 animate-pulse">Checking availability...</p>}
                          {isEmailTaken && <p className="text-[8px] text-red-400 font-bold mt-0.5">This email is already registered.</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Secure Password</label>
                          <input 
                            type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters"
                            className={`w-full bg-[#0a0b16]/60 border rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all ${
                              attemptedStep1Submit && password.length < 6 ? 'border-red-500 ring-1 ring-red-500' : 'border-white/[0.05] focus:border-blue-500/50'
                            }`} 
                          />
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
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                        >
                          <span>Continue to Profile Setup</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: PROFILE DETAILS */}
                    {onboardingStep === 2 && (
                      <div className="space-y-4">
                        {/* Stepper Progress Bar */}
                        <div className="flex items-center gap-2 mb-6">
                          <div className="h-1.5 flex-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                          <div className="h-1.5 flex-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] animate-pulse" />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-black pl-1">Phone Number (WhatsApp)</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors w-4 h-4" />
                            <input 
                              type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +201012345678"
                              className={`w-full bg-[#060712]/60 border rounded-2xl p-3.5 pl-11 text-xs text-white outline-none focus:outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] ${
                                attemptedStep2Submit && !phone.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-white/[0.06] group-hover:border-white/[0.12] focus:border-emerald-500/50'
                              }`} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] uppercase tracking-wider text-gray-400 font-black pl-1">Age</label>
                            <div className="relative group">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors w-4 h-4" />
                              <input 
                                type="text" 
                                inputMode="numeric" 
                                pattern="[0-9]*" 
                                required 
                                value={age} 
                                onChange={e => setAge(e.target.value.replace(/\D/g, ''))} 
                                placeholder="e.g. 28"
                                className={`w-full bg-[#060712]/60 border rounded-2xl p-3.5 pl-11 text-xs text-white outline-none focus:outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)] ${
                                  attemptedStep2Submit && !age.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-white/[0.06] group-hover:border-white/[0.12] focus:border-emerald-500/50'
                                }`} 
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] uppercase tracking-wider text-gray-400 font-black pl-1">Gender</label>
                            <div className="grid grid-cols-2 p-1 bg-[#060712]/60 border border-white/[0.06] rounded-2xl relative">
                              <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${gender === 'male' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                              >
                                Male
                                {gender === 'male' && (
                                  <motion.div
                                    layoutId="gender-pill"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl z-[-1]"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`py-3 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${gender === 'female' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                              >
                                Female
                                {gender === 'female' && (
                                  <motion.div
                                    layoutId="gender-pill"
                                    className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl z-[-1]"
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
                                backgroundColor: acceptedTerms ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.02)",
                                borderColor: acceptedTerms ? "#10b981" : (attemptedStep2Submit ? "#ef4444" : "rgba(255, 255, 255, 0.12)")
                              }}
                              className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-200"
                              style={{ borderWidth: attemptedStep2Submit && !acceptedTerms ? '2px' : '1px' }}
                            >
                              {acceptedTerms && (
                                <motion.svg 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2.5 h-2.5 text-emerald-400"
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
                          <span className={`text-[10px] font-medium leading-normal select-none ${attemptedStep2Submit && !acceptedTerms ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                            I agree to the{' '}
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openLegalModal('privacy'); }}
                              className="text-blue-400 hover:text-blue-300 underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
                            >
                              Privacy Policy
                            </button>{' '}
                            and{' '}
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openLegalModal('terms'); }}
                              className="text-blue-400 hover:text-blue-300 underline bg-transparent border-none p-0 cursor-pointer inline font-bold"
                            >
                              Terms of Use
                            </button>.
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 mt-2 w-full">
                          <div className="flex gap-3 w-full">
                            <button
                              type="button" onClick={() => setOnboardingStep(1)}
                              className="px-6 py-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] text-gray-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer hover:shadow-lg active:scale-95"
                            >
                              Back
                            </button>
                            <button
                              type="button" disabled={loading} onClick={handleRegister}
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase py-4 rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.35)] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {loading ? 'Starting Trial...' : <><CheckCircle2 size={13} /> Start My Free Trial</>}
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-550 font-bold tracking-wide mt-1">No card needed</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 text-center mt-3 font-medium">
                      Already have an account? <span onClick={() => { setAuthMode('login'); }} className="text-blue-400 hover:text-blue-300 font-black cursor-pointer">Sign In</span>
                    </p>
                  </form>
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
            className="fixed inset-0 bg-[#060713]/98 backdrop-blur-lg z-[150] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Glowing background highlights */}
            <div className="absolute w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute w-72 h-72 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" style={{ transform: 'translate(100px, 100px)' }} />

            <div className="space-y-8 max-w-xs relative z-10">
              {/* Animated Lifting Dumbbell */}
              <div className="relative flex items-center justify-center">
                {/* Glowing ring */}
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20"
                />
                
                {/* Dumbbell Icon with lifting translation */}
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/35 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10"
                >
                  <Dumbbell size={32} />
                </motion.div>
              </div>

              {/* Progress Count & Bar */}
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
                  <span className="text-sm font-black text-blue-400 tracking-wider ml-1">%</span>
                </div>

                {/* Progress bar container */}
                <div className="w-56 h-2.5 bg-gray-950 border border-white/[0.04] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-75"
                    style={{ width: `${creationProgress}%` }}
                  />
                </div>
              </div>

              {/* Animated Status Text */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={creationText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-blue-400 font-extrabold tracking-widest uppercase"
                  >
                    {creationText}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
