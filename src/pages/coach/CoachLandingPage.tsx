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
  LayoutDashboard,
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
            subscription_plan: selectedPlan,
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
            plan: selectedPlan,
            age: age,
            gender: gender
          })
        });
      } catch (notifyErr) {
        console.error('Failed to notify owner:', notifyErr);
      }

      // Clean signup flag so App knows they are fully ready
      localStorage.setItem('is_new_signup', 'false');
      setShowAuthModal(false);
    } catch (err: any) {
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
    { text: "Manage up to 50 active athletes from one dashboard" },
    { text: "Build custom workout splits per athlete" },
    { text: "Set gym day & rest day macros separately for each day" },
    { text: "Parse & track InBody scans (body fat %, muscle mass, BMR)" },
    { text: "Set & monitor daily water intake goals per athlete" },
    { text: "Each athlete gets their own portal to track everything" },
    { text: "Update workouts & nutrition — syncs to client instantly" },
    { text: "Suspend, reset passwords & control access per athlete" },
    { text: "Renew your clients subscription instantly" },
    { text: "Real-time tracking for each athlete" }
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

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={14} />
            </button>
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
            </div>

            {/* High Fidelity Mock Content Layout */}
            <div className="flex-1 flex overflow-hidden text-left">
              {/* Mock Sidebar */}
              <div className="w-1/5 bg-[#0a0b16] border-r border-white/[0.03] p-3 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.05] shadow-inner">
                    <Dumbbell size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">STRIDE-RITE</span>
                  </div>
                  <nav className="space-y-1">
                    <div className="px-3 py-2 bg-white/[0.07] text-[8.5px] font-black text-white rounded-xl flex items-center gap-2 shadow-sm">
                      <LayoutDashboard size={11} className="text-blue-400" />
                      <span>Overview</span>
                    </div>
                    <div className="px-3 py-2 text-[8.5px] font-bold text-gray-500 rounded-xl flex items-center gap-2 hover:text-gray-300 transition-colors">
                      <Users size={11} />
                      <span>Roster (32)</span>
                    </div>
                    <div className="px-3 py-2 text-[8.5px] font-bold text-gray-500 rounded-xl flex items-center gap-2 hover:text-gray-300 transition-colors">
                      <Rocket size={11} />
                      <span>Deploy</span>
                    </div>
                    <div className="px-3 py-2 text-[8.5px] font-bold text-gray-500 rounded-xl flex items-center gap-2 hover:text-gray-300 transition-colors">
                      <CreditCard size={11} />
                      <span>Billing</span>
                    </div>
                  </nav>
                </div>
                <div className="px-3 py-2.5 border-t border-white/[0.03] pt-4 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[7.5px] font-black text-white shadow-md shadow-blue-500/10 shrink-0">CA</div>
                  <span className="text-[8.5px] font-black text-white truncate">Coach Ahmed</span>
                </div>
              </div>

              {/* Mock Main Board */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar bg-[#060713]">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/[0.02] pb-3">
                  <div>
                    <h4 className="text-[12px] font-black text-white">Welcome back, Coach Ahmed 👋</h4>
                    <p className="text-[7.5px] text-gray-500 font-extrabold uppercase tracking-widest mt-0.5">ROSTER OVERVIEW &amp; REAL-TIME COMPLIANCE TRACKER</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/[0.04] px-2.5 py-1.5 rounded-full text-[7.5px] font-bold text-gray-400 w-36 shadow-inner">
                    <Search size={9} className="text-gray-600 shrink-0" />
                    <span>Search athlete...</span>
                  </div>
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#111326]/50 border border-white/[0.04] p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[7px] font-extrabold text-gray-500 uppercase tracking-widest">Active Athletes</span>
                    <span className="text-[13px] font-black text-white mt-1">32 / 50</span>
                  </div>
                  <div className="bg-[#111326]/50 border border-white/[0.04] p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[7px] font-extrabold text-gray-500 uppercase tracking-widest">Compliance Rate</span>
                    <span className="text-[13px] font-black text-[#10b981] mt-1">84.6%</span>
                  </div>
                  <div className="bg-[#111326]/50 border border-white/[0.04] p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[7px] font-extrabold text-gray-500 uppercase tracking-widest">Completed Sessions</span>
                    <span className="text-[13px] font-black text-[#60a5fa] mt-1">18 today</span>
                  </div>
                </div>

                {/* Roster Table Grid */}
                <div className="bg-[#111326]/30 border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[#0b0c16] px-4 py-2 border-b border-white/[0.03] flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-wider">
                    <span className="w-1/4">Athlete Name</span>
                    <span className="w-1/4">Daily Diet Logs</span>
                    <span className="w-1/6">Water</span>
                    <span className="w-1/4">Workout Status</span>
                  </div>
                  <div className="divide-y divide-white/[0.02]">
                    {[
                      { name: "Omar Sherif", code: "#1102", diet: "1,980 / 2,400 kcal", macros: "Pr: 212g / Cr: 210g / Ft: 65g", water: "3.0 / 3.5 L", workout: "🔴 PUSH Day (Done)", workStyle: "bg-red-500/10 text-red-400 border border-red-500/20" },
                      { name: "Youssef Aly", code: "#1125", diet: "2,250 / 2,500 kcal", macros: "Pr: 162g / Cr: 230g / Ft: 78g", water: "3.5 / 3.5 L", workout: "🔵 PULL Day (Done)", workStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
                      { name: "Hassan Ibrahim", code: "#1108", diet: "850 / 2,100 kcal", macros: "Pr: 60g / Cr: 100g / Ft: 25g", water: "1.5 / 3.5 L", workout: "💤 REST Day", workStyle: "bg-gray-800/40 text-gray-500 border border-gray-700/50" },
                      { name: "Mariam Tarek", code: "#1112", diet: "1,640 / 1,800 kcal", macros: "Pr: 114g / Cr: 180g / Ft: 48g", water: "2.0 / 3.0 L", workout: "🟡 LEGS Day (Done)", workStyle: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
                      { name: "Mostafa Kamel", code: "#1115", diet: "Subscription Expired", macros: "Pr: -- / Cr: -- / Ft: --", water: "--", workout: "🔒 Suspended", workStyle: "bg-red-950/20 text-red-500 border border-red-950/40" }
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="px-4 py-2.5 flex items-center justify-between text-[8px] font-bold text-gray-300">
                        <div className="w-1/4 flex flex-col">
                          <span className="text-white font-black text-[9px]">{row.name}</span>
                          <span className="text-[7px] text-gray-500 font-mono mt-0.5">{row.code}</span>
                        </div>
                        <div className="w-1/4 flex flex-col">
                          <span className={row.diet.includes("Expired") ? "text-red-400 font-medium" : "text-[#10b981] font-bold"}>{row.diet}</span>
                          <span className="text-[7px] text-gray-550 font-mono mt-0.5">{row.macros}</span>
                        </div>
                        <div className="w-1/6 text-[#60a5fa] font-bold">
                          {row.water}
                        </div>
                        <div className="w-1/4">
                          <span className={`px-2 py-0.5 rounded-full text-[6.5px] font-black uppercase tracking-wider ${row.workStyle}`}>
                            {row.workout}
                          </span>
                        </div>
                      </div>
                    ))}
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
            <button 
              onClick={() => openAuth('register', '2_weeks')}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Start 2-Week Trial
            </button>
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
            <button 
              onClick={() => openAuth('register', '1_month')}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              Start 1-Month Trial
            </button>
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
            <button 
              onClick={() => openAuth('register', '3_months')}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Start 3-Month Trial
            </button>
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
            <button 
              onClick={() => openAuth('register', '6_months')}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Start 6-Month Trial
            </button>
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
                        <div className="bg-[#0a0b16]/40 p-3.5 border border-white/[0.03] rounded-2xl flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Plan Selected</span>
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                            {selectedPlan === '2_weeks' ? '2 Weeks - 2,200 EGP' :
                             selectedPlan === '1_month' ? '1 Month - 3,500 EGP' :
                             selectedPlan === '3_months' ? '3 Months - 8,500 EGP' :
                             '6 Months - 14,000 EGP'}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-4">
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
