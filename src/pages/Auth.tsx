import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import LegalModal from '../components/LegalModals';

interface AuthProps {
  onSessionConfigured: (session: any) => void;
}

export default function Auth({ onSessionConfigured }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'cookies' | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimeLeft]);

  useEffect(() => {
    const checkLock = () => {
      const lockKey = `auth_lock_${email.trim().toLowerCase()}`;
      const saved = localStorage.getItem(lockKey);
      if (saved) {
        try {
          const { lockedUntil } = JSON.parse(saved);
          const diff = Math.ceil((lockedUntil - Date.now()) / 1000);
          if (diff > 0) {
            setLockoutTimeLeft(diff);
            setErrorMsg(`TOO MANY FAILED ATTEMPTS. TRY AGAIN IN ${diff}s`);
          }
        } catch (e) {}
      }
    };
    if (email) checkLock();
  }, [email]);

  const cardRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const [legalError, setLegalError] = useState(false);

  const getShortErrorMessage = (msg: string | null) => {
    if (!msg) return '';
    const lower = msg.toLowerCase();
    if (lower.includes('credential') || lower.includes('invalid') || lower.includes('password') || lower.includes('email')) {
      return 'WRONG PASSWORD / EMAIL';
    }
    if (lower.includes('network') || lower.includes('fetch')) {
      return 'CONNECTION ERROR';
    }
    if (lower.includes('agree') || lower.includes('terms') || lower.includes('privacy')) {
      return 'ACCEPT PRIVACY';
    }
    return 'AUTH FAILED';
  };

  const shakeVariants = {
    normal: { x: 0 },
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5, ease: 'easeInOut' as const }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!email.trim() || !password.trim() || (isSignUp && !displayName.trim())) {
      toast.error('Please fill in all empty fields.');
      return;
    }
    if (!legalAccepted) {
      setLegalError(true);
      toast.error('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    const lockKey = `auth_lock_${email.trim().toLowerCase()}`;
    const saved = localStorage.getItem(lockKey);
    let attempts = 0;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        attempts = parsed.failedAttempts || 0;
        const diff = Math.ceil((parsed.lockedUntil - Date.now()) / 1000);
        if (diff > 0) {
          toast.error(`Too many failed attempts. Locked for ${diff}s.`);
          setLockoutTimeLeft(diff);
          setErrorMsg(`TOO MANY FAILED ATTEMPTS. TRY AGAIN IN ${diff}s`);
          return;
        }
      } catch (e) {}
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const finalEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@stride.fit`;

      if (isSignUp) {
        if (!cleanEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Set is_new_signup to true in localStorage
          localStorage.setItem('is_new_signup', 'true');

          // Create the profiles record
          const { error: profileErr } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: cleanEmail,
              display_name: displayName.trim() || cleanEmail.split('@')[0],
              role: 'client',
              coach_id: null,
              targets: { onboarding_completed: false }
            });
          if (profileErr) console.error('Profile creation error:', profileErr);

          // Create the client_profiles record
          const { error: clientProfileErr } = await supabase
            .from('client_profiles')
            .upsert({
              user_id: data.user.id,
              coach_id: null
            });
          if (clientProfileErr) console.error('Client profile creation error:', clientProfileErr);

          if (!data.session) {
            toast.success('Registration successful! Please check your email for a verification link.', { duration: 6000 });
            setIsSignUp(false); // Switch to sign in view
          } else {
            toast.success(`Welcome, ${displayName.trim()}! Let's set up your profile.`);
            onSessionConfigured(data.session);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });

        if (error) throw error;

        if (data.session) {
          if (window.location.pathname.startsWith('/coach-portal')) {
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.session.user.id)
              .maybeSingle();

            const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
            if (profileErr || (profile?.role !== 'coach' && data.session.user.id !== OWNER_ID)) {
              await supabase.auth.signOut();
              throw new Error('Access Denied. Only coaches can log in on this page.');
            }
          }
          localStorage.removeItem(lockKey);

          // Also double check if profiles or client_profiles records are missing, create them!
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .maybeSingle();

          if (!profile) {
            await supabase.from('profiles').insert({
              id: data.session.user.id,
              email: data.session.user.email,
              display_name: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0],
              role: 'client',
              coach_id: null,
              targets: { onboarding_completed: false }
            });
            await supabase.from('client_profiles').insert({
              user_id: data.session.user.id,
              coach_id: null
            });
            localStorage.setItem('is_new_signup', 'true');
          } else if (profile.role === 'client') {
            const { data: clientProf } = await supabase
              .from('client_profiles')
              .select('user_id')
              .eq('user_id', data.session.user.id)
              .maybeSingle();
            if (!clientProf) {
              await supabase.from('client_profiles').insert({
                user_id: data.session.user.id,
                coach_id: null
              });
            }
          }

          toast.success(`Welcome back, ${data.session.user.user_metadata?.display_name || data.session.user.email}!`);
          onSessionConfigured(data.session);
        }
      }
    } catch (err: any) {
      console.error(err);
      const newAttempts = attempts + 1;
      if (newAttempts >= 5) {
        const lockedUntil = Date.now() + 60000;
        localStorage.setItem(lockKey, JSON.stringify({ failedAttempts: newAttempts, lockedUntil }));
        setLockoutTimeLeft(60);
        setErrorMsg(`TOO MANY FAILED ATTEMPTS. TRY AGAIN IN 60s`);
        toast.error(`Too many failed attempts. Locked out for 60 seconds.`);
      } else {
        localStorage.setItem(lockKey, JSON.stringify({ failedAttempts: newAttempts, lockedUntil: 0 }));
        const friendlyMsg = err.message?.toLowerCase().includes('credential') || err.message?.toLowerCase().includes('invalid')
          ? 'Invalid email or password.'
          : 'Unable to connect to service. Please try again.';
        setErrorMsg(friendlyMsg);
        toast.error(`${friendlyMsg} (${5 - newAttempts} attempts left)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#090b11] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[390px] z-10 flex flex-col items-center">
        {/* Logo / Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8 w-full"
        >
          {/* Animated Dumbbell to Barbell Logo with spring shake on error */}
          <motion.div
            layout
            variants={shakeVariants}
            animate={errorMsg ? 'shake' : 'normal'}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className={`relative bg-gradient-to-tr ${
              errorMsg 
                ? 'from-red-950/65 to-purple-950/65 border-red-500/35 shadow-red-500/10' 
                : 'from-blue-600 to-purple-600 border-white/10 shadow-blue-500/20'
            } border flex items-center justify-center shadow-lg mb-4`}
            style={{
              width: errorMsg ? 350 : 64,
              height: 64,
              borderRadius: errorMsg ? '16px' : '16px',
            }}
          >
            {/* Background Breathing Glow */}
            <motion.div
              animate={{
                scale: errorMsg ? [0.95, 1.05, 0.95] : [0.9, 1.1, 0.9],
                opacity: errorMsg ? [0.3, 0.5, 0.3] : [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute inset-0 rounded-full ${
                errorMsg ? 'bg-red-500/20' : 'bg-blue-500/20'
              } blur-xl pointer-events-none`}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              shapeRendering="geometricPrecision"
              className="w-full h-full overflow-visible relative z-10 p-4"
            >
              <g transform="translate(256 256)">
                <motion.g
                  animate={{
                    rotate: errorMsg ? 0 : -45,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                >
                  {/* Metal Rod / Handle */}
                  <motion.rect
                    id="bar"
                    animate={{
                      x: errorMsg ? -220 : -120,
                      width: errorMsg ? 440 : 240,
                      height: errorMsg ? 36 : 32,
                      y: errorMsg ? -18 : -16,
                      fill: errorMsg ? '#0a0a0c' : '#ffffff',
                      stroke: errorMsg ? '#ef4444' : 'transparent',
                      strokeWidth: errorMsg ? 2 : 0,
                    }}
                    rx="8"
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                  />

                  {/* Left Weight Plates */}
                  <motion.g
                    id="left-weights"
                    animate={{
                      x: errorMsg ? -100 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                  >
                    <motion.rect x="-110" y="-60" width="30" height="120" rx="8" animate={{ fill: errorMsg ? '#3b82f6' : '#ffffff' }} transition={{ duration: 0.3 }} />
                    <motion.rect x="-150" y="-80" width="30" height="160" rx="10" animate={{ fill: errorMsg ? '#3b82f6' : '#ffffff' }} transition={{ duration: 0.3 }} />
                    <motion.rect x="-170" y="-40" width="10" height="80" rx="4" animate={{ fill: errorMsg ? '#60a5fa' : '#ffffff' }} transition={{ duration: 0.3 }} />

                    {/* Extra weight plates that slide out in error state */}
                    <motion.rect
                      x="-190"
                      y="-70"
                      width="20"
                      height="140"
                      rx="8"
                      fill="#ef4444"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{
                        opacity: errorMsg ? 1 : 0,
                        scaleX: errorMsg ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ transformOrigin: 'right' }}
                    />
                    <motion.rect
                      x="-210"
                      y="-50"
                      width="15"
                      height="100"
                      rx="6"
                      fill="#eab308"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{
                        opacity: errorMsg ? 1 : 0,
                        scaleX: errorMsg ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      style={{ transformOrigin: 'right' }}
                    />
                  </motion.g>

                  {/* Right Weight Plates */}
                  <motion.g
                    id="right-weights"
                    animate={{
                      x: errorMsg ? 100 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                  >
                    <motion.rect x="80" y="-60" width="30" height="120" rx="8" animate={{ fill: errorMsg ? '#3b82f6' : '#ffffff' }} transition={{ duration: 0.3 }} />
                    <motion.rect x="120" y="-80" width="30" height="160" rx="10" animate={{ fill: errorMsg ? '#3b82f6' : '#ffffff' }} transition={{ duration: 0.3 }} />
                    <motion.rect x="160" y="-40" width="10" height="80" rx="4" animate={{ fill: errorMsg ? '#60a5fa' : '#ffffff' }} transition={{ duration: 0.3 }} />

                    {/* Extra weight plates that slide out in error state */}
                    <motion.rect
                      x="170"
                      y="-70"
                      width="20"
                      height="140"
                      rx="8"
                      fill="#ef4444"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{
                        opacity: errorMsg ? 1 : 0,
                        scaleX: errorMsg ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ transformOrigin: 'left' }}
                    />
                    <motion.rect
                      x="195"
                      y="-50"
                      width="15"
                      height="100"
                      rx="6"
                      fill="#eab308"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{
                        opacity: errorMsg ? 1 : 0,
                        scaleX: errorMsg ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </motion.g>

                  {/* Red/White Warning Text inside the Rod */}
                  <motion.text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ef4444"
                    className="font-mono select-none font-black"
                    style={{ fontSize: '15px', letterSpacing: '2px' }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: errorMsg ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, delay: errorMsg ? 0.15 : 0 }}
                  >
                    {getShortErrorMessage(errorMsg)}
                  </motion.text>
                </motion.g>
              </g>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            LIFE GYM
          </h1>
          <p className="text-sm text-gray-550 mt-1 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-primary" /> Peak Fitness & Nutrition
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="w-full bg-[#121620] border border-gray-800 p-1 rounded-xl flex gap-1 mb-6">
          <button 
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${!isSignUp ? 'bg-[#1e2330] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${isSignUp ? 'bg-[#1e2330] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Card */}
        <motion.div 
          ref={cardRef}
          layout
          className="w-full bg-[#121620]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl relative"
        >
          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={100}
                      className={`w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border focus:outline-none text-sm transition-all ${
                        attemptedSubmit && !displayName.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                      }`}
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(null); }}
                  placeholder="name@example.com"
                  maxLength={100}
                  className={`w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border focus:outline-none text-sm transition-all ${
                    attemptedSubmit && !email.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg(null); }}
                  placeholder="••••••••"
                  maxLength={100}
                  className={`w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border focus:outline-none text-sm transition-all ${
                    attemptedSubmit && !password.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-800 focus:border-blue-500'
                  }`}
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 flex gap-2 items-start text-xs text-red-400"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legal Checkbox */}
            <div className="flex flex-col gap-1 pt-1.5 pb-1 select-none relative">
              <div className="flex items-start gap-2.5">
                <input 
                  type="checkbox" 
                  id="legal-accept-auth"
                  checked={legalAccepted} 
                  onChange={e => {
                    setLegalAccepted(e.target.checked);
                    if (e.target.checked) {
                      setLegalError(false);
                    }
                  }} 
                  className="mt-0.5 h-4 w-4 rounded border-gray-800 bg-[#181d29] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#121620] focus:ring-2 cursor-pointer transition-colors"
                />
                <label htmlFor="legal-accept-auth" className="text-[10px] text-gray-400 leading-normal text-left">
                  I agree to the{' '}
                  <button type="button" onClick={() => setModalType('terms')} className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" onClick={() => setModalType('privacy')} className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </label>
              </div>
              {legalError && (
                <div className="flex items-start gap-1.5 text-[10px] text-red-555 font-bold text-left pl-[26px] mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>You must agree to the Terms of Service and Privacy Policy to proceed.</span>
                </div>
              )}
            </div>

            <button
              ref={loginButtonRef}
              type="submit"
              disabled={loading || lockoutTimeLeft > 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer mt-1 text-sm flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : lockoutTimeLeft > 0 ? (
                `Locked Out (${lockoutTimeLeft}s)`
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
        </motion.div>

        {/* Demo Accounts Info */}
        <div className="mt-8 text-center text-xs text-gray-500 max-w-[320px]">
          <p>Want to log in to the admin/seed account? Use:</p>
          <p className="font-semibold text-gray-400 mt-1">haleem@example.com / athletepassword123</p>
        </div>
      </div>

      {/* Render Legal Documents inside Modals */}
      <AnimatePresence>
        {modalType && (
          <LegalModal
            isOpen={!!modalType}
            onClose={() => setModalType(null)}
            type={modalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
