import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, Dumbbell, ArrowRight, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      setErrorMsg('No token found in the reset link. Please request a new link.');
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/verify-reset-token?token=${token}`);
        const data = await res.json();
        
        if (res.ok && data.valid) {
          setIsValid(true);
          setEmail(data.email);
        } else {
          setIsValid(false);
          setErrorMsg(data.error || 'This reset link is invalid or has expired.');
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setIsValid(false);
        setErrorMsg('Failed to verify the link. Please check your connection.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch('/api/complete-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error('Connection error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#030408] text-gray-200 relative overflow-hidden">
        {/* Glow directly behind verification content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Dumbbell className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest font-black text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#030408] text-gray-200 px-6 py-10 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Brand Blue Glow positioned directly behind the card to show true glassmorphism */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-blue-600/20 rounded-full blur-[90px] pointer-events-none z-0" />
      
      <div className="w-full max-w-[390px] z-10 flex flex-col items-center">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8 w-full z-10">
          <div className="relative bg-blue-600 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 w-16 h-16 rounded-2xl">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-white uppercase font-mono">
            LIFE GYM
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-500" /> Peak Fitness & Nutrition
          </p>
        </div>

        {success ? (
          /* SUCCESS SCREEN */
          <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] relative text-center flex flex-col items-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Password Updated</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Your password has been successfully reset. You can now sign in to your portal using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-1 text-sm flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !isValid ? (
          /* EXPIRED / INVALID SCREEN */
          <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] relative text-center flex flex-col items-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Link Expired</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-sm"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          /* RESET PASSWORD INPUT FORM */
          <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] relative z-10">
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">Create New Password</h2>
            <p className="text-gray-400 text-xs font-semibold mb-6">
              Resetting for: <span className="text-blue-500 font-mono">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 text-white rounded-xl py-3 pl-11 pr-4 border border-white/10 focus:outline-none focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 text-white rounded-xl py-3 pl-11 pr-4 border border-white/10 focus:outline-none focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-6 text-sm flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Save and Update'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
