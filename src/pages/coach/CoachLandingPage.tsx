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
  CreditCard,
  Rocket,
  Search
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
            <h1 className="text-base font-black tracking-wider text-white">STRIDE-RITE</h1>
            <p className="text-[9px] text-blue-400 font-black tracking-widest uppercase">COACH PORTAL</p>
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
                app.striderite.com/coach-portal
              </div>
              <div className="w-6 h-4" />
            </div>            {/* High Fidelity Mock Content Layout */}
            <div className="flex-1 flex flex-col overflow-hidden text-left bg-[#070814]">
              {/* Mock Top Navigation Bar */}
              <div className="h-12 border-b border-white/[0.04] bg-[#070814] px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Dumbbell size={16} className="text-blue-500" />
                  <div>
                    <h5 className="text-[10px] font-black text-white leading-none">LIFE GYM</h5>
                    <span className="text-[6.5px] text-gray-500 font-bold mt-0.5 block">Desktop Coach Portal / Version 3.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border border-[#10b981]/35 rounded text-[7px] font-black text-[#10b981] bg-[#10b981]/5 tracking-wide hover:bg-[#10b981]/10 transition-all cursor-default">Sync Data</button>
                  <button className="px-2 py-1 border border-[#3b82f6]/35 rounded text-[7px] font-black text-[#3b82f6] bg-[#3b82f6]/5 tracking-wide hover:bg-[#3b82f6]/10 transition-all cursor-default">Force Update (Hard Reload)</button>
                  <button className="px-2 py-1 border border-red-500/35 rounded text-[7px] font-black text-red-500 bg-red-500/5 tracking-wide hover:bg-red-500/10 transition-all cursor-default">Log Out</button>
                </div>
              </div>

              {/* Sidebar and Workspace Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Mock Sidebar */}
                <div className="w-1/5 bg-[#0a0b16] border-r border-white/[0.03] p-3 flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <span className="text-[7.5px] font-black text-gray-500 uppercase tracking-widest block px-2">Main Navigation</span>
                    <nav className="space-y-1">
                      <div className="px-2.5 py-1.5 text-[8px] font-bold text-gray-500 rounded-lg flex items-center gap-2 hover:text-gray-300">
                        <Activity size={10} />
                        <span>Operational Overview</span>
                      </div>
                      <div className="px-2.5 py-1.5 bg-blue-600 text-[8px] font-black text-white rounded-lg flex items-center gap-2 shadow-md">
                        <Users size={10} />
                        <span>Athlete Directory</span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[8px] font-bold text-gray-500 rounded-lg flex items-center gap-2 hover:text-gray-300">
                        <Rocket size={10} />
                        <span>Deploy New Athlete</span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[8px] font-bold text-gray-500 rounded-lg flex items-center gap-2 hover:text-gray-300">
                        <Dumbbell size={10} />
                        <span>Athlete Control</span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[8px] font-bold text-gray-500 rounded-lg flex items-center gap-2 hover:text-gray-300">
                        <CreditCard size={10} />
                        <span>Subscriptions</span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[8px] font-bold text-gray-500 rounded-lg flex items-center gap-2 hover:text-gray-300">
                        <Users size={10} />
                        <span>Profile Settings</span>
                      </div>
                    </nav>
                  </div>
                </div>

                {/* Workspace Body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Athlete List Middle Panel (1/3 width) */}
                  <div className="w-1/3 border-r border-white/[0.03] p-3 flex flex-col bg-[#070814] shrink-0">
                    {/* Search Bar */}
                    <div className="relative mb-3 flex items-center">
                      <Search size={9} className="absolute left-2.5 text-gray-500" />
                      <input 
                        type="text" disabled placeholder="Search athletes..." 
                        className="w-full bg-[#111326]/40 border border-white/[0.05] rounded-full pl-7 pr-3 py-1.5 text-[7.5px] text-gray-300 outline-none placeholder:text-gray-650"
                      />
                    </div>
                    {/* Athlete Cards list */}
                    <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                      {[
                        { name: "ahmed", code: "#101", handle: "@zhmodd", initial: "A", active: true },
                        { name: "essam", code: "#104", handle: "@essam", initial: "E", active: false },
                        { name: "malak", code: "#106", handle: "@malak", initial: "M", active: false },
                        { name: "mohamed", code: "#105", handle: "@mohamed", initial: "M", active: false },
                        { name: "mostafa ahmed", code: "#107", handle: "@mostafa", initial: "M", active: false },
                        { name: "nada", code: "#103", handle: "@nada", initial: "N", active: false },
                        { name: "reem", code: "#102", handle: "@reem", initial: "R", active: false }
                      ].map((ath, idx) => (
                        <div key={idx} className={`p-2 rounded-xl border flex items-center justify-between cursor-default transition-all ${ath.active ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-[#111326]/10 border-white/[0.02] hover:border-white/[0.05]'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-400 shrink-0">
                              {ath.initial}
                            </div>
                            <div className="min-w-0 animate-pulse-slow">
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-black text-white truncate">{ath.name}</span>
                                <span className="text-[6px] font-bold text-blue-400 bg-blue-500/10 px-1 rounded-sm">{ath.code}</span>
                              </div>
                              <span className="text-[6.5px] text-gray-500 font-medium truncate block">{ath.handle}</span>
                            </div>
                          </div>
                          <ArrowRight size={8} className="text-gray-550 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Details Panel (2/3 width) */}
                  <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-[#060713] space-y-4">
                    {/* Navigation tabs header */}
                    <div className="border-b border-white/[0.03] pb-2 flex gap-4 text-[7.5px] font-black text-gray-500 tracking-wider">
                      <span>OVERVIEW</span>
                      <span>DIET LOGS</span>
                      <span>WATER LOGS</span>
                      <span className="text-blue-400 border-b border-blue-400 pb-2 -mb-[9px] z-10">TRAINING PLANS</span>
                      <span>INBODY SCANS</span>
                      <span>HISTORY</span>
                    </div>

                    {/* Completed Sessions Block */}
                    <div className="bg-[#111326]/20 border border-white/[0.03] rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[7.5px] font-black text-white uppercase tracking-wider">Completed Sessions</span>
                        <div className="text-[6.5px] font-mono text-gray-550 border border-white/[0.05] bg-white/5 px-1.5 py-0.5 rounded">
                          &lt; 2026-06-06 &gt;
                        </div>
                      </div>
                      <div className="py-4 text-center text-[7.5px] font-medium text-gray-500 italic">
                        No completed workouts logged on this date.
                      </div>
                    </div>

                    {/* Weekly Schedule Planner Block */}
                    <div className="bg-[#111326]/20 border border-white/[0.03] rounded-xl p-3">
                      <span className="text-[7.5px] font-black text-white uppercase tracking-wider flex items-center gap-1 mb-2">
                        🗓️ Weekly Schedule Planner
                      </span>
                      <div className="grid grid-cols-7 gap-1">
                        {[
                          { day: 'Mon', date: 'Jun 1', active: false },
                          { day: 'Tue', date: 'Jun 2', active: false },
                          { day: 'Wed', date: 'Jun 3', active: false },
                          { day: 'Thu', date: 'Jun 4', active: false },
                          { day: 'Fri', date: 'Jun 5', active: false },
                          { day: 'Sat', date: 'Jun 6', active: true },
                          { day: 'Sun', date: 'Jun 7', active: false }
                        ].map((d, dIdx) => (
                          <div 
                            key={dIdx} 
                            className={`border rounded-lg p-1 text-center flex flex-col justify-between aspect-[3/4.5] ${
                              d.active 
                                ? 'bg-blue-600/10 border-blue-500/30' 
                                : 'bg-[#111326]/40 border-white/[0.03]'
                            }`}
                          >
                            <div>
                              <span className={`text-[6.5px] font-black block leading-none ${d.active ? 'text-blue-400' : 'text-gray-400'}`}>{d.day}</span>
                              <span className="text-[5px] text-gray-500 font-bold block mt-0.5 leading-none">{d.date}</span>
                            </div>
                            <div className="flex items-center justify-between bg-black/30 border border-white/[0.05] rounded px-1 py-0.5 mt-1 text-[5.5px] text-gray-300 w-full">
                              <span>REST</span>
                              <span className="text-[4px] text-gray-550">▼</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gym Program Templates Splits (3) Block */}
                    <div className="bg-[#111326]/20 border border-white/[0.03] rounded-xl p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[7.5px] font-black text-white uppercase tracking-wider">Gym Program Templates Splits (3)</span>
                        <div className="flex gap-1 items-center shrink-0">
                          <input 
                            type="text" disabled placeholder="E.G. PUSH, LEGS" 
                            className="bg-[#070814] border border-white/[0.04] rounded px-2 py-1 text-[6.5px] text-gray-400 outline-none w-24"
                          />
                          <button className="bg-blue-600 text-white font-black text-[6.5px] px-2 py-1 rounded shadow cursor-default">+ ADD SPLIT</button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { title: "PUSH", exercises: "6 exercises", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                          { title: "PULL", exercises: "6 exercises", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                          { title: "LEGS", exercises: "6 exercises", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
                        ].map((split, sIdx) => (
                          <div key={sIdx} className="p-2 rounded-lg border border-white/[0.02] bg-[#111326]/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase border ${split.color}`}>{split.title}</span>
                              <span className="text-[7px] text-gray-550 font-bold">({split.exercises})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-550 text-[8px] cursor-default">
                              <span>✏️</span>
                              <span>🗑️</span>
                              <span>▼</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

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
        <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} Stride-Rite Coaching Platform. All rights reserved.</p>
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
                  <h4 className="text-xs font-black tracking-wider text-white">STRIDE-RITE COACH HUB</h4>
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
                            type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@striderite.com"
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
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Phone Number (WhatsApp)</label>
                          <input 
                            type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +201012345678"
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Age</label>
                            <input 
                              type="number" required value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28"
                              className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Gender</label>
                            <select 
                              value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
                              className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none"
                            >
                              <option value="male" className="bg-[#111326] text-white">Male</option>
                              <option value="female" className="bg-[#111326] text-white">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-4">
                          <div className="flex gap-3 w-full">
                            <button
                              type="button" onClick={() => setOnboardingStep(1)}
                              className="px-4 py-3.5 bg-[#0a0b16] border border-white/[0.05] text-gray-400 font-bold text-xs rounded-xl hover:text-white transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="button" disabled={loading || !phone || !age} onClick={handleRegister}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs uppercase py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {loading ? 'Starting Trial...' : <><CheckCircle2 size={12} /> Start My Free Trial</>}
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold tracking-wide mt-1">No card needed</span>
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
