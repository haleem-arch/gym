import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Clock, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const subEndDateStr = profile?.targets?.subscription_end_date;
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
    </div>
  );
}
