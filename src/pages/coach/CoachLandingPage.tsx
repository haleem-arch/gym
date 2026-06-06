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
  Shield, 
  X,
  Play,
  CheckCircle2,
  Sparkles
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
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro');



  const openAuth = (mode: 'login' | 'register', plan?: 'starter' | 'pro' | 'agency') => {
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
            gym_name: gymName.trim(),
            subscription_plan: selectedPlan,
            subscription_status: 'trial',
            trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
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
            gymName: gymName.trim(),
            plan: selectedPlan
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



  return (
    <div className="min-h-screen bg-[#060713] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
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
            <p className="text-[9px] text-blue-400 font-black tracking-widest uppercase">Coach SaaS</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#preview" className="hover:text-white transition-colors">Platform Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => openAuth('login')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Coach Login
          </button>
          <button 
            onClick={() => openAuth('register')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95 cursor-pointer"
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
            <Sparkles size={11} /> Next-Gen Fitness SaaS Platform
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Scale Your Coaching Business,<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Not Your Admin Work.</span>
          </h2>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Design workouts splits, build nutrition targets, track body composition scans, and communicate with athletes on a single premium dashboard.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={14} />
            </button>
            <a
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold text-gray-300 hover:text-white border border-white/[0.05] hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>Explore Platform</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/[0.03]">
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Engineered for Peak Performance</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">Everything you need to deliver a premium service and keep your athletes accountable.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              title: "Excel & PDF History Export",
              desc: "Export unified client logs history and biometrics sheets in one click for professional spreadsheet analysis."
            },
            {
              icon: <Users className="text-pink-400" size={24} />,
              title: "Direct Athlete Directory",
              desc: "Manage profiles, onboarding statuses, suspensions, and targets from a centralized dossier catalog."
            },
            {
              icon: <Shield className="text-cyan-400" size={24} />,
              title: "Telegram Bot Integration",
              desc: "Integrate with our custom verification bot. Send automated client updates and handle payments easily."
            }
          ].map((feat, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-[24px] bg-[#111326]/30 border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#111326]/50 transition-all group shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h4 className="text-sm font-black text-white mb-3 tracking-wide">{feat.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM PREVIEW MOCKUP */}
      <section id="preview" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.03] text-center">
        <div className="text-center space-y-3 mb-12">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">A Look Inside the Portal</h3>
          <p className="text-xs text-gray-400">Manage your roster using our responsive grid, macros charts, and check-in trackers.</p>
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
              <div className="w-48 h-4 bg-white/5 rounded-md flex items-center justify-center text-[8px] font-bold text-gray-500">
                app.striderite.com/coach-portal
              </div>
              <div className="w-6 h-4" />
            </div>

            {/* Mock Content Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Mock Sidebar */}
              <div className="w-1/5 bg-[#0a0b16] border-r border-white/[0.03] p-3 flex flex-col gap-2.5">
                <div className="w-full h-8 bg-blue-600/10 border border-blue-500/20 rounded-lg" />
                <div className="w-full h-4 bg-white/5 rounded-md" />
                <div className="w-full h-4 bg-white/5 rounded-md" />
                <div className="w-full h-4 bg-white/5 rounded-md" />
              </div>

              {/* Mock Main Board */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4 bg-white/10 rounded-md" />
                  <div className="w-16 h-5 bg-blue-600/20 border border-blue-500/30 rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/[0.03] h-20 rounded-2xl p-3 flex flex-col justify-between">
                    <span className="w-12 h-2.5 bg-blue-400/20 rounded" />
                    <span className="w-8 h-4 bg-white/20 rounded" />
                  </div>
                  <div className="bg-white/5 border border-white/[0.03] h-20 rounded-2xl p-3 flex flex-col justify-between">
                    <span className="w-12 h-2.5 bg-purple-400/20 rounded" />
                    <span className="w-8 h-4 bg-white/20 rounded" />
                  </div>
                  <div className="bg-white/5 border border-white/[0.03] h-20 rounded-2xl p-3 flex flex-col justify-between">
                    <span className="w-12 h-2.5 bg-emerald-400/20 rounded" />
                    <span className="w-8 h-4 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/[0.03] h-36 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="w-32 h-3 bg-white/10 rounded" />
                  <div className="w-full h-20 bg-white/5 border border-white/[0.03] rounded-xl flex items-center justify-center text-[10px] text-gray-500">
                    📊 Weight &amp; Body Fat progression chart
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.03]">
        <div className="text-center space-y-3 mb-16">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Simple, Flexible Billing</h3>
          <p className="text-xs text-gray-400">Choose a package tailored to your client roster size. Swap tiers anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Starter Plan */}
          <div className="p-8 bg-[#111326]/30 border border-white/[0.04] rounded-[32px] flex flex-col justify-between relative shadow-lg">
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">Starter</span>
              <div className="flex items-baseline gap-1.5 pt-3">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-xs text-gray-500 font-bold">/ month</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">Perfect for independent trainers getting started with their first roster.</p>
              <ul className="space-y-2.5 pt-4 text-xs font-medium text-gray-300">
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Up to 10 clients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Custom Workout Templates</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Macro targets management</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Basic PDF history exports</li>
              </ul>
            </div>
            <button 
              onClick={() => openAuth('register', 'starter')}
              className="mt-8 w-full py-3.5 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-white/10 transition-all cursor-pointer"
            >
              Start Starter Trial
            </button>
          </div>

          {/* Growth Plan (Popular) */}
          <div className="p-8 bg-[#161a35]/60 border border-blue-500/30 rounded-[32px] flex flex-col justify-between relative shadow-xl scale-105">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">Growth</span>
              <div className="flex items-baseline gap-1.5 pt-3">
                <span className="text-4xl font-black text-white">$79</span>
                <span className="text-xs text-gray-500 font-bold">/ month</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">For scaling professional coaches offering comprehensive, data-driven programs.</p>
              <ul className="space-y-2.5 pt-4 text-xs font-medium text-gray-300">
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Up to 40 clients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Unlimited Splits &amp; Workouts</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Segmental InBody scan analyzer</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Unified log reports &amp; Excel downloads</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Telegram chatbot triggers</li>
              </ul>
            </div>
            <button 
              onClick={() => openAuth('register', 'pro')}
              className="mt-8 w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              Start Growth Trial
            </button>
          </div>

          {/* Agency Plan */}
          <div className="p-8 bg-[#111326]/30 border border-white/[0.04] rounded-[32px] flex flex-col justify-between relative shadow-lg">
            <div className="space-y-4">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">Agency</span>
              <div className="flex items-baseline gap-1.5 pt-3">
                <span className="text-3xl font-black text-white">$149</span>
                <span className="text-xs text-gray-500 font-bold">/ month</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">Enterprise package tailored for commercial gym centers and coaching teams.</p>
              <ul className="space-y-2.5 pt-4 text-xs font-medium text-gray-300">
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Unlimited clients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Shared exercises library</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Comprehensive staff dashboards</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Custom branding (white-labeling)</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Dedicated database capacity</li>
              </ul>
            </div>
            <button 
              onClick={() => openAuth('register', 'agency')}
              className="mt-8 w-full py-3.5 bg-white/5 hover:bg-white/10 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-white/10 transition-all cursor-pointer"
            >
              Start Agency Trial
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.04] text-center md:flex md:justify-between md:items-center">
        <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} Stride-Rite Coaching SaaS. All rights reserved.</p>
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
                    
                    {/* STEP 1: CREDENTIALS */}
                    {onboardingStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Your Display Name</label>
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
                          <span>Continue to Gym Setup</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: BRAND / METADATA */}
                    {onboardingStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Gym / Brand Name</label>
                          <input 
                            type="text" required value={gymName} onChange={e => setGymName(e.target.value)} placeholder="e.g. Life Gym Online"
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Contact Phone Number</label>
                          <input 
                            type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +201012345678"
                            className="w-full bg-[#0a0b16]/60 border border-white/[0.05] focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none" 
                          />
                        </div>
                        <div className="bg-[#0a0b16]/40 p-4 border border-white/[0.03] rounded-2xl flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Plan Selected</span>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{selectedPlan}</span>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            type="button" onClick={() => setOnboardingStep(1)}
                            className="px-4 py-3.5 bg-[#0a0b16] border border-white/[0.05] text-gray-400 font-bold text-xs rounded-xl hover:text-white transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button" disabled={loading || !gymName || !phone} onClick={handleRegister}
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
