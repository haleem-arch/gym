import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  Phone, 
  User, 
  Lock, 
  Wrench, 
  Sparkles, 
  CheckCircle,
  Activity,
  TrendingUp,
  Droplets
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LaunchLockScreenProps {
  status: 'coming_soon' | 'maintenance';
  launchTime: string | null;
  bypassPasscode: string;
  onBypassSuccess: () => void;
}

// Custom animated brand dumbbell logo matching the rest of the application
const BrandLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <motion.div 
    className={`relative flex items-center justify-center select-none ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 12, ease: "linear", repeat: Infinity }}
    whileHover={{ scale: 1.12 }}
  >
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
  </motion.div>
);

export default function LaunchLockScreen({ 
  status, 
  launchTime, 
  bypassPasscode,
  onBypassSuccess 
}: LaunchLockScreenProps) {
  // Waitlist form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [totalWaitlist, setTotalWaitlist] = useState<number | null>(null);

  // Admin bypass states
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Fetch total waitlist count on mount
  useEffect(() => {
    if (status === 'coming_soon') {
      fetchWaitlistCount();
    }
  }, [status]);

  const fetchWaitlistCount = async () => {
    try {
      const { count, error } = await supabase
        .from('launch_waitlist')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setTotalWaitlist(count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Countdown calculations
  useEffect(() => {
    if (!launchTime) return;

    const calculateTime = () => {
      const difference = +new Date(launchTime) - +new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [launchTime]);

  // Handle Waitlist Submission
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !whatsappPhone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('launch_waitlist')
        .insert([{
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: whatsappPhone.trim()
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Successfully joined the waitlist!');
      fetchWaitlistCount();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to join waitlist');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin Bypass
  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPasscode.trim() === bypassPasscode.trim()) {
      localStorage.setItem('bypass_launch_control', 'true');
      toast.success('Admin access granted');
      onBypassSuccess();
    } else {
      toast.error('Invalid passcode');
      setEnteredPasscode('');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060f] text-gray-100 flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Background neon glows using blue brand color */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10 border-b border-gray-900/50 backdrop-blur-md bg-[#05060f]/40">
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            setEnteredPasscode('');
            setShowBypassModal(true);
          }}
          title="Click to enter bypass passcode"
        >
          <BrandLogo className="w-8 h-8" />
          <span className="font-black tracking-widest text-xs uppercase text-white flex items-center">
            Life Gym <span className="text-blue-400 font-bold text-[9px] lowercase tracking-normal bg-blue-500/10 px-1.5 py-0.5 rounded-full ml-1.5">club</span>
          </span>
        </div>
        
        {status === 'coming_soon' && totalWaitlist !== null && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
              {totalWaitlist} on waitlist
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-16 z-10">
        
        {/* Left Column: Form & Messages */}
        <div className="flex-1 text-center lg:text-left max-w-xl">
          {status === 'coming_soon' ? (
            <>
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-blue-400 mb-4">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Launching Soon</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                The Next Level Of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Fitness Coaching
                </span>
              </h1>
              <p className="mt-4 text-gray-400 text-sm md:text-base leading-relaxed">
                Life Gym is preparing to launch a state-of-the-art athlete portal. Get ready to experience automated diet adjustments, biometrics mapping, and premium workout logging.
              </p>

              {/* Countdown Ticker */}
              {timeLeft && (
                <div className="mt-8 grid grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0 bg-gray-950/40 p-4 border border-gray-900 rounded-2xl backdrop-blur-sm">
                  <div className="text-center">
                    <span className="block text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">Days</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">Hours</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">Mins</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-2xl md:text-3xl font-black text-blue-400 font-mono leading-none">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">Secs</span>
                  </div>
                </div>
              )}

              {/* Waitlist Subscription Card */}
              <div className="mt-10 max-w-md mx-auto lg:mx-0">
                {!submitted ? (
                  <form onSubmit={handleJoinWaitlist} className="bg-gray-950/30 border border-gray-900/80 p-6 rounded-3xl space-y-4 backdrop-blur-sm">
                    <h3 className="text-xs font-black uppercase text-white tracking-widest text-left">Join The Waitlist</h3>
                    
                    <div className="relative text-left">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="text" 
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-850 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                      />
                    </div>

                    <div className="relative text-left">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-850 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                      />
                    </div>

                    <div className="relative text-left">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input 
                        type="tel" 
                        required
                        placeholder="WhatsApp number (e.g. +201...)"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-850 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Adding...' : 'Request Access Now'}
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-3xl text-center flex flex-col items-center gap-3 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <CheckCircle size={24} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">You're On The List!</h4>
                    <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                      We'll ping your WhatsApp and email as soon as portal access codes are ready to dispatch.
                    </p>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Maintenance View */}
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-amber-500 mb-4">
                <Wrench size={14} className="animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest">System Maintenance</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                Under Going <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Scheduled Upgrades
                </span>
              </h1>
              <p className="mt-4 text-gray-400 text-sm md:text-base leading-relaxed">
                The website is under maintenance now. We are currently rolling out new systems and performing database upgrades to optimize performance. Please come back later.
              </p>

              {/* Maintenance Animation Graphic */}
              <div className="mt-10 p-6 bg-[#0c1020]/40 border border-gray-900 rounded-3xl backdrop-blur-sm max-w-md mx-auto lg:mx-0 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Upgrades in progress</h4>
                  <p className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                    Database tables migration and API endpoints warmups are actively running.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Premium CSS Phone Mockup (Real Dashboard Teaser Screen) */}
        <div className="flex-1 w-full max-w-sm flex items-center justify-center relative">
          {/* Animated glow rings around phone using blue brand color */}
          <div className="absolute w-72 h-72 rounded-full border border-blue-500/5 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute w-80 h-80 rounded-full border border-blue-550/5 animate-ping" style={{ animationDuration: '9s' }} />

          {/* Premium CSS Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            whileHover={{ scale: 1.02, rotate: 1 }}
            className="w-[280px] h-[560px] bg-black rounded-[48px] border-[6px] border-gray-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-3 relative overflow-hidden"
          >
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-900 border border-gray-800" />
            </div>

            {/* Inner display */}
            <div className="w-full h-full bg-[#05060f] rounded-[38px] p-4 flex flex-col justify-between overflow-hidden relative">
              {/* Interactive background design */}
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 rounded-full bg-blue-500/5 blur-xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 rounded-full bg-blue-600/5 blur-xl" />

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 font-mono mt-1 px-1">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1">
                  <Activity size={8} className="text-blue-500 animate-pulse" />
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mock App Content (100% Matching Real Website Dashboard) */}
              <div className="flex-1 mt-6 flex flex-col justify-between overflow-hidden">
                {/* Simulated Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-900/60">
                  <div className="flex items-center gap-1.5">
                    <BrandLogo className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">Life Gym</span>
                  </div>
                  <span className="text-[6px] text-gray-500 font-mono uppercase bg-blue-500/10 px-2 py-0.5 rounded-full text-blue-400 font-bold border border-blue-500/15">Active</span>
                </div>

                {/* Simulated Calories Ring Visualizer (100% related to real dashboard) */}
                <div className="my-auto flex flex-col items-center justify-center py-4 relative">
                  <div className="w-28 h-28 rounded-full border-4 border-dashed border-blue-500/10 flex items-center justify-center p-3 relative">
                    <div className="w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  
                  {/* Realtime stats mockup */}
                  <div className="absolute text-center flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">nutrition</span>
                    <span className="text-lg font-black text-white font-mono leading-none mt-1">1,840</span>
                    <span className="text-[7px] font-bold text-blue-400 font-mono mt-0.5">/ 2,400 kcal</span>
                  </div>
                </div>

                {/* Dashboard Stats cards mockup (Actual website features) */}
                <div className="space-y-2">
                  <div className="bg-[#0c1020] border border-gray-900/80 p-2.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <TrendingUp size={10} />
                      </div>
                      <div className="text-left">
                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">active workout</p>
                        <p className="text-[9px] font-black text-white uppercase mt-0.5">Pull Day Routine</p>
                      </div>
                    </div>
                    <span className="text-[6px] text-blue-400 font-bold uppercase font-mono">12 sets left</span>
                  </div>

                  <div className="bg-[#0c1020] border border-gray-900/80 p-2.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Droplets size={10} />
                      </div>
                      <div className="text-left">
                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">water tracker</p>
                        <p className="text-[9px] font-black text-white uppercase mt-0.5">1.5 Liters Logged</p>
                      </div>
                    </div>
                    <span className="text-[6px] text-blue-400 font-bold uppercase font-mono">50% daily goal</span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="border-t border-gray-900/60 pt-2.5 mt-4 flex justify-around text-[7px] font-bold text-gray-550 font-mono">
                <span className="text-blue-500">Today</span>
                <span>Workout</span>
                <span>Diet</span>
                <span>Profile</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center z-10 border-t border-gray-900/30 flex items-center justify-between backdrop-blur-md bg-[#05060f]/20">
        <span className="text-gray-550 text-[10px] font-medium">
          © 2026 Life Gym. All rights reserved.
        </span>
        <button
          onClick={() => {
            setEnteredPasscode('');
            setShowBypassModal(true);
          }}
          className="p-2 bg-gray-950/85 border border-gray-900 hover:border-gray-850 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
          title="Admin Bypass Login"
        >
          <Lock size={12} />
        </button>
      </footer>

      {/* Passcode Bypass Modal */}
      <AnimatePresence>
        {showBypassModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBypassModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0c1020] border border-gray-850 w-full max-w-xs p-6 rounded-3xl z-10 shadow-2xl relative"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-blue-400" />
                Admin/Coach Bypass
              </h3>
              <p className="text-gray-500 text-[10px] leading-relaxed mb-4">
                Enter your administrative passcode to access the website portal.
              </p>

              <form onSubmit={handleBypassSubmit} className="space-y-3.5">
                <input
                  type="password"
                  required
                  placeholder="Enter passcode..."
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                  className="w-full bg-[#05060f] border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-medium transition-all"
                  autoFocus
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBypassModal(false)}
                    className="flex-1 py-2 bg-transparent hover:bg-gray-900 text-gray-400 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
