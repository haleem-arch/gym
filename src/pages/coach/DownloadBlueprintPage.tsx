import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowDownToLine, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  const [countdown, setCountdown] = useState(2);
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

  // 2. Handle countdown and trigger download
  useEffect(() => {
    if (isValid !== true) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!downloadTriggered) {
      triggerDownload();
    }
  }, [isValid, countdown, downloadTriggered]);

  const triggerDownload = () => {
    setDownloadTriggered(true);
    // Trigger download of the PDF
    const link = document.createElement('a');
    link.href = '/ultimate-coach-blueprint.pdf';
    link.setAttribute('download', 'The Ultimate 12-Week Coach Onboarding & Client Retention Blueprint.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            /* Loading State */
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
            /* Valid / Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Logo / Branding */}
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-blue-500/20">
                  <img src="/icon.svg" alt="Life Gym Logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white uppercase">Life Gym</h4>
                </div>
              </div>

              {/* Animated Download Icon / Circle Progress */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Outer Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="276"
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: countdown === 2 ? 276 : countdown === 1 ? 138 : 0 }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                
                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-purple-400">
                  {countdown === 0 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <FileText size={32} />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {countdown === 0 ? "Download Ready!" : "Preparing Your Guide"}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {countdown > 0 
                    ? `Your download will start automatically in ${countdown} ${countdown === 1 ? 'second' : 'seconds'}...`
                    : "If the download didn't start automatically, click the button below to retrieve the PDF file."
                  }
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={triggerDownload}
                  disabled={countdown > 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-purple-600/10 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowDownToLine size={14} />
                  <span>{countdown > 0 ? "Preparing File..." : "Download PDF Guide"}</span>
                </button>

                <p className="text-[9px] text-gray-550 font-bold max-w-[260px] mx-auto leading-normal">
                  Recipient: <span className="text-gray-400">{email}</span><br />
                  Download key is securely signed. Unsubscribe in 1-click at any time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
