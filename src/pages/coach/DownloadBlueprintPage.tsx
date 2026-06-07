import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Deterministic hashing helper with salt for offline link verification
const getHash = (email: string) => {
  let hash = 0;
  const salt = "lifegym-salt-2026";
  const str = email.trim().toLowerCase() + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

export default function DownloadBlueprintPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  // 1. Verify token validity on mount
  useEffect(() => {
    if (!email || !token) {
      setIsValid(false);
      return;
    }
    const expectedToken = getHash(email);
    if (token === expectedToken) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [email, token]);

  // 2. Trigger download and redirect after a brief 1.2-second delay (gives browser time to process the window activity)
  useEffect(() => {
    if (isValid !== true || downloadTriggered) return;

    const timer = setTimeout(() => {
      triggerDownload();
    }, 1200);

    return () => clearTimeout(timer);
  }, [isValid, downloadTriggered]);

  const triggerDownload = () => {
    setDownloadTriggered(true);
    
    // Trigger download of the PDF
    const link = document.createElement('a');
    link.href = '/ultimate-coach-blueprint.pdf';
    link.setAttribute('download', 'The Ultimate 12-Week Coach Onboarding & Client Retention Blueprint.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Redirect immediately to the landing page so the user cannot copy the link
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#060713] text-gray-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-600/10 via-blue-600/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111326]/50 border border-white/[0.06] rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md text-center z-10">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {isValid === null ? (
            /* Verifying State */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-6"
            >
              <div className="w-16 h-16 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verifying Link Securely...</p>
            </motion.div>
          ) : isValid === false ? (
            /* Access Denied / Invalid Token State */
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-500/5">
                <AlertCircle size={28} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Access Denied</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                  This download link is invalid or has expired. Please subscribe to our free guide on the homepage to receive a valid secure link.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Go to Homepage</span>
              </button>
            </motion.div>
          ) : (
            /* Verified - Preparing Download State (Redirects immediately on trigger) */
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-6"
            >
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-blue-500/20">
                  <img src="/icon.svg" alt="Life Gym Logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white uppercase">Life Gym</h4>
                </div>
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Link Verified!</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                  Preparing your secure PDF download. You will be returned to the homepage in a moment...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
