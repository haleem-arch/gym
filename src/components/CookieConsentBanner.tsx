import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, Check } from 'lucide-react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    replays: false
  });

  useEffect(() => {
    // Check if consent has already been saved
    const savedConsent = localStorage.getItem('lifegym_cookie_consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        setPreferences(JSON.parse(savedConsent));
      } catch (e) {
        setShowBanner(true);
      }
    }

    // Listener for external trigger to reopen banner (e.g. from settings footer)
    const handleReopen = () => {
      setShowBanner(true);
      setShowPreferences(true);
    };
    window.addEventListener('reopen_cookie_consent', handleReopen);
    return () => window.removeEventListener('reopen_cookie_consent', handleReopen);
  }, []);

  const saveConsent = (updatedPrefs: typeof preferences) => {
    localStorage.setItem('lifegym_cookie_consent', JSON.stringify(updatedPrefs));
    setPreferences(updatedPrefs);
    setShowBanner(false);
    
    // Call the global helper to update PostHog and Vercel in real-time
    if (typeof (window as any).updateLifeGymConsent === 'function') {
      (window as any).updateLifeGymConsent(updatedPrefs);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, replays: true };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = { essential: true, analytics: false, replays: false };
    saveConsent(allRejected);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-[110] p-4 md:p-6 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-2xl bg-[#0a0d1e]/95 backdrop-blur-xl border border-blue-955/50 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/80 pointer-events-auto flex flex-col gap-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-blue-955/40 border border-blue-900/30 text-primary rounded-xl shrink-0">
              <Shield size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-black text-white tracking-wide">We Value Your Privacy</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                We use cookies to improve your coaching experience, analyze traffic, and capture session recordings to debug app issues. Essential session cookies are active automatically.
              </p>
            </div>
          </div>

          {/* Preferences Section (Collapsible) */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-blue-955/40 pt-4 mt-2 space-y-3"
              >
                {/* Essential */}
                <div className="flex justify-between items-start gap-4 p-3 bg-gray-955/20 border border-gray-900 rounded-2xl">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">Strictly Necessary Cookies</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5 leading-relaxed">
                      Required for basic site navigation, secure coach logins, and loading biometrics data. Cannot be disabled.
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 shrink-0 select-none">
                    <Check size={14} />
                  </div>
                </div>

                {/* Performance & Analytics */}
                <div 
                  className="flex justify-between items-start gap-4 p-3 bg-gray-955/20 border border-gray-900 rounded-2xl cursor-pointer hover:border-primary/20 transition-all"
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">Performance & Analytics</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5 leading-relaxed">
                      Helps us analyze web traffic volume, loading speeds, and serverless API execution performance via Vercel Web Analytics.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      preferences.analytics 
                        ? 'bg-primary border-primary text-black' 
                        : 'bg-gray-955 border-gray-800 text-transparent hover:border-gray-750'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                </div>

                {/* Session Replays & Recording */}
                <div 
                  className="flex justify-between items-start gap-4 p-3 bg-gray-955/20 border border-gray-900 rounded-2xl cursor-pointer hover:border-primary/20 transition-all"
                  onClick={() => setPreferences({ ...preferences, replays: !preferences.replays })}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">Bug Diagnostics & Replays</span>
                    <span className="text-[10px] text-gray-550 block mt-0.5 leading-relaxed">
                      Allows us to view anonymized video recordings of application bugs/errors in PostHog so we can fix them.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      preferences.replays 
                        ? 'bg-primary border-primary text-black' 
                        : 'bg-gray-955 border-gray-800 text-transparent hover:border-gray-750'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-blue-955/20 sm:items-center">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-3 bg-gray-955 hover:bg-gray-900 border border-gray-850 hover:border-gray-800 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer order-last sm:order-first"
            >
              <span>{showPreferences ? 'Hide Options' : 'Preferences'}</span>
              {showPreferences ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className="flex flex-1 gap-2.5 justify-end">
              {showPreferences ? (
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-white hover:bg-zinc-250 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  Save Choices
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-[#121629] hover:bg-[#181d33] border border-blue-955/40 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-primary hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Accept All
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
