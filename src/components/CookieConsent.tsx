import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import LegalModal from './LegalModals';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem('data_consent_accepted');
    if (accepted !== 'true') {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('data_consent_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center px-6 py-12 select-none">
        {/* Dynamic brand ribbon glow background */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px] bg-[#121620]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative z-10"
        >
          {/* Icon Badge */}
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="text-blue-400 w-7 h-7" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-black text-white tracking-tight uppercase">
            Data Consent &amp; Privacy
          </h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Welcome to <strong className="text-gray-200">Life Gym</strong>. To provide a personalized performance tracking experience, we use secure storage and artificial intelligence.
          </p>

          {/* Key details list */}
          <div className="w-full space-y-3 my-5 text-left bg-[#181d29]/60 border border-gray-850 p-4 rounded-xl">
            <div className="flex gap-3 items-start">
              <Cookie size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Cookies &amp; LocalStorage</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  We cache your auth token and workout/diet targets locally so the app runs instantly and offline.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <ShieldCheck size={16} className="text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Secure Supabase Storage</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Your composition scans (weight, fat, muscle) and training logs are saved securely.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FileText size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Gemini AI Coach</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  We utilize Gemini to analyze logs and reply in the Coach chat (no credentials shared).
                </p>
              </div>
            </div>
          </div>

          {/* Footer Agreement Text */}
          <p className="text-[10px] text-gray-500 leading-normal mb-5 px-1">
            By clicking accept below, you consent to our{' '}
            <button
              onClick={() => setModalType('terms')}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            ,{' '}
            <button
              onClick={() => setModalType('privacy')}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            , and{' '}
            <button
              onClick={() => setModalType('cookies')}
              className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            .
          </p>

          {/* Action Button */}
          <button
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            Accept &amp; Continue <ArrowRight size={14} />
          </button>
        </motion.div>
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
    </>
  );
}
