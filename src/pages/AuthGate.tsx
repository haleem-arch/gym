import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthGate() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kcalTarget, setKcalTarget] = useState('2400');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          // Calculate dynamic high-performance athletic macro targets based on selected calories
          const kcalVal = parseInt(kcalTarget) || 2400;
          const proteinVal = Math.round((kcalVal * 0.26) / 4); // ~156g for 2400kcal (26% protein)
          const carbsVal = Math.round((kcalVal * 0.44) / 4);   // ~264g for 2400kcal (44% carbs)
          const fatVal = Math.round((kcalVal * 0.30) / 9);     // ~80g for 2400kcal (30% fat)

          // Insert personalized profile record
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            targets: { kcal: kcalVal, protein: proteinVal, carbs: carbsVal, fat: fatVal }
          });

          if (profileError) {
            console.error('Failed to initialize profile targets:', profileError);
          }

          setSuccessMsg('Account registered successfully! Check your email or try signing in.');
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-black relative px-4 py-8 overflow-y-auto no-scrollbar">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-b from-primary/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[40%] bg-gradient-to-t from-violet-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-[390px] mx-auto flex flex-col gap-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary via-blue-400 to-violet-500 bg-clip-text text-transparent uppercase"
          >
            Haleem Athlete
          </motion.h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">
            Elite Training & Diet Engine
          </p>
        </div>

        {/* Auth Box Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-surface/40 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-5"
        >
          {/* Tab Switcher */}
          <div className="flex bg-black/60 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
                !isSignUp ? 'bg-surface text-primary shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
                isSignUp ? 'bg-surface text-primary shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 hover:bg-black/80 focus:bg-black border border-white/5 hover:border-white/10 focus:border-primary/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none placeholder-gray-600 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 hover:bg-black/80 focus:bg-black border border-white/5 hover:border-white/10 focus:border-primary/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none placeholder-gray-600 font-medium"
                />
              </div>
            </div>

            {/* Target Calories (Sign Up Only) */}
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    Daily Calorie Target (kcal)
                  </label>
                  <div className="relative flex items-center">
                    <Flame size={16} className="absolute left-3.5 text-primary animate-pulse" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2400"
                      value={kcalTarget}
                      onChange={(e) => setKcalTarget(e.target.value)}
                      className="w-full bg-black/60 hover:bg-black/80 focus:bg-black border border-white/5 hover:border-white/10 focus:border-primary/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none placeholder-gray-600 font-medium"
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-medium pl-1 leading-normal">
                    We will automatically structure balanced athletic macro ratios for you.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger/10 border border-danger/20 rounded-xl p-3 flex items-start gap-2 text-xs text-danger font-semibold leading-normal"
              >
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-start gap-2 text-xs text-success font-semibold leading-normal"
              >
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-black uppercase py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                'Create Account & Start Fresh'
              ) : (
                'Sign In Profile'
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Subtext */}
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider text-center">
          Family & Friends Dashboard Gateway
        </p>
      </div>
    </div>
  );
}
