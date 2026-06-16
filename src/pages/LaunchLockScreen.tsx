import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Clock, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  Wrench, 
  Sparkles, 
  CheckCircle,
  Activity,
  Heart,
  TrendingUp,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LaunchLockScreenProps {
  status: 'coming_soon' | 'maintenance';
  launchTime: string | null;
  bypassPasscode: string;
  onBypassSuccess: () => void;
}

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
    <div className="relative min-h-screen bg-[#070913] text-gray-100 flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Background neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10 border-b border-gray-900/50 backdrop-blur-md bg-[#070913]/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black text-sm tracking-tighter">
            LG
          </div>
          <span className="font-black tracking-widest text-xs uppercase text-white">
            Life Gym <span className="text-emerald-400 font-bold text-[9px] lowercase tracking-normal bg-emerald-400/10 px-1.5 py-0.5 rounded-full ml-1.5">club</span>
          </span>
        </div>
        
        {status === 'coming_soon' && totalWaitlist !== null && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
              {totalWaitlist} on waitlist
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-16 z-10">
        
        {/* Left Column: Info, Countdown & Form */}
        <div className="flex-1 w-full max-w-xl text-center lg:text-left flex flex-col justify-center">
          {status === 'coming_soon' ? (
            <>
              {/* Badge */}
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-emerald-400 mb-4">
                <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-xs font-black uppercase tracking-widest">Launching Soon</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                The Next Level of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                  Fitness Coaching
                </span>
              </h1>
              <p className="mt-4 text-gray-400 text-sm md:text-base leading-relaxed">
                Life Gym is preparing to launch a state-of-the-art athlete portal. Get ready to experience automated diet adjustments, biometrics mapping, and premium workout logging.
              </p>

              {/* Countdown Timer */}
              {timeLeft ? (
                <div className="mt-8 grid grid-cols-4 gap-3 bg-[#0e1222]/40 border border-gray-900/60 p-4 rounded-3xl backdrop-blur-sm max-w-md mx-auto lg:mx-0">
                  {[
                    { label: 'days', val: timeLeft.days },
                    { label: 'hours', val: timeLeft.hours },
                    { label: 'minutes', val: timeLeft.minutes },
                    { label: 'seconds', val: timeLeft.seconds }
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <div className="text-2xl md:text-3xl font-black text-white font-mono">
                        {String(unit.val).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider mt-1">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 inline-flex items-center gap-2 bg-[#0e1222]/60 border border-gray-800/80 px-4 py-2.5 rounded-full text-xs font-bold text-gray-400 max-w-max mx-auto lg:mx-0">
                  <Clock size={14} className="text-emerald-400 animate-pulse" />
                  <span>Preparing launch gates. Opening very soon!</span>
                </div>
              )}

              {/* Waitlist Form */}
              <div className="mt-10 max-w-md mx-auto lg:mx-0 w-full">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleJoinWaitlist} 
                      className="space-y-3 bg-[#0e1222]/50 border border-gray-900 p-6 rounded-3xl backdrop-blur-sm"
                    >
                      <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 text-left">
                        Join the Waitlist
                      </h3>
                      
                      {/* Name input */}
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#070913]/80 border border-gray-850 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                        />
                      </div>

                      {/* Email input */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="email"
                          required
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#070913]/80 border border-gray-850 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                        />
                      </div>

                      {/* Phone input */}
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          placeholder="WhatsApp number (e.g. +201...)"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          className="w-full bg-[#070913]/80 border border-gray-850 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none font-medium transition-all"
                        />
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? 'Registering...' : 'Request Access Now'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl text-center flex flex-col items-center gap-3 backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle size={24} />
                      </div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider mt-2">
                        You're on the list!
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed max-w-[280px]">
                        Thank you for registering. We will send you an email and a WhatsApp notification as soon as the launch gates open!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              <div className="mt-10 p-6 bg-[#0e1222]/40 border border-gray-900 rounded-3xl backdrop-blur-sm max-w-md mx-auto lg:mx-0 flex items-center gap-5">
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

        {/* Right Column: Premium CSS Phone Mockup (Teaser Screen) */}
        <div className="flex-1 w-full max-w-sm flex items-center justify-center relative">
          {/* Animated glow rings around phone */}
          <div className="absolute w-72 h-72 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute w-80 h-80 rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '9s' }} />

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
            <div className="w-full h-full bg-[#060710] rounded-[38px] p-4 flex flex-col justify-between overflow-hidden relative">
              {/* Interactive background design */}
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 rounded-full bg-blue-500/10 blur-xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 rounded-full bg-emerald-500/10 blur-xl" />

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[8px] font-bold text-gray-500 font-mono mt-1 px-1">
                <span>05:17 AM</span>
                <div className="flex items-center gap-1">
                  <Activity size={8} className="text-emerald-500" />
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mock App Content */}
              <div className="flex-1 mt-6 flex flex-col justify-between overflow-hidden">
                {/* Simulated Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-900/60">
                  <div className="flex items-center gap-1.5">
                    <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">BioRing</span>
                  </div>
                  <span className="text-[7px] text-gray-500 font-mono uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-emerald-400 font-bold border border-emerald-500/15">Active</span>
                </div>

                {/* Simulated Biometrics Ring Visualizer */}
                <div className="my-auto flex flex-col items-center justify-center py-4">
                  <div className="w-28 h-28 rounded-full border-4 border-dashed border-emerald-500/20 flex items-center justify-center p-3 relative animate-spin" style={{ animationDuration: '40s' }}>
                    <div className="w-full h-full rounded-full border-4 border-emerald-400/80 border-t-transparent animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  
                  {/* Realtime stats mockup */}
                  <div className="absolute text-center flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">heart rate</span>
                    <span className="text-xl font-black text-white font-mono leading-none mt-1">72</span>
                    <span className="text-[7px] font-semibold text-emerald-400 font-mono mt-0.5">bpm</span>
                  </div>
                </div>

                {/* Dashboard Stats cards mockup */}
                <div className="space-y-2.5">
                  <div className="bg-[#0b0c16] border border-gray-900 p-2.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={10} />
                      </div>
                      <div className="text-left">
                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">compliance</p>
                        <p className="text-[10px] font-black text-white font-mono mt-0.5">98.4%</p>
                      </div>
                    </div>
                    <span className="text-[6px] text-emerald-400 font-bold uppercase font-mono">optimal</span>
                  </div>

                  <div className="bg-[#0b0c16] border border-gray-900 p-2.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Cpu size={10} />
                      </div>
                      <div className="text-left">
                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">AI engine</p>
                        <p className="text-[10px] font-black text-white font-mono mt-0.5">synced</p>
                      </div>
                    </div>
                    <span className="text-[6px] text-blue-400 font-bold uppercase font-mono">active</span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="border-t border-gray-900/60 pt-2.5 mt-4 flex justify-around text-[7px] font-bold text-gray-600 font-mono">
                <span className="text-emerald-400">Today</span>
                <span>Workout</span>
                <span>Diet</span>
                <span>Profile</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center z-10 border-t border-gray-900/30 flex items-center justify-between backdrop-blur-md bg-[#070913]/20">
        <span className="text-gray-550 text-[10px] font-medium">
          © 2026 Life Gym. All rights reserved.
        </span>
        <button
          onClick={() => {
            setEnteredPasscode('');
            setShowBypassModal(true);
          }}
          className="p-2 bg-gray-950/80 border border-gray-900 hover:border-gray-850 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
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
              className="bg-[#0b0c16] border border-gray-850 w-full max-w-xs p-6 rounded-3xl z-10 shadow-2xl relative"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-400" />
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
                  className="w-full bg-[#070913] border border-gray-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-medium transition-all"
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
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
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
