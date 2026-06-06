import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Dumbbell, 
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
  Calendar
} from 'lucide-react';

export default function CoachLandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedPlan, setSelectedPlan] = useState<'2_weeks' | '1_month' | '3_months' | '6_months'>('1_month');

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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setShowAuthModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Set signup in progress flag to bypass App.tsx signout race condition
    localStorage.setItem('signup_in_progress', 'true');

    try {
      // 1. Create authentication user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed.');

      // 2. Normalize username
      const baseUser = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueUsername = `${baseUser}${Math.floor(1000 + Math.random() * 9000)}`;

      // Use display name or default for gymName internally to keep Supabase payload correct
      const finalGymName = displayName.trim() + " Gym";

      // 3. Insert profile record with role = 'coach'
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

      // Notify Owner via Telegram Bot
      try {
        await fetch('/api/notify-new-coach', {
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
        });
      } catch (notifyErr) {
        console.error('Failed to notify owner:', notifyErr);
      }

      // Clean signup flag so App knows they are fully ready
      localStorage.setItem('is_new_signup', 'false');
      localStorage.removeItem('signup_in_progress');
      setShowAuthModal(false);

      // Redirect to log them in automatically
      window.location.href = '/coach-portal';
    } catch (err: any) {
      localStorage.removeItem('signup_in_progress');
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Dumbbell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white">LIFE GYM</h1>
            <p className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">COACH PORTAL</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Platform Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
        </nav>

        <div className="flex items-center gap-3">
          <a 
            href="/client-login"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Athlete Login
          </a>
          <button 
            onClick={() => openAuth('login')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Coach Login
          </button>
          <button 
            onClick={() => openAuth('register')}
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

          <div className="pt-6 flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={14} />
            </button>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-1">No card needed</p>
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
        className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.03] text-center"
      >
        <div className="text-center space-y-3 mb-12">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">A Look Inside the Portal</h3>
          <p className="text-xs text-gray-400">Roster control panel, active check-in tracking logs, and athlete metrics compliance board.</p>
        </div>

        <div className="bg-[#111326]/50 border border-white/[0.06] rounded-[32px] p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="rounded-[22px] border border-white/[0.05] overflow-hidden bg-[#070814]/90 aspect-[16/10] flex flex-col">
            
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
            </div>            {/* High Fidelity Mock Content Layout */}
            <div className="flex-1 overflow-hidden bg-[#070814]">
              <img 
                src="/coach_portal_preview.png" 
                alt="Life Gym Coach Portal Preview" 
                className="w-full h-full object-cover object-top select-none" 
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

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.04] text-center md:flex md:justify-between md:items-center">
        <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} Life Gym Coaching Platform. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-bold mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
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
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Dumbbell size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white">LIFE GYM COACH HUB</h4>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">{authMode === 'login' ? 'Authentication' : `Start Free Trial: Step ${onboardingStep} of 2`}</p>
                </div>
              </div>

              {/* error message bar */}
              {errorMessage && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-[10px] font-bold p-3 text-center">
                  {errorMessage}
                </div>
              )}

              {/* MODAL BODY CONTROLLER */}
              <div className="p-6">
                {authMode === 'login' ? (
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
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Email Address</label>
                          <input 
                            type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@lifegym.com"
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Secure Password</label>
                          <input 
                            type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters"
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <button
                          type="button"
                          disabled={!displayName || !email || password.length < 6}
                          onClick={() => setOnboardingStep(2)}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-1.5"
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
                              className="w-full bg-[#060712]/60 border border-white/[0.06] group-hover:border-white/[0.12] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-2xl p-3.5 pl-11 text-xs text-white outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)]" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] uppercase tracking-wider text-gray-400 font-black pl-1">Age</label>
                            <div className="relative group">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors w-4 h-4" />
                              <input 
                                type="number" required value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28"
                                className="w-full bg-[#060712]/60 border border-white/[0.06] group-hover:border-white/[0.12] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-2xl p-3.5 pl-11 text-xs text-white outline-none transition-all placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.08)]" 
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
                                <span className="text-xs">👨</span> Male
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
                                <span className="text-xs">👩</span> Female
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

                        <div className="flex flex-col items-center gap-2 mt-4">
                          <div className="flex gap-3 w-full">
                            <button
                              type="button" onClick={() => setOnboardingStep(1)}
                              className="px-6 py-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] text-gray-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer hover:shadow-lg active:scale-95"
                            >
                              Back
                            </button>
                            <button
                              type="button" disabled={loading || !phone || !age} onClick={handleRegister}
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

    </div>
  );
}
