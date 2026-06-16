import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, Dumbbell, ArrowRight } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#060713] text-gray-200">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest font-black text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#060713] text-gray-200 px-6 py-10 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[400px] z-10 flex flex-col items-center">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl border border-blue-500/25 mb-4">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase font-mono">Life Gym</h1>
          <p className="text-[10px] text-gray-550 font-bold uppercase tracking-widest mt-1">Peak Fitness & Nutrition</p>
        </div>

        {success ? (
          /* SUCCESS SCREEN */
          <div className="w-full bg-[#121620]/60 border border-gray-800 p-6 rounded-2xl shadow-xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Password Updated</h2>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Your password has been successfully reset. You can now sign in to your portal using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : !isValid ? (
          /* EXPIRED / INVALID SCREEN */
          <div className="w-full bg-[#121620]/60 border border-gray-800 p-6 rounded-2xl shadow-xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Link Expired</h2>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          /* RESET PASSWORD INPUT FORM */
          <div className="w-full bg-[#121620]/60 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-md font-black text-white uppercase tracking-wider mb-1">Create New Password</h2>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-6 flex items-center gap-1">
              Resetting for: <span className="text-blue-400 font-mono tracking-normal">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0d0e15] border border-gray-800 text-white pl-11 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0d0e15] border border-gray-800 text-white pl-11 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {updating ? 'Updating Password...' : 'Save and Update'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
