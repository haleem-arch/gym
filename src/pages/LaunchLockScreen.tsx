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
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: whatsappPhone.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

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
  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = enteredPasscode.trim();
    if (!cleanPasscode) return;

    try {
      const { data: token, error } = await supabase
        .rpc('verify_bypass_passcode', { entered_passcode: cleanPasscode });

      if (error) throw error;

      if (token) {
        localStorage.setItem('bypass_launch_control', token);
        toast.success('Admin access granted');
        onBypassSuccess();
      } else {
        toast.error('Invalid passcode');
        setEnteredPasscode('');
      }
    } catch (err) {
      console.error('Bypass verification error:', err);
      toast.error('Verification failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060f] text-gray-100 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none font-sans">
      {/* Background neon glows using blue brand color */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between z-10 border-b border-gray-900/50 backdrop-blur-md bg-[#05060f]/40">
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
            Life Gym
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'coming_soon' && totalWaitlist !== null && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                {totalWaitlist} on waitlist
              </span>
            </div>
          )}
          <button
            onClick={() => {
              setEnteredPasscode('');
              setShowBypassModal(true);
            }}
            className="p-2.5 bg-gray-950/80 border border-gray-900 hover:border-gray-800 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Admin Bypass Login"
          >
            <Lock size={12} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 z-10">
        
        {/* Left Column: Title, Countdown & Form */}
        <div className="flex-1 text-center lg:text-left max-w-xl">
          {status === 'coming_soon' ? (
            <>
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-blue-400 mb-3">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Launching Soon</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                The Next Level Of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Fitness Coaching
                </span>
              </h1>
              <p className="mt-3 sm:mt-4 text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Life Gym is preparing to launch a state-of-the-art athlete portal. Get ready to experience automated diet adjustments, biometrics mapping, and premium workout logging.
              </p>

              {/* Countdown Ticker */}
              {timeLeft && (
                <div className="mt-6 sm:mt-8 grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0 bg-gray-950/40 p-3 sm:p-4 border border-gray-900 rounded-2xl backdrop-blur-sm">
                  <div className="text-center">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-555 uppercase tracking-wider mt-1 block">Days</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-555 uppercase tracking-wider mt-1 block">Hours</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-white font-mono leading-none">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-555 uppercase tracking-wider mt-1 block">Mins</span>
                  </div>
                  <div className="text-center border-l border-gray-900/60">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-blue-400 font-mono leading-none">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-555 uppercase tracking-wider mt-1 block">Secs</span>
                  </div>
                </div>
              )}

              {/* Waitlist Subscription Card */}
              <div className="mt-6 sm:mt-10 max-w-md mx-auto lg:mx-0">
                {!submitted ? (
                  <form onSubmit={handleJoinWaitlist} className="bg-gray-950/30 border border-gray-900/80 p-5 sm:p-6 rounded-3xl space-y-4 backdrop-blur-sm animate-fade-in text-left">
                    <h3 className="text-xs font-black uppercase text-white tracking-widest text-left">Join The Waitlist</h3>
                    
                    <div className="relative text-left">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-550 w-4 h-4" />
                      <input 
                        type="text" 
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-800 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                      />
                    </div>

                    <div className="relative text-left">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-550 w-4 h-4" />
                      <input 
                        type="email" 
                        required
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-800 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                      />
                    </div>

                    <div className="relative text-left">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-555 w-4 h-4" />
                      <input 
                        type="tel" 
                        required
                        placeholder="WhatsApp number (e.g. +201...)"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="w-full bg-[#05060f]/80 border border-gray-800 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
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
                    className="bg-[#0c1020]/30 border border-gray-900/80 p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center gap-3 backdrop-blur-md"
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
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-amber-500 mb-3">
                <Wrench size={14} className="animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest">System Maintenance</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                Under Going <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Scheduled Upgrades
                </span>
              </h1>
              <p className="mt-3 sm:mt-4 text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                The website is under maintenance now. We are currently rolling out new systems and performing database upgrades to optimize performance. Please come back later.
              </p>

              {/* Maintenance Animation Graphic */}
              <div className="mt-6 sm:mt-10 p-4 sm:p-6 bg-[#0c1020]/40 border border-gray-900 rounded-3xl backdrop-blur-sm max-w-md mx-auto lg:mx-0 flex items-center gap-4 sm:gap-5">
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

        {/* Right Column: Premium CSS Phone Mockup (Floating & Centered) */}
        <div className="flex-1 w-full max-w-sm flex items-center justify-center relative flex-shrink-0 mt-3 sm:mt-0">
          {/* Animated glow rings around phone using blue brand color */}
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-blue-500/5 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-blue-555/5 animate-ping" style={{ animationDuration: '9s' }} />

          {/* Premium CSS Phone Mockup with floating loop */}
          <motion.div 
            animate={{ 
              y: [0, -12, 0],
              rotate: [-1, 1, -1]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[220px] sm:w-[280px] h-[440px] sm:h-[560px] bg-black rounded-[30px] sm:rounded-[48px] border-[4px] sm:border-[6px] border-gray-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-2 sm:p-3 relative overflow-hidden flex-shrink-0"
          >
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-4 sm:h-6 bg-black rounded-b-xl sm:rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-gray-900 border border-gray-800" />
            </div>

            {/* Inner display */}
            <div className="w-full h-full bg-[#05060f] rounded-[24px] sm:rounded-[38px] p-3 sm:p-4 flex flex-col justify-between overflow-hidden relative">
              {/* Interactive background design */}
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 rounded-full bg-blue-500/5 blur-xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 rounded-full bg-blue-600/5 blur-xl" />

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-bold text-gray-550 font-mono mt-1 px-1">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1">
                  <Activity size={8} className="text-blue-500 animate-pulse" />
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mock App Content */}
              {status === 'coming_soon' ? (
                /* Mock App Content (100% Matching Real Website Dashboard) */
                <div className="flex-1 mt-4 sm:mt-6 flex flex-col justify-between overflow-hidden">
                  {/* Simulated Header */}
                  <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <BrandLogo className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">Life Gym</span>
                    </div>
                    <span className="text-[5px] sm:text-[6px] text-gray-555 font-mono uppercase bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded-full text-blue-400 font-bold border border-blue-500/15">Active</span>
                  </div>

                  {/* Simulated Calories Ring Visualizer */}
                  <div className="my-auto flex flex-col items-center justify-center py-2 sm:py-4 relative">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-blue-500/10 flex items-center justify-center p-2 sm:p-3 relative">
                      <div className="w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    
                    {/* Realtime stats mockup */}
                    <div className="absolute text-center flex flex-col items-center justify-center">
                      <span className="text-[5px] sm:text-[7px] font-black uppercase tracking-widest text-gray-555">nutrition</span>
                      <span className="text-sm sm:text-lg font-black text-white font-mono leading-none mt-0.5 sm:mt-1">1,840</span>
                      <span className="text-[5px] sm:text-[7px] font-bold text-blue-400 font-mono mt-0.5">/ 2,400 kcal</span>
                    </div>
                  </div>

                  {/* Dashboard Stats cards mockup */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="bg-[#0c1020] border border-gray-900/80 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <TrendingUp size={10} />
                        </div>
                        <div className="text-left">
                          <p className="text-[5px] sm:text-[7px] font-bold text-gray-555 uppercase tracking-wider">active workout</p>
                          <p className="text-[8px] sm:text-[9px] font-black text-white uppercase mt-0.5">Pull Day Routine</p>
                        </div>
                      </div>
                      <span className="text-[5px] sm:text-[6px] text-blue-400 font-bold uppercase font-mono">12 sets left</span>
                    </div>

                    <div className="bg-[#0c1020] border border-gray-900/80 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Droplets size={10} />
                        </div>
                        <div className="text-left">
                          <p className="text-[5px] sm:text-[7px] font-bold text-gray-555 uppercase tracking-wider">water tracker</p>
                          <p className="text-[8px] sm:text-[9px] font-black text-white uppercase mt-0.5">1.5 Liters Logged</p>
                        </div>
                      </div>
                      <span className="text-[5px] sm:text-[6px] text-blue-400 font-bold uppercase font-mono">50% daily goal</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Maintenance Mode Funny Worker Animation (Looping Cartoon Construction Worker) */
                <div className="flex-1 mt-4 sm:mt-6 flex flex-col justify-between overflow-hidden relative">
                  {/* Simulated Header */}
                  <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-white">System Core</span>
                    </div>
                    <span className="text-[6px] text-gray-555 font-mono uppercase bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-400 font-bold border border-amber-500/15">Upgrading</span>
                  </div>

                  {/* Funny SVG Construction worker */}
                  <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 200 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <style>{`
                        @keyframes swing {
                          0%, 5%, 16.67%, 21.67%, 33.33%, 38.33%, 50%, 55%, 100% { transform: rotate(-70deg); }
                          10%, 26.67%, 43.33% { transform: rotate(0deg); }
                          60% { transform: rotate(25deg); }
                          65% { transform: rotate(0deg); }
                        }
                        @keyframes hammer-drop {
                          0%, 55% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                          57% { transform: translate(15px, -25px) rotate(45deg); opacity: 1; }
                          62% { transform: translate(10px, -60px) rotate(120deg); opacity: 1; }
                          68% { transform: translate(-15px, -40px) rotate(180deg); opacity: 1; }
                          72% { transform: translate(-25px, -15px) rotate(220deg); opacity: 1; }
                          76% { transform: translate(-30px, 65px) rotate(270deg); opacity: 1; }
                          88% { transform: translate(-30px, 65px) rotate(270deg); opacity: 1; }
                          91% { transform: translate(-30px, 65px) rotate(270deg); opacity: 0; }
                          95% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                          98%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                        }
                        @keyframes head-shake {
                          0%, 67%, 90%, 100% { transform: translate(0, 0) rotate(0deg); }
                          68% { transform: translate(0px, 4px) rotate(8deg); }
                          71% { transform: translate(-2px, -3px) rotate(-10deg); }
                          74% { transform: translate(2px, 3px) rotate(10deg); }
                          77%, 86% { transform: translate(-1px, 1px) rotate(4deg); }
                        }
                        @keyframes spin-stars {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                        @keyframes fade-stars {
                          0%, 67%, 90%, 100% { opacity: 0; }
                          68%, 86% { opacity: 1; }
                        }
                        @keyframes spark {
                          0%, 8%, 12%, 24.67%, 28.67%, 41.33%, 45.33%, 100% { opacity: 0; transform: scale(0.1); }
                          9%, 25.67%, 42.33% { opacity: 1; transform: scale(1.2); }
                        }
                        @keyframes text-bubble {
                          0%, 67%, 90%, 100% { opacity: 0; transform: scale(0.5); }
                          69%, 86% { opacity: 1; transform: scale(1); }
                        }
                        .arm {
                          transform-origin: 75px 140px;
                          animation: swing 6s infinite ease-in-out;
                        }
                        .hammer {
                          transform-origin: 90px 155px;
                          animation: hammer-drop 6s infinite ease-in-out;
                        }
                        .worker-head {
                          transform-origin: 75px 125px;
                          animation: head-shake 6s infinite ease-in-out;
                        }
                        .spark-grp {
                          transform-origin: 120px 145px;
                          animation: spark 6s infinite ease-out;
                        }
                        .bubble {
                          transform-origin: 100px 70px;
                          animation: text-bubble 6s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        }
                        .dizzy-stars {
                          transform-origin: 75px 95px;
                          animation: spin-stars 1.5s infinite linear, fade-stars 6s infinite ease-in-out;
                        }
                      `}</style>

                      {/* Ground */}
                      <rect x="20" y="220" width="160" height="8" rx="4" fill="#1f2937" />

                      {/* Server Rack / Cabinet being hit */}
                      <rect x="110" y="140" width="60" height="80" rx="6" fill="#0c1020" stroke="#1f2937" strokeWidth="3" />
                      <circle cx="125" cy="155" r="3" fill="#3b82f6" />
                      <circle cx="125" cy="165" r="3" fill="#ef4444" />
                      <rect x="140" y="152" width="20" height="4" rx="2" fill="#1f2937" />
                      <rect x="125" y="180" width="35" height="25" rx="3" fill="#05060f" />
                      <line x1="130" y1="187" x2="155" y2="187" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="130" y1="193" x2="145" y2="193" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                      {/* Funny Ouch Bubble */}
                      <g className="bubble">
                        <path d="M 80,75 L 60,65 L 75,55 L 125,55 L 130,75 Z" fill="#ef4444" />
                        <text x="96" y="66" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">OUCH! *#%</text>
                      </g>

                      {/* Dizzy Stars */}
                      <g className="dizzy-stars">
                        <path d="M 60,95 L 63,98 L 60,101 L 57,98 Z" fill="#f59e0b" />
                        <path d="M 90,95 L 93,98 L 90,101 L 87,98 Z" fill="#f59e0b" />
                        <path d="M 75,85 L 78,88 L 75,91 L 72,88 Z" fill="#f59e0b" />
                      </g>

                      {/* Spark Impact */}
                      <g className="spark-grp">
                        <path d="M 120,145 L 100,125 M 120,145 L 95,145 M 120,145 L 105,160 M 120,145 L 135,125 M 120,145 L 145,145" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="120" cy="145" r="6" fill="#f59e0b" />
                      </g>

                      {/* Worker Body */}
                      <line x1="60" y1="220" x2="70" y2="180" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                      <line x1="85" y1="220" x2="78" y2="180" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                      <line x1="75" y1="180" x2="75" y2="135" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />

                      {/* Head & Helmet */}
                      <g className="worker-head">
                        <circle cx="75" cy="115" r="12" fill="#ffedd5" stroke="#1e293b" strokeWidth="2" />
                        {/* Closed eye / hit expression */}
                        <path d="M 70,115 L 74,117 M 74,117 L 70,119" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                        <path d="M 80,115 L 76,117 M 76,117 L 80,119" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                        <path d="M 72,123 Q 75,120 78,123" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Yellow Helmet */}
                        <path d="M 60,112 A 15,15 0 0,1 90,112 Z" fill="#f59e0b" />
                        <rect x="57" y="110" width="36" height="3" rx="1" fill="#d97706" />
                      </g>

                      {/* Left Arm (Holding Server) */}
                      <line x1="75" y1="140" x2="105" y2="150" stroke="#ffedd5" strokeWidth="5" strokeLinecap="round" />

                      {/* Right Arm (Swinging Hammer) */}
                      <g className="arm">
                        {/* Arm line from shoulder to hand */}
                        <line x1="75" y1="140" x2="90" y2="155" stroke="#ffedd5" strokeWidth="5" strokeLinecap="round" />
                        {/* Hammer Group (origin is hand) */}
                        <g className="hammer">
                          {/* Handle */}
                          <line x1="90" y1="155" x2="110" y2="145" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                          {/* Head */}
                          <rect x="98" y="137" width="24" height="16" rx="3" fill="#6b7280" stroke="#374151" strokeWidth="1.5" transform="rotate(-26.5 110 145)" />
                        </g>
                      </g>
                    </svg>
                  </div>

                  {/* Maintenance text footer inside screen */}
                  <div className="text-center pb-2 text-[7px] text-gray-550 font-semibold uppercase tracking-wider font-mono">
                    upgrades compile loop
                  </div>
                </div>
              )}

              {/* Bottom Nav Mockup */}
              <div className="border-t border-gray-900/60 pt-2 sm:pt-2.5 mt-3 sm:mt-4 flex justify-around text-[7px] font-bold text-gray-550 font-mono">
                <span className={status === 'coming_soon' ? "text-blue-500" : "text-gray-550"}>Today</span>
                <span>Workout</span>
                <span>Diet</span>
                <span>Profile</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center z-10 border-t border-gray-900/30 flex items-center justify-between backdrop-blur-md bg-[#05060f]/20">
        <span className="text-gray-550 text-[10px] font-medium">
          © 2026 Life Gym. All rights reserved.
        </span>
        <button
          onClick={() => {
            setEnteredPasscode('');
            setShowBypassModal(true);
          }}
          className="p-2 bg-gray-950/85 border border-gray-900 hover:border-gray-855 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
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
              className="bg-[#0c1020] border border-gray-855 w-full max-w-xs p-6 rounded-3xl z-10 shadow-2xl relative"
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
