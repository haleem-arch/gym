import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Clock, CheckCircle, AlertCircle, ExternalLink, Shield, MessageSquare, Lightbulb, Star, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileSkeleton } from '../components/SkeletonLoaders';

export default function ProfileView() {
  const debugLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_loading') === 'true';
  const [profile, setProfile] = useState<any>(null);
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const effectiveLoading = debugLoading || loading;
  
  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Feedback Form State
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState<'feedback' | 'bug'>('feedback');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccessShow, setFeedbackSuccessShow] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('athlete_last_feedback_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [lockMinutesLeft, setLockMinutesLeft] = useState(0);

  useEffect(() => {
    if (!lastFeedbackTime) return;
    const updateLock = () => {
      const diff = Date.now() - lastFeedbackTime;
      const ONE_HOUR = 60 * 60 * 1000;
      if (diff < ONE_HOUR) {
        setLockMinutesLeft(Math.ceil((ONE_HOUR - diff) / 60000));
      } else {
        setLockMinutesLeft(0);
      }
    };
    updateLock();
    const interval = setInterval(updateLock, 10000);
    return () => clearInterval(interval);
  }, [lastFeedbackTime]);

  useEffect(() => {
    fetchProfileAndCoach();
  }, []);

  const fetchProfileAndCoach = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch current user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userProfile) {
        setProfile(userProfile);

        // 2. Fetch owner profile as fallback
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
          .maybeSingle();

        // 3. Fetch coach profile if coach_id is assigned (from client_profiles table)
        let coachData = null;
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('coach_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (clientProfile?.coach_id) {
          const { data: cData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', clientProfile.coach_id)
            .maybeSingle();
          coachData = cData;
        }

        // Set coachProfile with phone number fallback checks
        if (coachData && coachData.targets?.phone_number) {
          setCoachProfile(coachData);
        } else if (ownerData) {
          setCoachProfile(ownerData);
        }
      }
    } catch (err) {
      console.error('Error fetching profile details:', err);
    } finally {
      if (!debugLoading) setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Your password has been updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setUpdatingPassword(false);
    }
  };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: session?.user?.id || null,
          rating: feedbackCategory === 'bug' ? null : (feedbackRating || null),
          message: feedbackMessage.trim(),
          name: profile?.display_name || null,
          email: profile?.email || null,
          phone: profile?.targets?.phone_number || null,
          category: feedbackCategory
        });

      if (error) throw error;
      
      const now = Date.now();
      localStorage.setItem('athlete_last_feedback_time', now.toString());
      setLastFeedbackTime(now);
      
      setFeedbackMessage('');
      setFeedbackRating(5);
      setFeedbackCategory('feedback');
      setFeedbackSuccessShow(true);
    } catch (err: any) {
      console.error(err);
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleContactCoach = () => {
    const rawPhone = coachProfile?.targets?.phone_number;
    if (!rawPhone) {
      alert('Your coach has not set up their contact phone number yet.');
      return;
    }
    let cleanPhone = rawPhone.replace(/\D/g, '');
    
    // Normalize Egyptian mobile number format
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    } else if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }
    
    const clientName = profile?.display_name || '';
    const clientId = profile?.targets?.client_code || '';
    const textMsg = `hey coach im ${clientName} , my id is ${clientId}`;
    const encodedText = encodeURIComponent(textMsg);
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  if (effectiveLoading) {
    return <ProfileSkeleton />;
  }

  // Calculate remaining subscription days
  const OWNER_ID = 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  const isOwner = profile?.id === OWNER_ID;
  const subEndDateStr = isOwner ? null : profile?.targets?.subscription_end_date;
  let remainingDays: number | null = null;
  let isExpired = false;

  if (subEndDateStr) {
    const end = new Date(subEndDateStr);
    const diff = end.getTime() - Date.now();
    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    isExpired = remainingDays === 0;
  }

  const isCoachUser = profile?.role === 'coach' || profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full pb-28 text-gray-200">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="text-blue-500" /> My Profile
        </h1>
        <p className="text-sm text-gray-400">
          {isCoachUser ? 'Coach account settings and platform status' : 'Account settings and coach reference'}
        </p>
      </motion.div>

      {/* Account Info Dossier Card */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.95, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-surface border border-gray-800 rounded-3xl p-5 shadow-lg flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gray-950/80 border border-gray-800 flex items-center justify-center shrink-0 p-2 shadow-inner">
          <img src="/icon.svg" className="w-full h-full object-contain" alt="Stride Rite Logo" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-0.5">
            {isCoachUser ? 'Coach Profile' : 'Athlete Profile'}
          </p>
          <h2 className="text-base font-black text-white truncate flex items-center gap-1.5">
            {profile?.display_name || 'Unnamed User'}
            {profile?.targets?.client_code && !isCoachUser && (
              <span className="text-[10px] bg-blue-950/60 border border-blue-800/40 text-blue-400 px-1.5 py-0.5 rounded font-black tracking-normal">
                #{profile.targets.client_code}
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
            <p className="font-semibold">Phone: <span className="text-white font-mono">{profile?.targets?.phone_number || 'Not added'}</span></p>
            <p className="text-[10px] text-gray-500 mt-0.5">@{profile?.username || 'no-username'}</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Countdown Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-950/60 to-[#0d1117] border border-blue-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-4">
          <Clock size={14} /> {isCoachUser ? 'Website Subscription' : 'Subscription Status'}
        </h3>

        {subEndDateStr ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter ${isExpired ? 'text-red-400' : 'text-white'}`}>
                {remainingDays}
              </span>
              <span className="text-sm font-bold text-gray-400">
                {remainingDays === 1 ? 'day remaining' : 'days remaining'}
              </span>
            </div>

            <div className="text-[11px] text-gray-500 leading-normal font-bold">
              Expires on: <span className="text-gray-300 font-mono">{new Date(subEndDateStr).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>

            {isExpired && (
              <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>
                  {isCoachUser 
                    ? 'Your platform subscription has expired. Please renew your plan from the coach portal.' 
                    : 'Your subscription has expired. Please contact your coach to renew your plan.'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-lg font-black text-white">Lifetime Access</span>
            <p className="text-xs text-gray-400">
              {isCoachUser 
                ? 'Your account has unlimited developer/owner platform access.' 
                : 'Your account is on an unlimited coach target split plan.'}
            </p>
          </div>
        )}

        {/* WhatsApp Contact Coach CTA inside Subscription Card */}
        {!isCoachUser && coachProfile && (
          <div className="mt-5 pt-4 border-t border-gray-800/60 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-center shrink-0 p-1.5 shadow-inner">
                <img src="/icon.svg" className="w-full h-full object-contain" alt="Stride Rite Logo" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Coach: {coachProfile.display_name}</p>
                {coachProfile.targets?.phone_number && (
                  <p className="text-[9px] text-gray-500">Contact: <span className="font-mono">{coachProfile.targets.phone_number}</span></p>
                )}
              </div>
            </div>
            <button
              onClick={handleContactCoach}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Contact Coach (WhatsApp)</span>
              <ExternalLink size={13} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Change Password Security Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-lg space-y-5"
      >
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 border-b border-gray-800/80 pb-2">
          <Shield size={14} /> Password Security
        </h3>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#121624] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#121624] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-400 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2 text-emerald-400 text-xs">
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={updatingPassword}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:bg-gray-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {updatingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Cookie Consent Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-lg space-y-4"
      >
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Shield size={14} className="text-[#3b82f6]" /> Cookie Preferences
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Manage your tracking consents for analytics, speed performance logs, and diagnostic recordings.
        </p>
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new Event('reopen_cookie_consent'));
          }}
          className="w-full py-3.5 bg-[#121629] hover:bg-[#181d33] border border-blue-955/40 text-gray-200 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Update Consent Preferences</span>
        </button>
      </motion.div>

            {/* Send Feedback / Report Problem Card (Glassmorphism layout) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {feedbackSuccessShow ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider">Thank You!</h3>
              <p className="text-[11px] text-gray-300 max-w-xs">Your feedback helps us make the platform better. We have received your submission.</p>
              <button
                type="button"
                onClick={() => setFeedbackSuccessShow(false)}
                className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          ) : lastFeedbackTime && (Date.now() - lastFeedbackTime < 60 * 60 * 1000) ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock size={26} />
              </div>
              <h3 className="text-sm font-black uppercase text-blue-400 tracking-wider">Form Locked</h3>
              <p className="text-[11px] text-gray-300 max-w-xs">To prevent spam, you can submit feedback once per hour.</p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 text-[10px] text-gray-400 font-mono mt-1">
                Try again in: <span className="text-blue-400 font-bold">{lockMinutesLeft} minutes</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 border-b border-white/[0.06] pb-2">
                <MessageSquare size={14} /> Send Feedback or Report Problem
              </h3>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Submission Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">Submission Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackCategory('feedback')}
                      className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        feedbackCategory === 'feedback'
                          ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                          : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                      }`}
                    >
                      <Lightbulb size={12} className="shrink-0" />
                      <span>Feedback</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackCategory('bug')}
                      className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        feedbackCategory === 'bug'
                          ? 'bg-red-600/15 border-red-500/30 text-red-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                          : 'bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
                      }`}
                    >
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>Bug Report</span>
                    </button>
                  </div>
                </div>

                {feedbackCategory !== 'bug' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">Rating (Optional)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="transition-transform hover:scale-120 duration-150 p-1 cursor-pointer focus:outline-none"
                        >
                          <Star
                            size={20}
                            className={`transition-colors duration-150 ${
                              star <= feedbackRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                                : 'text-zinc-655 hover:text-zinc-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Message */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">Your Message</label>
                  <textarea
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    placeholder="Tell us what went wrong, suggest an improvement, or share your thoughts..."
                    rows={4}
                    required
                    className="w-full bg-[#121624]/60 border border-white/[0.06] rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors resize-none placeholder-gray-655"
                  />
                </div>

                {/* Alerts */}
                {feedbackError && (
                  <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-400 text-xs animate-shake">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{feedbackError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingFeedback || !feedbackMessage.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-98 disabled:bg-gray-850 disabled:text-gray-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
