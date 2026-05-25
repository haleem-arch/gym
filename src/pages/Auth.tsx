import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Dumbbell, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const finalEmail = email.includes('@') ? email : `${email.trim().toLowerCase()}@stride.fit`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success(`Welcome back, ${data.session.user.user_metadata?.display_name || data.session.user.email}!`);
        onSessionConfigured(data.session);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090b11] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[390px] z-10 flex flex-col items-center">
        {/* Logo / Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 border border-white/10">
            <Dumbbell className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            STRIDE RITE
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-primary" /> Peak Athletic Performance
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
          layout
          className="w-full bg-[#121620]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl"
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
                      className="w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm transition-all"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm transition-all"
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181d29] text-white rounded-xl py-3 pl-11 pr-4 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer mt-2 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
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
    </div>
  );
}
